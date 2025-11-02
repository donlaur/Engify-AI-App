import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/logging/audit';
import { sanitizeText } from '@/lib/security/sanitize';
import { ObjectId } from 'mongodb';

/**
 * Content Management API
 * CRUD operations for learning content in OpsHub CMS
 */

// GET: Fetch content items
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage content
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-manage-${session?.user?.email}`,
      10,
      60
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');

    const db = await getDb();
    const collection = db.collection('learning_content');

    // SECURITY: This query is intentionally system-wide
    const query: Record<string, unknown> = {};
    if (type && type !== 'all') query.type = type;
    if (category) query.category = category;

    const content = await collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      content: content.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST: Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create content
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-create-${session?.user?.email}`,
      5,
      60
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { type, category, title, content, tags } = body;

    // Validation
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, content' },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedTitle = sanitizeText(title);
    const sanitizedContent = sanitizeText(content);
    const sanitizedCategory = category ? sanitizeText(category) : '';
    const sanitizedTags = Array.isArray(tags)
      ? tags.map((tag: string) => sanitizeText(tag))
      : [];

    const db = await getDb();
    const collection = db.collection('learning_content');

    const newContent = {
      type,
      category: sanitizedCategory,
      title: sanitizedTitle,
      content: sanitizedContent,
      tags: sanitizedTags,
      metadata: {
        createdBy: session?.user?.email,
        difficulty: 'intermediate',
      },
      searchableText: `${sanitizedTitle} ${sanitizedContent} ${sanitizedTags.join(' ')}`.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newContent);

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'content_created',
      details: {
        contentId: result.insertedId.toString(),
        type,
        title,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      contentId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// PUT: Update existing content
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can update content
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-update-${session?.user?.email}`,
      10,
      60
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { _id, type, category, title, content, tags } = body;

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('learning_content');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (type) updateData.type = type;
    if (category !== undefined) updateData.category = sanitizeText(category);
    if (title) updateData.title = sanitizeText(title);
    if (content) {
      const sanitizedContent = sanitizeText(content);
      const sanitizedTitle = title ? sanitizeText(title) : '';
      const sanitizedTags = Array.isArray(tags)
        ? tags.map((tag: string) => sanitizeText(tag))
        : [];
      
      updateData.content = sanitizedContent;
      updateData.searchableText = `${sanitizedTitle} ${sanitizedContent} ${sanitizedTags.join(' ')}`.toLowerCase();
    }
    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags.map((tag: string) => sanitizeText(tag))
        : [];
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'content_updated',
      details: {
        contentId: _id,
        title,
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}

// DELETE: Remove content
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can delete content
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-delete-${session?.user?.email}`,
      5,
      60
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
        { error: 'Missing content ID' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection('learning_content');

    // Get content title before deletion for audit log
    const contentItem = await collection.findOne({ _id: new ObjectId(id) });

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Audit log
    await auditLog({
      userId: session?.user?.email || 'unknown',
      action: 'content_deleted',
      details: {
        contentId: id,
        title: contentItem?.title || 'Unknown',
        type: contentItem?.type || 'Unknown',
      },
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}

