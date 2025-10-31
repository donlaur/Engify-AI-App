/**
 * Detailed Rating API
 * Tier 2: Thoughtful 1-5 star rating after usage
 * 
 * POST /api/feedback/rating
 * Body: { promptId, rating, dimensions?, usageContext?, comment? }
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { DetailedRatingSchema, FEEDBACK_COLLECTIONS, calculateOverallScore, calculateConfidenceScore, calculateRAGReadiness } from '@/lib/db/schemas/user-feedback';
import { auth } from '@/lib/auth';
import { checkFeedbackRateLimit } from '@/lib/security/feedback-rate-limit';
import { sanitizeText } from '@/lib/security/sanitize';
import { logAuditEvent } from '@/server/middleware/audit';

// Helper to get IP from NextRequest
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts.length > 0 ? parts[0].trim() : 'unknown';
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

// Helper to get user agent from NextRequest
function getUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent');
}

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
    
    // Sanitize user input before validation
    const sanitizedComment = body.comment ? sanitizeText(body.comment) : undefined;
    const sanitizedAiModel = body.usageContext?.aiModel ? sanitizeText(body.usageContext.aiModel) : undefined;
    
    // Validate input
    const validatedData = DetailedRatingSchema.parse({
      userId: session?.user?.id,
      organizationId: session?.user?.organizationId, // Capture organizationId for multi-tenant
      promptId: body.promptId,
      rating: body.rating,
      dimensions: body.dimensions,
      usageContext: body.usageContext ? {
        ...body.usageContext,
        aiModel: sanitizedAiModel,
      } : undefined,
      comment: sanitizedComment,
      tags: body.tags,
      suggestedImprovements: body.suggestedImprovements,
      timestamp: new Date(),
      sessionId: body.sessionId || request.headers.get('x-session-id'),
    });
    
    // Check for duplicate rating (same user, same prompt, within 24 hours)
    const db = await getDb();
    if (session?.user?.id) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existingRating = await db.collection(FEEDBACK_COLLECTIONS.DETAILED_RATINGS).findOne({
        userId: session.user.id,
        promptId: body.promptId,
        timestamp: { $gte: oneDayAgo },
      });
      
      if (existingRating) {
        // Update existing rating instead of creating new
        await db.collection(FEEDBACK_COLLECTIONS.DETAILED_RATINGS).updateOne(
          { _id: existingRating._id },
          { $set: validatedData }
        );
      } else {
        await db.collection(FEEDBACK_COLLECTIONS.DETAILED_RATINGS).insertOne(validatedData);
      }
    } else {
      // Anonymous rating
      await db.collection(FEEDBACK_COLLECTIONS.DETAILED_RATINGS).insertOne(validatedData);
    }
    
    // Update aggregates asynchronously
    updateAggregatesAsync(validatedData.promptId, db).catch(console.error);
    
    // Audit log: Detailed ratings are significant events (enterprise requirement)
    await logAuditEvent({
      eventType: 'prompt.viewed', // Using existing event type - detailed ratings are viewed/rated
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
      userRole: session?.user?.role || null,
      organizationId: session?.user?.organizationId || null,
      resourceType: 'prompt',
      resourceId: validatedData.promptId,
      ipAddress: getClientIP(request),
      userAgent: getUserAgent(request),
      action: `Submitted detailed rating for prompt ${validatedData.promptId} (${validatedData.rating}/5 stars)`,
      metadata: {
        rating: validatedData.rating,
        hasDimensions: !!validatedData.dimensions,
        hasComment: !!validatedData.comment,
        hasImprovements: validatedData.suggestedImprovements?.length || 0,
      },
      success: true,
    }).catch(console.error); // Don't fail request if audit logging fails
    
    return NextResponse.json({ 
      success: true,
      message: 'Thank you for your detailed feedback! This helps us improve our prompts.' 
    });
    
  } catch (error) {
    console.error('Error saving rating:', error);
    return NextResponse.json(
      { error: 'Failed to save rating' },
      { status: 500 }
    );
  }
}

async function updateAggregatesAsync(promptId: string, db: any) {
  // Get all ratings for this prompt
  const ratings = await db.collection(FEEDBACK_COLLECTIONS.DETAILED_RATINGS)
    .find({ promptId })
    .toArray();
  
  if (ratings.length === 0) return;
  
  // Calculate rating distribution
  const distribution = {
    stars1: ratings.filter((r: any) => r.rating === 1).length,
    stars2: ratings.filter((r: any) => r.rating === 2).length,
    stars3: ratings.filter((r: any) => r.rating === 3).length,
    stars4: ratings.filter((r: any) => r.rating === 4).length,
    stars5: ratings.filter((r: any) => r.rating === 5).length,
  };
  
  // Calculate averages
  const averageRating = ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length;
  
  const clarityRatings = ratings.filter((r: any) => r.dimensions?.clarity);
  const averageClarity = clarityRatings.length > 0
    ? clarityRatings.reduce((sum: number, r: any) => sum + r.dimensions.clarity, 0) / clarityRatings.length
    : undefined;
  
  const usefulnessRatings = ratings.filter((r: any) => r.dimensions?.usefulness);
  const averageUsefulness = usefulnessRatings.length > 0
    ? usefulnessRatings.reduce((sum: number, r: any) => sum + r.dimensions.usefulness, 0) / usefulnessRatings.length
    : undefined;
  
  const completenessRatings = ratings.filter((r: any) => r.dimensions?.completeness);
  const averageCompleteness = completenessRatings.length > 0
    ? completenessRatings.reduce((sum: number, r: any) => sum + r.dimensions.completeness, 0) / completenessRatings.length
    : undefined;
  
  const accuracyRatings = ratings.filter((r: any) => r.dimensions?.accuracy);
  const averageAccuracy = accuracyRatings.length > 0
    ? accuracyRatings.reduce((sum: number, r: any) => sum + r.dimensions.accuracy, 0) / accuracyRatings.length
    : undefined;
  
  // Get quick feedback
  const quickFeedback = await db.collection(FEEDBACK_COLLECTIONS.QUICK_FEEDBACK)
    .find({ promptId })
    .toArray();
  
  const quickFeedbackData = {
    likes: quickFeedback.filter((f: any) => f.action === 'like').length,
    saves: quickFeedback.filter((f: any) => f.action === 'save').length,
    helpful: quickFeedback.filter((f: any) => f.action === 'helpful').length,
    notHelpful: quickFeedback.filter((f: any) => f.action === 'not-helpful').length,
    shares: quickFeedback.filter((f: any) => f.action === 'share').length,
    totalInteractions: quickFeedback.length,
  };
  
  const detailedRatingsData = {
    averageRating,
    ratingCount: ratings.length,
    ratingDistribution: distribution,
    averageClarity,
    averageUsefulness,
    averageCompleteness,
    averageAccuracy,
  };
  
  // Calculate overall score
  const overallScore = calculateOverallScore(quickFeedbackData, detailedRatingsData);
  const confidenceScore = calculateConfidenceScore(quickFeedback.length, ratings.length);
  
  // Quality flags
  const qualityFlags = {
    isHighQuality: overallScore >= 80,
    needsImprovement: overallScore < 60,
    hasIssues: quickFeedbackData.notHelpful > quickFeedbackData.helpful,
    isPopular: quickFeedbackData.totalInteractions >= 50,
  };
  
  // Calculate RAG readiness
  const partialAggregate = {
    promptId,
    quickFeedback: quickFeedbackData,
    detailedRatings: detailedRatingsData,
    overallScore,
    confidenceScore,
    qualityFlags,
    lastUpdated: new Date(),
  };
  
  const ragReadiness = calculateRAGReadiness(partialAggregate);
  
  // Update aggregate
  await db.collection(FEEDBACK_COLLECTIONS.SCORE_AGGREGATES).updateOne(
    { promptId },
    {
      $set: {
        ...partialAggregate,
        ragReadiness,
      },
    },
    { upsert: true }
  );
}

/**
 * GET: Retrieve ratings for a prompt
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');
    
    if (!promptId) {
      return NextResponse.json({ error: 'promptId required' }, { status: 400 });
    }
    
    const db = await getDb();
    
    // Get aggregate scores
    const aggregate = await db.collection(FEEDBACK_COLLECTIONS.SCORE_AGGREGATES)
      .findOne({ promptId });
    
    if (!aggregate) {
      return NextResponse.json({
        promptId,
        quickFeedback: {
          likes: 0,
          saves: 0,
          helpful: 0,
          notHelpful: 0,
          shares: 0,
          totalInteractions: 0,
        },
        detailedRatings: {
          averageRating: 0,
          ratingCount: 0,
        },
        overallScore: 0,
        confidenceScore: 0,
      });
    }
    
    return NextResponse.json(aggregate);
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}

