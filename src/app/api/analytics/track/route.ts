/**
 * Analytics Tracking API
 * Track prompt views, executions, and popularity
 * 
 * Uses Upstash Redis for fast, non-blocking tracking
 * Syncs to MongoDB hourly via cron
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackPromptEvent, getPromptStats, getTopPrompts } from '@/lib/analytics/redis-tracker';
import {
  checkRateLimit,
  getClientIp,
  type RateLimitResult,
} from '@/lib/rate-limit';
import { z, ZodError } from 'zod';

const trackSchema = z.object({
  promptId: z.string(),
  event: z.enum(['view', 'copy', 'execute', 'favorite']),
  metadata: z.record(z.string(), z.any()).optional(),
});

function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'Retry-After': '60',
    'X-RateLimit-Remaining': Math.max(result.remaining, 0).toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

async function enforceRateLimit(request: NextRequest) {
  const identifier = getClientIp(request); // falls back to 'unknown'
  const result = await checkRateLimit(identifier, 'anonymous');
  if (!result.allowed) {
    return NextResponse.json(
      {
        error: result.reason ?? 'Rate limit exceeded',
      },
      {
        status: 429,
        headers: buildRateLimitHeaders(result),
      }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimitResponse = await enforceRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const body = await req.json();
    const data = trackSchema.parse(body);

    // Track in Redis (fast, no MongoDB write)
    await trackPromptEvent(data.promptId, data.event);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid analytics payload' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const rateLimitResponse = await enforceRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('promptId');

    if (promptId) {
      // Get stats from Redis (fast, real-time)
      const stats = await getPromptStats(promptId);
      return NextResponse.json({ stats });
    }

    // Get top prompts from Redis
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
