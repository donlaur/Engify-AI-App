/**
 * Centralized Application Logger
 *
 * Professional logging infrastructure for production applications
 * Uses Winston for structured logging with proper error handling
 *
 * Usage:
 *   import { logger } from '@/lib/logging/logger';
 *   logger.error('API route error', { route: '/api/users', userId: '123' });
 *   logger.info('User action', { action: 'login', userId: '123' });
 */

import winston from 'winston';

// Create application logger (separate from audit logger)
const appLogger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'engify-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // File transport for application logs
    new winston.transports.File({
      filename: 'logs/app-error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  appLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Application Logger Interface
 *
 * Provides structured logging methods with context support
 */
export const logger = {
  /**
   * Log error with context
   */
  error: (message: string, meta?: Record<string, unknown>) => {
    appLogger.error(message, meta || {});
  },

  /**
   * Log warning with context
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    appLogger.warn(message, meta || {});
  },

  /**
   * Log info with context
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    appLogger.info(message, meta || {});
  },

  /**
   * Log debug with context (only in development)
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== 'production') {
      appLogger.debug(message, meta || {});
    }
  },

  /**
   * Log API route errors with request context
   */
  apiError: (
    route: string,
    error: unknown,
    context?: {
      userId?: string;
      method?: string;
      statusCode?: number;
      [key: string]: unknown;
    }
  ) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    appLogger.error('API route error', {
      route,
      error: errorMessage,
      stack: errorStack,
      ...context,
    });
  },

  /**
   * Log API route requests (info level)
   */
  apiRequest: (
    route: string,
    context?: {
      userId?: string;
      method?: string;
      statusCode?: number;
      duration?: number;
      [key: string]: unknown;
    }
  ) => {
    appLogger.info('API request', {
      route,
      ...context,
    });
  },
};

/**
 * Default export for convenience
 */
export default logger;
