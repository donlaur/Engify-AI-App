#!/usr/bin/env tsx
/**
 * Batch Prompt Improvement Script
 * Analyzes audit results to identify patterns and applies improvements across all prompts
 * 
 * Usage:
 *   pnpm tsx scripts/content/batch-improve-from-audits.ts
 *   pnpm tsx scripts/content/batch-improve-from-audits.ts --limit=20
 *   pnpm tsx scripts/content/batch-improve-from-audits.ts --dry-run
 *   pnpm tsx scripts/content/batch-improve-from-audits.ts --audit-first  # Audit prompts without audits first
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';

interface AuditPattern {
  issue: string;
  frequency: number;
  prompts: string[];
  category: string;
}

interface ImprovementStats {
  seoFixed: number;
  caseStudiesAdded: number;
  completenessImproved: number;
  keywordsAdded: number;
  metaDescriptionsFixed: number;
  slugsOptimized: number;
}

async function analyzeAuditPatterns(db: any): Promise<{
  commonIssues: AuditPattern[];
  commonRecommendations: AuditPattern[];
  commonMissingElements: AuditPattern[];
}> {
  console.log('📊 Analyzing audit patterns...\n');

  // Get all audit results
  const audits = await db.collection('prompt_audit_results')
    .find({})
    .sort({ auditVersion: -1 })
    .toArray();

  // Group by promptId to get latest audit for each prompt
  const latestAudits = new Map<string, any>();
  for (const audit of audits) {
    if (!latestAudits.has(audit.promptId)) {
      latestAudits.set(audit.promptId, audit);
    }
  }

  console.log(`   Found ${latestAudits.size} prompts with audit results\n`);

  // Analyze issues
  const issueMap = new Map<string, { frequency: number; prompts: string[]; category: string }>();
  const recommendationMap = new Map<string, { frequency: number; prompts: string[]; category: string }>();
  const missingElementMap = new Map<string, { frequency: number; prompts: string[]; category: string }>();

  for (const [promptId, audit] of latestAudits.entries()) {
    // Analyze issues
    if (audit.issues && Array.isArray(audit.issues)) {
      for (const issue of audit.issues) {
        // Handle both string and object formats
        const issueText = typeof issue === 'string' ? issue : (issue?.text || issue?.message || String(issue));
        if (!issueText || typeof issueText !== 'string') continue;
        
        const normalized = issueText.toLowerCase().trim();
        if (!issueMap.has(normalized)) {
          issueMap.set(normalized, { frequency: 0, prompts: [], category: categorizeIssue(issueText) });
        }
        const entry = issueMap.get(normalized)!;
        entry.frequency++;
        entry.prompts.push(promptId);
      }
    }

    // Analyze recommendations
    if (audit.recommendations && Array.isArray(audit.recommendations)) {
      for (const rec of audit.recommendations) {
        // Handle both string and object formats
        const recText = typeof rec === 'string' ? rec : (rec?.text || rec?.message || String(rec));
        if (!recText || typeof recText !== 'string') continue;
        
        const normalized = recText.toLowerCase().trim();
        if (!recommendationMap.has(normalized)) {
          recommendationMap.set(normalized, { frequency: 0, prompts: [], category: categorizeRecommendation(recText) });
        }
        const entry = recommendationMap.get(normalized)!;
        entry.frequency++;
        entry.prompts.push(promptId);
      }
    }

    // Analyze missing elements
    if (audit.missingElements && Array.isArray(audit.missingElements)) {
      for (const missing of audit.missingElements) {
        // Handle both string and object formats
        const missingText = typeof missing === 'string' ? missing : (missing?.text || missing?.message || String(missing));
        if (!missingText || typeof missingText !== 'string') continue;
        
        const normalized = missingText.toLowerCase().trim();
        if (!missingElementMap.has(normalized)) {
          missingElementMap.set(normalized, { frequency: 0, prompts: [], category: categorizeMissing(missingText) });
        }
        const entry = missingElementMap.get(normalized)!;
        entry.frequency++;
        entry.prompts.push(promptId);
      }
    }
  }

  // Convert to sorted arrays
  const commonIssues: AuditPattern[] = Array.from(issueMap.entries())
    .map(([issue, data]) => ({
      issue,
      frequency: data.frequency,
      prompts: data.prompts,
      category: data.category,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20); // Top 20

  const commonRecommendations: AuditPattern[] = Array.from(recommendationMap.entries())
    .map(([rec, data]) => ({
      issue: rec,
      frequency: data.frequency,
      prompts: data.prompts,
      category: data.category,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  const commonMissingElements: AuditPattern[] = Array.from(missingElementMap.entries())
    .map(([missing, data]) => ({
      issue: missing,
      frequency: data.frequency,
      prompts: data.prompts,
      category: data.category,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);

  return {
    commonIssues,
    commonRecommendations,
    commonMissingElements,
  };
}

function categorizeIssue(issue: string): string {
  const lower = issue.toLowerCase();
  if (lower.includes('seo') || lower.includes('slug') || lower.includes('meta') || lower.includes('keyword')) return 'SEO';
  if (lower.includes('case study') || lower.includes('example')) return 'Examples';
  if (lower.includes('complete') || lower.includes('missing')) return 'Completeness';
  if (lower.includes('accessibility')) return 'Accessibility';
  if (lower.includes('performance')) return 'Performance';
  if (lower.includes('security') || lower.includes('compliance')) return 'Security';
  return 'Other';
}

function categorizeRecommendation(rec: string): string {
  const lower = rec.toLowerCase();
  if (lower.includes('seo') || lower.includes('slug') || lower.includes('meta') || lower.includes('keyword')) return 'SEO';
  if (lower.includes('case study') || lower.includes('example')) return 'Examples';
  if (lower.includes('complete') || lower.includes('add')) return 'Completeness';
  return 'Other';
}

function categorizeMissing(missing: string): string {
  const lower = missing.toLowerCase();
  if (lower.includes('case study') || lower.includes('example')) return 'Examples';
  if (lower.includes('seo') || lower.includes('slug') || lower.includes('keyword')) return 'SEO';
  if (lower.includes('best practice') || lower.includes('use case')) return 'Content';
  return 'Other';
}

async function applyImprovements(
  db: any,
  patterns: {
    commonIssues: AuditPattern[];
    commonRecommendations: AuditPattern[];
    commonMissingElements: AuditPattern[];
  },
  limit?: number,
  dryRun: boolean = false,
  auditFirst: boolean = false
): Promise<ImprovementStats> {
  console.log('🔧 Applying improvements...\n');

  const stats: ImprovementStats = {
    seoFixed: 0,
    caseStudiesAdded: 0,
    completenessImproved: 0,
    keywordsAdded: 0,
    metaDescriptionsFixed: 0,
    slugsOptimized: 0,
  };

  const provider = new OpenAIAdapter('gpt-4o');

  // Get prompts that need improvement
  const prompts = await db.collection('prompts').find({}).limit(limit || 1000).toArray();
  console.log(`   Found ${prompts.length} prompts total\n`);

  // Get latest audits for each prompt
  const promptAudits = new Map<string, any>();
  const promptsToAudit: any[] = [];
  
  for (const prompt of prompts) {
    const audit = await db.collection('prompt_audit_results')
      .findOne({ promptId: prompt.id }, { sort: { auditVersion: -1 } });
    if (audit) {
      promptAudits.set(prompt.id, audit);
    } else if (auditFirst) {
      promptsToAudit.push(prompt);
    }
  }

  console.log(`   Prompts with audits: ${promptAudits.size}`);
  if (promptsToAudit.length > 0) {
    console.log(`   Prompts without audits: ${promptsToAudit.length}`);
    if (auditFirst) {
      console.log(`   ⚠️  Will audit ${promptsToAudit.length} prompts first (this will take time)\n`);
    } else {
      console.log(`   ⏭️  Skipping ${promptsToAudit.length} prompts without audits (use --audit-first to audit them)\n`);
    }
  } else {
    console.log(`   ✅ All prompts have audits\n`);
  }

  // Optionally audit prompts first
  if (auditFirst && promptsToAudit.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 AUDITING PROMPTS WITHOUT AUDITS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const { PromptPatternAuditor } = await import('./audit-prompts-patterns');
    const auditor = new PromptPatternAuditor('system', { 
      quickMode: true, // Fast audits
      skipExecutionTest: true,
      useCache: true,
    });

    for (let i = 0; i < promptsToAudit.length; i++) {
      const prompt = promptsToAudit[i];
      console.log(`[${i + 1}/${promptsToAudit.length}] ⏳ Auditing: ${prompt.title || prompt.id}`);
      
      try {
        const auditResult = await auditor.auditPrompt(prompt);
        
        // Save audit result
        const existingAudit = await db.collection('prompt_audit_results').findOne(
          { promptId: prompt.id },
          { sort: { auditVersion: -1 } }
        );
        
        const auditVersion = existingAudit ? (existingAudit.auditVersion || 0) + 1 : 1;
        const auditDate = new Date();

        // Save immediately after audit completes (don't wait for batch)
        await db.collection('prompt_audit_results').insertOne({
          promptId: prompt.id,
          promptTitle: prompt.title,
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

        promptAudits.set(prompt.id, {
          overallScore: auditResult.overallScore,
          categoryScores: auditResult.categoryScores,
          issues: auditResult.issues,
          recommendations: auditResult.recommendations,
          missingElements: auditResult.missingElements,
        });
        
        console.log(`   ✅ Audited and saved (Score: ${auditResult.overallScore}/10, Version ${auditVersion})`);
      } catch (error) {
        console.error(`   ❌ Audit failed: ${error}`);
        // Continue to next prompt even if this one fails
      }
    }
    
    console.log('\n✅ Auditing complete\n');
  }

  // Filter to only prompts with audits
  const promptsWithAudits = prompts.filter(p => promptAudits.has(p.id));
  
  if (promptsWithAudits.length === 0) {
    console.log('⚠️  No prompts with audits found. Run audits first or use --audit-first flag.');
    return stats;
  }

  console.log(`\n   Processing ${promptsWithAudits.length} prompts with audits...\n`);

  // Focus on common patterns
  const seoIssues = patterns.commonIssues.filter(p => p.category === 'SEO');
  const exampleIssues = patterns.commonIssues.filter(p => p.category === 'Examples');
  const completenessIssues = patterns.commonIssues.filter(p => p.category === 'Completeness');

  console.log(`   Top SEO issues: ${seoIssues.length}`);
  console.log(`   Top Example issues: ${exampleIssues.length}`);
  console.log(`   Top Completeness issues: ${completenessIssues.length}\n`);

  for (let i = 0; i < promptsWithAudits.length; i++) {
    const prompt = promptsWithAudits[i];
    const audit = promptAudits.get(prompt.id);

    console.log(`\n[${i + 1}/${promptsWithAudits.length}] 📝 ${prompt.title || prompt.id}`);
    console.log(`   Current Score: ${audit.overallScore}/10`);

    const improvements: string[] = [];
    const updates: any = {};

    // 1. Fix SEO issues
    if (audit.categoryScores?.seoEnrichment < 7) {
      const needsSlug = audit.issues?.some((i: any) => {
        const issueText = typeof i === 'string' ? i : (i?.text || i?.message || String(i));
        const lower = issueText?.toLowerCase() || '';
        return lower.includes('slug') || lower.includes('seo-friendly');
      }) || audit.missingElements?.some((m: any) => {
        const missingText = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
        const lower = missingText?.toLowerCase() || '';
        return lower.includes('slug') || lower.includes('seo');
      });

      const needsMeta = !prompt.metaDescription || 
        audit.issues?.some((i: any) => {
          const issueText = typeof i === 'string' ? i : (i?.text || i?.message || String(i));
          return issueText?.toLowerCase().includes('meta description');
        });

      const needsKeywords = !prompt.seoKeywords || prompt.seoKeywords.length === 0 ||
        audit.issues?.some((i: any) => {
          const issueText = typeof i === 'string' ? i : (i?.text || i?.message || String(i));
          return issueText?.toLowerCase().includes('keyword');
        });

      if (needsSlug || needsMeta || needsKeywords) {
        console.log(`   🔍 Fixing SEO issues...`);
        
        if (!dryRun) {
          try {
            const seoPrompt = `Generate SEO improvements for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description?.substring(0, 200) || 'N/A'}
CURRENT SLUG: ${prompt.slug || prompt.id}
CURRENT META: ${prompt.metaDescription?.substring(0, 100) || 'Missing'}

Requirements:
1. Generate an SEO-friendly slug (short, descriptive, keyword-rich, lowercase, hyphens)
2. Generate a meta description (150-160 chars, keyword-rich, compelling)
3. Generate 5-8 relevant SEO keywords

Format as JSON:
{
  "slug": "seo-friendly-slug",
  "metaDescription": "150-160 char description...",
  "keywords": ["keyword1", "keyword2", ...]
}`;

            const response = await provider.execute({
              prompt: seoPrompt,
              temperature: 0.3,
              maxTokens: 500,
            });

            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const seoData = JSON.parse(jsonMatch[0]);
              
              if (seoData.slug && needsSlug) {
                updates.slug = seoData.slug;
                improvements.push('Optimized slug');
                stats.slugsOptimized++;
              }
              
              if (seoData.metaDescription && needsMeta) {
                updates.metaDescription = seoData.metaDescription;
                improvements.push('Added meta description');
                stats.metaDescriptionsFixed++;
              }
              
              if (seoData.keywords && Array.isArray(seoData.keywords) && needsKeywords) {
                updates.seoKeywords = seoData.keywords;
                improvements.push(`Added ${seoData.keywords.length} keywords`);
                stats.keywordsAdded++;
              }
            }
          } catch (error) {
            console.error(`   ❌ Error generating SEO: ${error}`);
          }
        } else {
          improvements.push('Would fix SEO (slug, meta, keywords)');
        }
      }
    }

    // 2. Add case studies if missing or low quality
    if (audit.categoryScores?.caseStudyQuality < 7) {
      const needsCaseStudies = !prompt.caseStudies || prompt.caseStudies.length === 0 ||
        audit.issues?.some((i: any) => {
          const issueText = typeof i === 'string' ? i : (i?.text || i?.message || String(i));
          return issueText?.toLowerCase().includes('case study');
        }) ||
        audit.missingElements?.some((m: any) => {
          const missingText = typeof m === 'string' ? m : (m?.text || m?.message || String(m));
          return missingText?.toLowerCase().includes('case study');
        });

      if (needsCaseStudies) {
        console.log(`   📚 Adding case studies...`);
        
        if (!dryRun) {
          try {
            const caseStudyPrompt = `Generate 2-3 realistic case studies for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description?.substring(0, 300) || 'N/A'}
CONTENT: ${prompt.content?.substring(0, 500) || 'N/A'}

Requirements:
- Each case study should be realistic and demonstrate value
- Include context, challenge, solution, and outcome
- Focus on practical, real-world scenarios

Format as JSON array:
[
  {
    "title": "Case Study Title",
    "context": "...",
    "challenge": "...",
    "solution": "...",
    "outcome": "..."
  },
  ...
]`;

            const response = await provider.execute({
              prompt: caseStudyPrompt,
              temperature: 0.7,
              maxTokens: 1500,
            });

            const jsonMatch = response.content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              const caseStudies = JSON.parse(jsonMatch[0]);
              if (Array.isArray(caseStudies) && caseStudies.length > 0) {
                updates.caseStudies = caseStudies;
                improvements.push(`Added ${caseStudies.length} case studies`);
                stats.caseStudiesAdded++;
              }
            }
          } catch (error) {
            console.error(`   ❌ Error generating case studies: ${error}`);
          }
        } else {
          improvements.push('Would add case studies');
        }
      }
    }

    // 3. Improve completeness
    if (audit.categoryScores?.completeness < 7) {
      const needsCompleteness = audit.issues?.some((i: any) => {
        const issueText = typeof i === 'string' ? i : (i?.text || i?.message || String(i));
        const lower = issueText?.toLowerCase() || '';
        return lower.includes('complete') || lower.includes('missing');
      }) || audit.missingElements?.length > 0;

      if (needsCompleteness) {
        console.log(`   ✅ Improving completeness...`);
        
        // Check what's missing
        const missingExamples = !prompt.examples || prompt.examples.length === 0;
        const missingUseCases = !prompt.useCases || prompt.useCases.length === 0;
        const missingBestPractices = !prompt.bestPractices || prompt.bestPractices.length === 0;

        if (missingExamples || missingUseCases || missingBestPractices) {
          if (!dryRun) {
            try {
              const completenessPrompt = `Generate missing enrichment data for this prompt:

TITLE: ${prompt.title}
DESCRIPTION: ${prompt.description?.substring(0, 300) || 'N/A'}

Generate:
${missingExamples ? '- 3-5 practical examples\n' : ''}
${missingUseCases ? '- 5-8 use cases\n' : ''}
${missingBestPractices ? '- 5-7 best practices\n' : ''}

Format as JSON:
{
  ${missingExamples ? '"examples": ["example1", ...],' : ''}
  ${missingUseCases ? '"useCases": ["use case 1", ...],' : ''}
  ${missingBestPractices ? '"bestPractices": ["practice 1", ...]' : ''}
}`;

              const response = await provider.execute({
                prompt: completenessPrompt,
                temperature: 0.7,
                maxTokens: 1500,
              });

              const jsonMatch = response.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const completenessData = JSON.parse(jsonMatch[0]);
                
                if (completenessData.examples && missingExamples) {
                  updates.examples = completenessData.examples;
                  improvements.push(`Added ${completenessData.examples.length} examples`);
                }
                
                if (completenessData.useCases && missingUseCases) {
                  updates.useCases = completenessData.useCases;
                  improvements.push(`Added ${completenessData.useCases.length} use cases`);
                }
                
                if (completenessData.bestPractices && missingBestPractices) {
                  updates.bestPractices = completenessData.bestPractices;
                  improvements.push(`Added ${completenessData.bestPractices.length} best practices`);
                }
                
                if (Object.keys(updates).length > 0) {
                  stats.completenessImproved++;
                }
              }
            } catch (error) {
              console.error(`   ❌ Error improving completeness: ${error}`);
            }
          } else {
            improvements.push('Would improve completeness');
          }
        }
      }
    }

    // Apply updates
    if (Object.keys(updates).length > 0) {
      if (dryRun) {
        console.log(`   🔍 Would apply: ${improvements.join(', ')}`);
      } else {
        await db.collection('prompts').updateOne(
          { id: prompt.id },
          { 
            $set: {
              ...updates,
              updatedAt: new Date(),
            }
          }
        );
        console.log(`   ✅ Applied: ${improvements.join(', ')}`);
        stats.seoFixed += updates.slug || updates.metaDescription || updates.seoKeywords ? 1 : 0;
      }
    } else {
      console.log(`   ✅ No improvements needed`);
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
  console.log('║  Batch Prompt Improvement from Audit Patterns          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be saved\n');
  }

  if (auditFirst) {
    console.log('⚡ AUDIT-FIRST MODE - Will audit prompts without audits first\n');
  } else {
    console.log('ℹ️  Only processing prompts with existing audits');
    console.log('   Use --audit-first to audit prompts without audits first\n');
  }

  if (limit) {
    console.log(`📊 Processing limit: ${limit} prompts\n`);
  }

  const db = await getMongoDb();

  try {
    // Step 1: Analyze patterns
    const patterns = await analyzeAuditPatterns(db);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TOP PATTERNS IDENTIFIED');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔴 Top 10 Common Issues:');
    patterns.commonIssues.slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.category}] ${p.issue.substring(0, 60)} (${p.frequency} prompts)`);
    });

    console.log('\n💡 Top 10 Common Recommendations:');
    patterns.commonRecommendations.slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.category}] ${p.issue.substring(0, 60)} (${p.frequency} prompts)`);
    });

    console.log('\n❌ Top 10 Missing Elements:');
    patterns.commonMissingElements.slice(0, 10).forEach((p, i) => {
      console.log(`   ${i + 1}. [${p.category}] ${p.issue.substring(0, 60)} (${p.frequency} prompts)`);
    });

    // Step 2: Apply improvements
    console.log('\n═══════════════════════════════════════════════════════════');
    const stats = await applyImprovements(db, patterns, limit, dryRun, auditFirst);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 IMPROVEMENT SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`🔍 SEO Improvements:`);
    console.log(`   Slugs optimized: ${stats.slugsOptimized}`);
    console.log(`   Meta descriptions fixed: ${stats.metaDescriptionsFixed}`);
    console.log(`   Keywords added: ${stats.keywordsAdded}`);
    console.log(`   Total SEO fixes: ${stats.seoFixed}`);

    console.log(`\n📚 Content Improvements:`);
    console.log(`   Case studies added: ${stats.caseStudiesAdded}`);
    console.log(`   Completeness improved: ${stats.completenessImproved}`);

    console.log(`\n✅ Total prompts improved: ${stats.seoFixed + stats.caseStudiesAdded + stats.completenessImproved}`);

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
      console.log('\n✅ Batch improvement completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Batch improvement failed:', error);
      process.exit(1);
    });
}

