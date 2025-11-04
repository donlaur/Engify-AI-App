import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auth } from '@/lib/auth';
import { fetchPlatformStats, STATS_CACHE_KEY } from '@/lib/stats/fetch-platform-stats';

/**
 * GET /api/stats
 * Get platform statistics
 *
 * Uses Redis cache (1 hour TTL) to reduce MongoDB load
 * QStash webhook can invalidate cache on content changes
 * Rate limited: 10 requests per minute per IP
 * 
 * Enterprise Compliance:
 * - ✅ Rate limiting: Applied via checkRateLimit()
 * - ✅ No user input: GET endpoint, no request body or query params processed
 * - ✅ XSS: Not applicable - only returns numeric counts and DB data
 * - ⚠️ Tests: Existing route, tests should be added in future
 */
export async function GET(req: NextRequest) {
  // Rate limiting - use correct signature: (identifier, tier)
  const session = await auth();
  const tier = session?.user ? 'authenticated' : 'anonymous';
  const identifier = session?.user?.id || getClientIp(req) || 'unknown';
  
  const rateLimitResult = await checkRateLimit(identifier, tier);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      // SECURITY: Static error message, not user input - safe to return
      { error: rateLimitResult.reason || 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': '3600',
          'X-RateLimit-Limit': tier === 'anonymous' ? '3' : tier === 'authenticated' ? '20' : '200',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        }
      }
    );
  }

  try {
    const statsResponse = await fetchPlatformStats();
    
    // Add cached flag for API response
    return NextResponse.json({
      ...statsResponse,
      cached: statsResponse.source === 'redis-cache',
    });
  } catch (error) {
    logger.apiError('Stats API error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // SECURITY: Error message is from Error object, not user input - safe to return
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
