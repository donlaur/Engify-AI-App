/**
 * Observability Module - Central Export
 *
 * Comprehensive enterprise observability infrastructure including:
 * - Request context and tracing
 * - Enhanced structured logging
 * - Performance monitoring
 * - Health checks
 * - Error tracking
 * - Metrics collection
 * - Middleware for automatic instrumentation
 *
 * Quick Start:
 *   import { observabilityLogger, withObservability } from '@/lib/observability';
 *
 * @module observability
 */

// Request Context and Tracing
export {
  RequestContext,
  getRequestIdFromHeaders,
  createRequestContext,
} from './request-context';
export type { RequestContextData } from './request-context';

// Enhanced Logging
export {
  observabilityLogger,
  withPerformanceLogging,
} from './enhanced-logger';
export type {
  PerformanceThresholds,
  BusinessMetric,
} from './enhanced-logger';

// Health Checks
export { healthCheckManager } from './health-checks';
export type {
  HealthStatus,
  ServiceHealth,
  OverallHealth,
} from './health-checks';

// Performance Monitoring
export {
  performanceMonitor,
  withDbTiming,
  withAiTiming,
  withTiming,
  Timed,
  startMemoryMonitoring,
} from './performance-monitor';
export type {
  PerformanceMetrics,
  MemoryUsage,
} from './performance-monitor';

// Error Tracking
export {
  errorTracker,
  categorizeError,
  withErrorTracking,
  ErrorCategory,
  ErrorSeverity,
} from './error-tracker';
export type {
  CategorizedError,
  ErrorStats,
} from './error-tracker';

// Metrics (RED)
export {
  recordRouteMetric,
  recordProviderMetric,
  getRouteMetrics,
  getProviderMetrics,
  getREDSummary,
  resetMetrics,
} from './metrics';
export type {
  RouteMetrics,
  ProviderMetrics,
} from './metrics';

// Middleware
export {
  withObservability,
  observabilityMiddleware,
  getUserIdFromSession,
  withRateLimit,
  withHealthCheck,
} from './middleware';
export type {
  ObservabilityOptions,
} from './middleware';

// Rate Limit Tracking
export { rateLimitTracker } from './rate-limit-tracker';
export type {
  RateLimitMetric,
  RateLimitStats,
} from './rate-limit-tracker';

/**
 * Initialize observability monitoring
 *
 * Call this in your application startup to enable:
 * - Memory monitoring
 * - Error tracking cleanup
 */
export function initializeObservability(options?: {
  memoryMonitoringIntervalMs?: number;
  errorCleanupIntervalMs?: number;
  rateLimitCleanupIntervalMs?: number;
}): {
  memoryMonitor?: NodeJS.Timeout;
  errorCleanup?: NodeJS.Timeout;
  rateLimitCleanup?: NodeJS.Timeout;
} {
  const timers: {
    memoryMonitor?: NodeJS.Timeout;
    errorCleanup?: NodeJS.Timeout;
    rateLimitCleanup?: NodeJS.Timeout;
  } = {};

  // Start memory monitoring (default: every 60 seconds)
  if (options?.memoryMonitoringIntervalMs !== 0) {
    const { startMemoryMonitoring } = require('./performance-monitor');
    timers.memoryMonitor = startMemoryMonitoring(
      options?.memoryMonitoringIntervalMs || 60000
    );
  }

  // Start error tracker cleanup (default: every 60 seconds)
  if (options?.errorCleanupIntervalMs !== 0) {
    const { errorTracker } = require('./error-tracker');
    timers.errorCleanup = errorTracker.startCleanup(
      options?.errorCleanupIntervalMs || 60000
    );
  }

  // Start rate limit cleanup (default: every 5 minutes)
  if (options?.rateLimitCleanupIntervalMs !== 0) {
    const { rateLimitTracker } = require('./rate-limit-tracker');
    timers.rateLimitCleanup = rateLimitTracker.startCleanup(
      options?.rateLimitCleanupIntervalMs || 300000
    );
  }

  return timers;
}

/**
 * Shutdown observability monitoring
 */
export function shutdownObservability(timers: {
  memoryMonitor?: NodeJS.Timeout;
  errorCleanup?: NodeJS.Timeout;
  rateLimitCleanup?: NodeJS.Timeout;
}): void {
  if (timers.memoryMonitor) {
    clearInterval(timers.memoryMonitor);
  }
  if (timers.errorCleanup) {
    clearInterval(timers.errorCleanup);
  }
  if (timers.rateLimitCleanup) {
    clearInterval(timers.rateLimitCleanup);
  }
}
