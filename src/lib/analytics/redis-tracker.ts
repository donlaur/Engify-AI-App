/**
 * Redis Analytics Tracker
 * 
 * Lightweight tracking for prompt interactions using Upstash Redis
 * No MongoDB writes - just Redis counters
 * Sync to MongoDB once per hour via cron
 */

import { Redis } from '@upstash/redis';

// Singleton Redis client
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Upstash Redis credentials not configured');
    }
    
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  
  return redis;
}

/**
 * Track prompt event (non-blocking, Redis only)
 */
export async function trackPromptEvent(
  promptId: string,
  event: 'view' | 'copy' | 'favorite' | 'execute'
): Promise<void> {
  try {
    const redis = getRedis();
    const key = `prompt:${promptId}:${event}`;
    
    // Increment counter in Redis (fast, no MongoDB)
    await redis.incr(key);
    
    // Also increment daily counter
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`prompt:${promptId}:${event}:${today}`);
    
    // Set expiry on daily counter (30 days)
    await redis.expire(`prompt:${promptId}:${event}:${today}`, 30 * 24 * 60 * 60);
    
  } catch (error) {
    // Silent fail - analytics shouldn't break the app
    console.error('Redis tracking failed:', error);
  }
}

/**
 * Get prompt stats from Redis (fast)
 */
export async function getPromptStats(promptId: string): Promise<{
  views: number;
  copies: number;
  favorites: number;
  executions: number;
}> {
  try {
    const redis = getRedis();
    
    const [views, copies, favorites, executions] = await Promise.all([
      redis.get(`prompt:${promptId}:view`),
      redis.get(`prompt:${promptId}:copy`),
      redis.get(`prompt:${promptId}:favorite`),
      redis.get(`prompt:${promptId}:execute`),
    ]);

    return {
      views: Number(views) || 0,
      copies: Number(copies) || 0,
      favorites: Number(favorites) || 0,
      executions: Number(executions) || 0,
    };
  } catch (error) {
    console.error('Failed to get prompt stats:', error);
    return { views: 0, copies: 0, favorites: 0, executions: 0 };
  }
}

/**
 * Get top prompts by metric
 */
export async function getTopPrompts(
  metric: 'view' | 'copy' | 'favorite' | 'execute',
  limit = 10
): Promise<Array<{ promptId: string; count: number }>> {
  try {
    const redis = getRedis();
    
    // Scan for all prompt keys with this metric
    const pattern = `prompt:*:${metric}`;
    const keys = await redis.keys(pattern);
    
    // Filter out daily keys (they have dates)
    const totalKeys = keys.filter((key: string) => {
      const parts = key.split(':');
      return parts.length === 3; // prompt:id:metric (not prompt:id:metric:date)
    });
    
    // Get counts for all keys
    const counts = await Promise.all(
      totalKeys.map(async (key: string) => {
        const count = await redis.get(key);
        return {
          promptId: key.split(':')[1],
          count: Number(count) || 0,
        };
      })
    );
    
    // Sort and limit
    return counts
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Failed to get top prompts:', error);
    return [];
  }
}

/**
 * Sync Redis stats to MongoDB (run hourly via cron)
 * This is the ONLY MongoDB write for analytics
 */
export async function syncStatsToMongoDB(): Promise<void> {
  try {
    const redis = getRedis();
    const { getMongoDb } = await import('@/lib/db/mongodb');
    const db = await getMongoDb();
    
    // Get all prompt keys (excluding daily keys)
    const keys = await redis.keys('prompt:*');
    const totalKeys = keys.filter((key: string) => {
      const parts = key.split(':');
      return parts.length === 3; // prompt:id:metric
    });
    
    // Group by promptId
    const statsByPrompt = new Map<string, any>();
    
    for (const key of totalKeys) {
      const parts = key.split(':');
      const promptId = parts[1];
      const metric = parts[2];
      
      if (!statsByPrompt.has(promptId)) {
        statsByPrompt.set(promptId, {});
      }
      
      const count = await redis.get(key);
      statsByPrompt.get(promptId)[metric] = Number(count) || 0;
    }
    
    // Bulk update MongoDB (one write per prompt)
    const updates = Array.from(statsByPrompt.entries()).map(([promptId, stats]) => ({
      updateOne: {
        filter: { promptId },
        update: {
          $set: {
            ...stats,
            lastSyncedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));
    
    if (updates.length > 0) {
      await db.collection('prompt_stats').bulkWrite(updates);
      console.log(`✅ Synced stats for ${updates.length} prompts to MongoDB`);
    } else {
      console.log('ℹ️  No stats to sync');
    }
    
  } catch (error) {
    console.error('❌ Failed to sync stats to MongoDB:', error);
    throw error;
  }
}
