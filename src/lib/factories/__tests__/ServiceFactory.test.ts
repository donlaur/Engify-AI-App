/**
 * ServiceFactory Tests
 *
 * Tests for the ServiceFactory.
 * Covers:
 * - Service creation
 * - Dependency injection
 * - Singleton behavior
 * - Configuration management
 * - Type safety
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ServiceFactory } from '../ServiceFactory';
import { EnhancedUserService } from '@/lib/services/EnhancedUserService';
import { UserAPIKeyService } from '@/lib/services/UserAPIKeyService';
import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { APIKeyRepository } from '@/lib/repositories/APIKeyRepository';

// Mock services and repositories
vi.mock('@/lib/services/EnhancedUserService');
vi.mock('@/lib/services/UserAPIKeyService');
vi.mock('@/lib/repositories/EnhancedUserRepository');
vi.mock('@/lib/repositories/APIKeyRepository');

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Reset factory state before each test
    ServiceFactory.resetSingletons();
    ServiceFactory.configure({ useSingletons: false });
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should configure factory settings', () => {
      // Arrange & Act
      ServiceFactory.configure({ useSingletons: true });

      // Assert - should not throw
      expect(() => ServiceFactory.configure({ useSingletons: false })).not.toThrow();
    });

    it('should merge configuration', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      ServiceFactory.configure({ context: { userId: 'user-123' } });

      // Assert - both settings should be active
      expect(() => ServiceFactory.createUserService()).not.toThrow();
    });
  });

  describe('resetSingletons', () => {
    it('should clear all singleton instances', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });
      const service1 = ServiceFactory.createUserService();

      // Act
      ServiceFactory.resetSingletons();
      const service2 = ServiceFactory.createUserService();

      // Assert
      expect(service1).not.toBe(service2);
    });
  });

  describe('createUserRepository', () => {
    it('should create EnhancedUserRepository', () => {
      // Act
      const repository = ServiceFactory.createUserRepository();

      // Assert
      expect(EnhancedUserRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should return same instance when singletons enabled', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      const repo1 = ServiceFactory.createUserRepository();
      const repo2 = ServiceFactory.createUserRepository();

      // Assert
      expect(repo1).toBe(repo2);
      expect(EnhancedUserRepository).toHaveBeenCalledTimes(1);
    });

    it('should return different instances when singletons disabled', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: false });

      // Act
      const repo1 = ServiceFactory.createUserRepository();
      const repo2 = ServiceFactory.createUserRepository();

      // Assert
      expect(repo1).not.toBe(repo2);
      expect(EnhancedUserRepository).toHaveBeenCalledTimes(2);
    });
  });

  describe('createAPIKeyRepository', () => {
    it('should create APIKeyRepository', () => {
      // Act
      const repository = ServiceFactory.createAPIKeyRepository();

      // Assert
      expect(APIKeyRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should support singleton mode', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      const repo1 = ServiceFactory.createAPIKeyRepository();
      const repo2 = ServiceFactory.createAPIKeyRepository();

      // Assert
      expect(repo1).toBe(repo2);
    });
  });

  describe('createUserService', () => {
    it('should create EnhancedUserService with default repository', () => {
      // Act
      const service = ServiceFactory.createUserService();

      // Assert
      expect(EnhancedUserService).toHaveBeenCalled();
      expect(service).toBeDefined();
    });

    it('should create EnhancedUserService with custom repository', () => {
      // Arrange
      const customRepository = new EnhancedUserRepository();

      // Act
      const service = ServiceFactory.createUserService(customRepository);

      // Assert
      expect(EnhancedUserService).toHaveBeenCalledWith(customRepository);
    });

    it('should return same instance when singletons enabled', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      const service1 = ServiceFactory.createUserService();
      const service2 = ServiceFactory.createUserService();

      // Assert
      expect(service1).toBe(service2);
      expect(EnhancedUserService).toHaveBeenCalledTimes(1);
    });

    it('should return different instances when singletons disabled', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: false });

      // Act
      const service1 = ServiceFactory.createUserService();
      const service2 = ServiceFactory.createUserService();

      // Assert
      expect(service1).not.toBe(service2);
      expect(EnhancedUserService).toHaveBeenCalledTimes(2);
    });
  });

  describe('createAPIKeyService', () => {
    it('should create UserAPIKeyService with default repository', () => {
      // Act
      const service = ServiceFactory.createAPIKeyService();

      // Assert
      expect(UserAPIKeyService).toHaveBeenCalled();
      expect(service).toBeDefined();
    });

    it('should create UserAPIKeyService with custom repository', () => {
      // Arrange
      const customRepository = new APIKeyRepository();

      // Act
      const service = ServiceFactory.createAPIKeyService(customRepository);

      // Assert
      expect(UserAPIKeyService).toHaveBeenCalledWith(customRepository);
    });

    it('should support singleton mode', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      const service1 = ServiceFactory.createAPIKeyService();
      const service2 = ServiceFactory.createAPIKeyService();

      // Assert
      expect(service1).toBe(service2);
    });
  });

  describe('createUserServices', () => {
    it('should create all user-related services', () => {
      // Act
      const services = ServiceFactory.createUserServices();

      // Assert
      expect(services).toHaveProperty('userService');
      expect(services).toHaveProperty('apiKeyService');
      expect(services.userService).toBeDefined();
      expect(services.apiKeyService).toBeDefined();
    });

    it('should create singleton services when configured', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: true });

      // Act
      const services1 = ServiceFactory.createUserServices();
      const services2 = ServiceFactory.createUserServices();

      // Assert
      expect(services1.userService).toBe(services2.userService);
      expect(services1.apiKeyService).toBe(services2.apiKeyService);
    });
  });

  describe('createWithConfig', () => {
    it('should create service with temporary config', () => {
      // Arrange
      const factory = vi.fn(() => 'test-service');

      // Act
      const service = ServiceFactory.createWithConfig(factory, { useSingletons: true });

      // Assert
      expect(service).toBe('test-service');
      expect(factory).toHaveBeenCalled();
    });

    it('should restore previous config after creation', () => {
      // Arrange
      ServiceFactory.configure({ useSingletons: false });
      const factory = vi.fn(() => 'test');

      // Act
      ServiceFactory.createWithConfig(factory, { useSingletons: true });

      // Create another service to check config was restored
      const service1 = ServiceFactory.createUserService();
      const service2 = ServiceFactory.createUserService();

      // Assert - Should be different instances (singletons disabled)
      expect(service1).not.toBe(service2);
    });
  });

  describe('Convenience Exports', () => {
    it('should export createUserService convenience function', () => {
      // Arrange
      const { createUserService } = require('../ServiceFactory');

      // Act
      const service = createUserService();

      // Assert
      expect(service).toBeDefined();
    });

    it('should export createAPIKeyService convenience function', () => {
      // Arrange
      const { createAPIKeyService } = require('../ServiceFactory');

      // Act
      const service = createAPIKeyService();

      // Assert
      expect(service).toBeDefined();
    });

    it('should export createUserRepository convenience function', () => {
      // Arrange
      const { createUserRepository } = require('../ServiceFactory');

      // Act
      const repository = createUserRepository();

      // Assert
      expect(repository).toBeDefined();
    });

    it('should export createAPIKeyRepository convenience function', () => {
      // Arrange
      const { createAPIKeyRepository } = require('../ServiceFactory');

      // Act
      const repository = createAPIKeyRepository();

      // Assert
      expect(repository).toBeDefined();
    });
  });
});
