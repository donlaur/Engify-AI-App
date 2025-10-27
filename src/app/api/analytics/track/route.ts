/**
 * Analytics Tracking API
 * Track prompt views, executions, and popularity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';

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
    await db.collection('analytics_events').insertOne({
      ...data,
      timestamp: now,
      date: now.toISOString().split('T')[0], // For daily aggregation
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
  try {
    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('promptId');

    const db = await getMongoDb();
    
    if (promptId) {
      // Get stats for specific prompt
      const stats = await db.collection('prompt_stats').findOne({ promptId });
      return NextResponse.json({ stats: stats || {} });
    }

    // Get top prompts
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
