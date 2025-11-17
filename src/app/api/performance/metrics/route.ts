/**
 * Performance Metrics API
 *
 * Exposes performance metrics for monitoring and debugging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { globalApiMonitor } from '@/lib/performance/api-monitor';
import { globalQueryMonitor } from '@/lib/performance/query-monitor';
import { globalCacheMonitor } from '@/lib/performance/cache-metrics';

/**
 * GET /api/performance/metrics
 * Get performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'api', 'query', 'cache', or 'all'
    const window = parseInt(searchParams.get('window') || '60'); // Minutes

    const metrics: Record<string, unknown> = {};

    if (!type || type === 'all' || type === 'api') {
      const apiStats = globalApiMonitor.getOverallStats();
      metrics.api = {
        ...apiStats,
        endpoints: globalApiMonitor.getAllStats().slice(0, 10), // Top 10
      };
    }

    if (!type || type === 'all' || type === 'query') {
      const queryStats = globalQueryMonitor.getStats();
      metrics.query = {
        ...queryStats,
        slowQueries: globalQueryMonitor.getSlowQueries().slice(0, 10), // Top 10
      };
    }

    if (!type || type === 'all' || type === 'cache') {
      const cacheMetrics = globalCacheMonitor.getMetricsWindow(window);
      metrics.cache = {
        ...cacheMetrics,
        efficiencyScore: globalCacheMonitor.getEfficiencyScore(),
        mostAccessed: globalCacheMonitor.getMostAccessedKeys(10),
      };
    }

    // Add system metrics
    metrics.system = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to get performance metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/performance/metrics/clear
 * Clear performance metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const type = body.type; // 'api', 'query', 'cache', or 'all'

    if (!type || type === 'all' || type === 'api') {
      globalApiMonitor.clear();
    }

    if (!type || type === 'all' || type === 'query') {
      globalQueryMonitor.clear();
    }

    if (!type || type === 'all' || type === 'cache') {
      globalCacheMonitor.reset();
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${type || 'all'} metrics`,
    });
  } catch (error) {
    console.error('Failed to clear metrics:', error);
    return NextResponse.json(
      { error: 'Failed to clear metrics' },
      { status: 500 }
    );
  }
}
