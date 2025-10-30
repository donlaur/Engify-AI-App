/**
 * Activity Service
 * Tracks user activity and interactions
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';

export interface Activity {
  _id?: ObjectId;
  userId: string;
  type: 'view' | 'use' | 'favorite' | 'share' | 'complete' | 'unlock';
  itemType: 'prompt' | 'pattern' | 'pathway' | 'workbench';
  itemId: string;
  timestamp: Date;
  metadata?: {
    duration?: number;
    success?: boolean;
    tokensUsed?: number;
    cost?: number;
    [key: string]: unknown;
  };
}

export class ActivityService extends BaseService<Activity> {
  constructor() {
    // BaseService expects a Zod schema. Provide a minimal placeholder schema via lazy import.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const schema = {} as unknown as import('zod').ZodSchema<Activity>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super('activities', schema as any);
  }

  /**
   * Track activity
   */
  async trackActivity(
    userId: string,
    type: Activity['type'],
    itemType: Activity['itemType'],
    itemId: string,
    metadata?: Activity['metadata']
  ): Promise<Activity> {
    const activity: Activity = {
      userId,
      type,
      itemType,
      itemId,
      timestamp: new Date(),
      metadata,
    };

    return this.create(activity);
  }

  /**
   * Get user activity history
   */
  async getUserActivity(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Activity[]> {
    const collection = await this.getCollection();
    const activities = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return activities as Activity[];
  }

  /**
   * Get activity by type
   */
  async getActivityByType(
    userId: string,
    type: Activity['type'],
    limit: number = 50
  ): Promise<Activity[]> {
    const collection = await this.getCollection();
    const activities = await collection
      .find({ userId, type })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return activities as Activity[];
  }

  /**
   * Get recently viewed items
   */
  async getRecentlyViewed(
    userId: string,
    itemType?: Activity['itemType'],
    limit: number = 10
  ): Promise<Activity[]> {
    const query: {
      userId: string;
      type: Activity['type'];
      itemType?: Activity['itemType'];
    } = { userId, type: 'view' };
    if (itemType) {
      query.itemType = itemType;
    }

    const collection = await this.getCollection();
    const activities = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return activities as Activity[];
  }

  /**
   * Get user stats
   */
  async getUserStats(userId: string): Promise<{
    totalActivities: number;
    byType: Record<string, number>;
    byItemType: Record<string, number>;
    recentActivity: Activity[];
  }> {
    const collection = await this.getCollection();
    const [totalActivities, byType, byItemType, recentActivity] =
      await Promise.all([
        collection.countDocuments({ userId }),

        collection
          .aggregate([
            { $match: { userId } },
            { $group: { _id: '$type', count: { $sum: 1 } } },
          ])
          .toArray(),

        collection
          .aggregate([
            { $match: { userId } },
            { $group: { _id: '$itemType', count: { $sum: 1 } } },
          ])
          .toArray(),

        this.getUserActivity(userId, 10),
      ]);

    type GroupDoc = { _id: string; count: number };
    const byTypeMap = (byType as GroupDoc[]).reduce(
      (acc: Record<string, number>, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const byItemTypeMap = (byItemType as GroupDoc[]).reduce(
      (acc: Record<string, number>, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalActivities,
      byType: byTypeMap,
      byItemType: byItemTypeMap,
      recentActivity,
    };
  }

  /**
   * Get popular items
   */
  async getPopularItems(
    itemType: Activity['itemType'],
    type: Activity['type'] = 'view',
    limit: number = 10
  ): Promise<Array<{ itemId: string; count: number }>> {
    const collection = await this.getCollection();
    const results = await collection
      .aggregate([
        { $match: { itemType, type } },
        {
          $group: {
            _id: '$itemId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
      ])
      .toArray();

    return results.map((r: unknown) => {
      const item = r as { _id: string; count: number };
      return {
        itemId: item._id,
        count: item.count,
      };
    });
  }
}

export const activityService = new ActivityService();
