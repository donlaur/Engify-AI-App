import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';

/**
 * System Settings Management API
 * CRUD operations for system-wide configuration settings
 */

// GET: Fetch settings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can view settings
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const db = await getDb();
    const collection = db.collection('system_settings');

    // Build query
    // SECURITY: This query is intentionally system-wide for admin settings management
    const query: Record<string, unknown> = {};
    if (category && category !== 'all') query.category = category;

    const settings = await collection
      .find(query)
      .sort({ category: 1, key: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      settings: settings.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    logger.apiError('/api/admin/system-settings', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// POST: Create new setting
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can create settings
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `setting-create-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { key, value, category, description, type } = body;

    // Validation
    if (!key || value === undefined || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: key, value, category' },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedKey = sanitizeText(key);
    const sanitizedDescription = description ? sanitizeText(description) : '';

    const db = await getDb();
    const collection = db.collection('system_settings');

    // Check if setting already exists
    // SECURITY: This query is intentionally system-wide for admin settings management
    const existing = await collection.findOne({ key: sanitizedKey });
    if (existing) {
      return NextResponse.json(
        { error: 'Setting with this key already exists' },
        { status: 409 }
      );
    }

    const newSetting = {
      key: sanitizedKey,
      value,
      category,
      description: sanitizedDescription,
      type: type || 'string',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newSetting);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'system_settings',
      details: {
        settingId: result.insertedId.toString(),
        key: sanitizedKey,
        category,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      settingId: result.insertedId.toString(),
    });
  } catch (error) {
    logger.apiError('/api/admin/system-settings', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create setting' },
      { status: 500 }
    );
  }
}

// PUT: Update existing setting
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update settings
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `setting-update-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { _id, value, description, category } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing setting ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('system_settings');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (value !== undefined) updateData.value = value;
    if (description !== undefined) updateData.description = sanitizeText(description);
    if (category !== undefined) updateData.category = category;

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'system_settings',
      details: {
        settingId: _id,
        updatedFields: Object.keys(updateData),
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount,
    });
  } catch (error) {
    logger.apiError('/api/admin/system-settings', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update setting' },
      { status: 500 }
    );
  }
}

// DELETE: Remove setting
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can delete settings
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `setting-delete-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing setting ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('system_settings');

    // Get setting before deletion for audit log
    // SECURITY: This query is intentionally system-wide for admin settings management
    const setting = await collection.findOne({ _id: new ObjectId(id) });

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // SECURITY: This delete is intentionally system-wide for admin settings management
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'system_settings',
      details: {
        settingId: id,
        key: setting.key || 'Unknown',
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error) {
    logger.apiError('/api/admin/system-settings', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete setting' },
      { status: 500 }
    );
  }
}
