/**
 * Team Service
 * Manages team relationships and manager access
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { userService } from './UserService';

export interface Team {
  _id?: ObjectId;
  name: string;
  managerId: string; // User ID of manager
  memberIds: string[]; // User IDs of team members
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: string;
  level?: string;
  joinedAt: Date;
}

export class TeamService extends BaseService<Team> {
  constructor() {
    super('teams', z.object({}) as unknown as z.ZodType<Team>);
  }

  /**
   * Create a new team
   */
  async createTeam(
    name: string,
    managerId: string,
    memberIds: string[] = []
  ): Promise<Team> {
    const team: Team = {
      name,
      managerId,
      memberIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await this.getCollection();
    const result = await collection.insertOne(team);

    return { ...team, _id: result.insertedId };
  }

  /**
   * Get teams managed by a user
   * SECURITY: This query is intentionally system-wide for manager lookup in auth context
   */
  async getTeamsByManager(managerId: string): Promise<Team[]> {
    const collection = await this.getCollection();
    const teams = await collection.find({ managerId }).toArray();

    return teams as Team[];
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const collection = await this.getCollection();
    const team = await collection.findOne({ _id: new ObjectId(teamId) });

    return team as Team | null;
  }

  /**
   * Add member to team
   */
  async addMember(teamId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(teamId) },
      {
        $addToSet: { memberIds: userId },
        $set: { updatedAt: new Date() },
      }
    );
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(teamId) },
      {
        $pull: { memberIds: userId },
        $set: { updatedAt: new Date() },
      }
    );
  }

  /**
   * Check if user is manager of team
   */
  async isManager(teamId: string, userId: string): Promise<boolean> {
    const team = await this.getTeamById(teamId);
    return team?.managerId === userId;
  }

  /**
   * Check if user is member of team
   */
  async isMember(teamId: string, userId: string): Promise<boolean> {
    const team = await this.getTeamById(teamId);
    return team?.memberIds.includes(userId) || false;
  }

  /**
   * Get all team members with details
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const team = await this.getTeamById(teamId);
    if (!team) return [];

    // Fetch users via service to avoid direct collection access
    const memberIds = team.memberIds;
    const users = await Promise.all(
      memberIds.map(async (id) => {
        try {
          return await userService.getUserById(id);
        } catch {
          return null;
        }
      })
    );

    const normalized = users.filter(
      (u): u is NonNullable<typeof u> => u != null
    );

    return normalized.map((user) => {
      return {
        userId: (user as { _id: { toString: () => string } })._id.toString(),
        name:
          (user as { name?: string; email: string }).name ||
          (user as { email: string }).email,
        email: (user as { email: string }).email,
        role: (user as { role?: string }).role || 'user',
        level: (user as { careerContext?: { level?: string } }).careerContext
          ?.level,
        joinedAt: (user as { createdAt?: Date }).createdAt || new Date(),
      };
    });
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string): Promise<{
    totalMembers: number;
    byLevel: Record<string, number>;
    byRole: Record<string, number>;
  }> {
    const members = await this.getTeamMembers(teamId);

    const byLevel: Record<string, number> = {};
    const byRole: Record<string, number> = {};

    members.forEach((member) => {
      if (member.level) {
        byLevel[member.level] = (byLevel[member.level] || 0) + 1;
      }
      if (member.role) {
        byRole[member.role] = (byRole[member.role] || 0) + 1;
      }
    });

    return {
      totalMembers: members.length,
      byLevel,
      byRole,
    };
  }
}

export const teamService = new TeamService();
