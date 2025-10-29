/**
 * Cache Manager
 *
 * Main cache management interface that combines adapters and strategies.
 * Provides a unified API for all caching operations with advanced features.
 */

import {
  ICacheManager,
  ICacheStrategy,
  ICacheAdapter,
  ICacheEventHandler,
  CacheStats,
  CacheOptions,
  CacheEvent,
  CacheError,
} from './types';
import { RedisCacheAdapter, RedisConfig } from './adapters/RedisAdapter';
import {
  MemoryCacheAdapter,
  MemoryCacheConfig,
} from './adapters/MemoryAdapter';
import {
  WriteThroughStrategy,
  CacheAsideStrategy,
  RefreshAheadStrategy,
} from './strategies/CacheStrategies';

/**
 * Cache Manager Configuration
 */
export interface CacheManagerConfig {
  readonly adapter: 'redis' | 'memory' | 'hybrid';
  readonly strategy:
    | 'write-through'
    | 'write-behind'
    | 'cache-aside'
    | 'refresh-ahead';
  readonly defaultTtl: number;
  readonly maxSize?: number;
  readonly redis?: RedisConfig;
  readonly memory?: MemoryCacheConfig;
  readonly enableEvents: boolean;
  readonly enableMetrics: boolean;
}

/**
 * Cache Manager Implementation
 */
export class CacheManager implements ICacheManager {
  readonly strategy: ICacheStrategy;
  readonly adapter: ICacheAdapter;

  private eventHandlers: ICacheEventHandler[] = [];
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  };

  constructor(private config: CacheManagerConfig) {
    this.adapter = this.createAdapter();
    this.strategy = this.createStrategy();
  }

  /**
   * Create cache adapter based on configuration
   */
  private createAdapter(): ICacheAdapter {
    switch (this.config.adapter) {
      case 'redis':
        if (!this.config.redis) {
          throw new Error('Redis configuration is required for Redis adapter');
        }
        return new RedisCacheAdapter(this.config.redis);

      case 'memory':
        return new MemoryCacheAdapter(
          this.config.memory ?? {
            maxSize: this.config.maxSize ?? 1000,
            defaultTtl: this.config.defaultTtl,
            enableLru: true,
            enableCompression: false,
          }
        );

      case 'hybrid':
        // Hybrid adapter would combine memory and Redis
        // For now, fall back to memory
        return new MemoryCacheAdapter(
          this.config.memory ?? {
            maxSize: this.config.maxSize ?? 1000,
            defaultTtl: this.config.defaultTtl,
            enableLru: true,
            enableCompression: false,
          }
        );

      default:
        throw new Error(`Unsupported adapter type: ${this.config.adapter}`);
    }
  }

  /**
   * Create cache strategy based on configuration
   */
  private createStrategy(): ICacheStrategy {
    // Mock data store for strategies
    const mockDataStore = {
      get: async <T>(key: string): Promise<T | null> => {
        // In a real implementation, this would connect to your data store
        console.log(`Data store get: ${key}`);
        return null;
      },
      set: async <T>(key: string, _value: T): Promise<void> => {
        console.log(`Data store set: ${key}`);
      },
      delete: async (key: string): Promise<boolean> => {
        console.log(`Data store delete: ${key}`);
        return true;
      },
    };

    switch (this.config.strategy) {
      case 'write-through':
        return new WriteThroughStrategy(this.adapter, mockDataStore);

      case 'cache-aside':
        return new CacheAsideStrategy(this.adapter, mockDataStore);

      case 'refresh-ahead':
        return new RefreshAheadStrategy(this.adapter, mockDataStore);

      default:
        throw new Error(`Unsupported strategy: ${this.config.strategy}`);
    }
  }

  /**
   * Initialize cache manager
   */
  async initialize(): Promise<void> {
    try {
      await this.adapter.connect();
      console.log(
        `Cache manager initialized with ${this.config.adapter} adapter and ${this.config.strategy} strategy`
      );
    } catch (error) {
      throw new CacheError(
        'Failed to initialize cache manager',
        'initialize',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, _options?: CacheOptions): Promise<T | null> {
    try {
      const entry = await this.strategy.get<T>(key);

      if (entry) {
        this.stats.hits++;
        this.emitEvent({
          type: 'hit',
          key,
          timestamp: new Date(),
          ttl: entry.ttl,
          tags: entry.tags,
        });
        return entry.value;
      } else {
        this.stats.misses++;
        this.emitEvent({
          type: 'miss',
          key,
          timestamp: new Date(),
        });
        return null;
      }
    } catch (error) {
      throw new CacheError(
        `Failed to get value for key ${key}`,
        'get',
        key,
        error as Error
      );
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl ?? this.config.defaultTtl;
      const tags = options?.tags;

      await this.strategy.set(key, value, ttl, tags);

      this.stats.sets++;
      this.emitEvent({
        type: 'set',
        key,
        timestamp: new Date(),
        ttl,
        tags,
      });
    } catch (error) {
      throw new CacheError(
        `Failed to set value for key ${key}`,
        'set',
        key,
        error as Error
      );
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.strategy.delete(key);

      if (result) {
        this.stats.deletes++;
        this.emitEvent({
          type: 'delete',
          key,
          timestamp: new Date(),
        });
      }

      return result;
    } catch (error) {
      throw new CacheError(
        `Failed to delete key ${key}`,
        'delete',
        key,
        error as Error
      );
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    return this.strategy.exists(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.strategy.clear();
  }

  /**
   * Get or set pattern - core caching pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options);
      if (cached !== null) {
        return cached;
      }

      // Cache miss - fetch and cache
      const value = await fetcher();
      await this.set(key, value, options);

      return value;
    } catch (error) {
      throw new CacheError(
        `Failed to get or set value for key ${key}`,
        'getOrSet',
        key,
        error as Error
      );
    }
  }

  /**
   * Invalidate cache entries by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    await this.strategy.invalidateByTag(tag);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateByPattern(pattern: string): Promise<void> {
    await this.strategy.invalidateByPattern(pattern);
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<Map<string, T | null>> {
    try {
      const values = await this.adapter.mget<T>(keys);
      const result = new Map<string, T | null>();

      keys.forEach((key, index) => {
        result.set(key, values[index]);
      });

      return result;
    } catch (error) {
      throw new CacheError(
        `Failed to get multiple values`,
        'mget',
        keys.join(','),
        error as Error
      );
    }
  }

  /**
   * Set multiple values
   */
  async mset<T>(
    entries: Map<string, T>,
    options?: CacheOptions
  ): Promise<void> {
    try {
      const adapterEntries = Array.from(entries.entries()).map(
        ([key, value]) => ({
          key,
          value,
          ttl: options?.ttl ?? this.config.defaultTtl,
        })
      );

      await this.adapter.mset(adapterEntries);

      // Emit events for each set
      for (const [key] of entries) {
        this.emitEvent({
          type: 'set',
          key,
          timestamp: new Date(),
          ttl: options?.ttl ?? this.config.defaultTtl,
          tags: options?.tags,
        });
      }
    } catch (error) {
      throw new CacheError(
        `Failed to set multiple values`,
        'mset',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Delete multiple keys
   */
  async mdelete(keys: string[]): Promise<number> {
    try {
      const deletedCount = await this.adapter.mdelete(keys);

      // Emit events for each deletion
      for (const key of keys) {
        this.emitEvent({
          type: 'delete',
          key,
          timestamp: new Date(),
        });
      }

      return deletedCount;
    } catch (error) {
      throw new CacheError(
        `Failed to delete multiple keys`,
        'mdelete',
        keys.join(','),
        error as Error
      );
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const adapterStats = await this.strategy.getStats();

    return {
      ...adapterStats,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
    };
  }

  /**
   * Get cache health status
   */
  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: string;
  }> {
    try {
      const isConnected = this.adapter.isConnected();

      if (!isConnected) {
        return {
          status: 'unhealthy',
          details: 'Cache adapter is not connected',
        };
      }

      // Test basic operations
      const testKey = '__health_check__';
      await this.adapter.set(testKey, 'test', 10);
      const value = await this.adapter.get(testKey);
      await this.adapter.delete(testKey);

      if (value !== 'test') {
        return {
          status: 'degraded',
          details: 'Cache operations are not working correctly',
        };
      }

      return {
        status: 'healthy',
        details: 'Cache is operating normally',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: `Cache health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Add event handler
   */
  addEventHandler(handler: ICacheEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: ICacheEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Emit cache event
   */
  private emitEvent(event: CacheEvent): void {
    if (!this.config.enableEvents) {
      return;
    }

    for (const handler of this.eventHandlers) {
      handler.handle(event).catch((error) => {
        console.error('Error in cache event handler:', error);
      });
    }
  }

  /**
   * Shutdown cache manager
   */
  async shutdown(): Promise<void> {
    try {
      await this.adapter.disconnect();
      console.log('Cache manager shutdown complete');
    } catch (error) {
      console.error('Error during cache manager shutdown:', error);
    }
  }
}
