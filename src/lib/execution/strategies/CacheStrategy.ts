import {
  ICacheStrategy,
  ExecutionContext,
  ExecutionResult,
  AIRequest,
  StrategyConfig,
  ProviderFactory,
} from '../interfaces/IExecutionStrategy';
import { AIProviderFactory } from '@/lib/ai/v2/factory/AIProviderFactory';

/**
 * Cache execution strategy for response caching and optimization
 */
export class CacheStrategy implements ICacheStrategy {
  public readonly name = 'cache';
  public readonly config: StrategyConfig;

  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxCacheSize = 1000;
  private readonly defaultTTL = 3600000; // 1 hour

  constructor(
    private readonly providerFactory: ProviderFactory = AIProviderFactory,
    config?: Partial<StrategyConfig>
  ) {
    this.config = {
      name: 'cache',
      enabled: true,
      priority: 0, // Base priority is low; boosts apply on cache hit
      conditions: {
        maxTokens: 2000, // Cache works well for smaller requests
        userTier: 'any',
      },
      ...config,
    };

    // Start cache cleanup
    this.startCacheCleanup();
  }

  /**
   * Execute AI request with caching
   */
  async execute(
    request: AIRequest,
    context: ExecutionContext,
    provider: string
  ): Promise<ExecutionResult> {
    // const cacheKey = this.generateCacheKey(request, context);

    // Check cache first
    const cachedResult = await this.getCachedResponse(request, context);
    if (cachedResult) {
      return {
        ...cachedResult,
        cacheHit: true,
        strategy: this.name,
      };
    }

    // Cache miss - execute request
    const aiProvider = this.providerFactory.create(provider);
    if (!aiProvider) {
      throw new Error(`Provider not found: ${provider}`);
    }

    const startTime = Date.now();
    const response = await aiProvider.execute(request);

    const result: ExecutionResult = {
      response,
      strategy: this.name,
      executionTime: Date.now() - startTime,
      cacheHit: false,
    };

    // Cache the result
    await this.cacheResponse(request, context, result);

    return result;
  }

  /**
   * Check if request can be served from cache
   */
  async getCachedResponse(
    request: AIRequest,
    context: ExecutionContext
  ): Promise<ExecutionResult | null> {
    const cacheKey = this.generateCacheKey(request, context);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(cacheKey);
      return null;
    }

    // Update access time for LRU
    entry.lastAccessed = Date.now();
    entry.accessCount++;

    return entry.result;
  }

  /**
   * Store response in cache
   */
  async cacheResponse(
    request: AIRequest,
    context: ExecutionContext,
    result: ExecutionResult
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(request, context);
    const ttl = this.getTTL(request, context);

    const entry: CacheEntry = {
      key: cacheKey,
      result,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + ttl,
      accessCount: 1,
      requestHash: this.hashRequest(request),
      contextHash: this.hashContext(context),
    };

    // Check cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(cacheKey, entry);
  }

  /**
   * Invalidate cache entries
   */
  async invalidateCache(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (
        key.includes(pattern) ||
        entry.requestHash.includes(pattern) ||
        entry.contextHash.includes(pattern)
      ) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Check if this strategy can handle the request
   */
  canHandle(request: AIRequest, context: ExecutionContext): boolean {
    if (!this.config.enabled) return false;

    // Check token limits
    if (
      this.config.conditions?.maxTokens &&
      (request.maxTokens || 0) > this.config.conditions.maxTokens
    ) {
      return false;
    }

    // Check if request is cacheable
    if (!this.isCacheableRequest(request, context)) {
      return false;
    }

    // Cache works for all priorities, but best for repeated requests
    return true;
  }

  /**
   * Get strategy priority
   */
  getPriority(request: AIRequest, context: ExecutionContext): number {
    let priority = this.config.priority;

    // Check if we have a cache hit
    const cacheKey = this.generateCacheKey(request, context);
    const entry = this.cache.get(cacheKey);

    if (entry && Date.now() <= entry.expiresAt) {
      // Cache hit - highest priority
      priority += 5;
    }

    // Boost for frequently accessed patterns
    if (context.metadata?.isRepeated) {
      priority += 5;
    }

    // Boost for smaller requests (better cache efficiency)
    if ((request.maxTokens || 0) < 1000) {
      priority += 1;
    }

    return priority;
  }

  /**
   * Validate request
   */
  validateRequest(request: AIRequest, context: ExecutionContext): boolean {
    return !!(
      request.prompt &&
      request.prompt.length > 0 &&
      context.userId &&
      context.requestId
    );
  }

  /**
   * Get estimated execution time
   */
  getEstimatedTime(request: AIRequest, context: ExecutionContext): number {
    const cacheKey = this.generateCacheKey(request, context);
    const entry = this.cache.get(cacheKey);

    if (entry && Date.now() <= entry.expiresAt) {
      // Cache hit - very fast
      return 10; // 10ms for cache retrieval
    }

    // Cache miss - normal execution time
    const baseTime = 3000; // 3 seconds base
    const tokenTime = (request.maxTokens || 1000) * 0.03; // 30ms per token

    return Math.round(baseTime + tokenTime);
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(
    request: AIRequest,
    context: ExecutionContext
  ): string {
    const requestHash = this.hashRequest(request);
    const contextHash = this.hashContext(context);
    return `cache_${requestHash}_${contextHash}`;
  }

  /**
   * Hash request for cache key
   */
  private hashRequest(request: AIRequest): string {
    const normalized = {
      prompt: request.prompt.toLowerCase().trim(),
      systemPrompt: request.systemPrompt?.toLowerCase().trim(),
      temperature: request.temperature || 0.7,
      maxTokens: request.maxTokens || 1000,
    };

    return this.simpleHash(JSON.stringify(normalized));
  }

  /**
   * Hash context for cache key
   */
  private hashContext(context: ExecutionContext): string {
    const normalized = {
      userId: context.userId,
      priority: context.priority,
      // Don't include requestId as it's unique
      metadata: context.metadata
        ? this.normalizeMetadata(context.metadata)
        : {},
    };

    return this.simpleHash(JSON.stringify(normalized));
  }

  /**
   * Normalize metadata for consistent hashing
   */
  private normalizeMetadata(
    metadata: Record<string, unknown>
  ): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string') {
        normalized[key] = value.toLowerCase();
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        normalized[key] = value;
      }
      // Skip complex objects for cache key
    }

    return normalized;
  }

  /**
   * Simple hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if request is cacheable
   */
  private isCacheableRequest(
    request: AIRequest,
    context: ExecutionContext
  ): boolean {
    // Don't cache streaming requests
    if (request.stream) return false;

    // Don't cache requests with high temperature (too random)
    if ((request.temperature || 0.7) > 0.9) return false;

    // Don't cache very short prompts (might be unique)
    if (request.prompt.length < 5) return false;

    // Don't cache urgent requests (they need fresh responses)
    if (context.priority === 'urgent') return false;

    return true;
  }

  /**
   * Get TTL for cache entry
   */
  private getTTL(request: AIRequest, context: ExecutionContext): number {
    let ttl = this.defaultTTL;

    // Longer TTL for repeated patterns
    if (context.metadata?.isRepeated) {
      ttl *= 2;
    }

    // Shorter TTL for high-temperature requests
    if ((request.temperature || 0.7) > 0.8) {
      ttl *= 0.5;
    }

    // Longer TTL for factual queries (system prompts)
    if (request.systemPrompt && request.systemPrompt.includes('factual')) {
      ttl *= 3;
    }

    return Math.round(ttl);
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].lastAccessed - b[1].lastAccessed
    );

    // Remove oldest 10% of entries
    const toRemove = Math.ceil(entries.length * 0.1);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Start cache cleanup process
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 300000); // Cleanup every 5 minutes
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    averageAccessCount: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce(
      (sum, entry) => sum + entry.accessCount,
      0
    );
    const averageAccessCount =
      entries.length > 0 ? totalAccesses / entries.length : 0;

    // Calculate hit rate (simplified)
    const hitRate =
      entries.length > 0
        ? entries.filter((e) => e.accessCount > 1).length / entries.length
        : 0;

    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalAccesses,
      averageAccessCount: Math.round(averageAccessCount * 100) / 100,
    };
  }
}

/**
 * Cache entry interface
 */
interface CacheEntry {
  key: string;
  result: ExecutionResult;
  createdAt: number;
  lastAccessed: number;
  expiresAt: number;
  accessCount: number;
  requestHash: string;
  contextHash: string;
}
