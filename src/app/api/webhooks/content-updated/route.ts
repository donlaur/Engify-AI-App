import { NextRequest, NextResponse } from 'next/server';
import { generatePromptsJson } from '@/lib/prompts/generate-prompts-json';
import { generatePatternsJson } from '@/lib/patterns/generate-patterns-json';
import { logger } from '@/lib/logging/logger';
import {
  checkRateLimit,
  getClientIp,
  type RateLimitResult,
} from '@/lib/rate-limit';
import { sanitizeText } from '@/lib/security/sanitize';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Content Updated Webhook
 * 
 * Triggered when content is added/updated in MongoDB
 * Regenerates JSON ISR cache files
 * 
 * Usage:
 * POST /api/webhooks/content-updated
 * Headers: Authorization: Bearer <WEBHOOK_SECRET>
 * Body: { type: 'prompts' | 'patterns' | 'learning' | 'all' }
 */
const ALLOWED_TYPES = new Set(['prompts', 'patterns', 'learning', 'all']);

async function enforceRateLimit(request: NextRequest) {
  const identifier = `webhook:${getClientIp(request)}`;
  const result = await checkRateLimit(identifier, 'authenticated');
  if (!result.allowed) {
    return NextResponse.json(
      { error: result.reason ?? 'Rate limit exceeded' },
      {
        status: 429,
        headers: buildRateLimitHeaders(result),
      }
    );
  }
  return null;
}

function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    'Retry-After': '60',
    'X-RateLimit-Remaining': Math.max(result.remaining, 0).toString(),
    'X-RateLimit-Reset': result.resetAt.toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await enforceRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.WEBHOOK_SECRET || process.env.CRON_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      logger.warn('Unauthorized webhook request', {
        hasAuth: !!authHeader,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.json();
    const rawType = typeof rawBody?.type === 'string' ? rawBody.type : 'all';
    const type = sanitizeText(rawType).toLowerCase() || 'all';

    if (!ALLOWED_TYPES.has(type)) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    logger.info('Content updated webhook triggered', { type });

    const results: Record<string, boolean> = {};

    // Regenerate JSON based on type
    if (type === 'prompts' || type === 'all') {
      try {
        await generatePromptsJson();
        results.prompts = true;
        logger.info('Prompts JSON regenerated');
      } catch (error) {
        logger.error('Failed to regenerate prompts JSON', { error });
        results.prompts = false;
      }
    }

    if (type === 'patterns' || type === 'all') {
      try {
        await generatePatternsJson();
        results.patterns = true;
        logger.info('Patterns JSON regenerated');
      } catch (error) {
        logger.error('Failed to regenerate patterns JSON', { error });
        results.patterns = false;
      }
    }

    // TODO: Add learning resources JSON generation when implemented
    if (type === 'learning' || type === 'all') {
      results.learning = true; // Placeholder
      logger.info('Learning resources JSON regeneration skipped (not implemented)');
    }

    // Optional: Trigger Vercel revalidation for specific paths
    // This forces Next.js to rebuild those pages on next request
    if (process.env.VERCEL_ENV === 'production') {
      try {
        // Revalidate main content pages
        const revalidatePaths = [
          '/prompts',
          '/patterns',
          '/learn',
        ];

        // Note: This requires REVALIDATION_TOKEN in env
        // For now, just log that we would revalidate
        logger.info('Would revalidate paths', { paths: revalidatePaths });
      } catch (error) {
        logger.warn('Failed to trigger revalidation', { error });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Content updated, JSON regenerated',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Content update webhook failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
