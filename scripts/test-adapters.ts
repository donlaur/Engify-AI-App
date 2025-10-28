#!/usr/bin/env tsx
/**
 * Manual integration test for AI adapters
 * Tests real API calls to verify adapters work correctly
 *
 * Usage: tsx scripts/test-adapters.ts
 */

import { OpenAIAdapter } from '../src/lib/ai/v2/adapters/OpenAIAdapter';
import { ClaudeAdapter } from '../src/lib/ai/v2/adapters/ClaudeAdapter';
import { GeminiAdapter } from '../src/lib/ai/v2/adapters/GeminiAdapter';
import { GroqAdapter } from '../src/lib/ai/v2/adapters/GroqAdapter';
import { AIProvider, AIRequest } from '../src/lib/ai/v2/interfaces/AIProvider';

const testRequest: AIRequest = {
  prompt: 'Say "test successful" in exactly 2 words',
  maxTokens: 20,
  temperature: 0.7,
};

async function testAdapter(name: string, adapter: AIProvider) {
  console.log(`\n🧪 Testing ${name}...`);

  try {
    const startTime = Date.now();
    const response = await adapter.execute(testRequest);
    const duration = Date.now() - startTime;

    console.log(`✅ ${name} Success!`);
    console.log(`   Response: "${response.content}"`);
    console.log(`   Model: ${response.model}`);
    console.log(`   Tokens: ${response.usage.totalTokens}`);
    console.log(`   Cost: $${response.cost.total.toFixed(6)}`);
    console.log(`   Latency: ${response.latency}ms (total: ${duration}ms)`);

    return true;
  } catch (error) {
    console.log(`❌ ${name} Failed!`);
    console.log(
      `   Error: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

async function main() {
  console.log('🚀 AI Adapter Integration Tests');
  console.log('================================\n');

  const results: Record<string, boolean> = {};

  // Test OpenAI
  if (process.env.OPENAI_API_KEY) {
    results.OpenAI = await testAdapter('OpenAI', new OpenAIAdapter());
  } else {
    console.log('\n⚠️  Skipping OpenAI - no API key');
    results.OpenAI = false;
  }

  // Test Claude
  if (process.env.ANTHROPIC_API_KEY) {
    results.Claude = await testAdapter('Claude', new ClaudeAdapter());
  } else {
    console.log('\n⚠️  Skipping Claude - no API key');
    results.Claude = false;
  }

  // Test Gemini
  if (process.env.GOOGLE_API_KEY) {
    results.Gemini = await testAdapter('Gemini', new GeminiAdapter());
  } else {
    console.log('\n⚠️  Skipping Gemini - no API key');
    results.Gemini = false;
  }

  // Test Groq
  if (process.env.GROQ_API_KEY) {
    results.Groq = await testAdapter('Groq', new GroqAdapter());
  } else {
    console.log('\n⚠️  Skipping Groq - no API key');
    results.Groq = false;
  }

  // Summary
  console.log('\n\n📊 Test Summary');
  console.log('===============');

  const tested = Object.values(results).filter((r) => r !== null).length;
  const passed = Object.values(results).filter((r) => r === true).length;
  const failed = Object.values(results).filter((r) => r === false).length;

  Object.entries(results).forEach(([name, result]) => {
    const icon = result ? '✅' : '❌';
    console.log(`${icon} ${name}`);
  });

  console.log(`\nTotal: ${tested} tested, ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
