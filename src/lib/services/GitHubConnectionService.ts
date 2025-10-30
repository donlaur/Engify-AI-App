/**
 * GitHub Connection Service
 * Manages user GitHub connections and tokens
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

export interface GitHubConnection {
  _id?: ObjectId;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  username: string;
  email?: string;
  avatarUrl: string;
  scopes: string[];
  connectedAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

export class GitHubConnectionService extends BaseService<GitHubConnection> {
  constructor() {
    super(
      'github_connections',
      z.object({}) as unknown as z.ZodType<GitHubConnection>
    );
  }

  /**
   * Save GitHub connection
   */
  async saveConnection(
    userId: string,
    accessToken: string,
    userData: {
      username: string;
      email?: string;
      avatarUrl: string;
      scopes: string[];
    }
  ): Promise<GitHubConnection> {
    // Check if connection already exists
    const existing = await this.getConnection(userId);

    const connection: GitHubConnection = {
      userId,
      accessToken,
      username: userData.username,
      email: userData.email,
      avatarUrl: userData.avatarUrl,
      scopes: userData.scopes,
      connectedAt: existing?.connectedAt || new Date(),
      lastUsedAt: new Date(),
    };

    if (existing && existing._id) {
      // Update existing connection
      await this.updateOne(existing._id.toString(), connection);
      return { ...connection, _id: existing._id };
    } else if (existing) {
      // Fallback: recreate if id missing
      return this.create(connection);
    } else {
      // Create new connection
      return this.create(connection);
    }
  }

  /**
   * Get user's GitHub connection
   */
  async getConnection(userId: string): Promise<GitHubConnection | null> {
    const collection = await this.getCollection();
    const connection = await collection.findOne({ userId });

    return connection as GitHubConnection | null;
  }

  /**
   * Check if user has GitHub connected
   */
  async isConnected(userId: string): Promise<boolean> {
    const connection = await this.getConnection(userId);
    return connection !== null;
  }

  /**
   * Get access token
   */
  async getAccessToken(userId: string): Promise<string | null> {
    const connection = await this.getConnection(userId);

    if (connection) {
      // Update last used timestamp
      await this.updateLastUsed(userId);
      return connection.accessToken;
    }

    return null;
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(userId: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { userId },
      { $set: { lastUsedAt: new Date() } }
    );
  }

  /**
   * Disconnect GitHub
   */
  async disconnect(userId: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ userId });
    return result.deletedCount > 0;
  }

  /**
   * Get all connections (admin)
   */
  async getAllConnections(): Promise<GitHubConnection[]> {
    const collection = await this.getCollection();
    const connections = await collection
      .find({})
      .sort({ connectedAt: -1 })
      .toArray();

    return connections as GitHubConnection[];
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<{
    totalConnections: number;
    activeLastWeek: number;
    activeLastMonth: number;
  }> {
    const collection = await this.getCollection();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, lastWeek, lastMonth] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({
        lastUsedAt: { $gte: weekAgo },
      }),
      collection.countDocuments({
        lastUsedAt: { $gte: monthAgo },
      }),
    ]);

    return {
      totalConnections: total,
      activeLastWeek: lastWeek,
      activeLastMonth: lastMonth,
    };
  }
}

export const githubConnectionService = new GitHubConnectionService();
