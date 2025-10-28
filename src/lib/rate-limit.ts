/**
 * Rate Limiting for AI API Calls
 * 
 * Prevents abuse of OpenAI and Google AI API keys
 * Tracks usage by IP address and user ID
 */

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxTokensPerDay: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  anonymous: {
    maxRequestsPerHour: 3,      // Very limited for free users
    maxRequestsPerDay: 10,       // Enough to test, not abuse
    maxTokensPerDay: 10000,      // ~5 full conversations
  },
  authenticated: {
    maxRequestsPerHour: 20,      // Signed up users get more
    maxRequestsPerDay: 100,      // Good for regular use
    maxTokensPerDay: 100000,     // ~50 conversations
  },
  pro: {
    maxRequestsPerHour: 200,     // Pro users get plenty
    maxRequestsPerDay: 2000,     // Heavy usage
    maxTokensPerDay: 1000000,    // ~500 conversations
  },
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

/**
 * Check if request is allowed based on rate limits
 */
export async function checkRateLimit(
  identifier: string, // IP address or user ID
  tier: 'anonymous' | 'authenticated' | 'pro' = 'anonymous'
): Promise<RateLimitResult> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get usage stats
    const usage = await collection.findOne({ identifier });

    if (!usage) {
      // First request - create record
      await collection.insertOne({
        identifier,
        tier,
        requests: [now],
        tokens: 0,
        createdAt: now,
        updatedAt: now,
      });

      return {
        allowed: true,
        remaining: LIMITS[tier].maxRequestsPerHour - 1,
        resetAt: new Date(now.getTime() + 60 * 60 * 1000),
      };
    }

    // Clean up old requests
    const recentRequests = usage.requests.filter(
      (req: Date) => new Date(req) > dayAgo
    );

    const requestsLastHour = recentRequests.filter(
      (req: Date) => new Date(req) > hourAgo
    ).length;

    const requestsLastDay = recentRequests.length;

    const limits = LIMITS[tier];

    // Check hourly limit
    if (requestsLastHour >= limits.maxRequestsPerHour) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(hourAgo.getTime() + 60 * 60 * 1000),
        reason: `Rate limit exceeded: ${limits.maxRequestsPerHour} requests per hour. Please try again later or sign up for more capacity.`,
      };
    }

    // Check daily limit
    if (requestsLastDay >= limits.maxRequestsPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(dayAgo.getTime() + 24 * 60 * 60 * 1000),
        reason: `Daily limit exceeded: ${limits.maxRequestsPerDay} requests per day. Sign up for free to get more capacity!`,
      };
    }

    // Check token limit (if tracked)
    if (usage.tokens >= limits.maxTokensPerDay) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(dayAgo.getTime() + 24 * 60 * 60 * 1000),
        reason: `Token limit exceeded. Sign up for free to continue!`,
      };
    }

    // Update usage
    await collection.updateOne(
      { identifier },
      {
        $push: { requests: now } as any,
        $set: { updatedAt: now, tier },
      }
    );

    return {
      allowed: true,
      remaining: limits.maxRequestsPerHour - requestsLastHour - 1,
      resetAt: new Date(hourAgo.getTime() + 60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open - allow request but log error
    return {
      allowed: true,
      remaining: 0,
      resetAt: new Date(Date.now() + 60 * 60 * 1000),
    };
  }
}

/**
 * Track token usage for a request
 */
export async function trackTokenUsage(
  identifier: string,
  tokens: number
): Promise<void> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    await collection.updateOne(
      { identifier },
      {
        $inc: { tokens },
        $set: { updatedAt: new Date() },
      }
    );
  } catch (error) {
    console.error('Token tracking error:', error);
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // eslint-disable-next-line engify/no-unsafe-array-access
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Reset rate limits for a user (admin function)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  try {
    const client = await getClient();
    const db = client.db('engify');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('rate_limits');

    await collection.deleteOne({ identifier });
  } catch (error) {
    console.error('Reset rate limit error:', error);
  }
}
