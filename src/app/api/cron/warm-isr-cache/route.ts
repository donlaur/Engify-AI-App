/**
 * ISR Cache Warming API Route
 * 
 * Warms up ISR cache by hitting prompt pages before they expire.
 * Called by Vercel Cron Jobs to keep pages pre-rendered.
 * 
 * Usage:
 * - GET /api/cron/warm-isr-cache?type=prompts&limit=50
 * - GET /api/cron/warm-isr-cache?type=all
 * 
 * Protected by Vercel Cron secret header
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { promptRepository } from '@/lib/db/repositories/ContentService';
import { getPromptSlug, generateSlug } from '@/lib/utils/slug';
import { logger } from '@/lib/logging/logger';
import { getDb } from '@/lib/mongodb';
import { logAuditEvent } from '@/server/middleware/audit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';
const CRON_SECRET = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

/**
 * Verify request is from Vercel Cron
 */
function verifyCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  // Vercel Cron sends Authorization header with secret
  if (CRON_SECRET && authHeader === `Bearer ${CRON_SECRET}`) {
    return true;
  }
  
  // Also check for Vercel's cron header
  const cronHeader = request.headers.get('x-vercel-cron');
  if (cronHeader) {
    return true;
  }
  
  return false;
}

/**
 * Warm up ISR cache by fetching pages
 */
async function warmPage(url: string): Promise<{ success: boolean; status: number; duration: number }> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Engify.ai-ISR-Warmer/1.0',
      },
      // Don't follow redirects - we want the actual response
      redirect: 'manual',
    });
    
    const duration = Date.now() - startTime;
    
    return {
      success: response.status < 400,
      status: response.status,
      duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Failed to warm page', { url, error, duration });
    
    return {
      success: false,
      status: 0,
      duration,
    };
  }
}

/**
 * GET /api/cron/warm-isr-cache
 * Warm up ISR cache for prompt pages
 */
export async function GET(request: NextRequest) {
  // Verify this is a cron request
  if (!verifyCronRequest(request)) {
    logger.warn('Unauthorized cron request attempt', {
      ip: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    });
    
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'prompts';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const results = {
      warmed: [] as string[],
      failed: [] as string[],
      slugsUpdated: 0,
      stats: {
        total: 0,
        success: 0,
        failed: 0,
        totalDuration: 0,
      },
    };

    if (type === 'prompts' || type === 'all') {
      // Get featured/popular prompts from MongoDB
      const allPrompts = await promptRepository.getAll();
      
      // Verify and update slugs for prompts missing them
      let slugsUpdated = 0;
      const db = await getDb();
      const collection = db.collection('prompts');
      
      for (const prompt of allPrompts) {
        const expectedSlug = getPromptSlug(prompt);
        
        // If prompt has no slug or slug doesn't match expected, update it
        if (!prompt.slug || prompt.slug !== expectedSlug) {
          try {
            await collection.updateOne(
              { id: prompt.id },
              {
                $set: {
                  slug: expectedSlug,
                  updatedAt: new Date(),
                },
              }
            );
            slugsUpdated++;
            logger.debug(`Updated slug for prompt ${prompt.id}: ${expectedSlug}`);
            
            // Audit log: Slug update via cron
            await logAuditEvent({
              eventType: 'admin.content.updated',
              userId: 'system',
              metadata: {
                promptId: prompt.id,
                action: 'slug_update',
                source: 'isr_cache_warming',
                oldSlug: prompt.slug || null,
                newSlug: expectedSlug,
              },
            });
          } catch (error) {
            logger.error(`Failed to update slug for prompt ${prompt.id}`, { error });
          }
        }
      }
      
      if (slugsUpdated > 0) {
        logger.info(`Updated ${slugsUpdated} prompt slugs during cache warming`);
      }
      
      results.slugsUpdated = slugsUpdated;
      
      // Sort by featured and views, take top prompts
      const promptsToWarm = allPrompts
        .sort((a, b) => {
          // Featured first
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          // Then by views
          return (b.views || 0) - (a.views || 0);
        })
        .slice(0, limit);

      logger.info(`Warming ${promptsToWarm.length} prompt pages`);

      // Warm up each prompt page
      for (const prompt of promptsToWarm) {
        const slug = getPromptSlug(prompt);
        const url = `${APP_URL}/prompts/${slug}`;
        
        const result = await warmPage(url);
        results.stats.total++;
        
        if (result.success) {
          results.stats.success++;
          results.warmed.push(url);
        } else {
          results.stats.failed++;
          results.failed.push(url);
        }
        
        results.stats.totalDuration += result.duration;
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Also warm up main pages if type is 'all'
    if (type === 'all') {
      const mainPages = [
        '/',
        '/prompts',
        '/patterns',
        '/learn',
      ];

      for (const path of mainPages) {
        const url = `${APP_URL}${path}`;
        const result = await warmPage(url);
        results.stats.total++;
        
        if (result.success) {
          results.stats.success++;
          results.warmed.push(url);
        } else {
          results.stats.failed++;
          results.failed.push(url);
        }
        
        results.stats.totalDuration += result.duration;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const averageDuration = results.stats.total > 0
      ? Math.round(results.stats.totalDuration / results.stats.total)
      : 0;

    logger.info('ISR cache warming complete', {
      type,
      limit,
      ...results.stats,
      averageDuration,
    });

    return NextResponse.json({
      success: true,
      type,
      limit,
      slugsUpdated,
      ...results.stats,
      averageDurationMs: averageDuration,
      warmed: results.warmed.slice(0, 10), // Show first 10
      failed: results.failed.slice(0, 10), // Show first 10
      message: `Warmed ${results.stats.success} pages, ${results.stats.failed} failed${slugsUpdated > 0 ? `, ${slugsUpdated} slugs updated` : ''}`,
    });
  } catch (error) {
    logger.error('Error warming ISR cache', { error });
    
    return NextResponse.json(
      {
        error: 'Failed to warm ISR cache',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

