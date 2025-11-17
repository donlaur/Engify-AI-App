/**
 * Error Factory - Convenient Error Creation
 *
 * Provides convenient methods for creating errors from the registry
 */

import { AppError } from './base';
import { ErrorCode, ErrorMetadata } from './types';
import { getErrorDefinition, isRegisteredErrorCode } from './registry';

/**
 * Error Factory - Create errors from registry codes
 */
export class ErrorFactory {
  /**
   * Create an error from a registered error code
   */
  static fromCode(
    code: ErrorCode,
    customMessage?: string,
    metadata?: ErrorMetadata
  ): AppError {
    const definition = getErrorDefinition(code);

    if (!definition) {
      // If code not found, create a generic error
      return new AppError(customMessage || 'An error occurred', {
        code: 'UNKNOWN_ERROR',
        metadata,
      });
    }

    return new AppError(customMessage || definition.message, {
      code: definition.code,
      statusCode: definition.statusCode,
      category: definition.category,
      severity: definition.severity,
      isOperational: definition.isOperational,
      retryable: definition.retryable,
      metadata,
    });
  }

  /**
   * Create a validation error with field details
   */
  static validation(
    message: string,
    field?: string,
    value?: unknown,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('VALIDATION_ERROR', message, {
      field,
      value,
      ...metadata,
    });
  }

  /**
   * Create a validation error for a required field
   */
  static requiredField(field: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode(
      'VALIDATION_FIELD_REQUIRED',
      `Field '${field}' is required`,
      {
        field,
        ...metadata,
      }
    );
  }

  /**
   * Create a validation error for an invalid field
   */
  static invalidField(
    field: string,
    value: unknown,
    reason?: string,
    metadata?: ErrorMetadata
  ): AppError {
    const message = reason
      ? `Field '${field}' is invalid: ${reason}`
      : `Field '${field}' is invalid`;

    return ErrorFactory.fromCode('VALIDATION_FIELD_INVALID', message, {
      field,
      value,
      reason,
      ...metadata,
    });
  }

  /**
   * Create an authentication error
   */
  static authentication(message?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('AUTHENTICATION_ERROR', message, metadata);
  }

  /**
   * Create an invalid credentials error
   */
  static invalidCredentials(metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('AUTHENTICATION_INVALID_CREDENTIALS', undefined, metadata);
  }

  /**
   * Create a token expired error
   */
  static tokenExpired(metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('AUTHENTICATION_TOKEN_EXPIRED', undefined, metadata);
  }

  /**
   * Create an authorization error
   */
  static authorization(
    message?: string,
    requiredPermission?: string,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('AUTHORIZATION_ERROR', message, {
      requiredPermission,
      ...metadata,
    });
  }

  /**
   * Create an insufficient permissions error
   */
  static insufficientPermissions(
    requiredPermission: string,
    userRole?: string,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('AUTHORIZATION_INSUFFICIENT_PERMISSIONS', undefined, {
      requiredPermission,
      userRole,
      ...metadata,
    });
  }

  /**
   * Create a not found error
   */
  static notFound(resource: string, resourceId?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('NOT_FOUND', `${resource} not found`, {
      resource,
      resourceId,
      ...metadata,
    });
  }

  /**
   * Create a user not found error
   */
  static userNotFound(userId?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('USER_NOT_FOUND', undefined, {
      userId,
      ...metadata,
    });
  }

  /**
   * Create a prompt not found error
   */
  static promptNotFound(promptId?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('PROMPT_NOT_FOUND', undefined, {
      promptId,
      ...metadata,
    });
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('CONFLICT_ERROR', message, metadata);
  }

  /**
   * Create a user already exists error
   */
  static userAlreadyExists(email: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('USER_ALREADY_EXISTS', undefined, {
      email,
      ...metadata,
    });
  }

  /**
   * Create a duplicate prompt error
   */
  static duplicatePrompt(metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('DUPLICATE_PROMPT', undefined, metadata);
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(
    resetAt?: Date,
    limit?: number,
    current?: number,
    metadata?: ErrorMetadata
  ): AppError {
    const message = resetAt
      ? `Rate limit exceeded. Try again after ${resetAt.toISOString()}`
      : 'Rate limit exceeded';

    return ErrorFactory.fromCode('RATE_LIMIT_EXCEEDED', message, {
      resetAt,
      limit,
      current,
      ...metadata,
    });
  }

  /**
   * Create a database error
   */
  static database(
    message: string,
    operation?: string,
    collection?: string,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('DATABASE_ERROR', message, {
      operation,
      collection,
      ...metadata,
    });
  }

  /**
   * Create a database connection error
   */
  static databaseConnection(metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('DATABASE_CONNECTION_ERROR', undefined, metadata);
  }

  /**
   * Create an external service error
   */
  static externalService(
    service: string,
    message?: string,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode(
      'EXTERNAL_SERVICE_ERROR',
      message || `External service error: ${service}`,
      {
        service,
        ...metadata,
      }
    );
  }

  /**
   * Create an AI provider error
   */
  static aiProvider(provider: string, message?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('AI_PROVIDER_ERROR', message, {
      provider,
      ...metadata,
    });
  }

  /**
   * Create a business logic error
   */
  static businessLogic(message: string, rule?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('BUSINESS_LOGIC_ERROR', message, {
      rule,
      ...metadata,
    });
  }

  /**
   * Create a quota exceeded error
   */
  static quotaExceeded(
    quota: number,
    current: number,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('QUOTA_EXCEEDED', undefined, {
      quota,
      current,
      ...metadata,
    });
  }

  /**
   * Create a feature not available error
   */
  static featureNotAvailable(
    feature: string,
    requiredPlan?: string,
    metadata?: ErrorMetadata
  ): AppError {
    const message = requiredPlan
      ? `Feature '${feature}' requires ${requiredPlan} plan`
      : `Feature '${feature}' is not available`;

    return ErrorFactory.fromCode('FEATURE_NOT_AVAILABLE', message, {
      feature,
      requiredPlan,
      ...metadata,
    });
  }

  /**
   * Create a configuration error
   */
  static configuration(
    message: string,
    configKey?: string,
    metadata?: ErrorMetadata
  ): AppError {
    return ErrorFactory.fromCode('CONFIGURATION_ERROR', message, {
      configKey,
      ...metadata,
    });
  }

  /**
   * Create a missing environment variable error
   */
  static missingEnv(envVariable: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode(
      'MISSING_ENV_VARIABLE',
      `Missing required environment variable: ${envVariable}`,
      {
        envVariable,
        ...metadata,
      }
    );
  }

  /**
   * Create an internal error
   */
  static internal(message?: string, metadata?: ErrorMetadata): AppError {
    return ErrorFactory.fromCode('INTERNAL_ERROR', message, metadata);
  }

  /**
   * Convert unknown error to AppError
   */
  static fromUnknown(error: unknown, defaultMessage?: string): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Standard Error
    if (error instanceof Error) {
      return new AppError(error.message || defaultMessage || 'An error occurred', {
        code: 'UNKNOWN_ERROR',
        metadata: {
          originalError: error.name,
          stack: error.stack,
        },
        cause: error,
      });
    }

    // String error
    if (typeof error === 'string') {
      return new AppError(error, {
        code: 'UNKNOWN_ERROR',
      });
    }

    // Unknown error type
    return new AppError(defaultMessage || 'An unknown error occurred', {
      code: 'UNKNOWN_ERROR',
      metadata: {
        originalError: error,
      },
    });
  }
}

/**
 * Convenience function to create errors
 */
export const createError = ErrorFactory.fromCode;

/**
 * Convenience function to check if string is a valid error code
 */
export { isRegisteredErrorCode };
