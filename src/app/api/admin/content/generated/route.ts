/**
 * Generated Content API
 * Manage AI-generated content for review
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { generatedContentService } from '@/lib/services/GeneratedContentService';
import { contentQueueService } from '@/lib/services/ContentQueueService';
import { learningResourceRepository } from '@/lib/db/repositories/ContentService';
import { generateLearningResourcesJson } from '@/lib/learning/generate-learning-json';
import { marked } from 'marked';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const UpdateContentSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  slug: z.string().optional(),
});

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'publish', 'regenerate']),
  notes: z.string().optional(),
  feedback: z.string().optional(), // For regenerate: specific corrections
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
      } else if (validated.action === 'regenerate') {
        // Get original content to requeue with feedback
        const content = await generatedContentService.getById(id);
        if (!content) {
          return NextResponse.json(
            { success: false, error: 'Content not found' },
            { status: 404 }
          );
        }

        // Create new queue item with feedback for regeneration
        const feedbackNote = validated.feedback || validated.notes || 'Please regenerate with corrections';
        await contentQueueService.addToQueue({
          title: content.title,
          contentType: content.contentType,
          description: `REGENERATION: ${content.description || content.title}`,
          keywords: content.keywords,
          targetWordCount: content.wordCount || 2000,
          priority: 'high', // Prioritize regenerations
          batch: content.category || 'regenerations',
          createdBy: 'admin',
          source: 'manual',
          // Include feedback for the AI
          sourceNotes: `REGENERATION REQUEST - Previous version had issues:\n${feedbackNote}\n\nPlease address these concerns in the new version.`,
        });

        // Mark original as rejected with regeneration note
        await generatedContentService.reject(id, 'admin', `Sent for regeneration: ${feedbackNote}`);

        return NextResponse.json({
          success: true,
          message: 'Content queued for regeneration',
          feedback: feedbackNote,
        });
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
          'wsjf': 'wsjf',
          'wsjf-spokes': 'wsjf',
        };
        const categoryPath = categoryMap[content.category || ''] || content.category || '';
        const url = categoryPath ? `/learn/${categoryPath}/${slug}` : `/learn/${slug}`;
        
        // Convert markdown to HTML
        const contentHtml = marked(content.content, { breaks: true });
        
        // Map contentType to learning resource type
        const typeMap: Record<string, 'article' | 'guide' | 'tutorial'> = {
          'pillar-page': 'article',
          'hub-spoke': 'article',
          'tutorial': 'tutorial',
          'guide': 'guide',
          'news': 'article',
          'case-study': 'article',
          'comparison': 'article',
          'best-practices': 'guide',
        };
        
        // Determine level from category or default to intermediate
        const levelMap: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
          'beginner': 'beginner',
          'intermediate': 'intermediate',
          'advanced': 'advanced',
        };
        const level = levelMap[content.category?.toLowerCase() || ''] || 'intermediate';
        
        // Save to learning_resources collection
        const learningResourceId = new ObjectId().toString();
        const now = new Date();
        const publishedAt = content.publishedAt || now;
        
        // Get collection directly to insert
        const { getDb } = await import('@/lib/mongodb');
        const db = await getDb();
        const collection = db.collection('learning_resources');
        
        await collection.insertOne({
          id: learningResourceId,
          title: content.title,
          description: content.description || content.title,
          category: content.category || 'Tutorial',
          type: typeMap[content.contentType] || 'article',
          level,
          tags: content.keywords || [],
          author: content.createdBy || 'Engify.ai Team',
          featured: false,
          status: 'active',
          contentHtml,
          organizationId: null, // Public content
          seo: {
            metaTitle: content.title,
            metaDescription: content.description || content.title,
            keywords: content.keywords || [],
            slug,
            canonicalUrl: `https://engify.ai${url}`,
          },
          views: 0,
          shares: 0,
          publishedAt,
          createdAt: now,
          updatedAt: now,
        } as any);
        
        // Mark as published with slug
        await generatedContentService.markPublished(id, url, slug);
        
        // Regenerate JSON file to include new article
        try {
          await generateLearningResourcesJson();
        } catch (jsonError) {
          console.error('Failed to regenerate JSON (non-critical):', jsonError);
          // Don't fail the publish if JSON regeneration fails
        }
        
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
