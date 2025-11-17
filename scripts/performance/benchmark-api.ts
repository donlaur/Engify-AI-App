#!/usr/bin/env tsx
/**
 * API Endpoint Performance Benchmark
 *
 * Benchmarks critical API endpoints and provides performance insights.
 */

import { BenchmarkRunner } from '@/lib/performance/benchmark';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function fetchEndpoint(path: string, options?: RequestInit) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  return response.json();
}

async function main() {
  console.log('=== API Endpoint Performance Benchmark ===\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  const runner = new BenchmarkRunner();

  // Benchmark 1: GET /api/prompts
  console.log('\n📊 Benchmarking GET /api/prompts...\n');

  await runner.run(
    'GET /api/prompts',
    async () => {
      await fetchEndpoint('/api/prompts');
    },
    {
      iterations: 50,
      warmupIterations: 10,
      async: true,
    }
  );

  await runner.run(
    'GET /api/prompts?category=prompt-engineering',
    async () => {
      await fetchEndpoint('/api/prompts?category=prompt-engineering');
    },
    {
      iterations: 50,
      warmupIterations: 10,
      async: true,
    }
  );

  await runner.run(
    'GET /api/prompts?search=chatgpt',
    async () => {
      await fetchEndpoint('/api/prompts?search=chatgpt');
    },
    {
      iterations: 30,
      warmupIterations: 5,
      async: true,
    }
  );

  // Benchmark 2: GET /api/patterns
  console.log('\n📊 Benchmarking GET /api/patterns...\n');

  await runner.run(
    'GET /api/patterns',
    async () => {
      await fetchEndpoint('/api/patterns');
    },
    {
      iterations: 50,
      warmupIterations: 10,
      async: true,
    }
  );

  // Benchmark 3: GET /api/health
  console.log('\n📊 Benchmarking GET /api/health...\n');

  await runner.run(
    'GET /api/health',
    async () => {
      await fetchEndpoint('/api/health');
    },
    {
      iterations: 100,
      warmupIterations: 10,
      async: true,
    }
  );

  // Benchmark 4: Compare different query strategies
  console.log('\n📊 Comparing query strategies...\n');

  await runner.compare([
    {
      name: 'All prompts (no filter)',
      fn: async () => {
        await fetchEndpoint('/api/prompts?limit=50');
      },
      options: { iterations: 30, async: true },
    },
    {
      name: 'Filtered by category',
      fn: async () => {
        await fetchEndpoint('/api/prompts?category=prompt-engineering&limit=50');
      },
      options: { iterations: 30, async: true },
    },
    {
      name: 'With pagination',
      fn: async () => {
        await fetchEndpoint('/api/prompts?limit=20&skip=0');
      },
      options: { iterations: 30, async: true },
    },
  ]);

  console.log('\n✅ Benchmark complete!\n');

  runner.destroy();
  process.exit(0);
}

// Check if server is running
async function checkServer() {
  try {
    await fetch(BASE_URL);
    return true;
  } catch {
    return false;
  }
}

checkServer().then((isRunning) => {
  if (!isRunning) {
    console.error(`❌ Server is not running at ${BASE_URL}`);
    console.error('Please start the server with: npm run dev');
    process.exit(1);
  }

  main().catch((error) => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
});
