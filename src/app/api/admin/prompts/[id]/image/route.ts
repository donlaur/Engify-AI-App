import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { RBACPresets } from '@/lib/middleware/rbac';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';
import { ImageAssetService } from '@/lib/services/ImageAssetService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await RBACPresets.requireSuperAdmin()(request);
  if (guard) return guard;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Prompt ID is required' },
      { status: 400 }
    );
  }

  const db = await getDb();
  const prompt = await db
    .collection(Collections.PROMPT_TEMPLATES as string)
    .findOne({ _id: new ObjectId(id) });

  if (!prompt) {
    return NextResponse.json(
      { success: false, error: 'Prompt not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, media: prompt.media ?? null });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await RBACPresets.requireSuperAdmin()(request);
  if (guard) return guard;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Prompt ID is required' },
      { status: 400 }
    );
  }

  const db = await getDb();
  const prompt = await db
    .collection(Collections.PROMPT_TEMPLATES as string)
    .findOne({ _id: new ObjectId(id) });

  if (!prompt) {
    return NextResponse.json(
      { success: false, error: 'Prompt not found' },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const title = typeof prompt.title === 'string' ? prompt.title : 'Prompt';
  const descriptionCandidate =
    typeof body.description === 'string'
      ? body.description
      : typeof prompt.description === 'string'
        ? prompt.description
        : undefined;

  const media = await ImageAssetService.generateAndPersistPromptMedia({
    promptId: id,
    title,
    description: descriptionCandidate,
  });

  return NextResponse.json({ success: true, media });
}
