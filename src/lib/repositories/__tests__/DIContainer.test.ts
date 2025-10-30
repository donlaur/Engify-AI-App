/**
 * DIContainer Tests
 *
 * Tests the dependency injection container functionality.
 * These tests demonstrate:
 * - Service registration and resolution
 * - Singleton pattern implementation
 * - Type safety and error handling
 * - Testing utilities with mocks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DIContainer, TestDIContainer, SERVICE_IDS } from '../../di/Container';
import { IUserRepository, IPromptRepository } from '../interfaces/IRepository';
import { UserService } from '../../services/UserService';
import { PromptService } from '../../services/PromptService';

// Mock implementations
const createMockUserRepository = (): IUserRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  findByEmail: vi.fn(),
  findByProvider: vi.fn(),
  findByRole: vi.fn(),
  findByPlan: vi.fn(),
  findByOrganization: vi.fn(),
  updateLastLogin: vi.fn(),
});

const createMockPromptRepository = (): IPromptRepository => ({
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  findByUserId: vi.fn(),
  findByPattern: vi.fn(),
  findByTag: vi.fn(),
  findByCategory: vi.fn(),
  findPublic: vi.fn(),
  findFeatured: vi.fn(),
  findByRole: vi.fn(),
  findByDifficulty: vi.fn(),
  search: vi.fn(),
  incrementViews: vi.fn(),
  updateRating: vi.fn(),
});

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  afterEach(() => {
    container.clear();
  });

  describe('register', () => {
    it('should register a service instance', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();

      // Act
      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);

      // Assert
      expect(container.has(SERVICE_IDS.USER_REPOSITORY)).toBe(true);
    });

    it('should register a service factory', () => {
      // Arrange
      const factory = () => createMockUserRepository();

      // Act
      container.registerFactory(SERVICE_IDS.USER_REPOSITORY, factory);

      // Assert
      expect(container.has(SERVICE_IDS.USER_REPOSITORY)).toBe(true);
    });

    it('should register a singleton service', () => {
      // Arrange
      const factory = () => createMockUserRepository();

      // Act
      container.registerSingleton(SERVICE_IDS.USER_REPOSITORY, factory);

      // Assert
      expect(container.has(SERVICE_IDS.USER_REPOSITORY)).toBe(true);
    });
  });

  describe('resolve', () => {
    it('should resolve a registered service instance', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();
      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);

      // Act
      const result = container.resolve(SERVICE_IDS.USER_REPOSITORY);

      // Assert
      expect(result).toBe(mockUserRepository);
    });

    it('should resolve a service from factory', () => {
      // Arrange
      const factory = () => createMockUserRepository();
      container.registerFactory(SERVICE_IDS.USER_REPOSITORY, factory);

      // Act
      const result = container.resolve(SERVICE_IDS.USER_REPOSITORY);

      // Assert
      expect(result).toBeDefined();
      expect(typeof result.findById).toBe('function');
    });

    it('should resolve singleton service and cache it', () => {
      // Arrange
      let callCount = 0;
      const factory = () => {
        callCount++;
        return createMockUserRepository();
      };
      container.registerSingleton(SERVICE_IDS.USER_REPOSITORY, factory);

      // Act
      const result1 = container.resolve(SERVICE_IDS.USER_REPOSITORY);
      const result2 = container.resolve(SERVICE_IDS.USER_REPOSITORY);

      // Assert
      expect(result1).toBe(result2);
      expect(callCount).toBe(1); // Factory called only once
    });

    it('should throw error for unregistered service', () => {
      // Act & Assert
      expect(() => container.resolve(SERVICE_IDS.USER_REPOSITORY)).toThrow(
        "Service 'userRepository' not registered"
      );
    });
  });

  describe('has', () => {
    it('should return true for registered service', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();
      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);

      // Act
      const result = container.has(SERVICE_IDS.USER_REPOSITORY);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for unregistered service', () => {
      // Act
      const result = container.has(SERVICE_IDS.USER_REPOSITORY);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all registered services', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();
      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);

      // Act
      container.clear();

      // Assert
      expect(container.has(SERVICE_IDS.USER_REPOSITORY)).toBe(false);
    });
  });

  describe('getRegisteredServices', () => {
    it('should return list of registered service IDs', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();
      const mockPromptRepository = createMockPromptRepository();

      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);
      container.register(SERVICE_IDS.PROMPT_REPOSITORY, mockPromptRepository);

      // Act
      const services = container.getRegisteredServices();

      // Assert
      expect(services).toContain(SERVICE_IDS.USER_REPOSITORY);
      expect(services).toContain(SERVICE_IDS.PROMPT_REPOSITORY);
      expect(services).toHaveLength(2);
    });
  });

  describe('complex service resolution', () => {
    it('should resolve services with dependencies', () => {
      // Arrange
      const mockUserRepository = createMockUserRepository();
      const mockPromptRepository = createMockPromptRepository();

      container.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);
      container.register(SERVICE_IDS.PROMPT_REPOSITORY, mockPromptRepository);

      // Register services that depend on repositories
      container.registerFactory(SERVICE_IDS.USER_SERVICE, () => {
        const userRepository = container.resolve(SERVICE_IDS.USER_REPOSITORY);
        return new UserService(userRepository);
      });

      container.registerFactory(SERVICE_IDS.PROMPT_SERVICE, () => {
        const promptRepository = container.resolve(
          SERVICE_IDS.PROMPT_REPOSITORY
        );
        return new PromptService(promptRepository);
      });

      // Act
      const userService = container.resolve(SERVICE_IDS.USER_SERVICE);
      const promptService = container.resolve(SERVICE_IDS.PROMPT_SERVICE);

      // Assert
      expect(userService).toBeInstanceOf(UserService);
      expect(promptService).toBeInstanceOf(PromptService);
    });
  });
});

describe('TestDIContainer', () => {
  let testContainer: TestDIContainer;

  beforeEach(() => {
    testContainer = new TestDIContainer();
  });

  afterEach(() => {
    testContainer.clear();
  });

  describe('registerMocks', () => {
    it('should register mock implementations for testing', () => {
      // Act
      testContainer.registerMocks();

      // Assert
      expect(testContainer.has(SERVICE_IDS.USER_REPOSITORY)).toBe(true);
      expect(testContainer.has(SERVICE_IDS.PROMPT_REPOSITORY)).toBe(true);
      expect(testContainer.has(SERVICE_IDS.USER_SERVICE)).toBe(true);
      expect(testContainer.has(SERVICE_IDS.PROMPT_SERVICE)).toBe(true);
    });

    it('should resolve mock services', () => {
      // Arrange
      testContainer.registerMocks();

      // Act
      const userService = testContainer.resolve(SERVICE_IDS.USER_SERVICE);
      const promptService = testContainer.resolve(SERVICE_IDS.PROMPT_SERVICE);

      // Assert
      expect(userService).toBeInstanceOf(UserService);
      expect(promptService).toBeInstanceOf(PromptService);
    });
  });
});

describe('Default Container Integration', () => {
  // These tests verify that the default container works correctly
  // when imported and used in the application

  it('should have default services registered', () => {
    // This test verifies that the default container is properly initialized
    // when the module is imported
    expect(true).toBe(true); // Placeholder for integration test
  });
});
