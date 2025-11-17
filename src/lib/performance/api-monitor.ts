/**
 * API Endpoint Performance Monitoring
 *
 * Tracks API endpoint response times, request rates, and performance metrics.
 * Provides middleware for automatic monitoring and performance budgets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { PerformanceTimer } from './benchmark';

/**
 * API endpoint metrics
 */
export interface ApiMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  requestSize?: number;
  responseSize?: number;
  userAgent?: string;
  ip?: string;
  error?: string;
}

/**
 * Performance budget
 */
export interface PerformanceBudget {
  path: string | RegExp;
  maxDuration: number; // ms
  p95Duration?: number; // ms
  p99Duration?: number; // ms
}

/**
 * Endpoint statistics
 */
export interface EndpointStats {
  path: string;
  requestCount: number;
  errorCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;
  p99Duration: number;
  budgetViolations: number;
  lastRequest: Date;
}

/**
 * API Monitor
 * Monitors and analyzes API endpoint performance
 */
export class ApiMonitor {
  private metrics: ApiMetrics[] = [];
  private budgets: PerformanceBudget[] = [];
  private maxMetrics = 10000;
  private enabled = true;

  /**
   * Track an API request
   */
  track(metrics: ApiMetrics): void {
    if (!this.enabled) return;

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check performance budgets
    this.checkBudgets(metrics);

    // Log slow requests
    if (metrics.duration > 1000) {
      console.warn(
        `[ApiMonitor] Slow request: ${metrics.method} ${metrics.path} took ${metrics.duration.toFixed(2)}ms`
      );
    }

    // Log errors
    if (metrics.statusCode >= 500) {
      console.error(
        `[ApiMonitor] Server error: ${metrics.method} ${metrics.path} returned ${metrics.statusCode}`
      );
    }
  }

  /**
   * Add performance budget
   */
  addBudget(budget: PerformanceBudget): void {
    this.budgets.push(budget);
  }

  /**
   * Check if request violates performance budgets
   */
  private checkBudgets(metrics: ApiMetrics): void {
    for (const budget of this.budgets) {
      const matches =
        typeof budget.path === 'string'
          ? metrics.path === budget.path
          : budget.path.test(metrics.path);

      if (matches && metrics.duration > budget.maxDuration) {
        console.warn(
          `[ApiMonitor] Performance budget violation: ${metrics.path} took ${metrics.duration.toFixed(2)}ms (budget: ${budget.maxDuration}ms)`
        );
      }
    }
  }

  /**
   * Get metrics for a specific path
   */
  getPathMetrics(path: string): ApiMetrics[] {
    return this.metrics.filter((m) => m.path === path);
  }

  /**
   * Get statistics for a specific path
   */
  getPathStats(path: string): EndpointStats | null {
    const pathMetrics = this.getPathMetrics(path);
    if (pathMetrics.length === 0) return null;

    return this.calculateStats(path, pathMetrics);
  }

  /**
   * Get statistics for all endpoints
   */
  getAllStats(): EndpointStats[] {
    const pathGroups = new Map<string, ApiMetrics[]>();

    // Group metrics by path
    this.metrics.forEach((m) => {
      if (!pathGroups.has(m.path)) {
        pathGroups.set(m.path, []);
      }
      pathGroups.get(m.path)!.push(m);
    });

    // Calculate stats for each path
    return Array.from(pathGroups.entries()).map(([path, metrics]) =>
      this.calculateStats(path, metrics)
    );
  }

  /**
   * Calculate statistics for a set of metrics
   */
  private calculateStats(path: string, metrics: ApiMetrics[]): EndpointStats {
    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);

    // Calculate percentiles
    const p50Index = Math.floor(durations.length * 0.5);
    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // Count budget violations
    const budgetViolations = this.budgets
      .filter((b) => {
        const matches =
          typeof b.path === 'string' ? path === b.path : b.path.test(path);
        return matches;
      })
      .reduce((count, budget) => {
        return (
          count +
          metrics.filter((m) => m.duration > budget.maxDuration).length
        );
      }, 0);

    return {
      path,
      requestCount: metrics.length,
      errorCount: metrics.filter((m) => m.statusCode >= 500).length,
      averageDuration: total / metrics.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p50Duration: durations[p50Index] || 0,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      budgetViolations,
      lastRequest: new Date(
        Math.max(...metrics.map((m) => m.timestamp.getTime()))
      ),
    };
  }

  /**
   * Get overall statistics
   */
  getOverallStats(): {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    requestsPerMinute: number;
    slowestEndpoints: Array<{ path: string; avgDuration: number }>;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        totalErrors: 0,
        errorRate: 0,
        averageDuration: 0,
        p95Duration: 0,
        p99Duration: 0,
        requestsPerMinute: 0,
        slowestEndpoints: [],
      };
    }

    const durations = this.metrics
      .map((m) => m.duration)
      .sort((a, b) => a - b);
    const total = durations.reduce((sum, d) => sum + d, 0);

    const p95Index = Math.floor(durations.length * 0.95);
    const p99Index = Math.floor(durations.length * 0.99);

    // Calculate requests per minute
    const oldestRequest = new Date(
      Math.min(...this.metrics.map((m) => m.timestamp.getTime()))
    );
    const newestRequest = new Date(
      Math.max(...this.metrics.map((m) => m.timestamp.getTime()))
    );
    const timeRangeMinutes =
      (newestRequest.getTime() - oldestRequest.getTime()) / 1000 / 60;
    const requestsPerMinute =
      timeRangeMinutes > 0 ? this.metrics.length / timeRangeMinutes : 0;

    // Get slowest endpoints
    const endpointStats = this.getAllStats();
    const slowestEndpoints = endpointStats
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 5)
      .map((s) => ({
        path: s.path,
        avgDuration: s.averageDuration,
      }));

    return {
      totalRequests: this.metrics.length,
      totalErrors: this.metrics.filter((m) => m.statusCode >= 500).length,
      errorRate: this.metrics.filter((m) => m.statusCode >= 500).length / this.metrics.length,
      averageDuration: total / this.metrics.length,
      p95Duration: durations[p95Index] || 0,
      p99Duration: durations[p99Index] || 0,
      requestsPerMinute,
      slowestEndpoints,
    };
  }

  /**
   * Print performance report
   */
  printReport(): void {
    const stats = this.getOverallStats();

    console.log('\n=== API Performance Report ===');
    console.log(`Total Requests: ${stats.totalRequests}`);
    console.log(`Total Errors: ${stats.totalErrors} (${(stats.errorRate * 100).toFixed(2)}%)`);
    console.log(`Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`P95 Duration: ${stats.p95Duration.toFixed(2)}ms`);
    console.log(`P99 Duration: ${stats.p99Duration.toFixed(2)}ms`);
    console.log(`Requests/min: ${stats.requestsPerMinute.toFixed(2)}`);

    if (stats.slowestEndpoints.length > 0) {
      console.log('\nSlowest Endpoints:');
      stats.slowestEndpoints.forEach((endpoint, index) => {
        console.log(
          `  ${index + 1}. ${endpoint.path}: ${endpoint.avgDuration.toFixed(2)}ms avg`
        );
      });
    }

    const endpointStats = this.getAllStats();
    const withViolations = endpointStats.filter((s) => s.budgetViolations > 0);
    if (withViolations.length > 0) {
      console.log('\nBudget Violations:');
      withViolations.forEach((endpoint) => {
        console.log(
          `  ${endpoint.path}: ${endpoint.budgetViolations} violations`
        );
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

  /**
   * Get all metrics
   */
  getMetrics(): ApiMetrics[] {
    return [...this.metrics];
  }
}

/**
 * Global API monitor instance
 */
export const globalApiMonitor = new ApiMonitor();

/**
 * Performance monitoring middleware for Next.js API routes
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  options: { path?: string; budget?: number } = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const timer = new PerformanceTimer();
    timer.start();

    const path = options.path || req.nextUrl.pathname;
    const method = req.method;

    let statusCode = 200;
    let error: string | undefined;

    try {
      const response = await handler(req);
      statusCode = response.status;

      const duration = timer.stop();

      // Track metrics
      globalApiMonitor.track({
        path,
        method,
        statusCode,
        duration,
        timestamp: new Date(),
        userAgent: req.headers.get('user-agent') || undefined,
      });

      // Add performance headers
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      response.headers.set('X-Response-Time-Ms', duration.toString());

      return response;
    } catch (err) {
      statusCode = 500;
      error = err instanceof Error ? err.message : 'Unknown error';

      const duration = timer.stop();

      globalApiMonitor.track({
        path,
        method,
        statusCode,
        duration,
        timestamp: new Date(),
        error,
      });

      throw err;
    }
  };
}

/**
 * Create a performance monitoring wrapper for route handlers
 */
export function monitoredRoute(
  handler: (req: NextRequest, context?: { params: Record<string, string> }) => Promise<NextResponse>,
  config?: { budget?: number; name?: string }
) {
  return async (
    req: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const timer = new PerformanceTimer();
    timer.start();

    const path = config?.name || req.nextUrl.pathname;
    const method = req.method;

    let statusCode = 200;
    let error: string | undefined;

    try {
      const response = await handler(req, context);
      statusCode = response.status;

      const duration = timer.stop();

      // Track metrics
      globalApiMonitor.track({
        path,
        method,
        statusCode,
        duration,
        timestamp: new Date(),
        userAgent: req.headers.get('user-agent') || undefined,
      });

      // Check budget
      if (config?.budget && duration > config.budget) {
        console.warn(
          `[Performance] Budget exceeded for ${path}: ${duration.toFixed(2)}ms > ${config.budget}ms`
        );
      }

      // Add performance headers
      response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
      response.headers.set('X-Response-Time-Ms', duration.toString());

      return response;
    } catch (err) {
      statusCode = 500;
      error = err instanceof Error ? err.message : 'Unknown error';

      const duration = timer.stop();

      globalApiMonitor.track({
        path,
        method,
        statusCode,
        duration,
        timestamp: new Date(),
        error,
      });

      throw err;
    }
  };
}

/**
 * Set default performance budgets for common routes
 */
export function setDefaultBudgets(): void {
  globalApiMonitor.addBudget({ path: '/api/prompts', maxDuration: 500 });
  globalApiMonitor.addBudget({ path: '/api/patterns', maxDuration: 500 });
  globalApiMonitor.addBudget({ path: /^\/api\/prompts\/[^/]+$/, maxDuration: 200 });
  globalApiMonitor.addBudget({ path: '/api/health', maxDuration: 100 });
  globalApiMonitor.addBudget({ path: '/api/stats', maxDuration: 300 });
}
