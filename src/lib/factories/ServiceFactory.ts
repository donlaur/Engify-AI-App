/**
 * Service Factory
 *
 * Central factory for creating service instances with dependency injection.
 * Implements the Factory Pattern to ensure consistent service creation.
 *
 * Features:
 * - Dependency injection
 * - Singleton service instances (optional)
 * - Context-aware service creation
 * - Easy mocking for tests
 *
 * Usage:
 * ```typescript
 * const userService = ServiceFactory.createUserService();
 * const apiKeyService = ServiceFactory.createAPIKeyService();
 * ```
 *
 * Benefits:
 * - Centralized dependency management
 * - Easy to swap implementations
 * - Testability
 * - Consistent initialization
 *
 * @module ServiceFactory
 */

import { EnhancedUserService } from '@/lib/services/EnhancedUserService';
import { UserAPIKeyService } from '@/lib/services/UserAPIKeyService';
import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { APIKeyRepository } from '@/lib/repositories/APIKeyRepository';

/**
 * Configuration for service factory
 */
export interface ServiceFactoryConfig {
  /**
   * Use singleton instances
   * If true, services are created once and reused
   */
  useSingletons?: boolean;

  /**
   * Context for service creation (e.g., userId, requestId)
   */
  context?: {
    userId?: string;
    requestId?: string;
    [key: string]: unknown;
  };
}

/**
 * Service Factory
 */
export class ServiceFactory {
  private static config: ServiceFactoryConfig = {
    useSingletons: false,
  };

  private static singletons: Map<string, any> = new Map();

  /**
   * Configure service factory
   */
  public static configure(config: ServiceFactoryConfig): void {
    ServiceFactory.config = { ...ServiceFactory.config, ...config };
  }

  /**
   * Reset all singletons (useful for testing)
   */
  public static resetSingletons(): void {
    ServiceFactory.singletons.clear();
  }

  /**
   * Get or create singleton
   */
  private static getSingleton<T>(
    key: string,
    factory: () => T
  ): T {
    if (!ServiceFactory.config.useSingletons) {
      return factory();
    }

    if (!ServiceFactory.singletons.has(key)) {
      ServiceFactory.singletons.set(key, factory());
    }

    return ServiceFactory.singletons.get(key);
  }

  // ==========================================================================
  // Repository Factories
  // ==========================================================================

  /**
   * Create EnhancedUserRepository
   */
  public static createUserRepository(): EnhancedUserRepository {
    return ServiceFactory.getSingleton(
      'EnhancedUserRepository',
      () => new EnhancedUserRepository()
    );
  }

  /**
   * Create APIKeyRepository
   */
  public static createAPIKeyRepository(): APIKeyRepository {
    return ServiceFactory.getSingleton(
      'APIKeyRepository',
      () => new APIKeyRepository()
    );
  }

  // ==========================================================================
  // Service Factories
  // ==========================================================================

  /**
   * Create EnhancedUserService with dependencies
   */
  public static createUserService(
    userRepository?: EnhancedUserRepository
  ): EnhancedUserService {
    return ServiceFactory.getSingleton('EnhancedUserService', () => {
      const repo = userRepository || ServiceFactory.createUserRepository();
      return new EnhancedUserService(repo);
    });
  }

  /**
   * Create UserAPIKeyService with dependencies
   */
  public static createAPIKeyService(
    apiKeyRepository?: APIKeyRepository
  ): UserAPIKeyService {
    return ServiceFactory.getSingleton('UserAPIKeyService', () => {
      const repo = apiKeyRepository || ServiceFactory.createAPIKeyRepository();
      return new UserAPIKeyService(repo);
    });
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Create all user-related services
   */
  public static createUserServices(): {
    userService: EnhancedUserService;
    apiKeyService: UserAPIKeyService;
  } {
    return {
      userService: ServiceFactory.createUserService(),
      apiKeyService: ServiceFactory.createAPIKeyService(),
    };
  }

  /**
   * Create service with custom configuration
   */
  public static createWithConfig<T>(
    factory: () => T,
    config: ServiceFactoryConfig
  ): T {
    const previousConfig = ServiceFactory.config;
    ServiceFactory.configure(config);
    const service = factory();
    ServiceFactory.config = previousConfig;
    return service;
  }
}

/**
 * Convenience exports for direct service creation
 */
export const createUserService = () => ServiceFactory.createUserService();
export const createAPIKeyService = () => ServiceFactory.createAPIKeyService();
export const createUserRepository = () => ServiceFactory.createUserRepository();
export const createAPIKeyRepository = () => ServiceFactory.createAPIKeyRepository();
