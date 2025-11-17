/**
 * Enhanced User Repository
 *
 * Repository for User entity operations.
 * Extends BaseRepository with user-specific methods.
 *
 * Features:
 * - Provider-based dependency injection
 * - Type-safe user operations
 * - Email lookup
 * - Role-based queries
 * - Organization queries
 * - Login tracking
 *
 * Usage:
 * ```typescript
 * const userRepo = new EnhancedUserRepository();
 * const user = await userRepo.findByEmail('user@example.com');
 * ```
 *
 * @module EnhancedUserRepository
 */

import { ObjectId, Filter, ClientSession } from 'mongodb';
import { z } from 'zod';
import { BaseRepository } from './BaseRepository';
import type { User } from '@/lib/db/schema';

/**
 * User schema for validation
 * Simplified version - adjust based on your actual User schema
 */
const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.string().optional(),
  organizationId: z.instanceof(ObjectId).optional(),
  plan: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
}) as z.ZodSchema<User>;

export class EnhancedUserRepository extends BaseRepository<User> {
  constructor() {
    super('users', UserSchema);
  }

  /**
   * Find user by email address
   * SECURITY: This query is intentionally system-wide for authentication
   */
  async findByEmail(email: string, session?: ClientSession): Promise<User | null> {
    return this.findOne({ email } as Filter<User>, session);
  }

  /**
   * Find user by email or throw error
   */
  async findByEmailOrFail(email: string, session?: ClientSession): Promise<User> {
    const user = await this.findByEmail(email, session);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Find user by OAuth provider and provider ID
   */
  async findByProvider(
    provider: string,
    providerId: string,
    session?: ClientSession
  ): Promise<User | null> {
    return this.findOne(
      {
        [`accounts.${provider}.providerId`]: providerId,
      } as Filter<User>,
      session
    );
  }

  /**
   * Find users by role
   */
  async findByRole(role: string, session?: ClientSession): Promise<User[]> {
    return this.find({ role } as Filter<User>, { session });
  }

  /**
   * Find users by organization
   */
  async findByOrganization(
    organizationId: string,
    session?: ClientSession
  ): Promise<User[]> {
    return this.find(
      {
        organizationId: new ObjectId(organizationId),
      } as Filter<User>,
      { session }
    );
  }

  /**
   * Find users by plan
   */
  async findByPlan(plan: string, session?: ClientSession): Promise<User[]> {
    return this.find({ plan } as Filter<User>, { session });
  }

  /**
   * Find users created within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    session?: ClientSession
  ): Promise<User[]> {
    return this.find(
      {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      } as Filter<User>,
      { session }
    );
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(id: string, session?: ClientSession): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { session }
    );
  }

  /**
   * Check if email is already taken
   */
  async isEmailTaken(email: string, excludeUserId?: string, session?: ClientSession): Promise<boolean> {
    const filter: Filter<User> = { email } as Filter<User>;

    if (excludeUserId) {
      (filter as any)._id = { $ne: new ObjectId(excludeUserId) };
    }

    return this.exists(filter, session);
  }

  /**
   * Get user statistics
   */
  async getStats(session?: ClientSession): Promise<{
    total: number;
    byRole: Record<string, number>;
    byPlan: Record<string, number>;
    recentSignups: number;
  }> {
    const collection = await this.getCollection();

    const [
      total,
      roleStats,
      planStats,
      recentSignups,
    ] = await Promise.all([
      this.count({} as Filter<User>, session),

      // Group by role
      collection
        .aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ], { session })
        .toArray(),

      // Group by plan
      collection
        .aggregate([
          { $group: { _id: '$plan', count: { $sum: 1 } } },
        ], { session })
        .toArray(),

      // Recent signups (last 30 days)
      this.count(
        {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        } as Filter<User>,
        session
      ),
    ]);

    const byRole: Record<string, number> = {};
    roleStats.forEach((stat: any) => {
      byRole[stat._id || 'unknown'] = stat.count;
    });

    const byPlan: Record<string, number> = {};
    planStats.forEach((stat: any) => {
      byPlan[stat._id || 'unknown'] = stat.count;
    });

    return {
      total,
      byRole,
      byPlan,
      recentSignups,
    };
  }

  /**
   * Search users by name or email
   */
  async search(
    query: string,
    options?: {
      limit?: number;
      skip?: number;
      session?: ClientSession;
    }
  ): Promise<User[]> {
    const filter: Filter<User> = {
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } },
      ],
    } as Filter<User>;

    return this.find(filter, options);
  }
}
