/**
 * Content Publishing API
 * 
 * Generate SEO-rich, human-sounding, actionable articles
 * for publishing on Engify.ai
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ContentPublishingService } from '@/lib/content/content-publishing-pipeline';
import { z } from 'zod';

const PublishRequestSchema = z.object({
  topic: z.string().min(10, 'Topic must be at least 10 characters'),
  category: z.string().optional().default('Tutorial'),
  targetKeywords: z.array(z.string()).optional().default([]),
  tone: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

/**
 * POST /api/content/publish
 * Generate article through multi-agent publishing pipeline
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const isAdmin = session.user.email?.includes('admin') || 
                    session.user.role === 'admin' ||
                    session.user.role === 'super_admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required for content publishing' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = PublishRequestSchema.parse(body);

    console.log('📝 Content Publishing Request:', {
      topic: validated.topic,
      category: validated.category,
      tone: validated.tone,
      keywords: validated.targetKeywords,
    });

    const service = new ContentPublishingService(
      session.user.organizationId || 'default'
    );

    const result = await service.generateArticle(validated.topic, {
      category: validated.category,
      targetKeywords: validated.targetKeywords,
      tone: validated.tone,
    });

    const report = service.generateReport(result);

    return NextResponse.json({
      success: true,
      publishReady: result.publishReady,
      result: {
        topic: result.topic,
        finalContent: result.finalContent,
        seoMetadata: result.seoMetadata,
        readabilityScore: result.readabilityScore,
        approved: result.approved,
        reviews: result.reviews.map((r) => ({
          agentName: r.agentName,
          approved: r.approved,
          score: r.score,
          feedback: r.feedback,
          improvements: r.improvements,
        })),
      },
      report,
    });
  } catch (error) {
    console.error('Content publishing error:', error);

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
 * GET /api/content/publish/agents
 * Get list of publishing agents
 */
export async function GET() {
  try {
    const { CONTENT_AGENTS } = await import('@/lib/content/content-publishing-pipeline');

    return NextResponse.json({
      agents: CONTENT_AGENTS.map((agent) => ({
        role: agent.role,
        name: agent.name,
        model: agent.model,
        provider: agent.provider,
      })),
      pipeline: [
        '1. Content Generator → Create initial draft',
        '2. SEO Specialist → Optimize for search',
        '3. Human Tone Editor → Make it sound natural',
        '4. Learning Expert → Ensure actionable & educational',
        '5. Tech Accuracy SME → Verify technical correctness',
        '6. Final Publisher → Polish & approve',
      ],
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

