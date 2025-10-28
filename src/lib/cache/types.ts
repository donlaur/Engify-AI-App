/**
 * Advanced Caching Types and Interfaces
 *
 * Defines comprehensive caching infrastructure with multiple strategies,
 * adapters, and patterns for enterprise-grade applications.
 */

/**
 * Cache Configuration
 */
export interface CacheConfig {
  readonly defaultTtl: number; // Time to live in seconds
  readonly maxSize: number; // Maximum cache size
  readonly enableCompression: boolean;
  readonly enableEncryption: boolean;
  readonly strategy: CacheStrategy;
  readonly adapter: CacheAdapterType;
}

/**
 * Cache Entry
 */
export interface CacheEntry<T = unknown> {
  readonly key: string;
  readonly value: T;
  readonly ttl: number;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly accessCount: number;
  readonly lastAccessedAt: Date;
  readonly tags?: string[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * Cache Strategy Interface
 */
export interface ICacheStrategy {
  readonly name: string;
  
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
  getKeys(pattern?: string): Promise<string[]>;
  getStats(): Promise<CacheStats>;
  
  // Advanced operations
  invalidateByTag(tag: string): Promise<void>;
  invalidateByPattern(pattern: string): Promise<void>;
  refresh<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
}

/**
 * Cache Adapter Interface
 */
export interface ICacheAdapter {
  readonly name: string;
  readonly type: CacheAdapterType;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Basic operations
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  
  // Advanced operations
  getKeys(pattern?: string): Promise<string[]>;
  getTtl(key: string): Promise<number>;
  setTtl(key: string, ttl: number): Promise<void>;
  
  // Batch operations
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void>;
  mdelete(keys: string[]): Promise<number>;
}

/**
 * Cache Strategy Types
 */
export type CacheStrategy = 
  | 'write-through'
  | 'write-behind'
  | 'write-around'
  | 'cache-aside'
  | 'refresh-ahead';

/**
 * Cache Adapter Types
 */
export type CacheAdapterType = 
  | 'memory'
  | 'redis'
  | 'memcached'
  | 'hybrid';

/**
 * Cache Statistics
 */
export interface CacheStats {
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly totalKeys: number;
  readonly memoryUsage: number;
  readonly evictions: number;
  readonly averageTtl: number;
  readonly oldestEntry: Date | null;
  readonly newestEntry: Date | null;
}

/**
 * Cache Options
 */
export interface CacheOptions {
  readonly ttl?: number;
  readonly tags?: string[];
  readonly metadata?: Record<string, unknown>;
  readonly compress?: boolean;
  readonly encrypt?: boolean;
  readonly refreshThreshold?: number; // Percentage of TTL remaining to trigger refresh
}

/**
 * Cache Error Types
 */
export class CacheError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly key?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'CacheError';
  }
}

export class CacheConnectionError extends CacheError {
  constructor(message: string, originalError?: Error) {
    super(message, 'connect', undefined, originalError);
    this.name = 'CacheConnectionError';
  }
}

export class CacheSerializationError extends CacheError {
  constructor(message: string, key: string, originalError?: Error) {
    super(message, 'serialize', key, originalError);
    this.name = 'CacheSerializationError';
  }
}

export class CacheDeserializationError extends CacheError {
  constructor(message: string, key: string, originalError?: Error) {
    super(message, 'deserialize', key, originalError);
    this.name = 'CacheDeserializationError';
  }
}

/**
 * Cache Event Types
 */
export interface CacheEvent {
  readonly type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'expire';
  readonly key: string;
  readonly timestamp: Date;
  readonly ttl?: number;
  readonly tags?: string[];
}

/**
 * Cache Event Handler
 */
export interface ICacheEventHandler {
  handle(event: CacheEvent): Promise<void>;
}

/**
 * Cache Manager Interface
 */
export interface ICacheManager {
  readonly strategy: ICacheStrategy;
  readonly adapter: ICacheAdapter;
  
  // Basic operations
  get<T>(key: string, options?: CacheOptions): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  
  // Advanced operations
  getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options?: CacheOptions
  ): Promise<T>;
  
  invalidateByTag(tag: string): Promise<void>;
  invalidateByPattern(pattern: string): Promise<void>;
  
  // Batch operations
  mget<T>(keys: string[]): Promise<Map<string, T | null>>;
  mset<T>(entries: Map<string, T>, options?: CacheOptions): Promise<void>;
  mdelete(keys: string[]): Promise<number>;
  
  // Statistics and monitoring
  getStats(): Promise<CacheStats>;
  getHealth(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: string }>;
  
  // Event handling
  addEventHandler(handler: ICacheEventHandler): void;
  removeEventHandler(handler: ICacheEventHandler): void;
}
