/**
 * Logging Provider
 *
 * Singleton provider for structured logging with context enrichment.
 * Provides centralized logging for:
 * - API routes
 * - Services
 * - Background jobs
 * - Error tracking
 *
 * Features:
 * - Structured logging with metadata
 * - Automatic context enrichment
 * - Request/response logging
 * - Error tracking with stack traces
 * - Performance metrics
 *
 * Usage:
 * ```typescript
 * const log = LoggingProvider.getInstance();
 * log.info('User action', { action: 'login', userId: '123' });
 * log.error('API error', error, { route: '/api/users' });
 * ```
 *
 * @module LoggingProvider
 */

import { logger } from '@/lib/logging/logger';
import { auditLog, type AuditAction, type AuditSeverity } from '@/lib/logging/audit';

export interface LogContext {
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

export interface ApiErrorContext extends LogContext {
  error?: Error | unknown;
  stack?: string;
}

export class LoggingProvider {
  private static instance: LoggingProvider;
  private context: LogContext = {};

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): LoggingProvider {
    if (!LoggingProvider.instance) {
      LoggingProvider.instance = new LoggingProvider();
    }
    return LoggingProvider.instance;
  }

  /**
   * Set default context for all subsequent logs
   * Useful for request-scoped logging
   */
  public setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear default context
   */
  public clearContext(): void {
    this.context = {};
  }

  /**
   * Get current context
   */
  public getContext(): LogContext {
    return { ...this.context };
  }

  /**
   * Log info message
   */
  public info(message: string, meta?: LogContext): void {
    logger.info(message, this.enrichMeta(meta));
  }

  /**
   * Log warning message
   */
  public warn(message: string, meta?: LogContext): void {
    logger.warn(message, this.enrichMeta(meta));
  }

  /**
   * Log error message
   */
  public error(message: string, error?: Error | unknown, meta?: LogContext): void {
    const errorMeta = this.enrichMeta({
      ...meta,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    logger.error(message, errorMeta);
  }

  /**
   * Log debug message (development only)
   */
  public debug(message: string, meta?: LogContext): void {
    logger.debug(message, this.enrichMeta(meta));
  }

  /**
   * Log API request
   */
  public apiRequest(route: string, context?: LogContext): void {
    logger.apiRequest(route, this.enrichMeta(context));
  }

  /**
   * Log API error with full context
   */
  public apiError(route: string, error: unknown, context?: ApiErrorContext): void {
    const enrichedContext = this.enrichMeta({
      ...context,
      route,
    });

    logger.apiError(route, error, enrichedContext);
  }

  /**
   * Log API success with metrics
   */
  public apiSuccess(
    route: string,
    statusCode: number,
    duration: number,
    context?: LogContext
  ): void {
    this.info('API success', {
      ...context,
      route,
      statusCode,
      duration,
      type: 'api_success',
    });
  }

  /**
   * Audit log helper - delegates to audit logging system
   */
  public async audit(
    action: AuditAction,
    details?: {
      userId?: string;
      resource?: string;
      severity?: AuditSeverity;
      details?: Record<string, unknown>;
    }
  ): Promise<void> {
    await auditLog({
      action,
      userId: details?.userId,
      resource: details?.resource,
      severity: details?.severity || 'info',
      details: details?.details,
    });
  }

  /**
   * Log performance metric
   */
  public performance(
    operation: string,
    duration: number,
    context?: LogContext
  ): void {
    this.info('Performance metric', {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  /**
   * Create a child logger with additional context
   * Useful for service-level or operation-level logging
   */
  public child(context: LogContext): LoggingProvider {
    const child = new LoggingProvider();
    child.setContext({ ...this.context, ...context });
    return child;
  }

  /**
   * Time an async operation and log performance
   */
  public async time<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.performance(operation, duration, context);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${operation} failed`, error, {
        ...context,
        duration,
      });
      throw error;
    }
  }

  /**
   * Enrich metadata with default context
   */
  private enrichMeta(meta?: LogContext): LogContext {
    return {
      ...this.context,
      ...meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * For testing: reset singleton instance
   */
  public static resetInstance(): void {
    if (LoggingProvider.instance) {
      LoggingProvider.instance.clearContext();
      LoggingProvider.instance = null as any;
    }
  }
}

/**
 * Convenience export for quick access
 */
export const loggingProvider = LoggingProvider.getInstance();
