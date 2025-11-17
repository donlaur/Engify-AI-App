# Performance Optimization Guide

Comprehensive guide to performance optimization, benchmarking, and monitoring in the Engify AI App.

## Table of Contents

- [Overview](#overview)
- [Benchmarking Infrastructure](#benchmarking-infrastructure)
- [Query Performance Monitoring](#query-performance-monitoring)
- [API Performance Tracking](#api-performance-tracking)
- [Cache Optimization](#cache-optimization)
- [Performance Budgets](#performance-budgets)
- [Best Practices](#best-practices)

## Overview

The Engify AI App includes comprehensive performance optimization infrastructure:

- **Benchmarking**: Measure and compare code performance
- **Query Monitoring**: Track database query performance
- **API Monitoring**: Monitor API endpoint response times
- **Cache Metrics**: Analyze cache hit rates and efficiency
- **Query Optimization**: Automated query analysis and index recommendations

## Benchmarking Infrastructure

### Basic Usage

```typescript
import { BenchmarkRunner, PerformanceTimer } from '@/lib/performance/benchmark';

// Simple timing
const timer = new PerformanceTimer();
timer.start();
// ... code to measure
const elapsed = timer.stop();
console.log(`Execution time: ${elapsed}ms`);

// Comprehensive benchmarking
const runner = new BenchmarkRunner();
await runner.run('My Benchmark', () => {
  // Code to benchmark
}, {
  iterations: 100,
  warmupIterations: 10,
});
```

### Comparing Multiple Implementations

```typescript
await runner.compare([
  {
    name: 'Implementation A',
    fn: () => implementationA(),
    options: { iterations: 50 },
  },
  {
    name: 'Implementation B',
    fn: () => implementationB(),
    options: { iterations: 50 },
  },
]);
```

### Memory Profiling

```typescript
import { MemoryProfiler } from '@/lib/performance/benchmark';

const profiler = new MemoryProfiler();

// Take snapshots during execution
profiler.snapshot();
// ... code
profiler.snapshot();

// Get memory statistics
const stats = profiler.getStats();
console.log('Memory delta:', stats.delta);
console.log('Peak memory:', stats.peak);
```

## Query Performance Monitoring

### Monitoring Queries

```typescript
import { QueryMonitor } from '@/lib/performance/query-monitor';
import { getMongoDb } from '@/lib/mongodb';

const monitor = new QueryMonitor({
  slowQueryTime: 100, // 100ms threshold
  warnQueryTime: 50,
  maxDocsScanned: 1000,
});

const db = await getMongoDb();
const collection = db.collection('prompts');

// Monitor a find query
const { result, metrics } = await monitor.monitorFind(
  collection,
  { category: 'prompt-engineering' }
);

// Get slow queries
const slowQueries = monitor.getSlowQueries();

// Print performance report
monitor.printReport();
```

### Query Optimization

```typescript
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

const optimizer = new QueryOptimizer();

// Analyze a query
const analysis = await optimizer.analyzeQuery(
  collection,
  { category: 'prompt-engineering' },
  { sort: { createdAt: -1 } }
);

// Get index recommendations
const recommendations = await optimizer.suggestIndexes('prompts');

// Create recommended indexes (dry run)
const result = await optimizer.createRecommendedIndexes(
  'prompts',
  recommendations,
  true // dry run
);
```

### Running Query Benchmarks

```bash
# Benchmark database queries
npm run tsx scripts/performance/benchmark-queries.ts

# This will:
# - Benchmark critical queries
# - Analyze query performance
# - Suggest index optimizations
# - Provide detailed reports
```

## API Performance Tracking

### Monitoring API Routes

```typescript
import { monitoredRoute } from '@/lib/performance/api-monitor';

export const GET = monitoredRoute(
  async (req) => {
    // Your handler code
    return NextResponse.json({ data: 'response' });
  },
  {
    name: '/api/prompts',
    budget: 500, // 500ms performance budget
  }
);
```

### Setting Performance Budgets

```typescript
import { globalApiMonitor, setDefaultBudgets } from '@/lib/performance/api-monitor';

// Set default budgets
setDefaultBudgets();

// Add custom budgets
globalApiMonitor.addBudget({
  path: '/api/custom',
  maxDuration: 300,
});

// Get performance statistics
const stats = globalApiMonitor.getOverallStats();
console.log('Average response time:', stats.averageDuration);
console.log('P95 response time:', stats.p95Duration);
```

### Running API Benchmarks

```bash
# Benchmark API endpoints (requires running server)
npm run tsx scripts/performance/benchmark-api.ts

# This will:
# - Benchmark critical endpoints
# - Compare different query strategies
# - Identify performance bottlenecks
```

## Cache Optimization

### Cache Monitoring

```typescript
import { createMonitoredCache, CachePerformanceMonitor } from '@/lib/performance/cache-metrics';
import { CacheManager } from '@/lib/cache/CacheManager';

const cacheManager = new CacheManager(config);
const monitor = new CachePerformanceMonitor();

const cache = createMonitoredCache(cacheManager, monitor);

// Use monitored cache
await cache.set('key', 'value');
const value = await cache.get('key');

// Get metrics
const metrics = monitor.getMetrics();
console.log('Hit rate:', metrics.hitRate);
console.log('Efficiency score:', monitor.getEfficiencyScore());

// Get most accessed keys
const mostAccessed = monitor.getMostAccessedKeys(10);
```

### Cache Warming

```typescript
import { CacheWarmer } from '@/lib/performance/cache-metrics';

const warmer = cache.getWarmer();

// Warm cache with critical data
await warmer.warm({
  keys: ['prompts:featured', 'prompts:popular'],
  fetcher: async (key) => {
    // Fetch data from database
    return await fetchData(key);
  },
  ttl: 3600,
  parallel: true,
  batchSize: 10,
});

// Schedule periodic warming
const interval = warmer.scheduleWarming(strategy, 60); // Every 60 minutes
```

### Cache Invalidation

```typescript
import { CacheInvalidationStrategy } from '@/lib/performance/cache-metrics';

const invalidation = new CacheInvalidationStrategy(cacheManager);

// Invalidate by tag
await invalidation.invalidateByTag('prompts');

// Invalidate by pattern
await invalidation.invalidateByPattern('prompts:*');

// Invalidate with dependencies
await invalidation.invalidateByDependencies('prompt:123', [
  'prompts:list',
  'prompts:featured',
]);
```

## Performance Budgets

### Setting Budgets

Performance budgets help ensure your app stays fast:

```typescript
// API Route Budgets
const budgets = [
  { path: '/api/health', maxDuration: 100 },
  { path: '/api/prompts', maxDuration: 500 },
  { path: /^\/api\/prompts\/[^/]+$/, maxDuration: 200 },
];

budgets.forEach(budget => globalApiMonitor.addBudget(budget));
```

### Recommended Budgets

- **Health check**: < 100ms
- **Simple GET requests**: < 200ms
- **Complex queries**: < 500ms
- **Data mutations**: < 1000ms
- **Cache operations**: < 10ms
- **Database queries**: < 100ms

## Best Practices

### 1. Query Optimization

```typescript
// ❌ Bad: No index, full collection scan
await collection.find({
  category: 'prompt-engineering',
  active: true,
}).toArray();

// ✅ Good: Compound index on (category, active)
await collection.createIndex({ category: 1, active: 1 });
await collection.find({
  category: 'prompt-engineering',
  active: true,
}).toArray();

// ✅ Better: Add sorting to index
await collection.createIndex({ category: 1, active: 1, createdAt: -1 });
await collection.find({
  category: 'prompt-engineering',
  active: true,
}).sort({ createdAt: -1 }).toArray();
```

### 2. Cache Strategy

```typescript
// ✅ Use cache-aside pattern for frequently accessed data
const cached = await cache.get<Prompt[]>('prompts:featured');
if (cached) {
  return cached;
}

const data = await fetchFromDatabase();
await cache.set('prompts:featured', data, { ttl: 3600 });
return data;

// ✅ Use cache warming for critical paths
await warmer.warmCriticalPaths();
```

### 3. Pagination

```typescript
// ❌ Bad: Fetching all documents
const allPrompts = await collection.find({}).toArray();

// ✅ Good: Paginated query
const prompts = await collection
  .find({})
  .skip(page * limit)
  .limit(limit)
  .toArray();

// ✅ Better: Cursor-based pagination
const prompts = await collection
  .find({ _id: { $gt: lastId } })
  .limit(limit)
  .toArray();
```

### 4. Index Selection

```typescript
// Create indexes for:
// 1. Frequent filter fields
await collection.createIndex({ category: 1 });

// 2. Sorting fields
await collection.createIndex({ createdAt: -1 });

// 3. Compound queries
await collection.createIndex({ category: 1, active: 1, createdAt: -1 });

// 4. Text search
await collection.createIndex({ title: 'text', description: 'text' });

// 5. Unique constraints
await collection.createIndex({ email: 1 }, { unique: true });
```

### 5. Monitoring in Production

```typescript
// Enable monitoring for critical routes
export const GET = monitoredRoute(handler, {
  name: '/api/critical-path',
  budget: 500,
});

// Review metrics regularly
const metrics = globalApiMonitor.getOverallStats();
if (metrics.p95Duration > 1000) {
  console.warn('P95 response time exceeds 1 second!');
}

// Set up alerts
if (metrics.errorRate > 0.05) {
  sendAlert('High error rate detected');
}
```

## Performance Dashboard

Access the performance dashboard to view real-time metrics:

```typescript
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';

// In your admin page
<PerformanceDashboard />
```

Or use the API directly:

```bash
# Get all metrics
curl http://localhost:3000/api/performance/metrics?type=all

# Get specific metrics
curl http://localhost:3000/api/performance/metrics?type=api
curl http://localhost:3000/api/performance/metrics?type=query
curl http://localhost:3000/api/performance/metrics?type=cache

# Clear metrics
curl -X POST http://localhost:3000/api/performance/metrics/clear \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

## Troubleshooting

### Slow Queries

1. **Identify slow queries**:
   ```typescript
   const slowQueries = monitor.getSlowQueries();
   slowQueries.forEach(q => console.log(q));
   ```

2. **Analyze execution plan**:
   ```typescript
   const analysis = await optimizer.analyzeQuery(collection, filter);
   optimizer.printReport(analysis);
   ```

3. **Create appropriate indexes**:
   ```typescript
   const recommendations = await optimizer.suggestIndexes('collection');
   await optimizer.createRecommendedIndexes('collection', recommendations, false);
   ```

### Low Cache Hit Rate

1. **Analyze cache usage**:
   ```typescript
   const metrics = monitor.getMetrics();
   console.log('Hit rate:', metrics.hitRate);
   ```

2. **Identify frequently accessed keys**:
   ```typescript
   const mostAccessed = monitor.getMostAccessedKeys();
   ```

3. **Implement cache warming**:
   ```typescript
   await warmer.warm({
     keys: mostAccessed.map(k => k.key),
     fetcher: fetchDataFunction,
     ttl: 3600,
   });
   ```

### High Response Times

1. **Check API metrics**:
   ```typescript
   const stats = globalApiMonitor.getOverallStats();
   console.log('Slowest endpoints:', stats.slowestEndpoints);
   ```

2. **Benchmark specific endpoints**:
   ```bash
   npm run tsx scripts/performance/benchmark-api.ts
   ```

3. **Optimize critical paths**:
   - Add caching
   - Optimize queries
   - Implement pagination
   - Use connection pooling

## Additional Resources

- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Redis Caching Strategies](https://redis.io/topics/lru-cache)

## Support

For performance-related issues or questions, please:
1. Check the troubleshooting section
2. Review the benchmark reports
3. Consult the performance metrics dashboard
4. Open an issue with performance metrics attached
