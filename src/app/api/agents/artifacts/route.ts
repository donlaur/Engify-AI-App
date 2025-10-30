import { NextRequest, NextResponse } from 'next/server';
import { withRBAC } from '@/lib/middleware/rbac';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';

const featureEnabled = process.env.AGENTS_SANDBOX_ENABLED === 'true';

export async function POST(request: NextRequest) {
  // Feature flag gate
  if (!featureEnabled) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 });
  }

  // Admin/org-admin/super-admin only
  const rbac = await withRBAC({ roles: ['org_admin', 'super_admin'] })(request);
  if (rbac) return rbac;

  try {
    const body = (await request.json()) as {
      summary?: string;
      outline?: string[];
      draft?: string;
      tags?: string[];
    };
    const now = new Date();
    const doc = {
      title: body.summary ?? 'Agent Artifact',
      description: (body.outline || []).join(' '),
      text: body.draft ?? '',
      canonicalUrl: null as string | null,
      source: 'agents_sandbox',
      hash: `${now.getTime()}-${Math.random().toString(36).slice(2)}`,
      lang: 'en',
      readingMinutes: 1,
      quality: { hasTitle: true, hasDescription: true, minWordsMet: true },
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    await db.collection(Collections.WEB_CONTENT).insertOne(doc as never);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
