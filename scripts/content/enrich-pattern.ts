#!/usr/bin/env tsx

/**
 * Pattern Enrichment Script
 * 
 * Enriches patterns based on audit feedback, similar to enrich-prompt.ts
 * Patterns are more academic/research-focused than prompts
 * 
 * Usage:
 *   tsx scripts/content/enrich-pattern.ts --id=kernel
 *   tsx scripts/content/enrich-pattern.ts --id=kernel --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { logger } from '@/lib/logging/logger';

// Parse command line arguments
const args = process.argv.slice(2);
const patternIdArg = args.find((arg) => arg.startsWith('--id='));
const patternId = patternIdArg ? patternIdArg.replace('--id=', '') : null;
const dryRun = args.includes('--dry-run');

if (!patternId) {
  console.error('❌ Pattern ID required');
  console.error('   Usage: tsx scripts/content/enrich-pattern.ts --id=<pattern-id>');
  process.exit(1);
}

function parseJSONWithFallback(text: string, isArray = false): any {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to parse directly
    return JSON.parse(text);
  } catch (error) {
    // Try to extract array items manually
    if (isArray) {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          return JSON.parse(arrayMatch[0]);
        } catch {
          // Fallback: extract individual items
          const items: string[] = [];
          const itemMatches = text.matchAll(/"([^"]+)"/g);
          for (const match of itemMatches) {
            if (match[1] && match[1].length > 10) {
              items.push(match[1]);
            }
          }
          return items.length > 0 ? items : null;
        }
      }
    }
    return null;
  }
}

function extractArrayItems(text: string): string[] {
  const items: string[] = [];
  
  // Try to extract from JSON array
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string' && item.length > 5);
      }
    }
  } catch {
    // Fall through to regex extraction
  }

  // Extract quoted strings (likely list items)
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

async function enrichPatternWithAI(patternIdArg: string) {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI-Powered Pattern Enrichment Based on Audit Feedback ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get the pattern
  const pattern = await db.collection('patterns').findOne({ id: patternIdArg });
  if (!pattern) {
    console.error(`❌ Pattern not found: ${patternIdArg}`);
    process.exit(1);
  }

  // Get latest audit results
  const auditResult = await db.collection('pattern_audit_results').findOne(
    { patternId: pattern.id },
    { sort: { auditVersion: -1 } }
  );

  if (!auditResult) {
    console.error(`❌ No audit results found for pattern: ${patternIdArg}`);
    console.error('   Please run audit first: tsx scripts/content/audit-prompts-patterns.ts --type=patterns');
    process.exit(1);
  }

  console.log(`📝 Enriching: "${pattern.name}"`);
  console.log(`   Latest Audit Score: ${auditResult.overallScore}/10`);
  console.log(`   Missing Elements: ${auditResult.missingElements?.length || 0}`);
  console.log(`   Recommendations: ${auditResult.recommendations?.length || 0}\n`);

  const provider = new OpenAIAdapter('gpt-4o');

  const enrichedPattern: Record<string, any> = {};

  // Generate fullDescription if missing
  if (!pattern.fullDescription && auditResult.missingElements?.includes('fullDescription')) {
    console.log('📖 Generating fullDescription...');
    const prompt = `Generate a comprehensive academic description for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}
CATEGORY: ${pattern.category}
LEVEL: ${pattern.level}

Requirements:
- Academic and research-focused tone
- Comprehensive explanation of the pattern
- Theoretical foundations and methodology
- Clear explanation suitable for researchers and practitioners
- 200-400 words

Return only the description text (no markdown, no JSON):`;

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      enrichedPattern.fullDescription = response.content.trim();
      console.log(`   ✅ Generated fullDescription (${enrichedPattern.fullDescription.length} chars)`);
    } catch (error) {
      console.warn('   ⚠️  Failed to generate fullDescription:', error);
    }
  }

  // Generate howItWorks if missing
  if (!pattern.howItWorks && auditResult.missingElements?.includes('howItWorks')) {
    console.log('⚙️  Generating howItWorks...');
    const prompt = `Explain how this prompt engineering pattern works from an academic perspective:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Step-by-step methodology
- Academic rigor and clear explanation
- Suitable for researchers and practitioners
- 150-300 words

Return only the explanation text (no markdown, no JSON):`;

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 600,
      });
      enrichedPattern.howItWorks = response.content.trim();
      console.log(`   ✅ Generated howItWorks (${enrichedPattern.howItWorks.length} chars)`);
    } catch (error) {
      console.warn('   ⚠️  Failed to generate howItWorks:', error);
    }
  }

  // Generate bestPractices if missing
  if ((!pattern.bestPractices || pattern.bestPractices.length === 0) && 
      auditResult.missingElements?.includes('bestPractices')) {
    console.log('✨ Generating bestPractices...');
    const prompt = `Generate 5-7 best practices for using this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Academic and research-focused
- Actionable guidance
- Clear, concise statements

Format as JSON array:
["practice 1", "practice 2", ...]`;

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      const practices = parseJSONWithFallback(response.content, true) || extractArrayItems(response.content);
      if (practices && Array.isArray(practices) && practices.length > 0) {
        enrichedPattern.bestPractices = practices.slice(0, 7);
        console.log(`   ✅ Generated ${enrichedPattern.bestPractices.length} best practices`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate bestPractices:', error);
    }
  }

  // Generate commonMistakes if missing
  if ((!pattern.commonMistakes || pattern.commonMistakes.length === 0) && 
      auditResult.missingElements?.includes('commonMistakes')) {
    console.log('⚠️  Generating commonMistakes...');
    const prompt = `Generate 4-6 common mistakes when using this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Common pitfalls practitioners face
- Clear, actionable warnings
- Educational value

Format as JSON array:
["mistake 1", "mistake 2", ...]`;

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      const mistakes = parseJSONWithFallback(response.content, true) || extractArrayItems(response.content);
      if (mistakes && Array.isArray(mistakes) && mistakes.length > 0) {
        enrichedPattern.commonMistakes = mistakes.slice(0, 6);
        console.log(`   ✅ Generated ${enrichedPattern.commonMistakes.length} common mistakes`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate commonMistakes:', error);
    }
  }

  // Generate useCases if missing
  if ((!pattern.useCases || pattern.useCases.length === 0) && 
      auditResult.missingElements?.includes('useCases')) {
    console.log('📝 Generating useCases...');
    const prompt = `Generate 5-7 use cases for this prompt engineering pattern:

NAME: ${pattern.name}
DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Requirements:
- Real-world scenarios where this pattern is valuable
- Academic and research contexts
- Clear, specific use cases

Format as JSON array:
["use case 1", "use case 2", ...]`;

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 800,
      });
      const useCases = parseJSONWithFallback(response.content, true) || extractArrayItems(response.content);
      if (useCases && Array.isArray(useCases) && useCases.length > 0) {
        enrichedPattern.useCases = useCases.slice(0, 7);
        console.log(`   ✅ Generated ${enrichedPattern.useCases.length} use cases`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate useCases:', error);
    }
  }

  // Generate caseStudies if missing
  if ((!pattern.caseStudies || !Array.isArray(pattern.caseStudies) || pattern.caseStudies.length === 0) && 
      auditResult.missingElements?.includes('caseStudies')) {
    console.log('📚 Generating caseStudies...');
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

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 2000,
      });
      const caseStudies = parseJSONWithFallback(response.content, true);
      if (caseStudies && Array.isArray(caseStudies) && caseStudies.length > 0) {
        enrichedPattern.caseStudies = caseStudies.slice(0, 3);
        console.log(`   ✅ Generated ${enrichedPattern.caseStudies.length} case studies`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate caseStudies:', error);
    }
  }

  // Generate example if missing
  if (!pattern.example && auditResult.missingElements?.includes('example')) {
    console.log('💡 Generating example...');
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

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
      });
      const example = parseJSONWithFallback(response.content, false);
      if (example && example.before && example.after) {
        enrichedPattern.example = example;
        console.log(`   ✅ Generated before/after example`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate example:', error);
    }
  }

  // Generate SEO fields if missing
  if (auditResult.missingElements?.includes('seoKeywords') || auditResult.missingElements?.includes('metaDescription')) {
    console.log('🔍 Generating SEO fields...');
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

    try {
      const response = await provider.execute({
        prompt,
        temperature: 0.3,
        maxTokens: 300,
      });
      const seoData = parseJSONWithFallback(response.content, false);
      if (seoData) {
        if (seoData.metaDescription) enrichedPattern.metaDescription = seoData.metaDescription;
        if (seoData.seoKeywords) enrichedPattern.seoKeywords = seoData.seoKeywords;
        console.log(`   ✅ Generated SEO metadata`);
      }
    } catch (error) {
      console.warn('   ⚠️  Failed to generate SEO fields:', error);
    }
  }

  // Summary
  console.log('\n✅ Pattern enrichment summary:');
  if (enrichedPattern.fullDescription) console.log(`   📖 fullDescription`);
  if (enrichedPattern.howItWorks) console.log(`   ⚙️  howItWorks`);
  if (enrichedPattern.bestPractices) console.log(`   ✨ ${enrichedPattern.bestPractices.length} bestPractices`);
  if (enrichedPattern.commonMistakes) console.log(`   ⚠️  ${enrichedPattern.commonMistakes.length} commonMistakes`);
  if (enrichedPattern.useCases) console.log(`   📝 ${enrichedPattern.useCases.length} useCases`);
  if (enrichedPattern.caseStudies) console.log(`   📚 ${enrichedPattern.caseStudies.length} caseStudies`);
  if (enrichedPattern.example) console.log(`   💡 example`);
  if (enrichedPattern.metaDescription) console.log(`   🔍 metaDescription`);
  if (enrichedPattern.seoKeywords) console.log(`   🔍 ${enrichedPattern.seoKeywords.length} SEO keywords`);

  if (Object.keys(enrichedPattern).length === 0) {
    console.log('   ℹ️  No enrichments generated (pattern may already have all fields)');
    return;
  }

  if (dryRun) {
    console.log('\n🔍 DRY RUN - Would update pattern with:');
    console.log(JSON.stringify(enrichedPattern, null, 2));
    return;
  }

  // Update pattern in database
  console.log('\n💾 Updating pattern in database...');
  await db.collection('patterns').updateOne(
    { id: patternIdArg },
    {
      $set: {
        ...enrichedPattern,
        updatedAt: new Date(),
      },
    }
  );

  console.log('\n✨ Pattern enriched successfully!');
  console.log(`   📌 Pattern: ${pattern.name}`);
  console.log(`   📊 Fields updated: ${Object.keys(enrichedPattern).length}`);
}

// Run enrichment
enrichPatternWithAI(patternId).catch((error) => {
  logger.error('Failed to enrich pattern', {
    error: error instanceof Error ? error.message : 'Unknown error',
    patternId,
  });
  console.error('❌ Error enriching pattern:', error);
  process.exit(1);
});

