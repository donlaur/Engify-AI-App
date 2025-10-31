/**
 * AI Summary: API route for triggering automated content creation using CreatorAgent.
 * Protected by RBAC (org_admin/super_admin). Part of Day 5 Phase 2.5.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/middleware/rbac';
import { CreatorAgent } from '@/lib/agents/CreatorAgent';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import { z } from 'zod';

const createContentSchema = z.object({
  topic: z.string().min(3).max(200),
  category: z.enum(['engineering', 'product', 'design', 'marketing', 'sales', 'support', 'general']),
  targetWordCount: z.number().min(100).max(2000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  sourceUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  let session: Awaited<ReturnType<typeof auth>> | null = null;

  try {
    const guard = await RBACPresets.requireSuperAdmin()(request);
    if (guard) {
      return guard;
    }

    session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createContentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { topic, category, targetWordCount, tags, sourceUrl } = validation.data;

    const creatorAgent = new CreatorAgent();
    const result = await creatorAgent.createContent({
      topic,
      category,
      targetWordCount,
      tags,
      sourceUrl,
    });

    await auditLog({
      action: result.success
        ? 'content_creation_triggered'
        : 'content_creation_failed',
      userId: session.user.id,
      resource: 'content',
      details: {
        topic,
        category,
        targetWordCount,
        tags,
        success: result.success,
        wordCount: result.wordCount,
        costUSD: result.costUSD,
        error: result.error,
        contentId: result.contentId,
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        contentId: result.contentId,
        wordCount: result.wordCount,
        tokensUsed: result.tokensUsed,
        costUSD: result.costUSD,
        message: 'Content created successfully and queued for review',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: result.error,
        message: 'Content creation failed',
      },
      { status: 500 }
    );
  } catch (error) {
    logger.apiError('/api/agents/creator', error, { method: 'POST' });

    if (session?.user?.id) {
      try {
        await auditLog({
          action: 'content_creation_error',
          userId: session.user.id,
          resource: 'content',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          severity: 'error',
        });
      } catch (auditError) {
        logger.error('creator-agent.audit.failure', {
          error:
            auditError instanceof Error
              ? auditError.message
              : String(auditError),
        });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error during content creation' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve creation statistics
export async function GET(request: NextRequest) {
  try {
    const guard = await RBACPresets.requireSuperAdmin()(request);
    if (guard) {
      return guard;
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const creatorAgent = new CreatorAgent();
    const stats = await creatorAgent.getStats();

    return NextResponse.json({
      stats,
      message: 'Content creation statistics retrieved successfully',
    });
  } catch (error) {
    logger.apiError('/api/agents/creator', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
}

