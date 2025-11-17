/**
 * Simple Rate Limiter for Feedback APIs
 * Per-minute rate limiting (simpler than AI API rate limiting)
 * 
 * Uses centralized constants from src/lib/constants/rates.ts (DRY principle)
 */

import { NextRequest } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { FEEDBACK_RATE_LIMITS } from '@/lib/constants/rates';
import { getRateLimitMessage } from '@/lib/constants/messages';

interface FeedbackRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

/**
 * Check rate limit for feedback API
 * Uses per-minute limits (simpler than AI API hourly/daily limits)
 */
export async function checkFeedbackRateLimit(
  request: NextRequest
): Promise<FeedbackRateLimitResult> {
  try {
    const session = await auth();
    const tier = session?.user ? 'authenticated' : 'anonymous';
    const limit = FEEDBACK_RATE_LIMITS[tier].perMinute;
    
    // Use IP address as identifier for anonymous, user ID for authenticated
    const identifier = session?.user?.id || getClientIP(request);
    
    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, engify/no-hardcoded-collections
    const collection = db.collection('feedback_rate_limits');
    
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    // Get recent requests
    const record = await collection.findOne({ identifier });
    
    if (!record) {
      // First request - create record
      await collection.insertOne({
        identifier,
        tier,
        requests: [now],
        createdAt: now,
        updatedAt: now,
      });
      
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(now.getTime() + 60 * 1000),
      };
    }
    
    // Filter requests within last minute
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentRequests = (record.requests || []).filter((req: any) => 
      new Date(req) > oneMinuteAgo
    );
    
    if (recentRequests.length >= limit) {
      // Rate limit exceeded
      const oldestRequest = Math.min(...recentRequests.map((req: Date) => new Date(req).getTime()));
      const resetAt = new Date(oldestRequest + 60 * 1000);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        reason: getRateLimitMessage(resetAt),
      };
    }
    
    // Add new request
    recentRequests.push(now);
    await collection.updateOne(
      { identifier },
      {
        $set: {
          requests: recentRequests,
          updatedAt: now,
        },
      }
    );
    
    return {
      allowed: true,
      remaining: limit - recentRequests.length,
      resetAt: new Date(now.getTime() + 60 * 1000),
    };
    
  } catch (error) {
    console.error('Error checking feedback rate limit:', error);
    // Fail open - allow request if rate limit check fails
    return {
      allowed: true,
      remaining: 999,
      resetAt: new Date(Date.now() + 60 * 1000),
    };
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts.length > 0 ? parts[0].trim() : 'unknown';
  }
  
  return request.headers.get('x-real-ip') || 'unknown';
}

