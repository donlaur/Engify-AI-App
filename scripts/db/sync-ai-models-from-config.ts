#!/usr/bin/env tsx

/**
 * Sync AI Models from Static Config to Database
 *
 * Syncs models from src/lib/config/ai-models.ts to MongoDB
 * Generates slugs for SEO-friendly URLs
 *
 * Usage:
 *   tsx scripts/db/sync-ai-models-from-config.ts
 */

// IMPORTANT: Load environment variables FIRST before any imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { AI_MODELS } from '@/lib/config/ai-models';
import { aiModelService } from '@/lib/services/AIModelService';
import { AIModel } from '@/lib/db/schemas/ai-model';
import { generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';

/**
 * Convert static config model to database model
 */
function convertToDbModel(model: (typeof AI_MODELS)[0]): AIModel {
  const slug = generateSlug(model.name);

  return {
    id: model.id,
    slug, // Add slug for SEO URLs
    provider: model.provider,
    name: model.name,
    displayName: model.name,
    status: model.deprecated ? ('deprecated' as const) : ('active' as const),
    deprecationDate: model.deprecated ? new Date() : undefined,
    replacementModel: model.replacementModel,
    capabilities: model.capabilities || [],
    contextWindow: model.contextWindow,
    maxOutputTokens: model.maxOutputTokens,
    costPer1kInputTokens: model.costPer1kInputTokens,
    costPer1kOutputTokens: model.costPer1kOutputTokens,
    inputCostPer1M: model.costPer1kInputTokens * 1000,
    outputCostPer1M: model.costPer1kOutputTokens * 1000,
    supportsStreaming: true,
    supportsJSON: model.capabilities?.includes('json') || false,
    supportsVision: model.capabilities?.includes('vision') || false,
    recommended:
      !model.deprecated &&
      (model.id.includes('gpt-4o') || model.id.includes('claude-3-5-sonnet')),
    tier: getTier(model),
    isAllowed: !model.deprecated,
    tags: getTags(model),
    notes: model.notes,
    lastVerified: model.lastVerified
      ? new Date(model.lastVerified)
      : new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function getTier(
  model: (typeof AI_MODELS)[0]
): 'free' | 'affordable' | 'premium' {
  const costPer1M = model.costPer1kInputTokens * 1000;
  if (costPer1M === 0) return 'free';
  if (costPer1M < 5) return 'affordable';
  return 'premium';
}

function getTags(model: (typeof AI_MODELS)[0]): string[] {
  const tags: string[] = [];
  if (model.capabilities?.includes('vision')) tags.push('multimodal');
  if (model.capabilities?.includes('code')) tags.push('code');
  if (model.capabilities?.includes('json')) tags.push('json-mode');
  if (model.capabilities?.includes('tools')) tags.push('function-calling');

  const costPer1M = model.costPer1kInputTokens * 1000;
  if (costPer1M < 1) tags.push('cheap');
  if (costPer1M > 10) tags.push('expensive');
  if (model.provider === 'openai' && model.id.includes('gpt-4o'))
    tags.push('recommended', 'latest');
  if (model.provider === 'anthropic' && model.id.includes('sonnet'))
    tags.push('recommended');

  return tags;
}

async function syncModelsFromConfig() {
  console.log('🚀 Syncing AI models from static config to database...\n');

  try {
    const dbModels = AI_MODELS.map(convertToDbModel);

    console.log(`📊 Found ${dbModels.length} models in config\n`);

    // Show examples
    console.log('📋 Examples to sync:');
    dbModels.slice(0, 5).forEach((model) => {
      const status = model.status === 'deprecated' ? '⚠️ ' : '✅ ';
      console.log(`   ${status}${model.displayName} (${model.provider})`);
      console.log(`      slug: ${model.slug}`);
      console.log(`      tier: ${model.tier}`);
    });
    console.log('');

    // Bulk upsert
    const result = await aiModelService.bulkUpsert(dbModels);

    console.log(`✨ Sync complete!`);
    console.log(`   - Created: ${result.created} models`);
    console.log(`   - Updated: ${result.updated} models`);
    console.log(`   - Total: ${dbModels.length} models\n`);

    // Show active vs deprecated
    const active = dbModels.filter((m) => m.status === 'active').length;
    const deprecated = dbModels.filter((m) => m.status === 'deprecated').length;

    console.log(`📊 Status breakdown:`);
    console.log(`   - Active: ${active}`);
    console.log(`   - Deprecated: ${deprecated}\n`);
  } catch (error) {
    logger.error('Failed to sync AI models from config', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

// Run sync
syncModelsFromConfig()
  .then(() => {
    console.log('✅ AI models sync completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ AI models sync failed:', error);
    process.exit(1);
  });
