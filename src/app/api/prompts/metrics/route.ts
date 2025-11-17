/**
 * Prompt Metrics API
 * Get aggregated metrics for prompts (views, favorites, shares)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * GET /api/prompts/metrics
 * Get metrics for prompts
 *
 * Query params:
 * - promptIds: comma-separated list of prompt IDs (optional)
 * - limit: number of top prompts to return (default: 10)
 * - metric: 'views' | 'favorites' | 'shares' (default: 'views')
 */
export async function GET(request: NextRequest) {
  // Rate limiting for public API
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = await checkRateLimit(ip, 'anonymous');

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: rateLimit.reason || 'Too many requests' },
      { status: 429 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const promptIdsParam = searchParams.get('promptIds');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const metric = searchParams.get('metric') || 'views';

    const db = await getMongoDb();

    // Get prompt metrics from prompts collection
    const query: Record<string, unknown> = { active: { $ne: false } };
    
    if (promptIdsParam) {
      const promptIds = promptIdsParam.split(',').map((id) => id.trim());
      query.id = { $in: promptIds };
    }

    // Get favorites count from favorites collection
    const favoritesCounts = await db
      .collection('favorites')
      .aggregate([
        {
          $match: {
            itemType: 'prompt',
            ...(promptIdsParam ? { itemId: { $in: promptIdsParam.split(',').map((id) => id.trim()) } } : {}),
          },
        },
        {
          $group: {
            _id: '$itemId',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get shares count from analytics_events (if tracked)
    const sharesCounts = await db
      .collection('analytics_events')
      .aggregate([
        {
          $match: {
            event: 'share',
            promptId: { $exists: true },
            ...(promptIdsParam ? { promptId: { $in: promptIdsParam.split(',').map((id) => id.trim()) } } : {}),
          },
        },
        {
          $group: {
            _id: '$promptId',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get prompts with views
    const prompts = await db
      .collection('prompts')
      .find(query, {
        projection: {
          id: 1,
          title: 1,
          description: 1,
          category: 1,
          role: 1,
          views: 1,
        },
      })
      .toArray();

    // Merge metrics
    const favoritesMap = new Map(
      favoritesCounts.map((item) => [item._id, item.count])
    );
    const sharesMap = new Map(
      sharesCounts.map((item) => [item._id, item.count])
    );

    const promptsWithMetrics = prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      role: prompt.role,
      views: prompt.views || 0,
      favorites: favoritesMap.get(prompt.id) || 0,
      shares: sharesMap.get(prompt.id) || 0,
    }));

    // Sort by requested metric
    const sorted = [...promptsWithMetrics];
    if (metric === 'views') {
      sorted.sort((a, b) => b.views - a.views);
    } else if (metric === 'favorites') {
      sorted.sort((a, b) => b.favorites - a.favorites);
    } else if (metric === 'shares') {
      sorted.sort((a, b) => b.shares - a.shares);
    }

    return NextResponse.json({
      success: true,
      prompts: sorted.slice(0, limit),
      metric,
    });
  } catch (error) {
    logger.apiError('/api/prompts/metrics', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
