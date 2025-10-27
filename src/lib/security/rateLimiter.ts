/**
 * Rate Limiter
 * 
 * Track and enforce rate limits per user
 */

import { getDb } from '@/lib/db/client';
import { RATE_LIMITS } from '@/lib/db/schemas/usage';
import { ObjectId } from 'mongodb';

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

/**
 * Check if user can make a request
 */
export async function checkRateLimit(
  userId: string,
  plan: keyof typeof RATE_LIMITS
): Promise<RateLimitResult> {
  const db = await getDb();
  const quotas = db.collection('user_usage_quotas');

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get or create quota
  let quota = await quotas.findOne({
    userId: new ObjectId(userId),
    periodStart: { $lte: now },
    periodEnd: { $gte: now },
  });

  if (!quota) {
    // Create new quota for this period
    const limits = RATE_LIMITS[plan];
    quota = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      periodStart,
      periodEnd,
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      requestLimit: limits.requestsPerMonth,
      tokenLimit: limits.tokensPerMonth,
      costLimit: limits.costLimitCents,
      requestsThisMinute: 0,
      lastRequestAt: null,
      isBlocked: false,
      blockReason: null,
      updatedAt: now,
    };
    await quotas.insertOne(quota);
  }

  const limits = RATE_LIMITS[plan];

  // Check if blocked
  if (quota.isBlocked) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: periodEnd,
      reason: quota.blockReason || 'Account blocked',
    };
  }

  // Check monthly limit
  if (quota.totalRequests >= quota.requestLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: periodEnd,
      reason: 'Monthly request limit exceeded',
    };
  }

  // Check per-minute rate limit
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  if (
    quota.lastRequestAt &&
    quota.lastRequestAt > oneMinuteAgo &&
    quota.requestsThisMinute >= limits.requestsPerMinute
  ) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(quota.lastRequestAt.getTime() + 60000),
      reason: 'Rate limit exceeded (requests per minute)',
    };
  }

  // Reset per-minute counter if needed
  if (!quota.lastRequestAt || quota.lastRequestAt <= oneMinuteAgo) {
    await quotas.updateOne(
      { _id: quota._id },
      {
        $set: {
          requestsThisMinute: 0,
          lastRequestAt: now,
        },
      }
    );
  }

  return {
    allowed: true,
    remaining: quota.requestLimit - quota.totalRequests,
    resetAt: periodEnd,
  };
}

/**
 * Record usage after successful request
 */
export async function recordUsage(
  userId: string,
  tokens: number,
  costCents: number
): Promise<void> {
  const db = await getDb();
  const quotas = db.collection('user_usage_quotas');

  const now = new Date();

  await quotas.updateOne(
    {
      userId: new ObjectId(userId),
      periodStart: { $lte: now },
      periodEnd: { $gte: now },
    },
    {
      $inc: {
        totalRequests: 1,
        totalTokens: tokens,
        totalCost: costCents,
        requestsThisMinute: 1,
      },
      $set: {
        lastRequestAt: now,
        updatedAt: now,
      },
    }
  );
}

/**
 * Block user for abuse
 */
export async function blockUser(
  userId: string,
  reason: string
): Promise<void> {
  const db = await getDb();
  const quotas = db.collection('user_usage_quotas');

  await quotas.updateOne(
    { userId: new ObjectId(userId) },
    {
      $set: {
        isBlocked: true,
        blockReason: reason,
        updatedAt: new Date(),
      },
    }
  );
}
