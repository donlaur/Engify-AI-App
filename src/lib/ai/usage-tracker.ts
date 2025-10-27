/**
 * AI Usage Tracker
 * Tracks token usage, costs, and API calls per user
 */

import { getMongoDb } from '@/lib/db/mongodb';

export interface UsageRecord {
  userId: string;
  sessionId?: string;
  timestamp: Date;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  endpoint: string;
  success: boolean;
  error?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
  byDay: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface UsageLimits {
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerDay: number;
  costPerDay: number;
  maxTokensPerRequest: number;
}

/**
 * Default usage limits by user tier
 */
export const USAGE_LIMITS: Record<string, UsageLimits> = {
  free: {
    requestsPerHour: 10,
    requestsPerDay: 50,
    tokensPerDay: 50000,
    costPerDay: 0.50,
    maxTokensPerRequest: 2000,
  },
  basic: {
    requestsPerHour: 60,
    requestsPerDay: 500,
    tokensPerDay: 500000,
    costPerDay: 5.00,
    maxTokensPerRequest: 4000,
  },
  pro: {
    requestsPerHour: 300,
    requestsPerDay: 2000,
    tokensPerDay: 2000000,
    costPerDay: 20.00,
    maxTokensPerRequest: 8000,
  },
  enterprise: {
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    tokensPerDay: 10000000,
    costPerDay: 100.00,
    maxTokensPerRequest: 16000,
  },
};

/**
 * Track AI usage
 */
export async function trackUsage(record: UsageRecord): Promise<void> {
  try {
    const db = await getMongoDb();
    await db.collection('ai_usage').insertOne({
      ...record,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't throw - tracking failure shouldn't break the app
  }
}

/**
 * Get usage stats for user
 */
export async function getUserUsageStats(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<UsageStats> {
  const db = await getMongoDb();
  
  const query: any = { userId };
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  const records = await db.collection('ai_usage')
    .find(query)
    .toArray();

  const stats: UsageStats = {
    totalRequests: records.length,
    totalTokens: 0,
    totalCost: 0,
    byProvider: {},
    byDay: {},
  };

  records.forEach((record: any) => {
    stats.totalTokens += record.totalTokens || 0;
    stats.totalCost += record.cost || 0;

    // By provider
    if (!stats.byProvider[record.provider]) {
      stats.byProvider[record.provider] = {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
    }
    stats.byProvider[record.provider].requests++;
    stats.byProvider[record.provider].tokens += record.totalTokens || 0;
    stats.byProvider[record.provider].cost += record.cost || 0;

    // By day
    const day = record.timestamp.toISOString().split('T')[0];
    if (!stats.byDay[day]) {
      stats.byDay[day] = {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
    }
    stats.byDay[day].requests++;
    stats.byDay[day].tokens += record.totalTokens || 0;
    stats.byDay[day].cost += record.cost || 0;
  });

  return stats;
}

/**
 * Check if user is within usage limits
 */
export async function checkUsageLimits(
  userId: string,
  tier: string = 'free',
  requestedTokens: number = 0
): Promise<{
  allowed: boolean;
  reason?: string;
  current: {
    requestsThisHour: number;
    requestsToday: number;
    tokensToday: number;
    costToday: number;
  };
  limits: UsageLimits;
}> {
  const limits = USAGE_LIMITS[tier] || USAGE_LIMITS.free;
  
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));

  const db = await getMongoDb();
  
  // Get requests in last hour
  const requestsThisHour = await db.collection('ai_usage').countDocuments({
    userId,
    timestamp: { $gte: hourAgo },
  });

  // Get today's stats
  const todayRecords = await db.collection('ai_usage')
    .find({
      userId,
      timestamp: { $gte: startOfDay },
    })
    .toArray();

  const requestsToday = todayRecords.length;
  const tokensToday = todayRecords.reduce((sum: number, r: any) => sum + (r.totalTokens || 0), 0);
  const costToday = todayRecords.reduce((sum: number, r: any) => sum + (r.cost || 0), 0);

  const current = {
    requestsThisHour,
    requestsToday,
    tokensToday,
    costToday,
  };

  // Check limits
  if (requestsThisHour >= limits.requestsPerHour) {
    return {
      allowed: false,
      reason: `Hourly limit reached (${limits.requestsPerHour} requests/hour)`,
      current,
      limits,
    };
  }

  if (requestsToday >= limits.requestsPerDay) {
    return {
      allowed: false,
      reason: `Daily request limit reached (${limits.requestsPerDay} requests/day)`,
      current,
      limits,
    };
  }

  if (tokensToday + requestedTokens > limits.tokensPerDay) {
    return {
      allowed: false,
      reason: `Daily token limit reached (${limits.tokensPerDay} tokens/day)`,
      current,
      limits,
    };
  }

  if (requestedTokens > limits.maxTokensPerRequest) {
    return {
      allowed: false,
      reason: `Request too large (max ${limits.maxTokensPerRequest} tokens per request)`,
      current,
      limits,
    };
  }

  return {
    allowed: true,
    current,
    limits,
  };
}

/**
 * Get usage summary for display
 */
export function formatUsageSummary(stats: UsageStats, limits: UsageLimits) {
  return {
    requests: {
      used: stats.totalRequests,
      limit: limits.requestsPerDay,
      percentage: (stats.totalRequests / limits.requestsPerDay) * 100,
    },
    tokens: {
      used: stats.totalTokens,
      limit: limits.tokensPerDay,
      percentage: (stats.totalTokens / limits.tokensPerDay) * 100,
    },
    cost: {
      used: stats.totalCost,
      limit: limits.costPerDay,
      percentage: (stats.totalCost / limits.costPerDay) * 100,
    },
  };
}
