/**
 * Cache Headers Utility
 *
 * Enterprise-grade HTTP caching strategy for API responses.
 * Implements proper Cache-Control, ETag, and conditional request handling.
 *
 * Benefits:
 * - Reduces server load by leveraging browser/CDN caching
 * - Improves response times for cached resources
 * - Reduces bandwidth usage
 * - Better user experience with faster page loads
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

export interface CacheConfig {
  /**
   * Max age in seconds (how long the response is considered fresh)
   */
  maxAge?: number;

  /**
   * Stale-while-revalidate in seconds (serve stale content while revalidating)
   */
  swr?: number;

  /**
   * Enable CDN caching (s-maxage)
   */
  public?: boolean;

  /**
   * Enable private caching (browser only)
   */
  private?: boolean;

  /**
   * Revalidation strategy
   */
  mustRevalidate?: boolean;

  /**
   * Enable ETag-based validation
   */
  etag?: boolean;
}

/**
 * Predefined cache strategies for common use cases
 */
export const CacheStrategies = {
  /**
   * Static content that rarely changes (prompts, patterns)
   * Cache for 1 hour, stale-while-revalidate for 24 hours
   */
  STATIC_CONTENT: {
    maxAge: 3600, // 1 hour
    swr: 86400, // 24 hours
    public: true,
    etag: true,
  } as CacheConfig,

  /**
   * Dynamic content that changes frequently (user stats, notifications)
   * Cache for 5 minutes, revalidate on stale
   */
  DYNAMIC_CONTENT: {
    maxAge: 300, // 5 minutes
    swr: 600, // 10 minutes
    public: false,
    private: true,
    etag: true,
  } as CacheConfig,

  /**
   * User-specific data (profile, settings)
   * Private cache only, 10 minutes
   */
  USER_SPECIFIC: {
    maxAge: 600, // 10 minutes
    private: true,
    mustRevalidate: true,
    etag: true,
  } as CacheConfig,

  /**
   * API responses that should always be fresh
   */
  NO_CACHE: {
    maxAge: 0,
    mustRevalidate: true,
    private: true,
  } as CacheConfig,

  /**
   * Immutable content (by ID with version/hash)
   */
  IMMUTABLE: {
    maxAge: 31536000, // 1 year
    public: true,
  } as CacheConfig,
};

/**
 * Generate ETag from response data
 */
export function generateETag(data: unknown): string {
  const hash = createHash('sha256');
  hash.update(JSON.stringify(data));
  return `"${hash.digest('hex').substring(0, 32)}"`;
}

/**
 * Build Cache-Control header value
 */
export function buildCacheControl(config: CacheConfig): string {
  const directives: string[] = [];

  if (config.public) {
    directives.push('public');
  }

  if (config.private) {
    directives.push('private');
  }

  if (config.maxAge !== undefined) {
    directives.push(`max-age=${config.maxAge}`);
  }

  if (config.swr !== undefined) {
    directives.push(`stale-while-revalidate=${config.swr}`);
  }

  if (config.mustRevalidate) {
    directives.push('must-revalidate');
  }

  // CDN cache (Vercel Edge, CloudFront, etc.)
  if (config.public && config.maxAge !== undefined) {
    directives.push(`s-maxage=${config.maxAge}`);
  }

  return directives.join(', ');
}

/**
 * Add caching headers to NextResponse
 */
export function withCacheHeaders<T>(
  response: NextResponse<T>,
  data: unknown,
  config: CacheConfig = CacheStrategies.STATIC_CONTENT
): NextResponse<T> {
  const cacheControl = buildCacheControl(config);
  response.headers.set('Cache-Control', cacheControl);

  // Add ETag if enabled
  if (config.etag) {
    const etag = generateETag(data);
    response.headers.set('ETag', etag);
  }

  // Add Vary header for conditional requests
  if (!response.headers.has('Vary')) {
    response.headers.set('Vary', 'Accept-Encoding');
  }

  return response;
}

/**
 * Check if request matches ETag (for 304 Not Modified)
 */
export function checkETag(requestETag: string | null, currentETag: string): boolean {
  if (!requestETag) return false;

  // Remove quotes and compare
  const cleanRequestETag = requestETag.replace(/"/g, '');
  const cleanCurrentETag = currentETag.replace(/"/g, '');

  return cleanRequestETag === cleanCurrentETag;
}

/**
 * Create a cached JSON response with proper headers
 */
export function cachedJsonResponse<T>(
  data: T,
  config: CacheConfig = CacheStrategies.STATIC_CONTENT,
  requestHeaders?: Headers
): NextResponse<T> {
  const response = NextResponse.json(data);

  // Add cache headers
  withCacheHeaders(response, data, config);

  // Check for conditional request (If-None-Match)
  if (config.etag && requestHeaders) {
    const requestETag = requestHeaders.get('if-none-match');
    const currentETag = response.headers.get('ETag');

    if (currentETag && requestETag && checkETag(requestETag, currentETag)) {
      // Return 304 Not Modified
      return new NextResponse(null, {
        status: 304,
        headers: response.headers,
      }) as NextResponse<T>;
    }
  }

  return response;
}

/**
 * Invalidation helper - sets headers to immediately invalidate cache
 */
export function invalidateCache(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}
