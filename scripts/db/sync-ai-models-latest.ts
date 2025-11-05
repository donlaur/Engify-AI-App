#!/usr/bin/env tsx
/**
 * Sync AI Models to Database
 * 
 * Updates the ai_models database table with the latest models from:
 * - OpenAI (via API)
 * - Anthropic (hardcoded list)
 * - Google (hardcoded list)
 * - Replicate (hardcoded list)
 * 
 * Usage:
 *   pnpm tsx scripts/db/sync-ai-models-latest.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { aiModelService } from '@/lib/services/AIModelService';
import OpenAI from 'openai';

async function syncAIModels() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Models Database Sync                                  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let totalCreated = 0;
  let totalUpdated = 0;

  // Sync OpenAI models
  if (process.env.OPENAI_API_KEY) {
    console.log('📊 Syncing OpenAI models...');
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const models = await openai.models.list();
      
      const openaiModels = models.data
        .filter((m) => m.id.includes('gpt') || m.id.includes('o1') || m.id.includes('o3'))
        .map((m) => {
          return {
            id: m.id,
            provider: 'openai' as const,
            name: m.id,
            displayName: m.id
              .replace(/^gpt-/, 'GPT-')
              .replace(/^o1-/, 'O1-')
              .replace(/^o3-/, 'O3-')
              .replace(/^o4-/, 'O4-')
              .replace(/-preview$/i, ' Preview')
              .replace(/-turbo$/i, ' Turbo')
              .replace(/-2024\d+$/, ''),
            status: 'active' as const,
            capabilities: ['text', ...(m.id.includes('vision') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4') ? ['vision'] : [])],
            contextWindow: getOpenAIContextWindow(m.id),
            maxOutputTokens: m.id.includes('gpt-4o') ? 16384 : m.id.includes('gpt-4') ? 8192 : 4096,
            costPer1kInputTokens: getOpenAICost(m.id, 'input'),
            costPer1kOutputTokens: getOpenAICost(m.id, 'output'),
            inputCostPer1M: getOpenAICost(m.id, 'input') * 1000,
            outputCostPer1M: getOpenAICost(m.id, 'output') * 1000,
            supportsStreaming: true,
            supportsJSON: m.id.includes('o') || m.id.includes('gpt-4'),
            supportsVision: m.id.includes('vision') || m.id.includes('o1') || m.id.includes('o3') || m.id.includes('o4'),
            recommended: m.id.includes('gpt-4o') && !m.id.includes('mini'),
            tier: m.id.includes('gpt-4o-mini') || m.id.includes('gpt-3.5') ? 'affordable' as const : 'premium' as const,
            isAllowed: true,
            tags: getOpenAITags(m.id),
            lastVerified: new Date(),
          };
        });

      const result = await aiModelService.bulkUpsert(openaiModels);
      totalCreated += result.created;
      totalUpdated += result.updated;
      console.log(`   ✅ OpenAI: ${result.created} created, ${result.updated} updated\n`);
    } catch (error) {
      console.error(`   ❌ OpenAI sync failed:`, error);
    }
  } else {
    console.log('   ⚠️  OPENAI_API_KEY not set, skipping OpenAI sync\n');
  }

  // Sync Anthropic models
  console.log('📊 Syncing Anthropic models...');
  const anthropicModels = [
    { name: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet', contextWindow: 200000 },
    { name: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku', contextWindow: 200000 },
    { name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', contextWindow: 200000 },
    { name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet', contextWindow: 200000 },
    { name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', contextWindow: 200000 },
  ];

  const anthropicDbModels = anthropicModels.map((m) => ({
    id: m.name,
    provider: 'anthropic' as const,
    name: m.name,
    displayName: m.displayName,
    status: 'active' as const,
    capabilities: ['text', 'vision'],
    contextWindow: m.contextWindow,
    maxOutputTokens: m.name.includes('3-5-sonnet') || m.name.includes('opus') ? 8192 : m.name.includes('sonnet') || m.name.includes('opus') ? 8192 : 4096,
    costPer1kInputTokens: getAnthropicCost(m.name, 'input'),
    costPer1kOutputTokens: getAnthropicCost(m.name, 'output'),
    inputCostPer1M: getAnthropicCost(m.name, 'input') * 1000,
    outputCostPer1M: getAnthropicCost(m.name, 'output') * 1000,
    supportsStreaming: true,
    supportsJSON: false,
    supportsVision: true,
    recommended: m.name.includes('3-5-sonnet') || m.name.includes('3-5-haiku'),
    tier: m.name.includes('haiku') ? 'affordable' as const : 'premium' as const,
    isAllowed: true,
    tags: getAnthropicTags(m.name),
    lastVerified: new Date(),
  }));

  const anthropicResult = await aiModelService.bulkUpsert(anthropicDbModels);
  totalCreated += anthropicResult.created;
  totalUpdated += anthropicResult.updated;
  console.log(`   ✅ Anthropic: ${anthropicResult.created} created, ${anthropicResult.updated} updated\n`);

  // Sync Google models
  console.log('📊 Syncing Google models...');
  const googleModels = [
    { name: 'gemini-2.0-flash-exp', displayName: 'Gemini 2.0 Flash Experimental' },
    { name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro' },
    { name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash' },
    { name: 'gemini-1.5-flash-8b', displayName: 'Gemini 1.5 Flash 8B' },
    { name: 'gemini-pro', displayName: 'Gemini Pro' },
    { name: 'gemini-pro-vision', displayName: 'Gemini Pro Vision' },
  ];

  const googleDbModels = googleModels.map((m) => ({
    id: m.name,
    provider: 'google' as const,
    name: m.name,
    displayName: m.displayName,
    status: 'active' as const,
    capabilities: ['text', 'vision'],
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    costPer1kInputTokens: getGoogleCost(m.name, 'input'),
    costPer1kOutputTokens: getGoogleCost(m.name, 'output'),
    inputCostPer1M: getGoogleCost(m.name, 'input') * 1000,
    outputCostPer1M: getGoogleCost(m.name, 'output') * 1000,
    supportsStreaming: true,
    supportsJSON: true,
    supportsVision: true,
    recommended: m.name.includes('2.0'),
    tier: getGoogleCost(m.name, 'input') === 0 ? 'free' as const : 'affordable' as const,
    isAllowed: true,
    tags: ['fast', 'multimodal'],
    lastVerified: new Date(),
  }));

  const googleResult = await aiModelService.bulkUpsert(googleDbModels);
  totalCreated += googleResult.created;
  totalUpdated += googleResult.updated;
  console.log(`   ✅ Google: ${googleResult.created} created, ${googleResult.updated} updated\n`);

  // Summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Sync Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`   Total Created: ${totalCreated}`);
  console.log(`   Total Updated: ${totalUpdated}`);
  console.log(`   Total Processed: ${totalCreated + totalUpdated}\n`);
  console.log('✅ Sync complete!\n');
}

// Helper functions (same as sync route)
function getOpenAIContextWindow(modelId: string): number {
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) return 200000;
  if (modelId.includes('gpt-4o')) return 128000;
  if (modelId.includes('gpt-4-turbo')) return 128000;
  if (modelId.includes('gpt-4')) return 8192;
  if (modelId.includes('gpt-3.5')) return 16385;
  return 128000;
}

function getOpenAICost(modelId: string, type: 'input' | 'output'): number {
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
    return type === 'input' ? 15.00 / 1000 : 60.00 / 1000;
  }
  if (modelId.includes('gpt-4o-mini')) {
    return type === 'input' ? 0.15 / 1000 : 0.60 / 1000;
  }
  if (modelId.includes('gpt-4o')) {
    return type === 'input' ? 2.50 / 1000 : 10.00 / 1000;
  }
  if (modelId.includes('gpt-4-turbo')) {
    return type === 'input' ? 10.00 / 1000 : 30.00 / 1000;
  }
  if (modelId.includes('gpt-4')) {
    return type === 'input' ? 30.00 / 1000 : 60.00 / 1000;
  }
  if (modelId.includes('gpt-3.5')) {
    return type === 'input' ? 0.50 / 1000 : 1.50 / 1000;
  }
  return 1.00 / 1000;
}

function getOpenAITags(modelId: string): string[] {
  const tags: string[] = [];
  if (modelId.includes('gpt-4o')) tags.push('smart', 'fast', 'latest', 'recommended');
  if (modelId.includes('gpt-4o-mini')) tags.push('smart', 'fast', 'affordable', 'latest');
  if (modelId.includes('gpt-4')) tags.push('smart', 'expensive');
  if (modelId.includes('vision')) tags.push('multimodal');
  if (modelId.includes('o1') || modelId.includes('o3') || modelId.includes('o4')) {
    tags.push('reasoning', 'advanced');
  }
  return tags;
}

function getAnthropicCost(modelName: string, type: 'input' | 'output'): number {
  if (modelName.includes('3-5-sonnet')) {
    return type === 'input' ? 3.00 / 1000 : 15.00 / 1000;
  }
  if (modelName.includes('3-5-haiku')) {
    return type === 'input' ? 0.25 / 1000 : 1.25 / 1000;
  }
  if (modelName.includes('opus')) {
    return type === 'input' ? 15.00 / 1000 : 75.00 / 1000;
  }
  if (modelName.includes('sonnet')) {
    return type === 'input' ? 3.00 / 1000 : 15.00 / 1000;
  }
  if (modelName.includes('haiku')) {
    return type === 'input' ? 0.25 / 1000 : 1.25 / 1000;
  }
  return 1.00 / 1000;
}

function getAnthropicTags(modelName: string): string[] {
  const tags: string[] = ['smart'];
  if (modelName.includes('3-5')) tags.push('latest');
  if (modelName.includes('sonnet')) tags.push('balanced', 'recommended');
  if (modelName.includes('haiku')) tags.push('fast', 'affordable');
  if (modelName.includes('opus')) tags.push('expensive', 'highest-quality');
  return tags;
}

function getGoogleCost(modelName: string, type: 'input' | 'output'): number {
  if (modelName.includes('2.0')) {
    return type === 'input' ? 0.075 / 1000 : 0.30 / 1000;
  }
  return type === 'input' ? 1.25 / 1000 : 5.00 / 1000;
}

syncAIModels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

