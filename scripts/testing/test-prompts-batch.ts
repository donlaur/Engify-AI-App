/**
 * Prompt Testing Framework
 * Tests prompts against ChatGPT and Gemini in batches
 *
 * Usage: pnpm test:prompts [--batch=1] [--provider=openai|gemini|all]
 *
 * IMPORTANT: This script uses API credits. Run manually only!
 */

import { playbookCategories } from '../src/data/playbooks';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const BATCH_SIZE = 10; // Test 10 prompts at a time
const DELAY_BETWEEN_REQUESTS = 2000; // 2 seconds between API calls

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface TestResult {
  promptId: string;
  promptTitle: string;
  category: string;
  patterns?: string[];
  provider: 'openai' | 'gemini';
  success: boolean;
  responseTime: number;
  responseLength: number;
  error?: string;
  quality: {
    hasStructure: boolean;
    hasExamples: boolean;
    isCoherent: boolean;
    followsPattern: boolean;
  };
  timestamp: string;
}

interface BatchReport {
  batchNumber: number;
  totalTested: number;
  successRate: number;
  averageResponseTime: number;
  results: TestResult[];
  summary: {
    openai: { success: number; failed: number };
    gemini: { success: number; failed: number };
  };
  timestamp: string;
}

/**
 * Sleep utility
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Test prompt with OpenAI
 */
async function testWithOpenAI(
  prompt: string,
  promptId: string,
  promptTitle: string,
  category: string,
  patterns?: string[]
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant testing prompt quality.',
        },
        {
          role: 'user',
          content: prompt.replace(/\[.*?\]/g, 'example input'),
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseTime = Date.now() - startTime;
    const response = completion.choices[0]?.message?.content || '';

    return {
      promptId,
      promptTitle,
      category,
      patterns,
      provider: 'openai',
      success: true,
      responseTime,
      responseLength: response.length,
      quality: analyzeQuality(response, patterns),
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      promptId,
      promptTitle,
      category,
      patterns,
      provider: 'openai',
      success: false,
      responseTime: Date.now() - startTime,
      responseLength: 0,
      error: err.message,
      quality: {
        hasStructure: false,
        hasExamples: false,
        isCoherent: false,
        followsPattern: false,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Test prompt with Gemini
 */
async function testWithGemini(
  prompt: string,
  promptId: string,
  promptTitle: string,
  category: string,
  patterns?: string[]
): Promise<TestResult> {
  const startTime = Date.now();

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(
      prompt.replace(/\[.*?\]/g, 'example input')
    );
    const response = await result.response;
    const text = response.text();

    const responseTime = Date.now() - startTime;

    return {
      promptId,
      promptTitle,
      category,
      patterns,
      provider: 'gemini',
      success: true,
      responseTime,
      responseLength: text.length,
      quality: analyzeQuality(text, patterns),
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const err = error as Error;
    return {
      promptId,
      promptTitle,
      category,
      patterns,
      provider: 'gemini',
      success: false,
      responseTime: Date.now() - startTime,
      responseLength: 0,
      error: err.message,
      quality: {
        hasStructure: false,
        hasExamples: false,
        isCoherent: false,
        followsPattern: false,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Analyze response quality
 */
function analyzeQuality(
  response: string,
  patterns?: string[]
): TestResult['quality'] {
  return {
    hasStructure: /###|##|\d\.|•|-/.test(response), // Has headings or lists
    hasExamples: /example|for instance|such as/i.test(response),
    isCoherent: response.length > 50 && response.split(' ').length > 10,
    followsPattern: checkPatternCompliance(response, patterns),
  };
}

/**
 * Check if response follows expected patterns
 */
function checkPatternCompliance(
  response: string,
  patterns?: string[]
): boolean {
  if (!patterns || patterns.length === 0) return true;

  const checks = {
    Persona: /as (a|an) /i.test(response),
    'Chain-of-Thought': /step|first|then|finally/i.test(response),
    Template: /###|##/.test(response),
    'Few-Shot': /example/i.test(response),
  };

  return patterns.some((pattern) => {
    const check = checks[pattern as keyof typeof checks];
    return check !== undefined ? check : true;
  });
}

/**
 * Run batch test
 */
async function runBatchTest(
  batchNumber: number,
  provider: 'openai' | 'gemini' | 'all'
): Promise<BatchReport> {
  console.log(`\n🧪 Starting Batch ${batchNumber} Test...`);
  console.log(`Provider: ${provider}`);

  // Get all prompts
  const allPrompts = playbookCategories.flatMap((category) =>
    category.recipes.map((recipe) => ({
      ...recipe,
      category: category.title,
    }))
  );

  // Calculate batch range
  const startIndex = (batchNumber - 1) * BATCH_SIZE;
  const endIndex = Math.min(startIndex + BATCH_SIZE, allPrompts.length);
  const batchPrompts = allPrompts.slice(startIndex, endIndex);

  console.log(
    `Testing prompts ${startIndex + 1} to ${endIndex} of ${allPrompts.length}`
  );

  const results: TestResult[] = [];

  // Test each prompt
  for (let i = 0; i < batchPrompts.length; i++) {
    const prompt = batchPrompts[i];
    console.log(`\n[${i + 1}/${batchPrompts.length}] Testing: ${prompt.title}`);

    // Test with OpenAI
    if (provider === 'openai' || provider === 'all') {
      console.log('  → Testing with OpenAI...');
      const openaiResult = await testWithOpenAI(
        prompt.prompt,
        prompt.id,
        prompt.title,
        prompt.category,
        prompt.patterns
      );
      results.push(openaiResult);
      console.log(
        `    ${openaiResult.success ? '✅' : '❌'} ${openaiResult.responseTime}ms`
      );
      await sleep(DELAY_BETWEEN_REQUESTS);
    }

    // Test with Gemini
    if (provider === 'gemini' || provider === 'all') {
      console.log('  → Testing with Gemini...');
      const geminiResult = await testWithGemini(
        prompt.prompt,
        prompt.id,
        prompt.title,
        prompt.category,
        prompt.patterns
      );
      results.push(geminiResult);
      console.log(
        `    ${geminiResult.success ? '✅' : '❌'} ${geminiResult.responseTime}ms`
      );
      await sleep(DELAY_BETWEEN_REQUESTS);
    }
  }

  // Calculate summary
  const openaiResults = results.filter((r) => r.provider === 'openai');
  const geminiResults = results.filter((r) => r.provider === 'gemini');

  const report: BatchReport = {
    batchNumber,
    totalTested: results.length,
    successRate:
      (results.filter((r) => r.success).length / results.length) * 100,
    averageResponseTime:
      results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
    results,
    summary: {
      openai: {
        success: openaiResults.filter((r) => r.success).length,
        failed: openaiResults.filter((r) => !r.success).length,
      },
      gemini: {
        success: geminiResults.filter((r) => r.success).length,
        failed: geminiResults.filter((r) => !r.success).length,
      },
    },
    timestamp: new Date().toISOString(),
  };

  return report;
}

/**
 * Save report to file
 */
function saveReport(report: BatchReport): void {
  const reportsDir = path.join(process.cwd(), 'test-reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `batch-${report.batchNumber}-${Date.now()}.json`;
  const filepath = path.join(reportsDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Report saved: ${filepath}`);
}

/**
 * Print summary
 */
function printSummary(report: BatchReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 BATCH TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Batch Number: ${report.batchNumber}`);
  console.log(`Total Tested: ${report.totalTested}`);
  console.log(`Success Rate: ${report.successRate.toFixed(2)}%`);
  console.log(`Avg Response Time: ${report.averageResponseTime.toFixed(0)}ms`);
  console.log('\nBy Provider:');
  console.log(
    `  OpenAI: ${report.summary.openai.success} ✅ / ${report.summary.openai.failed} ❌`
  );
  console.log(
    `  Gemini: ${report.summary.gemini.success} ✅ / ${report.summary.gemini.failed} ❌`
  );
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Prompt Testing Framework');
  console.log('⚠️  WARNING: This uses API credits. Run manually only!\n');

  // Parse arguments
  const args = process.argv.slice(2);
  const batchArg = args.find((arg) => arg.startsWith('--batch='));
  const providerArg = args.find((arg) => arg.startsWith('--provider='));

  const batchNumber = batchArg ? parseInt(batchArg.split('=')[1]) : 1;
  const provider =
    (providerArg?.split('=')[1] as 'openai' | 'gemini' | 'all') || 'all';

  // Validate API keys
  if (
    !process.env.OPENAI_API_KEY &&
    (provider === 'openai' || provider === 'all')
  ) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  if (
    !process.env.GOOGLE_AI_API_KEY &&
    (provider === 'gemini' || provider === 'all')
  ) {
    console.error('❌ GOOGLE_AI_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Run test
  const report = await runBatchTest(batchNumber, provider);

  // Save and display results
  saveReport(report);
  printSummary(report);

  console.log('\n✅ Testing complete!');
  console.log(
    `\nTo test next batch, run: pnpm test:prompts --batch=${batchNumber + 1}`
  );
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { runBatchTest, TestResult, BatchReport };
