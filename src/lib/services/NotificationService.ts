/**
 * Notification Service
 * Manages user notifications
 */

import { BaseService } from './BaseService';
import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  link?: string;
  metadata?: {
    icon?: string;
    actionLabel?: string;
    actionUrl?: string;
    [key: string]: any;
  };
}

export class NotificationService extends BaseService<Notification> {
  constructor() {
    super('notifications');
  }

  /**
   * Create notification
   */
  async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    link?: string,
    metadata?: Notification['metadata']
  ): Promise<Notification> {
    const notification: Notification = {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
      link,
      metadata,
    };

    return this.create(notification);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false,
    limit: number = 50
  ): Promise<Notification[]> {
    const query: any = { userId };
    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return notifications as Notification[];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(notificationId) },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.collection.updateMany(
      { userId, read: false },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return result.modifiedCount;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.collection.countDocuments({
      userId,
      read: false,
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      _id: new ObjectId(notificationId),
    });

    return result.deletedCount > 0;
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.collection.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true,
    });

    return result.deletedCount;
  }

  /**
   * Send achievement notification
   */
  async sendAchievement(
    userId: string,
    title: string,
    message: string,
    icon?: string
  ): Promise<Notification> {
    return this.createNotification(
      userId,
      'achievement',
      title,
      message,
      '/dashboard',
      { icon }
    );
  }

  /**
   * Send usage limit warning
   */
  async sendUsageLimitWarning(
    userId: string,
    percentage: number
  ): Promise<Notification> {
    return this.createNotification(
      userId,
      'warning',
      'Usage Limit Warning',
      `You've used ${percentage}% of your daily limit. Consider upgrading to Pro.`,
      '/pricing',
      {
        actionLabel: 'Upgrade Now',
        actionUrl: '/pricing',
      }
    );
  }

  /**
   * Send pattern unlock notification
   */
  async sendPatternUnlock(
    userId: string,
    patternName: string
  ): Promise<Notification> {
    return this.createNotification(
      userId,
      'success',
      'New Pattern Unlocked!',
      `You've unlocked the ${patternName} pattern. Try it now!`,
      `/patterns/${patternName.toLowerCase().replace(/\s+/g, '-')}`,
      {
        icon: '🎉',
        actionLabel: 'Try It Now',
      }
    );
  }
}

export const notificationService = new NotificationService();
