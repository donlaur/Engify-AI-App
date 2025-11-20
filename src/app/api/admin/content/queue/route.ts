/**
 * Content Queue API
 * Manage content generation queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { contentQueueService } from '@/lib/services/ContentQueueService';
import { z } from 'zod';

const AddToQueueSchema = z.object({
  title: z.string().min(10),
  contentType: z.enum([
    'pillar-page',
    'hub-spoke',
    'tutorial',
    'guide',
    'news',
    'case-study',
    'comparison',
    'best-practices',
  ]),
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  targetWordCount: z.number().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  batch: z.string().optional(),
  source: z.enum(['manual', 'ai-research', 'ai-suggestion', 'import']).default('manual'),
  sourceNotes: z.string().optional(),
});

const AddBatchSchema = z.object({
  batchName: z.string().optional(),
  items: z.array(AddToQueueSchema),
});

// GET: Get queue items
export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;
    const priority = searchParams.get('priority') as any;
    const contentType = searchParams.get('contentType') as any;
    const batch = searchParams.get('batch') as any;
    const statsOnly = searchParams.get('stats') === 'true';

    if (statsOnly) {
      const stats = await contentQueueService.getQueueStats();
      return NextResponse.json({ success: true, stats });
    }

    const items = await contentQueueService.getQueue({
      status,
      priority,
      contentType,
      batch,
    });

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST: Add to queue
export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  try {
    const body = await request.json();
    
    // Check if batch or single item
    if (body.items && Array.isArray(body.items)) {
      const validated = AddBatchSchema.parse(body);
      
      // Add user ID to all items
      const itemsWithUser = validated.items.map(item => ({
        ...item,
        createdBy: 'admin', // TODO: Get from session
      }));

      const result = await contentQueueService.addBatchToQueue(
        itemsWithUser,
        validated.batchName
      );

      return NextResponse.json({
        success: true,
        message: `Added ${result.items.length} items to queue`,
        items: result.items,
        batchId: result.batchId,
      });
    } else {
      const validated = AddToQueueSchema.parse(body);
      
      const item = await contentQueueService.addToQueue({
        ...validated,
        createdBy: 'admin', // TODO: Get from session
      });

      return NextResponse.json({
        success: true,
        message: 'Added to queue',
        item,
      });
    }
  } catch (error) {
    console.error('Error adding to queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add to queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove from queue
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

    await contentQueueService.deleteQueueItem(id);

    return NextResponse.json({
      success: true,
      message: 'Removed from queue',
    });
  } catch (error) {
    console.error('Error removing from queue:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove from queue',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
