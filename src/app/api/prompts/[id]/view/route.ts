/**
 * Prompt View Tracking API
 * Increments view count when a prompt is viewed
 * No authentication required - tracks anonymous views
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const ViewTrackingSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID required'),
});

/**
 * POST /api/prompts/[id]/view
 * Track a prompt view (increment counter)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting: 30 views per minute per IP (generous for browsing)
    // Note: Views are public action, no auth required
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'anonymous';
    
    const rateLimitResult = await checkRateLimit(clientIP, 'anonymous');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    const { id: promptId } = await params;

    // Validate prompt ID
    ViewTrackingSchema.parse({ promptId });

    const db = await getDb();

    // Increment view count - try by id first, then slug
    let result = await db.collection('prompts').updateOne(
      { id: promptId, active: { $ne: false } },
      {
        $inc: { views: 1 },
        $set: { lastViewedAt: new Date() },
      }
    );

    // If not found by id, try by slug
    if (result.matchedCount === 0) {
      result = await db.collection('prompts').updateOne(
        { slug: promptId, active: { $ne: false } },
        {
          $inc: { views: 1 },
          $set: { lastViewedAt: new Date() },
        }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Get updated view count - try by id first, then slug
    const prompt = await db.collection('prompts').findOne(
      { $or: [{ id: promptId }, { slug: promptId }] },
      { projection: { views: 1 } }
    );

    return NextResponse.json({
      success: true,
      views: prompt?.views || 1,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.issues },
        { status: 400 }
      );
    }

    console.error('POST /api/prompts/[id]/view error:', error);
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    );
  }
}

