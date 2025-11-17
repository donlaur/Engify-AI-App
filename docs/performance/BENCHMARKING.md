# Benchmarking Best Practices

Guide to effective performance benchmarking in the Engify AI App.

## Overview

Benchmarking helps you:
- Measure code performance objectively
- Compare different implementations
- Detect performance regressions
- Set performance budgets
- Identify optimization opportunities

## Benchmark Types

### 1. Microbenchmarks

Measure small, isolated pieces of code:

```typescript
import { BenchmarkRunner } from '@/lib/performance/benchmark';

const runner = new BenchmarkRunner();

// Benchmark a specific function
await runner.run('Array map vs forEach', () => {
  const arr = Array.from({ length: 1000 }, (_, i) => i);
  return arr.map(x => x * 2);
}, {
  iterations: 1000,
  warmupIterations: 100,
});
```

### 2. Integration Benchmarks

Measure complete workflows:

```typescript
await runner.run('Full prompt creation workflow', async () => {
  // 1. Validate input
  const validated = validatePrompt(input);

  // 2. Check duplicates
  await checkDuplicates(validated);

  // 3. Save to database
  await savePrompt(validated);

  // 4. Update cache
  await updateCache(validated);
}, {
  iterations: 50,
  async: true,
});
```

### 3. Load Testing

Measure system performance under load:

```typescript
await runner.run('Concurrent requests', async () => {
  const requests = Array.from({ length: 100 }, () =>
    fetch('/api/prompts')
  );
  await Promise.all(requests);
}, {
  iterations: 10,
  async: true,
});
```

## Best Practices

### 1. Warmup Iterations

Always include warmup iterations to account for JIT compilation:

```typescript
await runner.run('My Benchmark', fn, {
  iterations: 100,
  warmupIterations: 10, // ✅ Warmup before measuring
});
```

### 2. Sufficient Sample Size

Use enough iterations for statistical significance:

```typescript
// ❌ Bad: Too few iterations
await runner.run('Fast operation', fn, { iterations: 5 });

// ✅ Good: Sufficient iterations
await runner.run('Fast operation', fn, { iterations: 1000 });

// ✅ Good: Adaptive - stops when max time reached
await runner.run('Slow operation', fn, {
  iterations: 1000,
  minSampleSize: 10,
  maxTime: 10000, // Stop after 10 seconds
});
```

### 3. Isolate Variables

Benchmark one thing at a time:

```typescript
// ❌ Bad: Testing multiple variables
await runner.run('Complex test', () => {
  const a = methodA(); // Different method
  const b = processB(a); // Different data size
  return b;
});

// ✅ Good: Isolate variables
await runner.compare([
  { name: 'Method A', fn: () => methodA() },
  { name: 'Method B', fn: () => methodB() },
]);
```

### 4. Realistic Data

Use production-like data for benchmarks:

```typescript
// ❌ Bad: Unrealistic data
const testData = { id: 1, name: 'test' };

// ✅ Good: Realistic data
const testData = {
  id: generateRealisticId(),
  category: 'prompt-engineering',
  content: generateRealisticPrompt(500), // Realistic length
  tags: generateRealisticTags(5),
  metadata: generateRealisticMetadata(),
};
```

### 5. Clean State

Reset state between iterations:

```typescript
await runner.run('Database query', async () => {
  const result = await collection.find(filter).toArray();
  return result;
}, {
  beforeEach: async () => {
    // ✅ Reset cache before each iteration
    await cache.clear();
  },
  afterEach: async () => {
    // ✅ Cleanup after each iteration
    await cleanup();
  },
});
```

## Interpreting Results

### Understanding Metrics

```typescript
const result = await runner.run('My Benchmark', fn);
console.log(result);
/*
{
  name: 'My Benchmark',
  operations: 100,
  totalTime: 1234.56,
  averageTime: 12.34,
  minTime: 10.11,
  maxTime: 15.67,
  opsPerSecond: 81.04,
  stdDev: 1.23,
  percentiles: {
    p50: 12.00,  // Median - 50% of operations were faster
    p75: 13.00,  // 75th percentile
    p90: 14.00,  // 90th percentile
    p95: 14.50,  // 95th percentile - important for SLAs
    p99: 15.20,  // 99th percentile - worst case
  }
}
*/
```

### Key Metrics

1. **Average Time**: General performance indicator
2. **P95/P99**: Important for user experience (most users see this)
3. **Standard Deviation**: Consistency (lower is better)
4. **Min/Max**: Range of performance

### Statistical Significance

```typescript
// Compare two implementations
const results = await runner.compare([
  { name: 'Implementation A', fn: implA },
  { name: 'Implementation B', fn: implB },
]);

// Look for meaningful differences
// A difference > 10% is usually significant
// Consider standard deviation for confidence
```

## Common Pitfalls

### 1. Dead Code Elimination

```typescript
// ❌ Bad: Result not used, might be optimized away
await runner.run('Test', () => {
  const result = expensiveOperation();
  // Result not used!
});

// ✅ Good: Return the result
await runner.run('Test', () => {
  return expensiveOperation();
});
```

### 2. Caching Effects

```typescript
// ❌ Bad: First iteration slower due to cold cache
await runner.run('With cache', () => {
  return getCachedData();
});

// ✅ Good: Warmup cache first
await runner.run('With cache', () => {
  return getCachedData();
}, {
  warmupIterations: 10,
});
```

### 3. Async Timing

```typescript
// ❌ Bad: Not waiting for async operation
await runner.run('Async test', () => {
  asyncOperation(); // ⚠️ Not awaited!
});

// ✅ Good: Properly async
await runner.run('Async test', async () => {
  await asyncOperation();
}, {
  async: true, // ✅ Specify async
});
```

## Advanced Techniques

### Memory Benchmarking

```typescript
import { MemoryProfiler } from '@/lib/performance/benchmark';

await runner.run('Memory usage', () => {
  const profiler = new MemoryProfiler();

  // Operation to measure
  const data = generateLargeDataset();

  const stats = profiler.getStats();
  console.log('Memory delta:', stats.delta.heapUsed);

  return data;
});
```

### Custom Metrics

```typescript
await runner.run('Custom metrics', () => {
  const timer = new PerformanceTimer();

  timer.mark('start');
  operation1();

  timer.mark('middle');
  operation2();

  timer.mark('end');

  return {
    phase1: timer.measure('start', 'middle'),
    phase2: timer.measure('middle', 'end'),
  };
});
```

### Regression Testing

```typescript
// Store baseline results
const baseline = await runner.run('Baseline', fn);
localStorage.setItem('baseline', JSON.stringify(baseline));

// Later, compare to baseline
const current = await runner.run('Current', fn);
const baselineStored = JSON.parse(localStorage.getItem('baseline'));

const regression = (current.averageTime / baselineStored.averageTime - 1) * 100;
if (regression > 10) {
  console.warn(`Performance regression detected: ${regression.toFixed(1)}%`);
}
```

## Benchmark Scripts

### Database Queries

```bash
npm run tsx scripts/performance/benchmark-queries.ts
```

This benchmarks:
- Find queries
- Aggregate queries
- Text search queries
- Sorted queries

### API Endpoints

```bash
npm run tsx scripts/performance/benchmark-api.ts
```

This benchmarks:
- GET /api/prompts
- GET /api/patterns
- GET /api/health
- Various query strategies

### Custom Benchmarks

Create your own benchmark script:

```typescript
#!/usr/bin/env tsx
import { BenchmarkRunner } from '@/lib/performance/benchmark';

async function main() {
  const runner = new BenchmarkRunner();

  // Your benchmarks here
  await runner.run('My Benchmark', myFunction, {
    iterations: 100,
  });

  runner.destroy();
}

main();
```

## Continuous Benchmarking

### CI Integration

```yaml
# .github/workflows/benchmark.yml
name: Performance Benchmarks

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Run benchmarks
        run: npm run benchmark
      - name: Upload results
        uses: actions/upload-artifact@v2
        with:
          name: benchmark-results
          path: benchmark-results.json
```

### Monitoring

Set up alerts for performance regressions:

```typescript
const threshold = 1.1; // 10% slower is a regression

if (current.averageTime > baseline.averageTime * threshold) {
  sendAlert({
    type: 'performance-regression',
    benchmark: current.name,
    baseline: baseline.averageTime,
    current: current.averageTime,
    regression: ((current.averageTime / baseline.averageTime - 1) * 100).toFixed(1),
  });
}
```

## Resources

- [V8 Performance Tips](https://v8.dev/blog/elements-kinds)
- [Node.js Performance Measurement](https://nodejs.org/api/perf_hooks.html)
- [Statistical Analysis for Benchmarks](https://en.wikipedia.org/wiki/Statistical_significance)
