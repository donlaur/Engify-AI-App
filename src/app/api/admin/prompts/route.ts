import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import { UpdatePromptSchema } from '@/lib/schemas/prompt';

/**
 * Prompt Management API
 * CRUD operations for prompts in OpsHub
 */

// GET: Fetch all prompts (including inactive for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage prompts
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const active = searchParams.get('active');
    const source = searchParams.get('source');

    const db = await getDb();
    const collection = db.collection('prompts');

    // Build query - admins see ALL prompts (including inactive)
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (active !== null && active !== 'all') {
      query.active = active === 'true';
    }
    if (source && source !== 'all') query.source = source;

    const prompts = await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(500)
      .toArray();

    return NextResponse.json({
      success: true,
      prompts: prompts.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    logger.apiError('/api/admin/prompts', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}

// POST: Create new prompt
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create prompts
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `prompt-create-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Validation
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, category' },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedTitle = sanitizeText(body.title);
    const sanitizedDescription = body.description
      ? sanitizeText(body.description)
      : '';
    const sanitizedContent = sanitizeText(body.content);

    const db = await getDb();
    const collection = db.collection('prompts');

    // Generate ID and slug
    const promptId = `prompt-${Date.now()}`;
    const slug =
      body.slug ||
      sanitizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Check for duplicate slug
    const existingSlug = await collection.findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists. Please choose a different title.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const newPrompt = {
      id: promptId,
      slug,
      title: sanitizedTitle,
      description: sanitizedDescription,
      content: sanitizedContent,
      category: body.category,
      role: body.role,
      experienceLevel: body.experienceLevel,
      pattern: body.pattern,
      designPattern: body.designPattern,
      tags: body.tags || [],
      views: 0,
      ratingCount: 0,
      isPublic: body.isPublic !== false,
      isFeatured: body.isFeatured === true,
      active: body.active !== false,
      source: body.source || 'user-submitted',
      isPremium: body.isPremium === true,
      requiresAuth: body.requiresAuth === true,
      currentRevision: 1,
      createdAt: now,
      updatedAt: now,
      authorId: session?.user?.email || 'admin',
      lastRevisedBy: session?.user?.email,
      lastRevisedAt: now,
      ...(body.qualityScore && { qualityScore: body.qualityScore }),
      ...(body.whatIs && { whatIs: body.whatIs }),
      ...(body.whyUse && { whyUse: body.whyUse }),
      ...(body.metaDescription && { metaDescription: body.metaDescription }),
      ...(body.seoKeywords && { seoKeywords: body.seoKeywords }),
      ...(body.caseStudies && { caseStudies: body.caseStudies }),
      ...(body.examples && { examples: body.examples }),
      ...(body.useCases && { useCases: body.useCases }),
      ...(body.bestPractices && { bestPractices: body.bestPractices }),
      ...(body.bestTimeToUse && { bestTimeToUse: body.bestTimeToUse }),
      ...(body.recommendedModel && { recommendedModel: body.recommendedModel }),
      ...(body.whenNotToUse && { whenNotToUse: body.whenNotToUse }),
      ...(body.difficulty && { difficulty: body.difficulty }),
      ...(body.estimatedTime && { estimatedTime: body.estimatedTime }),
      ...(body.verified !== undefined && { verified: body.verified }),
      ...(body.parameters && { parameters: body.parameters }),
    };

    const result = await collection.insertOne(newPrompt);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'prompts.create',
      resource: `prompt:${promptId}`,
      details: { title: sanitizedTitle, category: body.category },
    });

    return NextResponse.json(
      {
        success: true,
        prompt: {
          ...newPrompt,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError('/api/admin/prompts', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}

// PUT: Update existing prompt
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update prompts
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `prompt-update-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { _id, ...updates } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing prompt _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('prompts');

    // Sanitize text fields if present
    const sanitizedUpdates: Record<string, unknown> = {
      ...updates,
      updatedAt: new Date(),
      lastRevisedBy: session?.user?.email,
      lastRevisedAt: new Date(),
    };

    if (updates.title) {
      sanitizedUpdates.title = sanitizeText(updates.title);
    }
    if (updates.description) {
      sanitizedUpdates.description = sanitizeText(updates.description);
    }
    if (updates.content) {
      sanitizedUpdates.content = sanitizeText(updates.content);
    }

    // Increment revision if content changed
    if (updates.content) {
      const existing = await collection.findOne({ _id: new ObjectId(_id) });
      if (existing) {
        sanitizedUpdates.currentRevision = (existing.currentRevision || 1) + 1;
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: sanitizedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'prompts.update',
      resource: `prompt:${_id}`,
      details: { updates: Object.keys(sanitizedUpdates) },
    });

    const updated = await collection.findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      prompt: {
        ...updated,
        _id: updated?._id.toString(),
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/prompts', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a prompt
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can delete prompts
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `prompt-delete-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get('_id');

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing prompt _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('prompts');

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'prompts.delete',
      resource: `prompt:${_id}`,
      details: {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/admin/prompts', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
