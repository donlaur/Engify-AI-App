/**
 * News Items API
 * 
 * Fetch aggregated news items from ai_tool_updates collection
 * RBAC: Admin, Super Admin, and Org Admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logging/logger';
import { getMongoDb } from '@/lib/db/mongodb';

// GET: List all news items
export async function GET(request: NextRequest) {
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');
    const modelId = searchParams.get('modelId');
    const type = searchParams.get('type');
    const source = searchParams.get('source');
    const status = searchParams.get('status') || 'active';
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // For pagination, we need direct collection access
    const db = await getMongoDb();
    const collection = db.collection('ai_tool_updates');

    // Build query
    const query: any = { status };
    if (toolId) query.toolId = toolId;
    if (modelId) query.modelId = modelId;
    if (type) query.type = type;
    if (source) query.source = source;

    // Fetch with pagination
    const [items, total] = await Promise.all([
      collection
        .find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      items: items.map((item: any) => ({
        ...item,
        _id: item._id?.toString(),
        publishedAt: item.publishedAt?.toISOString(),
        syncedAt: item.syncedAt?.toISOString(),
        createdAt: item.createdAt?.toISOString(),
        updatedAt: item.updatedAt?.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    logger.error('Error listing news items', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: 'Failed to list news items',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

