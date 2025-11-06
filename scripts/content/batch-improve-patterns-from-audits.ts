#!/usr/bin/env tsx
/**
 * Batch Pattern Improvement Script
 * Analyzes pattern audit results and applies improvements across all patterns
 * 
 * Usage:
 *   pnpm tsx scripts/content/batch-improve-patterns-from-audits.ts
 *   pnpm tsx scripts/content/batch-improve-patterns-from-audits.ts --limit=20
 *   pnpm tsx scripts/content/batch-improve-patterns-from-audits.ts --dry-run
 *   pnpm tsx scripts/content/batch-improve-patterns-from-audits.ts --audit-first  # Audit patterns without audits first
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { Redis } from '@upstash/redis';

// Redis for distributed locking (prevent concurrent modifications)
let redisCache: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// Lock keys and TTLs
const LOCK_KEYS = {
  improveLock: (patternId: string) => `improve-pattern:lock:${patternId}`,
};

const LOCK_TTL = {
  improveLock: 60 * 30, // 30 minutes
};

interface ImprovementStats {
  fullDescriptionsAdded: number;
  howItWorksAdded: number;
  bestPracticesAdded: number;
  commonMistakesAdded: number;
  useCasesAdded: number;
  caseStudiesAdded: number;
  examplesAdded: number;
  seoFieldsAdded: number;
}

/**
 * Extract JSON from response content (handles markdown code blocks)
 */
function extractJSONFromResponse(content: string, arrayMode: boolean = false): string {
  let jsonText = content.trim();
  
  // Extract from markdown code blocks
  const codeBlockMatches = content.matchAll(/```(?:json)?\s*([\s\S]*?)```/g);
  const allMatches = Array.from(codeBlockMatches);
  
  if (allMatches.length > 0) {
    const bestMatch = allMatches.reduce((longest, match) => 
      match[1] && match[1].length > (longest[1]?.length || 0) ? match : longest
    );
    if (bestMatch && bestMatch[1]) {
      jsonText = bestMatch[1].trim();
    }
  }
  
  // Extract array or object
  if (arrayMode) {
    const arrayMatch = jsonText.match(/\[[\s\S]*\]/);
    if (arrayMatch) jsonText = arrayMatch[0];
  } else {
    const objectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (objectMatch) jsonText = objectMatch[0];
  }
  
  // Fix trailing commas
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
  
  return jsonText.trim();
}

/**
 * Parse JSON safely with repair
 */
function parseJSONSafely(jsonText: string): any {
  if (!jsonText || jsonText.trim().length === 0) {
    return null;
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    // Try to repair common issues
    try {
      let repaired = jsonText.replace(/,(\s*[}\]])/g, '$1');
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

/**
 * Extract array items from text (fallback for incomplete JSON)
 */
function extractArrayItems(text: string): string[] {
  const items: string[] = [];
  
  // Extract quoted strings
  const quotedMatches = text.matchAll(/"([^"]{20,})"/g);
  for (const match of quotedMatches) {
    if (match[1] && match[1].trim().length > 10) {
      items.push(match[1].trim());
    }
  }
  
  // Extract numbered/bulleted items
  const listMatches = text.matchAll(/(?:^|\n)\s*(?:\d+\.|[-*•])\s+(.+?)(?=\n|$)/g);
  for (const match of listMatches) {
    if (match[1] && match[1].trim().length > 10) {
      items.push(match[1].trim());
    }
  }
  
  return [...new Set(items)]; // Remove duplicates
}

async function applyPatternImprovements(
  db: any,
  limit?: number,
  dryRun: boolean = false,
  auditFirst: boolean = false
): Promise<ImprovementStats> {
  console.log('🔧 Applying pattern improvements...\n');

  const stats: ImprovementStats = {
    fullDescriptionsAdded: 0,
    howItWorksAdded: 0,
    bestPracticesAdded: 0,
    commonMistakesAdded: 0,
    useCasesAdded: 0,
    caseStudiesAdded: 0,
    examplesAdded: 0,
    seoFieldsAdded: 0,
  };

  const provider = new OpenAIAdapter('gpt-4o');

  // Get patterns that need improvement
  const patterns = await db.collection('patterns').find({}).limit(limit || 1000).toArray();
  console.log(`   Found ${patterns.length} patterns total\n`);

  // Get latest audits for each pattern
  const patternAudits = new Map<string, any>();
  const patternsToAudit: any[] = [];
  
  for (const pattern of patterns) {
    const patternId = pattern.id || pattern.slug || pattern._id?.toString();
    const audit = await db.collection('pattern_audit_results')
      .findOne({ patternId }, { sort: { auditVersion: -1 } });
    if (audit) {
      patternAudits.set(patternId, audit);
    } else if (auditFirst) {
      patternsToAudit.push(pattern);
    }
  }

  console.log(`   Patterns with audits: ${patternAudits.size}`);
  if (patternsToAudit.length > 0) {
    console.log(`   Patterns without audits: ${patternsToAudit.length}`);
    if (auditFirst) {
      console.log(`   ⚠️  Will audit ${patternsToAudit.length} patterns first (this will take time)\n`);
    } else {
      console.log(`   ⏭️  Skipping ${patternsToAudit.length} patterns without audits (use --audit-first to audit them)\n`);
    }
  } else {
    console.log(`   ✅ All patterns have audits\n`);
  }

  // Optionally audit patterns first
  if (auditFirst && patternsToAudit.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 AUDITING PATTERNS WITHOUT AUDITS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const { PromptPatternAuditor } = await import('./audit-prompts-patterns');
    const auditor = new PromptPatternAuditor('system', { 
      quickMode: true,
      skipExecutionTest: true,
      useCache: true,
    });

    for (let i = 0; i < patternsToAudit.length; i++) {
      const pattern = patternsToAudit[i];
      const patternId = pattern.id || pattern.slug || pattern._id?.toString();
      console.log(`[${i + 1}/${patternsToAudit.length}] ⏳ Auditing: ${pattern.name || patternId}`);
      
      try {
        const auditResult = await auditor.auditPattern(pattern);
        
        // Save audit result
        const existingAudit = await db.collection('pattern_audit_results').findOne(
          { patternId },
          { sort: { auditVersion: -1 } }
        );
        
        const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
        const auditDate = new Date();

        await db.collection('pattern_audit_results').insertOne({
          patternId,
          patternName: pattern.name,
          auditVersion,
          auditDate,
          overallScore: auditResult.overallScore,
          categoryScores: auditResult.categoryScores,
          agentReviews: auditResult.agentReviews,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          missingElements: auditResult.missingElements,
          needsFix: auditResult.needsFix,
          auditedAt: auditDate,
          auditedBy: 'system',
          createdAt: auditDate,
          updatedAt: auditDate,
        });

        patternAudits.set(patternId, {
          overallScore: auditResult.overallScore,
          categoryScores: auditResult.categoryScores,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          missingElements: auditResult.missingElements,
        });
        
        console.log(`   ✅ Audited and saved (Score: ${auditResult.overallScore}/10, Version ${auditVersion})`);
      } catch (error) {
        console.error(`   ❌ Audit failed: ${error}`);
      }
    }
    
    console.log('\n✅ Auditing complete\n');
  }

  // Filter to only patterns with audits
  const patternsWithAudits = patterns.filter((p: any) => {
    const patternId = p.id || p.slug || p._id?.toString();
    return patternAudits.has(patternId);
  });
  
  if (patternsWithAudits.length === 0) {
    console.log('⚠️  No patterns with audits found. Run audits first or use --audit-first flag.');
    return stats;
  }

  console.log(`\n   Processing ${patternsWithAudits.length} patterns with audits...\n`);

  for (let i = 0; i < patternsWithAudits.length; i++) {
    const pattern = patternsWithAudits[i];
    const patternId = pattern.id || pattern.slug || pattern._id?.toString();
    const audit = patternAudits.get(patternId);

    // Try to acquire lock
    let lockAcquired = false;
    if (redisCache) {
      try {
        const lockResult = await redisCache.set(
          LOCK_KEYS.improveLock(patternId),
          `improving-${Date.now()}`,
          { ex: LOCK_TTL.improveLock, nx: true }
        );
        lockAcquired = lockResult === 'OK';
        
        if (!lockAcquired) {
          console.log(`\n[${i + 1}/${patternsWithAudits.length}] 🔒 Skipping: ${pattern.name || patternId} (currently being improved)`);
          continue;
        }
      } catch (lockError) {
        console.log(`   ⚠️  Lock check failed, continuing without lock`);
      }
    }

    console.log(`\n[${i + 1}/${patternsWithAudits.length}] 📝 ${pattern.name || patternId}`);
    if (lockAcquired) {
      console.log(`   🔒 Lock acquired`);
    }
    console.log(`   Current Score: ${audit.overallScore}/10`);

    try {
      const updates: any = {};
      const improvements: string[] = [];
      const missingElements = audit.missingElements || [];

      // 1. Generate fullDescription if missing
      if (!pattern.fullDescription && missingElements.some((m: any) => {
        const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
        const lower = text?.toLowerCase() || '';
        return lower.includes('full description') || lower.includes('fulldescription');
      })) {
        console.log(`   📖 Generating fullDescription...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate a comprehensive academic description for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}
CATEGORY: ${pattern.category}
LEVEL: ${pattern.level}

Requirements:
- Academic and research-focused tone
- Comprehensive explanation of the pattern
- Theoretical foundations and methodology
- 200-400 words

Return only the description text (no markdown, no JSON):`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 800,
            });

            updates.fullDescription = response.content.trim();
            improvements.push('Added fullDescription');
            stats.fullDescriptionsAdded++;
            console.log(`   ✅ Generated fullDescription (${updates.fullDescription.length} chars)`);
          } catch (error) {
            console.error(`   ❌ Error generating fullDescription: ${error}`);
          }
        } else {
          improvements.push('Would add fullDescription');
          stats.fullDescriptionsAdded++; // Count for dry-run
        }
      }

      // 2. Generate howItWorks if missing
      if (!pattern.howItWorks && missingElements.some((m: any) => {
        const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
        return text?.toLowerCase().includes('how it works');
      })) {
        console.log(`   ⚙️  Generating howItWorks...`);
        
        if (!dryRun) {
          try {
            const prompt = `Explain how this prompt engineering pattern works from an academic perspective:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Step-by-step methodology
- Academic rigor and clear explanation
- 150-300 words

Return only the explanation text (no markdown, no JSON):`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 600,
            });

            updates.howItWorks = response.content.trim();
            improvements.push('Added howItWorks');
            stats.howItWorksAdded++;
            console.log(`   ✅ Generated howItWorks (${updates.howItWorks.length} chars)`);
          } catch (error) {
            console.error(`   ❌ Error generating howItWorks: ${error}`);
          }
        } else {
          improvements.push('Would add howItWorks');
        }
      }

      // 3. Generate bestPractices if missing
      if ((!pattern.bestPractices || pattern.bestPractices.length === 0) && 
          missingElements.some((m: any) => {
            const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
            return text?.toLowerCase().includes('best practice');
          })) {
        console.log(`   ✨ Generating bestPractices...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate 5-7 best practices for using this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Academic and research-focused
- Actionable guidance
- Clear, concise statements

Format as JSON array:
["practice 1", "practice 2", ...]`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 800,
            });

            const jsonText = extractJSONFromResponse(response.content, true);
            let practices = parseJSONSafely(jsonText);
            if (!practices || !Array.isArray(practices)) {
              practices = extractArrayItems(response.content);
            }

            if (practices && Array.isArray(practices) && practices.length > 0) {
              updates.bestPractices = practices.slice(0, 7);
              improvements.push(`Added ${updates.bestPractices.length} best practices`);
              stats.bestPracticesAdded++;
              console.log(`   ✅ Generated ${updates.bestPractices.length} best practices`);
            }
          } catch (error) {
            console.error(`   ❌ Error generating bestPractices: ${error}`);
          }
        } else {
          improvements.push('Would add bestPractices');
          stats.bestPracticesAdded++; // Count for dry-run
        }
      }

      // 4. Generate commonMistakes if missing
      if ((!pattern.commonMistakes || pattern.commonMistakes.length === 0) && 
          missingElements.some((m: any) => {
            const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
            return text?.toLowerCase().includes('common mistake');
          })) {
        console.log(`   ⚠️  Generating commonMistakes...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate 4-6 common mistakes when using this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Common pitfalls practitioners face
- Clear, actionable warnings
- Educational value

Format as JSON array:
["mistake 1", "mistake 2", ...]`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 800,
            });

            const jsonText = extractJSONFromResponse(response.content, true);
            let mistakes = parseJSONSafely(jsonText);
            if (!mistakes || !Array.isArray(mistakes)) {
              mistakes = extractArrayItems(response.content);
            }

            if (mistakes && Array.isArray(mistakes) && mistakes.length > 0) {
              updates.commonMistakes = mistakes.slice(0, 6);
              improvements.push(`Added ${updates.commonMistakes.length} common mistakes`);
              stats.commonMistakesAdded++;
              console.log(`   ✅ Generated ${updates.commonMistakes.length} common mistakes`);
            }
          } catch (error) {
            console.error(`   ❌ Error generating commonMistakes: ${error}`);
          }
        } else {
          improvements.push('Would add commonMistakes');
          stats.commonMistakesAdded++; // Count for dry-run
        }
      }

      // 5. Generate useCases if missing
      if ((!pattern.useCases || pattern.useCases.length === 0) && 
          missingElements.some((m: any) => {
            const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
            const lower = text?.toLowerCase() || '';
            return lower.includes('use case') || lower.includes('usecase');
          })) {
        console.log(`   📝 Generating useCases...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate 5-7 use cases for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Real-world scenarios where this pattern is valuable
- Academic and research contexts
- Clear, specific use cases

Format as JSON array:
["use case 1", "use case 2", ...]`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 800,
            });

            const jsonText = extractJSONFromResponse(response.content, true);
            let useCases = parseJSONSafely(jsonText);
            if (!useCases || !Array.isArray(useCases)) {
              useCases = extractArrayItems(response.content);
            }

            if (useCases && Array.isArray(useCases) && useCases.length > 0) {
              updates.useCases = useCases.slice(0, 7);
              improvements.push(`Added ${updates.useCases.length} use cases`);
              stats.useCasesAdded++;
              console.log(`   ✅ Generated ${updates.useCases.length} use cases`);
            }
          } catch (error) {
            console.error(`   ❌ Error generating useCases: ${error}`);
          }
        } else {
          improvements.push('Would add useCases');
          stats.useCasesAdded++; // Count for dry-run
        }
      }

      // 6. Generate caseStudies if missing
      if ((!pattern.caseStudies || !Array.isArray(pattern.caseStudies) || pattern.caseStudies.length === 0) && 
          missingElements.some((m: any) => {
            const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
            const lower = text?.toLowerCase() || '';
            return lower.includes('case study') || lower.includes('case studies');
          })) {
        console.log(`   📚 Generating caseStudies...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate 2-3 detailed case studies for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Real-world research or industry applications
- Challenge, approach, and outcome
- Academic/research contexts
- Measurable results

Format as JSON array:
[
  {
    "title": "...",
    "scenario": "...",
    "challenge": "...",
    "approach": "...",
    "outcome": "...",
    "keyLearning": "..."
  }
]`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 2000,
            });

            const jsonText = extractJSONFromResponse(response.content, true);
            const caseStudies = parseJSONSafely(jsonText);

            if (caseStudies && Array.isArray(caseStudies) && caseStudies.length > 0) {
              updates.caseStudies = caseStudies.slice(0, 3);
              improvements.push(`Added ${updates.caseStudies.length} case studies`);
              stats.caseStudiesAdded++;
              console.log(`   ✅ Generated ${updates.caseStudies.length} case studies`);
            }
          } catch (error) {
            console.error(`   ❌ Error generating caseStudies: ${error}`);
          }
        } else {
          improvements.push('Would add caseStudies');
          stats.caseStudiesAdded++; // Count for dry-run
        }
      }

      // 7. Generate example if missing
      if (!pattern.example && missingElements.some((m: any) => {
        const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
        return text?.toLowerCase().includes('example');
      })) {
        console.log(`   💡 Generating example...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate a before/after example for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Show a weak prompt (before) and improved prompt using this pattern (after)
- Clear explanation of why the pattern improves the prompt
- Academic/research context appropriate

Format as JSON:
{
  "before": "weak prompt example",
  "after": "improved prompt using pattern",
  "explanation": "why this pattern improves the prompt"
}`;

            const response = await provider.execute({
              prompt,
              temperature: 0.7,
              maxTokens: 1000,
            });

            const jsonText = extractJSONFromResponse(response.content, false);
            const example = parseJSONSafely(jsonText);

            if (example && example.before && example.after) {
              updates.example = example;
              improvements.push('Added example');
              stats.examplesAdded++;
              console.log(`   ✅ Generated before/after example`);
            }
          } catch (error) {
            console.error(`   ❌ Error generating example: ${error}`);
          }
        } else {
          improvements.push('Would add example');
          stats.examplesAdded++; // Count for dry-run
        }
      }

      // 8. Generate SEO fields if missing
      const needsSEO = missingElements.some((m: any) => {
        const text = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
        return text?.toLowerCase().includes('seo') || text?.toLowerCase().includes('meta description');
      });

      if (needsSEO && (!pattern.metaDescription || !pattern.seoKeywords || pattern.seoKeywords.length === 0)) {
        console.log(`   🔍 Generating SEO fields...`);
        
        if (!dryRun) {
          try {
            const prompt = `Generate SEO metadata for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}
CATEGORY: ${pattern.category}

Generate:
1. Meta description (150-160 chars, keyword-rich)
2. SEO keywords (5-8 relevant keywords)

Format as JSON:
{
  "metaDescription": "...",
  "seoKeywords": ["keyword1", "keyword2", ...]
}`;

            const response = await provider.execute({
              prompt,
              temperature: 0.3,
              maxTokens: 300,
            });

            const jsonText = extractJSONFromResponse(response.content, false);
            const seoData = parseJSONSafely(jsonText);

            if (seoData) {
              if (seoData.metaDescription && !pattern.metaDescription) {
                updates.metaDescription = seoData.metaDescription;
                improvements.push('Added metaDescription');
              }
              if (seoData.seoKeywords && (!pattern.seoKeywords || pattern.seoKeywords.length === 0)) {
                updates.seoKeywords = seoData.seoKeywords;
                improvements.push(`Added ${seoData.seoKeywords.length} SEO keywords`);
              }
              if (updates.metaDescription || updates.seoKeywords) {
                stats.seoFieldsAdded++;
                console.log(`   ✅ Generated SEO metadata`);
              }
            }
          } catch (error) {
            console.error(`   ❌ Error generating SEO fields: ${error}`);
          }
        } else {
          improvements.push('Would add SEO fields');
          stats.seoFieldsAdded++; // Count for dry-run
        }
      }

      // Apply updates
      if (Object.keys(updates).length > 0) {
        if (dryRun) {
          console.log(`   🔍 Would apply: ${improvements.join(', ')}`);
        } else {
          await db.collection('patterns').updateOne(
            { id: pattern.id || pattern.slug },
            { 
              $set: {
                ...updates,
                updatedAt: new Date(),
              }
            }
          );
          console.log(`   ✅ Applied: ${improvements.join(', ')}`);
        }
      } else {
        console.log(`   ✅ No improvements needed`);
      }
    } catch (error) {
      console.error(`   ❌ Error during improvements: ${error}`);
    } finally {
      // Release lock
      if (lockAcquired && redisCache) {
        try {
          await redisCache.del(LOCK_KEYS.improveLock(patternId));
        } catch (e) {
          // Ignore lock release errors
        }
      }
    }
  }

  return stats;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const auditFirst = process.argv.includes('--audit-first');
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Pattern Improvement from Audit Results          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  if (auditFirst) {
    console.log('⚡ AUDIT-FIRST MODE - Will audit patterns without audits first\n');
  } else {
    console.log('ℹ️  Only processing patterns with existing audits');
    console.log('   Use --audit-first to audit patterns without audits first\n');
  }

  if (limit) {
    console.log(`📊 Processing limit: ${limit} patterns\n`);
  }

  const db = await getMongoDb();

  try {
    const stats = await applyPatternImprovements(db, limit, dryRun, auditFirst);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 IMPROVEMENT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`📖 Content Improvements:`);
    console.log(`   Full descriptions added: ${stats.fullDescriptionsAdded}`);
    console.log(`   How it works added: ${stats.howItWorksAdded}`);
    console.log(`   Best practices added: ${stats.bestPracticesAdded}`);
    console.log(`   Common mistakes added: ${stats.commonMistakesAdded}`);
    console.log(`   Use cases added: ${stats.useCasesAdded}`);
    console.log(`   Case studies added: ${stats.caseStudiesAdded}`);
    console.log(`   Examples added: ${stats.examplesAdded}`);
    console.log(`   SEO fields added: ${stats.seoFieldsAdded}`);

    const totalImproved = stats.fullDescriptionsAdded + stats.howItWorksAdded + 
      stats.bestPracticesAdded + stats.commonMistakesAdded + stats.useCasesAdded +
      stats.caseStudiesAdded + stats.examplesAdded + stats.seoFieldsAdded;
    
    console.log(`\n✅ Total patterns improved: ${totalImproved}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await db.client.close();
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Batch pattern improvement completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Batch pattern improvement failed:', error);
      process.exit(1);
    });
}

