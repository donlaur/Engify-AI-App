/**
 * Monthly Analytics Aggregation Job
 *
 * Aggregates monthly API key usage, prompt usage, and user activity statistics
 * POST /api/jobs/monthly-analytics
 *
 * Called by QStash scheduled job (first day of month)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  try {
    const db = await getDb();

    // Get date range for last month
    const now = new Date();
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all users
    // SECURITY: This is a system-wide scheduled job - intentionally queries all users
    // System-wide scheduled job - aggregating analytics for ALL users is intentional
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();

    const monthlyReports = [];
    let totalTokens = 0;
    let totalRequests = 0;
    let totalCost = 0;
    let activeUsers = 0;

    // Aggregate usage for each user
    for (const user of users) {
      const summary = await apiKeyUsageService.getUsageSummary(
        user._id.toString(),
        {
          period: 'monthly',
          startDate: firstDayOfLastMonth,
          endDate: firstDayOfThisMonth,
        }
      );

      if (summary.totalRequests > 0) {
        activeUsers++;
        totalTokens += summary.totalTokens;
        totalRequests += summary.totalRequests;
        totalCost += summary.totalCost;

        monthlyReports.push({
          userId: user._id.toString(),
          userName: user.name || user.email,
          summary,
          month: firstDayOfLastMonth.toISOString().substring(0, 7), // YYYY-MM format
        });
      }
    }

    // Aggregate prompt usage
    const promptsCollection = db.collection('prompt_history');
    const promptStats = await promptsCollection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: firstDayOfLastMonth,
              $lt: firstDayOfThisMonth,
            },
          },
        },
        {
          $group: {
            _id: '$promptId',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            promptId: '$_id',
            count: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ])
      .toArray();

    // Store monthly analytics report
    const reportsCollection = db.collection('monthly_analytics_reports');
    const monthKey = firstDayOfLastMonth.toISOString().substring(0, 7); // YYYY-MM

    await reportsCollection.updateOne(
      { month: monthKey },
      {
        $set: {
          month: monthKey,
          period: {
            start: firstDayOfLastMonth,
            end: firstDayOfThisMonth,
          },
          summary: {
            totalUsers: users.length,
            activeUsers,
            totalTokens,
            totalRequests,
            totalCost,
            averageCostPerUser: activeUsers > 0 ? totalCost / activeUsers : 0,
            averageRequestsPerUser:
              activeUsers > 0 ? totalRequests / activeUsers : 0,
          },
          userReports: monthlyReports,
          topPrompts: promptStats,
          generatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Monthly analytics aggregated',
      month: monthKey,
      summary: {
        activeUsers,
        totalTokens,
        totalRequests,
        totalCost,
      },
    });
  } catch (error) {
    console.error('Monthly analytics job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
