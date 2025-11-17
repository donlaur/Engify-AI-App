/**
 * API Route: Get Prompt Revisions
 * Returns revision history for a prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getMongoDb();
    const { id } = await params;

    // Build query conditions
    const queryConditions: any[] = [
      { id },
      { slug: id },
    ];

    // Only add _id condition if id is a valid ObjectId
    if (ObjectId.isValid(id)) {
      queryConditions.push({ _id: new ObjectId(id) });
    }

    // Find prompt by id or slug
    const prompt = await db.collection('prompts').findOne({
      $or: queryConditions,
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Get revisions
    const revisions = await db.collection('prompt_revisions').find({
      promptId: prompt.id || prompt.slug || prompt._id.toString(),
    })
    .sort({ revisionNumber: -1 })
    .limit(50) // Last 50 revisions
    .toArray();

    return NextResponse.json({
      promptId: prompt.id || prompt.slug,
      currentRevision: prompt.currentRevision || 1,
      revisions: revisions.map((rev: any) => ({
        revisionNumber: rev.revisionNumber,
        changes: rev.changes,
        changedBy: rev.changedBy,
        changeReason: rev.changeReason,
        createdAt: rev.createdAt,
        snapshot: {
          title: rev.snapshot?.title,
          description: rev.snapshot?.description,
          // Don't include full content in list view
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}


