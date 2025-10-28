import { getMongoDb } from '@/lib/db/mongodb';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimitService {
  async checkLimit(
    key: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const db = await getMongoDb();
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    
    const record = await db.collection('rate_limits').findOne({
      key,
      timestamp: { $gte: windowStart },
    });
    
    const count = record?.count || 0;
    const allowed = count < config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - count - 1);
    const resetAt = new Date(now.getTime() + config.windowMs);
    
    if (allowed) {
      await db.collection('rate_limits').updateOne(
        { key },
        {
          $inc: { count: 1 },
          $set: { timestamp: now },
        },
        { upsert: true }
      );
    }
    
    return { allowed, remaining, resetAt };
  }
  
  async resetLimit(key: string): Promise<void> {
    const db = await getMongoDb();
    await db.collection('rate_limits').deleteOne({ key });
  }
}

export const RATE_LIMITS = {
  API_DEFAULT: { windowMs: 60000, maxRequests: 60 }, // 60 req/min
  AI_EXECUTION: { windowMs: 60000, maxRequests: 10 }, // 10 req/min
  AUTH_LOGIN: { windowMs: 900000, maxRequests: 5 }, // 5 req/15min
  AUTH_REGISTER: { windowMs: 3600000, maxRequests: 3 }, // 3 req/hour
};
