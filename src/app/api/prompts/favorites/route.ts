/**
 * Favorites API
 * Save and manage favorite prompts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';
import { RBACPresets } from '@/lib/middleware/rbac';

const favoriteSchema = z.object({
  promptId: z.string(),
  promptTitle: z.string(),
  category: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // RBAC: prompts:write permission (users can add their own favorites)
  const rbacCheck = await RBACPresets.requirePromptWrite()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = favoriteSchema.parse(body);

    const db = await getMongoDb();

    // Check if already favorited
    // Query is user-scoped (filtered by userId) - no organizationId needed
    // favorites collection stores user-specific data, isolated by userId
    const existing = await db.collection('favorites').findOne({
      userId: session.user.id,
      promptId: data.promptId,
    });

    if (existing) {
      return NextResponse.json({ error: 'Already favorited' }, { status: 400 });
    }

    await db.collection('favorites').insertOne({
      userId: session.user.id,
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Favorites API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add favorite',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // RBAC: users:read permission (users can read their own favorites)
  const rbacCheck = await RBACPresets.requireUserRead()(request);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();

    // Query is user-scoped (filtered by userId) - no organizationId needed
    // favorites collection stores user-specific data, isolated by userId
    const favorites = await db
      .collection('favorites')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ favorites });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Favorites API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch favorites',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // RBAC: prompts:write permission (users can remove their own favorites)
  const rbacCheck = await RBACPresets.requirePromptWrite()(req);
  if (rbacCheck) return rbacCheck;

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json({ error: 'promptId required' }, { status: 400 });
    }

    const db = await getMongoDb();

    // Query is user-scoped (filtered by userId) - no organizationId needed
    // favorites collection stores user-specific data, isolated by userId
    await db.collection('favorites').deleteOne({
      userId: session.user.id,
      promptId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Favorites API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove favorite',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
