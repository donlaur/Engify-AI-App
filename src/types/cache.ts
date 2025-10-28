export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: Date;
}

export interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[];
}

export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(tag?: string): Promise<void>;
}
