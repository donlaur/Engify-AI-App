/**
 * RAG Response Cache
 * 
 * Caches RAG responses in Upstash Redis for faster repeat queries
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Initialize Upstash Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

interface CachedRAGResponse {
  message: string;
  sources: Array<{ title: string; content: string; score: number }>;
  usedRAG: boolean;
  cachedAt: string;
}

/**
 * Generate cache key from question
 */
function getCacheKey(question: string): string {
  const hash = crypto
    .createHash('sha256')
    .update(question.toLowerCase().trim())
    .digest('hex')
    .substring(0, 16);
  return `rag:question:${hash}`;
}

/**
 * Get cached RAG response
 */
export async function getCachedRAGResponse(
  question: string
): Promise<CachedRAGResponse | null> {
  if (!redis) {
    console.warn('Redis not configured, skipping cache check');
    return null;
  }

  try {
    const cacheKey = getCacheKey(question);
    const cached = await redis.get<CachedRAGResponse>(cacheKey);
    
    if (cached) {
      console.log(`Cache HIT for question: ${question.substring(0, 50)}...`);
      return cached;
    }
    
    console.log(`Cache MISS for question: ${question.substring(0, 50)}...`);
    return null;
  } catch (error) {
    console.error('Error getting cached RAG response:', error);
    return null;
  }
}

/**
 * Cache RAG response
 */
export async function cacheRAGResponse(
  question: string,
  response: Omit<CachedRAGResponse, 'cachedAt'>
): Promise<void> {
  if (!redis) {
    console.warn('Redis not configured, skipping cache set');
    return;
  }

  try {
    const cacheKey = getCacheKey(question);
    const cachedResponse: CachedRAGResponse = {
      ...response,
      cachedAt: new Date().toISOString(),
    };
    
    // Cache for 24 hours (86400 seconds)
    await redis.set(cacheKey, cachedResponse, { ex: 86400 });
    console.log(`Cached response for question: ${question.substring(0, 50)}...`);
  } catch (error) {
    console.error('Error caching RAG response:', error);
  }
}

/**
 * Clear cache for a specific question
 */
export async function clearCachedRAGResponse(question: string): Promise<void> {
  if (!redis) return;

  try {
    const cacheKey = getCacheKey(question);
    await redis.del(cacheKey);
    console.log(`Cleared cache for question: ${question.substring(0, 50)}...`);
  } catch (error) {
    console.error('Error clearing cached RAG response:', error);
  }
}

/**
 * Clear all RAG caches (use sparingly)
 */
export async function clearAllRAGCaches(): Promise<void> {
  if (!redis) return;

  try {
    // Note: This requires SCAN support in Upstash
    // For production, consider using a separate cache invalidation strategy
    console.warn('clearAllRAGCaches: Not implemented for Upstash REST API');
  } catch (error) {
    console.error('Error clearing all RAG caches:', error);
  }
}
