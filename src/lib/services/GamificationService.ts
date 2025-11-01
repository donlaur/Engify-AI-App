/**
 * Gamification Service
 * Manages XP, levels, achievements, and streaks
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import {
  XP_REWARDS,
  getLevelFromXP,
  getXPForNextLevel,
} from '@/lib/gamification/levels';
import { ACHIEVEMENTS, Achievement } from '@/lib/gamification/achievements';
import { notificationService } from './NotificationService';

export interface UserGamification {
  _id?: ObjectId;
  userId: string;
  xp: number;
  level: number;
  achievements: string[]; // Achievement IDs
  dailyStreak: number;
  lastActiveDate: Date;
  stats: {
    promptsUsed: number;
    patternsCompleted: number;
    skillsTracked: number;
    skillsMastered: number;
    timeSaved: number; // hours
    promptsShared: number;
    favoritesReceived: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class GamificationService extends BaseService<UserGamification> {
  constructor() {
    super(
      'user_gamification',
      z.object({}) as unknown as z.ZodType<UserGamification>
    );
  }

  /**
   * Get or create user gamification data
   */
  async getUserGamification(userId: string): Promise<UserGamification> {
    const collection = await this.getCollection();
    let gamification = (await collection.findOne({
      userId,
    })) as UserGamification | null;

    if (!gamification) {
      gamification = {
        userId,
        xp: 0,
        level: 1,
        achievements: [],
        dailyStreak: 0,
        lastActiveDate: new Date(),
        stats: {
          promptsUsed: 0,
          patternsCompleted: 0,
          skillsTracked: 0,
          skillsMastered: 0,
          timeSaved: 0,
          promptsShared: 0,
          favoritesReceived: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await collection.insertOne(gamification);
    }

    return gamification;
  }

  /**
   * Award XP and check for level ups
   */
  async awardXP(
    userId: string,
    amount: number,
    _reason: string
  ): Promise<{
    newXP: number;
    leveledUp: boolean;
    newLevel?: number;
    achievementsUnlocked: Achievement[];
  }> {
    const gamification = await this.getUserGamification(userId);
    const oldLevel = getLevelFromXP(gamification.xp);
    const newXP = gamification.xp + amount;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel.level > oldLevel.level;

    // Update XP
    const collection = await this.getCollection();
    await collection.updateOne(
      { userId },
      {
        $set: {
          xp: newXP,
          level: newLevel.level,
          updatedAt: new Date(),
        },
      }
    );

    // Check for achievements
    const achievementsUnlocked = await this.checkAchievements(userId);

    // Send level up notification
    if (leveledUp) {
      await notificationService.sendAchievement(
        userId,
        `Level ${newLevel.level} Unlocked! 🎉`,
        `You're now a ${newLevel.name}! ${newLevel.rewards.join(', ')}`,
        '🎉'
      );
    }

    return {
      newXP,
      leveledUp,
      newLevel: leveledUp ? newLevel.level : undefined,
      achievementsUnlocked,
    };
  }

  /**
   * Track prompt usage
   */
  async trackPromptUsage(userId: string): Promise<void> {
    const gamification = await this.getUserGamification(userId);
    const collection = await this.getCollection();

    // Update stats
    const newPromptsUsed = gamification.stats.promptsUsed + 1;
    await collection.updateOne(
      { userId },
      {
        $inc: {
          'stats.promptsUsed': 1,
          'stats.timeSaved': 0.033, // 2 minutes = 0.033 hours
        },
        $set: { updatedAt: new Date() },
      }
    );

    // Award XP
    let xpToAward = XP_REWARDS.PROMPT_USED;

    // First prompt of the day bonus
    if (await this.isFirstActionToday(userId)) {
      xpToAward += XP_REWARDS.FIRST_PROMPT_OF_DAY;
      await this.updateDailyStreak(userId);
    }

    // Milestone bonuses
    if (newPromptsUsed === 10) {
      xpToAward += XP_REWARDS.FIRST_10_PROMPTS;
    } else if (newPromptsUsed === 50) {
      xpToAward += XP_REWARDS.FIRST_50_PROMPTS;
    } else if (newPromptsUsed === 100) {
      xpToAward += XP_REWARDS.FIRST_100_PROMPTS;
    }

    await this.awardXP(userId, xpToAward, 'Prompt used');
  }

  /**
   * Track pattern completion
   */
  async trackPatternCompletion(
    userId: string,
    patternId: string
  ): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { userId },
      {
        $inc: { 'stats.patternsCompleted': 1 },
        $set: { updatedAt: new Date() },
      }
    );

    await this.awardXP(
      userId,
      XP_REWARDS.PATTERN_COMPLETED,
      `Completed ${patternId} pattern`
    );
  }

  /**
   * Track skill development
   */
  async trackSkillDevelopment(
    userId: string,
    skillMastered: boolean = false
  ): Promise<void> {
    const collection = await this.getCollection();
    const update: { $inc: Record<string, number>; $set: { updatedAt: Date } } =
      {
        $inc: { 'stats.skillsTracked': 1 },
        $set: { updatedAt: new Date() },
      };

    if (skillMastered) {
      update.$inc['stats.skillsMastered'] = 1;
    }

    await collection.updateOne({ userId }, update);

    const xp = skillMastered
      ? XP_REWARDS.FIRST_SKILL_MASTERED
      : XP_REWARDS.SKILL_IMPROVED;
    await this.awardXP(
      userId,
      xp,
      skillMastered ? 'Skill mastered' : 'Skill improved'
    );
  }

  /**
   * Update daily streak
   */
  async updateDailyStreak(userId: string): Promise<number> {
    const gamification = await this.getUserGamification(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(gamification.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = gamification.dailyStreak;
    let xpBonus = 0;

    if (daysDiff === 1) {
      // Consecutive day
      newStreak += 1;
      xpBonus = XP_REWARDS.DAILY_STREAK_DAY;

      // Weekly streak bonus
      if (newStreak % 7 === 0) {
        xpBonus += XP_REWARDS.WEEKLY_STREAK;
      }

      // Monthly streak bonus
      if (newStreak % 30 === 0) {
        xpBonus += XP_REWARDS.MONTHLY_STREAK;
      }
    } else if (daysDiff > 1) {
      // Streak broken
      newStreak = 1;
    }

    const collection = await this.getCollection();
    await collection.updateOne(
      { userId },
      {
        $set: {
          dailyStreak: newStreak,
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (xpBonus > 0) {
      await this.awardXP(userId, xpBonus, `${newStreak}-day streak`);
    }

    return newStreak;
  }

  /**
   * Check if this is the first action today
   */
  async isFirstActionToday(userId: string): Promise<boolean> {
    const gamification = await this.getUserGamification(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(gamification.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    return today.getTime() !== lastActive.getTime();
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const gamification = await this.getUserGamification(userId);
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (gamification.achievements.includes(achievement.id)) {
        continue;
      }

      // Check requirement
      let unlocked = false;
      switch (achievement.requirement.type) {
        case 'prompts_used':
          unlocked =
            gamification.stats.promptsUsed >= achievement.requirement.target;
          break;
        case 'patterns_tried':
        case 'patterns_mastered':
          unlocked =
            gamification.stats.patternsCompleted >=
            achievement.requirement.target;
          break;
        case 'skills_tracked':
          unlocked =
            gamification.stats.skillsTracked >= achievement.requirement.target;
          break;
        case 'skills_mastered':
          unlocked =
            gamification.stats.skillsMastered >= achievement.requirement.target;
          break;
        case 'daily_streak':
          unlocked = gamification.dailyStreak >= achievement.requirement.target;
          break;
        case 'time_saved':
          unlocked =
            gamification.stats.timeSaved >= achievement.requirement.target;
          break;
        case 'level':
          unlocked = gamification.level >= achievement.requirement.target;
          break;
      }

      if (unlocked) {
        // Unlock achievement
        const collection = await this.getCollection();
        await collection.updateOne(
          { userId },
          {
            $push: { achievements: achievement.id },
            $set: { updatedAt: new Date() },
          }
        );

        // Award XP
        await this.awardXP(
          userId,
          achievement.xpReward,
          `Achievement: ${achievement.name}`
        );

        // Send notification
        await notificationService.sendAchievement(
          userId,
          `Achievement Unlocked: ${achievement.name}`,
          achievement.description,
          achievement.icon
        );

        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Get user's progress summary
   */
  async getProgressSummary(userId: string) {
    const gamification = await this.getUserGamification(userId);
    const currentLevel = getLevelFromXP(gamification.xp);
    const xpForNext = getXPForNextLevel(gamification.xp);

    return {
      xp: gamification.xp,
      level: currentLevel,
      xpForNextLevel: xpForNext,
      achievements: gamification.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
      dailyStreak: gamification.dailyStreak,
      stats: gamification.stats,
    };
  }
}

export const gamificationService = new GamificationService();
