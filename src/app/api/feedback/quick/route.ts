/**
 * Quick Feedback API
 * Tier 1: Low-friction feedback (like, save, helpful)
 * 
 * POST /api/feedback/quick
 * Body: { promptId, action, metadata? }
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { QuickFeedbackSchema, FEEDBACK_COLLECTIONS } from '@/lib/db/schemas/user-feedback';
import { auth } from '@/lib/auth';
import { checkFeedbackRateLimit } from '@/lib/security/feedback-rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkFeedbackRateLimit(request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitResult.reason || 'Rate limit exceeded' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
    
    const session = await auth();
    const body = await request.json();
    
    // Validate input
    const validatedData = QuickFeedbackSchema.parse({
      userId: session?.user?.id,
      organizationId: session?.user?.organizationId, // Capture organizationId for multi-tenant
      promptId: body.promptId,
      action: body.action,
      timestamp: new Date(),
      sessionId: body.sessionId || request.headers.get('x-session-id'),
      metadata: body.metadata,
    });
    
    // Save to MongoDB
    const db = await getDb();
    await db.collection(FEEDBACK_COLLECTIONS.QUICK_FEEDBACK).insertOne(validatedData);
    
    // Update aggregates asynchronously (don't wait)
    // Note: Aggregates are global (prompts are public content)
    updateAggregatesAsync(validatedData.promptId, db).catch(console.error);
    
    return NextResponse.json({ 
      success: true,
      message: 'Feedback recorded. Thank you for helping us improve!' 
    });
    
  } catch (error) {
    console.error('Error saving quick feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

async function updateAggregatesAsync(promptId: string, db: any) {
  // Recalculate aggregate scores for this prompt
  // Note: Prompts are public content, so aggregates are global (not org-scoped)
  // If org-specific analytics needed, use separate aggregation structure
  const quickFeedback = await db.collection(FEEDBACK_COLLECTIONS.QUICK_FEEDBACK)
    .find({ promptId })
    .toArray();
  
  const likes = quickFeedback.filter((f: any) => f.action === 'like').length;
  const saves = quickFeedback.filter((f: any) => f.action === 'save').length;
  const helpful = quickFeedback.filter((f: any) => f.action === 'helpful').length;
  const notHelpful = quickFeedback.filter((f: any) => f.action === 'not-helpful').length;
  const shares = quickFeedback.filter((f: any) => f.action === 'share').length;
  
  await db.collection(FEEDBACK_COLLECTIONS.SCORE_AGGREGATES).updateOne(
    { promptId },
    {
      $set: {
        'quickFeedback.likes': likes,
        'quickFeedback.saves': saves,
        'quickFeedback.helpful': helpful,
        'quickFeedback.notHelpful': notHelpful,
        'quickFeedback.shares': shares,
        'quickFeedback.totalInteractions': quickFeedback.length,
        lastUpdated: new Date(),
      },
    },
    { upsert: true }
  );
}

