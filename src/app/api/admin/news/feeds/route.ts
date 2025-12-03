/**
 * Feed Configuration API
 * 
 * Register, list, update, and delete feed configurations
 * RBAC: Admin, Super Admin, and Org Admin roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { FeedConfigRepository } from '@/lib/repositories/FeedConfigRepository';
import { FeedConfigSchema } from '@/lib/db/schemas/feed-config';
import { logger } from '@/lib/logging/logger';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const feedConfigRepository = new FeedConfigRepository();

// Ensure indexes on first use
feedConfigRepository.ensureIndexes().catch(err => {
  logger.warn('Failed to ensure feed config indexes', { error: err });
});

// GET: List all feeds
export async function GET(request: NextRequest) {
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const enabledOnly = searchParams.get('enabled') === 'true';

    const feeds = enabledOnly
      ? await feedConfigRepository.findEnabled()
      : await feedConfigRepository.findAll();

    return NextResponse.json({
      success: true,
      feeds,
      count: feeds.length,
    });
  } catch (error) {
    logger.error('Error listing feeds', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: 'Failed to list feeds',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST: Register a new feed
export async function POST(request: NextRequest) {
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate input
    const validated = FeedConfigSchema.parse({
      ...body,
      id: body.id || randomUUID(),
    });

    // Create feed configuration
    const result = await feedConfigRepository.upsert(validated);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'feed_config',
      details: {
        action: result.created ? 'feed_registered' : 'feed_updated',
        feedId: validated.id,
        url: validated.url,
        source: validated.source,
      },
    });

    return NextResponse.json({
      success: true,
      message: result.created ? 'Feed registered successfully' : 'Feed updated successfully',
      feed: validated,
      created: result.created,
      updated: result.updated,
    });
  } catch (error) {
    logger.error('Error registering feed', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to register feed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PUT: Update an existing feed
export async function PUT(request: NextRequest) {
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Feed ID is required' },
        { status: 400 }
      );
    }

    // Validate updates
    const validated = FeedConfigSchema.partial().parse(updates);

    // Update feed
    await feedConfigRepository.update(id, validated);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'feed_config',
      details: {
        action: 'feed_updated',
        feedId: id,
        updates: Object.keys(validated),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feed updated successfully',
    });
  } catch (error) {
    logger.error('Error updating feed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'Failed to update feed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE: Delete a feed
export async function DELETE(request: NextRequest) {
  const r = await withRBAC({ roles: ['super_admin', 'org_admin'] })(request);
  if (r) return r;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Feed ID is required' },
        { status: 400 }
      );
    }

    // Delete feed
    await feedConfigRepository.delete(id);

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'admin_action',
      resource: 'feed_config',
      details: {
        action: 'feed_deleted',
        feedId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feed deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting feed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'Failed to delete feed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

