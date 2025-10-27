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
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user from session
    const managerId = 'temp-manager-id'; // Replace with actual session

    const [overview, roi] = await Promise.all([
      managerDashboardService.getTeamOverview(managerId),
      // Get ROI for first team (if exists)
      overview[0] 
        ? managerDashboardService.getTeamROI(overview[0].teamId)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      success: true,
      overview,
      roi,
    });
  } catch (error: any) {
    console.error('Manager dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
