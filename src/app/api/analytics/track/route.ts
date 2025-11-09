/**
 * Analytics Tracking API
 * Track prompt views, executions, and popularity
 * 
 * Uses Upstash Redis for fast, non-blocking tracking
 * Syncs to MongoDB hourly via cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackPromptEvent } from '@/lib/analytics/redis-tracker';
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

    // Track in Redis (fast, no MongoDB write)
    await trackPromptEvent(data.promptId, data.event);

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

    if (promptId) {
      // Get stats from Redis (fast, real-time)
      const { getPromptStats } = await import('@/lib/analytics/redis-tracker');
      const stats = await getPromptStats(promptId);
      return NextResponse.json({ stats });
    }

    // Get top prompts from Redis
    const { getTopPrompts } = await import('@/lib/analytics/redis-tracker');
    const topPrompts = await getTopPrompts('execute', 10);
    return NextResponse.json({ topPrompts });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
