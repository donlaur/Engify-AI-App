import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import {
  AffiliateLinkSchema,
  PartnershipOutreachSchema,
} from '@/lib/db/schemas/affiliate-config';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logging/logger';
import { auditLog } from '@/lib/logging/audit';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * GET /api/admin/affiliate-links
 * Fetch all affiliate links (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user?.id || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(identifier, 'authenticated');

    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const db = await getDb();

    // SECURITY: This query is intentionally system-wide - affiliate_config is admin-only, not multi-tenant
    // Fetch affiliate links
    const linksCollection = await db
      .collection('affiliate_config')
      .find({})
      .toArray();
    const links = linksCollection.map((link: any) => ({
      _id: link._id?.toString(),
      tool: link.tool,
      baseUrl: link.baseUrl,
      referralUrl: link.referralUrl,
      affiliateCode: link.affiliateCode,
      commission: link.commission,
      status: link.status,
      notes: link.notes,
      clickCount: link.clickCount || 0,
      conversionCount: link.conversionCount || 0,
      lastClickAt: link.lastClickAt,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    // SECURITY: This query is intentionally system-wide - partnership_outreach is admin-only
    // Fetch partnership outreach
    const outreachCollection = await db
      .collection('partnership_outreach')
      .find({})
      .toArray();
    const outreach = outreachCollection.map((item: any) => ({
      _id: item._id?.toString(),
      company: item.company,
      priority: item.priority,
      contact: item.contact,
      rating: item.rating,
      traffic: item.traffic,
      status: item.status,
      notes: item.notes,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      links,
      outreach,
    });
  } catch (error) {
    logger.apiError('/api/admin/affiliate-links', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch affiliate links' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/affiliate-links
 * Create or update affiliate link (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user?.id || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(identifier, 'authenticated');

    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { type, data } = body;

    const db = await getDb();

    if (type === 'link') {
      const validated = AffiliateLinkSchema.parse(data);
      const now = new Date();

      const result = await db.collection('affiliate_config').updateOne(
        { tool: validated.tool },
        {
          $set: {
            ...validated,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
            clickCount: 0,
            conversionCount: 0,
          },
        },
        { upsert: true }
      );

      // Audit logging
      await auditLog({
        userId: session.user?.id || 'unknown',
        action: result.upsertedId
          ? ('admin_action' as const)
          : ('admin_action' as const),
        resource: 'affiliate_config',
        details: {
          operation: result.upsertedId ? 'created' : 'updated',
          tool: validated.tool,
          status: validated.status,
        },
      });

      return NextResponse.json({
        success: true,
        upserted: result.upsertedId,
        modified: result.modifiedCount,
      });
    }

    if (type === 'outreach') {
      const validated = PartnershipOutreachSchema.parse(data);
      const now = new Date();

      const result = await db.collection('partnership_outreach').updateOne(
        { company: validated.company },
        {
          $set: {
            ...validated,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
      );

      // Audit logging
      await auditLog({
        userId: session.user?.id || 'unknown',
        action: 'admin_action' as const,
        resource: 'partnership_outreach',
        details: {
          operation: result.upsertedId ? 'created' : 'updated',
          company: validated.company,
          status: validated.status,
        },
      });

      return NextResponse.json({
        success: true,
        upserted: result.upsertedId,
        modified: result.modifiedCount,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    logger.apiError('/api/admin/affiliate-links', error, { method: 'POST' });
    return NextResponse.json(
      { error: 'Failed to update affiliate links' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/affiliate-links
 * Delete affiliate link (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = session.user?.id || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitResult = await checkRateLimit(identifier, 'authenticated');

    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Missing type or id' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collectionName =
      type === 'link' ? 'affiliate_config' : 'partnership_outreach';

    // SECURITY: This query is intentionally system-wide - admin data only
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    // Audit logging
    await auditLog({
      userId: session.user?.id || 'unknown',
      action: 'admin_action' as const,
      resource: collectionName,
      details: { operation: 'deleted', id },
    });

    return NextResponse.json({
      success: result.deletedCount > 0,
    });
  } catch (error) {
    logger.apiError('/api/admin/affiliate-links', error, { method: 'DELETE' });
    return NextResponse.json(
      { error: 'Failed to delete affiliate link' },
      { status: 500 }
    );
  }
}
