import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { auth } from '@/lib/auth';

/**
 * GET /api/prompts/[id]
 * Fetch a single prompt by ID
 * Public access - no authentication required for public prompts
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      // Try finding by id, slug, or _id (only active prompts for public access)
      let prompt = await collection.findOne({
        $and: [
          {
            $or: [
              { id },
              { slug: id },
            ],
          },
          { active: { $ne: false } }, // Only show active prompts
        ],
      });

      // If not found, try MongoDB ObjectId
      if (!prompt) {
        try {
          prompt = await collection.findOne({
            _id: new ObjectId(id),
            active: { $ne: false },
          });
        } catch {
          // Invalid ObjectId format, continue to fallback
        }
      }

      if (prompt) {
        // Check if prompt requires authentication
        const session = await auth();
        const isAuthenticated = !!session?.user;

        // If prompt requires auth and user is not authenticated
        if (prompt.requiresAuth && !isAuthenticated) {
          return NextResponse.json(
            { error: 'Authentication required', requiresAuth: true },
            { status: 401 }
          );
        }

        // If prompt is premium, check subscription (future: implement subscription check)
        // For now, allow authenticated users to view premium prompts
        if (prompt.isPremium && !isAuthenticated) {
          return NextResponse.json(
            { error: 'Premium subscription required', isPremium: true },
            { status: 403 }
          );
        }

        // Increment view count (only if not premium or user is authenticated)
        if (!prompt.isPremium || isAuthenticated) {
          await collection.updateOne(
            { _id: prompt._id },
            { $inc: { views: 1 } }
          );
        }

        return NextResponse.json({ prompt, source: 'mongodb' });
      }
    } catch (dbError) {
      // Continue to fallback
      logger.warn('MongoDB lookup failed, trying fallback', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      });
    }

    // Fallback to static data
    const { seedPrompts } = await import('@/data/seed-prompts');
    const prompt = seedPrompts.find((p) => p.id === id);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ prompt, source: 'static' });
  } catch (error) {
    logger.apiError('/api/prompts/[id]', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch prompt' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/prompts/[id]
 * Update a prompt
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // RBAC: prompts:write permission required
  const rbacCheck = await RBACPresets.requirePromptWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const { id } = params;
    const body = await request.json();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    // Find existing prompt
    const existingPrompt = await collection.findOne({
      $or: [
        { id },
        { slug: id },
        { _id: new ObjectId(id) },
      ],
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Get current revision number
    const currentRevision = existingPrompt.currentRevision || 1;
    const newRevision = currentRevision + 1;

    // Create revision before updating
    const { createRevision } = await import('@/lib/db/schemas/prompt-revision');
    const revision = createRevision(
      existingPrompt.id || existingPrompt._id.toString(),
      existingPrompt,
      { ...existingPrompt, ...body },
      session.user.id,
      body.changeReason || 'Prompt updated'
    );

    // Save revision
    await db.collection('prompt_revisions').insertOne({
      ...revision,
      revisionNumber: newRevision,
      createdAt: new Date(),
    });

    // Update prompt with new revision info
    const result = await collection.updateOne(
      {
        _id: existingPrompt._id,
      },
      {
        $set: {
          ...body,
          currentRevision: newRevision,
          lastRevisedBy: session.user.id,
          lastRevisedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      revision: newRevision,
    });
  } catch (error) {
    logger.apiError('/api/prompts/[id]', error, { method: 'PATCH' });
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Delete a prompt
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // RBAC: prompts:write permission required
  const rbacCheck = await RBACPresets.requirePromptWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const { id } = params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    // User- and org-scoped delete: restrict to documents owned by the user in their org
    const result = await collection.deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/prompts/[id]', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
