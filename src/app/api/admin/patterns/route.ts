import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';

/**
 * Pattern Management API
 * CRUD operations for prompt engineering patterns in OpsHub
 */

// GET: Fetch patterns
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage patterns
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');

    const db = await getDb();
    const collection = db.collection('patterns');

    // Build query
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;
    if (level && level !== 'all') query.level = level;

    const patterns = await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      patterns: patterns.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    logger.apiError('/api/admin/patterns', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch patterns' },
      { status: 500 }
    );
  }
}

// POST: Create new pattern
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create patterns
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pattern-create-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { id, name, category, level, description, example, useCases, relatedPatterns, icon } = body;

    // Validation
    if (!id || !name || !category || !level || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, category, level, description' },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedName = sanitizeText(name);
    const sanitizedDescription = sanitizeText(description);

    const db = await getDb();
    const collection = db.collection('patterns');

    // Check if pattern ID already exists
    // SECURITY: This query is intentionally system-wide for admin pattern management
    const existing = await collection.findOne({ id });
    if (existing) {
      return NextResponse.json(
        { error: 'Pattern with this ID already exists' },
        { status: 409 }
      );
    }

    const newPattern = {
      id,
      name: sanitizedName,
      category,
      level,
      description: sanitizedDescription,
      example: example || '',
      useCases: useCases || [],
      relatedPatterns: relatedPatterns || [],
      icon: icon || 'lightbulb',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newPattern);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'patterns',
      details: {
        patternId: result.insertedId.toString(),
        name: sanitizedName,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      patternId: result.insertedId.toString(),
    });
  } catch (error) {
    logger.apiError('/api/admin/patterns', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create pattern' },
      { status: 500 }
    );
  }
}

// PUT: Update existing pattern
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update patterns
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pattern-update-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { _id, name, category, level, description, example, useCases, relatedPatterns, icon } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing pattern ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('patterns');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = sanitizeText(name);
    if (category) updateData.category = category;
    if (level) updateData.level = level;
    if (description) updateData.description = sanitizeText(description);
    if (example !== undefined) updateData.example = example;
    if (useCases !== undefined) updateData.useCases = useCases;
    if (relatedPatterns !== undefined) updateData.relatedPatterns = relatedPatterns;
    if (icon !== undefined) updateData.icon = icon;

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'patterns',
      details: {
        patternId: _id,
        name,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount,
    });
  } catch (error) {
    logger.apiError('/api/admin/patterns', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update pattern' },
      { status: 500 }
    );
  }
}

// DELETE: Remove pattern
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can delete patterns
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `pattern-delete-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing pattern ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('patterns');

    // Get pattern before deletion for audit log
    // SECURITY: This query is intentionally system-wide for admin pattern management
    const pattern = await collection.findOne({ _id: new ObjectId(id) });

    // SECURITY: This delete is intentionally system-wide for admin pattern management
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Pattern not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'patterns',
      details: {
        patternId: id,
        name: pattern?.name || 'Unknown',
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error) {
    logger.apiError('/api/admin/patterns', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete pattern' },
      { status: 500 }
    );
  }
}
