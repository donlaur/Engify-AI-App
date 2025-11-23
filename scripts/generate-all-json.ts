#!/usr/bin/env tsx
/**
 * Generate All JSON Files
 * 
 * Generates all static JSON files from MongoDB for local development
 * 
 * Usage:
 *   tsx scripts/generate-all-json.ts
 */

// Allow database operations in scripts
process.env.NODE_ENV = 'development'; // Force development mode for local JSON generation
process.env.ALLOW_DB_OPERATIONS = 'true';
// Bypass BUILD_MODE check for JSON generation scripts
process.env.NEXT_PHASE = undefined;
process.env.VERCEL_ENV = undefined; // Ensure we're not in Vercel build mode

import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import { generateLearningResourcesJson } from '@/lib/learning/generate-learning-json';
import { generateWorkflowsJson } from '@/lib/workflows/generate-workflows-json';
import { generateAIModelsJson } from '@/lib/ai-models/generate-ai-models-json';
import { generateAIToolsJson } from '@/lib/ai-tools/generate-ai-tools-json';
import { generatePainPointsJson } from '@/lib/workflows/generate-pain-points-json';
import { generateRecommendationsJson } from '@/lib/workflows/generate-recommendations-json';
import { logger } from '@/lib/logging/logger';

async function generateAllJson() {
  console.log('🚀 Generating all JSON files from MongoDB...\n');

  const generators = [
    { name: 'Prompts', fn: generatePromptsJson },
    { name: 'Patterns', fn: generatePatternsJson },
    { name: 'Learning Resources', fn: generateLearningResourcesJson },
    { name: 'Workflows', fn: generateWorkflowsJson },
    { name: 'AI Models', fn: generateAIModelsJson },
    { name: 'AI Tools', fn: generateAIToolsJson },
    { name: 'Pain Points', fn: generatePainPointsJson },
    { name: 'Recommendations', fn: generateRecommendationsJson },
  ];

  const results: Array<{ name: string; success: boolean; error?: string }> = [];

  for (const { name, fn } of generators) {
    try {
      console.log(`📝 Generating ${name} JSON...`);
      await fn();
      console.log(`✅ ${name} JSON generated successfully\n`);
      results.push({ name, success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to generate ${name} JSON:`, errorMessage, '\n');
      results.push({ name, success: false, error: errorMessage });
      logger.error(`Failed to generate ${name} JSON`, { error });
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}/${results.length}`);
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
  }

  if (failed === 0) {
    console.log('\n🎉 All JSON files generated successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some JSON files failed to generate. Check errors above.');
    process.exit(1);
  }
}

generateAllJson().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

