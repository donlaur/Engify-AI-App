import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import { RecommendationSchema } from '@/lib/workflows/recommendation-schema';

/**
 * Recommendation Management API
 * CRUD operations for recommendations in OpsHub
 */

// GET: Fetch all recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage recommendations
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const audience = searchParams.get('audience');
    const priority = searchParams.get('priority');

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection('recommendations');

    // Build query
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (audience && audience !== 'all') {
      query.audience = { $in: [audience] };
    }

    // Fetch recommendations and total count in parallel
    const [recommendations, total] = await Promise.all([
      collection
        .find(query)
        .sort({ updatedAt: -1, slug: 1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      recommendations: recommendations.map((item) => ({
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
    logger.apiError('/api/admin/recommendations', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// POST: Create new recommendation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create recommendations
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `recommendation-create-${session?.user?.email || 'unknown'}`,
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
      validatedData = RecommendationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Sanitize text fields
    const sanitizedData = {
      ...validatedData,
      title: sanitizeText(validatedData.title),
      recommendationStatement: sanitizeText(validatedData.recommendationStatement),
      description: sanitizeText(validatedData.description),
      whyThisMatters: sanitizeText(validatedData.whyThisMatters),
      whenToApply: sanitizeText(validatedData.whenToApply),
      implementationGuidance: validatedData.implementationGuidance
        ? sanitizeText(validatedData.implementationGuidance)
        : undefined,
    };

    const db = await getDb();
    const collection = db.collection('recommendations');

    // Check for duplicate slug
    const existingSlug = await collection.findOne({ slug: sanitizedData.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Recommendation with this slug already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const newRecommendation = {
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
      createdBy: session?.user?.email || 'admin',
    };

    const result = await collection.insertOne(newRecommendation);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `recommendation:${sanitizedData.slug}`,
      details: { action: 'create', title: sanitizedData.title, category: sanitizedData.category },
    });

    return NextResponse.json(
      {
        success: true,
        recommendation: {
          ...newRecommendation,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError('/api/admin/recommendations', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create recommendation' },
      { status: 500 }
    );
  }
}

// PUT: Update existing recommendation
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update recommendations
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `recommendation-update-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing recommendation _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid recommendation ID' }, { status: 400 });
    }

    // Zod validation for update data
    let validatedUpdates;
    try {
      validatedUpdates = RecommendationSchema.partial().parse(updates);
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
    const collection = db.collection('recommendations');

    // Get existing document
    const existingDoc = await collection.findOne({ _id: new ObjectId(_id) });
    if (!existingDoc) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Sanitize text fields if present
    const sanitizedUpdates: Record<string, unknown> = {
      ...validatedUpdates,
      updatedAt: new Date(),
      updatedBy: session?.user?.email,
    };

    if (validatedUpdates.title) {
      sanitizedUpdates.title = sanitizeText(validatedUpdates.title);
    }
    if (validatedUpdates.recommendationStatement) {
      sanitizedUpdates.recommendationStatement = sanitizeText(validatedUpdates.recommendationStatement);
    }
    if (validatedUpdates.description) {
      sanitizedUpdates.description = sanitizeText(validatedUpdates.description);
    }
    if (validatedUpdates.whyThisMatters) {
      sanitizedUpdates.whyThisMatters = sanitizeText(validatedUpdates.whyThisMatters);
    }
    if (validatedUpdates.whenToApply) {
      sanitizedUpdates.whenToApply = sanitizeText(validatedUpdates.whenToApply);
    }
    if (validatedUpdates.implementationGuidance) {
      sanitizedUpdates.implementationGuidance = sanitizeText(validatedUpdates.implementationGuidance);
    }

    // Check for slug collision if slug is being updated
    if (validatedUpdates.slug && validatedUpdates.slug !== existingDoc.slug) {
      const slugExists = await collection.findOne({
        slug: validatedUpdates.slug,
        _id: { $ne: new ObjectId(_id) },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Recommendation with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: sanitizedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `recommendation:${_id}`,
      details: { action: 'update', updates: Object.keys(sanitizedUpdates) },
    });

    const updated = await collection.findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      recommendation: {
        ...updated,
        _id: updated?._id.toString(),
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/recommendations', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a recommendation
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can delete recommendations
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `recommendation-delete-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing recommendation _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid recommendation ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('recommendations');

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `recommendation:${_id}`,
      details: { action: 'delete' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/admin/recommendations', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete recommendation' },
      { status: 500 }
    );
  }
}
