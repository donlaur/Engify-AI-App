/**
 * Article Feedback API
 * Handles feedback for learning resources/articles
 * 
 * POST /api/feedback/article
 * Body: { articleId, articleSlug, helpful, type }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { checkFeedbackRateLimit } from '@/lib/security/feedback-rate-limit';
import { z } from 'zod';

const ArticleFeedbackSchema = z.object({
  articleId: z.string(),
  articleSlug: z.string(),
  helpful: z.boolean(),
  type: z.literal('article'),
  timestamp: z.date(),
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  sessionId: z.string().optional(),
});

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
    const validatedData = ArticleFeedbackSchema.parse({
      articleId: body.articleId,
      articleSlug: body.articleSlug,
      helpful: body.helpful,
      type: 'article',
      timestamp: new Date(),
      userId: session?.user?.id,
      organizationId: session?.user?.organizationId,
      sessionId: request.headers.get('x-session-id') || undefined,
    });
    
    // Save to MongoDB
    const db = await getDb();
    await db.collection('article_feedback').insertOne(validatedData);
    
    // Update article helpful count
    await db.collection('learning_resources').updateOne(
      { id: body.articleSlug },
      {
        $inc: {
          helpfulCount: body.helpful ? 1 : 0,
          notHelpfulCount: body.helpful ? 0 : 1,
        },
      }
    );
    
    return NextResponse.json({ 
      success: true,
      message: 'Feedback recorded. Thank you!' 
    });
    
  } catch (error) {
    console.error('Error saving article feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 }
    );
  }
}

