/**
 * Cache Performance Metrics and Monitoring
 *
 * Enhanced cache monitoring with hit/miss tracking, warming strategies,
 * and performance analytics.
 */

import { CacheManager } from '@/lib/cache/CacheManager';

/**
 * Cache metrics
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  missRate: number;
  averageGetTime: number;
  averageSetTime: number;
  totalKeys: number;
  memoryUsage: number;
  timestamp: Date;
}

/**
 * Cache operation timing
 */
export interface CacheOperationTiming {
  operation: 'get' | 'set' | 'delete';
  key: string;
  duration: number;
  hit?: boolean;
  timestamp: Date;
}

/**
 * Cache warming strategy
 */
export interface CacheWarmingStrategy {
  keys: string[];
  fetcher: (key: string) => Promise<unknown>;
  ttl?: number;
  parallel?: boolean;
  batchSize?: number;
}

/**
 * Cache Performance Monitor
 * Tracks cache performance metrics and provides warming capabilities
 */
export class CachePerformanceMonitor {
  private metrics: CacheMetrics;
  private operations: CacheOperationTiming[] = [];
  private maxOperations = 1000;

  constructor() {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      missRate: 0,
      averageGetTime: 0,
      averageSetTime: 0,
      totalKeys: 0,
      memoryUsage: 0,
      timestamp: new Date(),
    };
  }

  /**
   * Track a cache operation
   */
  trackOperation(operation: CacheOperationTiming): void {
    this.operations.push(operation);

    // Keep only recent operations
    if (this.operations.length > this.maxOperations) {
      this.operations = this.operations.slice(-this.maxOperations);
    }

    // Update metrics
    if (operation.operation === 'get') {
      if (operation.hit) {
        this.metrics.hits++;
      } else {
        this.metrics.misses++;
      }
    } else if (operation.operation === 'set') {
      this.metrics.sets++;
    } else if (operation.operation === 'delete') {
      this.metrics.deletes++;
    }

    this.updateRates();
    this.updateAverageTimes();
  }

  /**
   * Update hit/miss rates
   */
  private updateRates(): void {
    const total = this.metrics.hits + this.metrics.misses;
    if (total > 0) {
      this.metrics.hitRate = this.metrics.hits / total;
      this.metrics.missRate = this.metrics.misses / total;
    }
  }

  /**
   * Update average operation times
   */
  private updateAverageTimes(): void {
    const gets = this.operations.filter((o) => o.operation === 'get');
    const sets = this.operations.filter((o) => o.operation === 'set');

    if (gets.length > 0) {
      this.metrics.averageGetTime =
        gets.reduce((sum, o) => sum + o.duration, 0) / gets.length;
    }

    if (sets.length > 0) {
      this.metrics.averageSetTime =
        sets.reduce((sum, o) => sum + o.duration, 0) / sets.length;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CacheMetrics {
    return {
      ...this.metrics,
      timestamp: new Date(),
    };
  }

  /**
   * Get metrics for a specific time window
   */
  getMetricsWindow(minutes: number): CacheMetrics {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentOps = this.operations.filter((o) => o.timestamp >= cutoff);

    const hits = recentOps.filter(
      (o) => o.operation === 'get' && o.hit
    ).length;
    const misses = recentOps.filter(
      (o) => o.operation === 'get' && !o.hit
    ).length;
    const sets = recentOps.filter((o) => o.operation === 'set').length;
    const deletes = recentOps.filter((o) => o.operation === 'delete').length;

    const total = hits + misses;
    const hitRate = total > 0 ? hits / total : 0;
    const missRate = total > 0 ? misses / total : 0;

    const gets = recentOps.filter((o) => o.operation === 'get');
    const setsOps = recentOps.filter((o) => o.operation === 'set');

    const averageGetTime =
      gets.length > 0
        ? gets.reduce((sum, o) => sum + o.duration, 0) / gets.length
        : 0;
    const averageSetTime =
      setsOps.length > 0
        ? setsOps.reduce((sum, o) => sum + o.duration, 0) / setsOps.length
        : 0;

    return {
      hits,
      misses,
      sets,
      deletes,
      evictions: 0,
      hitRate,
      missRate,
      averageGetTime,
      averageSetTime,
      totalKeys: this.metrics.totalKeys,
      memoryUsage: this.metrics.memoryUsage,
      timestamp: new Date(),
    };
  }

  /**
   * Print metrics report
   */
  printReport(): void {
    const metrics = this.getMetrics();

    console.log('\n=== Cache Performance Report ===');
    console.log(`Total Keys: ${metrics.totalKeys}`);
    console.log(`Hits: ${metrics.hits}`);
    console.log(`Misses: ${metrics.misses}`);
    console.log(`Hit Rate: ${(metrics.hitRate * 100).toFixed(2)}%`);
    console.log(`Miss Rate: ${(metrics.missRate * 100).toFixed(2)}%`);
    console.log(`Sets: ${metrics.sets}`);
    console.log(`Deletes: ${metrics.deletes}`);
    console.log(`Evictions: ${metrics.evictions}`);
    console.log(`Average Get Time: ${metrics.averageGetTime.toFixed(2)}ms`);
    console.log(`Average Set Time: ${metrics.averageSetTime.toFixed(2)}ms`);
    console.log(`Memory Usage: ${this.formatBytes(metrics.memoryUsage)}`);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  /**
   * Reset metrics
   */
  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      missRate: 0,
      averageGetTime: 0,
      averageSetTime: 0,
      totalKeys: 0,
      memoryUsage: 0,
      timestamp: new Date(),
    };
    this.operations = [];
  }

  /**
   * Get slow operations
   */
  getSlowOperations(threshold: number = 100): CacheOperationTiming[] {
    return this.operations.filter((o) => o.duration > threshold);
  }

  /**
   * Get most accessed keys
   */
  getMostAccessedKeys(limit: number = 10): Array<{ key: string; count: number }> {
    const keyCounts = new Map<string, number>();

    this.operations.forEach((o) => {
      if (o.operation === 'get') {
        keyCounts.set(o.key, (keyCounts.get(o.key) || 0) + 1);
      }
    });

    return Array.from(keyCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, count]) => ({ key, count }));
  }

  /**
   * Get cache efficiency score (0-100)
   */
  getEfficiencyScore(): number {
    const hitRateScore = this.metrics.hitRate * 50; // Max 50 points
    const speedScore = Math.max(0, 50 - this.metrics.averageGetTime / 2); // Max 50 points
    return Math.min(100, hitRateScore + speedScore);
  }
}

/**
 * Cache Warmer
 * Preloads cache with frequently accessed data
 */
export class CacheWarmer {
  constructor(private cacheManager: CacheManager) {}

  /**
   * Warm cache with a warming strategy
   */
  async warm(strategy: CacheWarmingStrategy): Promise<{
    successful: number;
    failed: number;
    totalTime: number;
  }> {
    const startTime = performance.now();
    let successful = 0;
    let failed = 0;

    console.log(`[CacheWarmer] Warming ${strategy.keys.length} keys...`);

    if (strategy.parallel) {
      // Process in batches
      const batchSize = strategy.batchSize || 10;
      for (let i = 0; i < strategy.keys.length; i += batchSize) {
        const batch = strategy.keys.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map((key) => this.warmKey(key, strategy.fetcher, strategy.ttl))
        );

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successful++;
          } else {
            failed++;
          }
        });
      }
    } else {
      // Process sequentially
      for (const key of strategy.keys) {
        try {
          await this.warmKey(key, strategy.fetcher, strategy.ttl);
          successful++;
        } catch (error) {
          console.error(`[CacheWarmer] Failed to warm key "${key}":`, error);
          failed++;
        }
      }
    }

    const totalTime = performance.now() - startTime;

    console.log(
      `[CacheWarmer] Completed: ${successful} successful, ${failed} failed, ${totalTime.toFixed(2)}ms`
    );

    return { successful, failed, totalTime };
  }

  /**
   * Warm a single cache key
   */
  private async warmKey(
    key: string,
    fetcher: (key: string) => Promise<unknown>,
    ttl?: number
  ): Promise<void> {
    try {
      // Check if already cached
      const exists = await this.cacheManager.exists(key);
      if (exists) {
        console.debug(`[CacheWarmer] Key "${key}" already cached, skipping`);
        return;
      }

      // Fetch and cache
      const value = await fetcher(key);
      await this.cacheManager.set(key, value, { ttl });

      console.debug(`[CacheWarmer] Warmed key "${key}"`);
    } catch (error) {
      console.error(`[CacheWarmer] Failed to warm key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Warm cache for critical data paths
   */
  async warmCriticalPaths(): Promise<void> {
    console.log('[CacheWarmer] Warming critical paths...');

    // Example: Warm frequently accessed prompts
    await this.warm({
      keys: ['prompts:featured', 'prompts:popular', 'patterns:all'],
      fetcher: async (key) => {
        // Mock fetcher - replace with actual data fetching
        console.log(`Fetching ${key}...`);
        return { key, data: 'cached' };
      },
      ttl: 3600,
      parallel: true,
      batchSize: 5,
    });
  }

  /**
   * Schedule periodic cache warming
   */
  scheduleWarming(
    strategy: CacheWarmingStrategy,
    intervalMinutes: number
  ): NodeJS.Timeout {
    console.log(
      `[CacheWarmer] Scheduling warming every ${intervalMinutes} minutes`
    );

    return setInterval(
      () => {
        this.warm(strategy).catch((error) => {
          console.error('[CacheWarmer] Scheduled warming failed:', error);
        });
      },
      intervalMinutes * 60 * 1000
    );
  }
}

/**
 * Create a monitored cache manager wrapper
 */
export function createMonitoredCache(
  cacheManager: CacheManager,
  monitor: CachePerformanceMonitor = new CachePerformanceMonitor()
): {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, options?: { ttl?: number }) => Promise<void>;
  delete: (key: string) => Promise<boolean>;
  getMonitor: () => CachePerformanceMonitor;
  getWarmer: () => CacheWarmer;
} {
  const warmer = new CacheWarmer(cacheManager);

  return {
    get: async <T>(key: string): Promise<T | null> => {
      const start = performance.now();
      const value = await cacheManager.get<T>(key);
      const duration = performance.now() - start;

      monitor.trackOperation({
        operation: 'get',
        key,
        duration,
        hit: value !== null,
        timestamp: new Date(),
      });

      return value;
    },

    set: async <T>(
      key: string,
      value: T,
      options?: { ttl?: number }
    ): Promise<void> => {
      const start = performance.now();
      await cacheManager.set(key, value, options);
      const duration = performance.now() - start;

      monitor.trackOperation({
        operation: 'set',
        key,
        duration,
        timestamp: new Date(),
      });
    },

    delete: async (key: string): Promise<boolean> => {
      const start = performance.now();
      const result = await cacheManager.delete(key);
      const duration = performance.now() - start;

      monitor.trackOperation({
        operation: 'delete',
        key,
        duration,
        timestamp: new Date(),
      });

      return result;
    },

    getMonitor: () => monitor,
    getWarmer: () => warmer,
  };
}

/**
 * Global cache performance monitor
 */
export const globalCacheMonitor = new CachePerformanceMonitor();

/**
 * Cache invalidation strategies
 */
export class CacheInvalidationStrategy {
  constructor(private cacheManager: CacheManager) {}

  /**
   * Time-based invalidation
   */
  async invalidateByTime(maxAge: number): Promise<number> {
    // This would require storing timestamps with cache entries
    // For now, this is a placeholder
    console.log(`[Cache] Invalidating entries older than ${maxAge}ms`);
    return 0;
  }

  /**
   * Tag-based invalidation
   */
  async invalidateByTag(tag: string): Promise<void> {
    await this.cacheManager.invalidateByTag(tag);
    console.log(`[Cache] Invalidated all entries with tag: ${tag}`);
  }

  /**
   * Pattern-based invalidation
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    await this.cacheManager.invalidateByPattern(pattern);
    console.log(`[Cache] Invalidated all entries matching pattern: ${pattern}`);
  }

  /**
   * Dependency-based invalidation
   */
  async invalidateByDependencies(
    key: string,
    dependencies: string[]
  ): Promise<void> {
    // Delete the main key and all its dependencies
    await this.cacheManager.delete(key);
    await Promise.all(dependencies.map((dep) => this.cacheManager.delete(dep)));
    console.log(
      `[Cache] Invalidated ${key} and ${dependencies.length} dependencies`
    );
  }

  /**
   * LRU-based invalidation (least recently used)
   */
  async invalidateLRU(maxKeys: number): Promise<number> {
    // This would require tracking access times
    // For now, this is a placeholder
    console.log(`[Cache] Would invalidate LRU to maintain ${maxKeys} keys`);
    return 0;
  }
}
