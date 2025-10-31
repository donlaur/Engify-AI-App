import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { z } from 'zod';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { auditLog } from '@/lib/logging/audit';

const UpdateSchema = z.object({
  hash: z.string().min(32),
  action: z.enum(['approve', 'reject']),
});

export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';
  const orgId =
    (session?.user as { organizationId?: string | null } | null)
      ?.organizationId || null;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'pending';
  const source = searchParams.get('source');
  const limit = Number(searchParams.get('limit') ?? '20');
  const db = await getDb();

  const baseQuery: Record<string, unknown> = { reviewStatus: status };

  // Add source filter if specified
  if (source && source !== 'all') {
    baseQuery.source = source;
  }

  const query =
    role === 'super_admin' || !orgId
      ? baseQuery
      : { ...baseQuery, organizationId: new ObjectId(orgId) };
  const items = await db
    .collection(Collections.WEB_CONTENT)
    .find(query)
    .sort({ createdAt: -1 })
    .limit(Number.isFinite(limit) ? limit : 20)
    .project({ title: 1, source: 1, createdAt: 1, hash: 1, reviewStatus: 1 })
    .toArray();
  return NextResponse.json({ success: true, data: items });
}

export async function PATCH(request: NextRequest) {
  const r = await RBACPresets.requireOrgAdmin()(request);
  if (r) return r;

  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';
  const orgId =
    (session?.user as { organizationId?: string | null } | null)
      ?.organizationId || null;

  const body = await request.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: parsed.error.issues,
      },
      { status: 400 }
    );
  }
  const { hash, action } = parsed.data;
  const db = await getDb();
  const reviewStatus = action === 'approve' ? 'approved' : 'rejected';
  const filter: Record<string, unknown> =
    role === 'super_admin' || !orgId
      ? { hash }
      : { hash, organizationId: new ObjectId(orgId) };
  const res = await db
    .collection(Collections.WEB_CONTENT)
    .updateOne(filter, { $set: { reviewStatus } });

  await auditLog({
    action: 'content_review_decision',
    userId: session?.user?.id,
    resource: `/api/admin/content/review/${hash}`,
    details: {
      hash,
      action,
      reviewStatus,
      matched: res.matchedCount,
      modified: res.modifiedCount,
    },
  });

  return NextResponse.json({
    success: true,
    matched: res.matchedCount,
    modified: res.modifiedCount,
  });
}
