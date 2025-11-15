/**
 * Blog Redirect Handler
 * Redirects old /blog/* URLs to /learn or appropriate pages
 * Prevents 404 errors for SEO
 * 
 * Handles:
 * - /blog/11, /blog/12 -> /learn (301 redirect)
 * - /blog/[slug] -> /learn/[slug] if exists, else /learn
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { logger } from '@/lib/logging/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  try {
    const { slug: slugArray } = await params;
    const slug = slugArray?.[0] || '';
    
    // If it's just a number (like /blog/11 or /blog/12), redirect to /learn
    if (/^\d+$/.test(slug)) {
      return NextResponse.redirect(new URL('/learn', request.url), 301);
    }

    // Try to find in learning_resources by slug
    try {
      const db = await getMongoDb();
      const resource = await db.collection('learning_resources').findOne({
        'seo.slug': slug,
        status: 'active',
      });

      if (resource) {
        // Redirect to /learn/[slug]
        return NextResponse.redirect(
          new URL(`/learn/${slug}`, request.url),
          301
        );
      }
    } catch (error) {
      // If DB lookup fails, redirect to /learn
      logger.warn('Failed to lookup blog slug', { slug, error });
    }

    // Fallback: redirect to /learn
    return NextResponse.redirect(new URL('/learn', request.url), 301);
  } catch (error) {
    logger.apiError('/blog/[[...slug]]', error, { method: 'GET' });
    // Even on error, redirect to /learn to prevent 404
    return NextResponse.redirect(new URL('/learn', request.url), 301);
  }
}
