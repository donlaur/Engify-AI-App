/**
 * AI Summary: API route for triggering automated content creation using CreatorAgent.
 * Protected by RBAC (org_admin/super_admin). Part of Day 5 Phase 2.5.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { RBACPresets } from '@/lib/middleware/rbac';
import { CreatorAgent } from '@/lib/agents/CreatorAgent';
import { AIProviderFactory } from '@/lib/execution/factory/AIProviderFactory';
import { auditLog } from '@/lib/logging/audit';
import { z } from 'zod';

const createContentSchema = z.object({
  topic: z.string().min(3).max(200),
  category: z.enum(['engineering', 'product', 'design', 'marketing', 'sales', 'support', 'general']),
  targetWordCount: z.number().min(100).max(2000).optional(),
  tags: z.array(z.string()).max(10).optional(),
  sourceUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permissions
    const rbacCheck = await RBACPresets.requireSuperAdmin(request, session);
    if (rbacCheck) {
      return rbacCheck; // Returns 403 if not authorized
    }

    // Parse and validate request
    const body = await request.json();
    const validation = createContentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { topic, category, targetWordCount, tags, sourceUrl } = validation.data;

    // Initialize CreatorAgent
    const providerFactory = new AIProviderFactory();
    const creatorAgent = new CreatorAgent(providerFactory);

    // Create content
    const result = await creatorAgent.createContent({
      topic,
      category,
      targetWordCount,
      tags,
      sourceUrl,
    });

    // Audit log the action
    await auditLog({
      action: result.success ? 'content_creation_triggered' : 'content_creation_failed',
      userId: session.user.id,
      resourceType: 'content',
      resourceId: result.contentId || 'failed',
      metadata: {
        topic,
        category,
        targetWordCount,
        tags,
        success: result.success,
        wordCount: result.wordCount,
        cost: result.cost,
        error: result.error,
      },
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        contentId: result.contentId,
        wordCount: result.wordCount,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        message: 'Content created successfully and queued for review',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Content creation failed',
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in content creation API:', error);

    // Audit log the error
    try {
      const session = await auth();
      if (session?.user?.id) {
        await auditLog({
          action: 'content_creation_error',
          userId: session.user.id,
          resourceType: 'content',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    } catch (auditError) {
      console.error('Failed to audit log error:', auditError);
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
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check RBAC permissions
    const rbacCheck = await RBACPresets.requireSuperAdmin(request, session);
    if (rbacCheck) {
      return rbacCheck;
    }

    // Get statistics
    const providerFactory = new AIProviderFactory();
    const creatorAgent = new CreatorAgent(providerFactory);
    const stats = await creatorAgent.getStats();

    return NextResponse.json({
      stats,
      message: 'Content creation statistics retrieved successfully',
    });

  } catch (error) {
    console.error('Error retrieving content creation stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve statistics' },
      { status: 500 }
    );
  }
}
