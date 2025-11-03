import { NextResponse } from 'next/server';
import { getClient } from '@/lib/mongodb';
import { logger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/learning
 * 
 * Fetch learning resources from MongoDB
 * Only returns ACTIVE resources (with full content)
 * 
 * Query params:
 * - category: filter by category
 * - level: filter by level (beginner, intermediate, advanced)
 * - featured: true/false
 * - limit: number of results (default 20)
 * - skip: pagination offset (default 0)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = parseInt(searchParams.get('skip') || '0');
    
    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');
    
    // Build query - ONLY active resources
    const query: Record<string, unknown> = { status: 'active' };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (featured) query.featured = featured === 'true';
    
    // Get total count
    const total = await collection.countDocuments(query);
    
    // Get resources
    const resources = await collection
      .find(query)
      .sort({ featured: -1, order: 1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .project({
        _id: 0,
        id: 1,
        title: 1,
        description: 1,
        category: 1,
        type: 1,
        level: 1,
        duration: 1,
        tags: 1,
        featured: 1,
        seo: 1,
        views: 1,
        shares: 1,
        publishedAt: 1,
      })
      .toArray();
    
    return NextResponse.json({
      resources,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    logger.apiError('/api/learning', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}
