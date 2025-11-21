/**
 * Client-Side Logger
 * 
 * Multi-level logging system for client components.
 * Sends logs to server API for centralized logging.
 * Falls back to console in development for debugging.
 * 
 * @pattern OPSHUB_LOGGING
 * @usage Use this logger in all client components instead of console.log/error/warn
 * 
 * @example
 * ```tsx
 * import { clientLogger } from '@/lib/logging/client-logger';
 * 
 * clientLogger.error('Failed to load data', { component: 'MyPanel', error });
 * clientLogger.warn('Deprecated API used', { endpoint: '/api/old' });
 * clientLogger.info('User action', { action: 'click', button: 'save' });
 * ```
 */

'use client';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogMeta {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

/**
 * Send log to server API for centralized logging
 */
async function sendLogToServer(
  level: LogLevel,
  message: string,
  meta?: LogMeta
): Promise<void> {
  // Only send to server in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING === 'true') {
    try {
      await fetch('/api/logging/client-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          meta: {
            ...meta,
            timestamp: new Date().toISOString(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
          },
        }),
        // Don't wait for response - fire and forget
      }).catch(() => {
        // Silently fail - don't break the app if logging fails
      });
    } catch {
      // Silently fail - don't break the app if logging fails
    }
  }
}

/**
 * Format log message for console output
 */
function formatConsoleMessage(level: LogLevel, message: string, meta?: LogMeta): string {
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${level.toUpperCase()}] ${message}${metaStr}`;
}

/**
 * Client-side logger for use in React components
 * 
 * Provides structured logging that:
 * - Sends logs to server API in production
 * - Outputs to console in development
 * - Includes context metadata
 * - Never throws errors (fails silently)
 */
export const clientLogger = {
  /**
   * Log error with context
   * Use for errors that need attention
   */
  error: (message: string, meta?: LogMeta): void => {
    // Always log errors to console for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.error(formatConsoleMessage('error', message, meta));
    }
    
    // Send to server
    sendLogToServer('error', message, meta).catch(() => {
      // Silently fail
    });
  },

  /**
   * Log warning with context
   * Use for warnings that should be monitored
   */
  warn: (message: string, meta?: LogMeta): void => {
    // Log warnings to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn(formatConsoleMessage('warn', message, meta));
    }
    
    // Send to server
    sendLogToServer('warn', message, meta).catch(() => {
      // Silently fail
    });
  },

  /**
   * Log info message with context
   * Use for informational messages
   */
  info: (message: string, meta?: LogMeta): void => {
    // Log info to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.info(formatConsoleMessage('info', message, meta));
    }
    
    // Send to server in production
    sendLogToServer('info', message, meta).catch(() => {
      // Silently fail
    });
  },

  /**
   * Log debug message with context
   * Only logs in development, never in production
   */
  debug: (message: string, meta?: LogMeta): void => {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'production') {
      console.debug(formatConsoleMessage('debug', message, meta));
    }
    // Don't send debug logs to server
  },

  /**
   * Log API error with full context
   * Use when API calls fail
   */
  apiError: (
    endpoint: string,
    error: unknown,
    meta?: LogMeta
  ): void => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    clientLogger.error('API error', {
      ...meta,
      endpoint,
      error: errorMessage,
      stack: errorStack,
    });
  },

  /**
   * Log component error
   * Use in error boundaries and catch blocks
   */
  componentError: (
    component: string,
    error: unknown,
    meta?: LogMeta
  ): void => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    clientLogger.error('Component error', {
      ...meta,
      component,
      error: errorMessage,
      stack: errorStack,
    });
  },
};

/**
 * Default export for convenience
 */
export default clientLogger;

