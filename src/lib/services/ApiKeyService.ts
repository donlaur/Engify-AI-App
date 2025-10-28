/**
 * API Key Management Service
 * 
 * Manages AI provider API keys in MongoDB
 * Supports key rotation, usage tracking, and security
 */

import { getDb } from '@/lib/mongodb';
import { auditLog } from '@/lib/logging/audit';
import crypto from 'crypto';

export interface ApiKey {
  _id?: string;
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
  notes?: string;
}

const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

export class ApiKeyService {
  private collectionName = 'api_keys';

  /**
   * Encrypt an API key for storage
   */
  private encryptKey(apiKey: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), iv);
    
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
  private decryptKey(encryptedData: string): string {
    const parts = encryptedData.split(':');
    const encrypted = parts[0];
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), iv);
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
   */
  async storeKey(
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
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    // Encrypt the key
    const { encrypted, iv, authTag } = this.encryptKey(apiKey);
    const encryptedKey = `${encrypted}:${iv}:${authTag}`;
    const keyHash = this.hashKey(apiKey);

    // Store in MongoDB
    const result = await collection.insertOne({
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
        provider,
        keyName,
        allowedModels,
      },
      severity: 'info',
    });

    return result.insertedId.toString();
  }

  /**
   * Get an active API key for a provider
   */
  async getActiveKey(provider: string, modelId?: string): Promise<string | null> {
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    const query: any = {
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

    // Check monthly usage limit
    if (keyDoc.monthlyUsageLimit && keyDoc.monthlyUsageCount >= keyDoc.monthlyUsageLimit) {
      return null;
    }

    // Decrypt and return
    const apiKey = this.decryptKey(keyDoc.encryptedKey);

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
   */
  async rotateKey(
    keyId: string,
    newApiKey: string,
    rotatedBy: string
  ): Promise<void> {
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    const { encrypted, iv, authTag } = this.encryptKey(newApiKey);
    const encryptedKey = `${encrypted}:${iv}:${authTag}`;
    const keyHash = this.hashKey(newApiKey);

    await collection.updateOne(
      { _id: keyId },
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
      action: 'api_key_created',
      userId: rotatedBy,
      details: { keyId, action: 'rotated' },
      severity: 'info',
    });
  }

  /**
   * Revoke an API key
   */
  async revokeKey(keyId: string, revokedBy: string): Promise<void> {
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    await collection.updateOne(
      { _id: keyId },
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
      details: { keyId },
      severity: 'warning',
    });
  }

  /**
   * List all API keys (without decrypting)
   */
  async listKeys(provider?: string): Promise<Omit<ApiKey, 'encryptedKey'>[]> {
    const db = await getDb();
    const collection = db.collection<ApiKey>(this.collectionName);

    const query = provider ? { provider } : {};
    
    const keys = await collection
      .find(query, {
        projection: { encryptedKey: 0 },
      })
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
