#!/usr/bin/env tsx

/**
 * Link Prompts to Patterns Script
 * 
 * Analyzes prompts and automatically links them to appropriate patterns
 * based on content analysis and keyword matching
 * 
 * Usage:
 *   tsx scripts/content/link-prompts-to-patterns.ts
 *   tsx scripts/content/link-prompts-to-patterns.ts --dry-run
 *   tsx scripts/content/link-prompts-to-patterns.ts --pattern=kernel
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { logger } from '@/lib/logging/logger';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const patternFilter = args.find((arg) => arg.startsWith('--pattern='))?.replace('--pattern=', '');

// Pattern keyword mappings
const PATTERN_KEYWORDS: Record<string, string[]> = {
  kernel: [
    'enterprise', 'systematic', 'framework', 'comprehensive', 'structured',
    'methodology', 'knowledge', 'expectations', 'rules', 'norms', 'examples', 'logic'
  ],
  'chain-of-thought': [
    'chain', 'reasoning', 'step-by-step', 'sequential', 'rationale', 'think through',
    'break down', 'logical sequence', 'step 1', 'step 2', 'multi-step'
  ],
  'few-shot': [
    'few-shot', 'few shot', 'examples', 'sample', 'demonstration', 'example-based',
    'provide examples', 'show examples', 'example prompts'
  ],
  template: [
    'template', 'format', 'structure', 'framework', 'scaffold', 'outline',
    'fill in', 'placeholder', 'structured format'
  ],
  persona: [
    'persona', 'role', 'act as', 'you are', 'character', 'perspective',
    'professional', 'expert', 'specialist'
  ],
  'cognitive-verifier': [
    'verify', 'check', 'validate', 'confirm', 'review', 'double-check',
    'self-check', 'verify reasoning', 'validate output'
  ],
  'output-formatting': [
    'format', 'structure', 'json', 'xml', 'markdown', 'output format',
    'structured output', 'format as', 'return as'
  ],
  constraint: [
    'constraint', 'limit', 'boundary', 'restriction', 'requirements',
    'must', 'cannot', 'always', 'never', 'only'
  ],
  react: [
    'react', 'reflection', 'refine', 'iterate', 'improve', 'feedback',
    'revise', 'update', 'modify based on'
  ],
  'tree-of-thoughts': [
    'tree', 'branch', 'explore', 'multiple paths', 'alternative',
    'consider options', 'different approaches'
  ],
  'question-refinement': [
    'refine', 'clarify', 'improve question', 'better question',
    'iterative questioning', 'question revision'
  ],
};

async function linkPromptsToPatterns() {
  console.log('🔗 Linking prompts to patterns...\n');

  const db = await getMongoDb();

  // Get all patterns
  const patterns = await db.collection('patterns').find({}).toArray();
  const patternsToProcess = patternFilter 
    ? patterns.filter(p => p.id === patternFilter) 
    : patterns;

  console.log(`📊 Found ${patternsToProcess.length} patterns to process\n`);

  // Get all prompts without patterns or with weak pattern assignments
  const prompts = await db.collection('prompts').find({
    active: { $ne: false },
    isPublic: true,
  }).toArray();

  console.log(`📝 Found ${prompts.length} prompts to analyze\n`);

  const provider = new OpenAIAdapter('gpt-4o-mini'); // Use cheaper model for batch analysis
  let linkedCount = 0;
  let updatedCount = 0;

  for (const pattern of patternsToProcess) {
    console.log(`\n🔷 Analyzing pattern: ${pattern.name} (${pattern.id})`);

    // Find prompts that might use this pattern
    const keywords = PATTERN_KEYWORDS[pattern.id] || [];
    const potentiallyRelatedPrompts = prompts.filter((prompt) => {
      // Skip if already has a pattern assigned (unless it's this one)
      if (prompt.pattern && prompt.pattern !== pattern.id) {
        return false;
      }

      // Check if prompt content matches pattern keywords
      const searchText = `${prompt.title} ${prompt.description} ${prompt.content} ${(prompt.tags || []).join(' ')}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });

    console.log(`   Found ${potentiallyRelatedPrompts.length} potentially related prompts`);

    if (potentiallyRelatedPrompts.length === 0) {
      continue;
    }

    // Analyze each prompt with AI to confirm pattern match
    for (const prompt of potentiallyRelatedPrompts.slice(0, 20)) { // Limit to 20 per pattern for cost
      try {
        const analysisPrompt = `Analyze if this prompt uses the "${pattern.name}" prompt engineering pattern:

PROMPT TITLE: ${prompt.title}
PROMPT DESCRIPTION: ${prompt.description}
PATTERN DESCRIPTION: ${pattern.description || pattern.shortDescription || 'N/A'}

Return JSON:
{
  "matches": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

        const response = await provider.execute({
          prompt: analysisPrompt,
          temperature: 0.2,
          maxTokens: 200,
        });

        // Parse JSON response
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          
          if (analysis.matches && analysis.confidence >= 0.7) {
            if (dryRun) {
              console.log(`   ✅ Would link: "${prompt.title}" (confidence: ${(analysis.confidence * 100).toFixed(0)}%)`);
              linkedCount++;
            } else {
              // Update prompt with pattern
              await db.collection('prompts').updateOne(
                { id: prompt.id },
                {
                  $set: {
                    pattern: pattern.id,
                    updatedAt: new Date(),
                  },
                }
              );
              console.log(`   ✅ Linked: "${prompt.title}" (confidence: ${(analysis.confidence * 100).toFixed(0)}%)`);
              updatedCount++;
            }
          }
        }
      } catch (error) {
        console.warn(`   ⚠️  Failed to analyze prompt "${prompt.title}":`, error);
      }
    }
  }

  console.log(`\n📊 Summary:`);
  if (dryRun) {
    console.log(`   🔍 Would link: ${linkedCount} prompts`);
  } else {
    console.log(`   ✅ Linked: ${updatedCount} prompts`);
  }
  console.log(`   📈 Total prompts analyzed: ${prompts.length}\n`);
}

// Run linking
linkPromptsToPatterns().catch((error) => {
  logger.error('Failed to link prompts to patterns', {
    error: error instanceof Error ? error.message : 'Unknown error',
  });
  console.error('❌ Error linking prompts to patterns:', error);
  process.exit(1);
});

