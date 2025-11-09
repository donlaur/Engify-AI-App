/**
 * Redis-based rate limiter for API routes
 * Works across serverless instances using Upstash Redis
 * Falls back to in-memory for local development
 */

import { Redis } from '@upstash/redis';

type Key = string;

interface Bucket {
  tokens: number;
  updatedAt: number; // epoch ms
}

// In-memory fallback for local dev (when Redis not configured)
const buckets = new Map<Key, Bucket>();

// Redis client (lazy init)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  }
  
  return null;
}

export interface RateLimitOptions {
  windowMs: number; // refill window
  max: number; // max tokens per window
  key?: string; // override key
}

/**
 * Redis-based rate limiter with sliding window
 */
async function rateLimitRedis(key: string, opts: RateLimitOptions): Promise<boolean> {
  const redis = getRedis();
  if (!redis) {
    // Fallback to in-memory
    return rateLimitMemory(key, opts);
  }

  try {
    const now = Date.now();
    const windowMs = Math.max(1000, opts.windowMs);
    const max = Math.max(1, opts.max);
    const redisKey = `ratelimit:${key}`;

    // Get current count and timestamp
    const data = await redis.get<{ count: number; resetAt: number }>(redisKey);
    
    if (!data) {
      // First request - set count and expiry
      const resetAt = now + windowMs;
      await redis.set(redisKey, { count: 1, resetAt }, { px: windowMs });
      return true;
    }

    // Check if window has expired
    if (now >= data.resetAt) {
      // Window expired, reset
      const resetAt = now + windowMs;
      await redis.set(redisKey, { count: 1, resetAt }, { px: windowMs });
      return true;
    }

    // Check if limit exceeded
    if (data.count >= max) {
      return false;
    }

    // Increment count
    const newCount = data.count + 1;
    const ttl = data.resetAt - now;
    await redis.set(redisKey, { count: newCount, resetAt: data.resetAt }, { px: ttl });
    return true;

  } catch (error) {
    console.error('Redis rate limit error, falling back to memory:', error);
    return rateLimitMemory(key, opts);
  }
}

/**
 * In-memory rate limiter (fallback for local dev)
 */
function rateLimitMemory(key: string, opts: RateLimitOptions): boolean {
  const now = Date.now();
  const windowMs = Math.max(1000, opts.windowMs);
  const max = Math.max(1, opts.max);

  const bucket = buckets.get(key) ?? { tokens: max, updatedAt: now };
  
  // Refill based on elapsed windows
  const elapsed = now - bucket.updatedAt;
  const refill = Math.floor(elapsed / windowMs) * max;
  if (refill > 0) {
    bucket.tokens = Math.min(max, bucket.tokens + refill);
    bucket.updatedAt = now;
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }
  
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}

/**
 * Rate limit a request
 * Uses Redis in production, in-memory for local dev
 */
export async function rateLimit(keyBase: string, opts: RateLimitOptions): Promise<boolean> {
  const key = opts.key ?? keyBase;
  return rateLimitRedis(key, opts);
}

/**
 * Synchronous version for backward compatibility
 * Note: This uses in-memory only and won't work across serverless instances
 * Use the async version for production
 */
export function rateLimitSync(keyBase: string, opts: RateLimitOptions): boolean {
  const key = opts.key ?? keyBase;
  return rateLimitMemory(key, opts);
}
