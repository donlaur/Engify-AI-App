import { Redis } from '@upstash/redis';

// Rate limiting for OAuth endpoints
// More restrictive than general API due to security-sensitive operations

// Initialize Upstash Redis (lazy, only when rate limit is checked)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

const RATE_LIMITS = {
  // OAuth endpoints - very strict
  authorize: { window: 60, max: 10 }, // 10 attempts per minute
  token: { window: 60, max: 20 }, // 20 attempts per minute
  obo: { window: 60, max: 30 }, // 30 OBO exchanges per minute
  jwks: { window: 60, max: 100 }, // 100 key fetches per minute
};

export async function checkOAuthRateLimit(
  endpoint: keyof typeof RATE_LIMITS,
  identifier: string
): Promise<{ success: boolean; remaining?: number; resetTime?: number }> {
  const redisClient = getRedis();

  // If Redis is not configured, allow the request (fail open for development)
  if (!redisClient) {
    console.warn('Rate limiting disabled: UPSTASH_REDIS_REST_URL not configured');
    return { success: true, remaining: 999 };
  }

  const limit = RATE_LIMITS[endpoint];
  const key = `oauth_rate_limit:${endpoint}:${identifier}`;

  const now = Date.now();
  const windowStart = now - limit.window * 1000;

  try {
    // Get existing requests in window
    const requests = await redisClient.zrange(key, windowStart, now, { byScore: true });

    if (requests.length >= limit.max) {
      // Rate limit exceeded
      const oldestRequest = await redisClient.zrange(key, 0, 0, { withScores: true });
      const resetTime = oldestRequest.length > 0 ? Math.ceil((oldestRequest[0] as any).score / 1000) + limit.window : 0;

      return {
        success: false,
        resetTime,
      };
    }

    // Add current request
    await redisClient.zadd(key, { score: now, member: now.toString() });
    await redisClient.expire(key, limit.window);

    const remaining = limit.max - requests.length - 1;

    return {
      success: true,
      remaining,
    };
  } catch (error) {
    // If Redis fails, allow the request (fail open)
    console.error('Rate limit check failed:', error);
    return { success: true, remaining: 999 };
  }
}
