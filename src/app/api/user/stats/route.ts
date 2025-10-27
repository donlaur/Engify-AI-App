/**
 * User Stats API
 * Returns user statistics and activity
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const userId = session.user.id;

    // Get user data
    const user = await db.collection('users').findOne({ _id: userId });
    
    // Get prompt usage count
    const promptUsage = await db.collection('prompt_history').countDocuments({
      userId,
    });

    // Get favorites count
    const favoritesCount = await db.collection('favorites').countDocuments({
      userId,
    });

    // Get recent activity
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
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
