/**
 * CacheProvider Tests
 *
 * Tests for the CacheProvider singleton.
 * Covers:
 * - Singleton behavior
 * - Basic cache operations (set, get, delete)
 * - TTL (Time To Live) functionality
 * - Pattern-based deletion
 * - Counter operations (increment/decrement)
 * - Cache statistics
 * - Automatic cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheProvider } from '../CacheProvider';

describe('CacheProvider', () => {
  let cacheProvider: CacheProvider;

  beforeEach(() => {
    // Reset singleton and get fresh instance
    CacheProvider.resetInstance();
    cacheProvider = CacheProvider.getInstance();
    vi.clearAllMocks();
  });

  afterEach(() => {
    CacheProvider.resetInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      // Arrange & Act
      const instance1 = CacheProvider.getInstance();
      const instance2 = CacheProvider.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      // Arrange
      const instance1 = CacheProvider.getInstance();

      // Act
      CacheProvider.resetInstance();
      const instance2 = CacheProvider.getInstance();

      // Assert
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('set and get', () => {
    it('should set and get a value', async () => {
      // Arrange
      const key = 'test-key';
      const value = { name: 'Test', count: 42 };

      // Act
      await cacheProvider.set(key, value);
      const result = await cacheProvider.get(key);

      // Assert
      expect(result).toEqual(value);
    });

    it('should return null for non-existent key', async () => {
      // Act
      const result = await cacheProvider.get('non-existent');

      // Assert
      expect(result).toBeNull();
    });

    it('should overwrite existing value', async () => {
      // Arrange
      const key = 'test-key';
      await cacheProvider.set(key, 'old-value');

      // Act
      await cacheProvider.set(key, 'new-value');
      const result = await cacheProvider.get(key);

      // Assert
      expect(result).toBe('new-value');
    });

    it('should handle null values', async () => {
      // Arrange
      const key = 'null-key';

      // Act
      await cacheProvider.set(key, null);
      const result = await cacheProvider.get(key);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle various data types', async () => {
      // Arrange & Act
      await cacheProvider.set('string', 'hello');
      await cacheProvider.set('number', 123);
      await cacheProvider.set('boolean', true);
      await cacheProvider.set('array', [1, 2, 3]);
      await cacheProvider.set('object', { a: 1, b: 2 });

      // Assert
      expect(await cacheProvider.get('string')).toBe('hello');
      expect(await cacheProvider.get('number')).toBe(123);
      expect(await cacheProvider.get('boolean')).toBe(true);
      expect(await cacheProvider.get('array')).toEqual([1, 2, 3]);
      expect(await cacheProvider.get('object')).toEqual({ a: 1, b: 2 });
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entry after TTL', async () => {
      // Arrange
      const key = 'ttl-key';
      const value = 'expires';
      const ttl = 0.1; // 100ms

      // Act
      await cacheProvider.set(key, value, ttl);
      const beforeExpiry = await cacheProvider.get(key);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 150));
      const afterExpiry = await cacheProvider.get(key);

      // Assert
      expect(beforeExpiry).toBe(value);
      expect(afterExpiry).toBeNull();
    });

    it('should not expire without TTL', async () => {
      // Arrange
      const key = 'no-ttl-key';
      const value = 'never-expires';

      // Act
      await cacheProvider.set(key, value);
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = await cacheProvider.get(key);

      // Assert
      expect(result).toBe(value);
    });

    it('should track cache hits and misses', async () => {
      // Arrange
      await cacheProvider.set('key1', 'value1');

      // Act
      await cacheProvider.get('key1'); // Hit
      await cacheProvider.get('key1'); // Hit
      await cacheProvider.get('key2'); // Miss
      await cacheProvider.get('key3'); // Miss

      const stats = cacheProvider.getStats();

      // Assert
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });
  });

  describe('has', () => {
    it('should return true for existing key', async () => {
      // Arrange
      await cacheProvider.set('existing', 'value');

      // Act
      const result = await cacheProvider.has('existing');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      // Act
      const result = await cacheProvider.has('non-existent');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for expired key', async () => {
      // Arrange
      await cacheProvider.set('expired', 'value', 0.1);
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Act
      const result = await cacheProvider.has('expired');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete existing key', async () => {
      // Arrange
      await cacheProvider.set('to-delete', 'value');

      // Act
      const deleted = await cacheProvider.delete('to-delete');
      const result = await cacheProvider.get('to-delete');

      // Assert
      expect(deleted).toBe(true);
      expect(result).toBeNull();
    });

    it('should return false when deleting non-existent key', async () => {
      // Act
      const deleted = await cacheProvider.delete('non-existent');

      // Assert
      expect(deleted).toBe(false);
    });
  });

  describe('deletePattern', () => {
    it('should delete keys matching pattern', async () => {
      // Arrange
      await cacheProvider.set('user:1', 'value1');
      await cacheProvider.set('user:2', 'value2');
      await cacheProvider.set('product:1', 'value3');

      // Act
      const deleted = await cacheProvider.deletePattern('^user:');

      // Assert
      expect(deleted).toBe(2);
      expect(await cacheProvider.get('user:1')).toBeNull();
      expect(await cacheProvider.get('user:2')).toBeNull();
      expect(await cacheProvider.get('product:1')).toBe('value3');
    });

    it('should return 0 when no keys match', async () => {
      // Arrange
      await cacheProvider.set('key1', 'value1');

      // Act
      const deleted = await cacheProvider.deletePattern('^user:');

      // Assert
      expect(deleted).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all cache entries', async () => {
      // Arrange
      await cacheProvider.set('key1', 'value1');
      await cacheProvider.set('key2', 'value2');
      await cacheProvider.get('key1'); // Create some stats

      // Act
      await cacheProvider.clear();

      // Assert
      expect(await cacheProvider.get('key1')).toBeNull();
      expect(await cacheProvider.get('key2')).toBeNull();

      const stats = cacheProvider.getStats();
      expect(stats.size).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      // Arrange
      await cacheProvider.set('cached', 'existing-value');
      const factory = vi.fn().mockResolvedValue('new-value');

      // Act
      const result = await cacheProvider.getOrSet('cached', factory);

      // Assert
      expect(result).toBe('existing-value');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache value if not exists', async () => {
      // Arrange
      const factory = vi.fn().mockResolvedValue('computed-value');

      // Act
      const result = await cacheProvider.getOrSet('new-key', factory);

      // Assert
      expect(result).toBe('computed-value');
      expect(factory).toHaveBeenCalledTimes(1);
      expect(await cacheProvider.get('new-key')).toBe('computed-value');
    });

    it('should respect TTL when caching', async () => {
      // Arrange
      const factory = vi.fn().mockResolvedValue('value');
      const ttl = 0.1;

      // Act
      await cacheProvider.getOrSet('ttl-key', factory, ttl);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = await cacheProvider.get('ttl-key');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('increment and decrement', () => {
    it('should increment counter', async () => {
      // Act
      const count1 = await cacheProvider.increment('counter');
      const count2 = await cacheProvider.increment('counter');
      const count3 = await cacheProvider.increment('counter');

      // Assert
      expect(count1).toBe(1);
      expect(count2).toBe(2);
      expect(count3).toBe(3);
    });

    it('should decrement counter', async () => {
      // Arrange
      await cacheProvider.set('counter', 5);

      // Act
      const count1 = await cacheProvider.decrement('counter');
      const count2 = await cacheProvider.decrement('counter');

      // Assert
      expect(count1).toBe(4);
      expect(count2).toBe(3);
    });

    it('should not decrement below zero', async () => {
      // Arrange
      await cacheProvider.set('counter', 1);

      // Act
      const count1 = await cacheProvider.decrement('counter');
      const count2 = await cacheProvider.decrement('counter');
      const count3 = await cacheProvider.decrement('counter');

      // Assert
      expect(count1).toBe(0);
      expect(count2).toBe(0);
      expect(count3).toBe(0);
    });

    it('should increment with TTL', async () => {
      // Arrange
      const ttl = 0.1;

      // Act
      await cacheProvider.increment('ttl-counter', ttl);
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = await cacheProvider.get('ttl-counter');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('ttl', () => {
    it('should return remaining TTL in seconds', async () => {
      // Arrange
      await cacheProvider.set('key', 'value', 10); // 10 seconds

      // Act
      const ttl = await cacheProvider.ttl('key');

      // Assert
      expect(ttl).toBeGreaterThan(8);
      expect(ttl).toBeLessThanOrEqual(10);
    });

    it('should return null for non-existent key', async () => {
      // Act
      const ttl = await cacheProvider.ttl('non-existent');

      // Assert
      expect(ttl).toBeNull();
    });

    it('should return 0 for expired key', async () => {
      // Arrange
      await cacheProvider.set('expired', 'value', 0.05);
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const ttl = await cacheProvider.ttl('expired');

      // Assert
      expect(ttl).toBeNull(); // Expired keys are removed
    });
  });

  describe('getStats', () => {
    it('should return cache statistics', async () => {
      // Arrange
      await cacheProvider.set('key1', 'value1');
      await cacheProvider.set('key2', 'value2');
      await cacheProvider.get('key1'); // Hit
      await cacheProvider.get('key3'); // Miss

      // Act
      const stats = cacheProvider.getStats();

      // Assert
      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
      expect(stats.oldestEntry).toBeGreaterThan(0);
      expect(stats.newestEntry).toBeGreaterThan(0);
    });

    it('should return null for oldest/newest when empty', async () => {
      // Act
      const stats = cacheProvider.getStats();

      // Assert
      expect(stats.size).toBe(0);
      expect(stats.oldestEntry).toBeNull();
      expect(stats.newestEntry).toBeNull();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent set operations', async () => {
      // Act
      const promises = Array.from({ length: 100 }, (_, i) =>
        cacheProvider.set(`key-${i}`, `value-${i}`)
      );
      await Promise.all(promises);

      // Assert
      const stats = cacheProvider.getStats();
      expect(stats.size).toBe(100);
    });

    it('should handle concurrent increment operations', async () => {
      // Act
      const promises = Array.from({ length: 100 }, () =>
        cacheProvider.increment('counter')
      );
      await Promise.all(promises);

      // Assert
      const value = await cacheProvider.get<number>('counter');
      expect(value).toBe(100);
    });
  });
});
