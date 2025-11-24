/**
 * Generated Content API
 * Manage AI-generated content for review
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { generatedContentService } from '@/lib/services/GeneratedContentService';
import { z } from 'zod';

const UpdateContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'publish']),
  notes: z.string().optional(),
});

// GET: Get all generated content
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const contentType = searchParams.get('contentType') as any;
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await generatedContentService.getStats();
      return NextResponse.json({ success: true, stats });
    }

    const items = await generatedContentService.getAll({
      status,
      contentType,
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('Error fetching generated content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH: Update or review content
export async function PATCH(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Review action (approve/reject/publish)
    if (action === 'review') {
      const validated = ReviewSchema.parse(body);
      
      if (validated.action === 'approve') {
        await generatedContentService.approve(id, 'admin', validated.notes);
      } else if (validated.action === 'reject') {
        await generatedContentService.reject(id, 'admin', validated.notes || 'Rejected');
      } else if (validated.action === 'publish') {
        // Get content to generate URL
        const content = await generatedContentService.getById(id);
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'Content not found' },
            { status: 404 }
          );
        }
        
        // Generate slug if not exists
        const slug = content.slug || content.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        // Generate URL based on category for SEO-rich structure
        // Map category values to URL-friendly paths
        const categoryMap: Record<string, string> = {
          'ai-sdlc': 'ai-sdlc',
          'agile': 'agile',
          'workflows': 'workflows',
          'tools': 'ai-tools',
          'models': 'ai-models',
        };
        const categoryPath = categoryMap[content.category || ''] || content.category || '';
        const url = categoryPath ? `/learn/${categoryPath}/${slug}` : `/learn/${slug}`;
        
        // Mark as published with slug
        await generatedContentService.markPublished(id, url, slug);
        
        return NextResponse.json({
          success: true,
          message: 'Content published',
          url,
        });
      }

      return NextResponse.json({
        success: true,
        message: `Content ${validated.action}d`,
      });
    }

    // Update content
    const validated = UpdateContentSchema.parse(body);
    await generatedContentService.update(id, validated);

    return NextResponse.json({
      success: true,
      message: 'Content updated',
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete content
export async function DELETE(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await generatedContentService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Content deleted',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
