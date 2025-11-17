import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';

/**
 * Individual Prompt Management API
 * Update specific fields of a prompt (e.g., toggle active status)
 */

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update prompts
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `prompt-patch-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { id } = await context.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    const body = await request.json();

    const db = await getDb();
    const collection = db.collection('prompts');

    // Build update document (allow partial updates)
    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Allow toggling active status
    if (body.active !== undefined) {
      updateDoc.active = Boolean(body.active);
    }

    // Allow updating other fields
    if (body.title) updateDoc.title = body.title;
    if (body.description) updateDoc.description = body.description;
    if (body.content) updateDoc.content = body.content;
    if (body.category) updateDoc.category = body.category;
    if (body.isPublic !== undefined) updateDoc.isPublic = body.isPublic;
    if (body.isFeatured !== undefined) updateDoc.isFeatured = body.isFeatured;
    if (body.qualityScore) updateDoc.qualityScore = body.qualityScore;
    if (body.source) updateDoc.source = body.source;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `prompt:${id}`,
      details: { action: 'patch', fields: Object.keys(updateDoc) },
    });

    const updated = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      prompt: {
        ...updated,
        _id: updated?._id.toString(),
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/prompts/[id]', error, { method: 'PATCH' });
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}
