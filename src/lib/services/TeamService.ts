/**
 * Team Service
 * Manages team relationships and manager access
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';

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
    super('teams');
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

    const db = await this.getDb();
    const result = await db.collection(this.collectionName).insertOne(team);
    
    return { ...team, _id: result.insertedId };
  }

  /**
   * Get teams managed by a user
   */
  async getTeamsByManager(managerId: string): Promise<Team[]> {
    const db = await this.getDb();
    const teams = await db.collection(this.collectionName)
      .find({ managerId })
      .toArray();

    return teams as Team[];
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId: string): Promise<Team | null> {
    const db = await this.getDb();
    const team = await db.collection(this.collectionName)
      .findOne({ _id: new ObjectId(teamId) });

    return team as Team | null;
  }

  /**
   * Add member to team
   */
  async addMember(teamId: string, userId: string): Promise<void> {
    const db = await this.getDb();
    await db.collection(this.collectionName).updateOne(
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
    const db = await this.getDb();
    await db.collection(this.collectionName).updateOne(
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

    const db = await this.getDb();
    const users = await db.collection('users')
      .find({ _id: { $in: team.memberIds.map(id => new ObjectId(id)) } })
      .toArray();

    return users.map(user => ({
      userId: user._id.toString(),
      name: user.name || user.email,
      email: user.email,
      role: user.role,
      level: user.careerContext?.level,
      joinedAt: user.createdAt,
    }));
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

    members.forEach(member => {
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
