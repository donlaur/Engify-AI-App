/**
 * Prompt Share Tracking API
 * Track when a prompt is shared
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';

const ShareTrackingSchema = z.object({
  platform: z.enum(['twitter', 'linkedin', 'facebook', 'reddit', 'email', 'native', 'copy']).optional(),
  url: z.string().url().optional(),
});

/**
 * POST /api/prompts/[id]/share
 * Track a prompt share
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: promptId } = await params;
    const body = await request.json().catch(() => ({}));
    const data = ShareTrackingSchema.parse(body);

    const db = await getMongoDb();
    const now = new Date();
    const clientIP = getClientIp(request);

    // Track share event
    await db.collection('analytics_events').insertOne({
      promptId,
      event: 'share',
      platform: data.platform || 'unknown',
      url: data.url,
      timestamp: now,
      ip: clientIP,
    });

    // Update prompt_stats aggregation
    await db.collection('prompt_stats').updateOne(
      { promptId },
      {
        $inc: {
          shareCount: 1,
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

    return NextResponse.json({
      success: true,
      message: 'Share tracked',
    });
  } catch (error) {
    logger.apiError('/api/prompts/[id]/share', error, { method: 'POST' });
    // Don't fail the request if tracking fails
    return NextResponse.json({
      success: true,
      message: 'Share tracked',
    });
  }
}
