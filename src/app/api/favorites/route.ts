/**
 * Favorites API Routes
 *
 * Manage user's favorite prompts
 * Replaces localStorage with MongoDB persistence
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/logging/audit';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// GET /api/favorites - Get user's favorite prompts
export async function GET(_request: NextRequest) {
  try {
    // Auth required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', favorites: [] },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(session.user.id, 'authenticated');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: rateLimitResult.reason || 'Rate limit exceeded',
          favorites: [],
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    const db = await getDb();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { favoritePrompts: 1 } }
    );

    const favorites = user?.favoritePrompts || [];

    return NextResponse.json({
      success: true,
      favorites,
      count: favorites.length,
    });
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites', favorites: [] },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add prompt to favorites
const AddFavoriteSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID required'),
});

export async function POST(request: NextRequest) {
  try {
    // Auth required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(session.user.id, 'authenticated');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Validate request
    const body = await request.json();
    const { promptId } = AddFavoriteSchema.parse(body);

    const db = await getDb();

    // Verify prompt exists
    const prompt = await db
      .collection('prompts')
      .findOne({ id: promptId, active: { $ne: false } });

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Add to favorites (using $addToSet to prevent duplicates)
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $addToSet: { favoritePrompts: promptId },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'user.favorite.added',
      details: {
        promptId,
        promptTitle: prompt.title,
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.ip ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
      promptId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('POST /api/favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove prompt from favorites
const RemoveFavoriteSchema = z.object({
  promptId: z.string().min(1, 'Prompt ID required'),
});

export async function DELETE(request: NextRequest) {
  try {
    // Auth required
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(session.user.id, 'authenticated');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
          },
        }
      );
    }

    // Validate request
    const body = await request.json();
    const { promptId } = RemoveFavoriteSchema.parse(body);

    const db = await getDb();

    // Remove from favorites
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $pull: { favoritePrompts: promptId },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Audit log
    await auditLog({
      userId: session.user.id,
      action: 'user.favorite.removed',
      details: {
        promptId,
      },
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.ip ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
      promptId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('DELETE /api/favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}

