/**
 * Prompt History API
 * Track prompt usage with full execution details
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const historySchema = z.object({
  promptId: z.string(),
  promptTitle: z.string(),
  promptText: z.string(),
  response: z.string(),
  model: z.string(),
  tokensUsed: z.number().optional(),
  executionTime: z.number().optional(), // milliseconds
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = historySchema.parse(body);

    const db = await getMongoDb();
    
    const result = await db.collection('prompt_history').insertOne({
      userId: session.user.id,
      ...data,
      createdAt: new Date(),
    });

    // Update user stats
    await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id) },
      { 
        $inc: { 
          promptsExecuted: 1,
          totalTokensUsed: data.tokensUsed || 0,
        },
        $set: { lastActiveDate: new Date() },
      }
    );

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = await getMongoDb();
    
    const history = await db
      .collection('prompt_history')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ history });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
