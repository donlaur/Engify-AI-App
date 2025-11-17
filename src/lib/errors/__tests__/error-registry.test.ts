/**
 * Error Registry - Test Suite
 *
 * Tests for the centralized error handling system
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  ErrorFactory,
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  handleApiError,
  toAppError,
  assertFound,
  assertAuthenticated,
  assertAuthorized,
  HttpStatus,
  ErrorCategory,
  ErrorSeverity,
} from '../index';
import { ZodError, z } from 'zod';

describe('ErrorFactory', () => {
  describe('validation errors', () => {
    it('creates validation error', () => {
      const error = ErrorFactory.validation('Invalid input', 'email', 'bad-email');

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.message).toBe('Invalid input');
      expect(error.metadata.field).toBe('email');
      expect(error.metadata.value).toBe('bad-email');
    });

    it('creates required field error', () => {
      const error = ErrorFactory.requiredField('username');

      expect(error.code).toBe('VALIDATION_FIELD_REQUIRED');
      expect(error.message).toBe("Field 'username' is required");
      expect(error.metadata.field).toBe('username');
    });

    it('creates invalid field error', () => {
      const error = ErrorFactory.invalidField('age', 15, 'Must be 18 or older');

      expect(error.code).toBe('VALIDATION_FIELD_INVALID');
      expect(error.message).toBe("Field 'age' is invalid: Must be 18 or older");
      expect(error.metadata.field).toBe('age');
      expect(error.metadata.value).toBe(15);
      expect(error.metadata.reason).toBe('Must be 18 or older');
    });
  });

  describe('authentication errors', () => {
    it('creates authentication error', () => {
      const error = ErrorFactory.authentication('Please log in');

      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.message).toBe('Please log in');
    });

    it('creates invalid credentials error', () => {
      const error = ErrorFactory.invalidCredentials();

      expect(error.code).toBe('AUTHENTICATION_INVALID_CREDENTIALS');
      expect(error.message).toBe('Invalid email or password');
    });

    it('creates token expired error', () => {
      const error = ErrorFactory.tokenExpired();

      expect(error.code).toBe('AUTHENTICATION_TOKEN_EXPIRED');
    });
  });

  describe('authorization errors', () => {
    it('creates authorization error', () => {
      const error = ErrorFactory.authorization('Admin required', 'admin');

      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(error.metadata.requiredPermission).toBe('admin');
    });

    it('creates insufficient permissions error', () => {
      const error = ErrorFactory.insufficientPermissions('users:delete', 'user');

      expect(error.code).toBe('AUTHORIZATION_INSUFFICIENT_PERMISSIONS');
      expect(error.metadata.requiredPermission).toBe('users:delete');
      expect(error.metadata.userRole).toBe('user');
    });
  });

  describe('not found errors', () => {
    it('creates generic not found error', () => {
      const error = ErrorFactory.notFound('User', '123');

      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(error.category).toBe(ErrorCategory.NOT_FOUND);
      expect(error.message).toBe('User not found');
      expect(error.metadata.resource).toBe('User');
      expect(error.metadata.resourceId).toBe('123');
    });

    it('creates user not found error', () => {
      const error = ErrorFactory.userNotFound('user-123');

      expect(error.code).toBe('USER_NOT_FOUND');
      expect(error.metadata.userId).toBe('user-123');
    });

    it('creates prompt not found error', () => {
      const error = ErrorFactory.promptNotFound('prompt-456');

      expect(error.code).toBe('PROMPT_NOT_FOUND');
      expect(error.metadata.promptId).toBe('prompt-456');
    });
  });

  describe('conflict errors', () => {
    it('creates generic conflict error', () => {
      const error = ErrorFactory.conflict('Resource already exists');

      expect(error.code).toBe('CONFLICT_ERROR');
      expect(error.statusCode).toBe(HttpStatus.CONFLICT);
    });

    it('creates user already exists error', () => {
      const error = ErrorFactory.userAlreadyExists('user@example.com');

      expect(error.code).toBe('USER_ALREADY_EXISTS');
      expect(error.metadata.email).toBe('user@example.com');
    });

    it('creates duplicate prompt error', () => {
      const error = ErrorFactory.duplicatePrompt({ duplicateId: '123' });

      expect(error.code).toBe('DUPLICATE_PROMPT');
      expect(error.metadata.duplicateId).toBe('123');
    });
  });

  describe('rate limit errors', () => {
    it('creates rate limit error with reset date', () => {
      const resetDate = new Date(Date.now() + 60000);
      const error = ErrorFactory.rateLimit(resetDate, 100, 105);

      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(error.retryable).toBe(true);
      expect(error.metadata.resetAt).toBe(resetDate);
      expect(error.metadata.limit).toBe(100);
      expect(error.metadata.current).toBe(105);
    });
  });

  describe('database errors', () => {
    it('creates database error', () => {
      const error = ErrorFactory.database('Query failed', 'findOne', 'users');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.retryable).toBe(true);
      expect(error.metadata.operation).toBe('findOne');
      expect(error.metadata.collection).toBe('users');
    });

    it('creates database connection error', () => {
      const error = ErrorFactory.databaseConnection();

      expect(error.code).toBe('DATABASE_CONNECTION_ERROR');
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('external service errors', () => {
    it('creates external service error', () => {
      const error = ErrorFactory.externalService('OpenAI', 'API timeout');

      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.statusCode).toBe(HttpStatus.BAD_GATEWAY);
      expect(error.metadata.service).toBe('OpenAI');
    });

    it('creates AI provider error', () => {
      const error = ErrorFactory.aiProvider('OpenAI', 'Model unavailable');

      expect(error.code).toBe('AI_PROVIDER_ERROR');
      expect(error.metadata.provider).toBe('OpenAI');
    });
  });

  describe('business logic errors', () => {
    it('creates quota exceeded error', () => {
      const error = ErrorFactory.quotaExceeded(100, 105);

      expect(error.code).toBe('QUOTA_EXCEEDED');
      expect(error.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(error.metadata.quota).toBe(100);
      expect(error.metadata.current).toBe(105);
    });

    it('creates feature not available error', () => {
      const error = ErrorFactory.featureNotAvailable('AI Chat', 'Premium');

      expect(error.code).toBe('FEATURE_NOT_AVAILABLE');
      expect(error.message).toContain('AI Chat');
      expect(error.message).toContain('Premium');
      expect(error.metadata.feature).toBe('AI Chat');
      expect(error.metadata.requiredPlan).toBe('Premium');
    });
  });

  describe('configuration errors', () => {
    it('creates missing env variable error', () => {
      const error = ErrorFactory.missingEnv('DATABASE_URL');

      expect(error.code).toBe('MISSING_ENV_VARIABLE');
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.isOperational).toBe(false);
      expect(error.metadata.envVariable).toBe('DATABASE_URL');
    });
  });

  describe('fromUnknown', () => {
    it('passes through AppError', () => {
      const originalError = ErrorFactory.notFound('User', '123');
      const converted = ErrorFactory.fromUnknown(originalError);

      expect(converted).toBe(originalError);
    });

    it('converts standard Error', () => {
      const originalError = new Error('Something went wrong');
      const converted = ErrorFactory.fromUnknown(originalError);

      expect(converted).toBeInstanceOf(AppError);
      expect(converted.code).toBe('UNKNOWN_ERROR');
      expect(converted.message).toBe('Something went wrong');
    });

    it('converts string error', () => {
      const converted = ErrorFactory.fromUnknown('String error');

      expect(converted).toBeInstanceOf(AppError);
      expect(converted.message).toBe('String error');
    });

    it('converts unknown error type', () => {
      const converted = ErrorFactory.fromUnknown({ weird: 'object' });

      expect(converted).toBeInstanceOf(AppError);
      expect(converted.code).toBe('UNKNOWN_ERROR');
    });
  });
});

describe('AppError', () => {
  it('creates error with all properties', () => {
    const error = new AppError('Test error', {
      code: 'TEST_ERROR',
      statusCode: HttpStatus.BAD_REQUEST,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      isOperational: true,
      retryable: false,
      metadata: { foo: 'bar' },
    });

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.isOperational).toBe(true);
    expect(error.retryable).toBe(false);
    expect(error.metadata.foo).toBe('bar');
    expect(error.timestamp).toBeInstanceOf(Date);
  });

  it('has default values', () => {
    const error = new AppError('Test', { code: 'TEST' });

    expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(error.category).toBe(ErrorCategory.SYSTEM);
    expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    expect(error.isOperational).toBe(true);
    expect(error.retryable).toBe(false);
  });

  describe('serialization', () => {
    const error = ErrorFactory.validation('Test error', 'email', 'bad@email', {
      extra: 'data',
    });

    it('toJSON excludes stack trace', () => {
      const json = error.toJSON();

      expect(json.code).toBe('VALIDATION_ERROR');
      expect(json.message).toBe('Test error');
      expect(json.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(json.metadata).toBeDefined();
      expect(json.timestamp).toBeDefined();
      expect('stack' in json).toBe(false);
    });

    it('toLog includes stack trace', () => {
      const log = error.toLog();

      expect(log.stack).toBeDefined();
    });

    it('toSanitized removes sensitive data in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const sanitized = error.toSanitized();

      expect(sanitized.code).toBe('VALIDATION_ERROR');
      expect(sanitized.message).toBe('Test error');
      expect('metadata' in sanitized).toBe(false);
      expect('stack' in sanitized).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });
});

describe('toAppError', () => {
  it('handles AppError', () => {
    const original = ErrorFactory.notFound('User', '123');
    const converted = toAppError(original);

    expect(converted).toBe(original);
  });

  it('handles ZodError', () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    try {
      schema.parse({ email: 'invalid', age: 15 });
    } catch (error) {
      const converted = toAppError(error);

      expect(converted).toBeInstanceOf(AppError);
      expect(converted.code).toBe('VALIDATION_ERROR');
      expect(converted.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(converted.metadata.validationErrors).toBeDefined();
    }
  });

  it('handles standard Error', () => {
    const error = new Error('Test error');
    const converted = toAppError(error);

    expect(converted).toBeInstanceOf(AppError);
    expect(converted.message).toBe('Test error');
  });
});

describe('Assertion helpers', () => {
  describe('assertFound', () => {
    it('passes when value exists', () => {
      const user = { id: '123', name: 'Test' };
      expect(() => assertFound(user, 'User', '123')).not.toThrow();
    });

    it('throws NotFoundError when value is null', () => {
      expect(() => assertFound(null, 'User', '123')).toThrow(AppError);

      try {
        assertFound(null, 'User', '123');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe('NOT_FOUND');
        expect((error as AppError).metadata.resource).toBe('User');
        expect((error as AppError).metadata.resourceId).toBe('123');
      }
    });

    it('throws when value is undefined', () => {
      expect(() => assertFound(undefined, 'Resource')).toThrow(AppError);
    });
  });

  describe('assertAuthenticated', () => {
    it('passes when condition is true', () => {
      expect(() => assertAuthenticated(true)).not.toThrow();
    });

    it('throws AuthenticationError when condition is false', () => {
      expect(() => assertAuthenticated(false)).toThrow(AppError);

      try {
        assertAuthenticated(false, 'Please log in');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe('AUTHENTICATION_ERROR');
        expect((error as AppError).message).toBe('Please log in');
      }
    });
  });

  describe('assertAuthorized', () => {
    it('passes when condition is true', () => {
      expect(() => assertAuthorized(true)).not.toThrow();
    });

    it('throws AuthorizationError when condition is false', () => {
      expect(() => assertAuthorized(false, 'admin')).toThrow(AppError);

      try {
        assertAuthorized(false, 'admin', 'Admin required');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe('AUTHORIZATION_ERROR');
        expect((error as AppError).message).toBe('Admin required');
      }
    });
  });
});

describe('handleApiError', () => {
  it('handles AppError and returns NextResponse', async () => {
    const error = ErrorFactory.notFound('User', '123');
    const request = new NextRequest('http://localhost/api/test');

    const response = handleApiError(error, request);
    const data = await response.json();

    expect(response.status).toBe(HttpStatus.NOT_FOUND);
    expect(data.error.code).toBe('NOT_FOUND');
    expect(data.error.message).toBe('User not found');
  });

  it('handles unknown error', async () => {
    const error = new Error('Unknown error');
    const request = new NextRequest('http://localhost/api/test');

    const response = handleApiError(error, request);
    const data = await response.json();

    expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(data.error.code).toBe('UNKNOWN_ERROR');
  });

  it('adds retry-after header for rate limit errors', async () => {
    const resetDate = new Date(Date.now() + 60000);
    const error = ErrorFactory.rateLimit(resetDate, 100, 105);
    const request = new NextRequest('http://localhost/api/test');

    const response = handleApiError(error, request);

    expect(response.headers.get('Retry-After')).toBeTruthy();
  });
});

describe('Base error classes', () => {
  it('ValidationError has correct defaults', () => {
    const error = new ValidationError('Invalid input');

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.isOperational).toBe(true);
    expect(error.retryable).toBe(false);
  });

  it('AuthenticationError has correct defaults', () => {
    const error = new AuthenticationError();

    expect(error.code).toBe('AUTHENTICATION_ERROR');
    expect(error.statusCode).toBe(HttpStatus.UNAUTHORIZED);
    expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
  });

  it('NotFoundError has correct defaults', () => {
    const error = new NotFoundError('User');

    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(error.message).toBe('User not found');
  });
});
