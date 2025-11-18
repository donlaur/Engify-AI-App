/**
 * Enhanced User Service
 *
 * Service layer for user management operations.
 * Follows SOLID principles with dependency injection.
 *
 * Features:
 * - Constructor-based dependency injection
 * - Provider integration
 * - Business logic separation
 * - Transaction support
 * - Comprehensive error handling
 * - Audit logging
 *
 * Usage:
 * ```typescript
 * const userService = new EnhancedUserService();
 * const user = await userService.createUser({...});
 * ```
 *
 * @module EnhancedUserService
 */

import { ObjectId, OptionalId } from 'mongodb';
import { EnhancedUserRepository } from '@/lib/repositories/EnhancedUserRepository';
import { loggingProvider } from '@/lib/providers/LoggingProvider';
import { dbProvider } from '@/lib/providers/DatabaseProvider';
import type { User } from '@/lib/db/schema';

export interface CreateUserInput {
  email: string;
  name?: string;
  role?: string;
  organizationId?: string;
  plan?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
}

export class EnhancedUserService {
  private userRepository: EnhancedUserRepository;

  constructor(userRepository?: EnhancedUserRepository) {
    this.userRepository = userRepository || new EnhancedUserRepository();
  }

  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput, createdBy?: string): Promise<User> {
    const logger = loggingProvider.child({ service: 'UserService', operation: 'createUser' });

    try {
      // Validate email is not taken
      const emailTaken = await this.userRepository.isEmailTaken(input.email);
      if (emailTaken) {
        throw new Error(`Email ${input.email} is already in use`);
      }

      // Create user
      const now = new Date();
      const user = await this.userRepository.create({
        email: input.email,
        name: input.name,
        role: input.role || 'user',
        organizationId: input.organizationId ? new ObjectId(input.organizationId) : undefined,
        plan: input.plan || 'free',
        createdAt: now,
        updatedAt: now,
      } as OptionalId<User>);

      logger.info('User created', { userId: user._id?.toString(), email: user.email });

      // Audit log
      await logger.audit('user_signup', {
        userId: createdBy,
        severity: 'info',
        details: {
          newUserId: user._id?.toString(),
          email: user.email,
          role: user.role,
        },
      });

      return user;
    } catch (error) {
      logger.error('Failed to create user', error, { email: input.email });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.userRepository.findByIdOrFail(userId);
      return user;
    } catch (error) {
      loggingProvider.error('Failed to get user by ID', error, { userId });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      loggingProvider.error('Failed to get user by email', error, { email });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    input: UpdateUserInput,
    updatedBy?: string
  ): Promise<User> {
    const logger = loggingProvider.child({ service: 'UserService', operation: 'updateUser' });

    try {
      // If email is being updated, check it's not taken
      if (input.email) {
        const emailTaken = await this.userRepository.isEmailTaken(input.email, userId);
        if (emailTaken) {
          throw new Error(`Email ${input.email} is already in use`);
        }
      }

      // Update user
      const user = await this.userRepository.updateOne(userId, input as Partial<User>);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      logger.info('User updated', { userId, updatedFields: Object.keys(input) });

      // Audit log
      await logger.audit('user_update', {
        userId: updatedBy || userId,
        severity: 'info',
        details: {
          targetUserId: userId,
          updatedFields: Object.keys(input),
        },
      });

      return user;
    } catch (error) {
      logger.error('Failed to update user', error, { userId });
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string, deletedBy?: string): Promise<void> {
    const logger = loggingProvider.child({ service: 'UserService', operation: 'deleteUser' });

    try {
      // Use transaction for multi-step deletion
      await dbProvider.withTransaction(async (session) => {
        // Delete user
        const deleted = await this.userRepository.deleteOne(userId, session);
        if (!deleted) {
          throw new Error(`User ${userId} not found`);
        }

        // Here you could delete related data (API keys, sessions, etc.)
        // This is where the transaction ensures atomicity
      });

      logger.info('User deleted', { userId });

      // Audit log
      await logger.audit('user_delete', {
        userId: deletedBy,
        severity: 'warning',
        details: {
          deletedUserId: userId,
        },
      });
    } catch (error) {
      logger.error('Failed to delete user', error, { userId });
      throw error;
    }
  }

  /**
   * List users with pagination
   */
  async listUsers(options?: {
    page?: number;
    limit?: number;
    role?: string;
    organizationId?: string;
  }) {
    try {
      let filter: any = {};

      if (options?.role) {
        filter.role = options.role;
      }

      if (options?.organizationId) {
        filter.organizationId = new ObjectId(options.organizationId);
      }

      return await this.userRepository.findPaginated(filter, {
        page: options?.page,
        limit: options?.limit,
        sort: { field: 'createdAt', order: 'desc' },
      });
    } catch (error) {
      loggingProvider.error('Failed to list users', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: string, options?: { limit?: number; skip?: number }) {
    try {
      return await this.userRepository.search(query, options);
    } catch (error) {
      loggingProvider.error('Failed to search users', error, { query });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      return await this.userRepository.getStats();
    } catch (error) {
      loggingProvider.error('Failed to get user stats', error);
      throw error;
    }
  }

  /**
   * Update last login
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.updateLastLogin(userId);
      loggingProvider.debug('Updated last login', { userId });
    } catch (error) {
      // Don't throw - login tracking is non-critical
      loggingProvider.error('Failed to update last login', error, { userId });
    }
  }

  /**
   * Change user role
   */
  async changeUserRole(
    userId: string,
    newRole: string,
    changedBy: string
  ): Promise<User> {
    const logger = loggingProvider.child({ service: 'UserService', operation: 'changeUserRole' });

    try {
      const user = await this.userRepository.updateOne(userId, { role: newRole } as Partial<User>);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      logger.info('User role changed', { userId, newRole });

      // Audit log
      await logger.audit('user_update', {
        userId: changedBy,
        severity: 'warning', // Role changes are security-sensitive
        details: {
          targetUserId: userId,
          action: 'role_change',
          newRole,
        },
      });

      return user;
    } catch (error) {
      logger.error('Failed to change user role', error, { userId, newRole });
      throw error;
    }
  }
}
