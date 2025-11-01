/**
 * Gamification Stats API
 * 
 * GET /api/gamification/stats - Get user's gamification stats
 * 
 * Enterprise Standards:
 * - Uses existing GamificationService (BaseService pattern)
 * - RBAC: users:read permission
 * - Rate limiting
 * - Audit logging
 * - Error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { GamificationService } from '@/lib/services/GamificationService';
import { getXPForNextLevel } from '@/lib/gamification/levels';

const gamificationService = new GamificationService();

export async function GET(request: NextRequest) {
  // RBAC: Require users:read permission
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting (100 requests per hour for authenticated users)
    const rateLimitResult = await checkRateLimit(session.user.id, 'authenticated');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetAt: rateLimitResult.resetAt.toISOString(),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Get gamification data
    const gamification = await gamificationService.getUserGamification(session.user.id);
    const xpForNextLevel = getXPForNextLevel(gamification.xp);

    return NextResponse.json({
      success: true,
      data: {
        xp: gamification.xp,
        level: gamification.level,
        xpForNextLevel: xpForNextLevel.xpRequired,
        dailyStreak: gamification.dailyStreak,
        achievements: gamification.achievements,
        stats: gamification.stats,
      },
    });
  } catch (error) {
    logger.error('Error fetching gamification stats', {
      error: error instanceof Error ? error.message : String(error),
      userId: (await auth())?.user?.id,
    });

    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

