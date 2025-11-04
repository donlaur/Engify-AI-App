/**
 * User Stats API
 * Returns user statistics and activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export async function GET(request: NextRequest) {
  // RBAC: users:read permission (users can read their own stats)
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const userId = session.user.id;

    // Get user data (querying by _id only - no org isolation needed)
    const user = await db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) });

    // Get prompt usage count
    // Query is user-scoped (filtered by userId) - no organizationId needed
    // prompt_history collection stores user-specific data, isolated by userId
    const promptUsage = await db.collection('prompt_history').countDocuments({
      userId,
    });

    // Get favorites count
    // Query is user-scoped (filtered by userId) - no organizationId needed
    // favorites collection stores user-specific data, isolated by userId
    const favoritesCount = await db.collection('favorites').countDocuments({
      userId,
    });

    // Get recent activity
    // Query is user-scoped (filtered by userId) - no organizationId needed
    const recentActivity = await db
      .collection('prompt_history')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      user: {
        name: user?.name || 'User',
        email: user?.email,
        level: user?.level || 1,
        xp: user?.xp || 0,
        joinedDate: user?.createdAt,
      },
      stats: {
        promptsUsed: promptUsage,
        favoritePrompts: favoritesCount,
        patternsLearned: user?.patternsLearned || 0,
        streak: user?.streak || 0,
      },
      recentActivity: recentActivity.map((activity) => ({
        id: activity._id,
        promptTitle: activity.promptTitle,
        timestamp: activity.createdAt,
        type: 'used',
      })),
    });
  } catch (error) {
    const session = await auth();
    logger.apiError('/api/user/stats', error, {
      method: 'GET',
      userId: session?.user?.id,
    });
    return NextResponse.json(
      {
        error: ERROR_MESSAGES.FETCH_FAILED,
        message: error instanceof Error ? error.message : ERROR_MESSAGES.SERVER_ERROR,
      },
      { status: 500 }
    );
  }
}
