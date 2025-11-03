/**
 * Multi-Agent Content Review API
 * 
 * Endpoint for reviewing content through multiple expert AI personas
 * before publishing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  ContentReviewService,
  generateAndReviewArticle,
} from '@/lib/content/multi-agent-review';
import { z } from 'zod';

const ReviewRequestSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters'),
  autoRevise: z.boolean().optional().default(false),
  maxIterations: z.number().min(1).max(5).optional().default(1),
  minScore: z.number().min(1).max(10).optional().default(7.0),
});

const GenerateRequestSchema = z.object({
  topic: z.string().min(10, 'Topic must be at least 10 characters'),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

/**
 * POST /api/content/review
 * Review existing content through multi-agent pipeline
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, require admin role
    // TODO: Add proper RBAC check
    const isAdmin = session.user.email?.includes('admin') || 
                    session.user.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Determine if this is a review or generate request
    if (body.topic) {
      // Generate new content
      const validated = GenerateRequestSchema.parse(body);

      // Generate and review article

      const result = await generateAndReviewArticle(
        validated.topic,
        session.user.organizationId || 'default'
      );

      return NextResponse.json({
        success: true,
        draft: result.draft,
        review: {
          finalScore: result.review.finalScore,
          approved: result.review.approved,
          iterations: result.review.iterations,
          reviews: result.review.reviews,
        },
        report: result.report,
      });
    } else {
      // Review existing content
      const validated = ReviewRequestSchema.parse(body);

      // Review content through multi-agent pipeline

      const service = new ContentReviewService(
        session.user.organizationId || 'default'
      );

      const pipeline = await service.reviewContent(validated.content, {
        autoRevise: validated.autoRevise,
        maxIterations: validated.maxIterations,
        minScore: validated.minScore,
      });

      const report = service.generateReport(pipeline);

      return NextResponse.json({
        success: true,
        review: {
          finalScore: pipeline.finalScore,
          approved: pipeline.approved,
          iterations: pipeline.iterations,
          currentContent: pipeline.currentContent,
          reviews: pipeline.reviews.map((r) => ({
            agentRole: r.agentRole,
            pass: r.pass,
            score: r.score,
            strengths: r.strengths,
            weaknesses: r.weaknesses,
            improvements: r.improvements,
            reasoning: r.reasoning,
          })),
        },
        report,
      });
    }
  } catch (error) {
    console.error('Content review error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/content/review/agents
 * Get list of available review agents and their personas
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { REVIEW_AGENTS } = await import('@/lib/content/multi-agent-review');

    return NextResponse.json({
      agents: REVIEW_AGENTS.map((agent) => ({
        role: agent.role,
        persona: agent.persona,
        model: agent.model,
        provider: agent.provider,
        focus: agent.focus,
      })),
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

