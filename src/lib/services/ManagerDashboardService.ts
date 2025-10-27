/**
 * Manager Dashboard Service
 * Aggregates team data for manager view
 */

import { teamService } from './TeamService';
import { skillTrackingService } from './SkillTrackingService';
import { activityService } from './ActivityService';
import { SkillCategory } from '@/lib/types/user';

export interface TeamOverview {
  teamId: string;
  teamName: string;
  totalMembers: number;
  activeMembers: number; // Active in last 7 days
  promptsUsedThisWeek: number;
  timeSavedThisWeek: number; // hours
  topSkills: Array<{ skill: SkillCategory; count: number }>;
}

export interface MemberProgress {
  userId: string;
  name: string;
  email: string;
  level: string;
  promptsUsed: number;
  skillsImproving: SkillCategory[];
  promotionReadiness: number; // 0-100%
  lastActive: Date;
}

export interface TeamSkillMatrix {
  skill: SkillCategory;
  members: Array<{
    userId: string;
    name: string;
    proficiency: number; // 0-100%
  }>;
  averageProficiency: number;
}

export interface PromotionPipeline {
  level: string;
  candidates: Array<{
    userId: string;
    name: string;
    readiness: number; // 0-100%
    topGaps: string[];
  }>;
}

export class ManagerDashboardService {
  /**
   * Get team overview for manager
   */
  async getTeamOverview(managerId: string): Promise<TeamOverview[]> {
    const teams = await teamService.getTeamsByManager(managerId);
    
    const overviews = await Promise.all(
      teams.map(async (team) => {
        const members = await teamService.getTeamMembers(team._id!.toString());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Get activity for all team members
        const memberActivities = await Promise.all(
          members.map(m => activityService.getUserActivity(m.userId, 100, 0))
        );

        const recentActivities = memberActivities.flat().filter(
          a => a.timestamp >= weekAgo
        );

        const activeMembers = new Set(
          recentActivities.map(a => a.userId)
        ).size;

        const promptsUsed = recentActivities.filter(
          a => a.type === 'use'
        ).length;

        // Estimate time saved (2 min per prompt)
        const timeSaved = (promptsUsed * 2) / 60; // hours

        // Get top skills across team
        const allSkills = await Promise.all(
          members.map(m => skillTrackingService.getUserSkills(m.userId))
        );

        const skillCounts: Record<string, number> = {};
        allSkills.flat().forEach(skill => {
          skillCounts[skill.skill] = (skillCounts[skill.skill] || 0) + skill.count;
        });

        const topSkills = Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill: skill as SkillCategory, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        return {
          teamId: team._id!.toString(),
          teamName: team.name,
          totalMembers: members.length,
          activeMembers,
          promptsUsedThisWeek: promptsUsed,
          timeSavedThisWeek: Math.round(timeSaved * 10) / 10,
          topSkills,
        };
      })
    );

    return overviews;
  }

  /**
   * Get individual member progress
   */
  async getMemberProgress(teamId: string): Promise<MemberProgress[]> {
    const members = await teamService.getTeamMembers(teamId);

    const progress = await Promise.all(
      members.map(async (member) => {
        const activities = await activityService.getUserActivity(member.userId, 100, 0);
        const skills = await skillTrackingService.getUserSkills(member.userId);
        const skillStats = await skillTrackingService.getSkillStats(member.userId);

        const promptsUsed = activities.filter(a => a.type === 'use').length;
        
        const skillsImproving = skills
          .filter(s => s.improvement > 20)
          .map(s => s.skill)
          .slice(0, 3);

        const lastActivity = activities[0]?.timestamp || member.joinedAt;

        // Simple promotion readiness calculation
        const promotionReadiness = Math.min(100, skillStats.averageImprovement);

        return {
          userId: member.userId,
          name: member.name,
          email: member.email,
          level: member.level || 'mid',
          promptsUsed,
          skillsImproving,
          promotionReadiness,
          lastActive: lastActivity,
        };
      })
    );

    return progress.sort((a, b) => b.promotionReadiness - a.promotionReadiness);
  }

  /**
   * Get team skill matrix
   */
  async getTeamSkillMatrix(teamId: string): Promise<TeamSkillMatrix[]> {
    const members = await teamService.getTeamMembers(teamId);

    // Get all skills for all members
    const memberSkills = await Promise.all(
      members.map(async (member) => ({
        userId: member.userId,
        name: member.name,
        skills: await skillTrackingService.getUserSkills(member.userId),
      }))
    );

    // Get unique skills across team
    const allSkills = new Set<SkillCategory>();
    memberSkills.forEach(ms => {
      ms.skills.forEach(s => allSkills.add(s.skill));
    });

    // Build matrix
    const matrix: TeamSkillMatrix[] = Array.from(allSkills).map(skill => {
      const membersWithSkill = memberSkills.map(ms => {
        const skillData = ms.skills.find(s => s.skill === skill);
        return {
          userId: ms.userId,
          name: ms.name,
          proficiency: skillData?.improvement || 0,
        };
      });

      const averageProficiency = membersWithSkill.reduce(
        (sum, m) => sum + m.proficiency,
        0
      ) / membersWithSkill.length;

      return {
        skill,
        members: membersWithSkill.sort((a, b) => b.proficiency - a.proficiency),
        averageProficiency: Math.round(averageProficiency),
      };
    });

    return matrix.sort((a, b) => b.averageProficiency - a.averageProficiency);
  }

  /**
   * Get promotion pipeline
   */
  async getPromotionPipeline(teamId: string): Promise<PromotionPipeline[]> {
    const members = await teamService.getTeamMembers(teamId);

    // Group by current level
    const byLevel: Record<string, MemberProgress[]> = {};
    
    const progress = await this.getMemberProgress(teamId);
    
    progress.forEach(p => {
      if (!byLevel[p.level]) {
        byLevel[p.level] = [];
      }
      byLevel[p.level].push(p);
    });

    // Build pipeline
    const pipeline: PromotionPipeline[] = Object.entries(byLevel).map(([level, candidates]) => {
      // Filter to those ready for promotion (>70%)
      const readyCandidates = candidates
        .filter(c => c.promotionReadiness >= 70)
        .map(c => ({
          userId: c.userId,
          name: c.name,
          readiness: c.promotionReadiness,
          topGaps: c.skillsImproving.length < 3 
            ? ['Communication', 'Leadership', 'System Design'].slice(0, 3 - c.skillsImproving.length)
            : [],
        }))
        .sort((a, b) => b.readiness - a.readiness);

      return {
        level,
        candidates: readyCandidates,
      };
    });

    return pipeline.filter(p => p.candidates.length > 0);
  }

  /**
   * Get ROI report for team
   */
  async getTeamROI(teamId: string): Promise<{
    totalPrompts: number;
    totalTimeSaved: number; // hours
    costSavings: number; // dollars
    averagePerMember: number; // hours
  }> {
    const members = await teamService.getTeamMembers(teamId);

    const activities = await Promise.all(
      members.map(m => activityService.getUserActivity(m.userId, 1000, 0))
    );

    const allActivities = activities.flat();
    const totalPrompts = allActivities.filter(a => a.type === 'use').length;

    // Estimate: 2 minutes saved per prompt
    const totalTimeSaved = (totalPrompts * 2) / 60; // hours

    // Estimate: $100/hour average engineer cost
    const costSavings = totalTimeSaved * 100;

    const averagePerMember = members.length > 0 
      ? totalTimeSaved / members.length 
      : 0;

    return {
      totalPrompts,
      totalTimeSaved: Math.round(totalTimeSaved * 10) / 10,
      costSavings: Math.round(costSavings),
      averagePerMember: Math.round(averagePerMember * 10) / 10,
    };
  }
}

export const managerDashboardService = new ManagerDashboardService();
