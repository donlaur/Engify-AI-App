/**
 * Error Sanitization for Production APIs
 *
 * Prevents information disclosure by sanitizing error messages in production.
 * Detailed errors are logged server-side for debugging.
 */

import { logger } from '@/lib/logging/logger';

export interface SanitizedError {
  message: string;
  code?: string;
  statusCode: number;
}

/**
 * Sanitize error for client response
 * - Production: Returns generic message, logs details server-side
 * - Development: Returns detailed message for debugging
 */
export function sanitizeError(
  error: unknown,
  context?: string
): SanitizedError {
  const isProduction = process.env.NODE_ENV === 'production';

  // Extract error details
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log detailed error server-side (always)
  logger.error('API Error', {
    context,
    message: errorMessage,
    stack: errorStack,
    error,
  });

  // Production: Return generic message
  if (isProduction) {
    return {
      message: 'An internal error occurred. Please try again later.',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }

  // Development: Return detailed message
  return {
    message: errorMessage,
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  };
}

/**
 * Sanitize validation error (safe to expose to client)
 */
export function sanitizeValidationError(message: string): SanitizedError {
  return {
    message,
    code: 'VALIDATION_ERROR',
    statusCode: 400,
  };
}

/**
 * Sanitize authentication error
 */
export function sanitizeAuthError(
  message: string = 'Authentication required'
): SanitizedError {
  return {
    message,
    code: 'UNAUTHORIZED',
    statusCode: 401,
  };
}

/**
 * Sanitize authorization error
 */
export function sanitizeForbiddenError(
  message: string = 'Access forbidden'
): SanitizedError {
  return {
    message,
    code: 'FORBIDDEN',
    statusCode: 403,
  };
}

/**
 * Sanitize not found error
 */
export function sanitizeNotFoundError(
  resource: string = 'Resource'
): SanitizedError {
  return {
    message: `${resource} not found`,
    code: 'NOT_FOUND',
    statusCode: 404,
  };
}

/**
 * Sanitize rate limit error
 */
export function sanitizeRateLimitError(resetAt?: Date): SanitizedError {
  const message = resetAt
    ? `Rate limit exceeded. Try again after ${resetAt.toISOString()}`
    : 'Rate limit exceeded. Please try again later.';

  return {
    message,
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  };
}
