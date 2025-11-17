/**
 * Error Registry - Centralized Error Code Registry
 *
 * Defines all application error codes with their metadata
 * This serves as the single source of truth for error definitions
 */

import {
  ErrorCode,
  ErrorRegistryEntry,
  ErrorCategory,
  ErrorSeverity,
  HttpStatus,
} from './types';

/**
 * Centralized Error Registry
 *
 * All error codes used in the application should be defined here
 */
export const ERROR_REGISTRY: Record<ErrorCode, ErrorRegistryEntry> = {
  // ==================== VALIDATION ERRORS ====================
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Request validation failed',
    statusCode: HttpStatus.BAD_REQUEST,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  VALIDATION_FIELD_REQUIRED: {
    code: 'VALIDATION_FIELD_REQUIRED',
    message: 'Required field is missing',
    statusCode: HttpStatus.BAD_REQUEST,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  VALIDATION_FIELD_INVALID: {
    code: 'VALIDATION_FIELD_INVALID',
    message: 'Field value is invalid',
    statusCode: HttpStatus.BAD_REQUEST,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  VALIDATION_EMAIL_INVALID: {
    code: 'VALIDATION_EMAIL_INVALID',
    message: 'Invalid email address',
    statusCode: HttpStatus.BAD_REQUEST,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  VALIDATION_PASSWORD_WEAK: {
    code: 'VALIDATION_PASSWORD_WEAK',
    message: 'Password does not meet security requirements',
    statusCode: HttpStatus.BAD_REQUEST,
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },

  // ==================== AUTHENTICATION ERRORS ====================
  AUTHENTICATION_ERROR: {
    code: 'AUTHENTICATION_ERROR',
    message: 'Authentication required',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHENTICATION_INVALID_CREDENTIALS: {
    code: 'AUTHENTICATION_INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHENTICATION_TOKEN_EXPIRED: {
    code: 'AUTHENTICATION_TOKEN_EXPIRED',
    message: 'Authentication token has expired',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHENTICATION_TOKEN_INVALID: {
    code: 'AUTHENTICATION_TOKEN_INVALID',
    message: 'Invalid authentication token',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHENTICATION_SESSION_EXPIRED: {
    code: 'AUTHENTICATION_SESSION_EXPIRED',
    message: 'Session has expired',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHENTICATION_MFA_REQUIRED: {
    code: 'AUTHENTICATION_MFA_REQUIRED',
    message: 'Multi-factor authentication required',
    statusCode: HttpStatus.UNAUTHORIZED,
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },

  // ==================== AUTHORIZATION ERRORS ====================
  AUTHORIZATION_ERROR: {
    code: 'AUTHORIZATION_ERROR',
    message: 'Access forbidden',
    statusCode: HttpStatus.FORBIDDEN,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHORIZATION_INSUFFICIENT_PERMISSIONS: {
    code: 'AUTHORIZATION_INSUFFICIENT_PERMISSIONS',
    message: 'Insufficient permissions to perform this action',
    statusCode: HttpStatus.FORBIDDEN,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHORIZATION_ROLE_REQUIRED: {
    code: 'AUTHORIZATION_ROLE_REQUIRED',
    message: 'Required role not assigned',
    statusCode: HttpStatus.FORBIDDEN,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  AUTHORIZATION_RESOURCE_FORBIDDEN: {
    code: 'AUTHORIZATION_RESOURCE_FORBIDDEN',
    message: 'Access to this resource is forbidden',
    statusCode: HttpStatus.FORBIDDEN,
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },

  // ==================== NOT FOUND ERRORS ====================
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'Resource not found',
    statusCode: HttpStatus.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    message: 'User not found',
    statusCode: HttpStatus.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  PROMPT_NOT_FOUND: {
    code: 'PROMPT_NOT_FOUND',
    message: 'Prompt not found',
    statusCode: HttpStatus.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  PATTERN_NOT_FOUND: {
    code: 'PATTERN_NOT_FOUND',
    message: 'Pattern not found',
    statusCode: HttpStatus.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  ROUTE_NOT_FOUND: {
    code: 'ROUTE_NOT_FOUND',
    message: 'API route not found',
    statusCode: HttpStatus.NOT_FOUND,
    category: ErrorCategory.NOT_FOUND,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },

  // ==================== CONFLICT ERRORS ====================
  CONFLICT_ERROR: {
    code: 'CONFLICT_ERROR',
    message: 'Resource conflict',
    statusCode: HttpStatus.CONFLICT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  USER_ALREADY_EXISTS: {
    code: 'USER_ALREADY_EXISTS',
    message: 'User with this email already exists',
    statusCode: HttpStatus.CONFLICT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  DUPLICATE_PROMPT: {
    code: 'DUPLICATE_PROMPT',
    message: 'A similar prompt already exists',
    statusCode: HttpStatus.CONFLICT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 'RESOURCE_ALREADY_EXISTS',
    message: 'Resource already exists',
    statusCode: HttpStatus.CONFLICT,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },

  // ==================== RATE LIMIT ERRORS ====================
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: true,
  },
  RATE_LIMIT_API_QUOTA: {
    code: 'RATE_LIMIT_API_QUOTA',
    message: 'API quota exceeded',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
  RATE_LIMIT_CONCURRENT_REQUESTS: {
    code: 'RATE_LIMIT_CONCURRENT_REQUESTS',
    message: 'Too many concurrent requests',
    statusCode: HttpStatus.TOO_MANY_REQUESTS,
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },

  // ==================== DATABASE ERRORS ====================
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    isOperational: true,
    retryable: true,
  },
  DATABASE_CONNECTION_ERROR: {
    code: 'DATABASE_CONNECTION_ERROR',
    message: 'Failed to connect to database',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.CRITICAL,
    isOperational: true,
    retryable: true,
  },
  DATABASE_QUERY_ERROR: {
    code: 'DATABASE_QUERY_ERROR',
    message: 'Database query failed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    isOperational: true,
    retryable: true,
  },
  DATABASE_TRANSACTION_ERROR: {
    code: 'DATABASE_TRANSACTION_ERROR',
    message: 'Database transaction failed',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    isOperational: true,
    retryable: true,
  },

  // ==================== EXTERNAL SERVICE ERRORS ====================
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    message: 'External service error',
    statusCode: HttpStatus.BAD_GATEWAY,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
  EXTERNAL_SERVICE_UNAVAILABLE: {
    code: 'EXTERNAL_SERVICE_UNAVAILABLE',
    message: 'External service is unavailable',
    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    isOperational: true,
    retryable: true,
  },
  EXTERNAL_SERVICE_TIMEOUT: {
    code: 'EXTERNAL_SERVICE_TIMEOUT',
    message: 'External service request timed out',
    statusCode: HttpStatus.GATEWAY_TIMEOUT,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
  AI_PROVIDER_ERROR: {
    code: 'AI_PROVIDER_ERROR',
    message: 'AI provider error',
    statusCode: HttpStatus.BAD_GATEWAY,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
  PAYMENT_PROVIDER_ERROR: {
    code: 'PAYMENT_PROVIDER_ERROR',
    message: 'Payment provider error',
    statusCode: HttpStatus.BAD_GATEWAY,
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    isOperational: true,
    retryable: true,
  },

  // ==================== BUSINESS LOGIC ERRORS ====================
  BUSINESS_LOGIC_ERROR: {
    code: 'BUSINESS_LOGIC_ERROR',
    message: 'Business logic violation',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  QUOTA_EXCEEDED: {
    code: 'QUOTA_EXCEEDED',
    message: 'User quota exceeded',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },
  FEATURE_NOT_AVAILABLE: {
    code: 'FEATURE_NOT_AVAILABLE',
    message: 'Feature not available for your plan',
    statusCode: HttpStatus.FORBIDDEN,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    isOperational: true,
    retryable: false,
  },
  INVALID_STATE_TRANSITION: {
    code: 'INVALID_STATE_TRANSITION',
    message: 'Invalid state transition',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: false,
  },

  // ==================== CONFIGURATION ERRORS ====================
  CONFIGURATION_ERROR: {
    code: 'CONFIGURATION_ERROR',
    message: 'Configuration error',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    isOperational: false,
    retryable: false,
  },
  MISSING_ENV_VARIABLE: {
    code: 'MISSING_ENV_VARIABLE',
    message: 'Required environment variable is missing',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    isOperational: false,
    retryable: false,
  },
  INVALID_CONFIGURATION: {
    code: 'INVALID_CONFIGURATION',
    message: 'Invalid configuration',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.CONFIGURATION,
    severity: ErrorSeverity.CRITICAL,
    isOperational: false,
    retryable: false,
  },

  // ==================== SYSTEM ERRORS ====================
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    isOperational: false,
    retryable: false,
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    isOperational: false,
    retryable: false,
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network error occurred',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    message: 'Request timeout',
    statusCode: HttpStatus.GATEWAY_TIMEOUT,
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    isOperational: true,
    retryable: true,
  },
};

/**
 * Get error definition from registry
 */
export function getErrorDefinition(code: ErrorCode): ErrorRegistryEntry | undefined {
  return ERROR_REGISTRY[code];
}

/**
 * Check if error code exists in registry
 */
export function isRegisteredErrorCode(code: string): code is ErrorCode {
  return code in ERROR_REGISTRY;
}

/**
 * Get all error codes by category
 */
export function getErrorsByCategory(category: ErrorCategory): ErrorRegistryEntry[] {
  return Object.values(ERROR_REGISTRY).filter((entry) => entry.category === category);
}

/**
 * Get all error codes by severity
 */
export function getErrorsBySeverity(severity: ErrorSeverity): ErrorRegistryEntry[] {
  return Object.values(ERROR_REGISTRY).filter((entry) => entry.severity === severity);
}

/**
 * Get all retryable errors
 */
export function getRetryableErrors(): ErrorRegistryEntry[] {
  return Object.values(ERROR_REGISTRY).filter((entry) => entry.retryable);
}
