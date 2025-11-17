/**
 * Performance Benchmarking Utilities
 *
 * Provides comprehensive performance measurement, benchmarking, and profiling tools
 * for database queries, API endpoints, and general code execution.
 */

import { performance, PerformanceObserver } from 'perf_hooks';

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  name: string;
  operations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
  stdDev: number;
  percentiles: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics for a single operation
 */
export interface PerformanceMetrics {
  duration: number;
  memoryUsed: number;
  cpuTime?: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Benchmark options
 */
export interface BenchmarkOptions {
  iterations?: number;
  warmupIterations?: number;
  minSampleSize?: number;
  maxTime?: number; // Max time in ms
  async?: boolean;
  beforeEach?: () => void | Promise<void>;
  afterEach?: () => void | Promise<void>;
  metadata?: Record<string, unknown>;
}

/**
 * Performance Timer
 * Simple timer for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  private marks: Map<string, number> = new Map();

  /**
   * Start the timer
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * Stop the timer
   */
  stop(): number {
    this.endTime = performance.now();
    return this.elapsed();
  }

  /**
   * Get elapsed time in milliseconds
   */
  elapsed(): number {
    const end = this.endTime || performance.now();
    return end - this.startTime;
  }

  /**
   * Mark a point in time
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * Measure time between two marks
   */
  measure(startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    if (!start) {
      throw new Error(`Mark "${startMark}" not found`);
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (endMark && !end) {
      throw new Error(`Mark "${endMark}" not found`);
    }

    return (end as number) - start;
  }

  /**
   * Get all marks
   */
  getMarks(): Record<string, number> {
    return Object.fromEntries(this.marks.entries());
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.startTime = 0;
    this.endTime = 0;
    this.marks.clear();
  }
}

/**
 * Memory Profiler
 * Track memory usage during execution
 */
export class MemoryProfiler {
  private initialMemory: NodeJS.MemoryUsage;
  private samples: NodeJS.MemoryUsage[] = [];

  constructor() {
    this.initialMemory = process.memoryUsage();
  }

  /**
   * Take a memory snapshot
   */
  snapshot(): NodeJS.MemoryUsage {
    const usage = process.memoryUsage();
    this.samples.push(usage);
    return usage;
  }

  /**
   * Get memory delta from initial state
   */
  getDelta(): {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  } {
    const current = process.memoryUsage();
    return {
      rss: current.rss - this.initialMemory.rss,
      heapTotal: current.heapTotal - this.initialMemory.heapTotal,
      heapUsed: current.heapUsed - this.initialMemory.heapUsed,
      external: current.external - this.initialMemory.external,
    };
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    initial: NodeJS.MemoryUsage;
    current: NodeJS.MemoryUsage;
    delta: ReturnType<MemoryProfiler['getDelta']>;
    peak: NodeJS.MemoryUsage;
    average: {
      heapUsed: number;
      heapTotal: number;
    };
  } {
    const current = process.memoryUsage();
    const delta = this.getDelta();

    // Calculate peak memory
    const peak = this.samples.reduce(
      (max, sample) => ({
        rss: Math.max(max.rss, sample.rss),
        heapTotal: Math.max(max.heapTotal, sample.heapTotal),
        heapUsed: Math.max(max.heapUsed, sample.heapUsed),
        external: Math.max(max.external, sample.external),
        arrayBuffers: Math.max(max.arrayBuffers, sample.arrayBuffers),
      }),
      this.initialMemory
    );

    // Calculate average
    const average = {
      heapUsed:
        this.samples.reduce((sum, s) => sum + s.heapUsed, 0) /
        (this.samples.length || 1),
      heapTotal:
        this.samples.reduce((sum, s) => sum + s.heapTotal, 0) /
        (this.samples.length || 1),
    };

    return {
      initial: this.initialMemory,
      current,
      delta,
      peak,
      average,
    };
  }

  /**
   * Format bytes to human-readable string
   */
  static formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * Benchmark Runner
 * Run performance benchmarks with statistical analysis
 */
export class BenchmarkRunner {
  private observer: PerformanceObserver | null = null;

  constructor() {
    // Setup performance observer if available
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          console.debug(`Performance: ${entry.name} - ${entry.duration}ms`);
        });
      });
      this.observer.observe({ entryTypes: ['measure'] });
    }
  }

  /**
   * Run a benchmark
   */
  async run(
    name: string,
    fn: () => void | Promise<void>,
    options: BenchmarkOptions = {}
  ): Promise<BenchmarkResult> {
    const {
      iterations = 100,
      warmupIterations = 10,
      minSampleSize = 10,
      maxTime = 10000,
      async: isAsync = false,
      beforeEach,
      afterEach,
      metadata,
    } = options;

    // Warmup phase
    console.log(`[Benchmark] Warming up "${name}" (${warmupIterations} iterations)...`);
    for (let i = 0; i < warmupIterations; i++) {
      if (beforeEach) await beforeEach();
      if (isAsync) {
        await fn();
      } else {
        fn();
      }
      if (afterEach) await afterEach();
    }

    // Benchmark phase
    console.log(`[Benchmark] Running "${name}" (${iterations} iterations)...`);
    const times: number[] = [];
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      // Check if we've exceeded max time
      if (performance.now() - startTime > maxTime && i >= minSampleSize) {
        console.log(`[Benchmark] Stopping "${name}" early (max time reached, ${i} samples)`);
        break;
      }

      if (beforeEach) await beforeEach();

      const timer = new PerformanceTimer();
      timer.start();

      if (isAsync) {
        await fn();
      } else {
        fn();
      }

      const elapsed = timer.stop();
      times.push(elapsed);

      if (afterEach) await afterEach();
    }

    return this.analyzeResults(name, times, metadata);
  }

  /**
   * Run multiple benchmarks and compare
   */
  async compare(
    benchmarks: Array<{
      name: string;
      fn: () => void | Promise<void>;
      options?: BenchmarkOptions;
    }>
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];

    for (const benchmark of benchmarks) {
      const result = await this.run(
        benchmark.name,
        benchmark.fn,
        benchmark.options
      );
      results.push(result);
    }

    // Sort by average time (fastest first)
    results.sort((a, b) => a.averageTime - b.averageTime);

    // Print comparison
    console.log('\n=== Benchmark Comparison ===');
    const fastest = results[0];
    results.forEach((result, index) => {
      const ratio = result.averageTime / fastest.averageTime;
      const slower = ratio > 1 ? ` (${ratio.toFixed(2)}x slower)` : ' (fastest)';
      console.log(
        `${index + 1}. ${result.name}: ${result.averageTime.toFixed(3)}ms${slower}`
      );
    });

    return results;
  }

  /**
   * Analyze benchmark results
   */
  private analyzeResults(
    name: string,
    times: number[],
    metadata?: Record<string, unknown>
  ): BenchmarkResult {
    const sorted = [...times].sort((a, b) => a - b);
    const total = times.reduce((sum, t) => sum + t, 0);
    const average = total / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    // Calculate standard deviation
    const variance =
      times.reduce((sum, t) => sum + Math.pow(t - average, 2), 0) /
      times.length;
    const stdDev = Math.sqrt(variance);

    // Calculate percentiles
    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[index];
    };

    const result: BenchmarkResult = {
      name,
      operations: times.length,
      totalTime: total,
      averageTime: average,
      minTime: min,
      maxTime: max,
      opsPerSecond: 1000 / average,
      stdDev,
      percentiles: {
        p50: percentile(50),
        p75: percentile(75),
        p90: percentile(90),
        p95: percentile(95),
        p99: percentile(99),
      },
      timestamp: new Date(),
      metadata,
    };

    this.printResults(result);
    return result;
  }

  /**
   * Print benchmark results
   */
  private printResults(result: BenchmarkResult): void {
    console.log(`\n=== Benchmark Results: ${result.name} ===`);
    console.log(`Operations: ${result.operations}`);
    console.log(`Total Time: ${result.totalTime.toFixed(2)}ms`);
    console.log(`Average Time: ${result.averageTime.toFixed(3)}ms`);
    console.log(`Min Time: ${result.minTime.toFixed(3)}ms`);
    console.log(`Max Time: ${result.maxTime.toFixed(3)}ms`);
    console.log(`Ops/sec: ${result.opsPerSecond.toFixed(2)}`);
    console.log(`Std Dev: ${result.stdDev.toFixed(3)}ms`);
    console.log('\nPercentiles:');
    console.log(`  p50 (median): ${result.percentiles.p50.toFixed(3)}ms`);
    console.log(`  p75: ${result.percentiles.p75.toFixed(3)}ms`);
    console.log(`  p90: ${result.percentiles.p90.toFixed(3)}ms`);
    console.log(`  p95: ${result.percentiles.p95.toFixed(3)}ms`);
    console.log(`  p99: ${result.percentiles.p99.toFixed(3)}ms`);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Simple time measurement decorator
 */
export function measure(target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    const timer = new PerformanceTimer();
    timer.start();

    try {
      const result = await originalMethod.apply(this, args);
      const elapsed = timer.stop();
      console.log(`[Performance] ${propertyKey} took ${elapsed.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const elapsed = timer.stop();
      console.error(`[Performance] ${propertyKey} failed after ${elapsed.toFixed(2)}ms`);
      throw error;
    }
  };

  return descriptor;
}

/**
 * Measure execution time of a function
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const timer = new PerformanceTimer();
  const profiler = new MemoryProfiler();

  timer.start();
  const result = await fn();
  const duration = timer.stop();

  const memStats = profiler.getStats();

  const metrics: PerformanceMetrics = {
    duration,
    memoryUsed: memStats.delta.heapUsed,
    timestamp: new Date(),
    context: { name },
  };

  return { result, metrics };
}

/**
 * Measure execution time of a synchronous function
 */
export function measureSync<T>(
  name: string,
  fn: () => T
): { result: T; metrics: PerformanceMetrics } {
  const timer = new PerformanceTimer();
  const profiler = new MemoryProfiler();

  timer.start();
  const result = fn();
  const duration = timer.stop();

  const memStats = profiler.getStats();

  const metrics: PerformanceMetrics = {
    duration,
    memoryUsed: memStats.delta.heapUsed,
    timestamp: new Date(),
    context: { name },
  };

  return { result, metrics };
}

/**
 * Create a performance snapshot
 */
export function createSnapshot(): {
  memory: NodeJS.MemoryUsage;
  timestamp: Date;
} {
  return {
    memory: process.memoryUsage(),
    timestamp: new Date(),
  };
}

/**
 * Compare two performance snapshots
 */
export function compareSnapshots(
  before: ReturnType<typeof createSnapshot>,
  after: ReturnType<typeof createSnapshot>
): {
  duration: number;
  memoryDelta: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
} {
  return {
    duration: after.timestamp.getTime() - before.timestamp.getTime(),
    memoryDelta: {
      rss: after.memory.rss - before.memory.rss,
      heapTotal: after.memory.heapTotal - before.memory.heapTotal,
      heapUsed: after.memory.heapUsed - before.memory.heapUsed,
      external: after.memory.external - before.memory.external,
    },
  };
}
