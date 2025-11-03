import { NextRequest, NextResponse } from 'next/server';
import { RBACPresets } from '@/lib/middleware/rbac';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const IndexRequestSchema = z.object({
  hashes: z.array(z.string().min(32)).max(100).optional(),
});

function isIndexerEnabled(): boolean {
  const flag = process.env.RAG_INDEX_ENABLED;
  return flag === '1' || flag === 'true' || flag === 'yes';
}

export async function GET(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const rateLimitResult = await checkRateLimit(
    `admin-index-${ip}`,
    'authenticated'
  );
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', reason: rateLimitResult.reason },
      { status: 429 }
    );
  }

  if (!isIndexerEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Indexer disabled' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, status: 'ok', mode: 'stub' });
}

export async function POST(request: NextRequest) {
  const r = await RBACPresets.requireSuperAdmin()(request);
  if (r) return r;

  // Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const rateLimitResult = await checkRateLimit(
    `admin-index-post-${ip}`,
    'authenticated'
  );
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded', reason: rateLimitResult.reason },
      { status: 429 }
    );
  }

  if (!isIndexerEnabled()) {
    return NextResponse.json(
      { success: false, error: 'Indexer disabled' },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = IndexRequestSchema.safeParse(body);
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

  const hashes = parsed.data.hashes ?? [];
  // Stub: pretend to enqueue indexing jobs; just echo count for now
  return NextResponse.json({ success: true, enqueued: hashes.length });
}
