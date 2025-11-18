/**
 * Comprehensive Health Check Endpoint
 *
 * Enterprise-grade health monitoring for:
 * - Database (MongoDB)
 * - Cache (Redis)
 * - Message Queue (QStash)
 * - AI Providers (OpenAI, Anthropic, Gemini, Groq)
 * - Performance Metrics
 * - Error Tracking
 * - Memory Usage
 *
 * Used for monitoring, load balancer health checks, and uptime tracking
 */

import { NextResponse } from 'next/server';
import { healthCheckManager } from '@/lib/observability/health-checks';
import { getREDSummary } from '@/lib/observability/metrics';
import { performanceMonitor } from '@/lib/observability/performance-monitor';
import { errorTracker } from '@/lib/observability/error-tracker';
import { withHealthCheck } from '@/lib/observability/middleware';

async function handler() {
  try {
    // Get comprehensive health status
    const health = await healthCheckManager.checkAll();

    // Get RED metrics summary
    const redSummary = getREDSummary();

    // Get error summary
    const errorSummary = errorTracker.getErrorSummary();

    // Get memory usage
    const memoryUsage = performanceMonitor.getFormattedMemoryUsage();

    // Get system uptime
    const uptime = healthCheckManager.getUptime();

    // Build comprehensive health response
    const healthResponse = {
      status: health.status,
      timestamp: health.timestamp,
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / 1000 / 60),
      },
      services: health.services,
      performance: {
        memory: memoryUsage,
        topRoutes: redSummary.routes.slice(0, 10),
        aiProviders: redSummary.providers,
      },
      errors: {
        total: errorSummary.totalErrors,
        critical: errorSummary.criticalErrors,
        alertWorthy: errorSummary.alertWorthyErrors,
        byCategory: errorSummary.errorsByCategory,
        topErrors: errorSummary.topErrors,
      },
      metadata: health.metadata,
    };

    // Determine HTTP status code based on overall health
    const statusCode =
      health.status === 'healthy'
        ? 200
        : health.status === 'degraded'
        ? 200 // Return 200 for degraded but functional
        : 503; // Service unavailable for unhealthy

    return NextResponse.json(healthResponse, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Health check failed',
      },
      { status: 500 }
    );
  }
}

// Export wrapped handler (skips logging/metrics for health checks)
export const GET = withHealthCheck(handler);
