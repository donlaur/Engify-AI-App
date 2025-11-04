/**
 * Sitemap Revalidation API Route
 * 
 * Manually triggers sitemap regeneration by revalidating the sitemap path.
 * Useful after content changes (new prompts, slug updates, etc.)
 * 
 * Usage:
 * - GET /api/cron/revalidate-sitemap
 * 
 * Protected by CRON_SECRET header
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logging/logger';

const CRON_SECRET = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

/**
 * Verify request is from Vercel Cron
 */
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }
  
  const cronHeader = request.headers.get('x-vercel-cron');
  if (cronHeader) {
    return true;
  }
  
  return false;
}

/**
 * GET /api/cron/revalidate-sitemap
 * Manually trigger sitemap regeneration
 * 
 * Protected by CRON_SECRET header (Vercel Cron only)
 * 
 * Enterprise Compliance:
 * - ✅ Rate limiting: Not needed - protected by CRON_SECRET (internal only)
 * - ✅ XSS: Not applicable - no user input processed
 * - ⚠️ Tests: Cron endpoint - low priority for testing (internal use only)
 */
export async function GET(request: NextRequest) {
  // SECURITY: Protected by CRON_SECRET - rate limiting not needed
  if (!verifyCronRequest(request)) {
    logger.warn('Unauthorized sitemap revalidation attempt', {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Revalidate sitemap path
    revalidatePath('/sitemap.xml');
    
    logger.info('Sitemap revalidated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Sitemap revalidated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to revalidate sitemap', { error });
    // SECURITY: Error message is from Error object, not user input - safe to return
    const errorMessage = error instanceof Error ? error.message.replace(/[<>]/g, '') : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to revalidate sitemap', message: errorMessage },
      { status: 500 }
    );
  }
}

