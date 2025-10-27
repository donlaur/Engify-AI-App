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
    [key: string]: any;
  };
}

export class ActivityService extends BaseService<Activity> {
  constructor() {
    super('activities');
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
    const activities = await this.collection
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
    const activities = await this.collection
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
    const query: any = { userId, type: 'view' };
    if (itemType) {
      query.itemType = itemType;
    }

    const activities = await this.collection
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
    const [totalActivities, byType, byItemType, recentActivity] = await Promise.all([
      this.collection.countDocuments({ userId }),
      
      this.collection
        .aggregate([
          { $match: { userId } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ])
        .toArray(),
      
      this.collection
        .aggregate([
          { $match: { userId } },
          { $group: { _id: '$itemType', count: { $sum: 1 } } },
        ])
        .toArray(),
      
      this.getUserActivity(userId, 10),
    ]);

    return {
      totalActivities,
      byType: byType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byItemType: byItemType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
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
    const results = await this.collection
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

    return results.map((r: any) => ({
      itemId: r._id,
      count: r.count,
    }));
  }
}

export const activityService = new ActivityService();
