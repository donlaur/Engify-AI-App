# Performance Optimization Infrastructure

Comprehensive performance monitoring, benchmarking, and optimization tools for the Engify AI App.

## 📚 Documentation

- **[Performance Guide](./PERFORMANCE_GUIDE.md)** - Complete guide to performance optimization
- **[Benchmarking](./BENCHMARKING.md)** - Benchmarking best practices and patterns
- **[Query Optimization](./QUERY_OPTIMIZATION.md)** - MongoDB query optimization guide

## 🚀 Quick Start

### Run Performance Benchmarks

```bash
# Run all benchmarks
npm run perf:benchmark

# Run query benchmarks only
npm run perf:benchmark:queries

# Run API benchmarks only (requires running server)
npm run perf:benchmark:api

# Analyze queries and get recommendations
npm run perf:analyze
```

### Basic Usage

```typescript
import {
  BenchmarkRunner,
  QueryMonitor,
  ApiMonitor,
  CachePerformanceMonitor,
} from '@/lib/performance';

// Benchmark code
const runner = new BenchmarkRunner();
await runner.run('My Benchmark', myFunction);

// Monitor queries
const queryMonitor = new QueryMonitor();
const { result, metrics } = await queryMonitor.monitorFind(collection, filter);

// Monitor API endpoints
import { monitoredRoute } from '@/lib/performance';
export const GET = monitoredRoute(handler, { budget: 500 });

// Monitor cache
const cacheMonitor = new CachePerformanceMonitor();
const metrics = cacheMonitor.getMetrics();
```

## 🏗️ Infrastructure Components

### 1. Benchmarking (`/src/lib/performance/benchmark.ts`)

Performance measurement and benchmarking utilities:

- **PerformanceTimer** - Simple timing for code execution
- **MemoryProfiler** - Memory usage tracking
- **BenchmarkRunner** - Statistical benchmarking with warmup

**Key Features:**
- Warmup iterations to avoid JIT compilation effects
- Statistical analysis (avg, min, max, percentiles, stddev)
- Memory profiling
- Comparison benchmarks
- Customizable iteration counts and timeouts

### 2. Query Monitoring (`/src/lib/performance/query-monitor.ts`)

MongoDB query performance tracking:

- **QueryMonitor** - Tracks query execution time and efficiency
- Execution plan analysis
- Slow query detection
- Documents scanned vs returned tracking
- Index usage verification

**Key Features:**
- Configurable performance thresholds
- Automatic slow query detection
- Optimization suggestions
- Performance scoring
- Detailed execution statistics

### 3. Query Optimization (`/src/lib/performance/query-optimizer.ts`)

Automated query analysis and index recommendations:

- **QueryOptimizer** - Analyzes queries and suggests optimizations
- **QueryPatternDetector** - Identifies common query patterns
- Index recommendation engine
- Collection statistics
- Automated index creation (with dry-run mode)

**Key Features:**
- Explain plan analysis
- Index selectivity checking
- Collection scan detection
- Compound index recommendations
- ESR (Equality, Sort, Range) rule validation

### 4. API Monitoring (`/src/lib/performance/api-monitor.ts`)

API endpoint performance tracking:

- **ApiMonitor** - Tracks response times and request rates
- Performance budget enforcement
- Request/error rate tracking
- Slowest endpoint identification

**Key Features:**
- Automatic request tracking
- Performance budgets with alerts
- P95/P99 response time tracking
- Endpoint comparison
- Error rate monitoring

### 5. Cache Metrics (`/src/lib/performance/cache-metrics.ts`)

Cache performance analytics:

- **CachePerformanceMonitor** - Hit/miss tracking
- **CacheWarmer** - Preload critical data
- **CacheInvalidationStrategy** - Smart cache invalidation
- Cache efficiency scoring

**Key Features:**
- Hit/miss rate tracking
- Most accessed keys analysis
- Cache warming strategies
- Efficiency scoring (0-100)
- Average operation timing

## 📊 Performance Dashboard

### React Component

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

function AdminPage() {
  return <PerformanceDashboard />;
}
```

### API Endpoint

```bash
# Get all metrics
curl http://localhost:3000/api/performance/metrics?type=all

# Get specific metrics
curl http://localhost:3000/api/performance/metrics?type=api
curl http://localhost:3000/api/performance/metrics?type=query
curl http://localhost:3000/api/performance/metrics?type=cache

# Get metrics for specific time window (last 60 minutes)
curl http://localhost:3000/api/performance/metrics?type=cache&window=60
```

## 🎯 Performance Budgets

Set and monitor performance budgets:

```typescript
import { setDefaultBudgets, globalApiMonitor } from '@/lib/performance';

// Set default budgets
setDefaultBudgets();

// Custom budgets
globalApiMonitor.addBudget({
  path: '/api/critical-endpoint',
  maxDuration: 200,
  p95Duration: 300,
  p99Duration: 500,
});
```

**Default Budgets:**
- Health checks: 100ms
- Simple GET requests: 200ms
- List endpoints: 500ms
- Complex queries: 1000ms

## 📈 Monitoring Examples

### Monitor Database Queries

```typescript
import { QueryMonitor, monitoredCollection } from '@/lib/performance';

const monitor = new QueryMonitor({
  slowQueryTime: 100,
  warnQueryTime: 50,
});

// Option 1: Direct monitoring
const { result, metrics } = await monitor.monitorFind(
  collection,
  { category: 'prompt-engineering' }
);

// Option 2: Wrapper
const monitored = monitoredCollection(collection, monitor);
const { result } = await monitored.find({ category: 'ai' });

// Get statistics
const stats = monitor.getStats();
console.log(`Average query time: ${stats.averageQueryTime}ms`);
console.log(`Slow queries: ${stats.slowQueries}`);

// Print report
monitor.printReport();
```

### Monitor API Endpoints

```typescript
import { monitoredRoute, globalApiMonitor } from '@/lib/performance';

// Wrap your API route
export const GET = monitoredRoute(
  async (req) => {
    // Your logic
    return NextResponse.json({ data });
  },
  {
    name: '/api/prompts',
    budget: 500,
  }
);

// Get statistics
const stats = globalApiMonitor.getOverallStats();
console.log(`Total requests: ${stats.totalRequests}`);
console.log(`Average duration: ${stats.averageDuration}ms`);
console.log(`Error rate: ${(stats.errorRate * 100).toFixed(2)}%`);
```

### Monitor Cache Performance

```typescript
import { createMonitoredCache, CachePerformanceMonitor } from '@/lib/performance';

const monitor = new CachePerformanceMonitor();
const cache = createMonitoredCache(cacheManager, monitor);

// Use cache normally
await cache.set('key', value);
const result = await cache.get('key');

// Get metrics
const metrics = monitor.getMetrics();
console.log(`Hit rate: ${(metrics.hitRate * 100).toFixed(2)}%`);
console.log(`Efficiency: ${monitor.getEfficiencyScore()}/100`);

// Get most accessed keys
const topKeys = monitor.getMostAccessedKeys(10);
topKeys.forEach(({ key, count }) => {
  console.log(`${key}: ${count} accesses`);
});
```

## 🔍 Query Optimization

### Analyze Queries

```typescript
import { QueryOptimizer } from '@/lib/performance';

const optimizer = new QueryOptimizer();

// Analyze a specific query
const analysis = await optimizer.analyzeQuery(
  collection,
  { category: 'prompt-engineering', active: true },
  { sort: { createdAt: -1 }, limit: 20 }
);

console.log(`Performance score: ${analysis.score}/100`);
console.log(`Execution time: ${analysis.executionTimeMs}ms`);
console.log(`Documents scanned: ${analysis.docsExamined}`);
console.log(`Index used: ${analysis.indexUsed || 'None'}`);

// Print detailed report
optimizer.printReport(analysis);
```

### Get Index Recommendations

```typescript
// Get recommendations for a collection
const recommendations = await optimizer.suggestIndexes('prompts');

recommendations.forEach(rec => {
  console.log(`[${rec.impact.toUpperCase()}] ${rec.reason}`);
  console.log(`Index: ${JSON.stringify(rec.keys)}`);
  console.log(`Impact: ${rec.estimatedImprovement}\n`);
});

// Create indexes (dry run)
const result = await optimizer.createRecommendedIndexes(
  'prompts',
  recommendations,
  true // dry run
);

console.log(`Would create: ${result.created.length} indexes`);
console.log(`Would skip: ${result.skipped.length} indexes`);
```

### Analyze All Collections

```typescript
const analysis = await optimizer.analyzeAllCollections();

console.log(`Total collections: ${analysis.summary.totalCollections}`);
console.log(`Total indexes: ${analysis.summary.totalIndexes}`);
console.log(`Recommendations: ${analysis.summary.totalRecommendations}`);

// Collection statistics
analysis.collections.forEach(col => {
  console.log(`\n${col.collection}:`);
  console.log(`  Documents: ${col.documentCount.toLocaleString()}`);
  console.log(`  Avg size: ${col.avgDocumentSize.toFixed(2)} bytes`);
  console.log(`  Total size: ${(col.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Indexes: ${col.indexes.length}`);
});
```

## 🔥 Cache Warming

### Basic Warming

```typescript
import { CacheWarmer } from '@/lib/performance';

const warmer = new CacheWarmer(cacheManager);

// Warm specific keys
await warmer.warm({
  keys: ['prompts:featured', 'prompts:popular', 'patterns:all'],
  fetcher: async (key) => {
    // Fetch from database
    return await fetchData(key);
  },
  ttl: 3600,
  parallel: true,
  batchSize: 10,
});
```

### Schedule Periodic Warming

```typescript
// Warm cache every hour
const interval = warmer.scheduleWarming(
  {
    keys: criticalKeys,
    fetcher: fetchFunction,
    ttl: 3600,
    parallel: true,
  },
  60 // minutes
);

// Stop scheduled warming
clearInterval(interval);
```

### Warm Critical Paths

```typescript
// Warm common queries on startup
await warmer.warmCriticalPaths();
```

## 📝 Best Practices

### 1. Always Benchmark

Before optimizing, measure current performance:

```typescript
const before = await runner.run('Before optimization', currentImplementation);
// ... make optimizations ...
const after = await runner.run('After optimization', newImplementation);

const improvement = ((before.averageTime - after.averageTime) / before.averageTime) * 100;
console.log(`Improvement: ${improvement.toFixed(1)}%`);
```

### 2. Monitor Production

Enable monitoring in production with appropriate thresholds:

```typescript
// Set realistic thresholds based on your SLAs
const monitor = new QueryMonitor({
  slowQueryTime: 100,
  warnQueryTime: 50,
  maxDocsScanned: 1000,
});
```

### 3. Use Performance Budgets

Set and enforce performance budgets:

```typescript
setDefaultBudgets();

// Review violations regularly
const stats = globalApiMonitor.getOverallStats();
const endpointStats = globalApiMonitor.getAllStats();
const violations = endpointStats.filter(e => e.budgetViolations > 0);

if (violations.length > 0) {
  console.warn('Budget violations detected:', violations);
}
```

### 4. Regular Analysis

Run analysis scripts regularly:

```bash
# Weekly
npm run perf:benchmark

# Monthly
npm run perf:analyze
```

### 5. Cache Strategically

Not everything needs caching:

```typescript
// ✅ Good: Frequently accessed, rarely updated
await cache.set('featured-prompts', data, { ttl: 3600 });

// ❌ Bad: Frequently updated data
await cache.set('live-metrics', data, { ttl: 1 });
```

## 🛠️ Troubleshooting

### Slow Queries

1. Run query analysis:
   ```bash
   npm run perf:benchmark:queries
   ```

2. Check slow queries:
   ```typescript
   const slowQueries = monitor.getSlowQueries();
   ```

3. Create recommended indexes:
   ```typescript
   const recommendations = await optimizer.suggestIndexes('collection');
   await optimizer.createRecommendedIndexes('collection', recommendations);
   ```

### Low Cache Hit Rate

1. Check metrics:
   ```typescript
   const metrics = monitor.getMetrics();
   console.log('Hit rate:', metrics.hitRate);
   ```

2. Implement warming:
   ```typescript
   await warmer.warmCriticalPaths();
   ```

3. Adjust TTLs:
   ```typescript
   // Increase TTL for stable data
   await cache.set(key, value, { ttl: 7200 });
   ```

### High API Response Times

1. Check endpoint stats:
   ```typescript
   const stats = globalApiMonitor.getOverallStats();
   console.log('Slowest endpoints:', stats.slowestEndpoints);
   ```

2. Add caching:
   ```typescript
   const cached = await cache.get(cacheKey);
   if (cached) return cached;
   ```

3. Optimize queries:
   ```typescript
   // Use projection, pagination, indexes
   ```

## 📚 Additional Resources

- [Performance Guide](./PERFORMANCE_GUIDE.md)
- [Benchmarking Best Practices](./BENCHMARKING.md)
- [Query Optimization Patterns](./QUERY_OPTIMIZATION.md)

## 🤝 Contributing

When adding new features, include performance considerations:

1. Add benchmarks for critical paths
2. Set performance budgets
3. Monitor query performance
4. Document optimization decisions

## 📄 License

MIT
