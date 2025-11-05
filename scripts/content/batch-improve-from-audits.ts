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
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';
import { Redis } from '@upstash/redis';
import path from 'path';

// Reload env vars to ensure we have the latest keys
// This is important if keys were updated while script is running
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`📁 Loading environment from: ${envPath}`);

const googleKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (googleKey) {
  const maskedKey = googleKey.length > 12 
    ? `${googleKey.substring(0, 8)}...${googleKey.substring(googleKey.length - 4)}`
    : '***masked***';
  console.log(`✅ Gemini API key found: ${maskedKey} (from ${process.env.GOOGLE_API_KEY ? 'GOOGLE_API_KEY' : 'GOOGLE_AI_API_KEY'})`);
  console.log(`   💡 If you're hitting quota limits, the script will auto-fallback to OpenAI\n`);
} else {
  console.warn(`⚠️  No Gemini API key found in GOOGLE_API_KEY or GOOGLE_AI_API_KEY`);
  console.warn(`   Make sure your key is in: ${envPath}`);
  console.warn(`   Script will use OpenAI fallback for all requests\n`);
}

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
  improveLock: (promptId: string) => `improve:lock:${promptId}`, // Lock for prompt modifications
};

const LOCK_TTL = {
  improveLock: 60 * 30, // 30 minutes - improvements take longer than audits
};

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

/**
 * Execute AI request with automatic fallback on quota/rate limit errors
 * Falls back to paid providers (OpenAI, Claude) if free tier (Gemini) hits quota
 */
async function executeWithFallback(
  provider: any,
  request: { prompt: string; temperature?: number; maxTokens?: number },
  taskName: string
): Promise<{ content: string }> {
  try {
    return await provider.execute(request);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check for quota/rate limit errors (429) - switch to PAID providers immediately
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('Too Many Requests')) {
      console.warn(`   ⚠️  Quota/rate limit exceeded for ${taskName}, switching to paid provider...`);
      
      // Priority: GPT-4o-mini (cheap) → Claude Haiku (fast) → GPT-4o (reliable)
      const fallbackModels = [
        { provider: 'openai', model: 'gpt-4o-mini', name: 'GPT-4o-mini (cheap)' },
        { provider: 'openai', model: 'gpt-4o', name: 'GPT-4o (reliable)' },
      ];
      
      for (const fallback of fallbackModels) {
        try {
          console.log(`   🔄 Trying ${fallback.name} (paid provider)...`);
          
          let fallbackAdapter;
          if (fallback.provider === 'openai') {
            fallbackAdapter = new OpenAIAdapter(fallback.model);
          } else {
            continue; // Skip unknown providers
          }
          
          const response = await fallbackAdapter.execute(request);
          console.log(`   ✅ Switched to ${fallback.name} successfully`);
          return response;
        } catch (fallbackError) {
          // Try next fallback
          continue;
        }
      }
      
      // All fallbacks failed
      throw new Error(`All providers exhausted for ${taskName}: ${errorMessage}`);
    }
    
    // Re-throw non-quota errors
    throw error;
  }
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

  // Use different models for different improvement tasks (optimized for cost/quality)
  // SEO improvements → Gemini Flash (fast, cheap, good for structured data) with auto-fallback to GPT-4o-mini
  // Case studies → GPT-4o (creative, detailed content)
  // Completeness → GPT-4o (balanced quality)
  // Note: If Gemini hits quota limits, will automatically switch to OpenAI (paid providers)
  const seoProvider = new GeminiAdapter('gemini-2.0-flash-exp'); // Fast & cheap for SEO (will fallback if quota exceeded)
  const contentProvider = new OpenAIAdapter('gpt-4o'); // Best quality for creative content
  const completenessProvider = new OpenAIAdapter('gpt-4o'); // Balanced for examples/use cases

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
  const promptsWithAudits = prompts.filter((p: any) => promptAudits.has(p.id));
  
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
    const promptId = prompt.id || prompt.slug || prompt._id?.toString();

    // Skip prompts that have already been improved (revision > 1)
    // Focus on prompts at revision 2 or below to upgrade them to version 3
    // Process prompts at revision 1 or 2 (allows re-improving version 2 prompts)
    const promptRevision = prompt.currentRevision || 1;
    if (promptRevision > 2) {
      console.log(`\n[${i + 1}/${promptsWithAudits.length}] ⏭️  Skipping: ${prompt.title || prompt.id} (Revision ${promptRevision} - already at version 3+)`);
      continue;
    }

    // Try to acquire lock for this prompt (prevent concurrent modifications)
    let lockAcquired = false;
    if (redisCache) {
      try {
        // Try to set lock with NX (only if not exists) and EX (expiration)
        // Returns "OK" if lock acquired, null if already locked
        const lockResult = await redisCache.set(
          LOCK_KEYS.improveLock(promptId),
          `improving-${Date.now()}`,
          { ex: LOCK_TTL.improveLock, nx: true }
        );
        lockAcquired = lockResult === 'OK';
        
        if (!lockAcquired) {
          console.log(`\n[${i + 1}/${promptsWithAudits.length}] 🔒 Skipping: ${prompt.title || prompt.id} (currently being improved by another process)`);
          continue;
        }
      } catch (lockError) {
        // If Redis fails, continue without lock (graceful degradation)
        console.log(`   ⚠️  Lock check failed, continuing without lock: ${lockError instanceof Error ? lockError.message : String(lockError)}`);
      }
    }

    console.log(`\n[${i + 1}/${promptsWithAudits.length}] 📝 ${prompt.title || prompt.id}`);
    if (lockAcquired) {
      console.log(`   🔒 Lock acquired (prevents concurrent modifications)`);
    }
    console.log(`   Current Score: ${audit.overallScore}/10`);
    console.log(`   Revision: ${promptRevision} → Will upgrade to ${promptRevision + 1}`);
    
    try {
      // Determine which model to use based on what needs improvement (from audit recommendations)
      // Check audit recommendations for model suggestions
      const needsSEO = audit.categoryScores?.seoEnrichment < 7;
      const needsCaseStudies = audit.categoryScores?.caseStudyQuality < 7;
      const needsCompleteness = audit.categoryScores?.completeness < 7;
      
      // Log which models will be used for which improvements
      if (needsSEO) console.log(`   🔍 SEO improvements → Using: Gemini Flash (auto-fallback to GPT-4o-mini if quota exceeded)`);
      if (needsCaseStudies) console.log(`   📚 Case studies → Using: GPT-4o (creative quality)`);
      if (needsCompleteness) console.log(`   ✅ Completeness → Using: GPT-4o (balanced quality)`);

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

            const response = await executeWithFallback(
              seoProvider,
              {
                prompt: seoPrompt,
                temperature: 0.3,
                maxTokens: 500,
              },
              'SEO'
            );

            // Try to extract JSON from response (handle markdown code blocks and trailing commas)
            let jsonText = response.content;
            
            // Try to extract from markdown code blocks first
            const codeBlockMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              jsonText = codeBlockMatch[1];
            } else {
              // Try to extract JSON object directly
              const jsonMatch = response.content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                jsonText = jsonMatch[0];
              }
            }
            
            // Fix common JSON issues (trailing commas)
            jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
            
            try {
              const seoData = JSON.parse(jsonText);
              
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
            } catch (error) {
              console.error(`   ❌ Error generating SEO: ${error}`);
            }
          } catch (error) {
            console.error(`   ❌ Error in SEO generation: ${error}`);
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

            const response = await executeWithFallback(
              contentProvider,
              {
                prompt: caseStudyPrompt,
                temperature: 0.7,
                maxTokens: 1500,
              },
              'Case Studies'
            );

            // Try to extract JSON from response (handle markdown code blocks and trailing commas)
            let jsonText = response.content;
            
            // Try to extract from markdown code blocks first
            const codeBlockMatch = response.content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
            if (codeBlockMatch) {
              jsonText = codeBlockMatch[1];
            } else {
              // Try to extract JSON array directly
              const jsonMatch = response.content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                jsonText = jsonMatch[0];
              }
            }
            
            // Fix common JSON issues (trailing commas)
            jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
            
            try {
              const caseStudies = JSON.parse(jsonText);
              if (Array.isArray(caseStudies) && caseStudies.length > 0) {
                updates.caseStudies = caseStudies;
                improvements.push(`Added ${caseStudies.length} case studies`);
                stats.caseStudiesAdded++;
              }
            } catch (error) {
              console.error(`   ❌ Error generating case studies: ${error}`);
            }
          } catch (error) {
            console.error(`   ❌ Error in case study generation: ${error}`);
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

IMPORTANT: Keep each item concise (1-2 sentences max). This ensures complete JSON output.

Generate:
${missingExamples ? '- 3-5 practical examples (each 1-2 sentences)\n' : ''}
${missingUseCases ? '- 5-8 use cases (each 1-2 sentences)\n' : ''}
${missingBestPractices ? '- 5-7 best practices (each 1-2 sentences)\n' : ''}

Format as JSON (keep strings short to avoid truncation):
{
  ${missingExamples ? '"examples": ["example1", "example2", ...],' : ''}
  ${missingUseCases ? '"useCases": ["use case 1", "use case 2", ...],' : ''}
  ${missingBestPractices ? '"bestPractices": ["practice 1", "practice 2", ...]' : ''}
}`;

              const response = await executeWithFallback(
                completenessProvider,
                {
                  prompt: completenessPrompt,
                  temperature: 0.7,
                  maxTokens: 2000, // Increased from 1500 to handle longer responses
                },
                'Completeness'
              );

              // Try to extract JSON from response (handle markdown code blocks)
              let jsonText = response.content;
              
              // Try to extract from markdown code blocks first (use greedy matching to get full block)
              const codeBlockMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
              if (codeBlockMatch) {
                jsonText = codeBlockMatch[1];
              } else {
                // Try to extract JSON object directly (use greedy to get full object)
                const jsonMatch = response.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  jsonText = jsonMatch[0];
                }
              }
              
              // Repair common JSON issues
              // 1. Remove trailing commas before closing brackets/braces
              jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
              jsonText = jsonText.replace(/,(\s*$)/gm, '');
              
              // 2. Fix incomplete string literals in arrays (common issue with truncated responses)
              // If we have an incomplete string like "text...", try to close it
              jsonText = jsonText.replace(/"([^"]*?)\.\.\.[^"]*$/gm, '"$1"'); // Remove trailing "..."
              // Close unclosed strings at end of line (lines ending with quote but no closing quote)
              jsonText = jsonText.replace(/"([^"]+)(?:\n|$)/gm, (match, content) => {
                // If this looks like an incomplete string (ends with line break or end of text), close it
                if (!match.endsWith('"')) {
                  return `"${content}"`;
                }
                return match;
              });
              
              // 3. Try to close incomplete arrays/objects
              // Count open vs closed brackets
              const openBraces = (jsonText.match(/\{/g) || []).length;
              const closeBraces = (jsonText.match(/\}/g) || []).length;
              const openBrackets = (jsonText.match(/\[/g) || []).length;
              const closeBrackets = (jsonText.match(/\]/g) || []).length;
              
              // Close incomplete structures
              if (openBrackets > closeBrackets) {
                jsonText += ']'.repeat(openBrackets - closeBrackets);
              }
              if (openBraces > closeBraces) {
                jsonText += '}'.repeat(openBraces - closeBraces);
              }
              
              // 4. Remove incomplete last array element if JSON is still invalid
              // This handles cases where response was cut off mid-string
              try {
                const completenessData = JSON.parse(jsonText);
                
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
              } catch (parseError) {
                // If still failing, try to extract partial data by parsing each array separately
                console.warn(`   ⚠️  JSON parsing failed, attempting partial extraction...`);
                
                try {
                  // Try to extract individual arrays from the response
                  // Use greedy matching first, then fallback to non-greedy
                  // This handles both complete and incomplete arrays
                  let examplesMatch = response.content.match(/"examples"\s*:\s*\[([\s\S]*)\]/);
                  if (!examplesMatch) {
                    // Try to find incomplete array (no closing bracket)
                    const incompleteMatch = response.content.match(/"examples"\s*:\s*\[([\s\S]*?)(?:\n|$)/);
                    if (incompleteMatch) examplesMatch = incompleteMatch;
                  }
                  
                  let useCasesMatch = response.content.match(/"useCases"\s*:\s*\[([\s\S]*)\]/);
                  if (!useCasesMatch) {
                    const incompleteMatch = response.content.match(/"useCases"\s*:\s*\[([\s\S]*?)(?:\n|$)/);
                    if (incompleteMatch) useCasesMatch = incompleteMatch;
                  }
                  
                  let bestPracticesMatch = response.content.match(/"bestPractices"\s*:\s*\[([\s\S]*)\]/);
                  if (!bestPracticesMatch) {
                    const incompleteMatch = response.content.match(/"bestPractices"\s*:\s*\[([\s\S]*?)(?:\n|$)/);
                    if (incompleteMatch) bestPracticesMatch = incompleteMatch;
                  }
                  
                  // Helper to extract array items from text (handles incomplete strings)
                  const extractArrayItems = (text: string): string[] => {
                    if (!text) return [];
                    // First, try to find complete quoted strings
                    const completeStrings: string[] = [];
                    const completeMatches = text.match(/"([^"]+)"/g);
                    if (completeMatches) {
                      completeStrings.push(...completeMatches.map(m => m.replace(/^"|"$/g, '')));
                    }
                    
                    // Then, try to find incomplete strings (lines that start with quote but don't end with quote)
                    // This handles truncated responses
                    const lines = text.split('\n');
                    for (const line of lines) {
                      const trimmed = line.trim();
                      // If line starts with quote but doesn't end with quote, it's likely incomplete
                      if (trimmed.startsWith('"') && !trimmed.endsWith('"')) {
                        const content = trimmed.replace(/^"|,$/g, '').trim();
                        if (content.length > 0 && !completeStrings.includes(content)) {
                          completeStrings.push(content);
                        }
                      }
                    }
                    
                    return completeStrings.filter(s => s.length > 0);
                  };
                  
                  if (missingExamples && examplesMatch) {
                    const examples = extractArrayItems(examplesMatch[1]);
                    if (examples.length > 0) {
                      updates.examples = examples;
                      improvements.push(`Added ${examples.length} examples (partial)`);
                    }
                  }
                  
                  if (missingUseCases && useCasesMatch) {
                    const useCases = extractArrayItems(useCasesMatch[1]);
                    if (useCases.length > 0) {
                      updates.useCases = useCases;
                      improvements.push(`Added ${useCases.length} use cases (partial)`);
                    }
                  }
                  
                  if (missingBestPractices && bestPracticesMatch) {
                    const bestPractices = extractArrayItems(bestPracticesMatch[1]);
                    if (bestPractices.length > 0) {
                      updates.bestPractices = bestPractices;
                      improvements.push(`Added ${bestPractices.length} best practices (partial)`);
                    }
                  }
                  
                  if (Object.keys(updates).length > 0) {
                    stats.completenessImproved++;
                    console.log(`   ✅ Extracted partial data from incomplete JSON`);
                  } else {
                    console.error(`   ❌ Error parsing JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
                    console.error(`   Raw response preview: ${response.content.substring(0, 500)}...`);
                  }
                } catch (fallbackError) {
                  console.error(`   ❌ Error parsing JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
                  console.error(`   Fallback extraction also failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
                  console.error(`   Raw response preview: ${response.content.substring(0, 500)}...`);
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
              currentRevision: promptRevision + 1, // Increment revision (1 → 2)
              updatedAt: new Date(),
            }
          }
        );
        console.log(`   ✅ Applied: ${improvements.join(', ')}`);
        console.log(`   📌 Revision updated: ${promptRevision} → ${promptRevision + 1}`);
        stats.seoFixed += updates.slug || updates.metaDescription || updates.seoKeywords ? 1 : 0;
        stats.caseStudiesAdded += updates.caseStudies ? 1 : 0;
        stats.completenessImproved += updates.examples || updates.useCases || updates.bestPractices ? 1 : 0;
        stats.keywordsAdded += updates.seoKeywords ? 1 : 0;
        stats.metaDescriptionsFixed += updates.metaDescription ? 1 : 0;
        stats.slugsOptimized += updates.slug ? 1 : 0;
      }
    } else {
      console.log(`   ✅ No improvements needed`);
    }
    } catch (error) {
      console.error(`   ❌ Error during improvements: ${error}`);
    } finally {
      // Always release lock after improvements complete (success or error)
      if (lockAcquired && redisCache) {
        try {
          await redisCache.del(LOCK_KEYS.improveLock(promptId));
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

