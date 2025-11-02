/**
 * Patterns API
 * GET /api/patterns - Fetch all prompt patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const querySchema = z.object({
  category: z
    .enum(['FOUNDATIONAL', 'STRUCTURAL', 'COGNITIVE', 'ITERATIVE'])
    .optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting for public API
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.ip ||
      'unknown';
    const rateLimitResult = await checkRateLimit(clientIp, 'anonymous');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Validate query params
    const validation = querySchema.safeParse({
      category: searchParams.get('category') || undefined,
      level: searchParams.get('level') || undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error },
        { status: 400 }
      );
    }

    const { category, level } = validation.data;

    const db = await getDb();

    // Build query
    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (level) query.level = level;

    // Fetch patterns
    const patterns = await db.collection('patterns').find(query).toArray();

    return NextResponse.json({
      success: true,
      data: patterns,
      count: patterns.length,
    });
  } catch (error) {
    console.error('Error fetching patterns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}
