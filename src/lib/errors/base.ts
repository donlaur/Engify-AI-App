/**
 * Error Registry - Base Error Classes
 *
 * Foundational error classes for the application's error hierarchy
 */

import {
  ErrorCode,
  ErrorMetadata,
  ErrorCategory,
  ErrorSeverity,
  HttpStatus,
  SerializedError,
} from './types';

/**
 * Base Application Error
 *
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: HttpStatus;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly retryable: boolean;
  public readonly metadata: ErrorMetadata;
  public readonly timestamp: Date;
  public cause?: Error;

  constructor(
    message: string,
    options: {
      code: ErrorCode;
      statusCode?: HttpStatus;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      isOperational?: boolean;
      retryable?: boolean;
      metadata?: ErrorMetadata;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = this.constructor.name;

    // Set error properties
    this.code = options.code;
    this.statusCode = options.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    this.category = options.category ?? ErrorCategory.SYSTEM;
    this.severity = options.severity ?? ErrorSeverity.MEDIUM;
    this.isOperational = options.isOperational ?? true;
    this.retryable = options.retryable ?? false;
    this.metadata = options.metadata ?? {};
    this.timestamp = new Date();

    // Maintain proper stack trace for debugging (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the cause if provided
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  /**
   * Serialize error for API response
   */
  public toJSON(): SerializedError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      category: this.category,
      severity: this.severity,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Serialize error for logging (includes stack trace)
   */
  public toLog(): SerializedError & { stack?: string; cause?: unknown } {
    return {
      ...this.toJSON(),
      stack: this.stack,
      cause: this.cause,
    };
  }

  /**
   * Get sanitized error for production (no stack trace, limited metadata)
   */
  public toSanitized(): SerializedError {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        category: this.category,
        timestamp: this.timestamp.toISOString(),
      };
    }

    return this.toJSON();
  }
}

/**
 * Validation Error - For request/data validation failures
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    metadata?: ErrorMetadata & { field?: string; value?: unknown }
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: HttpStatus.BAD_REQUEST,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      isOperational: true,
      retryable: false,
      metadata,
    });
  }
}

/**
 * Authentication Error - For authentication failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', metadata?: ErrorMetadata) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: HttpStatus.UNAUTHORIZED,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      isOperational: true,
      retryable: false,
      metadata,
    });
  }
}

/**
 * Authorization Error - For permission/access control failures
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access forbidden',
    metadata?: ErrorMetadata & { requiredPermission?: string; userRole?: string }
  ) {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      statusCode: HttpStatus.FORBIDDEN,
      category: ErrorCategory.AUTHORIZATION,
      severity: ErrorSeverity.MEDIUM,
      isOperational: true,
      retryable: false,
      metadata,
    });
  }
}

/**
 * Not Found Error - For resource not found scenarios
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Resource',
    metadata?: ErrorMetadata & { resourceId?: string }
  ) {
    super(`${resource} not found`, {
      code: 'NOT_FOUND',
      statusCode: HttpStatus.NOT_FOUND,
      category: ErrorCategory.NOT_FOUND,
      severity: ErrorSeverity.LOW,
      isOperational: true,
      retryable: false,
      metadata: { resource, ...metadata },
    });
  }
}

/**
 * Conflict Error - For resource conflicts (e.g., duplicates)
 */
export class ConflictError extends AppError {
  constructor(
    message: string,
    metadata?: ErrorMetadata & { conflictingResource?: string }
  ) {
    super(message, {
      code: 'CONFLICT_ERROR',
      statusCode: HttpStatus.CONFLICT,
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.LOW,
      isOperational: true,
      retryable: false,
      metadata,
    });
  }
}

/**
 * Rate Limit Error - For rate limiting scenarios
 */
export class RateLimitError extends AppError {
  constructor(
    message?: string,
    metadata?: ErrorMetadata & { resetAt?: Date; limit?: number; current?: number }
  ) {
    const resetAt = metadata?.resetAt;
    const defaultMessage = resetAt
      ? `Rate limit exceeded. Try again after ${resetAt.toISOString()}`
      : 'Rate limit exceeded. Please try again later.';

    super(message || defaultMessage, {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      category: ErrorCategory.RATE_LIMIT,
      severity: ErrorSeverity.LOW,
      isOperational: true,
      retryable: true,
      metadata,
    });
  }
}

/**
 * Database Error - For database operation failures
 */
export class DatabaseError extends AppError {
  constructor(
    message: string,
    metadata?: ErrorMetadata & { operation?: string; collection?: string }
  ) {
    super(message, {
      code: 'DATABASE_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      isOperational: true,
      retryable: true,
      metadata,
    });
  }
}

/**
 * External Service Error - For third-party API failures
 */
export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message?: string,
    metadata?: ErrorMetadata & { serviceResponse?: unknown }
  ) {
    super(message || `External service error: ${service}`, {
      code: 'EXTERNAL_SERVICE_ERROR',
      statusCode: HttpStatus.BAD_GATEWAY,
      category: ErrorCategory.EXTERNAL_SERVICE,
      severity: ErrorSeverity.MEDIUM,
      isOperational: true,
      retryable: true,
      metadata: { service, ...metadata },
    });
  }
}

/**
 * Configuration Error - For configuration/environment issues
 */
export class ConfigurationError extends AppError {
  constructor(
    message: string,
    metadata?: ErrorMetadata & { configKey?: string; expectedValue?: string }
  ) {
    super(message, {
      code: 'CONFIGURATION_ERROR',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.CRITICAL,
      isOperational: false,
      retryable: false,
      metadata,
    });
  }
}

/**
 * Business Logic Error - For domain/business rule violations
 */
export class BusinessLogicError extends AppError {
  constructor(
    message: string,
    metadata?: ErrorMetadata & { rule?: string }
  ) {
    super(message, {
      code: 'BUSINESS_LOGIC_ERROR',
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.MEDIUM,
      isOperational: true,
      retryable: false,
      metadata,
    });
  }
}
