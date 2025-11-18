import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { z } from 'zod';
import { sanitizeText } from '@/lib/security/sanitize';
import { isValidObjectId } from '@/lib/validation/mongodb';
import {
  PromptCategorySchema,
  PromptPatternSchema,
  QualityRubricSchema,
} from '@/lib/schemas/prompt';

/**
 * Individual Prompt Management API
 * Update specific fields of a prompt (e.g., toggle active status)
 */

// Validation schema for PATCH updates
const PromptPatchSchema = z.object({
  active: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  content: z.string().min(1).optional(),
  category: PromptCategorySchema.optional(),
  pattern: PromptPatternSchema.optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  qualityScore: QualityRubricSchema.optional(),
  source: z.enum(['seed', 'ai-generated', 'user-submitted']).optional(),
});

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

    // Validate ObjectId format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid prompt ID format' }, { status: 400 });
    }

    const body = await request.json();

    // Validate request body
    const validation = PromptPatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid update data',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data;

    const db = await getDb();
    const collection = db.collection('prompts');

    // Build update document with sanitized values
    const updateDoc: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Sanitize text fields if present
    if (validatedData.title) {
      updateDoc.title = sanitizeText(validatedData.title);
    }
    if (validatedData.description) {
      updateDoc.description = sanitizeText(validatedData.description);
    }
    if (validatedData.content) {
      updateDoc.content = sanitizeText(validatedData.content);
    }

    // Add other validated fields
    if (validatedData.active !== undefined) {
      updateDoc.active = validatedData.active;
    }
    if (validatedData.category) {
      updateDoc.category = validatedData.category;
    }
    if (validatedData.pattern) {
      updateDoc.pattern = validatedData.pattern;
    }
    if (validatedData.isPublic !== undefined) {
      updateDoc.isPublic = validatedData.isPublic;
    }
    if (validatedData.isFeatured !== undefined) {
      updateDoc.isFeatured = validatedData.isFeatured;
    }
    if (validatedData.qualityScore) {
      updateDoc.qualityScore = validatedData.qualityScore;
    }
    if (validatedData.source) {
      updateDoc.source = validatedData.source;
    }

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
