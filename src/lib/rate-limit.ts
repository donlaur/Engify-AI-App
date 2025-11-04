/**
 * Rate Limiting for AI API Calls
 * 
 * Prevents abuse of OpenAI and Google AI API keys
 * Tracks usage by IP address and user ID
 * 
 * Uses centralized constants from src/lib/constants/rates.ts (DRY principle)
 */

import { getDb } from '@/lib/mongodb';
import { AI_RATE_LIMITS } from '@/lib/constants/rates';
import { ERROR_MESSAGES, getRateLimitMessage } from '@/lib/constants/messages';

interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxTokensPerDay: number;
}

// Map constants to internal format for backward compatibility
const LIMITS: Record<string, RateLimitConfig> = {
  anonymous: {
    maxRequestsPerHour: AI_RATE_LIMITS.anonymous.perHour,
    maxRequestsPerDay: AI_RATE_LIMITS.anonymous.perDay,
    maxTokensPerDay: AI_RATE_LIMITS.anonymous.maxTokensPerDay,
  },
  authenticated: {
    maxRequestsPerHour: AI_RATE_LIMITS.authenticated.perHour,
    maxRequestsPerDay: AI_RATE_LIMITS.authenticated.perDay,
    maxTokensPerDay: AI_RATE_LIMITS.authenticated.maxTokensPerDay,
  },
  pro: {
    maxRequestsPerHour: AI_RATE_LIMITS.pro.perHour,
    maxRequestsPerDay: AI_RATE_LIMITS.pro.perDay,
    maxTokensPerDay: AI_RATE_LIMITS.pro.maxTokensPerDay,
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

/**
 * Check if request is allowed based on rate limits
 */
export async function checkRateLimit(
  identifier: string, // IP address or user ID
  tier: 'anonymous' | 'authenticated' | 'pro' = 'anonymous'
): Promise<RateLimitResult> {
  try {
    const db = await getDb();
    // Rate limiting uses its own collection - no service class available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get usage stats
    const usage = await collection.findOne({ identifier });

    if (!usage) {
      // First request - create record
      await collection.insertOne({
        identifier,
        tier,
        requests: [now],
        tokens: 0,
        createdAt: now,
        updatedAt: now,
      });

      return {
        allowed: true,
        remaining: LIMITS[tier].maxRequestsPerHour - 1,
        resetAt: new Date(now.getTime() + 60 * 60 * 1000),
      };
    }

    // Clean up old requests
    const recentRequests = usage.requests.filter(
      (req: Date) => new Date(req) > dayAgo
    );

    const requestsLastHour = recentRequests.filter(
      (req: Date) => new Date(req) > hourAgo
    ).length;

    const requestsLastDay = recentRequests.length;

    const limits = LIMITS[tier];

    // Check hourly limit
    if (requestsLastHour >= limits.maxRequestsPerHour) {
      const resetAt = new Date(hourAgo.getTime() + 60 * 60 * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        reason: getRateLimitMessage(resetAt),
      };
    }

    // Check daily limit
    if (requestsLastDay >= limits.maxRequestsPerDay) {
      const resetAt = new Date(dayAgo.getTime() + 24 * 60 * 60 * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        reason: ERROR_MESSAGES.DAILY_LIMIT_REACHED,
      };
    }

    // Check token limit (if tracked)
    if (usage.tokens >= limits.maxTokensPerDay) {
      const resetAt = new Date(dayAgo.getTime() + 24 * 60 * 60 * 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        reason: ERROR_MESSAGES.DAILY_LIMIT_REACHED,
      };
    }

    // Update usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await collection.updateOne(
      { identifier },
      {
        $push: { requests: now } as any,
        $set: { updatedAt: now, tier },
      }
    );

    return {
      allowed: true,
      remaining: limits.maxRequestsPerHour - requestsLastHour - 1,
      resetAt: new Date(hourAgo.getTime() + 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request but log error
    return {
      allowed: true,
      remaining: 0,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

/**
 * Track token usage for a request
 */
export async function trackTokenUsage(
  identifier: string,
  tokens: number
): Promise<void> {
  try {
    const db = await getDb();
    // Rate limiting uses its own collection - no service class available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    await collection.updateOne(
      { identifier },
      {
        $inc: { tokens },
        $set: { updatedAt: new Date() },
      }
    );
  } catch (error) {
    console.error('Token tracking error:', error);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    const parts = forwarded.split(',');
    // eslint-disable-next-line engify/no-unsafe-array-access
    return parts[0]?.trim() || 'unknown';
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Reset rate limits for a user (admin function)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    const db = await getDb();
    // Rate limiting uses its own collection - no service class available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    await collection.deleteOne({ identifier });
  } catch (error) {
    console.error('Reset rate limit error:', error);
  }
}
