/**
 * Error Handler - Centralized Error Handling for API Routes
 *
 * Provides middleware and utilities for handling errors consistently
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './base';
import { ErrorFactory } from './factory';
import { logger } from '@/lib/logging/logger';
import { ErrorHandlerOptions, SerializedError } from './types';

/**
 * Handle errors in API routes
 *
 * Converts various error types to AppError and returns appropriate response
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   try {
 *     // ... route logic
 *   } catch (error) {
 *     return handleApiError(error, request);
 *   }
 * }
 * ```
 */
export function handleApiError(
  error: unknown,
  request?: NextRequest,
  options: ErrorHandlerOptions = {}
): NextResponse {
  const {
    logError = true,
    includeStack = process.env.NODE_ENV !== 'production',
    sanitize = process.env.NODE_ENV === 'production',
  } = options;

  // Convert to AppError
  const appError = toAppError(error);

  // Log error if enabled
  if (logError) {
    logErrorToLogger(appError, request);
  }

  // Notify if critical error (could integrate with monitoring service)
  if (options.notifyOnCritical && appError.severity === 'critical') {
    notifyCriticalError(appError, request);
  }

  // Prepare response
  const responseData = sanitize ? appError.toSanitized() : appError.toJSON();

  // Add stack trace in development
  if (includeStack && appError.stack) {
    (responseData as SerializedError & { stack?: string }).stack = appError.stack;
  }

  // Add request ID if available
  if (request?.headers.get('x-request-id')) {
    responseData.requestId = request.headers.get('x-request-id') || undefined;
  }

  return NextResponse.json(
    {
      error: responseData,
    },
    {
      status: appError.statusCode,
      headers: {
        'Content-Type': 'application/json',
        // Add retry-after header for rate limit errors
        ...(appError.code === 'RATE_LIMIT_EXCEEDED' &&
        appError.metadata.resetAt instanceof Date
          ? {
              'Retry-After': Math.ceil(
                (appError.metadata.resetAt.getTime() - Date.now()) / 1000
              ).toString(),
            }
          : {}),
      },
    }
  );
}

/**
 * Convert unknown error to AppError
 */
export function toAppError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    return error;
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return ErrorFactory.validation('Request validation failed', undefined, undefined, {
      validationErrors: error.errors,
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
  }

  // MongoDB errors
  if (error && typeof error === 'object' && 'name' in error) {
    const err = error as { name: string; message?: string; code?: number };

    // MongoDB duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return ErrorFactory.conflict('Duplicate entry found', {
        mongoError: err,
      });
    }

    // MongoDB connection error
    if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
      return ErrorFactory.databaseConnection({
        mongoError: err,
      });
    }

    // Other MongoDB errors
    if (err.name.startsWith('Mongo')) {
      return ErrorFactory.database(err.message || 'Database error', undefined, undefined, {
        mongoError: err,
      });
    }
  }

  // Standard Error
  if (error instanceof Error) {
    return ErrorFactory.internal(error.message, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  // Unknown error
  return ErrorFactory.fromUnknown(error);
}

/**
 * Log error to application logger
 */
function logErrorToLogger(error: AppError, request?: NextRequest): void {
  const context = {
    code: error.code,
    category: error.category,
    severity: error.severity,
    statusCode: error.statusCode,
    isOperational: error.isOperational,
    retryable: error.retryable,
    metadata: error.metadata,
    route: request?.nextUrl.pathname,
    method: request?.method,
    userAgent: request?.headers.get('user-agent'),
    requestId: request?.headers.get('x-request-id'),
  };

  // Use appropriate log level based on severity
  switch (error.severity) {
    case 'critical':
    case 'high':
      logger.error(error.message, {
        ...context,
        stack: error.stack,
      });
      break;
    case 'medium':
      logger.warn(error.message, context);
      break;
    case 'low':
      logger.info(error.message, context);
      break;
    default:
      logger.error(error.message, {
        ...context,
        stack: error.stack,
      });
  }
}

/**
 * Notify about critical errors (placeholder for monitoring integration)
 */
function notifyCriticalError(error: AppError, request?: NextRequest): void {
  // TODO: Integrate with monitoring service (e.g., Sentry, DataDog)
  logger.error('CRITICAL ERROR DETECTED', {
    error: error.toLog(),
    route: request?.nextUrl.pathname,
    method: request?.method,
  });

  // Example integrations:
  // - Send to Sentry
  // - Send to Slack webhook
  // - Send to PagerDuty
  // - Send email alert
}

/**
 * Higher-order function to wrap API route handlers with error handling
 *
 * @example
 * ```ts
 * export const GET = withErrorHandler(async (request: NextRequest) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * });
 * ```
 */
export function withErrorHandler(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  options?: ErrorHandlerOptions
) {
  return async (request: NextRequest, context?: unknown): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request, options);
    }
  };
}

/**
 * Async handler wrapper with error handling
 *
 * Similar to withErrorHandler but with a cleaner syntax
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return asyncHandler(request, async () => {
 *     const data = await fetchData();
 *     return NextResponse.json(data);
 *   });
 * }
 * ```
 */
export async function asyncHandler(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: ErrorHandlerOptions
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return handleApiError(error, request, options);
  }
}

/**
 * Validate and handle Zod schema
 *
 * @example
 * ```ts
 * const body = await validateSchema(request, userSchema);
 * ```
 */
export async function validateSchema<T>(
  request: NextRequest,
  schema: { parse: (data: unknown) => T }
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw ErrorFactory.validation('Request validation failed', undefined, undefined, {
        validationErrors: error.errors,
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }
    throw error;
  }
}

/**
 * Assert condition or throw error
 *
 * @example
 * ```ts
 * assertFound(user, 'User', userId);
 * assertAuthorized(hasPermission, 'admin');
 * ```
 */
export function assertFound<T>(
  value: T | null | undefined,
  resource: string,
  resourceId?: string
): asserts value is T {
  if (!value) {
    throw ErrorFactory.notFound(resource, resourceId);
  }
}

/**
 * Assert authorization or throw error
 */
export function assertAuthorized(
  condition: boolean,
  requiredPermission?: string,
  message?: string
): asserts condition {
  if (!condition) {
    throw ErrorFactory.authorization(
      message,
      requiredPermission,
      requiredPermission ? { requiredPermission } : undefined
    );
  }
}

/**
 * Assert authentication or throw error
 */
export function assertAuthenticated(
  condition: boolean,
  message?: string
): asserts condition {
  if (!condition) {
    throw ErrorFactory.authentication(message);
  }
}

/**
 * Assert valid state or throw business logic error
 */
export function assertValidState(
  condition: boolean,
  message: string,
  rule?: string
): asserts condition {
  if (!condition) {
    throw ErrorFactory.businessLogic(message, rule);
  }
}
