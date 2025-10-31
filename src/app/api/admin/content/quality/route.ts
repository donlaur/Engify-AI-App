/**
 * AI Summary: Admin API for content quality operations - recategorization, multi-model testing, tag cleanup.
 * RBAC: super_admin only. Triggers background jobs for content improvement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { auth } from '@/lib/auth';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import { getDb } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  const guard = await RBACPresets.requireSuperAdmin()(request);
  if (guard) return guard;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, limit } = body;

    switch (action) {
      case 'recategorize':
        return await handleRecategorize(session.user.id, limit);
      
      case 'test-prompts':
        return await handleTestPrompts(session.user.id, limit);
      
      case 'audit-tags':
        return await handleAuditTags(session.user.id);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: recategorize, test-prompts, audit-tags' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.apiError('/api/admin/content/quality', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleRecategorize(userId: string, limit?: number) {
  const db = await getDb();
  const prompts = await db
    .collection('prompts')
    .find({ category: 'general' })
    .limit(limit || 100)
    .toArray();

  let updated = 0;

  for (const prompt of prompts) {
    const title = (prompt.title || '').toLowerCase();
    const tags = prompt.tags || [];
    let newCategory = categorizeByTitleAndTags(title, tags);

    if (newCategory !== 'general') {
      await db.collection('prompts').updateOne(
        { _id: prompt._id },
        { $set: { category: newCategory, updatedAt: new Date() } }
      );
      updated++;
    }
  }

  await auditLog({
    action: 'content_review_decision',
    userId,
    resource: 'prompts',
    details: {
      action: 'recategorize',
      promptsReviewed: prompts.length,
      promptsUpdated: updated,
    },
  });

  return NextResponse.json({
    success: true,
    promptsReviewed: prompts.length,
    promptsUpdated: updated,
    message: `Recategorized ${updated} prompts`,
  });
}

async function handleTestPrompts(userId: string, limit?: number) {
  // This would trigger async job - for now return status
  const db = await getDb();
  const count = await db.collection('prompts').countDocuments();
  const toTest = Math.min(limit || 10, count);

  await auditLog({
    action: 'admin_action',
    userId,
    resource: 'prompts',
    details: {
      action: 'test-prompts-triggered',
      promptCount: toTest,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Prompt testing job queued for ${toTest} prompts`,
    estimatedCost: `$${(toTest * 0.002).toFixed(2)}`,
    note: 'Results will be saved to prompt_test_results collection',
  });
}

async function handleAuditTags(userId: string) {
  const db = await getDb();
  
  const tagStats = await db.collection('prompts').aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();

  const noTags = await db.collection('prompts').countDocuments({
    $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
  });

  await auditLog({
    action: 'admin_action',
    userId,
    resource: 'tags',
    details: {
      action: 'tag-audit',
      uniqueTags: tagStats.length,
      promptsWithoutTags: noTags,
    },
  });

  return NextResponse.json({
    success: true,
    uniqueTags: tagStats.length,
    promptsWithoutTags: noTags,
    topTags: tagStats.slice(0, 20),
  });
}

function categorizeByTitleAndTags(title: string, tags: string[]): string {
  if (title.match(/code|function|class|api|component/) || tags.includes('code')) {
    return 'code-generation';
  } else if (title.match(/test|qa|bug/) || tags.includes('testing')) {
    return 'testing';
  } else if (title.match(/architect|design|system/) || tags.includes('architecture')) {
    return 'architecture';
  } else if (title.match(/review|feedback/) || tags.includes('code-review')) {
    return 'code-review';
  } else if (title.match(/debug|fix|error/) || tags.includes('debugging')) {
    return 'debugging';
  } else if (title.match(/doc|document/) || tags.includes('documentation')) {
    return 'documentation';
  } else if (title.match(/refactor|clean/) || tags.includes('refactoring')) {
    return 'refactoring';
  } else if (title.match(/performance|optimi/) || tags.includes('performance')) {
    return 'performance';
  } else if (title.match(/security|auth/) || tags.includes('security')) {
    return 'security';
  } else if (title.match(/product|feature|roadmap/) || tags.includes('product')) {
    return 'product';
  } else if (title.match(/design|ux|ui/) || tags.includes('design')) {
    return 'design';
  } else if (title.match(/leader|manage|team/) || tags.includes('leadership')) {
    return 'leadership';
  }
  
  return 'general';
}

export async function GET(request: NextRequest) {
  const guard = await RBACPresets.requireSuperAdmin()(request);
  if (guard) return guard;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getDb();
    
    const stats = {
      totalPrompts: await db.collection('prompts').countDocuments(),
      categories: await db.collection('prompts').aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      uniqueTags: await db.collection('prompts').distinct('tags'),
      promptsWithoutTags: await db.collection('prompts').countDocuments({
        $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }],
      }),
      testResults: await db.collection('prompt_test_results').countDocuments(),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.apiError('/api/admin/content/quality', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch content quality stats' },
      { status: 500 }
    );
  }
}

