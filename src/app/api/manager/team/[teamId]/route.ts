/**
 * Manager Team API
 * Returns detailed team data
 */

import { NextRequest, NextResponse } from 'next/server';
import { managerDashboardService } from '@/lib/services/ManagerDashboardService';
// import { teamService } from '@/lib/services/TeamService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/manager/team/[teamId]
 * Get team details
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const { teamId } = params;

    // TODO: Verify user is manager of this team

    const [members, skillMatrix, pipeline, roi] = await Promise.all([
      managerDashboardService.getMemberProgress(teamId),
      managerDashboardService.getTeamSkillMatrix(teamId),
      managerDashboardService.getPromotionPipeline(teamId),
      managerDashboardService.getTeamROI(teamId),
    ]);

    return NextResponse.json({
      success: true,
      members,
      skillMatrix,
      pipeline,
      roi,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('Team details error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to load team details' },
      { status: 500 }
    );
  }
}
