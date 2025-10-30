/**
 * Manager Dashboard API
 * Returns team overview and analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { managerDashboardService } from '@/lib/services/ManagerDashboardService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/manager/dashboard
 * Get manager dashboard data
 */
export async function GET(_request: NextRequest) {
  try {
    // TODO: Get user from session
    const managerId = 'temp-manager-id'; // Replace with actual session

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
