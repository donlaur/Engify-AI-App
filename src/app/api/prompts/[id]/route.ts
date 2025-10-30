import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { logger } from '@/lib/logging/logger';
import { auth } from '@/lib/auth';

/**
 * GET /api/prompts/[id]
 * Fetch a single prompt by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      const prompt = await collection.findOne({ _id: new ObjectId(id) });

      if (!prompt) {
        return NextResponse.json(
          { error: 'Prompt not found' },
          { status: 404 }
        );
      }

      // Increment view count
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { views: 1 } }
      );

      return NextResponse.json({ prompt, source: 'mongodb' });
    } catch (dbError) {
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
    }
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

    const result = await collection.updateOne(
      // User- and org-scoped update: restrict to documents owned by the user in their org
      {
        _id: new ObjectId(id),
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
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
