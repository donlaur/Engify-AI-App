/**
 * AI Summary: Observability metrics API exposing RED metrics for routes and providers.
 * Part of Day 5 Phase 6.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { getREDSummary, getRouteMetrics, getProviderMetrics } from '@/lib/observability/metrics';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const guard = await RBACPresets.requireSuperAdmin()(request);
  if (guard) {
    return guard;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const route = searchParams.get('route');
    const provider = searchParams.get('provider');

    // Return specific route or provider metrics if requested
    if (route) {
      const metrics = getRouteMetrics(route);
      if (!metrics) {
        return NextResponse.json(
          { error: 'No metrics found for route' },
          { status: 404 }
        );
      }
      return NextResponse.json({ route, metrics });
    }

    if (provider) {
      const metrics = getProviderMetrics(provider);
      if (!metrics) {
        return NextResponse.json(
          { error: 'No metrics found for provider' },
          { status: 404 }
        );
      }
      return NextResponse.json({ provider, metrics });
    }

    // Return RED summary
    const summary = getREDSummary();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

