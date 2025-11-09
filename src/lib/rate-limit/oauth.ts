import { kv } from '@vercel/kv';

// Rate limiting for OAuth endpoints
// More restrictive than general API due to security-sensitive operations

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
  const limit = RATE_LIMITS[endpoint];
  const key = `oauth_rate_limit:${endpoint}:${identifier}`;
  
  const now = Date.now();
  const windowStart = now - limit.window * 1000;
  
  // Get existing requests in window
  const requests = await kv.zrangebyscore(key, windowStart, now);
  
  if (requests.length >= limit.max) {
    // Rate limit exceeded
    const oldestRequest = await kv.zrange(key, 0, 0, { withScores: true });
    const resetTime = oldestRequest.length > 0 ? Math.ceil(oldestRequest[0][1] / 1000) + limit.window : 0;
    
    return {
      success: false,
      resetTime,
    };
  }
  
  // Add current request
  await kv.zadd(key, { score: now, member: now.toString() });
  await kv.expire(key, limit.window);
  
  const remaining = limit.max - requests.length - 1;
  
  return {
    success: true,
    remaining,
  };
}
