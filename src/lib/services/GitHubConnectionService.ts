/**
 * GitHub Connection Service
 * Manages user GitHub connections and tokens
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';

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
    super('github_connections');
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

    if (existing) {
      // Update existing connection
      await this.update(existing._id!.toString(), connection);
      return { ...connection, _id: existing._id };
    } else {
      // Create new connection
      return this.create(connection);
    }
  }

  /**
   * Get user's GitHub connection
   */
  async getConnection(userId: string): Promise<GitHubConnection | null> {
    const db = await this.getDb();
    const connection = await db.collection(this.collectionName)
      .findOne({ userId });

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
    const db = await this.getDb();
    await db.collection(this.collectionName).updateOne(
      { userId },
      { $set: { lastUsedAt: new Date() } }
    );
  }

  /**
   * Disconnect GitHub
   */
  async disconnect(userId: string): Promise<boolean> {
    const db = await this.getDb();
    const result = await db.collection(this.collectionName).deleteOne({ userId });
    return result.deletedCount > 0;
  }

  /**
   * Get all connections (admin)
   */
  async getAllConnections(): Promise<GitHubConnection[]> {
    const db = await this.getDb();
    const connections = await db.collection(this.collectionName)
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
    const db = await this.getDb();
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, lastWeek, lastMonth] = await Promise.all([
      db.collection(this.collectionName).countDocuments({}),
      db.collection(this.collectionName).countDocuments({
        lastUsedAt: { $gte: weekAgo },
      }),
      db.collection(this.collectionName).countDocuments({
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
