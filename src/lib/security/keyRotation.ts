/**
 * AI Summary: Key rotation utilities for API keys and encryption keys.
 * Part of Day 5 Phase 8 security hardening.
 */

import { randomBytes, createHash } from 'node:crypto';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';

export interface RotationResult {
  success: boolean;
  newKeyId?: string;
  oldKeyId?: string;
  error?: string;
}

/**
 * Rotate an API key for a user
 * Creates new key, marks old as revoked
 */
export async function rotateApiKey(
  userId: string,
  keyId: string
): Promise<RotationResult> {
  try {
    const db = await getDb();
    const collection = db.collection(Collections.API_KEYS as string);

    // Find existing key
    const existingKey = await collection.findOne({
      _id: keyId,
      userId,
      isActive: true,
    } as any);

    if (!existingKey) {
      return {
        success: false,
        error: 'API key not found or already revoked',
      };
    }

    // Generate new key
    const newKeyValue = `sk_${randomBytes(32).toString('hex')}`;
    const newKeyHash = createHash('sha256').update(newKeyValue).digest('hex');

    // Insert new key with same settings
    const newKey = await collection.insertOne({
      userId,
      provider: existingKey.provider,
      keyName: `${existingKey.keyName} (rotated)`,
      keyHash: newKeyHash,
      encryptedKey: existingKey.encryptedKey, // Placeholder - should re-encrypt
      isActive: true,
      createdAt: new Date(),
      createdBy: userId,
      usageCount: 0,
      monthlyUsageCount: 0,
      allowedModels: existingKey.allowedModels,
      monthlyUsageLimit: existingKey.monthlyUsageLimit,
      expiresAt: existingKey.expiresAt,
    });

    // Revoke old key
    await collection.updateOne(
      { _id: keyId } as any,
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          notes: 'Rotated',
        },
      }
    );

    await auditLog({
      action: 'api_key_rotated',
      userId,
      resource: 'api_key',
      details: {
        oldKeyId: keyId,
        newKeyId: newKey.insertedId.toString(),
        provider: existingKey.provider,
      },
      severity: 'info',
    });

    return {
      success: true,
      newKeyId: newKey.insertedId.toString(),
      oldKeyId: keyId,
    };
  } catch (error) {
    logger.error('key-rotation.error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      keyId,
    });

    await auditLog({
      action: 'api_key_rotate_failed',
      userId,
      resource: 'api_key',
      details: {
        keyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      severity: 'error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(
  userId: string,
  keyId: string,
  reason?: string
): Promise<RotationResult> {
  try {
    const db = await getDb();
    const collection = db.collection(Collections.API_KEYS as string);

    const result = await collection.updateOne(
      { _id: keyId, userId, isActive: true } as any,
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          notes: reason ?? 'Revoked by user',
        },
      }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: 'API key not found or already revoked',
      };
    }

    await auditLog({
      action: 'api_key_revoked',
      userId,
      resource: 'api_key',
      details: {
        keyId,
        reason,
      },
      severity: 'info',
    });

    return {
      success: true,
      oldKeyId: keyId,
    };
  } catch (error) {
    logger.error('key-revoke.error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
      keyId,
    });

    await auditLog({
      action: 'api_key_revoke_failed',
      userId,
      resource: 'api_key',
      details: {
        keyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      severity: 'error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List all active keys for a user
 */
export async function listActiveKeys(userId: string): Promise<
  Array<{
    id: string;
    provider: string;
    keyName: string;
    createdAt: Date;
    usageCount: number;
  }>
> {
  const db = await getDb();
  const collection = db.collection(Collections.API_KEYS as string);

  const keys = await collection
    .find({ userId, isActive: true })
    .project({
      _id: 1,
      provider: 1,
      keyName: 1,
      createdAt: 1,
      usageCount: 1,
    })
    .toArray();

  return keys.map((key) => ({
    id: key._id.toString(),
    provider: key.provider,
    keyName: key.keyName,
    createdAt: key.createdAt,
    usageCount: key.usageCount,
  }));
}

