/**
 * Cache System Tests
 *
 * Comprehensive tests for the caching infrastructure including
 * adapters, strategies, and the cache manager.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheManager, CacheManagerConfig } from '../CacheManager';
import {
  MemoryCacheAdapter,
  MemoryCacheConfig,
} from '../adapters/MemoryAdapter';
import {
  WriteThroughStrategy,
  CacheAsideStrategy,
  RefreshAheadStrategy,
} from '../strategies/CacheStrategies';
import { CacheError } from '../types';

describe('Cache System', () => {
  describe('MemoryCacheAdapter', () => {
    let adapter: MemoryCacheAdapter;

    beforeEach(() => {
      const config: MemoryCacheConfig = {
        maxSize: 100,
        defaultTtl: 3600,
        enableLru: true,
        enableCompression: false,
      };
      adapter = new MemoryCacheAdapter(config);
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    it('should connect and disconnect', async () => {
      await adapter.connect();
      expect(adapter.isConnected()).toBe(true);

      await adapter.disconnect();
      expect(adapter.isConnected()).toBe(false);
    });

    it('should set and get values', async () => {
      await adapter.set('key1', 'value1', 3600);
      const value = await adapter.get('key1');
      expect(value).toBe('value1');
    });

    it('should handle TTL expiration', async () => {
      await adapter.set('key1', 'value1', 1); // 1 second TTL

      // Should exist immediately
      expect(await adapter.exists('key1')).toBe(true);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should be expired
      expect(await adapter.exists('key1')).toBe(false);
      expect(await adapter.get('key1')).toBe(null);
    });

    it('should delete keys', async () => {
      await adapter.set('key1', 'value1');
      expect(await adapter.delete('key1')).toBe(true);
      expect(await adapter.get('key1')).toBe(null);
    });

    it('should check key existence', async () => {
      expect(await adapter.exists('nonexistent')).toBe(false);

      await adapter.set('key1', 'value1');
      expect(await adapter.exists('key1')).toBe(true);
    });

    it('should clear all keys', async () => {
      await adapter.set('key1', 'value1');
      await adapter.set('key2', 'value2');

      await adapter.clear();

      expect(await adapter.exists('key1')).toBe(false);
      expect(await adapter.exists('key2')).toBe(false);
    });

    it('should get keys by pattern', async () => {
      await adapter.set('user:1', 'value1');
      await adapter.set('user:2', 'value2');
      await adapter.set('post:1', 'value3');

      const userKeys = await adapter.getKeys('user:*');
      expect(userKeys).toHaveLength(2);
      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');
    });

    it('should handle multiple operations', async () => {
      const entries = [
        { key: 'key1', value: 'value1', ttl: 3600 },
        { key: 'key2', value: 'value2', ttl: 3600 },
      ];

      await adapter.mset(entries);

      const values = await adapter.mget(['key1', 'key2']);
      expect(values).toEqual(['value1', 'value2']);

      const deletedCount = await adapter.mdelete(['key1', 'key2']);
      expect(deletedCount).toBe(2);
    });

    it('should provide statistics', () => {
      const stats = adapter.getStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('totalAccesses');
      expect(stats).toHaveProperty('averageTtl');
    });
  });

  describe('Cache Strategies', () => {
    let adapter: MemoryCacheAdapter;
    let mockDataStore: {
      get<T>(key: string): Promise<T | null>;
      set<T>(key: string, value: T): Promise<void>;
      delete(key: string): Promise<boolean>;
    };

    beforeEach(() => {
      const config: MemoryCacheConfig = {
        maxSize: 100,
        defaultTtl: 3600,
        enableLru: true,
        enableCompression: false,
      };
      adapter = new MemoryCacheAdapter(config);

      mockDataStore = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      };
    });

    afterEach(async () => {
      await adapter.disconnect();
    });

    describe('WriteThroughStrategy', () => {
      let strategy: WriteThroughStrategy;

      beforeEach(() => {
        strategy = new WriteThroughStrategy(adapter, mockDataStore);
      });

      it('should write to both cache and data store', async () => {
        await strategy.set('key1', 'value1', 3600);

        expect(mockDataStore.set).toHaveBeenCalledWith('key1', 'value1');

        const value = await strategy.get('key1');
        expect(value?.value).toBe('value1');
      });

      it('should delete from both cache and data store', async () => {
        await strategy.set('key1', 'value1');
        mockDataStore.delete.mockResolvedValue(true);

        const result = await strategy.delete('key1');
        expect(result).toBe(true);
        expect(mockDataStore.delete).toHaveBeenCalledWith('key1');
      });

      it('should invalidate by pattern', async () => {
        await strategy.set('user:1', 'value1');
        await strategy.set('user:2', 'value2');
        await strategy.set('post:1', 'value3');

        await strategy.invalidateByPattern('user:*');

        expect(await strategy.exists('user:1')).toBe(false);
        expect(await strategy.exists('user:2')).toBe(false);
        expect(await strategy.exists('post:1')).toBe(true);
      });
    });

    describe('CacheAsideStrategy', () => {
      let strategy: CacheAsideStrategy;

      beforeEach(() => {
        strategy = new CacheAsideStrategy(adapter, mockDataStore);
      });

      it('should only write to cache', async () => {
        await strategy.set('key1', 'value1', 3600);

        expect(mockDataStore.set).not.toHaveBeenCalled();

        const value = await strategy.get('key1');
        expect(value?.value).toBe('value1');
      });

      it('should implement get or fetch pattern', async () => {
        mockDataStore.get.mockResolvedValue('fetched_value');

        const value = await strategy.getOrFetch(
          'key1',
          async () => {
            return await mockDataStore.get('key1');
          },
          3600
        );

        expect(value).toBe('fetched_value');
        expect(mockDataStore.get).toHaveBeenCalledWith('key1');

        // Should be cached now
        const cachedValue = await strategy.get('key1');
        expect(cachedValue?.value).toBe('fetched_value');
      });
    });

    describe('RefreshAheadStrategy', () => {
      let strategy: RefreshAheadStrategy;

      beforeEach(() => {
        strategy = new RefreshAheadStrategy(adapter, mockDataStore);
      });

      it('should schedule refresh for expiring keys', async () => {
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        await strategy.set('key1', 'value1', 100); // Set with TTL

        // Wait a tiny bit for async operations
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Get should check TTL and schedule refresh if TTL is low
        const result = await strategy.get('key1');

        // Check if refresh was scheduled (either through direct call or via TTL check)
        // The strategy schedules refresh when ttl < refreshThreshold * 3600 (720)
        // For 100s TTL, it should schedule since 100 < 720
        expect(consoleSpy).toHaveBeenCalledWith(
          'Scheduling refresh for key: key1'
        );

        expect(result).toBeDefined();
        consoleSpy.mockRestore();
      });
    });
  });

  describe('CacheManager', () => {
    let cacheManager: CacheManager;

    beforeEach(() => {
      const config: CacheManagerConfig = {
        adapter: 'memory',
        strategy: 'cache-aside',
        defaultTtl: 3600,
        maxSize: 100,
        enableEvents: true,
        enableMetrics: true,
      };
      cacheManager = new CacheManager(config);
    });

    afterEach(async () => {
      await cacheManager.shutdown();
    });

    it('should initialize and shutdown', async () => {
      await cacheManager.initialize();
      expect(cacheManager.adapter.isConnected()).toBe(true);

      await cacheManager.shutdown();
    });

    it('should get and set values', async () => {
      await cacheManager.initialize();

      await cacheManager.set('key1', 'value1');
      const value = await cacheManager.get('key1');
      expect(value).toBe('value1');
    });

    it('should implement get or set pattern', async () => {
      await cacheManager.initialize();

      const fetcher = vi.fn().mockResolvedValue('fetched_value');

      const value = await cacheManager.getOrSet('key1', fetcher);
      expect(value).toBe('fetched_value');
      expect(fetcher).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const cachedValue = await cacheManager.getOrSet('key1', fetcher);
      expect(cachedValue).toBe('fetched_value');
      expect(fetcher).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should handle multiple operations', async () => {
      await cacheManager.initialize();

      const entries = new Map([
        ['key1', 'value1'],
        ['key2', 'value2'],
      ]);

      await cacheManager.mset(entries);

      const values = await cacheManager.mget(['key1', 'key2']);
      expect(values.get('key1')).toBe('value1');
      expect(values.get('key2')).toBe('value2');

      const deletedCount = await cacheManager.mdelete(['key1', 'key2']);
      expect(deletedCount).toBe(2);
    });

    it('should provide health status', async () => {
      await cacheManager.initialize();

      const health = await cacheManager.getHealth();
      expect(health.status).toBe('healthy');
      expect(health.details).toBe('Cache is operating normally');
    });

    it('should provide statistics', async () => {
      await cacheManager.initialize();

      await cacheManager.set('key1', 'value1');
      await cacheManager.get('key1'); // Hit
      await cacheManager.get('nonexistent'); // Miss

      const stats = await cacheManager.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should handle event handlers', async () => {
      await cacheManager.initialize();

      const eventHandler = {
        handle: vi.fn().mockResolvedValue(undefined),
      };

      cacheManager.addEventHandler(eventHandler);

      await cacheManager.set('key1', 'value1');
      await cacheManager.get('key1');

      // Wait a bit for async event handling
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(eventHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'set',
          key: 'key1',
        })
      );

      expect(eventHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hit',
          key: 'key1',
        })
      );
    });

    it('should invalidate by pattern', async () => {
      await cacheManager.initialize();

      await cacheManager.set('user:1', 'value1');
      await cacheManager.set('user:2', 'value2');
      await cacheManager.set('post:1', 'value3');

      await cacheManager.invalidateByPattern('user:*');

      expect(await cacheManager.exists('user:1')).toBe(false);
      expect(await cacheManager.exists('user:2')).toBe(false);
      expect(await cacheManager.exists('post:1')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache errors gracefully', async () => {
      const config: CacheManagerConfig = {
        adapter: 'memory',
        strategy: 'cache-aside',
        defaultTtl: 3600,
        enableEvents: false,
        enableMetrics: false,
      };
      const cacheManager = new CacheManager(config);

      await cacheManager.initialize();

      // Test error handling in getOrSet
      const errorFetcher = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      await expect(cacheManager.getOrSet('key1', errorFetcher)).rejects.toThrow(
        CacheError
      );

      await cacheManager.shutdown();
    });
  });

  describe('Integration Tests', () => {
    it('should work with different strategies', async () => {
      const strategies = [
        'cache-aside',
        'write-through',
        'refresh-ahead',
      ] as const;

      for (const strategy of strategies) {
        const config: CacheManagerConfig = {
          adapter: 'memory',
          strategy,
          defaultTtl: 3600,
          enableEvents: false,
          enableMetrics: false,
        };

        const cacheManager = new CacheManager(config);
        await cacheManager.initialize();

        await cacheManager.set('key1', 'value1');
        const value = await cacheManager.get('key1');
        expect(value).toBe('value1');

        await cacheManager.shutdown();
      }
    });

    it('should handle concurrent operations', async () => {
      const config: CacheManagerConfig = {
        adapter: 'memory',
        strategy: 'cache-aside',
        defaultTtl: 3600,
        enableEvents: false,
        enableMetrics: false,
      };

      const cacheManager = new CacheManager(config);
      await cacheManager.initialize();

      // Concurrent sets
      const promises = Array.from({ length: 10 }, (_, i) =>
        cacheManager.set(`key${i}`, `value${i}`)
      );

      await Promise.all(promises);

      // Verify all values
      for (let i = 0; i < 10; i++) {
        const value = await cacheManager.get(`key${i}`);
        expect(value).toBe(`value${i}`);
      }

      await cacheManager.shutdown();
    });
  });
});
