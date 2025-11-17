/**
 * Database Query Performance Monitoring
 *
 * Tracks and analyzes MongoDB query performance, identifies slow queries,
 * and provides optimization recommendations.
 */

import { Collection, Document, Filter, FindOptions } from 'mongodb';
import { PerformanceTimer, PerformanceMetrics } from './benchmark';

/**
 * Query performance metrics
 */
export interface QueryMetrics extends PerformanceMetrics {
  query: string;
  collection: string;
  operation: 'find' | 'findOne' | 'insert' | 'update' | 'delete' | 'aggregate' | 'count';
  documentsReturned?: number;
  documentsScanned?: number;
  indexUsed?: string;
  executionStats?: ExecutionStats;
  slow?: boolean;
}

/**
 * Execution statistics from MongoDB explain
 */
export interface ExecutionStats {
  executionTimeMillis: number;
  totalKeysExamined: number;
  totalDocsExamined: number;
  nReturned: number;
  executionStages?: {
    stage: string;
    nReturned: number;
    executionTimeMillisEstimate: number;
  };
  indexUsed?: string;
}

/**
 * Query performance thresholds
 */
export interface PerformanceThresholds {
  slowQueryTime: number; // ms
  warnQueryTime: number; // ms
  maxDocsScanned: number;
  minIndexSelectivity: number; // ratio of docs returned to docs scanned
}

/**
 * Query optimization suggestion
 */
export interface OptimizationSuggestion {
  type: 'index' | 'query' | 'schema';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestedIndex?: {
    keys: Record<string, 1 | -1>;
    options?: Record<string, unknown>;
  };
  suggestedQuery?: string;
}

/**
 * Default performance thresholds
 */
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  slowQueryTime: 100, // 100ms
  warnQueryTime: 50, // 50ms
  maxDocsScanned: 1000,
  minIndexSelectivity: 0.5, // 50% selectivity
};

/**
 * Query Monitor
 * Monitors and analyzes database query performance
 */
export class QueryMonitor {
  private metrics: QueryMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private enabled = true;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  }

  /**
   * Monitor a find query
   */
  async monitorFind<T extends Document>(
    collection: Collection<T>,
    filter: Filter<T>,
    options?: FindOptions
  ): Promise<{ result: T[]; metrics: QueryMetrics }> {
    if (!this.enabled) {
      const result = await collection.find(filter, options).toArray() as T[];
      return { result, metrics: this.createEmptyMetrics('find', collection.collectionName) };
    }

    const timer = new PerformanceTimer();
    const queryString = JSON.stringify(filter);

    // Get execution plan
    const explain = await collection.find(filter, options).explain('executionStats');
    const executionStats = this.parseExecutionStats(explain);

    timer.start();
    const result = await collection.find(filter, options).toArray() as T[];
    const duration = timer.stop();

    const metrics: QueryMetrics = {
      query: queryString,
      collection: collection.collectionName,
      operation: 'find',
      duration,
      memoryUsed: 0,
      timestamp: new Date(),
      documentsReturned: result.length,
      documentsScanned: executionStats.totalDocsExamined,
      indexUsed: executionStats.indexUsed,
      executionStats,
      slow: duration > this.thresholds.slowQueryTime,
    };

    this.recordMetrics(metrics);
    this.checkPerformance(metrics);

    return { result, metrics };
  }

  /**
   * Monitor a findOne query
   */
  async monitorFindOne<T extends Document>(
    collection: Collection<T>,
    filter: Filter<T>,
    options?: FindOptions
  ): Promise<{ result: T | null; metrics: QueryMetrics }> {
    if (!this.enabled) {
      const result = await collection.findOne(filter, options);
      return { result, metrics: this.createEmptyMetrics('findOne', collection.collectionName) };
    }

    const timer = new PerformanceTimer();
    const queryString = JSON.stringify(filter);

    // Get execution plan
    const explain = await collection.find(filter, options).limit(1).explain('executionStats');
    const executionStats = this.parseExecutionStats(explain);

    timer.start();
    const result = await collection.findOne(filter, options);
    const duration = timer.stop();

    const metrics: QueryMetrics = {
      query: queryString,
      collection: collection.collectionName,
      operation: 'findOne',
      duration,
      memoryUsed: 0,
      timestamp: new Date(),
      documentsReturned: result ? 1 : 0,
      documentsScanned: executionStats.totalDocsExamined,
      indexUsed: executionStats.indexUsed,
      executionStats,
      slow: duration > this.thresholds.slowQueryTime,
    };

    this.recordMetrics(metrics);
    this.checkPerformance(metrics);

    return { result, metrics };
  }

  /**
   * Monitor an aggregate query
   */
  async monitorAggregate<T extends Document>(
    collection: Collection<T>,
    pipeline: Document[]
  ): Promise<{ result: Document[]; metrics: QueryMetrics }> {
    if (!this.enabled) {
      const result = await collection.aggregate(pipeline).toArray();
      return { result, metrics: this.createEmptyMetrics('aggregate', collection.collectionName) };
    }

    const timer = new PerformanceTimer();
    const queryString = JSON.stringify(pipeline);

    // Get execution plan
    const explain = await collection.aggregate(pipeline, { explain: true }).toArray();
    const executionStats = this.parseAggregateStats(explain);

    timer.start();
    const result = await collection.aggregate(pipeline).toArray();
    const duration = timer.stop();

    const metrics: QueryMetrics = {
      query: queryString,
      collection: collection.collectionName,
      operation: 'aggregate',
      duration,
      memoryUsed: 0,
      timestamp: new Date(),
      documentsReturned: result.length,
      executionStats,
      slow: duration > this.thresholds.slowQueryTime,
    };

    this.recordMetrics(metrics);
    this.checkPerformance(metrics);

    return { result, metrics };
  }

  /**
   * Monitor a count query
   */
  async monitorCount<T extends Document>(
    collection: Collection<T>,
    filter: Filter<T>
  ): Promise<{ result: number; metrics: QueryMetrics }> {
    if (!this.enabled) {
      const result = await collection.countDocuments(filter);
      return { result, metrics: this.createEmptyMetrics('count', collection.collectionName) };
    }

    const timer = new PerformanceTimer();
    const queryString = JSON.stringify(filter);

    timer.start();
    const result = await collection.countDocuments(filter);
    const duration = timer.stop();

    const metrics: QueryMetrics = {
      query: queryString,
      collection: collection.collectionName,
      operation: 'count',
      duration,
      memoryUsed: 0,
      timestamp: new Date(),
      documentsReturned: 1,
      slow: duration > this.thresholds.slowQueryTime,
    };

    this.recordMetrics(metrics);
    this.checkPerformance(metrics);

    return { result, metrics };
  }

  /**
   * Parse execution stats from explain output
   */
  private parseExecutionStats(explain: Document): ExecutionStats {
    const stats = explain.executionStats || {};
    const executionStages = stats.executionStages || {};

    return {
      executionTimeMillis: stats.executionTimeMillis || 0,
      totalKeysExamined: stats.totalKeysExamined || 0,
      totalDocsExamined: stats.totalDocsExamined || 0,
      nReturned: stats.nReturned || 0,
      executionStages: {
        stage: executionStages.stage || 'unknown',
        nReturned: executionStages.nReturned || 0,
        executionTimeMillisEstimate:
          executionStages.executionTimeMillisEstimate || 0,
      },
      indexUsed: executionStages.indexName,
    };
  }

  /**
   * Parse aggregate execution stats
   */
  private parseAggregateStats(_explain: Document[]): ExecutionStats {
    // Aggregate explain is different, extract what we can
    // const firstStage = explain[0] || {};
    return {
      executionTimeMillis: 0,
      totalKeysExamined: 0,
      totalDocsExamined: 0,
      nReturned: 0,
      executionStages: {
        stage: 'aggregate',
        nReturned: 0,
        executionTimeMillisEstimate: 0,
      },
    };
  }

  /**
   * Check query performance and log warnings
   */
  private checkPerformance(metrics: QueryMetrics): void {
    const suggestions = this.analyzeQuery(metrics);

    if (suggestions.length > 0) {
      const critical = suggestions.filter((s) => s.severity === 'critical');
      const warnings = suggestions.filter((s) => s.severity === 'warning');

      if (critical.length > 0) {
        console.error(`[QueryMonitor] Critical performance issues detected for ${metrics.operation} on ${metrics.collection}:`);
        critical.forEach((s) => console.error(`  - ${s.message}`));
      }

      if (warnings.length > 0) {
        console.warn(`[QueryMonitor] Performance warnings for ${metrics.operation} on ${metrics.collection}:`);
        warnings.forEach((s) => console.warn(`  - ${s.message}`));
      }
    }

    if (metrics.slow) {
      console.warn(
        `[QueryMonitor] Slow query detected (${metrics.duration.toFixed(2)}ms): ${metrics.query.substring(0, 100)}...`
      );
    }
  }

  /**
   * Analyze query and provide optimization suggestions
   */
  analyzeQuery(metrics: QueryMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check if query is slow
    if (metrics.duration > this.thresholds.slowQueryTime) {
      suggestions.push({
        type: 'query',
        severity: 'critical',
        message: `Query took ${metrics.duration.toFixed(2)}ms (threshold: ${this.thresholds.slowQueryTime}ms)`,
      });
    } else if (metrics.duration > this.thresholds.warnQueryTime) {
      suggestions.push({
        type: 'query',
        severity: 'warning',
        message: `Query took ${metrics.duration.toFixed(2)}ms (warning threshold: ${this.thresholds.warnQueryTime}ms)`,
      });
    }

    // Check if too many documents were scanned
    if (
      metrics.documentsScanned &&
      metrics.documentsScanned > this.thresholds.maxDocsScanned
    ) {
      suggestions.push({
        type: 'index',
        severity: 'critical',
        message: `Query scanned ${metrics.documentsScanned} documents (threshold: ${this.thresholds.maxDocsScanned})`,
      });
    }

    // Check index selectivity
    if (metrics.documentsReturned && metrics.documentsScanned) {
      const selectivity = metrics.documentsReturned / metrics.documentsScanned;
      if (selectivity < this.thresholds.minIndexSelectivity) {
        suggestions.push({
          type: 'index',
          severity: 'warning',
          message: `Poor index selectivity: ${(selectivity * 100).toFixed(1)}% (returned ${metrics.documentsReturned} of ${metrics.documentsScanned} scanned)`,
        });
      }
    }

    // Check if no index was used
    if (!metrics.indexUsed && metrics.documentsScanned && metrics.documentsScanned > 100) {
      suggestions.push({
        type: 'index',
        severity: 'critical',
        message: 'No index used - table scan detected',
      });
    }

    return suggestions;
  }

  /**
   * Record metrics
   */
  private recordMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Create empty metrics for disabled monitoring
   */
  private createEmptyMetrics(operation: QueryMetrics['operation'], collection: string): QueryMetrics {
    return {
      query: '',
      collection,
      operation,
      duration: 0,
      memoryUsed: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): QueryMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get slow queries
   */
  getSlowQueries(): QueryMetrics[] {
    return this.metrics.filter((m) => m.slow);
  }

  /**
   * Get metrics for a specific collection
   */
  getCollectionMetrics(collection: string): QueryMetrics[] {
    return this.metrics.filter((m) => m.collection === collection);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalQueries: number;
    slowQueries: number;
    averageQueryTime: number;
    p95QueryTime: number;
    p99QueryTime: number;
    byCollection: Record<string, { count: number; avgTime: number }>;
    byOperation: Record<string, { count: number; avgTime: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageQueryTime: 0,
        p95QueryTime: 0,
        p99QueryTime: 0,
        byCollection: {},
        byOperation: {},
      };
    }

    const sorted = [...this.metrics].sort((a, b) => a.duration - b.duration);
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    // Calculate percentiles
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    // Group by collection
    const byCollection: Record<string, { count: number; avgTime: number }> = {};
    this.metrics.forEach((m) => {
      if (!byCollection[m.collection]) {
        byCollection[m.collection] = { count: 0, avgTime: 0 };
      }
      byCollection[m.collection].count++;
      byCollection[m.collection].avgTime += m.duration;
    });

    // Calculate averages
    Object.keys(byCollection).forEach((key) => {
      byCollection[key].avgTime /= byCollection[key].count;
    });

    // Group by operation
    const byOperation: Record<string, { count: number; avgTime: number }> = {};
    this.metrics.forEach((m) => {
      if (!byOperation[m.operation]) {
        byOperation[m.operation] = { count: 0, avgTime: 0 };
      }
      byOperation[m.operation].count++;
      byOperation[m.operation].avgTime += m.duration;
    });

    // Calculate averages
    Object.keys(byOperation).forEach((key) => {
      byOperation[key].avgTime /= byOperation[key].count;
    });

    return {
      totalQueries: this.metrics.length,
      slowQueries: this.metrics.filter((m) => m.slow).length,
      averageQueryTime: total / this.metrics.length,
      p95QueryTime: sorted[p95Index]?.duration || 0,
      p99QueryTime: sorted[p99Index]?.duration || 0,
      byCollection,
      byOperation,
    };
  }

  /**
   * Print performance report
   */
  printReport(): void {
    const stats = this.getStats();

    console.log('\n=== Query Performance Report ===');
    console.log(`Total Queries: ${stats.totalQueries}`);
    console.log(`Slow Queries: ${stats.slowQueries} (${((stats.slowQueries / stats.totalQueries) * 100).toFixed(1)}%)`);
    console.log(`Average Query Time: ${stats.averageQueryTime.toFixed(2)}ms`);
    console.log(`P95 Query Time: ${stats.p95QueryTime.toFixed(2)}ms`);
    console.log(`P99 Query Time: ${stats.p99QueryTime.toFixed(2)}ms`);

    console.log('\nBy Collection:');
    Object.entries(stats.byCollection).forEach(([collection, data]) => {
      console.log(`  ${collection}: ${data.count} queries, ${data.avgTime.toFixed(2)}ms avg`);
    });

    console.log('\nBy Operation:');
    Object.entries(stats.byOperation).forEach(([operation, data]) => {
      console.log(`  ${operation}: ${data.count} queries, ${data.avgTime.toFixed(2)}ms avg`);
    });

    const slowQueries = this.getSlowQueries();
    if (slowQueries.length > 0) {
      console.log('\nTop 5 Slowest Queries:');
      slowQueries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .forEach((query, index) => {
          console.log(
            `  ${index + 1}. ${query.operation} on ${query.collection}: ${query.duration.toFixed(2)}ms`
          );
          console.log(`     Query: ${query.query.substring(0, 80)}...`);
        });
    }
  }

  /**
   * Enable monitoring
   */
  enable(): void {
    this.enabled = true;
  }

  /**
   * Disable monitoring
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * Global query monitor instance
 */
export const globalQueryMonitor = new QueryMonitor();

/**
 * Helper to create a monitored collection wrapper
 */
export function monitoredCollection<T extends Document>(
  collection: Collection<T>,
  monitor: QueryMonitor = globalQueryMonitor
): {
  find: (filter: Filter<T>, options?: FindOptions) => Promise<{ result: T[]; metrics: QueryMetrics }>;
  findOne: (filter: Filter<T>, options?: FindOptions) => Promise<{ result: T | null; metrics: QueryMetrics }>;
  aggregate: (pipeline: Document[]) => Promise<{ result: Document[]; metrics: QueryMetrics }>;
  count: (filter: Filter<T>) => Promise<{ result: number; metrics: QueryMetrics }>;
  collection: Collection<T>;
} {
  return {
    find: (filter, options) => monitor.monitorFind(collection, filter, options),
    findOne: (filter, options) => monitor.monitorFindOne(collection, filter, options),
    aggregate: (pipeline) => monitor.monitorAggregate(collection, pipeline),
    count: (filter) => monitor.monitorCount(collection, filter),
    collection,
  };
}
