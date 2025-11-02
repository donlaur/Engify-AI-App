/**
 * Manager Team API
 * Returns detailed team data
 */

import { NextRequest, NextResponse } from 'next/server';
import { managerDashboardService } from '@/lib/services/ManagerDashboardService';
import { requireAuth } from '@/lib/auth/require-auth';
import { checkRateLimit } from '@/lib/rate-limit';
// import { teamService } from '@/lib/services/TeamService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/manager/team/[teamId]
 * Get team details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
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

  // Rate limiting: 60 requests per minute (higher for team details)
  const rateLimitResult = await checkRateLimit(
    request,
    'manager-team',
    60,
    60
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const { teamId } = params;

    // TODO: Verify user is actually manager of THIS specific team
    // For now, any manager can view any team (will add team ownership check later)

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
