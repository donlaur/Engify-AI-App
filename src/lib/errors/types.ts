/**
 * Error Registry - Core Types and Interfaces
 *
 * Defines the foundational types for the centralized error handling system
 */

/**
 * HTTP Status Codes commonly used in the application
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Error severity levels for logging and monitoring
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  DATABASE = 'database',
  NETWORK = 'network',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
}

/**
 * Standardized error code format
 * Pattern: CATEGORY_SPECIFIC_ERROR
 */
export type ErrorCode = string;

/**
 * Error metadata for additional context
 */
export interface ErrorMetadata {
  [key: string]: unknown;
  timestamp?: Date;
  requestId?: string;
  userId?: string;
  resource?: string;
  action?: string;
  details?: unknown;
}

/**
 * Error registry entry definition
 */
export interface ErrorRegistryEntry {
  code: ErrorCode;
  message: string;
  statusCode: HttpStatus;
  category: ErrorCategory;
  severity: ErrorSeverity;
  isOperational: boolean;
  retryable: boolean;
}

/**
 * Serialized error for API responses
 */
export interface SerializedError {
  code: ErrorCode;
  message: string;
  statusCode: number;
  category: ErrorCategory;
  severity?: ErrorSeverity;
  metadata?: ErrorMetadata;
  stack?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Error handler options
 */
export interface ErrorHandlerOptions {
  logError?: boolean;
  includeStack?: boolean;
  sanitize?: boolean;
  notifyOnCritical?: boolean;
}

/**
 * Type guard to check if error is operational (expected/handled)
 */
export function isOperationalError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isOperational' in error) {
    return (error as { isOperational: boolean }).isOperational === true;
  }
  return false;
}

/**
 * Type guard to check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'retryable' in error) {
    return (error as { retryable: boolean }).retryable === true;
  }
  return false;
}
