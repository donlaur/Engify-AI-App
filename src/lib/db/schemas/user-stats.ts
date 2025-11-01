/**
 * User Stats Schema
 * 
 * Tracks gamification data: XP, levels, streaks, activity
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const UserStatsSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.instanceof(ObjectId),
  
  // Gamification
  xp: z.number().min(0).default(0),
  level: z.number().min(1).default(1),
  
  // Activity counters
  promptsUsed: z.number().min(0).default(0),
  favoritePrompts: z.number().min(0).default(0),
  patternsLearned: z.number().min(0).default(0),
  
  // Streak tracking
  currentStreak: z.number().min(0).default(0),
  longestStreak: z.number().min(0).default(0),
  lastActivityDate: z.date().optional(),
  
  // Activity history (last 10 actions)
  recentActivity: z.array(z.object({
    type: z.enum(['prompt_used', 'pattern_learned', 'prompt_favorited', 'challenge_completed']),
    promptId: z.string().optional(),
    promptTitle: z.string().optional(),
    xpEarned: z.number(),
    timestamp: z.date(),
  })).default([]),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

/**
 * XP required for each level (exponential growth)
 */
export function getXPForLevel(level: number): number {
  return Math.floor(500 * Math.pow(1.5, level - 1));
}

/**
 * Calculate level from total XP
 */
export function getLevelFromXP(xp: number): number {
  let level = 1;
  let xpRequired = 0;
  
  while (xp >= xpRequired + getXPForLevel(level)) {
    xpRequired += getXPForLevel(level);
    level++;
  }
  
  return level;
}

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  PROMPT_USED: 10,
  PATTERN_LEARNED: 25,
  PROMPT_FAVORITED: 5,
  CHALLENGE_COMPLETED: 100,
  DAILY_LOGIN: 5,
} as const;

