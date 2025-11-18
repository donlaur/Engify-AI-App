import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import { WorkflowSchema } from '@/lib/workflows/workflow-schema';

/**
 * Workflow Management API
 * CRUD operations for workflows in OpsHub
 */

// GET: Fetch all workflows
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage workflows
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const audience = searchParams.get('audience');

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    const db = await getDb();
    const collection = db.collection('workflows');

    // Build query
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;
    if (audience && audience !== 'all') {
      query.audience = { $in: [audience] };
    }

    // Fetch workflows and total count in parallel
    const [workflows, total] = await Promise.all([
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
      workflows: workflows.map((item) => ({
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
    logger.apiError('/api/admin/workflows', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

// POST: Create new workflow
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create workflows
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `workflow-create-${session?.user?.email || 'unknown'}`,
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
      validatedData = WorkflowSchema.parse(body);
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
      problemStatement: sanitizeText(validatedData.problemStatement),
      manualChecklist: validatedData.manualChecklist.map(item => sanitizeText(item)),
    };

    const db = await getDb();
    const collection = db.collection('workflows');

    // Check for duplicate slug
    const existingSlug = await collection.findOne({ slug: sanitizedData.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Workflow with this slug already exists' },
        { status: 409 }
      );
    }

    const now = new Date();
    const newWorkflow = {
      ...sanitizedData,
      createdAt: now,
      updatedAt: now,
      createdBy: session?.user?.email || 'admin',
    };

    const result = await collection.insertOne(newWorkflow);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `workflow:${sanitizedData.slug}`,
      details: { action: 'create', title: sanitizedData.title, category: sanitizedData.category },
    });

    return NextResponse.json(
      {
        success: true,
        workflow: {
          ...newWorkflow,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.apiError('/api/admin/workflows', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// PUT: Update existing workflow
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update workflows
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `workflow-update-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing workflow _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    // Zod validation for update data
    let validatedUpdates;
    try {
      validatedUpdates = WorkflowSchema.partial().parse(updates);
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
    const collection = db.collection('workflows');

    // Get existing document
    const existingDoc = await collection.findOne({ _id: new ObjectId(_id) });
    if (!existingDoc) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
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
    if (validatedUpdates.problemStatement) {
      sanitizedUpdates.problemStatement = sanitizeText(validatedUpdates.problemStatement);
    }
    if (validatedUpdates.manualChecklist) {
      sanitizedUpdates.manualChecklist = validatedUpdates.manualChecklist.map(item => sanitizeText(item));
    }

    // Check for slug collision if slug is being updated
    if (validatedUpdates.slug && validatedUpdates.slug !== existingDoc.slug) {
      const slugExists = await collection.findOne({
        slug: validatedUpdates.slug,
        _id: { $ne: new ObjectId(_id) },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Workflow with this slug already exists' },
          { status: 409 }
        );
      }
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: sanitizedUpdates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `workflow:${_id}`,
      details: { action: 'update', updates: Object.keys(sanitizedUpdates) },
    });

    const updated = await collection.findOne({ _id: new ObjectId(_id) });

    return NextResponse.json({
      success: true,
      workflow: {
        ...updated,
        _id: updated?._id.toString(),
      },
    });
  } catch (error) {
    logger.apiError('/api/admin/workflows', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workflow
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can delete workflows
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `workflow-delete-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing workflow _id' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ error: 'Invalid workflow ID' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('workflows');

    const result = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: `workflow:${_id}`,
      details: { action: 'delete' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/admin/workflows', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
