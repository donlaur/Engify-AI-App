/**
 * RepositoryFactory Tests
 *
 * Tests for the RepositoryFactory.
 * Covers:
 * - Repository creation by type
 * - Singleton behavior
 * - Type safety
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RepositoryFactory } from '../RepositoryFactory';
import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { APIKeyRepository } from '@/lib/repositories/APIKeyRepository';

// Mock repositories
vi.mock('@/lib/repositories/EnhancedUserRepository');
vi.mock('@/lib/repositories/APIKeyRepository');

describe('RepositoryFactory', () => {
  beforeEach(() => {
    // Reset factory state before each test
    RepositoryFactory.resetSingletons();
    RepositoryFactory.disableSingletons();
    vi.clearAllMocks();
  });

  describe('Singleton Mode', () => {
    it('should enable singleton mode', () => {
      // Act
      RepositoryFactory.enableSingletons();

      // Assert
      const repo1 = RepositoryFactory.createUserRepository();
      const repo2 = RepositoryFactory.createUserRepository();
      expect(repo1).toBe(repo2);
    });

    it('should disable singleton mode', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      RepositoryFactory.disableSingletons();

      // Assert
      const repo1 = RepositoryFactory.createUserRepository();
      const repo2 = RepositoryFactory.createUserRepository();
      expect(repo1).not.toBe(repo2);
    });

    it('should clear singletons when disabling', () => {
      // Arrange
      RepositoryFactory.enableSingletons();
      const repo1 = RepositoryFactory.createUserRepository();

      // Act
      RepositoryFactory.disableSingletons();
      RepositoryFactory.enableSingletons();
      const repo2 = RepositoryFactory.createUserRepository();

      // Assert
      expect(repo1).not.toBe(repo2);
    });
  });

  describe('resetSingletons', () => {
    it('should clear all singleton instances', () => {
      // Arrange
      RepositoryFactory.enableSingletons();
      const repo1 = RepositoryFactory.createUserRepository();

      // Act
      RepositoryFactory.resetSingletons();
      const repo2 = RepositoryFactory.createUserRepository();

      // Assert
      expect(repo1).not.toBe(repo2);
    });
  });

  describe('create', () => {
    it('should create user repository by type', () => {
      // Act
      const repository = RepositoryFactory.create('user');

      // Assert
      expect(EnhancedUserRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should create apiKey repository by type', () => {
      // Act
      const repository = RepositoryFactory.create('apiKey');

      // Assert
      expect(APIKeyRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should throw error for unknown repository type', () => {
      // Act & Assert
      expect(() => RepositoryFactory.create('unknown' as any)).toThrow('Unknown repository type: unknown');
    });

    it('should return same instance when singletons enabled', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      const repo1 = RepositoryFactory.create('user');
      const repo2 = RepositoryFactory.create('user');

      // Assert
      expect(repo1).toBe(repo2);
      expect(EnhancedUserRepository).toHaveBeenCalledTimes(1);
    });

    it('should return different instances when singletons disabled', () => {
      // Act
      const repo1 = RepositoryFactory.create('user');
      const repo2 = RepositoryFactory.create('user');

      // Assert
      expect(repo1).not.toBe(repo2);
      expect(EnhancedUserRepository).toHaveBeenCalledTimes(2);
    });

    it('should cache different repository types separately', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      const userRepo1 = RepositoryFactory.create('user');
      const apiKeyRepo1 = RepositoryFactory.create('apiKey');
      const userRepo2 = RepositoryFactory.create('user');
      const apiKeyRepo2 = RepositoryFactory.create('apiKey');

      // Assert
      expect(userRepo1).toBe(userRepo2);
      expect(apiKeyRepo1).toBe(apiKeyRepo2);
      expect(userRepo1).not.toBe(apiKeyRepo1);
    });
  });

  describe('createUserRepository', () => {
    it('should create EnhancedUserRepository', () => {
      // Act
      const repository = RepositoryFactory.createUserRepository();

      // Assert
      expect(EnhancedUserRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should support singleton mode', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      const repo1 = RepositoryFactory.createUserRepository();
      const repo2 = RepositoryFactory.createUserRepository();

      // Assert
      expect(repo1).toBe(repo2);
    });
  });

  describe('createAPIKeyRepository', () => {
    it('should create APIKeyRepository', () => {
      // Act
      const repository = RepositoryFactory.createAPIKeyRepository();

      // Assert
      expect(APIKeyRepository).toHaveBeenCalled();
      expect(repository).toBeDefined();
    });

    it('should support singleton mode', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      const repo1 = RepositoryFactory.createAPIKeyRepository();
      const repo2 = RepositoryFactory.createAPIKeyRepository();

      // Assert
      expect(repo1).toBe(repo2);
    });
  });

  describe('createAll', () => {
    it('should create all repository types', () => {
      // Act
      const repositories = RepositoryFactory.createAll();

      // Assert
      expect(repositories).toHaveProperty('user');
      expect(repositories).toHaveProperty('apiKey');
      expect(repositories.user).toBeDefined();
      expect(repositories.apiKey).toBeDefined();
    });

    it('should respect singleton mode for all repositories', () => {
      // Arrange
      RepositoryFactory.enableSingletons();

      // Act
      const repos1 = RepositoryFactory.createAll();
      const repos2 = RepositoryFactory.createAll();

      // Assert
      expect(repos1.user).toBe(repos2.user);
      expect(repos1.apiKey).toBe(repos2.apiKey);
    });
  });

  describe('Convenience Exports', () => {
    it('should export createUserRepository convenience function', () => {
      // Arrange
      const { createUserRepository } = require('../RepositoryFactory');

      // Act
      const repository = createUserRepository();

      // Assert
      expect(repository).toBeDefined();
    });

    it('should export createAPIKeyRepository convenience function', () => {
      // Arrange
      const { createAPIKeyRepository } = require('../RepositoryFactory');

      // Act
      const repository = createAPIKeyRepository();

      // Assert
      expect(repository).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should return correctly typed repository for user type', () => {
      // Act
      const repository = RepositoryFactory.create('user');

      // Assert - TypeScript should recognize this as EnhancedUserRepository
      expect(repository).toBeDefined();
    });

    it('should return correctly typed repository for apiKey type', () => {
      // Act
      const repository = RepositoryFactory.create('apiKey');

      // Assert - TypeScript should recognize this as APIKeyRepository
      expect(repository).toBeDefined();
    });
  });
});
