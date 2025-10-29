/**
 * Weekly Digest Job
 *
 * Sends weekly email digest to active users
 * POST /api/jobs/weekly-digest
 *
 * Called by QStash scheduled job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { sendEmail } from '@/lib/services/emailService';
import { SendGridTemplateBuilders } from '@/lib/services/sendgridTemplates';
import { apiKeyUsageService } from '@/lib/services/ApiKeyUsageService';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
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

      // Get weekly usage summary
      const summary = await apiKeyUsageService.getUsageSummary(user.id, {
        period: 'weekly',
      });

      // Get top prompts used (from prompt history if available)
      const promptsCollection = db.collection('prompt_history');
      const topPromptsAgg = await promptsCollection
        .aggregate<{
          _id: string;
          count: number;
          title?: string;
        }>([{ $match: { userId: user.id, createdAt: { $gte: oneWeekAgo } } }, { $group: { _id: '$promptId', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }])
        .toArray();
      const topPrompts = topPromptsAgg || [];

      const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date();

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
        topPatterns: Object.entries(summary.providerBreakdown).map(
          ([provider, data]) => ({
            name: provider,
            uses: data.requests,
          })
        ),
        libraryUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/library`,
        analyticsUrl: `${process.env.NEXTAUTH_URL || 'https://engify.ai'}/settings/api-keys?tab=usage`,
      });

      const emailResult = await sendEmail({
        to: user.email,
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
    console.error('Weekly digest job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
