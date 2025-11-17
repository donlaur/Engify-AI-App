/**
 * API Usage Notification Service
 *
 * Handles sending notifications for API usage alerts with:
 * - Rate limiting (max 1 notification per threshold per day)
 * - Multiple notification channels (Email, SMS)
 * - User preferences
 * - Notification history tracking
 */

import { getDb } from '@/lib/mongodb';
import { sendApiKeyAlertEmail } from '@/lib/services/emailService';
import type { User } from '@/lib/types/user';
import type {
  NotificationHistory,
  ThresholdLevel,
  NotificationChannel,
} from '@/lib/db/models/NotificationHistory';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';

export interface NotificationContext {
  userId: string;
  keyId: string;
  keyName: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  alertType: 'usage_limit' | 'cost_threshold' | 'rate_limit' | 'error_rate';
  currentValue: number;
  threshold: number;
  period: 'daily' | 'weekly' | 'monthly';
  quota?: number; // Total quota/limit
}

export class ApiUsageNotificationService {
  private collectionName = 'notification_history';

  /**
   * Send notification if user preferences allow and rate limits permit
   */
  async sendNotification(
    user: User,
    context: NotificationContext
  ): Promise<void> {
    try {
      // Get user notification preferences (use defaults if not set)
      const preferences = user.apiNotificationPreferences || this.getDefaultPreferences();

      // Calculate percentage of quota used
      const percentage = context.quota
        ? Math.round((context.currentValue / context.quota) * 100)
        : 100;

      // Determine threshold level
      const thresholdLevel = this.determineThresholdLevel(percentage);

      // Check if user wants notifications for this threshold
      if (!this.shouldNotify(preferences, thresholdLevel, context.alertType)) {
        logger.info('ApiUsageNotificationService.sendNotification', {
          userId: context.userId,
          reason: 'user_preferences_disabled',
          thresholdLevel,
          alertType: context.alertType,
        });
        return;
      }

      // Check rate limiting (max 1 notification per threshold per day)
      const canSend = await this.checkRateLimit(
        context.userId,
        context.keyId,
        thresholdLevel
      );

      if (!canSend) {
        logger.info('ApiUsageNotificationService.sendNotification', {
          userId: context.userId,
          reason: 'rate_limited',
          thresholdLevel,
        });
        return;
      }

      // Send notifications based on enabled channels
      const promises: Promise<void>[] = [];

      if (preferences.emailEnabled) {
        promises.push(
          this.sendEmailNotification(user, context, thresholdLevel, percentage)
        );
      }

      if (preferences.smsEnabled && preferences.phoneNumber) {
        promises.push(
          this.sendSmsNotification(user, context, thresholdLevel, percentage)
        );
      }

      await Promise.allSettled(promises);
    } catch (error) {
      logger.apiError('ApiUsageNotificationService.sendNotification', error, {
        userId: context.userId,
        keyId: context.keyId,
      });
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    user: User,
    context: NotificationContext,
    thresholdLevel: ThresholdLevel,
    percentage: number
  ): Promise<void> {
    try {
      const db = await getDb();
      const collection = db.collection<NotificationHistory>(this.collectionName);

      const recipientEmail = user.email;

      // Get metric name for email
      const metricName = this.getMetricName(context.alertType);

      // Send email via SendGrid
      const result = await sendApiKeyAlertEmail(recipientEmail, {
        userName: user.name || 'User',
        keyName: context.keyName,
        provider: context.provider,
        metric: metricName as 'tokens' | 'cost' | 'requests',
        currentValue: context.currentValue,
        threshold: context.threshold,
        period: context.period,
        dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/settings/api-keys`,
      });

      // Record notification in history
      const notification: NotificationHistory = {
        userId: context.userId,
        keyId: context.keyId,
        channel: 'email',
        status: result.success ? 'sent' : 'failed',
        thresholdLevel,
        alertType: context.alertType,
        currentValue: context.currentValue,
        threshold: context.threshold,
        percentage,
        period: context.period,
        provider: context.provider,
        recipientEmail,
        messageId: result.messageId,
        errorMessage: result.error,
        sentAt: result.success ? new Date() : undefined,
        createdAt: new Date(),
        notificationDay: this.getTodayString(),
      };

      await collection.insertOne(notification);

      await auditLog({
        action: 'notification_sent',
        userId: context.userId,
        details: {
          channel: 'email',
          thresholdLevel,
          alertType: context.alertType,
          status: result.success ? 'sent' : 'failed',
        },
        severity: 'info',
      });
    } catch (error) {
      logger.apiError('ApiUsageNotificationService.sendEmailNotification', error, {
        userId: context.userId,
      });
      throw error;
    }
  }

  /**
   * Send SMS notification (placeholder for Twilio integration)
   */
  private async sendSmsNotification(
    user: User,
    context: NotificationContext,
    thresholdLevel: ThresholdLevel,
    percentage: number
  ): Promise<void> {
    try {
      const db = await getDb();
      const collection = db.collection<NotificationHistory>(this.collectionName);

      const phoneNumber = user.apiNotificationPreferences?.phoneNumber;

      if (!phoneNumber) {
        logger.info('ApiUsageNotificationService.sendSmsNotification', {
          userId: context.userId,
          reason: 'no_phone_number',
        });
        return;
      }

      // TODO: Implement Twilio SMS sending
      // For now, just record as pending
      const notification: NotificationHistory = {
        userId: context.userId,
        keyId: context.keyId,
        channel: 'sms',
        status: 'pending',
        thresholdLevel,
        alertType: context.alertType,
        currentValue: context.currentValue,
        threshold: context.threshold,
        percentage,
        period: context.period,
        provider: context.provider,
        recipientPhone: phoneNumber,
        createdAt: new Date(),
        notificationDay: this.getTodayString(),
      };

      await collection.insertOne(notification);

      await auditLog({
        action: 'notification_sent',
        userId: context.userId,
        details: {
          channel: 'sms',
          thresholdLevel,
          alertType: context.alertType,
          status: 'pending',
        },
        severity: 'info',
      });
    } catch (error) {
      logger.apiError('ApiUsageNotificationService.sendSmsNotification', error, {
        userId: context.userId,
      });
      throw error;
    }
  }

  /**
   * Check if we can send a notification (rate limiting)
   * Max 1 notification per threshold per day
   */
  private async checkRateLimit(
    userId: string,
    keyId: string,
    thresholdLevel: ThresholdLevel
  ): Promise<boolean> {
    try {
      const db = await getDb();
      const collection = db.collection<NotificationHistory>(this.collectionName);

      const today = this.getTodayString();

      // Check if we already sent a notification for this threshold today
      const existingNotification = await collection.findOne({
        userId,
        keyId,
        thresholdLevel,
        notificationDay: today,
        status: { $in: ['sent', 'pending'] },
      });

      return !existingNotification;
    } catch (error) {
      logger.apiError('ApiUsageNotificationService.checkRateLimit', error, {
        userId,
        keyId,
      });
      // Fail open - allow notification if there's an error checking rate limit
      return true;
    }
  }

  /**
   * Determine threshold level based on percentage
   */
  private determineThresholdLevel(percentage: number): ThresholdLevel {
    if (percentage >= 100) return 100;
    if (percentage >= 90) return 90;
    if (percentage >= 80) return 80;
    if (percentage >= 50) return 50;
    return 50; // Default to lowest threshold
  }

  /**
   * Check if user wants notifications for this threshold and alert type
   */
  private shouldNotify(
    preferences: NonNullable<User['apiNotificationPreferences']>,
    thresholdLevel: ThresholdLevel,
    alertType: string
  ): boolean {
    // Check threshold preference
    const thresholdEnabled = {
      50: preferences.thresholds.fifty,
      80: preferences.thresholds.eighty,
      90: preferences.thresholds.ninety,
      100: preferences.thresholds.hundred,
    }[thresholdLevel];

    if (!thresholdEnabled) return false;

    // Check alert type preference
    const alertTypeEnabled = {
      usage_limit: preferences.alertTypes.usageLimit,
      cost_threshold: preferences.alertTypes.costThreshold,
      rate_limit: preferences.alertTypes.rateLimit,
      error_rate: preferences.alertTypes.errorRate,
    }[alertType];

    return Boolean(alertTypeEnabled);
  }

  /**
   * Get today's date as YYYY-MM-DD string
   */
  private getTodayString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get metric name for email display
   */
  private getMetricName(alertType: string): string {
    const metricMap: Record<string, string> = {
      usage_limit: 'tokens',
      cost_threshold: 'cost',
      rate_limit: 'requests',
      error_rate: 'requests',
    };
    return metricMap[alertType] || 'usage';
  }

  /**
   * Get default notification preferences
   */
  private getDefaultPreferences(): NonNullable<User['apiNotificationPreferences']> {
    return {
      emailEnabled: true,
      smsEnabled: false,
      thresholds: {
        fifty: false,
        eighty: true,
        ninety: true,
        hundred: true,
      },
      alertTypes: {
        usageLimit: true,
        costThreshold: true,
        rateLimit: true,
        errorRate: true,
      },
    };
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(
    userId: string,
    limit: number = 50
  ): Promise<NotificationHistory[]> {
    const db = await getDb();
    const collection = db.collection<NotificationHistory>(this.collectionName);

    return collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(
    userId: string,
    days: number = 30
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    byChannel: Record<NotificationChannel, number>;
    byThreshold: Record<ThresholdLevel, number>;
  }> {
    const db = await getDb();
    const collection = db.collection<NotificationHistory>(this.collectionName);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const notifications = await collection
      .find({
        userId,
        createdAt: { $gte: startDate },
      })
      .toArray();

    const totalSent = notifications.filter((n) => n.status === 'sent').length;
    const totalFailed = notifications.filter((n) => n.status === 'failed').length;

    const byChannel: Record<NotificationChannel, number> = {
      email: 0,
      sms: 0,
    };

    const byThreshold: Record<ThresholdLevel, number> = {
      50: 0,
      80: 0,
      90: 0,
      100: 0,
    };

    notifications.forEach((n) => {
      byChannel[n.channel] = (byChannel[n.channel] || 0) + 1;
      byThreshold[n.thresholdLevel] = (byThreshold[n.thresholdLevel] || 0) + 1;
    });

    return {
      totalSent,
      totalFailed,
      byChannel,
      byThreshold,
    };
  }
}

export const apiUsageNotificationService = new ApiUsageNotificationService();
