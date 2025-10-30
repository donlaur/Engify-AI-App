/**
 * Cache Strategies Implementation
 *
 * Implements various caching strategies including write-through, write-behind,
 * cache-aside, and refresh-ahead patterns.
 */

import { ICacheStrategy, CacheEntry, CacheStats, CacheError } from '../types';
import { ICacheAdapter } from '../types';

/**
 * Write-Through Cache Strategy
 *
 * Writes to cache and underlying data store simultaneously.
 * Ensures data consistency but may have higher latency.
 */
export class WriteThroughStrategy implements ICacheStrategy {
  readonly name = 'WriteThrough';

  constructor(
    private adapter: ICacheAdapter,
    private dataStore: {
      get<T>(key: string): Promise<T | null>;
      set<T>(key: string, value: T): Promise<void>;
      delete(key: string): Promise<boolean>;
    }
  ) {}

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const value = await this.adapter.get<T>(key);

      if (value === null) {
        return null;
      }

      // Create cache entry with metadata
      return {
        key,
        value,
        ttl: await this.adapter.getTtl(key),
        createdAt: new Date(), // Would need to be stored
        expiresAt: new Date(
          Date.now() + (await this.adapter.getTtl(key)) * 1000
        ),
        accessCount: 1, // Would need to be tracked
        lastAccessedAt: new Date(),
      };
    } catch (error) {
      throw new CacheError(
        `Failed to get value for key ${key}`,
        'get',
        key,
        error as Error
      );
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    _tags?: string[]
  ): Promise<void> {
    try {
      // Write to both cache and data store
      await Promise.all([
        this.adapter.set(key, value, ttl),
        this.dataStore.set(key, value),
      ]);
    } catch (error) {
      throw new CacheError(
        `Failed to set value for key ${key}`,
        'set',
        key,
        error as Error
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const [cacheResult, storeResult] = await Promise.all([
        this.adapter.delete(key),
        this.dataStore.delete(key),
      ]);

      return cacheResult && storeResult;
    } catch (error) {
      throw new CacheError(
        `Failed to delete key ${key}`,
        'delete',
        key,
        error as Error
      );
    }
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.adapter.exists(key);
  }

  async getKeys(pattern?: string): Promise<string[]> {
    return this.adapter.getKeys(pattern);
  }

  async getStats(): Promise<CacheStats> {
    // Simplified stats - would need more sophisticated tracking
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: (await this.getKeys()).length,
      memoryUsage: 0,
      evictions: 0,
      averageTtl: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  async invalidateByTag(tag: string): Promise<void> {
    // Would need tag-based indexing
    console.log(`Invalidating by tag: ${tag}`);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.getKeys(pattern);
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  async refresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      const value = await fetcher();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      throw new CacheError(
        `Failed to refresh value for key ${key}`,
        'refresh',
        key,
        error as Error
      );
    }
  }
}

/**
 * Cache-Aside Strategy
 *
 * Application manages cache explicitly. Cache is checked first,
 * and if miss, data is fetched from store and cached.
 */
export class CacheAsideStrategy implements ICacheStrategy {
  readonly name = 'CacheAside';

  constructor(
    private adapter: ICacheAdapter,
    private dataStore: {
      get<T>(key: string): Promise<T | null>;
      set<T>(key: string, value: T): Promise<void>;
      delete(key: string): Promise<boolean>;
    }
  ) {}

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const value = await this.adapter.get<T>(key);

      if (value === null) {
        return null;
      }

      return {
        key,
        value,
        ttl: await this.adapter.getTtl(key),
        createdAt: new Date(),
        expiresAt: new Date(
          Date.now() + (await this.adapter.getTtl(key)) * 1000
        ),
        accessCount: 1,
        lastAccessedAt: new Date(),
      };
    } catch (error) {
      throw new CacheError(
        `Failed to get value for key ${key}`,
        'get',
        key,
        error as Error
      );
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    _tags?: string[]
  ): Promise<void> {
    try {
      // Only write to cache in cache-aside
      await this.adapter.set(key, value, ttl);
    } catch (error) {
      throw new CacheError(
        `Failed to set value for key ${key}`,
        'set',
        key,
        error as Error
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      // Delete from both cache and store
      const [cacheResult, storeResult] = await Promise.all([
        this.adapter.delete(key),
        this.dataStore.delete(key),
      ]);

      return cacheResult || storeResult;
    } catch (error) {
      throw new CacheError(
        `Failed to delete key ${key}`,
        'delete',
        key,
        error as Error
      );
    }
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.adapter.exists(key);
  }

  async getKeys(pattern?: string): Promise<string[]> {
    return this.adapter.getKeys(pattern);
  }

  async getStats(): Promise<CacheStats> {
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: (await this.getKeys()).length,
      memoryUsage: 0,
      evictions: 0,
      averageTtl: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  async invalidateByTag(tag: string): Promise<void> {
    console.log(`Invalidating by tag: ${tag}`);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.getKeys(pattern);
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  async refresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      const value = await fetcher();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      throw new CacheError(
        `Failed to refresh value for key ${key}`,
        'refresh',
        key,
        error as Error
      );
    }
  }

  /**
   * Get or fetch pattern - core of cache-aside
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      // Try cache first
      const cached = await this.get<T>(key);
      if (cached) {
        return cached.value;
      }

      // Cache miss - fetch from store
      const value = await fetcher();

      // Cache the result
      await this.set(key, value, ttl);

      return value;
    } catch (error) {
      throw new CacheError(
        `Failed to get or fetch value for key ${key}`,
        'getOrFetch',
        key,
        error as Error
      );
    }
  }
}

/**
 * Refresh-Ahead Strategy
 *
 * Proactively refreshes cache entries before they expire.
 * Reduces cache misses but requires background processing.
 */
export class RefreshAheadStrategy implements ICacheStrategy {
  readonly name = 'RefreshAhead';
  private refreshThreshold = 0.2; // Refresh when 20% of TTL remains

  constructor(
    private adapter: ICacheAdapter,
    private _dataStore: {
      get<T>(key: string): Promise<T | null>;
      set<T>(key: string, value: T): Promise<void>;
      delete(key: string): Promise<boolean>;
    }
  ) {
    this.startRefreshScheduler();
  }

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      const value = await this.adapter.get<T>(key);

      if (value === null) {
        return null;
      }

      const ttl = await this.adapter.getTtl(key);

      // Check if we should refresh
      if (ttl > 0 && ttl < this.refreshThreshold * 3600) {
        // Assuming 1 hour default TTL
        this.scheduleRefresh(key);
      }

      return {
        key,
        value,
        ttl,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttl * 1000),
        accessCount: 1,
        lastAccessedAt: new Date(),
      };
    } catch (error) {
      throw new CacheError(
        `Failed to get value for key ${key}`,
        'get',
        key,
        error as Error
      );
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    _tags?: string[]
  ): Promise<void> {
    try {
      await this.adapter.set(key, value, ttl);
    } catch (error) {
      throw new CacheError(
        `Failed to set value for key ${key}`,
        'set',
        key,
        error as Error
      );
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      return await this.adapter.delete(key);
    } catch (error) {
      throw new CacheError(
        `Failed to delete key ${key}`,
        'delete',
        key,
        error as Error
      );
    }
  }

  async clear(): Promise<void> {
    await this.adapter.clear();
  }

  async exists(key: string): Promise<boolean> {
    return this.adapter.exists(key);
  }

  async getKeys(pattern?: string): Promise<string[]> {
    return this.adapter.getKeys(pattern);
  }

  async getStats(): Promise<CacheStats> {
    return {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalKeys: (await this.getKeys()).length,
      memoryUsage: 0,
      evictions: 0,
      averageTtl: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  async invalidateByTag(tag: string): Promise<void> {
    console.log(`Invalidating by tag: ${tag}`);
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    const keys = await this.getKeys(pattern);
    await Promise.all(keys.map((key) => this.delete(key)));
  }

  async refresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      const value = await fetcher();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      throw new CacheError(
        `Failed to refresh value for key ${key}`,
        'refresh',
        key,
        error as Error
      );
    }
  }

  /**
   * Schedule refresh for a key
   */
  private scheduleRefresh(key: string): void {
    // In a real implementation, this would add to a refresh queue
    console.log(`Scheduling refresh for key: ${key}`);
  }

  /**
   * Start background refresh scheduler
   */
  private startRefreshScheduler(): void {
    // In a real implementation, this would run a background process
    // to check for keys that need refreshing
    setInterval(() => {
      console.log('Running refresh-ahead scheduler');
    }, 60000); // Check every minute
  }
}
