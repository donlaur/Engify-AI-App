/**
 * AI Summary: Manager Team API - Returns detailed team data for a specific team
 * Protected route requiring authentication and manager role. Includes rate limiting
 * (60 req/min) and fetches team members, skill matrix, promotion pipeline, and ROI.
 * Part of Day 7 Audit #6 authentication improvements.
 * Last updated: 2025-11-02
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
  const authResult = await requireAuth(request);
  if ('error' in authResult) {
    return authResult.error;
  }
  const { user } = authResult;

  // Role check: manager, director, or higher
  const allowedRoles = ['manager', 'director', 'enterprise_admin', 'super_admin'];
  if (!allowedRoles.includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Manager role required' },
      { status: 403 }
    );
  }

  // Rate limiting: 60 requests per minute (higher for team details)
  const identifier = user.id;
  const rateLimitResult = await checkRateLimit(identifier, 'authenticated');
  if (!rateLimitResult.allowed) {
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
