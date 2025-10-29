/**
 * Usage Alerts Check Job
 *
 * Checks API key usage against thresholds and sends alerts
 * POST /api/jobs/check-usage-alerts
 *
 * Called by QStash scheduled job (hourly)
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import { getDb } from '@/lib/mongodb';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';
import { sendApiKeyAlertEmail } from '@/lib/services/emailService';
import { type ApiKeyAlertTemplateData } from '@/lib/services/sendgridTemplates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const db = await getDb();

    // Get all active alerts
    // Note: This is a system-wide scheduled job that checks all users' alerts
    // Each alert is user-scoped (has userId), so no organizationId filter needed
    // SECURITY: This query is intentionally system-wide - scheduled job processes alerts for all users
    const alertsCollection = db.collection('api_key_usage_alerts');
    // api_key_usage_alerts is NOT a multi-tenant collection - it's user-scoped (each document has userId)
    const activeAlerts = await alertsCollection
      .find({ isActive: true })
      .toArray();

    const alertsTriggered = [];

    for (const alert of activeAlerts) {
      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;
      const endDate: Date = now;

      if (alert.period === 'daily') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (alert.period === 'weekly') {
        const daysSinceMonday = now.getDay() === 0 ? 6 : now.getDay() - 1;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysSinceMonday);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get usage summary for the alert period
      const summary = await apiKeyUsageService.getUsageSummary(alert.userId, {
        keyId: alert.keyId,
        provider: alert.provider,
        period: alert.period,
        startDate,
        endDate,
      });

      // Get current value based on metric
      let currentValue = 0;
      if (alert.metric === 'tokens') {
        currentValue = summary.totalTokens;
      } else if (alert.metric === 'cost') {
        currentValue = summary.totalCost;
      } else if (alert.metric === 'requests') {
        currentValue = summary.totalRequests;
      }

      // Check if threshold exceeded
      if (currentValue >= alert.threshold) {
        // Get user email
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: alert.userId });

        if (user?.email) {
          // Get API key name if keyId provided
          let keyName = 'API Key';
          if (alert.keyId) {
            const apiKeysCollection = db.collection('api_keys');
            const apiKey = await apiKeysCollection.findOne({
              _id: alert.keyId,
            });
            keyName = apiKey?.keyName || 'API Key';
          }

          // Validate user.email exists and has '@' before split
          if (!user.email || !user.email.includes('@')) {
            continue; // Skip if email is invalid
          }

          // Send alert email
          // Safe split: emailParts is guaranteed to have at least one element after split('@')
          const emailParts = user.email.split('@');
          const userName =
            user.name || (emailParts.length > 0 ? emailParts[0] : 'User');
          const alertData: ApiKeyAlertTemplateData = {
            userName,
            keyName,
            provider: alert.provider || 'unknown',
            metric: alert.metric,
            currentValue,
            threshold: alert.threshold,
            period: alert.period,
            dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/settings/api-keys?tab=usage`,
          };

          await sendApiKeyAlertEmail(user.email, alertData);

          // Update alert last triggered time
          await alertsCollection.updateOne(
            { _id: alert._id },
            { $set: { lastTriggeredAt: new Date() } }
          );

          alertsTriggered.push({
            userId: alert.userId,
            keyId: alert.keyId,
            metric: alert.metric,
            currentValue,
            threshold: alert.threshold,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usage alerts checked',
      totalAlerts: activeAlerts.length,
      alertsTriggered: alertsTriggered.length,
    });
  } catch (error) {
    logger.apiError('/api/jobs/check-usage-alerts', error, {
      method: 'POST',
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
