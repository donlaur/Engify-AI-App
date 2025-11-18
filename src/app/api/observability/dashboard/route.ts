/**
 * Observability Dashboard API
 *
 * Provides comprehensive observability metrics and insights:
 * - Performance metrics (RED)
 * - Error statistics
 * - Rate limit metrics
 * - Memory usage
 * - Health status
 *
 * Usage: GET /api/observability/dashboard
 */

import { NextResponse } from 'next/server';
import {
  getREDSummary,
  errorTracker,
  rateLimitTracker,
  performanceMonitor,
  healthCheckManager,
  withObservability,
} from '@/lib/observability';

async function handler(request: Request) {
  const url = new URL(request.url);
  const includeHealth = url.searchParams.get('health') !== 'false';
  const includeErrors = url.searchParams.get('errors') !== 'false';
  const includeRateLimit = url.searchParams.get('rateLimit') !== 'false';
  const includePerformance = url.searchParams.get('performance') !== 'false';

  const dashboard: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  // Health status
  if (includeHealth) {
    const health = await healthCheckManager.checkAll();
    dashboard.health = {
      status: health.status,
      services: health.services,
      uptime: healthCheckManager.getUptime(),
    };
  }

  // Performance metrics (RED)
  if (includePerformance) {
    const redSummary = getREDSummary();
    const memoryUsage = performanceMonitor.getFormattedMemoryUsage();

    dashboard.performance = {
      memory: memoryUsage,
      routes: {
        total: redSummary.routes.length,
        top10: redSummary.routes
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 10),
        slowest10: redSummary.routes
          .sort((a, b) => b.p95 - a.p95)
          .slice(0, 10),
      },
      aiProviders: {
        total: redSummary.providers.length,
        summary: redSummary.providers,
        totalCost: redSummary.providers.reduce(
          (sum, p) => sum + p.totalCost,
          0
        ),
      },
    };
  }

  // Error statistics
  if (includeErrors) {
    const errorSummary = errorTracker.getErrorSummary();
    const recentErrors = errorTracker.getRecentErrors(10);
    const alertWorthyErrors = errorTracker.getAlertWorthyErrors(10);

    dashboard.errors = {
      summary: errorSummary,
      recent: recentErrors.map((e) => ({
        category: e.category,
        severity: e.severity,
        message: e.message,
        timestamp: e.timestamp,
        alertWorthy: e.alertWorthy,
      })),
      alertWorthy: alertWorthyErrors.map((e) => ({
        category: e.category,
        severity: e.severity,
        message: e.message,
        timestamp: e.timestamp,
      })),
    };
  }

  // Rate limit metrics
  if (includeRateLimit) {
    const rateLimitSummary = rateLimitTracker.getSummary();
    const topRateLimited = rateLimitTracker.getTopRateLimited(10);
    const highUtilization = rateLimitTracker.getHighUtilization(80);

    dashboard.rateLimit = {
      summary: rateLimitSummary,
      topBlocked: topRateLimited,
      highUtilization: highUtilization,
    };
  }

  return NextResponse.json(dashboard);
}

// Export with observability (but skip metrics to avoid recursion)
export const GET = withObservability(handler, {
  operation: 'observabilityDashboard',
  skipMetrics: true,
});
