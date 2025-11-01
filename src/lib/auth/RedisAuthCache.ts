/**
 * Redis Auth Cache Service
 *
 * Caches user data and authentication state in Redis to reduce MongoDB queries
 * and improve login performance. Critical for serverless environments where
 * MongoDB connections can be slow or unreliable.
 *
 * Supports both:
 * - Upstash Redis (REST API) - Recommended for serverless/production
 * - Standard Redis (TCP) - For local development
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
 * Upstash Redis REST API client
 */
class UpstashRedisClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authToken = authToken;
  }

  /**
   * Make HTTP request to Upstash Redis REST API
   */
  private async makeRequest(
    command: string,
    args: (string | number)[] = []
  ): Promise<unknown> {
    const url = `${this.baseUrl}/${command}`;
    const body = args.map(String); // Convert all args to strings

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // Upstash returns { result: <value> } format
      return (result as { result?: unknown }).result ?? result;
    } catch (error) {
      throw new Error(
        `Upstash Redis request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async get(key: string): Promise<string | null> {
    const result = await this.makeRequest('GET', [key]);
    return result === null ? null : String(result);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.makeRequest('SETEX', [key, seconds, value]);
  }

  async del(key: string): Promise<number> {
    const result = await this.makeRequest('DEL', [key]);
    return typeof result === 'number' ? result : 0;
  }

  async incr(key: string): Promise<number> {
    const result = await this.makeRequest('INCR', [key]);
    return typeof result === 'number' ? result : 0;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const result = await this.makeRequest('EXPIRE', [key, seconds]);
    return typeof result === 'number' ? result : 0;
  }

  async ping(): Promise<string> {
    const result = await this.makeRequest('PING');
    return String(result);
  }
}

/**
 * Get Redis client instance (Upstash or standard)
 * Uses singleton pattern to reuse connection across requests
 */
let redisClient: Redis | UpstashRedisClient | null = null;
let isUpstash = false;

function getRedisClient(): Redis | UpstashRedisClient {
  if (!redisClient) {
    // Check if using Upstash (serverless Redis)
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      // Use Upstash REST API
      isUpstash = true;
      redisClient = new UpstashRedisClient(upstashUrl, upstashToken);
      console.log('Using Upstash Redis (REST API) for auth cache');
      return redisClient;
    }

    // Fall back to standard Redis (local development)
    isUpstash = false;
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
  private redis: Redis | UpstashRedisClient;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Check if Redis is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (isUpstash) {
        await (this.redis as UpstashRedisClient).ping();
      } else {
        await (this.redis as Redis).ping();
      }
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
        const value = JSON.stringify(userWithoutPassword);

        if (isUpstash) {
          await (this.redis as UpstashRedisClient).setex(
            key,
            CACHE_TTL.userData,
            value
          );
        } else {
          await (this.redis as Redis).setex(key, CACHE_TTL.userData, value);
        }

        // Also cache by ID for fast lookups
        await this.cacheUserById(user._id.toString(), user);
      } else {
        // Cache null result to prevent repeated MongoDB lookups for non-existent users
        // Shorter TTL for negative cache (1 minute)
        const value = JSON.stringify(null);
        if (isUpstash) {
          await (this.redis as UpstashRedisClient).setex(key, 60, value);
        } else {
          await (this.redis as Redis).setex(key, 60, value);
        }
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
      const cached = isUpstash
        ? await (this.redis as UpstashRedisClient).get(key)
        : await (this.redis as Redis).get(key);

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
      const value = JSON.stringify(userWithoutPassword);

      if (isUpstash) {
        await (this.redis as UpstashRedisClient).setex(
          key,
          CACHE_TTL.userData,
          value
        );
      } else {
        await (this.redis as Redis).setex(key, CACHE_TTL.userData, value);
      }
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
      const cached = isUpstash
        ? await (this.redis as UpstashRedisClient).get(key)
        : await (this.redis as Redis).get(key);

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

      if (isUpstash) {
        await Promise.all(
          keys.map((key) => (this.redis as UpstashRedisClient).del(key))
        );
      } else {
        await Promise.all(keys.map((key) => (this.redis as Redis).del(key)));
      }
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
      let attempts: number;

      if (isUpstash) {
        attempts = await (this.redis as UpstashRedisClient).incr(key);
        // Set TTL on first attempt
        if (attempts === 1) {
          await (this.redis as UpstashRedisClient).expire(
            key,
            CACHE_TTL.loginAttempts
          );
        }
      } else {
        attempts = await (this.redis as Redis).incr(key);
        // Set TTL on first attempt
        if (attempts === 1) {
          await (this.redis as Redis).expire(key, CACHE_TTL.loginAttempts);
        }
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
      if (isUpstash) {
        await (this.redis as UpstashRedisClient).del(key);
      } else {
        await (this.redis as Redis).del(key);
      }
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
      const attempts = isUpstash
        ? await (this.redis as UpstashRedisClient).get(key)
        : await (this.redis as Redis).get(key);
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
      const value = JSON.stringify(sessionData);

      if (isUpstash) {
        await (this.redis as UpstashRedisClient).setex(
          key,
          CACHE_TTL.session,
          value
        );
      } else {
        await (this.redis as Redis).setex(key, CACHE_TTL.session, value);
      }
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
      const cached = isUpstash
        ? await (this.redis as UpstashRedisClient).get(key)
        : await (this.redis as Redis).get(key);

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
      if (isUpstash) {
        await (this.redis as UpstashRedisClient).del(key);
      } else {
        await (this.redis as Redis).del(key);
      }
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
