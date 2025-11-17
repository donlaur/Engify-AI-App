/**
 * Affiliate Click Tracking System
 *
 * Server-side tracking for affiliate link clicks with metadata
 * Stores in Redis for fast access, syncs to MongoDB hourly
 *
 * Revenue Impact: $10K-$100K opportunity (Tech Debt #9-18)
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

export interface AffiliateClickMetadata {
  toolKey: string;
  toolName: string;
  url: string;
  hasReferral: boolean;
  status: 'active' | 'pending' | 'requested';
  commission?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  referrer?: string;
  source?: string; // e.g., 'ai-coding-page', 'workbench', 'comparison'
  timestamp: Date;
  ipAddress?: string;
}

export interface AffiliateStats {
  totalClicks: number;
  uniqueClicks: number;
  clicksByTool: Record<string, number>;
  clicksBySource: Record<string, number>;
  recentClicks: AffiliateClickMetadata[];
  conversionRate?: number;
  estimatedRevenue?: number;
}

/**
 * Track affiliate link click (server-side)
 * Stores in Redis with metadata for analytics
 */
export async function trackAffiliateClick(
  metadata: Omit<AffiliateClickMetadata, 'timestamp'>
): Promise<void> {
  try {
    const redis = getRedis();
    const timestamp = new Date();
    const clickData: AffiliateClickMetadata = {
      ...metadata,
      timestamp,
    };

    // Generate unique click ID
    const clickId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store full click data (expires after 90 days)
    await redis.setex(
      `affiliate:click:${clickId}`,
      90 * 24 * 60 * 60, // 90 days
      JSON.stringify(clickData)
    );

    // Increment total click counter for this tool
    await redis.incr(`affiliate:tool:${metadata.toolKey}:clicks`);

    // Increment daily counter
    const today = timestamp.toISOString().split('T')[0];
    await redis.incr(`affiliate:tool:${metadata.toolKey}:clicks:${today}`);
    await redis.expire(`affiliate:tool:${metadata.toolKey}:clicks:${today}`, 90 * 24 * 60 * 60);

    // Track by source
    if (metadata.source) {
      await redis.incr(`affiliate:source:${metadata.source}:clicks`);
      await redis.incr(`affiliate:source:${metadata.source}:clicks:${today}`);
      await redis.expire(`affiliate:source:${metadata.source}:clicks:${today}`, 90 * 24 * 60 * 60);
    }

    // Track unique clicks by session (24 hour window)
    if (metadata.sessionId) {
      const uniqueKey = `affiliate:unique:${metadata.toolKey}:${metadata.sessionId}`;
      const exists = await redis.exists(uniqueKey);
      if (!exists) {
        await redis.setex(uniqueKey, 24 * 60 * 60, '1');
        await redis.incr(`affiliate:tool:${metadata.toolKey}:unique`);
      }
    }

    // Add to recent clicks list (keep last 100)
    await redis.lpush(`affiliate:recent`, clickId);
    await redis.ltrim(`affiliate:recent`, 0, 99);

    // Update last click timestamp
    await redis.set(
      `affiliate:tool:${metadata.toolKey}:lastClick`,
      timestamp.toISOString()
    );

  } catch (error) {
    // Silent fail - analytics shouldn't break the app
    console.error('Affiliate tracking failed:', error);
  }
}

/**
 * Get affiliate stats for a specific tool
 */
export async function getToolAffiliateStats(toolKey: string): Promise<{
  totalClicks: number;
  uniqueClicks: number;
  lastClickAt?: string;
  clicksToday: number;
  clicksThisWeek: number;
  clicksThisMonth: number;
}> {
  try {
    const redis = getRedis();
    const today = new Date().toISOString().split('T')[0];

    // Get weekly and monthly dates
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [totalClicks, uniqueClicks, lastClickAt, clicksToday] = await Promise.all([
      redis.get(`affiliate:tool:${toolKey}:clicks`),
      redis.get(`affiliate:tool:${toolKey}:unique`),
      redis.get(`affiliate:tool:${toolKey}:lastClick`),
      redis.get(`affiliate:tool:${toolKey}:clicks:${today}`),
    ]);

    // Calculate weekly clicks
    const weeklyPromises = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weeklyPromises.push(redis.get(`affiliate:tool:${toolKey}:clicks:${dateStr}`));
    }
    const weeklyResults = await Promise.all(weeklyPromises);
    const clicksThisWeek = weeklyResults.reduce((sum: number, val) => sum + (Number(val) || 0), 0);

    // Calculate monthly clicks
    const monthlyPromises = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      monthlyPromises.push(redis.get(`affiliate:tool:${toolKey}:clicks:${dateStr}`));
    }
    const monthlyResults = await Promise.all(monthlyPromises);
    const clicksThisMonth = monthlyResults.reduce((sum: number, val) => sum + (Number(val) || 0), 0);

    return {
      totalClicks: Number(totalClicks) || 0,
      uniqueClicks: Number(uniqueClicks) || 0,
      lastClickAt: lastClickAt as string | undefined,
      clicksToday: Number(clicksToday) || 0,
      clicksThisWeek,
      clicksThisMonth,
    };
  } catch (error) {
    console.error('Failed to get tool affiliate stats:', error);
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      clicksToday: 0,
      clicksThisWeek: 0,
      clicksThisMonth: 0,
    };
  }
}

/**
 * Get overall affiliate statistics
 */
export async function getAffiliateStats(): Promise<AffiliateStats> {
  try {
    const redis = getRedis();

    // Get all tool keys
    const toolKeys = await redis.keys('affiliate:tool:*:clicks');
    const toolNames = toolKeys
      .filter((key: string) => !key.includes(':clicks:')) // Filter out daily keys
      .map((key: string) => key.split(':')[2]);

    // Get clicks by tool
    const clicksByTool: Record<string, number> = {};
    let totalClicks = 0;
    let uniqueClicks = 0;

    for (const toolKey of toolNames) {
      const [clicks, unique] = await Promise.all([
        redis.get(`affiliate:tool:${toolKey}:clicks`),
        redis.get(`affiliate:tool:${toolKey}:unique`),
      ]);

      const clickCount = Number(clicks) || 0;
      clicksByTool[toolKey] = clickCount;
      totalClicks += clickCount;
      uniqueClicks += Number(unique) || 0;
    }

    // Get clicks by source
    const sourceKeys = await redis.keys('affiliate:source:*:clicks');
    const sourceNames = sourceKeys
      .filter((key: string) => !key.includes(':clicks:'))
      .map((key: string) => key.split(':')[2]);

    const clicksBySource: Record<string, number> = {};
    for (const source of sourceNames) {
      const clicks = await redis.get(`affiliate:source:${source}:clicks`);
      clicksBySource[source] = Number(clicks) || 0;
    }

    // Get recent clicks
    const recentClickIds = (await redis.lrange('affiliate:recent', 0, 9)) as string[];
    const recentClicks: AffiliateClickMetadata[] = [];

    for (const clickId of recentClickIds) {
      const clickData = await redis.get(`affiliate:click:${clickId}`);
      if (clickData) {
        try {
          const parsed = JSON.parse(clickData as string);
          recentClicks.push({
            ...parsed,
            timestamp: new Date(parsed.timestamp),
          });
        } catch (e) {
          // Skip invalid data
        }
      }
    }

    // Calculate conversion rate (placeholder - needs actual conversion tracking)
    const conversionRate = uniqueClicks > 0 ? 0.05 : 0; // Assume 5% conversion

    // Estimate revenue (placeholder - needs actual commission data)
    const estimatedRevenue = uniqueClicks * 15 * conversionRate; // Assume $15 per conversion

    return {
      totalClicks,
      uniqueClicks,
      clicksByTool,
      clicksBySource,
      recentClicks,
      conversionRate,
      estimatedRevenue,
    };
  } catch (error) {
    console.error('Failed to get affiliate stats:', error);
    return {
      totalClicks: 0,
      uniqueClicks: 0,
      clicksByTool: {},
      clicksBySource: {},
      recentClicks: [],
    };
  }
}

/**
 * Get top performing affiliate links
 */
export async function getTopAffiliateLinks(limit = 10): Promise<Array<{
  toolKey: string;
  clicks: number;
  uniqueClicks: number;
}>> {
  try {
    const redis = getRedis();

    // Get all tool keys
    const toolKeys = await redis.keys('affiliate:tool:*:clicks');
    const toolNames = toolKeys
      .filter((key: string) => !key.includes(':clicks:'))
      .map((key: string) => key.split(':')[2]);

    // Get stats for each tool
    const stats = await Promise.all(
      toolNames.map(async (toolKey) => {
        const [clicks, unique] = await Promise.all([
          redis.get(`affiliate:tool:${toolKey}:clicks`),
          redis.get(`affiliate:tool:${toolKey}:unique`),
        ]);

        return {
          toolKey,
          clicks: Number(clicks) || 0,
          uniqueClicks: Number(unique) || 0,
        };
      })
    );

    // Sort by clicks and limit
    return stats
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  } catch (error) {
    console.error('Failed to get top affiliate links:', error);
    return [];
  }
}

/**
 * Track affiliate conversion (when user signs up via affiliate link)
 */
export async function trackAffiliateConversion(
  toolKey: string,
  metadata?: {
    userId?: string;
    subscriptionType?: string;
    revenue?: number;
  }
): Promise<void> {
  try {
    const redis = getRedis();
    const timestamp = new Date();

    // Increment conversion counter
    await redis.incr(`affiliate:tool:${toolKey}:conversions`);

    // Increment daily counter
    const today = timestamp.toISOString().split('T')[0];
    await redis.incr(`affiliate:tool:${toolKey}:conversions:${today}`);
    await redis.expire(`affiliate:tool:${toolKey}:conversions:${today}`, 90 * 24 * 60 * 60);

    // Store conversion metadata if provided
    if (metadata && metadata.revenue) {
      const currentRevenue = await redis.get(`affiliate:tool:${toolKey}:revenue`) || 0;
      await redis.set(
        `affiliate:tool:${toolKey}:revenue`,
        Number(currentRevenue) + metadata.revenue
      );
    }

    // Store conversion data
    const conversionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await redis.setex(
      `affiliate:conversion:${conversionId}`,
      90 * 24 * 60 * 60,
      JSON.stringify({
        toolKey,
        timestamp,
        ...metadata,
      })
    );

  } catch (error) {
    console.error('Affiliate conversion tracking failed:', error);
  }
}

/**
 * Sync affiliate stats to MongoDB (run hourly via cron)
 */
export async function syncAffiliateStatsToMongoDB(): Promise<void> {
  try {
    const redis = getRedis();
    const { getMongoDb } = await import('@/lib/db/mongodb');
    const db = await getMongoDb();

    // Get all tool keys
    const toolKeys = await redis.keys('affiliate:tool:*:clicks');
    const toolNames = toolKeys
      .filter((key: string) => !key.includes(':clicks:'))
      .map((key: string) => key.split(':')[2]);

    // Collect stats for each tool
    const updates = await Promise.all(
      toolNames.map(async (toolKey) => {
        const [clicks, unique, conversions, revenue, lastClick] = await Promise.all([
          redis.get(`affiliate:tool:${toolKey}:clicks`),
          redis.get(`affiliate:tool:${toolKey}:unique`),
          redis.get(`affiliate:tool:${toolKey}:conversions`),
          redis.get(`affiliate:tool:${toolKey}:revenue`),
          redis.get(`affiliate:tool:${toolKey}:lastClick`),
        ]);

        return {
          updateOne: {
            filter: { toolKey },
            update: {
              $set: {
                totalClicks: Number(clicks) || 0,
                uniqueClicks: Number(unique) || 0,
                conversions: Number(conversions) || 0,
                revenue: Number(revenue) || 0,
                lastClickAt: lastClick ? new Date(lastClick as string) : null,
                lastSyncedAt: new Date(),
              },
            },
            upsert: true,
          },
        };
      })
    );

    if (updates.length > 0) {
      await db.collection('affiliate_stats').bulkWrite(updates);
      console.log(`✅ Synced affiliate stats for ${updates.length} tools to MongoDB`);
    } else {
      console.log('ℹ️  No affiliate stats to sync');
    }

  } catch (error) {
    console.error('❌ Failed to sync affiliate stats to MongoDB:', error);
    throw error;
  }
}
