/**
 * Daily Usage Report Job
 *
 * Aggregates daily API key usage statistics
 * POST /api/jobs/daily-usage-report
 *
 * Called by QStash scheduled job
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';
import { getDb } from '@/lib/mongodb';
import { QStashMessageQueue } from '@/lib/messaging/queues/QStashMessageQueue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    // Verify this is from QStash (optional - add signature verification)
    const _queue = new QStashMessageQueue('scheduled-jobs', 'redis');

    // Get all users with API keys
    const db = await getDb();
    const apiKeysCollection = db.collection('api_keys');
    const users = await apiKeysCollection.distinct('userId');

    // Aggregate usage for each user
    const reports = [];
    for (const userId of users) {
      const summary = await apiKeyUsageService.getUsageSummary(userId, {
        period: 'daily',
      });

      if (summary.totalRequests > 0) {
        // ISO string always contains 'T', so split will always have at least 2 elements
        const isoString = new Date().toISOString();
        const dateParts = isoString.split('T');
        const date =
          dateParts.length >= 1 ? dateParts[0] : isoString.substring(0, 10);
        reports.push({
          userId,
          summary,
          date,
        });
      }
    }

    // Store aggregated report (optional - for historical tracking)
    const reportsCollection = db.collection('daily_usage_reports');
    // ISO string always contains 'T', so split will always have at least 2 elements
    const todayIsoString = new Date().toISOString();
    const todayDateParts = todayIsoString.split('T');
    const todayDate =
      todayDateParts.length >= 1
        ? todayDateParts[0]
        : todayIsoString.substring(0, 10);
    await reportsCollection.insertOne({
      date: todayDate,
      reports,
      aggregatedAt: new Date(),
      totalUsers: reports.length,
    });

    return NextResponse.json({
      success: true,
      message: 'Daily usage report aggregated',
      reportsProcessed: reports.length,
    });
  } catch (error) {
    logger.apiError('/api/jobs/daily-usage-report', error, {
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
