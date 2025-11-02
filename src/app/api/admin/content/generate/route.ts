/**
 * AI Content Generation API for OpsHub CMS
 *
 * Uses CreatorAgent to generate or enhance learning content
 * with budget enforcement and quality scoring.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { CreatorAgent } from '@/lib/agents/CreatorAgent';

const GenerateRequestSchema = z.object({
  prompt: z.string().min(10),
  type: z.string(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  targetWordCount: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only admins can generate content
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit({
      identifier: session.user.id,
      action: 'content_generate',
      limit: 10, // 10 generations per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = GenerateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { prompt, type, category, tags, targetWordCount } =
      validationResult.data;

    // Initialize CreatorAgent
    const agent = new CreatorAgent();

    // Determine category from type if not provided
    const contentCategory = category || mapTypeToCategory(type);

    // Generate content using CreatorAgent
    const result = await agent.createContent({
      topic: prompt,
      category: contentCategory,
      targetWordCount: targetWordCount || 800,
      tags: tags || [],
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Content generation failed' },
        { status: 500 }
      );
    }

    // Fetch the generated content from the database
    const { getDb } = await import('@/lib/mongodb');
    const { Collections } = await import('@/lib/db/schema');
    const { ObjectId } = await import('mongodb');

    const db = await getDb();
    const contentDoc = await db
      .collection(Collections.WEB_CONTENT)
      .findOne({ _id: new ObjectId(result.contentId) });

    if (!contentDoc) {
      return NextResponse.json(
        { error: 'Generated content not found in database' },
        { status: 500 }
      );
    }

    // Return generated content
    return NextResponse.json({
      success: true,
      content: contentDoc.content,
      title: contentDoc.title || extractTitleFromContent(contentDoc.content),
      tags: contentDoc.metadata?.tags || tags || [],
      metadata: {
        wordCount: result.wordCount,
        tokensUsed: result.tokensUsed,
        costUSD: result.costUSD,
        contentId: result.contentId,
      },
    });
  } catch (error) {
    console.error('[API] Content generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Map content type to category for CreatorAgent
 */
function mapTypeToCategory(type: string): string {
  const categoryMap: Record<string, string> = {
    learning_story: 'Learning Story',
    case_study: 'Case Study',
    framework_guide: 'Framework Guide',
    ai_adoption_question: 'AI Adoption',
    enhance: 'General',
  };
  return categoryMap[type] || 'General';
}

/**
 * Extract title from markdown content (first H1 or first line)
 */
function extractTitleFromContent(content: string): string | undefined {
  // Try to find H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match && h1Match.length > 1) {
    return h1Match[1].trim();
  }

  // Fallback to first line
  const firstLine = content.split('\n')[0]?.trim();
  if (firstLine && firstLine.length > 0 && firstLine.length < 100) {
    return firstLine.replace(/^#+\s*/, '');
  }

  return undefined;
}
