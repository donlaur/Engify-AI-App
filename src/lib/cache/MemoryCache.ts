import { ICache, CacheEntry, CacheOptions } from '@/types/cache';

export class MemoryCache implements ICache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private tags: Map<string, Set<string>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (entry.expiresAt < new Date()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 300;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    
    this.cache.set(key, { key, value, expiresAt });
    
    if (options?.tags) {
      options.tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag)!.add(key);
      });
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(tag?: string): Promise<void> {
    if (tag) {
      const keys = this.tags.get(tag);
      if (keys) {
        keys.forEach(key => this.cache.delete(key));
        this.tags.delete(tag);
      }
    } else {
      this.cache.clear();
      this.tags.clear();
    }
  }
}
