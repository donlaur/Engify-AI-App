/**
 * Gamification Service
 * 
 * Handles XP, levels, streaks, and activity tracking
 */

import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { UserStats, XP_REWARDS, getXPForLevel, getLevelFromXP } from '@/lib/db/schemas/user-stats';

export class GamificationService {
  /**
   * Get user stats (create if doesn't exist)
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const db = await getDb();
    const userObjectId = new ObjectId(userId);
    
    let stats = await db.collection('user_stats').findOne({ userId: userObjectId });
    
    if (!stats) {
      // Create default stats
      const newStats: Omit<UserStats, '_id'> = {
        userId: userObjectId,
        xp: 0,
        level: 1,
        promptsUsed: 0,
        favoritePrompts: 0,
        patternsLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: undefined,
        recentActivity: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await db.collection('user_stats').insertOne(newStats);
      stats = { ...newStats, _id: result.insertedId };
    }
    
    return stats as UserStats;
  }
  
  /**
   * Award XP and update level
   */
  async awardXP(
    userId: string,
    xpAmount: number,
    activityType: 'prompt_used' | 'pattern_learned' | 'prompt_favorited' | 'challenge_completed',
    metadata?: { promptId?: string; promptTitle?: string }
  ): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
    const db = await getDb();
    const userObjectId = new ObjectId(userId);
    
    const stats = await this.getUserStats(userId);
    const oldLevel = stats.level;
    const newXP = stats.xp + xpAmount;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > oldLevel;
    
    // Add to recent activity (keep last 10)
    const activity = {
      type: activityType,
      promptId: metadata?.promptId,
      promptTitle: metadata?.promptTitle,
      xpEarned: xpAmount,
      timestamp: new Date(),
    };
    
    const recentActivity = [activity, ...stats.recentActivity].slice(0, 10);
    
    // Update streak
    const { currentStreak, longestStreak } = this.updateStreak(stats);
    
    await db.collection('user_stats').updateOne(
      { userId: userObjectId },
      {
        $set: {
          xp: newXP,
          level: newLevel,
          currentStreak,
          longestStreak,
          lastActivityDate: new Date(),
          recentActivity,
          updatedAt: new Date(),
        },
      }
    );
    
    return { newXP, newLevel, leveledUp };
  }
  
  /**
   * Track prompt usage
   */
  async trackPromptUsed(userId: string, promptId: string, promptTitle: string) {
    const db = await getDb();
    const userObjectId = new ObjectId(userId);
    
    await db.collection('user_stats').updateOne(
      { userId: userObjectId },
      {
        $inc: { promptsUsed: 1 },
        $set: { updatedAt: new Date() },
      }
    );
    
    await this.awardXP(userId, XP_REWARDS.PROMPT_USED, 'prompt_used', {
      promptId,
      promptTitle,
    });
  }
  
  /**
   * Track prompt favorited
   */
  async trackPromptFavorited(userId: string, promptId: string, promptTitle: string, favorited: boolean) {
    const db = await getDb();
    const userObjectId = new ObjectId(userId);
    
    await db.collection('user_stats').updateOne(
      { userId: userObjectId },
      {
        $inc: { favoritePrompts: favorited ? 1 : -1 },
        $set: { updatedAt: new Date() },
      }
    );
    
    if (favorited) {
      await this.awardXP(userId, XP_REWARDS.PROMPT_FAVORITED, 'prompt_favorited', {
        promptId,
        promptTitle,
      });
    }
  }
  
  /**
   * Track pattern learned
   */
  async trackPatternLearned(userId: string, patternName: string) {
    const db = await getDb();
    const userObjectId = new ObjectId(userId);
    
    await db.collection('user_stats').updateOne(
      { userId: userObjectId },
      {
        $inc: { patternsLearned: 1 },
        $set: { updatedAt: new Date() },
      }
    );
    
    await this.awardXP(userId, XP_REWARDS.PATTERN_LEARNED, 'pattern_learned', {
      promptTitle: patternName,
    });
  }
  
  /**
   * Update streak logic
   */
  private updateStreak(stats: UserStats): { currentStreak: number; longestStreak: number } {
    const now = new Date();
    const lastActivity = stats.lastActivityDate;
    
    if (!lastActivity) {
      // First activity ever
      return { currentStreak: 1, longestStreak: 1 };
    }
    
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceLastActivity < 24) {
      // Same day or within 24h - keep streak
      return { currentStreak: stats.currentStreak, longestStreak: stats.longestStreak };
    } else if (hoursSinceLastActivity < 48) {
      // Next day - increment streak
      const newStreak = stats.currentStreak + 1;
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, stats.longestStreak),
      };
    } else {
      // Streak broken - reset to 1
      return {
        currentStreak: 1,
        longestStreak: stats.longestStreak,
      };
    }
  }
  
  /**
   * Get XP needed for next level
   */
  getXPForNextLevel(currentLevel: number): number {
    return getXPForLevel(currentLevel);
  }
}

export const gamificationService = new GamificationService();
