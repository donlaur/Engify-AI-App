/**
 * Prompt History API
 * Track prompt usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';

const historySchema = z.object({
  promptId: z.string(),
  promptTitle: z.string(),
  promptText: z.string(),
  response: z.string().optional(),
  model: z.string().optional(),
  tokensUsed: z.number().optional(),
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
    
    await db.collection('prompt_history').insertOne({
      userId: session.user.id,
      ...data,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getMongoDb();
    
    const history = await db
      .collection('prompt_history')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
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
