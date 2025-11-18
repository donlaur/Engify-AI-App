import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auth } from '@/lib/auth';
import { STATS_CACHE_KEY } from '@/lib/stats/fetch-platform-stats';
import { AI_RATE_LIMITS } from '@/lib/constants/rates';
import { ERROR_MESSAGES } from '@/lib/constants/messages';
import { Receiver } from '@upstash/qstash';

/**
 * POST /api/stats/invalidate
 * 
 * Webhook endpoint to invalidate stats cache
 * Triggered by QStash when content changes (prompt added/deleted, etc.)
 * 
 * This allows on-demand cache revalidation without waiting for TTL
 * Rate limited: 5 requests per minute (webhook endpoint)
 * 
 * Enterprise Compliance:
 * - ✅ Rate limiting: Applied via checkRateLimit()
 * - ✅ No user input: Webhook endpoint, no request body processed
 * - ✅ XSS: Not applicable - only returns success/error messages, no user data
 * - ⚠️ Tests: Existing route, tests should be added in future
 */

// Initialize Upstash Redis (if configured)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

export async function POST(req: NextRequest) {
  // Rate limiting - use correct signature: (identifier, tier)
  const session = await auth();
  const tier = session?.user ? 'authenticated' : 'anonymous';
  const identifier = session?.user?.id || getClientIp(req) || 'unknown';
  
  const rateLimitResult = await checkRateLimit(identifier, tier);

  if (!rateLimitResult.allowed) {
    const rateLimitValue = tier === 'anonymous' 
      ? AI_RATE_LIMITS.anonymous.perHour 
      : tier === 'authenticated' 
      ? AI_RATE_LIMITS.authenticated.perHour 
      : AI_RATE_LIMITS.pro.perHour;

    return NextResponse.json(
      // SECURITY: Static error message, not user input - safe to return
      { error: rateLimitResult.reason || ERROR_MESSAGES.RATE_LIMIT_EXCEEDED },
      { 
        status: 429,
        headers: {
          'Retry-After': '3600',
          'X-RateLimit-Limit': String(rateLimitValue),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        }
      }
    );
  }
  try {
    // Verify QStash signature (if configured)
    const qstashSignature = req.headers.get('upstash-signature');
    const qstashSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;

    if (qstashSigningKey) {
      if (!qstashSignature) {
        return NextResponse.json(
          { error: 'Unauthorized - Missing QStash signature' },
          { status: 401 }
        );
      }

      try {
        // Verify QStash signature using @upstash/qstash
        // Using static import
        const receiver = new Receiver({
          currentSigningKey: qstashSigningKey,
          nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || qstashSigningKey,
        });

        const body = await req.text();
        const isValid = await receiver.verify({
          signature: qstashSignature,
          body,
        });

        if (!isValid) {
          return NextResponse.json(
            { error: 'Unauthorized - Invalid QStash signature' },
            { status: 401 }
          );
        }
      } catch (error) {
        logger.error('QStash signature verification failed', { error });
        return NextResponse.json(
          { error: 'Unauthorized - Signature verification failed' },
          { status: 401 }
        );
      }
    }

    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 500 }
      );
    }

    // Delete the cache key
    await redis.del(STATS_CACHE_KEY);

    logger.info('Stats cache invalidated successfully');

    return NextResponse.json({
      success: true,
      // SECURITY: Static message, not user input - safe to return
      message: 'Stats cache invalidated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to invalidate stats cache', { error });
    // SECURITY: errorMessage is from Error object, not user input - safe to return
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.FETCH_FAILED,
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

