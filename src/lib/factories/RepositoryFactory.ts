/**
 * Repository Factory
 *
 * Central factory for creating repository instances.
 * Provides consistent repository creation and dependency management.
 *
 * Features:
 * - Type-safe repository creation
 * - Singleton support
 * - Easy mocking for tests
 * - Centralized configuration
 *
 * Usage:
 * ```typescript
 * const userRepo = RepositoryFactory.create('user');
 * const apiKeyRepo = RepositoryFactory.create('apiKey');
 * ```
 *
 * @module RepositoryFactory
 */

import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { APIKeyRepository } from '@/lib/repositories/APIKeyRepository';

/**
 * Repository types
 */
export type RepositoryType = 'user' | 'apiKey';

/**
 * Repository map
 */
type RepositoryMap = {
  user: EnhancedUserRepository;
  apiKey: APIKeyRepository;
};

/**
 * Repository Factory
 */
export class RepositoryFactory {
  private static singletons: Map<RepositoryType, any> = new Map();
  private static useSingletons: boolean = false;

  /**
   * Enable singleton mode
   */
  public static enableSingletons(): void {
    RepositoryFactory.useSingletons = true;
  }

  /**
   * Disable singleton mode
   */
  public static disableSingletons(): void {
    RepositoryFactory.useSingletons = false;
    RepositoryFactory.singletons.clear();
  }

  /**
   * Reset all singletons
   */
  public static resetSingletons(): void {
    RepositoryFactory.singletons.clear();
  }

  /**
   * Create repository by type
   */
  public static create<T extends RepositoryType>(
    type: T
  ): RepositoryMap[T] {
    if (RepositoryFactory.useSingletons && RepositoryFactory.singletons.has(type)) {
      return RepositoryFactory.singletons.get(type);
    }

    let repository: any;

    switch (type) {
      case 'user':
        repository = new EnhancedUserRepository();
        break;
      case 'apiKey':
        repository = new APIKeyRepository();
        break;
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }

    if (RepositoryFactory.useSingletons) {
      RepositoryFactory.singletons.set(type, repository);
    }

    return repository;
  }

  /**
   * Create EnhancedUserRepository
   */
  public static createUserRepository(): EnhancedUserRepository {
    return RepositoryFactory.create('user');
  }

  /**
   * Create APIKeyRepository
   */
  public static createAPIKeyRepository(): APIKeyRepository {
    return RepositoryFactory.create('apiKey');
  }

  /**
   * Create all repositories
   */
  public static createAll(): RepositoryMap {
    return {
      user: RepositoryFactory.createUserRepository(),
      apiKey: RepositoryFactory.createAPIKeyRepository(),
    };
  }
}

/**
 * Convenience exports
 */
export const createUserRepository = () => RepositoryFactory.createUserRepository();
export const createAPIKeyRepository = () => RepositoryFactory.createAPIKeyRepository();
