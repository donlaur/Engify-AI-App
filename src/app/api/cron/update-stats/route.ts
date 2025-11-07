import { NextRequest, NextResponse } from 'next/server';
import { fetchPlatformStats } from '@/lib/stats/fetch-platform-stats';
import { logger } from '@/lib/logging/logger';

/**
 * Cron endpoint to update platform stats in Redis cache
 * Called by Upstash QStash every hour
 * 
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify QStash signature or CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      logger.warn('Unauthorized cron request', {
        hasAuth: !!authHeader,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    logger.info('Starting stats update via cron');

    // Fetch stats from MongoDB and cache in Redis
    // skipMongoDB = false to allow MongoDB query
    const stats = await fetchPlatformStats(false);

    logger.info('Stats updated successfully', {
      source: stats.source,
      promptCount: stats.stats.prompts,
      patternCount: stats.stats.patterns,
      lastUpdated: stats.lastUpdated,
    });

    return NextResponse.json({
      success: true,
      stats: {
        prompts: stats.stats.prompts,
        patterns: stats.stats.patterns,
        learningResources: stats.stats.learningResources,
        users: stats.stats.users,
      },
      source: stats.source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Stats update failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
