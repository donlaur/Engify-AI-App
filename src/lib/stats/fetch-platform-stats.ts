/**
 * Shared Stats Fetching Logic
 * 
 * Extracted from /api/stats/route.ts to avoid duplication
 * Used by both API route and server components
 */

import { contentService } from '@/lib/db/repositories/ContentService';
import type { Db } from 'mongodb';
import { Redis } from '@upstash/redis';
import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';

// Redis cache key and TTL
export const STATS_CACHE_KEY = 'site:stats:v1';
export const STATS_CACHE_TTL = 3600; // 1 hour in seconds

// Initialize Upstash Redis (if configured)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export interface StatsResponse {
  stats: {
    prompts: number;
    patterns: number;
    learningResources: number;
    pathways: number; // Alias for learningResources
    users: number;
  };
  prompts: {
    total: number;
    byRole: Record<string, number>;
    byCategory: Record<string, number>;
    uniqueCategories: string[];
    uniqueRoles: string[];
  };
  patterns: {
    total: number;
  };
  learningResources: {
    total: number;
  };
  lastUpdated: string;
  source: 'redis-cache' | 'mongodb' | 'static';
}

/**
 * Get platform statistics
 * Uses Redis cache when available, falls back to MongoDB, then static fallback
 * This is the SINGLE SOURCE OF TRUTH for stats fetching
 */
export async function fetchPlatformStats(): Promise<StatsResponse> {
  // Try Redis cache first (if available)
  if (redis) {
    try {
      const cached = await redis.get(STATS_CACHE_KEY);
      if (cached) {
        logger.debug('Stats served from Redis cache');
        return {
          ...(cached as StatsResponse),
          source: 'redis-cache',
        };
      }
    } catch (redisError) {
      logger.warn('Redis cache read failed', {
        error: redisError instanceof Error ? redisError.message : String(redisError),
      });
      // Continue to MongoDB if Redis fails
    }
  }

  // Try MongoDB with timeout
  try {
    const dbPromise = getMongoDb();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
    );

    const db = (await Promise.race([dbPromise, timeoutPromise])) as Db;

    // Use unified content service for counts (single source of truth)
    const [promptCount, patternCount, learningResourceCount] = await Promise.all([
      contentService.count('prompts'),
      contentService.count('patterns'),
      contentService.count('learning'),
    ]);

    // Still need direct DB access for aggregations (byRole, byCategory)
    const [
      userCount,
      promptsByRole,
      promptsByCategory,
      uniqueCategories,
      uniqueRoles,
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      // Get prompts grouped by role
      db
        .collection('prompts')
        .aggregate([
          { $match: { active: { $ne: false } } },
          { $group: { _id: '$role', count: { $sum: 1 } } },
        ])
        .toArray(),
      // Get prompts grouped by category
      db
        .collection('prompts')
        .aggregate([
          { $match: { active: { $ne: false } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      // Get unique categories
      db.collection('prompts').distinct('category', { active: { $ne: false } }),
      // Get unique roles
      db.collection('prompts').distinct('role', { active: { $ne: false } }),
    ]);

    // Build comprehensive stats response
    const statsResponse: StatsResponse = {
      stats: {
        prompts: promptCount,
        patterns: patternCount,
        learningResources: learningResourceCount,
        pathways: learningResourceCount, // For backward compatibility
        users: userCount,
      },
      prompts: {
        total: promptCount,
        byRole: promptsByRole.reduce(
          (acc, item) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acc[item._id as string] = (item as any).count;
            return acc;
          },
          {} as Record<string, number>
        ),
        byCategory: promptsByCategory.reduce(
          (acc, item) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acc[item._id as string] = (item as any).count;
            return acc;
          },
          {} as Record<string, number>
        ),
        uniqueCategories: uniqueCategories.filter(Boolean),
        uniqueRoles: uniqueRoles.filter(Boolean),
      },
      patterns: {
        total: patternCount,
      },
      learningResources: {
        total: learningResourceCount,
      },
      lastUpdated: new Date().toISOString(),
      source: 'mongodb',
    };

    // Cache in Redis for 1 hour (if available)
    if (redis) {
      try {
        await redis.setex(STATS_CACHE_KEY, STATS_CACHE_TTL, JSON.stringify(statsResponse));
        logger.debug('Stats cached in Redis', { ttl: STATS_CACHE_TTL });
      } catch (redisError) {
        logger.warn('Redis cache write failed', {
          error: redisError instanceof Error ? redisError.message : String(redisError),
        });
        // Continue even if Redis caching fails
      }
    }

    return statsResponse;
  } catch (dbError) {
    // Fallback to static data
    logger.warn('MongoDB stats fetch failed, using static fallback', {
      error: dbError instanceof Error ? dbError.message : String(dbError),
    });

    const { seedPrompts } = await import('@/data/seed-prompts');
    const { promptPatterns } = await import('@/data/prompt-patterns');
    const { learningPathways } = await import('@/data/learning-pathways');

    // Count by category
    const categoryCount: Record<string, number> = {};
    seedPrompts.forEach((p) => {
      categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
    });

    const categories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stats: {
        prompts: seedPrompts.length,
        patterns: promptPatterns.length,
        pathways: learningPathways.length,
        learningResources: learningPathways.length,
        users: 0,
      },
      prompts: {
        total: seedPrompts.length,
        byRole: {},
        byCategory: categoryCount,
        uniqueCategories: categories.map((c) => c.name),
        uniqueRoles: [],
      },
      patterns: {
        total: promptPatterns.length,
      },
      learningResources: {
        total: learningPathways.length,
      },
      lastUpdated: new Date().toISOString(),
      source: 'static',
    };
  }
}

