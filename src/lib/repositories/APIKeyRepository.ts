/**
 * API Key Repository
 *
 * Repository for API Key entity operations.
 * Extends BaseRepository with API key-specific methods.
 *
 * Features:
 * - Provider-based dependency injection
 * - Type-safe API key operations
 * - Key hash lookups
 * - User key queries
 * - Active/revoked key filtering
 *
 * Usage:
 * ```typescript
 * const apiKeyRepo = new APIKeyRepository();
 * const keys = await apiKeyRepo.findByUserId('user123');
 * ```
 *
 * @module APIKeyRepository
 */

import { ObjectId, Filter, ClientSession } from 'mongodb';
import { z } from 'zod';
import { BaseRepository } from './BaseRepository';

/**
 * API Key interface
 */
export interface APIKey {
  _id?: ObjectId;
  userId: string | ObjectId;
  name: string;
  keyHash: string;
  lastFour: string;
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount?: number;
  createdAt: Date;
  updatedAt: Date;
  revokedAt?: Date;
  revokedBy?: string;
}

/**
 * API Key schema for validation
 */
const APIKeySchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.union([z.string(), z.instanceof(ObjectId)]),
  name: z.string(),
  keyHash: z.string(),
  lastFour: z.string(),
  isActive: z.boolean(),
  expiresAt: z.date().optional(),
  lastUsedAt: z.date().optional(),
  usageCount: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  revokedAt: z.date().optional(),
  revokedBy: z.string().optional(),
}) as z.ZodSchema<APIKey>;

export class APIKeyRepository extends BaseRepository<APIKey> {
  constructor() {
    super('api_keys', APIKeySchema);
  }

  /**
   * Find API key by hash
   */
  async findByHash(keyHash: string, session?: ClientSession): Promise<APIKey | null> {
    return this.findOne({ keyHash } as Filter<APIKey>, session);
  }

  /**
   * Find all API keys for a user
   */
  async findByUserId(userId: string, session?: ClientSession): Promise<APIKey[]> {
    return this.find(
      { userId } as Filter<APIKey>,
      {
        sort: { field: 'createdAt', order: 'desc' },
        session,
      }
    );
  }

  /**
   * Find active API keys for a user
   */
  async findActiveByUserId(userId: string, session?: ClientSession): Promise<APIKey[]> {
    return this.find(
      {
        userId,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      } as Filter<APIKey>,
      {
        sort: { field: 'createdAt', order: 'desc' },
        session,
      }
    );
  }

  /**
   * Find API key by ID and user ID (for ownership verification)
   */
  async findByIdAndUserId(
    id: string,
    userId: string,
    session?: ClientSession
  ): Promise<APIKey | null> {
    return this.findOne(
      {
        _id: new ObjectId(id),
        userId,
      } as Filter<APIKey>,
      session
    );
  }

  /**
   * Revoke API key
   */
  async revoke(
    id: string,
    revokedBy: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await this.updateOne(
      id,
      {
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
      } as Partial<APIKey>,
      session
    );
    return !!result;
  }

  /**
   * Update last used timestamp and increment usage count
   */
  async recordUsage(id: string, session?: ClientSession): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { lastUsedAt: new Date(), updatedAt: new Date() },
        $inc: { usageCount: 1 },
      },
      { session }
    );
  }

  /**
   * Count active keys for a user
   */
  async countActiveByUserId(userId: string, session?: ClientSession): Promise<number> {
    return this.count(
      {
        userId,
        isActive: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } },
        ],
      } as Filter<APIKey>,
      session
    );
  }

  /**
   * Find expired API keys
   */
  async findExpired(session?: ClientSession): Promise<APIKey[]> {
    return this.find(
      {
        expiresAt: { $lte: new Date() },
        isActive: true,
      } as Filter<APIKey>,
      { session }
    );
  }

  /**
   * Deactivate expired API keys
   */
  async deactivateExpired(session?: ClientSession): Promise<number> {
    return this.updateMany(
      {
        expiresAt: { $lte: new Date() },
        isActive: true,
      } as Filter<APIKey>,
      {
        isActive: false,
      } as Partial<APIKey>,
      session
    );
  }

  /**
   * Get API key usage statistics for a user
   */
  async getUserKeyStats(userId: string, session?: ClientSession): Promise<{
    total: number;
    active: number;
    revoked: number;
    expired: number;
    totalUsage: number;
  }> {
    const keys = await this.findByUserId(userId, session);
    const now = new Date();

    const stats = {
      total: keys.length,
      active: 0,
      revoked: 0,
      expired: 0,
      totalUsage: 0,
    };

    keys.forEach(key => {
      stats.totalUsage += key.usageCount || 0;

      if (key.revokedAt) {
        stats.revoked++;
      } else if (key.expiresAt && key.expiresAt <= now) {
        stats.expired++;
      } else if (key.isActive) {
        stats.active++;
      }
    });

    return stats;
  }

  /**
   * Clean up old revoked keys (older than retention period)
   */
  async cleanupOldRevokedKeys(
    retentionDays: number = 90,
    session?: ClientSession
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const collection = await this.getCollection();
    const result = await collection.deleteMany(
      {
        isActive: false,
        revokedAt: { $lte: cutoffDate },
      },
      { session }
    );

    return result.deletedCount;
  }
}
