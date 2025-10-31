/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Multi-Model Prompt Testing Script
 * Uses existing AIProvider adapters for consistent testing across providers
 * 
 * Usage:
 *   npx tsx scripts/content/test-prompts-multi-model.ts --dry-run  // Test 3 prompts
 *   npx tsx scripts/content/test-prompts-multi-model.ts --limit=10 // Test 10 prompts
 *   npx tsx scripts/content/test-prompts-multi-model.ts --all      // Test all prompts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

// Use existing provider infrastructure
import { AIProviderFactory } from '../../src/lib/ai/v2/factory/AIProviderFactory';
import { getModelById } from '../../src/lib/config/ai-models';

interface TestResult {
  promptId: string;
  promptTitle: string;
  model: string;
  provider: string;
  response: string;
  qualityScore: number; // 1-5
  tokensUsed: number;
  costUSD: number;
  latencyMs: number;
  testedAt: Date;
}

// Models to test - using VERIFIED working models from ai-models.ts
const MODELS_TO_TEST = [
  { providerKey: 'openai', modelId: 'gpt-4o-mini' },               // Cheap, fast, good quality
  { providerKey: 'gemini-exp', modelId: 'gemini-2.0-flash-exp' },  // FREE, experimental, verified working!
];

async function testPromptWithModel(
  prompt: any,
  modelConfig: typeof MODELS_TO_TEST[0]
): Promise<TestResult | null> {
  const startTime = Date.now();

  try {
    // Use existing AIProvider infrastructure (DRY!)
    const provider = AIProviderFactory.create(modelConfig.providerKey);
    const modelInfo = getModelById(modelConfig.modelId);
    
    if (!modelInfo) {
      console.log(`  ⚠️  Model ${modelConfig.modelId} not found in config`);
      return null;
    }

    // Execute using provider adapter
    const response = await provider.execute({
      prompt: prompt.content || prompt.prompt || '',
      systemPrompt: 'You are a helpful assistant. Respond concisely and professionally.',
      temperature: 0.7,
      maxTokens: 300,
    });

    // Simple quality score based on response length and structure
    const qualityScore = response.content.length > 100 && response.content.length < 1000 ? 4 : 3;

    return {
      promptId: prompt._id.toString(),
      promptTitle: prompt.title,
      model: modelConfig.modelId,
      provider: modelInfo.provider,
      response: response.content,
      qualityScore,
      tokensUsed: response.usage.totalTokens,
      costUSD: response.cost.total,
      latencyMs: response.latency,
      testedAt: new Date(),
    };
    
  } catch (error) {
    console.log(`  ❌ Error with ${modelConfig.modelId}:`, (error as Error).message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limit = args.find((a) => a.startsWith('--limit'))
    ? parseInt(args.find((a) => a.startsWith('--limit'))!.split('=')[1])
    : dryRun
      ? 3
      : 0;
  const testAll = args.includes('--all');

  console.log('\n🧪 MULTI-MODEL PROMPT TESTING\n');
  console.log('=' + '='.repeat(60));

  if (dryRun) {
    console.log('🔬 DRY RUN MODE - Testing 3 prompts only\n');
  } else if (limit) {
    console.log(`📊 Testing ${limit} prompts\n`);
  } else if (testAll) {
    console.log('🚀 Testing ALL prompts\n');
  }

  const { MongoClient } = await import('mongodb');
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');

  // Get prompts to test (using collection name directly - script context)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const promptsQuery = db.collection('prompts').find({}) as any;
  const allPrompts = await (limit || dryRun ? promptsQuery.limit(limit) : promptsQuery).toArray();

  console.log(`Testing ${allPrompts.length} prompts with ${MODELS_TO_TEST.length} models...\n`);

  let totalCost = 0;
  let totalTests = 0;
  const results: TestResult[] = [];

  for (let i = 0; i < allPrompts.length; i++) {
    const prompt = allPrompts[i];
    console.log(`\n[${i + 1}/${allPrompts.length}] ${prompt.title}`);

    for (const modelConfig of MODELS_TO_TEST) {
      console.log(`  Testing with ${modelConfig.model}...`);
      const result = await testPromptWithModel(prompt, modelConfig);

      if (result) {
        results.push(result);
        totalCost += result.costUSD;
        totalTests++;
        console.log(`  ✅ ${result.qualityScore}/5 - ${result.tokensUsed} tokens - $${result.costUSD.toFixed(4)}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`  Prompts tested: ${allPrompts.length}`);
  console.log(`  Total tests run: ${totalTests}`);
  console.log(`  Total cost: $${totalCost.toFixed(4)}`);
  console.log(`  Average cost per prompt: $${(totalCost / allPrompts.length).toFixed(4)}\n`);

  if (dryRun) {
    console.log('🔬 DRY RUN COMPLETE - Results NOT saved to database');
    console.log('   Run without --dry-run to save results\n');
  } else {
    // Save results to MongoDB (using collection name directly - script context)
    if (results.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultsCollection = db.collection('prompt_test_results') as any;
      await resultsCollection.insertMany(results);
      console.log(`✅ Saved ${results.length} test results to MongoDB\n`);
    }
  }

  await client.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

