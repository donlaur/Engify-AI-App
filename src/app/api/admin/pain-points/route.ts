import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import { PainPointSchema } from '@/lib/workflows/pain-point-schema';

/**
 * Pain Point Management API
 * CRUD operations for pain points in OpsHub
 */

// GET: Fetch all pain points
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage pain points
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection('pain_points');

    // Build query
    const query: Record<string, unknown> = {};
    if (status && status !== 'all') query.status = status;

    // Fetch pain points and total count in parallel
    const [painPoints, total] = await Promise.all([
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
      painPoints: painPoints.map((item) => ({
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
    logger.apiError('/api/admin/pain-points', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch pain points' },
      { status: 500 }
    );
  }
}

// POST: Create new pain point
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create pain points
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pain-point-create-${session?.user?.email || 'unknown'}`,
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
      validatedData = PainPointSchema.parse(body);
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
      description: sanitizeText(validatedData.description),
      coreProblem: validatedData.coreProblem
        ? sanitizeText(validatedData.coreProblem)
        : undefined,
      problemStatement: sanitizeText(validatedData.problemStatement),
      impact: validatedData.impact ? sanitizeText(validatedData.impact) : undefined,
      examples: validatedData.examples.map((item) => sanitizeText(item)),
      expandedExamples: validatedData.expandedExamples.map((example) => ({
        title: sanitizeText(example.title),
        description: sanitizeText(example.description),
      })),
      solutionWorkflows: validatedData.solutionWorkflows.map((workflow) => ({
        workflowId: workflow.workflowId,
        title: sanitizeText(workflow.title),
        painPointItSolves: sanitizeText(workflow.painPointItSolves),
        whyItWorks: sanitizeText(workflow.whyItWorks),
      })),
    };

    const db = await getDb();
    const collection = db.collection('pain_points');

    // Check for duplicate slug
    const existingSlug = await collection.findOne({ slug: sanitizedData.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Pain point with this slug already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const newPainPoint = {
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
      createdBy: session?.user?.email || 'admin',
    };

    const result = await collection.insertOne(newPainPoint);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `pain-point:${sanitizedData.slug}`,
      details: { action: 'create', title: sanitizedData.title },
    });

    return NextResponse.json(
      {
        success: true,
        painPoint: {
          ...newPainPoint,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError('/api/admin/pain-points', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create pain point' },
      { status: 500 }
    );
  }
}

// PUT: Update existing pain point
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update pain points
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pain-point-update-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing pain point _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid pain point ID' }, { status: 400 });
    }

    // Zod validation for update data
    let validatedUpdates;
    try {
      validatedUpdates = PainPointSchema.partial().parse(updates);
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
    const collection = db.collection('pain_points');

    // Get existing document
    const existingDoc = await collection.findOne({ _id: new ObjectId(_id) });
    if (!existingDoc) {
      return NextResponse.json({ error: 'Pain point not found' }, { status: 404 });
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
    if (validatedUpdates.description) {
      sanitizedUpdates.description = sanitizeText(validatedUpdates.description);
    }
    if (validatedUpdates.coreProblem) {
      sanitizedUpdates.coreProblem = sanitizeText(validatedUpdates.coreProblem);
    }
    if (validatedUpdates.problemStatement) {
      sanitizedUpdates.problemStatement = sanitizeText(validatedUpdates.problemStatement);
    }
    if (validatedUpdates.impact) {
      sanitizedUpdates.impact = sanitizeText(validatedUpdates.impact);
    }
    if (validatedUpdates.examples) {
      sanitizedUpdates.examples = validatedUpdates.examples.map((item) =>
        sanitizeText(item)
      );
    }
    if (validatedUpdates.expandedExamples) {
      sanitizedUpdates.expandedExamples = validatedUpdates.expandedExamples.map(
        (example) => ({
          title: sanitizeText(example.title),
          description: sanitizeText(example.description),
        })
      );
    }
    if (validatedUpdates.solutionWorkflows) {
      sanitizedUpdates.solutionWorkflows = validatedUpdates.solutionWorkflows.map(
        (workflow) => ({
          workflowId: workflow.workflowId,
          title: sanitizeText(workflow.title),
          painPointItSolves: sanitizeText(workflow.painPointItSolves),
          whyItWorks: sanitizeText(workflow.whyItWorks),
        })
      );
    }

    // Check for slug collision if slug is being updated
    if (validatedUpdates.slug && validatedUpdates.slug !== existingDoc.slug) {
      const slugExists = await collection.findOne({
        slug: validatedUpdates.slug,
        _id: { $ne: new ObjectId(_id) },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Pain point with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: sanitizedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Pain point not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `pain-point:${_id}`,
      details: { action: 'update', updates: Object.keys(sanitizedUpdates) },
    });

    const updated = await collection.findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      painPoint: {
        ...updated,
        _id: updated?._id.toString(),
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/pain-points', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update pain point' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a pain point
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can delete pain points
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pain-point-delete-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing pain point _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid pain point ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('pain_points');

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Pain point not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `pain-point:${_id}`,
      details: { action: 'delete' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/admin/pain-points', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete pain point' },
      { status: 500 }
    );
  }
}
