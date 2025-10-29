/**
 * Analytics Tracking API
 * Track prompt views, executions, and popularity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';
import { RBACPresets } from '@/lib/middleware/rbac';

const trackSchema = z.object({
  promptId: z.string(),
  event: z.enum(['view', 'copy', 'execute', 'favorite']),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = trackSchema.parse(body);

    const db = await getMongoDb();
    const now = new Date();

    // Track event
    // ISO string always contains 'T', so split will always have at least 2 elements
    const isoString = now.toISOString();
    const dateParts = isoString.split('T');
    const date =
      dateParts.length >= 1 ? dateParts[0] : isoString.substring(0, 10);
    await db.collection('analytics_events').insertOne({
      ...data,
      timestamp: now,
      date, // For daily aggregation
    });

    // Update prompt stats (aggregated)
    await db.collection('prompt_stats').updateOne(
      { promptId: data.promptId },
      {
        $inc: {
          [`${data.event}Count`]: 1,
          totalEvents: 1,
        },
        $set: {
          lastEventAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // RBAC: analytics:read permission
  const rbacCheck = await RBACPresets.requireAnalyticsAccess()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('promptId');

    const db = await getMongoDb();

    if (promptId) {
      // Get stats for specific prompt (public analytics - no org isolation needed)
      // Note: prompt_stats collection stores aggregated public analytics data
      const stats = await db.collection('prompt_stats').findOne({ promptId });
      return NextResponse.json({ stats: stats || {} });
    }

    // Get top prompts (public analytics - no org isolation needed)
    // Note: prompt_stats collection stores aggregated public analytics data
    const topPrompts = await db
      .collection('prompt_stats')
      .find({})
      .sort({ executeCount: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ topPrompts });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
