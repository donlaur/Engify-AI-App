/**
 * Centralized Error Registry - Main Export
 *
 * Single entry point for all error handling functionality
 *
 * @example
 * ```ts
 * import { ErrorFactory, handleApiError, assertFound } from '@/lib/errors';
 *
 * // In API routes
 * try {
 *   const user = await findUser(id);
 *   assertFound(user, 'User', id);
 *   return NextResponse.json(user);
 * } catch (error) {
 *   return handleApiError(error, request);
 * }
 * ```
 */

// Export types
export type {
  ErrorCode,
  ErrorMetadata,
  ErrorRegistryEntry,
  SerializedError,
  ErrorHandlerOptions,
} from './types';

export {
  HttpStatus,
  ErrorSeverity,
  ErrorCategory,
  isOperationalError,
  isRetryableError,
} from './types';

// Export base error classes
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,
  BusinessLogicError,
} from './base';

// Export registry
export {
  ERROR_REGISTRY,
  getErrorDefinition,
  isRegisteredErrorCode,
  getErrorsByCategory,
  getErrorsBySeverity,
  getRetryableErrors,
} from './registry';

// Export factory
export { ErrorFactory, createError, isRegisteredErrorCode as isValidErrorCode } from './factory';

// Export handler utilities
export {
  handleApiError,
  toAppError,
  withErrorHandler,
  asyncHandler,
  validateSchema,
  assertFound,
  assertAuthorized,
  assertAuthenticated,
  assertValidState,
} from './handler';

// Export legacy sanitize functions for backwards compatibility
export {
  sanitizeError,
  sanitizeValidationError,
  sanitizeAuthError,
  sanitizeForbiddenError,
  sanitizeNotFoundError,
  sanitizeRateLimitError,
} from './sanitize';
