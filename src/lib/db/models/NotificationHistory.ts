/**
 * Notification History Model
 *
 * Tracks all notifications sent to users for API usage alerts
 * Enables rate limiting and prevents notification spam
 */

import { ObjectId } from 'mongodb';

export type NotificationChannel = 'email' | 'sms';
export type NotificationStatus = 'sent' | 'failed' | 'pending';
export type ThresholdLevel = 50 | 80 | 90 | 100;

export interface NotificationHistory {
  _id?: ObjectId;
  userId: string;
  keyId: string;

  // Notification details
  channel: NotificationChannel;
  status: NotificationStatus;
  thresholdLevel: ThresholdLevel; // 50%, 80%, 90%, 100%

  // Alert context
  alertType: 'usage_limit' | 'cost_threshold' | 'rate_limit' | 'error_rate';
  currentValue: number;
  threshold: number;
  percentage: number; // Calculated percentage of quota used
  period: 'daily' | 'weekly' | 'monthly';

  // Provider context
  provider: 'openai' | 'anthropic' | 'google' | 'groq';

  // Delivery details
  recipientEmail?: string;
  recipientPhone?: string;
  messageId?: string; // SendGrid message ID
  errorMessage?: string;

  // Timestamps
  sentAt?: Date;
  createdAt: Date;

  // Rate limiting metadata
  notificationDay: string; // YYYY-MM-DD format for daily deduplication
}

export interface NotificationPreferences {
  userId: string;

  // Channel settings
  emailEnabled: boolean;
  smsEnabled: boolean;

  // Threshold settings
  thresholds: {
    fifty: boolean;   // 50% usage
    eighty: boolean;  // 80% usage
    ninety: boolean;  // 90% usage
    hundred: boolean; // 100% usage (exceeded)
  };

  // Alert type preferences
  alertTypes: {
    usageLimit: boolean;
    costThreshold: boolean;
    rateLimit: boolean;
    errorRate: boolean;
  };

  // Contact details
  email?: string; // Override user's primary email
  phoneNumber?: string; // For SMS notifications

  // Metadata
  updatedAt: Date;
  createdAt: Date;
}
