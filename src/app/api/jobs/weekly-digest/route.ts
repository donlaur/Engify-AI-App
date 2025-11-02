/**
 * Weekly Digest Job
 *
 * Sends weekly email digest to active users
 * POST /api/jobs/weekly-digest
 *
 * Called by QStash scheduled job
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging/logger';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/services/emailService';
import { SendGridTemplateBuilders } from '@/lib/services/sendgridTemplates';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';
import { verifyCronRequest } from '@/lib/auth/verify-cron';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Verify this is a scheduled job
  const authError = await verifyCronRequest(request);
  if (authError) return authError;

  try {
    const db = await getDb();

    // Get all active users (users who have used the platform this week)
    const usersCollection = db.collection('users');
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const activeUsers = await usersCollection
      .find({
        $or: [
          { lastActiveAt: { $gte: oneWeekAgo } },
          { createdAt: { $gte: oneWeekAgo } },
        ],
      })
      .toArray();

    const emailsSent = [];

    for (const user of activeUsers) {
      if (!user.email) continue;

      // Calculate weekly date range (last 7 days)
      const now = new Date();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = now;

      // Get weekly usage summary
      const summary = await apiKeyUsageService.getUsageSummary(user.id, {
        period: 'weekly',
        startDate: weekStart,
        endDate: weekEnd,
      });

      // Get top prompts used (from prompt history if available)
      const promptsCollection = db.collection('prompt_history');
      const topPromptsAgg = await promptsCollection
        .aggregate<{
          _id: string;
          count: number;
          title?: string;
        }>([
          { $match: { userId: user.id, createdAt: { $gte: oneWeekAgo } } },
          { $group: { _id: '$promptId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ])
        .toArray();
      const topPrompts = topPromptsAgg || [];

      // Send weekly digest email
      // Email validated above, split('@') always returns at least one element
      const emailParts = user.email.split('@');
      const userName =
        user.name || (emailParts.length >= 1 ? emailParts[0] : 'User');
      const template = SendGridTemplateBuilders.weeklyDigest({
        userName,
        weekStart: weekStart.toLocaleDateString(),
        weekEnd: weekEnd.toLocaleDateString(),
        totalPromptsUsed: summary.totalRequests,
        totalTokensUsed: summary.totalTokens,
        totalCost: summary.totalCost,
        topPrompts: topPrompts.map((p) => ({
          title: p.title || 'Untitled Prompt',
          uses: p.count || 0,
          url: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/library/${p._id}`,
        })),
        topPatterns: [], // providerBreakdown not available in UsageSummary - simplified for now
        libraryUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/library`,
        analyticsUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/settings/api-keys?tab=usage`,
      });

      const emailResult = await sendEmail({
        to: user.email as string,
        subject: 'Your Weekly Engify.ai Digest', // Required by EmailData
        templateId: template.templateId,
        dynamicTemplateData: template.dynamicTemplateData,
      });

      if (emailResult.success) {
        emailsSent.push(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly digest sent',
      emailsSent: emailsSent.length,
      totalUsers: activeUsers.length,
    });
  } catch (error) {
    logger.apiError('/api/jobs/weekly-digest', error, {
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
