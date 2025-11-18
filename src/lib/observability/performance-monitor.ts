/**
 * Performance Monitoring Utilities
 *
 * Provides timing and performance tracking for:
 * - Database queries
 * - AI API calls
 * - Memory usage
 * - Custom operations
 *
 * Usage:
 *   import { performanceMonitor, withDbTiming, withAiTiming } from '@/lib/observability/performance-monitor';
 *
 *   const result = await withDbTiming('users', 'find', async () => {
 *     return await db.collection('users').find({}).toArray();
 *   });
 */

import { observabilityLogger } from './enhanced-logger';
import { recordRouteMetric, recordProviderMetric } from './metrics';

export interface PerformanceMetrics {
  operation: string;
  durationMs: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Memory usage snapshot
 */
export interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  timestamp: Date;
}

/**
 * Performance Monitor Class
 */
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record a performance metric
   */
  record(
    operation: string,
    durationMs: number,
    metadata?: Record<string, unknown>
  ): void {
    const metric: PerformanceMetrics = {
      operation,
      durationMs,
      timestamp: new Date(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last N metrics to prevent memory bloat
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter((m) => m.operation === operation);
    }
    return this.metrics;
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(operation: string): number | null {
    const metrics = this.getMetrics(operation);
    if (metrics.length === 0) return null;

    const total = metrics.reduce((sum, m) => sum + m.durationMs, 0);
    return total / metrics.length;
  }

  /**
   * Get p95 duration for an operation
   */
  getP95Duration(operation: string): number | null {
    const metrics = this.getMetrics(operation);
    if (metrics.length === 0) return null;

    const sorted = metrics.map((m) => m.durationMs).sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index] ?? null;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get memory usage
   */
  getMemoryUsage(): MemoryUsage {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      timestamp: new Date(),
    };
  }

  /**
   * Get memory usage in human-readable format
   */
  getFormattedMemoryUsage(): {
    heapUsed: string;
    heapTotal: string;
    external: string;
    rss: string;
  } {
    const usage = this.getMemoryUsage();
    return {
      heapUsed: this.formatBytes(usage.heapUsed),
      heapTotal: this.formatBytes(usage.heapTotal),
      external: this.formatBytes(usage.external),
      rss: this.formatBytes(usage.rss),
    };
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  /**
   * Log memory usage if it exceeds thresholds
   */
  checkMemoryThresholds(thresholds?: {
    heapUsedMB?: number;
    rssMB?: number;
  }): void {
    const usage = this.getMemoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;
    const rssMB = usage.rss / 1024 / 1024;

    const defaultThresholds = {
      heapUsedMB: 512, // 512 MB
      rssMB: 1024, // 1 GB
    };

    const finalThresholds = { ...defaultThresholds, ...thresholds };

    if (heapUsedMB > finalThresholds.heapUsedMB) {
      observabilityLogger.warn('High heap memory usage', {
        heapUsedMB: heapUsedMB.toFixed(2),
        thresholdMB: finalThresholds.heapUsedMB,
        formatted: this.getFormattedMemoryUsage(),
      });
    }

    if (rssMB > finalThresholds.rssMB) {
      observabilityLogger.warn('High RSS memory usage', {
        rssMB: rssMB.toFixed(2),
        thresholdMB: finalThresholds.rssMB,
        formatted: this.getFormattedMemoryUsage(),
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Wrapper for timing database operations
 */
export async function withDbTiming<T>(
  collection: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  const operationName = `db:${operation}:${collection}`;

  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operationName, durationMs, {
      ...metadata,
      collection,
      operation,
      success: true,
    });

    observabilityLogger.dbOperation(operation, collection, durationMs, metadata);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operationName, durationMs, {
      ...metadata,
      collection,
      operation,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    observabilityLogger.error(`Database operation failed: ${operationName}`, error, {
      collection,
      operation,
      durationMs,
      ...metadata,
    });

    throw error;
  }
}

/**
 * Wrapper for timing AI provider calls
 */
export async function withAiTiming<T>(
  provider: string,
  model: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown> & { cost?: number; tokens?: number }
): Promise<T> {
  const startTime = Date.now();
  const operationName = `ai:${provider}:${model}`;

  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operationName, durationMs, {
      ...metadata,
      provider,
      model,
      success: true,
    });

    observabilityLogger.aiProviderCall(provider, model, durationMs, true, metadata);

    // Record to metrics system
    recordProviderMetric(
      provider,
      durationMs,
      metadata?.cost || 0,
      true
    );

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operationName, durationMs, {
      ...metadata,
      provider,
      model,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    observabilityLogger.aiProviderCall(provider, model, durationMs, false, metadata);

    // Record to metrics system
    recordProviderMetric(
      provider,
      durationMs,
      metadata?.cost || 0,
      false
    );

    throw error;
  }
}

/**
 * Wrapper for timing generic operations
 */
export async function withTiming<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operation, durationMs, {
      ...metadata,
      success: true,
    });

    observabilityLogger.performance(operation, durationMs, metadata);

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;

    performanceMonitor.record(operation, durationMs, {
      ...metadata,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    observabilityLogger.error(`Operation failed: ${operation}`, error, {
      durationMs,
      ...metadata,
    });

    throw error;
  }
}

/**
 * Decorator for timing class methods
 */
export function Timed(operation?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const operationName = operation || `${target?.constructor?.name}.${propertyKey}`;

    descriptor.value = async function (...args: unknown[]) {
      return withTiming(operationName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

/**
 * Start periodic memory monitoring
 */
export function startMemoryMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
  return setInterval(() => {
    performanceMonitor.checkMemoryThresholds();
    observabilityLogger.debug('Memory usage', {
      ...performanceMonitor.getFormattedMemoryUsage(),
    });
  }, intervalMs);
}
