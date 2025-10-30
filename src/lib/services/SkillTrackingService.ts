/**
 * Skill Tracking Service
 * Tracks user skill development through prompt usage
 */

import { BaseService } from './BaseService';
import { UserSkill, SkillCategory } from '@/lib/types/user';
import {
  getSkillsForPrompt,
  getSkillsForPattern,
} from '@/lib/constants/skills';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

export class SkillTrackingService extends BaseService<
  UserSkill & { _id?: ObjectId }
> {
  constructor() {
    super(
      'user_skills',
      z.object({}) as unknown as z.ZodType<UserSkill & { _id?: ObjectId }>
    );
  }

  /**
   * Track skill usage from prompt execution
   */
  async trackPromptSkills(
    userId: string,
    promptCategory: string
  ): Promise<void> {
    const skills = getSkillsForPrompt(promptCategory);

    for (const skill of skills) {
      await this.incrementSkill(userId, skill);
    }
  }

  /**
   * Track skill usage from pattern usage
   */
  async trackPatternSkills(userId: string, patternId: string): Promise<void> {
    const skills = getSkillsForPattern(patternId);

    for (const skill of skills) {
      await this.incrementSkill(userId, skill);
    }
  }

  /**
   * Increment skill count
   */
  private async incrementSkill(
    userId: string,
    skill: SkillCategory
  ): Promise<void> {
    const collection = await this.getCollection();

    await collection.updateOne(
      { userId, skill },
      {
        $inc: { count: 1 },
        $set: { lastUsed: new Date() },
        $setOnInsert: {
          userId,
          skill,
          improvement: 0,
        },
      },
      { upsert: true }
    );
  }

  /**
   * Get user's skill breakdown
   */
  async getUserSkills(userId: string): Promise<UserSkill[]> {
    const collection = await this.getCollection();
    const skills = await collection
      .find({ userId })
      .sort({ count: -1 })
      .toArray();

    return skills as UserSkill[];
  }

  /**
   * Get skill progress for a specific skill
   */
  async getSkillProgress(
    userId: string,
    skill: SkillCategory
  ): Promise<UserSkill | null> {
    const collection = await this.getCollection();
    const skillData = await collection.findOne({ userId, skill });

    return skillData as UserSkill | null;
  }

  /**
   * Calculate skill improvement percentage
   * Based on usage frequency and recency
   */
  async calculateSkillImprovement(
    userId: string,
    skill: SkillCategory
  ): Promise<number> {
    const skillData = await this.getSkillProgress(userId, skill);

    if (!skillData) return 0;

    // Simple calculation:
    // - Base improvement from count (max 50%)
    // - Recency bonus (max 50%)
    const countImprovement = Math.min(skillData.count * 2, 50);

    const daysSinceUse = skillData.lastUsed
      ? Math.floor(
          (Date.now() - skillData.lastUsed.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 999;

    const recencyBonus = Math.max(0, 50 - daysSinceUse);

    return Math.min(100, countImprovement + recencyBonus);
  }

  /**
   * Update skill improvement percentages
   */
  async updateSkillImprovements(userId: string): Promise<void> {
    const skills = await this.getUserSkills(userId);

    for (const skill of skills) {
      const improvement = await this.calculateSkillImprovement(
        userId,
        skill.skill
      );

      const collection = await this.getCollection();
      await collection.updateOne(
        { userId, skill: skill.skill },
        { $set: { improvement } }
      );
    }
  }

  /**
   * Get top skills for user
   */
  async getTopSkills(userId: string, limit: number = 5): Promise<UserSkill[]> {
    const collection = await this.getCollection();
    const skills = await collection
      .find({ userId })
      .sort({ improvement: -1, count: -1 })
      .limit(limit)
      .toArray();

    return skills as UserSkill[];
  }

  /**
   * Get skills developed this week
   */
  async getWeeklySkills(userId: string): Promise<UserSkill[]> {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const collection = await this.getCollection();
    const skills = await collection
      .find({
        userId,
        lastUsed: { $gte: weekAgo },
      })
      .sort({ count: -1 })
      .toArray();

    return skills as UserSkill[];
  }

  /**
   * Get skill statistics
   */
  async getSkillStats(userId: string): Promise<{
    totalSkills: number;
    activeSkills: number; // Used in last 30 days
    topSkill: SkillCategory | null;
    averageImprovement: number;
  }> {
    const skills = await this.getUserSkills(userId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const activeSkills = skills.filter(
      (s) => s.lastUsed && s.lastUsed >= thirtyDaysAgo
    );

    const topSkill = skills.length > 0 ? (skills[0]?.skill ?? null) : null;

    const averageImprovement =
      skills.length > 0
        ? skills.reduce((sum, s) => sum + s.improvement, 0) / skills.length
        : 0;

    return {
      totalSkills: skills.length,
      activeSkills: activeSkills.length,
      topSkill,
      averageImprovement: Math.round(averageImprovement),
    };
  }
}

export const skillTrackingService = new SkillTrackingService();
