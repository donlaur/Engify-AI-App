/**
 * Dependency Injection Container
 *
 * Simple DI container for managing dependencies in the Repository Pattern.
 * This container:
 * - Manages singleton instances of repositories and services
 * - Provides type-safe dependency resolution
 * - Enables easy testing with mock implementations
 * - Follows Dependency Inversion Principle
 *
 * SOLID Principles:
 * - Single Responsibility: Manages dependency resolution only
 * - Open/Closed: Can register new dependencies without modifying existing code
 * - Liskov Substitution: All registered implementations are interchangeable
 * - Interface Segregation: Only registers what's needed
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

import {
  IUserRepository,
  IPromptRepository,
} from '../repositories/interfaces/IRepository';
import { UserRepository } from '../repositories/mongodb/UserRepository';
import { PromptRepository } from '../repositories/mongodb/PromptRepository';
import { UserService } from '../services/UserService';
import { PromptService } from '../services/PromptService';
import { vi } from 'vitest';

/**
 * Service identifiers for type-safe registration
 */
export const SERVICE_IDS = {
  USER_REPOSITORY: 'userRepository',
  PROMPT_REPOSITORY: 'promptRepository',
  USER_SERVICE: 'userService',
  PROMPT_SERVICE: 'promptService',
} as const;

type ServiceId = (typeof SERVICE_IDS)[keyof typeof SERVICE_IDS];

/**
 * Service registry type
 */
type ServiceRegistry = {
  [SERVICE_IDS.USER_REPOSITORY]: IUserRepository;
  [SERVICE_IDS.PROMPT_REPOSITORY]: IPromptRepository;
  [SERVICE_IDS.USER_SERVICE]: UserService;
  [SERVICE_IDS.PROMPT_SERVICE]: PromptService;
};

/**
 * Dependency Injection Container
 */
export class DIContainer {
  private services = new Map<ServiceId, unknown>();
  private singletons = new Map<ServiceId, unknown>();

  /**
   * Register a service instance
   */
  register<T extends ServiceId>(id: T, instance: ServiceRegistry[T]): void {
    this.services.set(id, instance);
  }

  /**
   * Register a service factory (for lazy instantiation)
   */
  registerFactory<T extends ServiceId>(
    id: T,
    factory: () => ServiceRegistry[T]
  ): void {
    this.services.set(id, factory);
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T extends ServiceId>(
    id: T,
    factory: () => ServiceRegistry[T]
  ): void {
    this.singletons.set(id, factory);
  }

  /**
   * Resolve a service by ID
   */
  resolve<T extends ServiceId>(id: T): ServiceRegistry[T] {
    // Check singletons first
    if (this.singletons.has(id)) {
      if (!this.services.has(id)) {
        const factory = this.singletons.get(id) as
          | (() => ServiceRegistry[T])
          | undefined;
        if (!factory) throw new Error(`Service '${id}' not registered`);
        this.services.set(id, factory());
      }
      return this.services.get(id) as ServiceRegistry[T];
    }

    // Check regular services
    if (this.services.has(id)) {
      const service = this.services.get(id) as
        | ServiceRegistry[T]
        | (() => ServiceRegistry[T]);

      // If it's a factory function, call it
      if (typeof service === 'function') {
        return (service as () => ServiceRegistry[T])();
      }
      return service as ServiceRegistry[T];
    }

    throw new Error(`Service '${id}' not registered`);
  }

  /**
   * Check if a service is registered
   */
  has(id: ServiceId): boolean {
    return this.services.has(id) || this.singletons.has(id);
  }

  /**
   * Clear all registered services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.singletons.clear();
  }

  /**
   * Get all registered service IDs
   */
  getRegisteredServices(): ServiceId[] {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.singletons.keys()),
    ];
  }
}

/**
 * Default container instance
 */
export const container = new DIContainer();

/**
 * Initialize default services
 * This sets up the default implementation with MongoDB repositories
 */
export function initializeDefaultServices(): void {
  // Register repositories as singletons
  container.registerSingleton(SERVICE_IDS.USER_REPOSITORY, () => {
    return new UserRepository();
  });

  container.registerSingleton(SERVICE_IDS.PROMPT_REPOSITORY, () => {
    return new PromptRepository();
  });

  // Register services as singletons (they depend on repositories)
  container.registerSingleton(SERVICE_IDS.USER_SERVICE, () => {
    const userRepository = container.resolve(SERVICE_IDS.USER_REPOSITORY);
    return new UserService(userRepository);
  });

  container.registerSingleton(SERVICE_IDS.PROMPT_SERVICE, () => {
    const promptRepository = container.resolve(SERVICE_IDS.PROMPT_REPOSITORY);
    return new PromptService(promptRepository);
  });
}

/**
 * Convenience functions for common service resolution
 */
export const getUserService = (): UserService => {
  return container.resolve(SERVICE_IDS.USER_SERVICE);
};

export const getPromptService = (): PromptService => {
  return container.resolve(SERVICE_IDS.PROMPT_SERVICE);
};

export const getUserRepository = (): IUserRepository => {
  return container.resolve(SERVICE_IDS.USER_REPOSITORY);
};

export const getPromptRepository = (): IPromptRepository => {
  return container.resolve(SERVICE_IDS.PROMPT_REPOSITORY);
};

/**
 * Testing utilities
 */
export class TestDIContainer extends DIContainer {
  /**
   * Register mock implementations for testing
   */
  registerMocks(): void {
    // Mock repositories
    const mockUserRepository: IUserRepository = {
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
      updateLastLogin: vi.fn(),
      findByOrganization: vi.fn(),
    };

    const mockPromptRepository: IPromptRepository = {
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
      findByRole: vi.fn(),
      findByDifficulty: vi.fn(),
      findPublic: vi.fn(),
      findFeatured: vi.fn(),
      search: vi.fn(),
      incrementViews: vi.fn(),
      updateRating: vi.fn(),
    };

    this.register(SERVICE_IDS.USER_REPOSITORY, mockUserRepository);
    this.register(SERVICE_IDS.PROMPT_REPOSITORY, mockPromptRepository);

    // Mock services
    const mockUserService = new UserService(mockUserRepository);
    const mockPromptService = new PromptService(mockPromptRepository);

    this.register(SERVICE_IDS.USER_SERVICE, mockUserService);
    this.register(SERVICE_IDS.PROMPT_SERVICE, mockPromptService);
  }
}

// Initialize default services when module is imported
initializeDefaultServices();
