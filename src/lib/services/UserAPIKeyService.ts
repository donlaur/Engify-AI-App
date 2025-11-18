/**
 * User API Key Service
 *
 * Service layer for API key management operations.
 * Follows SOLID principles with dependency injection.
 *
 * Features:
 * - Constructor-based dependency injection
 * - Secure key generation and hashing
 * - Key rotation support
 * - Usage tracking
 * - Comprehensive audit logging
 *
 * This service eliminates duplication in API key management routes.
 *
 * Usage:
 * ```typescript
 * const apiKeyService = new UserAPIKeyService();
 * const key = await apiKeyService.createKey(userId, 'My API Key');
 * await apiKeyService.rotateKey(userId, keyId, oldKey);
 * await apiKeyService.revokeKey(userId, keyId, revokedBy);
 * ```
 *
 * @module UserAPIKeyService
 */

import crypto from 'crypto';
import { APIKeyRepository, type APIKey } from '@/lib/repositories/APIKeyRepository';
import { loggingProvider } from '@/lib/providers/LoggingProvider';
import { dbProvider } from '@/lib/providers/DatabaseProvider';

export interface CreateKeyInput {
  name: string;
  expiresIn?: number; // days
}

export interface KeyWithPlainText extends APIKey {
  plainKey: string;
}

export class UserAPIKeyService {
  private apiKeyRepository: APIKeyRepository;

  constructor(apiKeyRepository?: APIKeyRepository) {
    this.apiKeyRepository = apiKeyRepository || new APIKeyRepository();
  }

  /**
   * Generate a secure API key
   */
  private generateApiKey(): string {
    // Generate 32 bytes of random data and encode as base64
    const buffer = crypto.randomBytes(32);
    return `sk_${buffer.toString('base64url')}`;
  }

  /**
   * Hash API key for storage
   */
  private hashApiKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key for a user
   */
  async createKey(
    userId: string,
    input: CreateKeyInput,
    createdBy?: string
  ): Promise<KeyWithPlainText> {
    const logger = loggingProvider.child({
      service: 'UserAPIKeyService',
      operation: 'createKey',
    });

    try {
      // Generate key
      const plainKey = this.generateApiKey();
      const keyHash = this.hashApiKey(plainKey);
      const lastFour = plainKey.slice(-4);

      // Calculate expiration
      const now = new Date();
      const expiresAt = input.expiresIn
        ? new Date(now.getTime() + input.expiresIn * 24 * 60 * 60 * 1000)
        : undefined;

      // Create key record
      const apiKey = await this.apiKeyRepository.create({
        userId,
        name: input.name,
        keyHash,
        lastFour,
        isActive: true,
        expiresAt,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      });

      logger.info('API key created', {
        userId,
        keyId: apiKey._id?.toString(),
        name: input.name,
      });

      // Audit log
      await logger.audit('api_key_created', {
        userId: createdBy || userId,
        severity: 'info',
        details: {
          keyId: apiKey._id?.toString(),
          keyName: input.name,
          expiresAt: expiresAt?.toISOString(),
        },
      });

      return {
        ...apiKey,
        plainKey, // Only returned on creation
      };
    } catch (error) {
      logger.error('Failed to create API key', error, { userId });
      throw error;
    }
  }

  /**
   * List API keys for a user
   */
  async listKeys(userId: string): Promise<APIKey[]> {
    try {
      return await this.apiKeyRepository.findByUserId(userId);
    } catch (error) {
      loggingProvider.error('Failed to list API keys', error, { userId });
      throw error;
    }
  }

  /**
   * List active API keys for a user
   */
  async listActiveKeys(userId: string): Promise<APIKey[]> {
    try {
      return await this.apiKeyRepository.findActiveByUserId(userId);
    } catch (error) {
      loggingProvider.error('Failed to list active API keys', error, { userId });
      throw error;
    }
  }

  /**
   * Get API key by ID (with ownership verification)
   */
  async getKey(userId: string, keyId: string): Promise<APIKey> {
    try {
      const key = await this.apiKeyRepository.findByIdAndUserId(keyId, userId);
      if (!key) {
        throw new Error(`API key ${keyId} not found or does not belong to user ${userId}`);
      }
      return key;
    } catch (error) {
      loggingProvider.error('Failed to get API key', error, { userId, keyId });
      throw error;
    }
  }

  /**
   * Revoke API key
   */
  async revokeKey(
    userId: string,
    keyId: string,
    revokedBy: string
  ): Promise<void> {
    const logger = loggingProvider.child({
      service: 'UserAPIKeyService',
      operation: 'revokeKey',
    });

    try {
      // Verify ownership
      const key = await this.getKey(userId, keyId);

      // Revoke key
      const revoked = await this.apiKeyRepository.revoke(keyId, revokedBy);
      if (!revoked) {
        throw new Error(`Failed to revoke API key ${keyId}`);
      }

      logger.info('API key revoked', {
        userId,
        keyId,
        keyName: key.name,
      });

      // Audit log
      await logger.audit('api_key_revoked', {
        userId: revokedBy,
        severity: 'warning', // Security event
        details: {
          keyId,
          keyName: key.name,
          targetUserId: userId,
        },
      });
    } catch (error) {
      logger.error('Failed to revoke API key', error, { userId, keyId });

      // Audit log failure
      await logger.audit('api_key_revoke_failed', {
        userId: revokedBy,
        severity: 'warning',
        details: {
          keyId,
          targetUserId: userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Rotate API key
   * Creates a new key and revokes the old one atomically
   */
  async rotateKey(
    userId: string,
    keyId: string,
    oldKey: string,
    rotatedBy: string
  ): Promise<KeyWithPlainText> {
    const logger = loggingProvider.child({
      service: 'UserAPIKeyService',
      operation: 'rotateKey',
    });

    try {
      // Verify ownership and old key
      const existingKey = await this.getKey(userId, keyId);

      // Verify old key hash
      const oldKeyHash = this.hashApiKey(oldKey);
      if (oldKeyHash !== existingKey.keyHash) {
        throw new Error('Invalid API key provided');
      }

      // Use transaction for atomic rotation
      const newKey = await dbProvider.withTransaction(async (session) => {
        // Create new key with same name
        const plainKey = this.generateApiKey();
        const keyHash = this.hashApiKey(plainKey);
        const lastFour = plainKey.slice(-4);

        const now = new Date();
        const newApiKey = await this.apiKeyRepository.create(
          {
            userId,
            name: existingKey.name,
            keyHash,
            lastFour,
            isActive: true,
            expiresAt: existingKey.expiresAt,
            usageCount: 0,
            createdAt: now,
            updatedAt: now,
          },
          session
        );

        // Revoke old key
        await this.apiKeyRepository.revoke(keyId, rotatedBy, session);

        return {
          ...newApiKey,
          plainKey,
        };
      });

      logger.info('API key rotated', {
        userId,
        oldKeyId: keyId,
        newKeyId: newKey._id?.toString(),
      });

      // Audit log
      await logger.audit('api_key_rotated', {
        userId: rotatedBy,
        severity: 'info',
        details: {
          oldKeyId: keyId,
          newKeyId: newKey._id?.toString(),
          keyName: existingKey.name,
          targetUserId: userId,
        },
      });

      return newKey;
    } catch (error) {
      logger.error('Failed to rotate API key', error, { userId, keyId });

      // Audit log failure
      await logger.audit('api_key_rotate_failed', {
        userId: rotatedBy,
        severity: 'warning',
        details: {
          keyId,
          targetUserId: userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Verify API key (for authentication)
   */
  async verifyKey(plainKey: string): Promise<APIKey | null> {
    try {
      const keyHash = this.hashApiKey(plainKey);
      const apiKey = await this.apiKeyRepository.findByHash(keyHash);

      if (!apiKey) {
        return null;
      }

      // Check if key is active and not expired
      if (!apiKey.isActive) {
        return null;
      }

      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return null;
      }

      // Record usage (non-blocking)
      this.apiKeyRepository.recordUsage(apiKey._id!.toString()).catch((error) => {
        loggingProvider.error('Failed to record API key usage', error, {
          keyId: apiKey._id?.toString(),
        });
      });

      return apiKey;
    } catch (error) {
      loggingProvider.error('Failed to verify API key', error);
      return null;
    }
  }

  /**
   * Get API key usage statistics
   */
  async getKeyStats(userId: string) {
    try {
      return await this.apiKeyRepository.getUserKeyStats(userId);
    } catch (error) {
      loggingProvider.error('Failed to get API key stats', error, { userId });
      throw error;
    }
  }

  /**
   * Deactivate expired keys (maintenance task)
   */
  async deactivateExpiredKeys(): Promise<number> {
    const logger = loggingProvider.child({
      service: 'UserAPIKeyService',
      operation: 'deactivateExpiredKeys',
    });

    try {
      const count = await this.apiKeyRepository.deactivateExpired();
      logger.info('Deactivated expired API keys', { count });
      return count;
    } catch (error) {
      logger.error('Failed to deactivate expired keys', error);
      throw error;
    }
  }

  /**
   * Clean up old revoked keys (maintenance task)
   */
  async cleanupOldRevokedKeys(retentionDays: number = 90): Promise<number> {
    const logger = loggingProvider.child({
      service: 'UserAPIKeyService',
      operation: 'cleanupOldRevokedKeys',
    });

    try {
      const count = await this.apiKeyRepository.cleanupOldRevokedKeys(retentionDays);
      logger.info('Cleaned up old revoked API keys', { count, retentionDays });
      return count;
    } catch (error) {
      logger.error('Failed to cleanup old revoked keys', error);
      throw error;
    }
  }
}
