import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import {
  CreatePromptSchema,
  UpdatePromptSchema,
  PromptCategorySchema,
} from '@/lib/schemas/prompt';

/**
 * Prompt Management API
 * CRUD operations for prompts in OpsHub
 */

/**
 * Generate a unique slug by appending incremental numbers if collision is detected
 * @param baseSlug - The base slug to use
 * @param collection - MongoDB collection to check for collisions
 * @param excludeId - Optional ObjectId to exclude from collision check (for updates)
 * @returns Object with slug, success flag, and optional error message
 */
async function generateUniqueSlug(
  baseSlug: string,
  collection: any,
  excludeId?: string
): Promise<{ slug: string; success: boolean; error?: string }> {
  let finalSlug = baseSlug;
  let counter = 2;
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const query: Record<string, unknown> = { slug: finalSlug };

    // If excludeId is provided, exclude that document from the search (for updates)
    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const existingSlug = await collection.findOne(query);
    if (!existingSlug) {
      return { slug: finalSlug, success: true };
    }

    finalSlug = `${baseSlug}-${counter}`;
    counter++;
    attempts++;
  }

  return {
    slug: finalSlug,
    success: false,
    error: 'Unable to generate unique slug after 100 attempts',
  };
}

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

    // Validate category parameter
    if (category && category !== 'all') {
      const validCategories = PromptCategorySchema.options;
      if (!validCategories.includes(category as any)) {
        return NextResponse.json(
          {
            error: `Invalid category. Valid values: ${validCategories.join(', ')}, all`,
          },
          { status: 400 }
        );
      }
    }

    // Validate source parameter
    const validSources = ['seed', 'ai-generated', 'user-submitted', 'all'];
    if (source && !validSources.includes(source)) {
      return NextResponse.json(
        {
          error: `Invalid source. Valid values: ${validSources.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate active parameter
    if (active && !['true', 'false', 'all'].includes(active)) {
      return NextResponse.json(
        {
          error:
            'Invalid active param. Must be: true, false, or all',
        },
        { status: 400 }
      );
    }

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection('prompts');

    // Build query - admins see ALL prompts (including inactive)
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (active !== null && active !== 'all') {
      query.active = active === 'true';
    }
    if (source && source !== 'all') query.source = source;

    // Fetch prompts and total count in parallel
    const [prompts, total] = await Promise.all([
      collection
        .find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      prompts: prompts.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
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

    // Zod validation
    let validatedData;
    try {
      validatedData = CreatePromptSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Sanitize user input (after validation)
    const sanitizedTitle = sanitizeText(validatedData.title);
    const sanitizedDescription = validatedData.description
      ? sanitizeText(validatedData.description)
      : '';
    const sanitizedContent = sanitizeText(validatedData.content);

    const db = await getDb();
    const collection = db.collection('prompts');

    // Generate ID and slug
    const promptId = `prompt-${Date.now()}`;
    const baseSlug =
      validatedData.slug ||
      sanitizedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Generate unique slug with auto-increment if collision is detected
    const slugResult = await generateUniqueSlug(baseSlug, collection);
    if (!slugResult.success) {
      return NextResponse.json(
        { error: slugResult.error },
        { status: 500 }
      );
    }
    const slug = slugResult.slug;

    const now = new Date();
    const newPrompt = {
      id: promptId,
      slug,
      title: sanitizedTitle,
      description: sanitizedDescription,
      content: sanitizedContent,
      category: validatedData.category,
      role: validatedData.role,
      experienceLevel: validatedData.experienceLevel,
      pattern: validatedData.pattern,
      designPattern: validatedData.designPattern,
      tags: validatedData.tags || [],
      views: 0,
      ratingCount: 0,
      isPublic: validatedData.isPublic !== false,
      isFeatured: validatedData.isFeatured === true,
      active: validatedData.active !== false,
      source: validatedData.source || 'user-submitted',
      isPremium: validatedData.isPremium === true,
      requiresAuth: validatedData.requiresAuth === true,
      currentRevision: 1,
      createdAt: now,
      updatedAt: now,
      authorId: session?.user?.email || 'admin',
      lastRevisedBy: session?.user?.email,
      lastRevisedAt: now,
      ...(validatedData.qualityScore && { qualityScore: validatedData.qualityScore }),
      ...(validatedData.whatIs && { whatIs: validatedData.whatIs }),
      ...(validatedData.whyUse && { whyUse: validatedData.whyUse }),
      ...(validatedData.metaDescription && { metaDescription: validatedData.metaDescription }),
      ...(validatedData.seoKeywords && { seoKeywords: validatedData.seoKeywords }),
      ...(validatedData.caseStudies && { caseStudies: validatedData.caseStudies }),
      ...(validatedData.examples && { examples: validatedData.examples }),
      ...(validatedData.useCases && { useCases: validatedData.useCases }),
      ...(validatedData.bestPractices && { bestPractices: validatedData.bestPractices }),
      ...(validatedData.bestTimeToUse && { bestTimeToUse: validatedData.bestTimeToUse }),
      ...(validatedData.recommendedModel && { recommendedModel: validatedData.recommendedModel }),
      ...(validatedData.whenNotToUse && { whenNotToUse: validatedData.whenNotToUse }),
      ...(validatedData.difficulty && { difficulty: validatedData.difficulty }),
      ...(validatedData.estimatedTime && { estimatedTime: validatedData.estimatedTime }),
      ...(validatedData.verified !== undefined && { verified: validatedData.verified }),
      ...(validatedData.parameters && { parameters: validatedData.parameters }),
    };

    const result = await collection.insertOne(newPrompt);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `prompt:${promptId}`,
      details: { action: 'create', title: sanitizedTitle, category: validatedData.category },
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

    // Zod validation for update data
    let validatedUpdates;
    try {
      validatedUpdates = UpdatePromptSchema.partial().parse(updates);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    const db = await getDb();
    const collection = db.collection('prompts');

    // Get existing document to check for slug changes
    const existingDoc = await collection.findOne({ _id: new ObjectId(_id) });
    if (!existingDoc) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Sanitize text fields if present (after validation)
    const sanitizedUpdates: Record<string, unknown> = {
      ...validatedUpdates,
      updatedAt: new Date(),
      lastRevisedBy: session?.user?.email,
      lastRevisedAt: new Date(),
    };

    if (validatedUpdates.title) {
      sanitizedUpdates.title = sanitizeText(validatedUpdates.title);
    }
    if (validatedUpdates.description) {
      sanitizedUpdates.description = sanitizeText(validatedUpdates.description);
    }
    if (validatedUpdates.content) {
      sanitizedUpdates.content = sanitizeText(validatedUpdates.content);
    }

    // Handle slug uniqueness: regenerate if title is updated (and no explicit slug provided)
    // or if slug is being directly updated
    if (validatedUpdates.title && !validatedUpdates.slug) {
      // Title is being updated but no custom slug provided, so auto-generate from new title
      const newTitle = sanitizedUpdates.title as string;
      const autoSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const slugResult = await generateUniqueSlug(autoSlug, collection, _id);
      if (!slugResult.success) {
        return NextResponse.json(
          { error: slugResult.error },
          { status: 500 }
        );
      }
      sanitizedUpdates.slug = slugResult.slug;
    } else if (validatedUpdates.slug) {
      // Slug is being explicitly updated, ensure it's unique (excluding current doc)
      const slugResult = await generateUniqueSlug(
        validatedUpdates.slug as string,
        collection,
        _id
      );
      if (!slugResult.success) {
        return NextResponse.json(
          { error: slugResult.error },
          { status: 500 }
        );
      }
      sanitizedUpdates.slug = slugResult.slug;
    }

    // Increment revision if content changed
    if (validatedUpdates.content) {
      sanitizedUpdates.currentRevision = (existingDoc.currentRevision || 1) + 1;
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
      action: 'admin_action',
      resource: `prompt:${_id}`,
      details: { action: 'update', updates: Object.keys(sanitizedUpdates) },
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
      action: 'admin_action',
      resource: `prompt:${_id}`,
      details: { action: 'delete' },
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
