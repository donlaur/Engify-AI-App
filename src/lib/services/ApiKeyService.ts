/**
 * API Key Management Service
 *
 * Manages AI provider API keys in MongoDB
 * Supports key rotation, usage tracking, and security
 */

import { getDb } from '@/lib/mongodb';
import { auditLog } from '@/lib/logging/audit';
import { secretsManager } from '@/lib/aws/SecretsManager';
import crypto from 'crypto';

export interface ApiKey {
  _id?: string;
  userId: string; // REQUIRED: Per-user isolation
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  keyName: string;
  encryptedKey: string;
  keyHash: string; // For quick lookup without decryption
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  lastUsedAt?: Date;
  usageCount: number;
  monthlyUsageLimit?: number;
  monthlyUsageCount: number;
  allowedModels: string[];
  expiresAt?: Date;
  rotatedAt?: Date;
  revokedAt?: Date;
  notes?: string;
}

const ALGORITHM = 'aes-256-gcm';

/**
 * Get encryption key from AWS Secrets Manager or environment variable
 */
async function getEncryptionKey(): Promise<string> {
  try {
    // Try AWS Secrets Manager first (production)
    return await secretsManager.getSecret(
      'engify/api-key-encryption-key',
      'API_KEY_ENCRYPTION_KEY'
    );
  } catch (error) {
    // Fallback to environment variable or default (dev only)
    const fallback =
      process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'CRITICAL: Encryption key not found in AWS Secrets Manager!',
        error
      );
    }
    return fallback;
  }
}

export class ApiKeyService {
  private collectionName = 'api_keys';

  /**
   * Encrypt an API key for storage
   */
  private async encryptKey(
    apiKey: string
  ): Promise<{ encrypted: string; iv: string; authTag: string }> {
    const encryptionKey = await getEncryptionKey();
    const keyBuffer = encryptionKey.startsWith('hex:')
      ? Buffer.from(encryptionKey.slice(4), 'hex')
      : crypto.createHash('sha256').update(encryptionKey).digest();

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer.slice(0, 32), iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt an API key from storage
   */
  private async decryptKey(encryptedData: string): Promise<string> {
    const encryptionKey = await getEncryptionKey();
    const keyBuffer = encryptionKey.startsWith('hex:')
      ? Buffer.from(encryptionKey.slice(4), 'hex')
      : crypto.createHash('sha256').update(encryptionKey).digest();

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const encrypted = parts[0];
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      keyBuffer.slice(0, 32),
      iv
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Hash an API key for quick lookup
   */
  private hashKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Store a new API key
   * REQUIRES userId for per-user isolation (security requirement)
   */
  async storeKey(
    userId: string,
    provider: 'openai' | 'anthropic' | 'google' | 'groq',
    apiKey: string,
    keyName: string,
    allowedModels: string[],
    createdBy: string,
    options?: {
      monthlyUsageLimit?: number;
      expiresAt?: Date;
      notes?: string;
    }
  ): Promise<string> {
    if (!userId || userId.trim() === '') {
      throw new Error(
        'userId is required for API key storage (security requirement)'
      );
    }

    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    // Encrypt the key
    const { encrypted, iv, authTag } = await this.encryptKey(apiKey);
    const encryptedKey = `${encrypted}:${iv}:${authTag}`;
    const keyHash = this.hashKey(apiKey);

    // Store in MongoDB with userId for isolation
    const result = await collection.insertOne({
      userId, // CRITICAL: Per-user isolation
      provider,
      keyName,
      encryptedKey,
      keyHash,
      isActive: true,
      createdAt: new Date(),
      createdBy,
      usageCount: 0,
      monthlyUsageCount: 0,
      allowedModels,
      monthlyUsageLimit: options?.monthlyUsageLimit,
      expiresAt: options?.expiresAt,
      notes: options?.notes,
    });

    // Audit log
    await auditLog({
      action: 'api_key_created',
      userId: createdBy,
      details: {
        keyId: result.insertedId.toString(),
        provider,
        keyName,
        allowedModels,
      },
      severity: 'info',
    });

    return result.insertedId.toString();
  }

  /**
   * Get an active API key for a provider for a specific user
   * REQUIRES userId for security isolation
   */
  async getActiveKey(
    userId: string,
    provider: string,
    modelId?: string
  ): Promise<string | null> {
    if (!userId || userId.trim() === '') {
      throw new Error(
        'userId is required to retrieve API key (security requirement)'
      );
    }

    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    const query: {
      userId: string;
      provider: string;
      isActive: boolean;
      $or: Array<Record<string, unknown>>;
      allowedModels?: string;
    } = {
      userId, // CRITICAL: Per-user isolation
      provider,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } },
      ],
    };

    // Filter by allowed models if specified
    if (modelId) {
      query.allowedModels = modelId;
    }

    const keyDoc = await collection.findOne(query, {
      sort: { lastUsedAt: 1 }, // Least recently used first (load balancing)
    });

    if (!keyDoc) {
      return null;
    }

    // Verify ownership (double-check security)
    if (keyDoc.userId !== userId) {
      throw new Error('Security violation: API key does not belong to user');
    }

    // Check monthly usage limit
    if (
      keyDoc.monthlyUsageLimit &&
      keyDoc.monthlyUsageCount >= keyDoc.monthlyUsageLimit
    ) {
      return null;
    }

    // Decrypt and return
    const apiKey = await this.decryptKey(keyDoc.encryptedKey);

    // Update usage stats
    await collection.updateOne(
      { _id: keyDoc._id },
      {
        $set: { lastUsedAt: new Date() },
        $inc: { usageCount: 1, monthlyUsageCount: 1 },
      }
    );

    return apiKey;
  }

  /**
   * Rotate an API key
   * REQUIRES userId to verify ownership before rotation
   */
  async rotateKey(
    userId: string,
    keyId: string,
    newApiKey: string,
    rotatedBy: string
  ): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error(
        'userId is required to rotate API key (security requirement)'
      );
    }

    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    // Verify ownership before rotation
    const existingKey = await collection.findOne({ _id: keyId, userId });
    if (!existingKey) {
      throw new Error('API key not found or access denied');
    }

    const { encrypted, iv, authTag } = await this.encryptKey(newApiKey);
    const encryptedKey = `${encrypted}:${iv}:${authTag}`;
    const keyHash = this.hashKey(newApiKey);

    await collection.updateOne(
      { _id: keyId, userId }, // Ensure userId matches (double security)
      {
        $set: {
          encryptedKey,
          keyHash,
          rotatedAt: new Date(),
          usageCount: 0,
          monthlyUsageCount: 0,
        },
      }
    );

    await auditLog({
      action: 'api_key_rotated',
      userId: rotatedBy,
      details: { keyId, provider: existingKey.provider },
      severity: 'info',
    });
  }

  /**
   * Revoke an API key
   * REQUIRES userId to verify ownership before revocation
   */
  async revokeKey(
    userId: string,
    keyId: string,
    revokedBy: string
  ): Promise<void> {
    if (!userId || userId.trim() === '') {
      throw new Error(
        'userId is required to revoke API key (security requirement)'
      );
    }

    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    // Verify ownership before revocation
    const existingKey = await collection.findOne({ _id: keyId, userId });
    if (!existingKey) {
      throw new Error('API key not found or access denied');
    }

    await collection.updateOne(
      { _id: keyId, userId }, // Ensure userId matches (double security)
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
        },
      }
    );

    await auditLog({
      action: 'api_key_revoked',
      userId: revokedBy,
      details: { keyId, provider: existingKey.provider },
      severity: 'warning',
    });
  }

  /**
   * List API keys for a specific user (without decrypting)
   * REQUIRES userId for per-user isolation
   */
  async listKeys(
    userId: string,
    provider?: 'openai' | 'anthropic' | 'google' | 'groq'
  ): Promise<Omit<ApiKey, 'encryptedKey'>[]> {
    if (!userId || userId.trim() === '') {
      throw new Error(
        'userId is required to list API keys (security requirement)'
      );
    }

    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    const query: {
      userId: string;
      provider?: 'openai' | 'anthropic' | 'google' | 'groq';
    } = {
      userId, // CRITICAL: Per-user isolation
    };

    if (provider) {
      query.provider = provider;
    }

    const keys = await collection
      .find(query, {
        projection: { encryptedKey: 0, keyHash: 0 }, // Don't expose hash either
      })
      .sort({ createdAt: -1 })
      .toArray();

    return keys as Omit<ApiKey, 'encryptedKey'>[];
  }

  /**
   * Reset monthly usage counters (run on 1st of each month)
   */
  async resetMonthlyUsage(): Promise<void> {
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    await collection.updateMany(
      {},
      {
        $set: { monthlyUsageCount: 0 },
      }
    );
  }
}

export const apiKeyService = new ApiKeyService();
