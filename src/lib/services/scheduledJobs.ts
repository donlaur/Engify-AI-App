/**
 * Scheduled Jobs Service
 *
 * Uses QStash for scheduled/periodic tasks:
 * - Daily/weekly/monthly usage reports
 * - Analytics aggregation
 * - Cleanup tasks
 * - Email digests
 */

import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';
import { _apiKeyUsageService } from './ApiKeyUsageService';
import { _sendEmail } from './emailService';
import { _SendGridTemplateBuilders } from './sendgridTemplates';
import { _getDb } from '@/lib/mongodb';

export interface ScheduledJob {
  id: string;
  name: string;
  schedule: string; // Cron expression or ISO duration
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export class ScheduledJobsService {
  private queue: QStashMessageQueue;
  private baseUrl: string;

  constructor() {
    this.queue = new QStashMessageQueue('scheduled-jobs', 'redis');
    this.baseUrl =
      process.env.QSTASH_WEBHOOK_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';
  }

  /**
   * Schedule a job using QStash
   * QStash supports cron-like scheduling via API
   */
  async scheduleJob(
    jobName: string,
    schedule: string, // Cron: "0 9 * * *" or Duration: "PT1H"
    payload: unknown,
    endpoint: string
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const _fullUrl = `${this.baseUrl}${endpoint}`;

      // QStash supports scheduled messages via delay or cron
      // Using QStash publish with delay for now
      // Full cron support requires QStash API v2 scheduling

      await this.queue.publish({
        id: `job-${jobName}-${Date.now()}`,
        type: 'scheduled-job',
        payload: {
          jobName,
          schedule,
          ...(typeof payload === 'object' ? payload : { data: payload }),
        },
        timestamp: Date.now(),
        priority: 'normal',
      });

      return {
        success: true,
        jobId: `job-${jobName}-${Date.now()}`,
      };
    } catch (error) {
      console.error(`Error scheduling job ${jobName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Schedule daily usage report aggregation
   */
  async scheduleDailyUsageReport(): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.scheduleJob(
      'daily-usage-report',
      '0 1 * * *', // Daily at 1 AM
      {},
      '/api/jobs/daily-usage-report'
    );
  }

  /**
   * Schedule weekly usage digest emails
   */
  async scheduleWeeklyDigest(): Promise<{ success: boolean; error?: string }> {
    return this.scheduleJob(
      'weekly-digest',
      '0 9 * * 1', // Every Monday at 9 AM
      {},
      '/api/jobs/weekly-digest'
    );
  }

  /**
   * Schedule monthly analytics aggregation
   */
  async scheduleMonthlyAnalytics(): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.scheduleJob(
      'monthly-analytics',
      '0 2 1 * *', // First day of month at 2 AM
      {},
      '/api/jobs/monthly-analytics'
    );
  }

  /**
   * Schedule cleanup tasks (expired codes, old logs, etc.)
   */
  async scheduleCleanupTasks(): Promise<{ success: boolean; error?: string }> {
    return this.scheduleJob(
      'cleanup-tasks',
      '0 3 * * *', // Daily at 3 AM
      {},
      '/api/jobs/cleanup'
    );
  }

  /**
   * Schedule API key usage alerts check
   */
  async scheduleUsageAlertsCheck(): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.scheduleJob(
      'usage-alerts-check',
      '0 * * * *', // Every hour
      {},
      '/api/jobs/check-usage-alerts'
    );
  }
}

export const scheduledJobsService = new ScheduledJobsService();
