/**
 * Generic Repository Interface
 * 
 * Implements the Repository Pattern for data access abstraction.
 * This enables:
 * - Dependency Inversion (depend on abstractions, not concretions)
 * - Easy testing with mock implementations
 * - Database-agnostic business logic
 * - Clean separation of concerns
 * 
 * SOLID Principles:
 * - Single Responsibility: Each repository handles one entity type
 * - Open/Closed: Add new methods without modifying existing interface
 * - Liskov Substitution: All implementations are interchangeable
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: Service layer depends on this abstraction
 */

/**
 * Generic repository interface for CRUD operations
 * @template T - The entity type
 * @template ID - The ID type (defaults to string)
 */
export interface IRepository<T, ID = string> {
  /**
   * Find entity by ID
   * @param id - The entity ID
   * @returns Promise with entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities
   * @returns Promise with array of all entities
   */
  findAll(): Promise<T[]>;

  /**
   * Create a new entity
   * @param entity - Entity data without ID (ID will be generated)
   * @returns Promise with created entity including ID
   */
  create(entity: Omit<T, 'id'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id - The entity ID
   * @param entity - Partial entity data to update
   * @returns Promise with updated entity or null if not found
   */
  update(id: ID, entity: Partial<T>): Promise<T | null>;

  /**
   * Delete an entity by ID
   * @param id - The entity ID
   * @returns Promise with boolean indicating success
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Count total entities
   * @returns Promise with total count
   */
  count(): Promise<number>;
}

/**
 * User-specific repository interface
 * Extends generic repository with user-specific methods
 */
export interface IUserRepository extends IRepository<User> {
  /**
   * Find user by email address
   * @param email - User's email
   * @returns Promise with user or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by OAuth provider and provider ID
   * @param provider - OAuth provider name (e.g., 'google', 'github')
   * @param providerId - Provider's user ID
   * @returns Promise with user or null if not found
   */
  findByProvider(provider: string, providerId: string): Promise<User | null>;

  /**
   * Find users by role
   * @param role - User role
   * @returns Promise with array of users
   */
  findByRole(role: string): Promise<User[]>;

  /**
   * Find users by organization
   * @param organizationId - Organization ID
   * @returns Promise with array of users
   */
  findByOrganization(organizationId: string): Promise<User[]>;
}

/**
 * Prompt-specific repository interface
 * Extends generic repository with prompt-specific methods
 */
export interface IPromptRepository extends IRepository<Prompt> {
  /**
   * Find prompts by user ID
   * @param userId - User ID
   * @returns Promise with array of user's prompts
   */
  findByUserId(userId: string): Promise<Prompt[]>;

  /**
   * Find prompts by pattern type
   * @param pattern - Prompt pattern (e.g., 'chain-of-thought')
   * @returns Promise with array of prompts
   */
  findByPattern(pattern: string): Promise<Prompt[]>;

  /**
   * Find prompts by tag
   * @param tag - Tag name
   * @returns Promise with array of prompts
   */
  findByTag(tag: string): Promise<Prompt[]>;

  /**
   * Find prompts by category
   * @param category - Prompt category
   * @returns Promise with array of prompts
   */
  findByCategory(category: string): Promise<Prompt[]>;

  /**
   * Find public prompts
   * @returns Promise with array of public prompts
   */
  findPublic(): Promise<Prompt[]>;

  /**
   * Find featured prompts
   * @returns Promise with array of featured prompts
   */
  findFeatured(): Promise<Prompt[]>;

  /**
   * Search prompts by text
   * @param query - Search query
   * @returns Promise with array of matching prompts
   */
  search(query: string): Promise<Prompt[]>;
}

/**
 * Activity-specific repository interface
 * Extends generic repository with activity-specific methods
 */
export interface IActivityRepository extends IRepository<Activity> {
  /**
   * Find activities by user ID
   * @param userId - User ID
   * @returns Promise with array of user's activities
   */
  findByUserId(userId: string): Promise<Activity[]>;

  /**
   * Find activities by type
   * @param type - Activity type
   * @returns Promise with array of activities
   */
  findByType(type: string): Promise<Activity[]>;

  /**
   * Find recent activities
   * @param limit - Maximum number of activities to return
   * @returns Promise with array of recent activities
   */
  findRecent(limit?: number): Promise<Activity[]>;
}

// Import types (these will be defined in the schemas)
import type { User, Prompt, Activity } from '@/lib/schemas';
