#!/usr/bin/env tsx
/**
 * Test All AI Models from Database Registry
 * 
 * Tests each model from the ai_models database to ensure they work correctly
 * Useful for verifying API keys and model availability
 * 
 * Usage:
 *   pnpm tsx scripts/content/test-all-ai-models.ts
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=openai  # Test only OpenAI models
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=anthropic  # Test only Claude models
 *   pnpm tsx scripts/content/test-all-ai-models.ts --provider=google  # Test only Gemini models
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { getMongoDb } from '@/lib/db/mongodb';
import { OpenAIAdapter } from '@/lib/ai/v2/adapters/OpenAIAdapter';
import { ClaudeAdapter } from '@/lib/ai/v2/adapters/ClaudeAdapter';
import { GeminiAdapter } from '@/lib/ai/v2/adapters/GeminiAdapter';

interface TestResult {
  provider: string;
  modelId: string;
  displayName: string;
  status: 'success' | 'error';
  response?: string;
  error?: string;
  latencyMs?: number;
  tokensUsed?: number;
}

async function testModel(model: any): Promise<TestResult> {
  const startTime = Date.now();
  const testPrompt = 'Say "Hello, I am working correctly!" and nothing else.';

  try {
    let adapter: any;
    let response: any;

    if (model.provider === 'openai') {
      adapter = new OpenAIAdapter(model.id);
      response = await adapter.execute({
        prompt: testPrompt,
        temperature: 0.3,
        maxTokens: 50,
      });
    } else if (model.provider === 'anthropic') {
      adapter = new ClaudeAdapter(model.id);
      response = await adapter.execute({
        prompt: testPrompt,
        temperature: 0.3,
        maxTokens: 50,
      });
    } else if (model.provider === 'google') {
      adapter = new GeminiAdapter(model.id);
      response = await adapter.execute({
        prompt: testPrompt,
        temperature: 0.3,
        maxTokens: 50,
      });
    } else {
      return {
        provider: model.provider,
        modelId: model.id,
        displayName: model.displayName,
        status: 'error',
        error: `Unsupported provider: ${model.provider}`,
      };
    }

    const latencyMs = Date.now() - startTime;

    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'success',
      response: response.content.substring(0, 100),
      latencyMs,
      tokensUsed: response.usage?.totalTokens || 0,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      provider: model.provider,
      modelId: model.id,
      displayName: model.displayName,
      status: 'error',
      error: errorMessage,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const providerFilter = args.find(arg => arg.startsWith('--provider='))?.split('=')[1];

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  AI Model Test Suite - Database Registry                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const db = await getMongoDb();

  // Get all active models from database
  const query: any = { status: 'active' };
  if (providerFilter) {
    query.provider = providerFilter;
    console.log(`🔍 Filtering by provider: ${providerFilter}\n`);
  }

  const models = await db.collection('ai_models')
    .find(query)
    .sort({ provider: 1, recommended: -1, tier: 1 })
    .toArray();

  if (models.length === 0) {
    console.log('❌ No active models found in database');
    console.log('   Run: pnpm tsx scripts/db/sync-ai-models-latest.ts');
    await db.client.close();
    process.exit(1);
  }

  console.log(`📊 Found ${models.length} active models to test\n`);
  console.log('🚀 Starting tests...\n');

  const results: TestResult[] = [];

  // Test each model
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[${i + 1}/${models.length}] Testing: ${model.displayName || model.id}`);
    console.log(`   Provider: ${model.provider} | ID: ${model.id}`);

    const result = await testModel(model);
    results.push(result);

    if (result.status === 'success') {
      console.log(`   ✅ Success (${result.latencyMs}ms, ${result.tokensUsed} tokens)`);
      console.log(`   Response: "${result.response}"`);
    } else {
      console.log(`   ❌ Error: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  Test Summary                                                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'error');

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);

  if (successful.length > 0) {
    console.log('✅ Working Models:');
    successful.forEach(r => {
      console.log(`   ${r.provider}: ${r.displayName || r.modelId}`);
    });
    console.log('');
  }

  if (failed.length > 0) {
    console.log('❌ Failed Models:');
    failed.forEach(r => {
      console.log(`   ${r.provider}: ${r.displayName || r.modelId}`);
      console.log(`      Error: ${r.error}`);
    });
    console.log('');
  }

  // Group by provider
  const byProvider = results.reduce((acc, r) => {
    if (!acc[r.provider]) {
      acc[r.provider] = { success: 0, failed: 0 };
    }
    if (r.status === 'success') {
      acc[r.provider].success++;
    } else {
      acc[r.provider].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number }>);

  console.log('📊 By Provider:');
  Object.entries(byProvider).forEach(([provider, stats]) => {
    const total = stats.success + stats.failed;
    const successRate = ((stats.success / total) * 100).toFixed(1);
    console.log(`   ${provider}: ${stats.success}/${total} (${successRate}%)`);
  });

  await db.client.close();

  // Exit with error code if any tests failed
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

