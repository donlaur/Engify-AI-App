/**
 * GET /api/prompts/quality-scores
 * Fetch quality scores for multiple prompts (for library cards)
 * Query param: promptIds (comma-separated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkFeedbackRateLimit } from '@/lib/security/feedback-rate-limit';
import { auth } from '@/lib/auth';
import { logAuditEvent } from '@/server/middleware/audit';
import { z } from 'zod';

// Validate prompt IDs
const promptIdSchema = z.string().min(1).max(100);
const promptIdsSchema = z.string().transform((s) => {
  const ids = s.split(',').filter(Boolean);
  if (ids.length > 100) {
    throw new Error('Too many promptIds (maximum 100)');
  }
  return ids.map((id) => promptIdSchema.parse(id.trim()));
});

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts.length > 0 ? parts[0].trim() : 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await checkFeedbackRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const promptIdsParam = searchParams.get('promptIds');
    
    if (!promptIdsParam) {
      return NextResponse.json(
        { error: 'promptIds query parameter required' },
        { status: 400 }
      );
    }

    // Validate input
    const validationResult = promptIdsSchema.safeParse(promptIdsParam);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid promptIds format', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const promptIds = validationResult.data;
    
    if (promptIds.length === 0) {
      return NextResponse.json({ scores: {} });
    }

    const db = await getDb();
    const session = await auth();

    // Audit logging
    await logAuditEvent({
      eventType: 'prompt.quality_scores.viewed' as any,
      action: 'prompt.quality_scores.viewed',
      userId: session?.user?.id,
      organizationId: session?.user?.organizationId,
      resourceId: `batch:${promptIds.length}`,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    });
    
    // Get prompts by id or slug to get their MongoDB _id
    const prompts = await db.collection('prompts').find({
      $or: [
        { id: { $in: promptIds } },
        { slug: { $in: promptIds } },
      ],
    }).toArray();

    const promptIdMap = new Map<string, string>();
    prompts.forEach((p: any) => {
      const key = p.id || p.slug;
      if (key) {
        promptIdMap.set(key, p._id.toString());
      }
    });

    const mongoIds = Array.from(promptIdMap.values());
    
    if (mongoIds.length === 0) {
      return NextResponse.json({ scores: {} });
    }

    // Aggregate test results to get average scores per prompt
    const results = await db
      .collection('prompt_test_results')
      .aggregate([
        {
          $match: {
            promptId: { $in: mongoIds },
          },
        },
        {
          $group: {
            _id: '$promptId',
            averageScore: { $avg: '$qualityScore' },
            testCount: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Build response map: promptId -> { averageScore, testCount }
    const scores: Record<string, { averageScore: number; testCount: number }> = {};
    
    results.forEach((result: any) => {
      // Find the original promptId from the MongoDB _id
      for (const [originalId, mongoId] of promptIdMap.entries()) {
        if (mongoId === result._id) {
          scores[originalId] = {
            averageScore: Math.round(result.averageScore * 10) / 10,
            testCount: result.testCount,
          };
          break;
        }
      }
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error('Error fetching quality scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quality scores' },
      { status: 500 }
    );
  }
}

