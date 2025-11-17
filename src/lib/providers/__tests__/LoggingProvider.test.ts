/**
 * LoggingProvider Tests
 *
 * Tests for the LoggingProvider singleton.
 * Covers:
 * - Singleton behavior
 * - Context management
 * - Log level methods (info, warn, error, debug)
 * - API logging methods
 * - Audit logging
 * - Performance tracking
 * - Child logger creation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoggingProvider } from '../LoggingProvider';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';

// Mock logger and auditLog
vi.mock('@/lib/logging/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    apiRequest: vi.fn(),
    apiError: vi.fn(),
  },
}));

vi.mock('@/lib/logging/audit', () => ({
  auditLog: vi.fn().mockResolvedValue(undefined),
}));

describe('LoggingProvider', () => {
  let loggingProvider: LoggingProvider;

  beforeEach(() => {
    // Reset singleton
    LoggingProvider.resetInstance();
    loggingProvider = LoggingProvider.getInstance();

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    LoggingProvider.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      // Arrange & Act
      const instance1 = LoggingProvider.getInstance();
      const instance2 = LoggingProvider.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      // Arrange
      const instance1 = LoggingProvider.getInstance();

      // Act
      LoggingProvider.resetInstance();
      const instance2 = LoggingProvider.getInstance();

      // Assert
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Context Management', () => {
    it('should set and get context', () => {
      // Arrange
      const context = { userId: 'user-123', route: '/api/test' };

      // Act
      loggingProvider.setContext(context);
      const result = loggingProvider.getContext();

      // Assert
      expect(result).toEqual(context);
    });

    it('should merge context on multiple sets', () => {
      // Arrange
      loggingProvider.setContext({ userId: 'user-123' });
      loggingProvider.setContext({ route: '/api/test' });

      // Act
      const context = loggingProvider.getContext();

      // Assert
      expect(context).toEqual({
        userId: 'user-123',
        route: '/api/test',
      });
    });

    it('should clear context', () => {
      // Arrange
      loggingProvider.setContext({ userId: 'user-123' });

      // Act
      loggingProvider.clearContext();
      const context = loggingProvider.getContext();

      // Assert
      expect(context).toEqual({});
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      // Act
      loggingProvider.info('Test message');

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Test message', {
        timestamp: expect.any(String),
      });
    });

    it('should log info message with metadata', () => {
      // Act
      loggingProvider.info('Test message', { userId: 'user-123' });

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Test message', {
        userId: 'user-123',
        timestamp: expect.any(String),
      });
    });

    it('should enrich metadata with context', () => {
      // Arrange
      loggingProvider.setContext({ route: '/api/test' });

      // Act
      loggingProvider.info('Test message', { userId: 'user-123' });

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Test message', {
        route: '/api/test',
        userId: 'user-123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      // Act
      loggingProvider.warn('Warning message');

      // Assert
      expect(logger.warn).toHaveBeenCalledWith('Warning message', {
        timestamp: expect.any(String),
      });
    });

    it('should log warning with metadata', () => {
      // Act
      loggingProvider.warn('Warning message', { reason: 'test' });

      // Assert
      expect(logger.warn).toHaveBeenCalledWith('Warning message', {
        reason: 'test',
        timestamp: expect.any(String),
      });
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      loggingProvider.error('Error occurred', error);

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Error occurred', {
        error: 'Test error',
        stack: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should log error with metadata', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      loggingProvider.error('Error occurred', error, { userId: 'user-123' });

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Error occurred', {
        userId: 'user-123',
        error: 'Test error',
        stack: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should handle non-Error objects', () => {
      // Act
      loggingProvider.error('Error occurred', 'string error');

      // Assert
      expect(logger.error).toHaveBeenCalledWith('Error occurred', {
        error: 'string error',
        stack: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      // Act
      loggingProvider.debug('Debug message');

      // Assert
      expect(logger.debug).toHaveBeenCalledWith('Debug message', {
        timestamp: expect.any(String),
      });
    });
  });

  describe('apiRequest', () => {
    it('should log API request', () => {
      // Act
      loggingProvider.apiRequest('/api/users');

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith('/api/users', {
        timestamp: expect.any(String),
      });
    });

    it('should log API request with context', () => {
      // Act
      loggingProvider.apiRequest('/api/users', { method: 'POST' });

      // Assert
      expect(logger.apiRequest).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        timestamp: expect.any(String),
      });
    });
  });

  describe('apiError', () => {
    it('should log API error', () => {
      // Arrange
      const error = new Error('API error');

      // Act
      loggingProvider.apiError('/api/users', error);

      // Assert
      expect(logger.apiError).toHaveBeenCalledWith('/api/users', error, {
        route: '/api/users',
        timestamp: expect.any(String),
      });
    });

    it('should log API error with context', () => {
      // Arrange
      const error = new Error('API error');

      // Act
      loggingProvider.apiError('/api/users', error, { statusCode: 500 });

      // Assert
      expect(logger.apiError).toHaveBeenCalledWith('/api/users', error, {
        route: '/api/users',
        statusCode: 500,
        timestamp: expect.any(String),
      });
    });
  });

  describe('apiSuccess', () => {
    it('should log API success', () => {
      // Act
      loggingProvider.apiSuccess('/api/users', 200, 150);

      // Assert
      expect(logger.info).toHaveBeenCalledWith('API success', {
        route: '/api/users',
        statusCode: 200,
        duration: 150,
        type: 'api_success',
        timestamp: expect.any(String),
      });
    });

    it('should log API success with context', () => {
      // Act
      loggingProvider.apiSuccess('/api/users', 200, 150, { userId: 'user-123' });

      // Assert
      expect(logger.info).toHaveBeenCalledWith('API success', {
        userId: 'user-123',
        route: '/api/users',
        statusCode: 200,
        duration: 150,
        type: 'api_success',
        timestamp: expect.any(String),
      });
    });
  });

  describe('audit', () => {
    it('should create audit log', async () => {
      // Act
      await loggingProvider.audit('user_signup', {
        userId: 'user-123',
        resource: 'users',
        severity: 'info',
      });

      // Assert
      expect(auditLog).toHaveBeenCalledWith({
        action: 'user_signup',
        userId: 'user-123',
        resource: 'users',
        severity: 'info',
        details: undefined,
      });
    });

    it('should use default severity', async () => {
      // Act
      await loggingProvider.audit('user_login', {
        userId: 'user-123',
      });

      // Assert
      expect(auditLog).toHaveBeenCalledWith({
        action: 'user_login',
        userId: 'user-123',
        resource: undefined,
        severity: 'info',
        details: undefined,
      });
    });
  });

  describe('performance', () => {
    it('should log performance metric', () => {
      // Act
      loggingProvider.performance('database_query', 250);

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Performance metric', {
        operation: 'database_query',
        duration: 250,
        type: 'performance',
        timestamp: expect.any(String),
      });
    });

    it('should log performance metric with context', () => {
      // Act
      loggingProvider.performance('database_query', 250, { query: 'findOne' });

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Performance metric', {
        query: 'findOne',
        operation: 'database_query',
        duration: 250,
        type: 'performance',
        timestamp: expect.any(String),
      });
    });
  });

  describe('child', () => {
    it('should create child logger with additional context', () => {
      // Arrange
      loggingProvider.setContext({ requestId: 'req-123' });

      // Act
      const child = loggingProvider.child({ service: 'UserService' });
      child.info('Child message');

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Child message', {
        requestId: 'req-123',
        service: 'UserService',
        timestamp: expect.any(String),
      });
    });

    it('should not affect parent context', () => {
      // Arrange
      loggingProvider.setContext({ requestId: 'req-123' });
      const child = loggingProvider.child({ service: 'UserService' });

      // Act
      child.info('Child message');
      loggingProvider.info('Parent message');

      // Assert
      expect(logger.info).toHaveBeenNthCalledWith(1, 'Child message', {
        requestId: 'req-123',
        service: 'UserService',
        timestamp: expect.any(String),
      });
      expect(logger.info).toHaveBeenNthCalledWith(2, 'Parent message', {
        requestId: 'req-123',
        timestamp: expect.any(String),
      });
    });
  });

  describe('time', () => {
    it('should time async operation and log performance', async () => {
      // Arrange
      const operation = vi.fn().mockResolvedValue('result');

      // Act
      const result = await loggingProvider.time('test_operation', operation);

      // Assert
      expect(result).toBe('result');
      expect(operation).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('Performance metric', {
        operation: 'test_operation',
        duration: expect.any(Number),
        type: 'performance',
        timestamp: expect.any(String),
      });
    });

    it('should log error on operation failure', async () => {
      // Arrange
      const error = new Error('Operation failed');
      const operation = vi.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(
        loggingProvider.time('test_operation', operation)
      ).rejects.toThrow('Operation failed');

      expect(logger.error).toHaveBeenCalledWith('test_operation failed', {
        error: 'Operation failed',
        stack: expect.any(String),
        duration: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it('should time operation with context', async () => {
      // Arrange
      const operation = vi.fn().mockResolvedValue('result');

      // Act
      await loggingProvider.time('test_operation', operation, { extra: 'data' });

      // Assert
      expect(logger.info).toHaveBeenCalledWith('Performance metric', {
        extra: 'data',
        operation: 'test_operation',
        duration: expect.any(Number),
        type: 'performance',
        timestamp: expect.any(String),
      });
    });
  });
});
