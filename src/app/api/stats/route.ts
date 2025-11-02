import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import type { Db } from 'mongodb';
import { Redis } from '@upstash/redis';
import { checkRateLimit } from '@/lib/rate-limit';

// Redis cache key and TTL
const CACHE_KEY = 'site:stats:v1';
const CACHE_TTL = 3600; // 1 hour in seconds

// Initialize Upstash Redis (if configured)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

/**
 * GET /api/stats
 * Get platform statistics
 * 
 * Uses Redis cache (1 hour TTL) to reduce MongoDB load
 * QStash webhook can invalidate cache on content changes
 * Rate limited: 10 requests per minute per IP
 */
export async function GET(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = await checkRateLimit(req, {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }
  try {
    // Try Redis cache first (if available)
    if (redis) {
      try {
        const cached = await redis.get(CACHE_KEY);
        if (cached) {
          return NextResponse.json({
            ...(cached as object),
            source: 'redis-cache',
            cached: true,
          });
        }
      } catch (redisError) {
        console.error('Redis cache read failed:', redisError);
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

      // Direct DB access in API routes for performance
      // Get all counts in parallel for speed
      const [
        promptCount,
        patternCount,
        pathwayCount,
        userCount,
        promptsByRole,
        promptsByCategory,
      ] = await Promise.all([
        db.collection('prompts').countDocuments({ active: { $ne: false } }),
        db.collection('patterns').countDocuments(),
        db.collection('pathways').countDocuments(),
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
      ]);

      // Build comprehensive stats response
      const statsResponse = {
        stats: {
          prompts: promptCount,
          patterns: patternCount,
          pathways: pathwayCount,
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
        },
        patterns: {
          total: patternCount,
        },
        lastUpdated: new Date().toISOString(),
        source: 'mongodb',
      };

      // Cache in Redis for 1 hour (if available)
      if (redis) {
        try {
          await redis.setex(CACHE_KEY, CACHE_TTL, JSON.stringify(statsResponse));
          console.log(`✅ Stats cached in Redis for ${CACHE_TTL}s`);
        } catch (redisError) {
          console.error('Redis cache write failed:', redisError);
          // Continue even if Redis caching fails
        }
      }

      return NextResponse.json(statsResponse);
    } catch (dbError) {
      // Fallback to static data
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

      return NextResponse.json({
        stats: {
          prompts: seedPrompts.length,
          patterns: promptPatterns.length,
          pathways: learningPathways.length,
          users: 0,
        },
        topPrompts: seedPrompts.slice(0, 5).map((p) => ({
          id: p.id,
          title: p.title,
          views: 0,
          rating: 0,
        })),
        categories,
        source: 'static',
      });
    }
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
