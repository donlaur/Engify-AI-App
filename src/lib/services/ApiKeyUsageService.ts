/**
 * API Key Usage Tracking Service
 *
 * Tracks usage metrics for API keys including:
 * - Token consumption per provider
 * - Request counts and frequencies
 * - Cost attribution
 * - Rate limiting enforcement
 * - Usage alerts and reporting
 */

import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';

export interface ApiKeyUsage {
  _id?: string;
  userId: string;
  keyId: string;
  provider: 'openai' | 'anthropic' | 'google' | 'groq';
  timestamp: Date;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost: {
    input: number; // USD
    output: number; // USD
    total: number; // USD
  };
  model: string;
  requestId?: string;
  responseTime?: number; // milliseconds
  status: 'success' | 'error' | 'rate_limited';
  errorType?: string;
}

export interface UsageSummary {
  userId: string;
  keyId?: string;
  provider?: 'openai' | 'anthropic' | 'google' | 'groq';
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  errorCount: number;
  rateLimitHits: number;
}

export interface UsageAlert {
  userId: string;
  keyId?: string;
  alertType: 'usage_limit' | 'cost_threshold' | 'rate_limit' | 'error_rate';
  threshold: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  notified: boolean;
  notifiedAt?: Date;
}

export class ApiKeyUsageService {
  private collectionName = 'api_key_usage';
  private alertsCollectionName = 'usage_alerts';

  /**
   * Record API key usage
   */
  async recordUsage(
    userId: string,
    keyId: string,
    provider: 'openai' | 'anthropic' | 'google' | 'groq',
    usage: {
      tokensUsed: { prompt: number; completion: number; total: number };
      cost: { input: number; output: number; total: number };
      model: string;
      requestId?: string;
      responseTime?: number;
      status: 'success' | 'error' | 'rate_limited';
      errorType?: string;
    }
  ): Promise<string> {
    const db = await getDb();
    const collection = db.collection<ApiKeyUsage>(this.collectionName);

    const usageDoc: ApiKeyUsage = {
      userId,
      keyId,
      provider,
      timestamp: new Date(),
      tokensUsed: usage.tokensUsed,
      cost: usage.cost,
      model: usage.model,
      requestId: usage.requestId,
      responseTime: usage.responseTime,
      status: usage.status,
      errorType: usage.errorType,
    };

    const result = await collection.insertOne(usageDoc);

    // Check for alerts asynchronously (don't block)
    this.checkAlerts(userId, keyId, provider).catch((error) => {
      logger.apiError('ApiKeyUsageService.checkAlerts', error, {
        userId,
        keyId,
        provider,
      });
    });

    return result.insertedId.toString();
  }

  /**
   * Get usage summary for a time period
   */
  async getUsageSummary(
    userId: string,
    options: {
      keyId?: string;
      provider?: 'openai' | 'anthropic' | 'google' | 'groq';
      period: 'daily' | 'weekly' | 'monthly';
      startDate: Date;
      endDate: Date;
    }
  ): Promise<UsageSummary> {
    const db = await getDb();
    const collection = db.collection<ApiKeyUsage>(this.collectionName);

    const query: {
      userId: string;
      keyId?: string;
      provider?: 'openai' | 'anthropic' | 'google' | 'groq';
      timestamp: { $gte: Date; $lte: Date };
    } = {
      userId,
      timestamp: {
        $gte: options.startDate,
        $lte: options.endDate,
      },
    };

    if (options.keyId) {
      query.keyId = options.keyId;
    }

    if (options.provider) {
      query.provider = options.provider;
    }

    const usage = await collection.find(query).toArray();

    const totalRequests = usage.length;
    const totalTokens = usage.reduce((sum, u) => sum + u.tokensUsed.total, 0);
    const totalCost = usage.reduce((sum, u) => sum + u.cost.total, 0);
    const responseTimes = usage
      .filter((u) => u.responseTime !== undefined)
      .map((u) => u.responseTime as number);
    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length
        : 0;
    const successCount = usage.filter((u) => u.status === 'success').length;
    const successRate = totalRequests > 0 ? successCount / totalRequests : 0;
    const errorCount = usage.filter((u) => u.status === 'error').length;
    const rateLimitHits = usage.filter(
      (u) => u.status === 'rate_limited'
    ).length;

    return {
      userId,
      keyId: options.keyId,
      provider: options.provider,
      period: options.period,
      startDate: options.startDate,
      endDate: options.endDate,
      totalRequests,
      totalTokens,
      totalCost,
      averageResponseTime,
      successRate,
      errorCount,
      rateLimitHits,
    };
  }

  /**
   * Get monthly usage for current month
   */
  async getCurrentMonthUsage(
    userId: string,
    keyId?: string
  ): Promise<UsageSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    return this.getUsageSummary(userId, {
      keyId,
      period: 'monthly',
      startDate: startOfMonth,
      endDate: endOfMonth,
    });
  }

  /**
   * Get daily usage for last N days
   */
  async getDailyUsage(
    userId: string,
    days: number = 30,
    keyId?: string
  ): Promise<UsageSummary[]> {
    const summaries: UsageSummary[] = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const summary = await this.getUsageSummary(userId, {
        keyId,
        period: 'daily',
        startDate: startOfDay,
        endDate: endOfDay,
      });

      summaries.push(summary);
    }

    return summaries.reverse(); // Oldest first
  }

  /**
   * Set usage alert
   */
  async setAlert(
    userId: string,
    alert: {
      keyId?: string;
      alertType: 'usage_limit' | 'cost_threshold' | 'rate_limit' | 'error_rate';
      threshold: number;
      period: 'daily' | 'weekly' | 'monthly';
    }
  ): Promise<string> {
    const db = await getDb();
    const collection = db.collection<UsageAlert>(this.alertsCollectionName);

    const alertDoc: UsageAlert = {
      userId,
      keyId: alert.keyId,
      alertType: alert.alertType,
      threshold: alert.threshold,
      currentValue: 0,
      period: alert.period,
      notified: false,
    };

    const result = await collection.insertOne(alertDoc);

    await auditLog({
      action: 'usage_alert_created',
      userId,
      details: { alertId: result.insertedId.toString(), ...alert },
      severity: 'info',
    });

    return result.insertedId.toString();
  }

  /**
   * Check alerts and trigger notifications
   */
  private async checkAlerts(
    userId: string,
    keyId: string,
    _provider: 'openai' | 'anthropic' | 'google' | 'groq'
  ): Promise<void> {
    const db = await getDb();
    const alertsCollection = db.collection<UsageAlert>(
      this.alertsCollectionName
    );
    const usageCollection = db.collection<ApiKeyUsage>(this.collectionName);

    // Get active alerts for this user/key
    const alerts = await alertsCollection
      .find({
        userId,
        keyId: keyId || { $exists: false },
        notified: false,
      })
      .toArray();

    for (const alert of alerts) {
      let currentValue = 0;
      const now = new Date();
      let startDate: Date;
      const endDate = now;

      // Calculate period start date
      if (alert.period === 'daily') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (alert.period === 'weekly') {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get current value based on alert type
      const query: {
        userId: string;
        keyId?: string;
        timestamp: { $gte: Date; $lte: Date };
      } = {
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      };

      if (alert.keyId) {
        query.keyId = alert.keyId;
      }

      if (alert.alertType === 'usage_limit') {
        const usage = await usageCollection.find(query).toArray();
        currentValue = usage.reduce((sum, u) => sum + u.tokensUsed.total, 0);
      } else if (alert.alertType === 'cost_threshold') {
        const usage = await usageCollection.find(query).toArray();
        currentValue = usage.reduce((sum, u) => sum + u.cost.total, 0);
      } else if (alert.alertType === 'rate_limit') {
        const recentUsage = await usageCollection
          .find({
            ...query,
            timestamp: { $gte: new Date(now.getTime() - 60 * 60 * 1000) }, // Last hour
          })
          .toArray();
        currentValue = recentUsage.filter(
          (u) => u.status === 'rate_limited'
        ).length;
      } else if (alert.alertType === 'error_rate') {
        const usage = await usageCollection.find(query).toArray();
        if (usage.length > 0) {
          const errorCount = usage.filter((u) => u.status === 'error').length;
          currentValue = (errorCount / usage.length) * 100; // percentage
        }
      }

      // Update alert with current value
      await alertsCollection.updateOne(
        { _id: alert._id },
        { $set: { currentValue } }
      );

      // Check if threshold exceeded
      if (currentValue >= alert.threshold) {
        // TODO: Send notification (email/SMS via SendGrid/Twilio)
        await alertsCollection.updateOne(
          { _id: alert._id },
          {
            $set: {
              notified: true,
              notifiedAt: new Date(),
            },
          }
        );

        await auditLog({
          action: 'usage_alert_triggered',
          userId,
          details: {
            alertId: alert._id?.toString(),
            alertType: alert.alertType,
            threshold: alert.threshold,
            currentValue,
          },
          severity: 'warning',
        });
      }
    }
  }

  /**
   * Get all alerts for a user
   */
  async getAlerts(userId: string, keyId?: string): Promise<UsageAlert[]> {
    const db = await getDb();
    const collection = db.collection<UsageAlert>(this.alertsCollectionName);

    const query: { userId: string; keyId?: string } = { userId };
    if (keyId) {
      query.keyId = keyId;
    }

    return collection.find(query).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Delete an alert
   */
  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const db = await getDb();
    const collection = db.collection<UsageAlert>(this.alertsCollectionName);

    await collection.deleteOne({ _id: new ObjectId(alertId), userId });

    await auditLog({
      action: 'usage_alert_deleted',
      userId,
      details: { alertId },
      severity: 'info',
    });
  }

  /**
   * Get top providers by usage (for analytics)
   */
  async getTopProvidersByUsage(
    userId: string,
    limit: number = 5
  ): Promise<
    Array<{
      provider: string;
      totalTokens: number;
      totalCost: number;
      requestCount: number;
    }>
  > {
    const db = await getDb();
    const collection = db.collection<ApiKeyUsage>(this.collectionName);

    // Aggregation pipeline to group by provider
    const pipeline = [
      { $match: { userId } },
      {
        $group: {
          _id: '$provider',
          totalTokens: { $sum: '$tokensUsed.total' },
          totalCost: { $sum: '$cost.total' },
          requestCount: { $sum: 1 },
        },
      },
      { $sort: { totalCost: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          provider: '$_id',
          totalTokens: 1,
          totalCost: 1,
          requestCount: 1,
        },
      },
    ];

    return collection.aggregate(pipeline).toArray() as Promise<
      Array<{
        provider: string;
        totalTokens: number;
        totalCost: number;
        requestCount: number;
      }>
    >;
  }
}

export const apiKeyUsageService = new ApiKeyUsageService();
