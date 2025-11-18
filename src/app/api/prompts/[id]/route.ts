import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { auth } from '@/lib/auth';
import { isValidObjectId } from '@/lib/validation/mongodb';
import { sanitizeText } from '@/lib/security/sanitize';
import { cachedJsonResponse, CacheStrategies } from '@/lib/utils/cache-headers';
import { seedPrompts } from '@/data/seed-prompts';
import { createRevision } from '@/lib/db/schemas/prompt-revision';

/**
 * GET /api/prompts/[id]
 * Fetch a single prompt by ID
 * Public access - no authentication required for public prompts
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Sanitize the ID parameter to prevent injection
    const sanitizedId = sanitizeText(id);

    // Validate ID length to prevent DOS
    if (sanitizedId.length > 200) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      // Try finding by id, slug, or _id (only active prompts for public access)
      let prompt = await collection.findOne({
        $and: [
          {
            $or: [
              { id: sanitizedId },
              { slug: sanitizedId },
            ],
          },
          { active: { $ne: false } }, // Only show active prompts
        ],
      });

      // If not found and ID is valid ObjectId format, try MongoDB ObjectId
      if (!prompt && isValidObjectId(sanitizedId)) {
        try {
          prompt = await collection.findOne({
            _id: new ObjectId(sanitizedId),
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

        // Increment view count asynchronously (don't block response)
        if (!prompt.isPremium || isAuthenticated) {
          collection.updateOne(
            { _id: prompt._id },
            { $inc: { views: 1 } }
          ).catch((err) => {
            logger.warn('Failed to increment view count', { error: err, promptId: prompt._id });
          });
        }

        // PERFORMANCE: Add cache headers for static content
        // Public prompts can be cached for 1 hour with stale-while-revalidate
        const cacheStrategy = prompt.isPremium
          ? CacheStrategies.USER_SPECIFIC // Premium content - private cache
          : CacheStrategies.STATIC_CONTENT; // Public content - public cache

        return cachedJsonResponse(
          { prompt, source: 'mongodb' },
          cacheStrategy,
          _request.headers
        );
      }
    } catch (dbError) {
      // Continue to fallback
      logger.warn('MongoDB lookup failed, trying fallback', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      });
    }

    // Fallback to static data
    const prompt = seedPrompts.find((p) => p.id === id);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // PERFORMANCE: Static data can be cached aggressively
    return cachedJsonResponse(
      { prompt, source: 'static' },
      CacheStrategies.STATIC_CONTENT,
      _request.headers
    );
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
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: prompts:write permission required
  const rbacCheck = await RBACPresets.requirePromptWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const { id } = await params;

    // Validate and sanitize ID
    const sanitizedId = sanitizeText(id);
    if (sanitizedId.length > 200) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const body = await request.json();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    // Find existing prompt (try different ID formats)
    let existingPrompt;
    if (isValidObjectId(sanitizedId)) {
      existingPrompt = await collection.findOne({
        $or: [
          { id: sanitizedId },
          { slug: sanitizedId },
          { _id: new ObjectId(sanitizedId) },
        ],
      });
    } else {
      existingPrompt = await collection.findOne({
        $or: [
          { id: sanitizedId },
          { slug: sanitizedId },
        ],
      });
    }

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Get current revision number
    const currentRevision = existingPrompt.currentRevision || 1;
    const newRevision = currentRevision + 1;

    // Create revision before updating
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
  { params }: { params: Promise<{ id: string }> }
) {
  // RBAC: prompts:write permission required
  const rbacCheck = await RBACPresets.requirePromptWrite()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const { id } = await params;

    // Validate and sanitize ID
    const sanitizedId = sanitizeText(id);
    if (!isValidObjectId(sanitizedId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    const collection = db.collection('prompts');

    // User- and org-scoped delete: restrict to documents owned by the user in their org
    const result = await collection.deleteOne({
      _id: new ObjectId(sanitizedId),
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
