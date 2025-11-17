/**
 * Content Section Regeneration API Endpoint
 *
 * Regenerates specific sections of existing articles with improved quality.
 * Useful for fixing low-quality sections or updating outdated content.
 *
 * POST /api/admin/content/regenerate
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { ContentGeneratorFactory } from '@/lib/factories/ContentGeneratorFactory';
import { ArticleResearchRepository } from '@/lib/db/repositories/article-research.repository';

const RegenerateRequestSchema = z.object({
  articleId: z.string().min(1, 'Article ID is required'),
  sectionIndex: z.number().min(0, 'Section index must be non-negative'),
  generatorType: z.enum(['single-agent', 'multi-agent']).default('multi-agent'),
  targetWordCount: z.number().min(100).max(3000).optional(),
  improveReadability: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // RBAC: Only admins can regenerate content
    const role = session.user.role as string | undefined;
    if (!['admin', 'super_admin', 'org_admin'].includes(role || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(
      `content-regenerate-${session.user.id}`,
      'authenticated'
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validationResult = RegenerateRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      articleId,
      sectionIndex,
      generatorType,
      targetWordCount,
      improveReadability,
    } = validationResult.data;

    // Load article from database
    const article = await ArticleResearchRepository.findById(articleId);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Validate section index
    if (sectionIndex >= article.sections.length) {
      return NextResponse.json(
        { error: `Section index out of range. Article has ${article.sections.length} sections.` },
        { status: 400 }
      );
    }

    const section = article.sections[sectionIndex];

    // Get organization ID
    const organizationId = session.user.organizationId || session.user.id;

    // Create generator
    const generator = ContentGeneratorFactory.createGenerator(
      generatorType,
      { organizationId }
    );

    // Build context for regeneration
    let context = `Section Purpose: ${section.purpose}\n\n`;
    context += `Research Context:\n${section.context}\n\n`;

    if (article.pricing) {
      context += `Pricing Data:\n${article.pricing}\n\n`;
    }

    if (section.externalLinks && section.externalLinks.length > 0) {
      context += 'External Links to Include:\n';
      section.externalLinks.forEach((link) => {
        context += `- [${link.anchor}](${link.url}) - ${link.authority}\n`;
      });
      context += '\n';
    }

    if (improveReadability) {
      context += 'CRITICAL: Focus on readability. Use simple language, short sentences (10-15 words), and short paragraphs (3-4 sentences).\n';
      context += 'Target: Flesch-Kincaid 8-10 grade level, Reading Ease 60-70.\n\n';
    }

    // Generate new section content
    const result = await generator.generate({
      topic: section.title,
      category: article.workingTitle,
      targetWordCount: targetWordCount || section.targetWords,
      keywords: article.keywords.slice(0, 3),
      sectionId: sectionIndex.toString(),
      context,
    });

    // Validate the generated content
    const validation = await generator.validate(result);

    return NextResponse.json({
      success: true,
      articleId,
      sectionIndex,
      section: {
        title: section.title,
        originalWordCount: section.generated?.wordCount || 0,
        newWordCount: result.metadata.wordCount,
      },
      content: result.content,
      metadata: result.metadata,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        qualityScore: validation.qualityScore,
      },
      message: validation.isValid
        ? 'Section regenerated successfully'
        : 'Section regenerated but has quality issues',
    });
  } catch (error) {
    console.error('[API] Section regeneration error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
