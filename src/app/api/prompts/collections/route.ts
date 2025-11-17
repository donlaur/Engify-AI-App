/**
 * API Route: Save Customized Prompt to Collection
 * Allows users to save their customized versions of prompts
 * Requires authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { logger } from '@/lib/logging/logger';

const saveCollectionSchema = z.object({
  promptId: z.string().min(1),
  originalPromptId: z.string().min(1),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  originalContent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data = saveCollectionSchema.parse(body);

    const db = await getMongoDb();

    // Verify original prompt exists
    const originalPrompt = await db.collection('prompts').findOne({
      id: data.originalPromptId,
      isPublic: { $ne: false },
    });

    if (!originalPrompt) {
      return NextResponse.json(
        { error: 'Original prompt not found' },
        { status: 404 }
      );
    }

    // Check if user already has a customized version with this name
    const existing = await db.collection('prompt_collections').findOne({
      userId: session.user.id,
      originalPromptId: data.originalPromptId,
      title: data.title,
    });

    if (existing) {
      // Update existing
      await db.collection('prompt_collections').updateOne(
        { _id: existing._id },
        {
          $set: {
            content: data.content,
            updatedAt: new Date(),
          },
        }
      );

      return NextResponse.json({
        success: true,
        collectionId: existing._id.toString(),
        message: 'Customized prompt updated',
      });
    }

    // Create new customized prompt in collection
    const result = await db.collection('prompt_collections').insertOne({
      userId: session.user.id,
      promptId: data.promptId, // Custom ID for this version
      originalPromptId: data.originalPromptId,
      title: data.title,
      content: data.content,
      originalContent: data.originalContent || originalPrompt.content,
      category: originalPrompt.category,
      role: originalPrompt.role,
      pattern: originalPrompt.pattern,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    logger.info('Customized prompt saved to collection', {
      userId: session.user.id,
      collectionId: result.insertedId.toString(),
      originalPromptId: data.originalPromptId,
    });

    return NextResponse.json({
      success: true,
      collectionId: result.insertedId.toString(),
      message: 'Customized prompt saved to collection',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    logger.error('Failed to save customized prompt', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to save customized prompt' },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieve user's customized prompts (collection)
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const db = await getMongoDb();
    const collections = await db
      .collection('prompt_collections')
      .find({
        userId: session.user.id,
      })
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({
      success: true,
      collections: collections.map((c: any) => ({
        id: c._id.toString(),
        promptId: c.promptId,
        originalPromptId: c.originalPromptId,
        title: c.title,
        content: c.content,
        category: c.category,
        role: c.role,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    logger.error('Failed to fetch prompt collection', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}


