/**
 * Error Categorization and Tracking System
 *
 * Provides structured error handling with:
 * - Error categorization
 * - Error rate tracking
 * - Alert-worthy error detection
 * - Error aggregation and reporting
 *
 * Usage:
 *   import { errorTracker, ErrorCategory } from '@/lib/observability/error-tracker';
 *
 *   try {
 *     // your code
 *   } catch (error) {
 *     errorTracker.trackError(error, ErrorCategory.DATABASE, { userId: '123' });
 *   }
 */

import { observabilityLogger } from './enhanced-logger';

export enum ErrorCategory {
  // Client errors
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',

  // Server errors
  DATABASE = 'database',
  EXTERNAL_API = 'external_api',
  AI_PROVIDER = 'ai_provider',
  INTERNAL = 'internal',
  CONFIGURATION = 'configuration',

  // Infrastructure errors
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  RESOURCE_EXHAUSTED = 'resource_exhausted',

  // Unknown
  UNKNOWN = 'unknown',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface CategorizedError {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  alertWorthy: boolean;
}

export interface ErrorStats {
  category: ErrorCategory;
  count: number;
  lastOccurrence: Date;
  errorRate: number; // errors per minute
}

/**
 * Determine error severity based on category
 */
function getSeverityForCategory(category: ErrorCategory): ErrorSeverity {
  const severityMap: Record<ErrorCategory, ErrorSeverity> = {
    [ErrorCategory.VALIDATION]: ErrorSeverity.LOW,
    [ErrorCategory.AUTHENTICATION]: ErrorSeverity.MEDIUM,
    [ErrorCategory.AUTHORIZATION]: ErrorSeverity.MEDIUM,
    [ErrorCategory.NOT_FOUND]: ErrorSeverity.LOW,
    [ErrorCategory.RATE_LIMIT]: ErrorSeverity.MEDIUM,
    [ErrorCategory.DATABASE]: ErrorSeverity.CRITICAL,
    [ErrorCategory.EXTERNAL_API]: ErrorSeverity.HIGH,
    [ErrorCategory.AI_PROVIDER]: ErrorSeverity.HIGH,
    [ErrorCategory.INTERNAL]: ErrorSeverity.HIGH,
    [ErrorCategory.CONFIGURATION]: ErrorSeverity.CRITICAL,
    [ErrorCategory.NETWORK]: ErrorSeverity.HIGH,
    [ErrorCategory.TIMEOUT]: ErrorSeverity.MEDIUM,
    [ErrorCategory.RESOURCE_EXHAUSTED]: ErrorSeverity.CRITICAL,
    [ErrorCategory.UNKNOWN]: ErrorSeverity.MEDIUM,
  };

  return severityMap[category] || ErrorSeverity.MEDIUM;
}

/**
 * Determine if error is alert-worthy
 */
function isAlertWorthy(category: ErrorCategory, severity: ErrorSeverity): boolean {
  // Critical errors are always alert-worthy
  if (severity === ErrorSeverity.CRITICAL) return true;

  // High severity errors for infrastructure/backend
  const criticalCategories = [
    ErrorCategory.DATABASE,
    ErrorCategory.CONFIGURATION,
    ErrorCategory.RESOURCE_EXHAUSTED,
  ];

  return criticalCategories.includes(category) && severity === ErrorSeverity.HIGH;
}

/**
 * Categorize error based on error message and properties
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (!(error instanceof Error)) {
    return ErrorCategory.UNKNOWN;
  }

  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();

  // Database errors
  if (
    message.includes('mongo') ||
    message.includes('database') ||
    message.includes('connection') ||
    name.includes('mongodberror')
  ) {
    return ErrorCategory.DATABASE;
  }

  // Authentication/Authorization
  if (
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('invalid token') ||
    name.includes('autherror')
  ) {
    return ErrorCategory.AUTHENTICATION;
  }

  if (
    message.includes('forbidden') ||
    message.includes('access denied') ||
    message.includes('insufficient permissions')
  ) {
    return ErrorCategory.AUTHORIZATION;
  }

  // Validation
  if (
    message.includes('validation') ||
    message.includes('invalid input') ||
    name.includes('validationerror')
  ) {
    return ErrorCategory.VALIDATION;
  }

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('quota exceeded')
  ) {
    return ErrorCategory.RATE_LIMIT;
  }

  // Network/Timeout
  if (
    message.includes('timeout') ||
    message.includes('timed out') ||
    name.includes('timeouterror')
  ) {
    return ErrorCategory.TIMEOUT;
  }

  if (
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('enotfound') ||
    message.includes('fetch failed')
  ) {
    return ErrorCategory.NETWORK;
  }

  // AI Provider errors
  if (
    message.includes('openai') ||
    message.includes('anthropic') ||
    message.includes('gemini') ||
    message.includes('groq') ||
    message.includes('api key')
  ) {
    return ErrorCategory.AI_PROVIDER;
  }

  // Resource exhausted
  if (
    message.includes('out of memory') ||
    message.includes('resource exhausted') ||
    message.includes('heap')
  ) {
    return ErrorCategory.RESOURCE_EXHAUSTED;
  }

  // Not found
  if (message.includes('not found') || message.includes('404')) {
    return ErrorCategory.NOT_FOUND;
  }

  return ErrorCategory.UNKNOWN;
}

/**
 * Error Tracker Class
 */
class ErrorTracker {
  private errors: CategorizedError[] = [];
  private errorCounts = new Map<ErrorCategory, number>();
  private errorTimestamps = new Map<ErrorCategory, Date[]>();
  private readonly maxErrors = 1000; // Keep last 1000 errors
  private readonly rateWindowMs = 60000; // 1 minute window for rate calculation

  /**
   * Track an error
   */
  trackError(
    error: unknown,
    category?: ErrorCategory,
    metadata?: Record<string, unknown>
  ): CategorizedError {
    const errorCategory = category || categorizeError(error);
    const severity = getSeverityForCategory(errorCategory);
    const alertWorthy = isAlertWorthy(errorCategory, severity);

    const categorizedError: CategorizedError = {
      category: errorCategory,
      severity,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date(),
      metadata,
      alertWorthy,
    };

    // Store error
    this.errors.push(categorizedError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Update counts
    const currentCount = this.errorCounts.get(errorCategory) || 0;
    this.errorCounts.set(errorCategory, currentCount + 1);

    // Track timestamp for rate calculation
    const timestamps = this.errorTimestamps.get(errorCategory) || [];
    timestamps.push(new Date());
    this.errorTimestamps.set(errorCategory, timestamps);

    // Log the error
    if (alertWorthy) {
      observabilityLogger.error(
        `[ALERT] ${errorCategory} error`,
        error,
        {
          category: errorCategory,
          severity,
          alertWorthy,
          ...metadata,
        }
      );
    } else {
      observabilityLogger.error(
        `${errorCategory} error`,
        error,
        {
          category: errorCategory,
          severity,
          ...metadata,
        }
      );
    }

    return categorizedError;
  }

  /**
   * Get error statistics by category
   */
  getErrorStats(category?: ErrorCategory): ErrorStats[] {
    const categories = category
      ? [category]
      : Array.from(this.errorCounts.keys());

    return categories.map((cat) => {
      const count = this.errorCounts.get(cat) || 0;
      const timestamps = this.errorTimestamps.get(cat) || [];
      const lastOccurrence = timestamps[timestamps.length - 1] || new Date();

      // Calculate error rate (errors per minute)
      const now = Date.now();
      const recentErrors = timestamps.filter(
        (ts) => now - ts.getTime() < this.rateWindowMs
      );
      const errorRate = recentErrors.length; // errors in last minute

      return {
        category: cat,
        count,
        lastOccurrence,
        errorRate,
      };
    });
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 50, category?: ErrorCategory): CategorizedError[] {
    let errors = this.errors;

    if (category) {
      errors = errors.filter((e) => e.category === category);
    }

    return errors.slice(-limit).reverse();
  }

  /**
   * Get alert-worthy errors
   */
  getAlertWorthyErrors(limit: number = 20): CategorizedError[] {
    return this.errors
      .filter((e) => e.alertWorthy)
      .slice(-limit)
      .reverse();
  }

  /**
   * Check if error rate exceeds threshold
   */
  isErrorRateHigh(
    category: ErrorCategory,
    threshold: number = 10
  ): boolean {
    const stats = this.getErrorStats(category)[0];
    return stats ? stats.errorRate > threshold : false;
  }

  /**
   * Get error summary for health check
   */
  getErrorSummary(): {
    totalErrors: number;
    criticalErrors: number;
    alertWorthyErrors: number;
    errorsByCategory: Record<string, number>;
    topErrors: Array<{ category: string; count: number; rate: number }>;
  } {
    const stats = this.getErrorStats();

    const totalErrors = this.errors.length;
    const criticalErrors = this.errors.filter(
      (e) => e.severity === ErrorSeverity.CRITICAL
    ).length;
    const alertWorthyErrors = this.errors.filter((e) => e.alertWorthy).length;

    const errorsByCategory: Record<string, number> = {};
    this.errorCounts.forEach((count, category) => {
      errorsByCategory[category] = count;
    });

    const topErrors = stats
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 5)
      .map((s) => ({
        category: s.category,
        count: s.count,
        rate: s.errorRate,
      }));

    return {
      totalErrors,
      criticalErrors,
      alertWorthyErrors,
      errorsByCategory,
      topErrors,
    };
  }

  /**
   * Clear error history
   */
  clear(): void {
    this.errors = [];
    this.errorCounts.clear();
    this.errorTimestamps.clear();
  }

  /**
   * Cleanup old error timestamps (for rate calculation)
   */
  private cleanupOldTimestamps(): void {
    const now = Date.now();
    const cutoff = now - this.rateWindowMs;

    this.errorTimestamps.forEach((timestamps, category) => {
      const filtered = timestamps.filter((ts) => ts.getTime() > cutoff);
      this.errorTimestamps.set(category, filtered);
    });
  }

  /**
   * Start periodic cleanup
   */
  startCleanup(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupOldTimestamps();
    }, intervalMs);
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Convenience function for wrapping code with error tracking
 */
export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  category?: ErrorCategory,
  metadata?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errorTracker.trackError(error, category, metadata);
    throw error;
  }
}
