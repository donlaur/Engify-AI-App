/**
 * Performance Optimization Infrastructure
 *
 * Central export point for all performance-related utilities.
 */

// Benchmarking
export {
  PerformanceTimer,
  MemoryProfiler,
  BenchmarkRunner,
  measure,
  measureAsync,
  measureSync,
  createSnapshot,
  compareSnapshots,
} from './benchmark';

export type {
  BenchmarkResult,
  PerformanceMetrics,
  BenchmarkOptions,
} from './benchmark';

// Query Monitoring
export {
  QueryMonitor,
  globalQueryMonitor,
  monitoredCollection,
} from './query-monitor';

export type {
  QueryMetrics,
  ExecutionStats,
  PerformanceThresholds,
  OptimizationSuggestion,
} from './query-monitor';

// Query Optimization
export {
  QueryOptimizer,
  QueryPatternDetector,
  globalQueryOptimizer,
  globalPatternDetector,
} from './query-optimizer';

export type {
  IndexRecommendation,
  QueryAnalysis,
  CollectionStats,
} from './query-optimizer';

// API Monitoring
export {
  ApiMonitor,
  globalApiMonitor,
  withPerformanceMonitoring,
  monitoredRoute,
  setDefaultBudgets,
} from './api-monitor';

export type {
  ApiMetrics,
  PerformanceBudget,
  EndpointStats,
} from './api-monitor';

// Cache Metrics
export {
  CachePerformanceMonitor,
  CacheWarmer,
  CacheInvalidationStrategy,
  createMonitoredCache,
  globalCacheMonitor,
} from './cache-metrics';

export type {
  CacheMetrics,
  CacheOperationTiming,
  CacheWarmingStrategy,
} from './cache-metrics';
