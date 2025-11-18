/**
 * Enhanced Logger with Request Context and Performance Tracking
 *
 * Extends the base logger with:
 * - Automatic request ID injection
 * - Performance timing for slow operations
 * - Business metrics logging
 * - Structured context management
 *
 * Usage:
 *   import { observabilityLogger } from '@/lib/observability/enhanced-logger';
 *
 *   observabilityLogger.info('User logged in', { userId: '123' });
 *   observabilityLogger.performance('Database query', 150, { query: 'findUsers' });
 *   observabilityLogger.business('feature_used', { feature: 'ai_chat', userId: '123' });
 */

import { logger } from '@/lib/logging/logger';
import { RequestContext } from './request-context';

export interface PerformanceThresholds {
  warn: number; // milliseconds
  error: number; // milliseconds
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  warn: 1000, // 1 second
  error: 5000, // 5 seconds
};

export interface BusinessMetric {
  event: string;
  userId?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export class ObservabilityLogger {
  /**
   * Get context-enriched metadata
   */
  private enrichMeta(meta?: Record<string, unknown>): Record<string, unknown> {
    const contextData = RequestContext.toLogContext();
    return {
      ...contextData,
      ...meta,
    };
  }

  /**
   * Log info with context
   */
  info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, this.enrichMeta(meta));
  }

  /**
   * Log warning with context
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, this.enrichMeta(meta));
  }

  /**
   * Log error with context
   */
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    const errorMeta = error instanceof Error
      ? {
          error: error.message,
          stack: error.stack,
          name: error.name,
        }
      : { error: String(error) };

    logger.error(message, this.enrichMeta({ ...errorMeta, ...meta }));
  }

  /**
   * Log debug with context
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, this.enrichMeta(meta));
  }

  /**
   * Log performance metrics with automatic thresholds
   */
  performance(
    operation: string,
    durationMs: number,
    meta?: Record<string, unknown>,
    thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS
  ): void {
    const enrichedMeta = this.enrichMeta({
      operation,
      durationMs,
      ...meta,
    });

    if (durationMs >= thresholds.error) {
      logger.error(`Slow operation: ${operation}`, enrichedMeta);
    } else if (durationMs >= thresholds.warn) {
      logger.warn(`Slow operation: ${operation}`, enrichedMeta);
    } else {
      logger.info(`Operation completed: ${operation}`, enrichedMeta);
    }
  }

  /**
   * Log business metrics (feature usage, user actions, etc.)
   */
  business(event: string, data: Omit<BusinessMetric, 'event'>): void {
    const metric: BusinessMetric = {
      event,
      ...data,
      userId: data.userId || RequestContext.getUserId(),
    };

    logger.info('Business metric', this.enrichMeta({
      metricType: 'business',
      ...metric,
    }));
  }

  /**
   * Log API request with timing
   */
  apiRequest(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
    meta?: Record<string, unknown>
  ): void {
    const enrichedMeta = this.enrichMeta({
      method,
      path,
      statusCode,
      durationMs,
      success: statusCode >= 200 && statusCode < 400,
      ...meta,
    });

    if (statusCode >= 500) {
      logger.error('API request failed', enrichedMeta);
    } else if (statusCode >= 400) {
      logger.warn('API request error', enrichedMeta);
    } else if (durationMs > DEFAULT_THRESHOLDS.warn) {
      logger.warn('Slow API request', enrichedMeta);
    } else {
      logger.info('API request', enrichedMeta);
    }
  }

  /**
   * Log database operation with timing
   */
  dbOperation(
    operation: string,
    collection: string,
    durationMs: number,
    meta?: Record<string, unknown>
  ): void {
    this.performance(
      `db:${operation}:${collection}`,
      durationMs,
      {
        operationType: 'database',
        operation,
        collection,
        ...meta,
      },
      { warn: 500, error: 2000 } // Tighter thresholds for DB operations
    );
  }

  /**
   * Log AI provider call with timing and cost
   */
  aiProviderCall(
    provider: string,
    model: string,
    durationMs: number,
    success: boolean,
    meta?: Record<string, unknown> & { cost?: number; tokens?: number }
  ): void {
    const enrichedMeta = this.enrichMeta({
      operationType: 'ai_provider',
      provider,
      model,
      durationMs,
      success,
      ...meta,
    });

    if (!success) {
      logger.error(`AI provider call failed: ${provider}`, enrichedMeta);
    } else if (durationMs > 10000) {
      // 10s threshold for AI calls
      logger.warn(`Slow AI provider call: ${provider}`, enrichedMeta);
    } else {
      logger.info(`AI provider call: ${provider}`, enrichedMeta);
    }
  }

  /**
   * Log rate limit event
   */
  rateLimit(
    identifier: string,
    limit: number,
    current: number,
    blocked: boolean
  ): void {
    const enrichedMeta = this.enrichMeta({
      eventType: 'rate_limit',
      identifier,
      limit,
      current,
      blocked,
      utilizationPercent: (current / limit) * 100,
    });

    if (blocked) {
      logger.warn('Rate limit exceeded', enrichedMeta);
    } else if (current / limit > 0.8) {
      logger.info('Rate limit warning', enrichedMeta);
    }
  }

  /**
   * Log security event
   */
  security(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    meta?: Record<string, unknown>
  ): void {
    const enrichedMeta = this.enrichMeta({
      eventType: 'security',
      event,
      severity,
      ...meta,
    });

    if (severity === 'critical' || severity === 'high') {
      logger.error(`Security event: ${event}`, enrichedMeta);
    } else if (severity === 'medium') {
      logger.warn(`Security event: ${event}`, enrichedMeta);
    } else {
      logger.info(`Security event: ${event}`, enrichedMeta);
    }
  }

  /**
   * Start a timer for performance tracking
   */
  startTimer(): { end: (operation: string, meta?: Record<string, unknown>) => void } {
    const startTime = Date.now();

    return {
      end: (operation: string, meta?: Record<string, unknown>) => {
        const duration = Date.now() - startTime;
        this.performance(operation, duration, meta);
      },
    };
  }
}

/**
 * Singleton instance
 */
export const observabilityLogger = new ObservabilityLogger();

/**
 * Convenience function for timing operations
 */
export async function withPerformanceLogging<T>(
  operation: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>
): Promise<T> {
  const timer = observabilityLogger.startTimer();
  try {
    const result = await fn();
    timer.end(operation, { ...meta, success: true });
    return result;
  } catch (error) {
    timer.end(operation, { ...meta, success: false });
    throw error;
  }
}
