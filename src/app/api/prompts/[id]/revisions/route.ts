/**
 * API Route: Get Prompt Revisions
 * Returns revision history for a prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db/mongodb';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const db = await getMongoDb();
    
    // Find prompt by id or slug
    const prompt = await db.collection('prompts').findOne({
      $or: [
        { id: params.id },
        { slug: params.id },
        { _id: params.id },
      ],
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

