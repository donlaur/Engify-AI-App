/**
 * In-Memory Cache Adapter
 *
 * Implements in-memory caching with LRU eviction and TTL support.
 * Useful for testing, development, and as a fallback when Redis is unavailable.
 */

import { 
  ICacheAdapter, 
  CacheAdapterType 
} from '../types';

/**
 * In-Memory Cache Entry
 */
interface MemoryCacheEntry<T = unknown> {
  value: T;
  ttl: number;
  createdAt: Date;
  expiresAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

/**
 * In-Memory Cache Configuration
 */
export interface MemoryCacheConfig {
  readonly maxSize: number;
  readonly defaultTtl: number;
  readonly enableLru: boolean;
  readonly enableCompression: boolean;
}

/**
 * In-Memory Cache Adapter
 */
export class MemoryCacheAdapter implements ICacheAdapter {
  readonly name = 'MemoryCacheAdapter';
  readonly type: CacheAdapterType = 'memory';
  
  private cache = new Map<string, MemoryCacheEntry>();
  private accessOrder: string[] = [];
  private isConnectedFlag = true;

  constructor(private config: MemoryCacheConfig) {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Connect (no-op for memory cache)
   */
  async connect(): Promise<void> {
    this.isConnectedFlag = true;
  }

  /**
   * Disconnect (no-op for memory cache)
   */
  async disconnect(): Promise<void> {
    this.isConnectedFlag = false;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  /**
   * Get value by key
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessedAt = new Date();
    this.updateAccessOrder(key);

    return entry.value as T;
  }

  /**
   * Set value with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const now = new Date();
    const actualTtl = ttl ?? this.config.defaultTtl;
    const expiresAt = new Date(now.getTime() + actualTtl * 1000);

    const entry: MemoryCacheEntry<T> = {
      value,
      ttl: actualTtl,
      createdAt: now,
      expiresAt,
      accessCount: 0,
      lastAccessedAt: now,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);

    // Check if we need to evict
    if (this.cache.size > this.config.maxSize) {
      await this.evictLru();
    }
  }

  /**
   * Delete key
   */
  async delete(key: string): Promise<boolean> {
    const existed = this.cache.has(key);
    this.cache.delete(key);
    this.removeFromAccessOrder(key);
    return existed;
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt.getTime()) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all keys
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Get keys by pattern
   */
  async getKeys(pattern?: string): Promise<string[]> {
    const keys = Array.from(this.cache.keys());
    
    if (!pattern) {
      return keys;
    }

    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(key => regex.test(key));
  }

  /**
   * Get TTL for key
   */
  async getTtl(key: string): Promise<number> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return -1;
    }

    const now = Date.now();
    const expiresAt = entry.expiresAt.getTime();
    
    if (now >= expiresAt) {
      return -2; // Expired
    }

    return Math.floor((expiresAt - now) / 1000);
  }

  /**
   * Set TTL for key
   */
  async setTtl(key: string, ttl: number): Promise<void> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return;
    }

    const now = new Date();
    entry.ttl = ttl;
    entry.expiresAt = new Date(now.getTime() + ttl * 1000);
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  /**
   * Set multiple values
   */
  async mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl);
    }
  }

  /**
   * Delete multiple keys
   */
  async mdelete(keys: string[]): Promise<number> {
    let deletedCount = 0;
    
    for (const key of keys) {
      if (await this.delete(key)) {
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    if (!this.config.enableLru) {
      return;
    }

    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict least recently used entry
   */
  private async evictLru(): Promise<void> {
    if (!this.config.enableLru || this.accessOrder.length === 0) {
      return;
    }

    const lruKey = this.accessOrder.at(0);
    if (lruKey) {
      await this.delete(lruKey);
    }
  }

  /**
   * Start cleanup interval for expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt.getTime()) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    averageTtl: number;
  } {
    let totalAccesses = 0;
    let totalTtl = 0;
    let validEntries = 0;

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      totalTtl += entry.ttl;
      validEntries++;
    }

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: totalAccesses > 0 ? totalAccesses / (totalAccesses + this.cache.size) : 0,
      totalAccesses,
      averageTtl: validEntries > 0 ? totalTtl / validEntries : 0,
    };
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.value).length * 2;
      totalSize += 100; // Overhead for entry object
    }
    
    return totalSize;
  }
}
