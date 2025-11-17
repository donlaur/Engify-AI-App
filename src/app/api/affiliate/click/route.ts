/**
 * Affiliate Click Tracking API
 *
 * Tracks affiliate link clicks with metadata
 * Called when user clicks an affiliate link
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateClick } from '@/lib/analytics/affiliate-tracking';
import {
  checkRateLimit,
  getClientIp,
  type RateLimitResult,
} from '@/lib/rate-limit';
import { z, ZodError } from 'zod';

const clickSchema = z.object({
  toolKey: z.string(),
  toolName: z.string(),
  url: z.string().url(),
  hasReferral: z.boolean(),
  status: z.enum(['active', 'pending', 'requested']),
  commission: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  source: z.string().optional(),
});

function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'Retry-After': '60',
    'X-RateLimit-Remaining': Math.max(result.remaining, 0).toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

async function enforceRateLimit(request: NextRequest) {
  const identifier = getClientIp(request);
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
    const data = clickSchema.parse(body);

    // Get additional metadata from request
    const userAgent = req.headers.get('user-agent') || undefined;
    const referrer = req.headers.get('referer') || undefined;
    const ipAddress = getClientIp(req);

    // Track the click
    await trackAffiliateClick({
      ...data,
      userAgent,
      referrer,
      ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Affiliate click tracking error:', error);
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid click data' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
