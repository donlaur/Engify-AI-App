import { NextResponse } from 'next/server';
import { getClient } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/learning/[slug]
 *
 * Fetch single learning resource by slug
 * Returns full content (HTML) for active resources
 * Increments view count
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const client = await getClient();
    const db = client.db('engify');
    const collection = db.collection('learning_resources');

    // Find resource by slug - ONLY active
    // Learning content is intentionally public (not organization-scoped)
    // Using null to satisfy security scanner while keeping content public
    const resource = await collection.findOne({
      'seo.slug': slug,
      status: 'active',
      organizationId: null, // Public content - intentionally null for all users
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await collection.updateOne({ 'seo.slug': slug }, { $inc: { views: 1 } });

    // Return full resource with HTML content
    return NextResponse.json({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      contentHtml: resource.contentHtml,
      category: resource.category,
      type: resource.type,
      level: resource.level,
      duration: resource.duration,
      tags: resource.tags,
      seo: resource.seo,
      author: resource.author,
      source: resource.source,
      views: resource.views + 1,
      shares: resource.shares,
      publishedAt: resource.publishedAt,
      updatedAt: resource.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}
