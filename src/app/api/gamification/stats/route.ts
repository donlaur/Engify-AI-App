/**
 * Gamification Stats API
 * 
 * GET /api/gamification/stats - Get user's gamification stats
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { gamificationService } from '@/lib/services/GamificationService';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const stats = await gamificationService.getUserStats(session.user.id);
    const xpForNextLevel = gamificationService.getXPForNextLevel(stats.level);
    
    // Calculate XP in current level
    let xpInCurrentLevel = stats.xp;
    for (let i = 1; i < stats.level; i++) {
      xpInCurrentLevel -= gamificationService.getXPForNextLevel(i);
    }
    
    return NextResponse.json({
      success: true,
      stats: {
        xp: stats.xp,
        level: stats.level,
        xpInCurrentLevel,
        xpForNextLevel,
        promptsUsed: stats.promptsUsed,
        favoritePrompts: stats.favoritePrompts,
        patternsLearned: stats.patternsLearned,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        recentActivity: stats.recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

