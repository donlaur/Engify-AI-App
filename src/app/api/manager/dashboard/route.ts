/**
 * AI Summary: Manager Dashboard API - Returns team overview and analytics for managers
 * Protected route requiring authentication and manager role (manager, director, etc.).
 * Includes rate limiting (30 req/min) and fetches team overview data from MongoDB.
 * Part of Day 7 Audit #6 authentication improvements.
 * Last updated: 2025-11-02
 */

import { NextRequest, NextResponse } from 'next/server';
import { managerDashboardService } from '@/lib/services/ManagerDashboardService';
import { requireAuth } from '@/lib/auth/require-auth';
import { checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/manager/dashboard
 * Get manager dashboard data
 */
export async function GET(request: NextRequest) {
  // Authentication required
  const { user, error: authError } = await requireAuth(request);
  if (authError) return authError;

  // Role check: manager, director, or higher
  const allowedRoles = ['manager', 'director', 'enterprise_admin', 'super_admin'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Manager role required' },
      { status: 403 }
    );
  }

  // Rate limiting: 30 requests per minute
  const rateLimitResult = await checkRateLimit(
    request,
    'manager-dashboard',
    30,
    60
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const managerId = user._id.toString();

    const overview = await managerDashboardService.getTeamOverview(managerId);
    const firstTeam = overview && overview.length > 0 ? overview[0] : null;
    const roi = firstTeam
      ? await managerDashboardService.getTeamROI(firstTeam.teamId)
      : null;

    return NextResponse.json({
      success: true,
      overview,
      roi,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Manager dashboard error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
