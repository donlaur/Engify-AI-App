/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Multi-Model Prompt Testing Script
 * Tests prompts with multiple AI providers and saves results to MongoDB
 * 
 * Usage:
 *   npx tsx scripts/content/test-prompts-multi-model.ts --dry-run  // Test 3 prompts only
 *   npx tsx scripts/content/test-prompts-multi-model.ts --limit=10 // Test 10 prompts
 *   npx tsx scripts/content/test-prompts-multi-model.ts --all      // Test all prompts
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from 'dotenv';
config({ path: '.env.local' });

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

const MODELS_TO_TEST = [
  { provider: 'openai', model: 'gpt-3.5-turbo', apiKey: process.env.OPENAI_API_KEY },
  // Google API temporarily disabled - model name or API key issue
  // { provider: 'google', model: 'gemini-1.5-flash-latest', apiKey: process.env.GOOGLE_API_KEY },
];

async function testPromptWithModel(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prompt: any,
  modelConfig: typeof MODELS_TO_TEST[0]
): Promise<TestResult | null> {
  if (!modelConfig.apiKey) {
    console.log(`  ⚠️  Skipping ${modelConfig.model} - no API key`);
    return null;
  }

  const startTime = Date.now();

  try {
    if (modelConfig.provider === 'openai') {
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: modelConfig.apiKey });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Respond concisely and professionally.',
          },
          {
            role: 'user',
            content: prompt.content || prompt.prompt || '',
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const latency = Date.now() - startTime;
      const content = response.choices[0]?.message?.content ?? '';
      const tokens = response.usage?.total_tokens ?? 0;
      const cost = (tokens / 1000) * 0.002; // GPT-3.5 pricing: $0.002/1K tokens

      // Simple quality score based on response length and structure
      const qualityScore = content.length > 100 && content.length < 1000 ? 4 : 3;

      return {
        promptId: prompt._id.toString(),
        promptTitle: prompt.title,
        model: 'gpt-3.5-turbo',
        provider: 'openai',
        response: content,
        qualityScore,
        tokensUsed: tokens,
        costUSD: cost,
        latencyMs: latency,
        testedAt: new Date(),
      };
    } else if (modelConfig.provider === 'google') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(modelConfig.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

      const result = await model.generateContent(prompt.content || prompt.prompt || '');
      const latency = Date.now() - startTime;
      const content = result.response.text();

      // Gemini Flash pricing: ~$0.00015/1K tokens (estimate)
      const tokens = content.length / 4; // Rough estimate
      const cost = (tokens / 1000) * 0.00015;

      const qualityScore = content.length > 100 && content.length < 1000 ? 4 : 3;

      return {
        promptId: prompt._id.toString(),
        promptTitle: prompt.title,
        model: 'gemini-1.5-flash',
        provider: 'google',
        response: content,
        qualityScore,
        tokensUsed: Math.round(tokens),
        costUSD: cost,
        latencyMs: latency,
        testedAt: new Date(),
      };
    }

    return null;
  } catch (error) {
    console.log(`  ❌ Error with ${modelConfig.model}:`, (error as Error).message);
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

