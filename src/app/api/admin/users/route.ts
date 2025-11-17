import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';

/**
 * User Management API
 * CRUD operations for user accounts in OpsHub
 */

// GET: Fetch users
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage users
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const planFilter = searchParams.get('plan');
    const roleFilter = searchParams.get('role');

    const db = await getDb();
    const collection = db.collection('users');

    // Build query
    // SECURITY: This query is intentionally system-wide for admin user management
    const query: Record<string, unknown> = {};
    if (planFilter && planFilter !== 'all') query.plan = planFilter;
    if (roleFilter && roleFilter !== 'all') query.role = roleFilter;

    const users = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(500)
      .project({ password: 0 }) // Exclude password from results
      .toArray();

    return NextResponse.json({
      success: true,
      users: users.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    logger.apiError('/api/admin/users', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST: Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create users
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `user-create-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, name, role: userRole, plan } = body;

    // Validation
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedName = sanitizeText(name);
    const sanitizedEmail = email.toLowerCase().trim();

    const db = await getDb();
    const collection = db.collection('users');

    // Check if user already exists
    // SECURITY: This query is intentionally system-wide for admin user management
    const existing = await collection.findOne({ email: sanitizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = {
      email: sanitizedEmail,
      name: sanitizedName,
      role: userRole || 'user',
      plan: plan || 'free',
      emailVerified: false,
      onboardingCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newUser);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'users',
      details: {
        userId: result.insertedId.toString(),
        email: sanitizedEmail,
        name: sanitizedName,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    logger.apiError('/api/admin/users', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PUT: Update existing user
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update users
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `user-update-${session?.user?.email || 'unknown'}`,
      'authenticated'
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { _id, name, role: userRole, plan, emailVerified, onboardingCompleted } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('users');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = sanitizeText(name);
    if (userRole) updateData.role = userRole;
    if (plan) updateData.plan = plan;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'users',
      details: {
        userId: _id,
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
    logger.apiError('/api/admin/users', error, { method: 'PUT' });
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE: Remove user
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can delete users
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `user-delete-${session?.user?.email || 'unknown'}`,
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
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('users');

    // Get user before deletion for audit log
    // SECURITY: This query is intentionally system-wide for admin user management
    const user = await collection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (user.email === session?.user?.email) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // SECURITY: This delete is intentionally system-wide for admin user management
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'admin_action',
      resource: 'users',
      details: {
        userId: id,
        email: user.email || 'Unknown',
        name: user.name || 'Unknown',
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error) {
    logger.apiError('/api/admin/users', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
