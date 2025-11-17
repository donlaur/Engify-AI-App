/**
 * Cache Provider
 *
 * Singleton provider for in-memory caching with TTL support.
 * Provides centralized caching for:
 * - User sessions
 * - Rate limit counters
 * - Frequently accessed data
 * - API responses
 *
 * Features:
 * - TTL (Time To Live) support
 * - Automatic cleanup of expired entries
 * - Type-safe cache operations
 * - Memory-efficient storage
 * - Statistics and monitoring
 *
 * Usage:
 * ```typescript
 * const cache = CacheProvider.getInstance();
 * await cache.set('user:123', userData, 300); // 5 minutes TTL
 * const user = await cache.get<User>('user:123');
 * ```
 *
 * @module CacheProvider
 */

export interface CacheEntry<T = any> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

export class CacheProvider {
  private static instance: CacheProvider;
  private cache: Map<string, CacheEntry>;
  private hits: number = 0;
  private misses: number = 0;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CacheProvider {
    if (!CacheProvider.instance) {
      CacheProvider.instance = new CacheProvider();
    }
    return CacheProvider.instance;
  }

  /**
   * Set cache entry with optional TTL (in seconds)
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const now = Date.now();
    const expiresAt = ttl ? now + ttl * 1000 : Number.MAX_SAFE_INTEGER;

    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: now,
    });
  }

  /**
   * Get cache entry
   * Returns null if not found or expired
   */
  public async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value as T;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Check if key exists and is not expired
   */
  public async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete cache entry
   */
  public async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * Delete all entries matching pattern
   */
  public async deletePattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern);
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const total = this.hits + this.misses;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      oldestEntry: entries.length > 0
        ? Math.min(...entries.map(e => e.createdAt))
        : null,
      newestEntry: entries.length > 0
        ? Math.max(...entries.map(e => e.createdAt))
        : null,
    };
  }

  /**
   * Increment a counter in cache
   * Useful for rate limiting
   */
  public async increment(key: string, ttl?: number): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + 1;
    await this.set(key, newValue, ttl);
    return newValue;
  }

  /**
   * Decrement a counter in cache
   */
  public async decrement(key: string, ttl?: number): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = Math.max(0, current - 1);
    await this.set(key, newValue, ttl);
    return newValue;
  }

  /**
   * Get TTL remaining (in seconds)
   */
  public async ttl(key: string): Promise<number | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const remaining = Math.max(0, entry.expiresAt - Date.now());
    return Math.floor(remaining / 1000);
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);

    // Don't prevent Node.js from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Stop cleanup interval
   */
  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * For testing: reset singleton instance
   */
  public static resetInstance(): void {
    if (CacheProvider.instance) {
      CacheProvider.instance.stopCleanupInterval();
      CacheProvider.instance.cache.clear();
      CacheProvider.instance = null as any;
    }
  }
}

/**
 * Convenience export for quick access
 */
export const cacheProvider = CacheProvider.getInstance();
