/**
 * Rate Limiting for AI API Calls
 *
 * @module rate-limit
 * @description Prevents abuse of AI API keys by implementing tiered rate limiting.
 * Tracks usage by IP address (anonymous) or user ID (authenticated).
 *
 * Features:
 * - Tiered limits: anonymous, authenticated, and pro users
 * - Hourly and daily request limits
 * - Token usage tracking
 * - Automatic cleanup of old requests
 * - Fail-safe behavior (fail closed in production, open in development)
 *
 * Uses centralized constants from src/lib/constants/rates.ts (DRY principle)
 *
 * @example
 * // Check rate limit before making API call
 * const result = await checkRateLimit(userId, 'authenticated');
 * if (!result.allowed) {
 *   return res.status(429).json({
 *     error: result.reason,
 *     resetAt: result.resetAt
 *   });
 * }
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
 *
 * @description Verifies if a request is within rate limits. Creates a new rate limit
 * record if this is the first request. Automatically cleans up old requests and
 * updates the database with the new request.
 *
 * @param {string} identifier - Unique identifier (IP address for anonymous, user ID for authenticated)
 * @param {'anonymous' | 'authenticated' | 'pro'} [tier='anonymous'] - Rate limit tier
 *
 * @returns {Promise<RateLimitResult>} Rate limit check result
 * @returns {boolean} result.allowed - Whether the request is allowed
 * @returns {number} result.remaining - Requests remaining in current window
 * @returns {Date} result.resetAt - When the rate limit resets
 * @returns {string} [result.reason] - Human-readable reason if denied
 *
 * @throws Never throws - Returns allowed: false on errors in production
 *
 * @example
 * // Check rate limit for authenticated user
 * const result = await checkRateLimit(session.user.id, 'authenticated');
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: result.reason },
 *     { status: 429, headers: { 'Retry-After': '60' } }
 *   );
 * }
 *
 * @example
 * // Check rate limit for anonymous user (by IP)
 * const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
 * const result = await checkRateLimit(clientIp, 'anonymous');
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

    // Production: Fail closed - deny requests if rate limiting is unavailable
    // This prevents abuse if database is down or compromised
    if (process.env.NODE_ENV === 'production') {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + 60 * 60 * 1000),
        reason: 'Rate limit service temporarily unavailable. Please try again in a few moments.',
      };
    }

    // Development: Fail open to allow testing without database
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

/**
 * Track token usage for a request
 *
 * @description Records token usage for rate limiting purposes. This is called
 * after an AI request completes to track cumulative token usage.
 *
 * @param {string} identifier - Unique identifier (IP address or user ID)
 * @param {number} tokens - Number of tokens used in the request
 *
 * @returns {Promise<void>}
 *
 * @example
 * // After OpenAI request
 * const completion = await openai.chat.completions.create({...});
 * await trackTokenUsage(userId, completion.usage.total_tokens);
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
 *
 * @description Extracts the client's IP address from request headers, checking
 * x-forwarded-for (for proxies/load balancers) and x-real-ip as fallbacks.
 *
 * @param {Request} request - The HTTP request object
 *
 * @returns {string} The client IP address, or 'unknown' if not found
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const clientIp = getClientIp(request);
 *   const result = await checkRateLimit(clientIp, 'anonymous');
 *   // ...
 * }
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
 *
 * @description Clears all rate limit records for a specific identifier.
 * This is an administrative function that should only be called by admins.
 *
 * @param {string} identifier - Unique identifier to reset (IP address or user ID)
 *
 * @returns {Promise<void>}
 *
 * @example
 * // Admin endpoint to reset user's rate limits
 * if (session.user.role === 'super_admin') {
 *   await resetRateLimit(targetUserId);
 * }
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
