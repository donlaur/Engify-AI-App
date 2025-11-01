/**
 * Redis Auth Cache Service
 *
 * Caches user data and authentication state in Redis to reduce MongoDB queries
 * and improve login performance. Critical for serverless environments where
 * MongoDB connections can be slow or unreliable.
 *
 * Benefits:
 * - Faster user lookups (Redis ~1ms vs MongoDB ~50-100ms)
 * - Reduces MongoDB connection load
 * - Better reliability (Redis is more stable in serverless)
 * - Rate limiting for login attempts
 * - Session caching
 */

import Redis from 'ioredis';
import type { User } from '@/lib/db/schema';

// Cache keys
const CACHE_KEYS = {
  userByEmail: (email: string) => `auth:user:email:${email.toLowerCase()}`,
  userById: (id: string) => `auth:user:id:${id}`,
  loginAttempts: (email: string) =>
    `auth:login:attempts:${email.toLowerCase()}`,
  session: (sessionId: string) => `auth:session:${sessionId}`,
} as const;

// Cache TTLs (in seconds)
const CACHE_TTL = {
  userData: 300, // 5 minutes - user data doesn't change often
  loginAttempts: 900, // 15 minutes - track failed attempts
  session: 86400, // 24 hours - session cache
} as const;

/**
 * Get Redis client instance
 * Uses singleton pattern to reuse connection across requests
 */
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    // Check if using Upstash (serverless Redis)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      // Upstash uses REST API, not direct Redis connection
      // For now, fall back to standard Redis config
      // TODO: Implement Upstash REST client if needed
    }

    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      enableReadyCheck: true,
      lazyConnect: true, // Don't connect immediately
    });

    // Handle connection errors gracefully
    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
      // Don't throw - fall back to MongoDB if Redis fails
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redisClient;
}

/**
 * Redis Auth Cache Service
 */
export class RedisAuthCache {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Check if Redis is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cache user by email (primary lookup during login)
   */
  async cacheUserByEmail(email: string, user: User | null): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const key = CACHE_KEYS.userByEmail(email);

      if (user) {
        // Cache user data (exclude password hash from cache)
        const { password: _, ...userWithoutPassword } = user;
        await this.redis.setex(
          key,
          CACHE_TTL.userData,
          JSON.stringify(userWithoutPassword)
        );

        // Also cache by ID for fast lookups
        await this.cacheUserById(user._id.toString(), user);
      } else {
        // Cache null result to prevent repeated MongoDB lookups for non-existent users
        // Shorter TTL for negative cache (1 minute)
        await this.redis.setex(key, 60, JSON.stringify(null));
      }
    } catch (error) {
      // Silently fail - MongoDB is fallback
      console.warn('Redis cache error (user by email):', error);
    }
  }

  /**
   * Get cached user by email
   * Returns: User | null | undefined
   * - User: User found in cache
   * - null: Cached as non-existent (negative cache)
   * - undefined: Not cached (need to query MongoDB)
   */
  async getUserByEmail(email: string): Promise<User | null | undefined> {
    try {
      if (!(await this.isAvailable())) return undefined;

      const key = CACHE_KEYS.userByEmail(email);
      const cached = await this.redis.get(key);

      if (cached === null) return undefined; // Not cached

      const parsed = JSON.parse(cached);

      // Check if this is a negative cache marker
      if (parsed === null) {
        return null; // Cached as non-existent
      }

      return parsed as User;
    } catch (error) {
      // Silently fail - fall back to MongoDB
      console.warn('Redis cache read error (user by email):', error);
      return undefined;
    }
  }

  /**
   * Cache user by ID
   */
  async cacheUserById(id: string, user: User): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const key = CACHE_KEYS.userById(id);
      const { password: _, ...userWithoutPassword } = user;

      await this.redis.setex(
        key,
        CACHE_TTL.userData,
        JSON.stringify(userWithoutPassword)
      );
    } catch (error) {
      console.warn('Redis cache error (user by id):', error);
    }
  }

  /**
   * Get cached user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      if (!(await this.isAvailable())) return null;

      const key = CACHE_KEYS.userById(id);
      const cached = await this.redis.get(key);

      if (cached === null) return null;

      return JSON.parse(cached) as User;
    } catch (error) {
      console.warn('Redis cache read error (user by id):', error);
      return null;
    }
  }

  /**
   * Invalidate user cache (call when user data changes)
   */
  async invalidateUser(email: string, userId?: string): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const keys = [CACHE_KEYS.userByEmail(email)];
      if (userId) {
        keys.push(CACHE_KEYS.userById(userId));
      }

      await Promise.all(keys.map((key) => this.redis.del(key)));
    } catch (error) {
      console.warn('Redis cache invalidation error:', error);
    }
  }

  /**
   * Track login attempts for rate limiting
   */
  async incrementLoginAttempts(email: string): Promise<number> {
    try {
      if (!(await this.isAvailable())) return 0;

      const key = CACHE_KEYS.loginAttempts(email);
      const attempts = await this.redis.incr(key);

      // Set TTL on first attempt
      if (attempts === 1) {
        await this.redis.expire(key, CACHE_TTL.loginAttempts);
      }

      return attempts;
    } catch (error) {
      console.warn('Redis rate limit error:', error);
      return 0;
    }
  }

  /**
   * Reset login attempts (after successful login)
   */
  async resetLoginAttempts(email: string): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const key = CACHE_KEYS.loginAttempts(email);
      await this.redis.del(key);
    } catch (error) {
      console.warn('Redis reset attempts error:', error);
    }
  }

  /**
   * Get login attempt count
   */
  async getLoginAttempts(email: string): Promise<number> {
    try {
      if (!(await this.isAvailable())) return 0;

      const key = CACHE_KEYS.loginAttempts(email);
      const attempts = await this.redis.get(key);
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.warn('Redis get attempts error:', error);
      return 0;
    }
  }

  /**
   * Cache session data
   */
  async cacheSession(sessionId: string, sessionData: unknown): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const key = CACHE_KEYS.session(sessionId);
      await this.redis.setex(
        key,
        CACHE_TTL.session,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.warn('Redis session cache error:', error);
    }
  }

  /**
   * Get cached session
   */
  async getSession(sessionId: string): Promise<unknown | null> {
    try {
      if (!(await this.isAvailable())) return null;

      const key = CACHE_KEYS.session(sessionId);
      const cached = await this.redis.get(key);

      if (cached === null) return null;

      return JSON.parse(cached);
    } catch (error) {
      console.warn('Redis session read error:', error);
      return null;
    }
  }

  /**
   * Invalidate session
   */
  async invalidateSession(sessionId: string): Promise<void> {
    try {
      if (!(await this.isAvailable())) return;

      const key = CACHE_KEYS.session(sessionId);
      await this.redis.del(key);
    } catch (error) {
      console.warn('Redis session invalidation error:', error);
    }
  }
}

// Singleton instance
let authCacheInstance: RedisAuthCache | null = null;

/**
 * Get singleton Redis auth cache instance
 */
export function getAuthCache(): RedisAuthCache {
  if (!authCacheInstance) {
    authCacheInstance = new RedisAuthCache();
  }
  return authCacheInstance;
}
