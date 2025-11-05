/**
 * AI Summary: Individual Prompt Detail Page - SEO-optimized page for each prompt
 * Server-side generated (SSG) page with dynamic metadata, Open Graph tags, and
 * JSON-LD structured data. Includes breadcrumbs, prompt content, copy/share actions,
 * and related prompts. Part of Day 7 QA improvements.
 * Last updated: 2025-11-02
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { getPromptById } from '@/lib/prompts/mongodb-prompts';
import {
  categoryLabels,
  roleLabels,
  patternLabels,
  type UserRole,
} from '@/lib/schemas/prompt';
import { logger } from '@/lib/logging/logger';
import {
  CopyButton,
  ShareButton,
  FavoriteButton,
} from '@/components/features/PromptActions';
import { PromptMetrics } from '@/components/features/PromptMetrics';
import { RelatedPrompts } from '@/components/features/RelatedPrompts';
import { CrossContentLinks } from '@/components/features/CrossContentLinks';
import { getPromptSlug } from '@/lib/utils/slug';
import Link from 'next/link';
import {
  generatePromptMetadata,
  generateHowToSchema,
} from '@/lib/seo/metadata';
import { PromptEnrichment } from '@/components/features/PromptEnrichment';
import { PromptAuditScores } from '@/components/features/PromptAuditScores';
import { PromptRevisions } from '@/components/features/PromptRevisions';
import { PremiumPromptLock } from '@/components/features/PremiumPromptLock';
import { PromptTrust, PromptSEOFeatures, PromptPremiumCTA } from '@/components/features/PromptTrust';
import { PromptPageClient } from '@/components/features/PromptPageClient';
import { PromptContextExplanation } from '@/components/features/PromptContextExplanation';
import { PromptParameters } from '@/components/features/PromptParameters';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

// Helper function to enrich description with category, role, and pattern context
function enrichPromptDescription(
  prompt: {
    description: string;
    role?: string | null;
    pattern?: string | null;
  },
  roleLabel: string | null,
  patternLabel: string | null
): string {
  const descriptionParts = [prompt.description];
  if (roleLabel) {
    descriptionParts.push(
      `Specifically designed for ${roleLabel.toLowerCase()}s.`
    );
  }
  if (patternLabel) {
    descriptionParts.push(`Uses the ${patternLabel} pattern.`);
  }
  descriptionParts.push(
    'Ready to use with ChatGPT, Claude, Gemini, and other AI models.'
  );
  return descriptionParts.join(' ');
}

// Use ISR with MongoDB fallback (reliable in production)
// MongoDB is primary source - JSON is optional fast path
export const revalidate = 3600; // Revalidate every hour (ISR)
export const dynamicParams = true; // Allow dynamic params (prompts not pre-generated)
export const dynamic = 'force-dynamic'; // Force dynamic rendering to avoid DYNAMIC_SERVER_USAGE errors

// CRITICAL: No pre-generation - all pages are fully dynamic (ISR)
// This prevents build timeouts completely
// Pages generate on-demand when first accessed, then cache for 1 hour
export async function generateStaticParams() {
  // Return empty array - all prompts generate on-demand via ISR
  // This ensures build completes quickly without timeouts
  return [];
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    // Try JSON first (fast), then MongoDB fallback (reliable)
    const prompt = await getPromptById(params.id);

    if (!prompt) {
      return {
        title: 'Prompt Not Found | Engify.ai',
        description: 'The requested prompt could not be found.',
      };
    }

    // Enrich metadata based on category, role, and pattern
    const categoryLabel = categoryLabels[prompt.category] || prompt.category;
    const roleLabel = prompt.role ? roleLabels[prompt.role as UserRole] : null;
    const patternLabel = prompt.pattern
      ? patternLabels[prompt.pattern as keyof typeof patternLabels]
      : null;

    // Use new programmatic metadata utility
    // Pass metaDescription and seoKeywords if available for SEO optimization
    return generatePromptMetadata(
      {
        ...prompt,
        metaDescription: prompt.metaDescription || null,
        seoKeywords: prompt.seoKeywords || null,
        slug: prompt.slug || null,
      },
      categoryLabel,
      roleLabel,
      patternLabel
    );
  } catch (error) {
    // Log error but return fallback metadata
    logger.warn('Failed to fetch prompt for metadata', {
      idOrSlug: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Fallback metadata if fetch fails
    return {
      title: 'Prompt | Engify.ai',
      description: 'Expert prompt for AI engineering teams',
    };
  }
}

export default async function PromptPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Early detection: Generated prompts are temporary and may not exist
    // Return 404 gracefully to prevent 5xx errors
    if (params.id.startsWith('generated-')) {
      logger.warn('Generated prompt ID not found (temporary prompt)', { id: params.id });
      notFound();
    }

    // Try JSON first (fast), then MongoDB fallback (reliable)
    // MongoDB is primary source for detail pages - more reliable in production
    const prompt = await getPromptById(params.id);

    if (!prompt) {
      logger.warn('Prompt not found', { idOrSlug: params.id });
      notFound();
    }

    // All prompts are free and public - no authentication required
    // (Previously had auth checks, but removed for public access)
    const isPremium = prompt.isPremium === true;
    const canViewPremium = true; // All prompts are free now - allow viewing

    // Note: RelatedPrompts now fetches related prompts via API (client-side)
    // This eliminates the need to fetch all prompts during build, dramatically improving performance
    // Pass empty array - RelatedPrompts will fetch via API client-side

    const slug = getPromptSlug(prompt);

    // Redirect to canonical slug if URL doesn't match (SEO best practice)
    // This handles slug changes gracefully: old slugs → new slugs, IDs → slugs
    // Only redirect if we're not already on the canonical slug
    if (params.id !== slug) {
      // Always redirect to canonical slug for SEO consistency
      // This ensures old slugs and IDs redirect to the proper slug URL
      // Note: redirect() uses temporary redirect by default, but the redirect preserves SEO value
      const { redirect } = await import('next/navigation');
      redirect(`/prompts/${slug}`);
    }

    // Enhanced JSON-LD structured data with category, role, and pattern
    const categoryLabel = categoryLabels[prompt.category] || prompt.category;
    const roleLabel = prompt.role ? roleLabels[prompt.role as UserRole] : null;
    const patternLabel = prompt.pattern
      ? patternLabels[prompt.pattern as keyof typeof patternLabels]
      : null;
    const enrichedDescription = enrichPromptDescription(
      prompt,
      roleLabel,
      patternLabel
    );

    // Enhanced keywords
    const keywords = [
      prompt.title,
      categoryLabel,
      ...(roleLabel
        ? [
            roleLabel,
            `${roleLabel} prompts`,
            `prompts for ${roleLabel.toLowerCase()}s`,
          ]
        : []),
      ...(patternLabel
        ? [patternLabel, `${patternLabel.toLowerCase()} pattern`]
        : []),
      `${categoryLabel} prompt`,
      `${categoryLabel} template`,
      'prompt engineering',
      'AI prompt template',
      'ChatGPT prompt',
      'Claude prompt',
      'Gemini prompt',
      'AI assistant prompt',
      ...(prompt.tags || []),
    ].filter(Boolean);

    // Generate HowTo schema for rich results
    const howToSchema = generateHowToSchema(
      prompt,
      categoryLabel,
      roleLabel,
      `${APP_URL}/prompts/${slug}`
    );

    // Also include Article schema for better SEO
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: prompt.title,
      description: enrichedDescription,
      author: {
        '@type': 'Organization',
        name: 'Engify.ai',
        url: APP_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Engify.ai',
        logo: {
          '@type': 'ImageObject',
          url: `${APP_URL}/logo.png`,
        },
      },
      datePublished: prompt.createdAt?.toISOString(),
      dateModified: prompt.updatedAt?.toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${APP_URL}/prompts/${slug}`,
      },
      keywords: keywords.join(', '),
      articleSection: categoryLabel,
      ...(roleLabel && {
        audience: {
          '@type': 'Audience',
          audienceType: roleLabel,
        },
      }),
      ...(patternLabel && {
        about: {
          '@type': 'Thing',
          name: patternLabel,
          description: `Prompt pattern: ${patternLabel}`,
        },
      }),
      category: categoryLabel,
      inLanguage: 'en-US',
    };

    return (
      <>
        {/* Client component for view tracking */}
        <PromptPageClient promptId={prompt.id} />

        {/* HowTo Schema for rich results */}
        <script
          type="application/ld+json"
          // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        {/* Article Schema for additional SEO */}
        <script
          type="application/ld+json"
          // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <MainLayout>
          <div className="container py-8">
            {/* Premium Lock - Show if premium and not authenticated */}
            {isPremium && !canViewPremium && (
              <div className="mb-8">
                <PremiumPromptLock promptTitle={prompt.title} />
              </div>
            )}

            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary">
                Home
              </Link>
              <Icons.chevronRight className="h-4 w-4" />
              <Link href="/prompts" className="hover:text-primary">
                Prompts
              </Link>
              <Icons.chevronRight className="h-4 w-4" />
              <span className="text-foreground">{prompt.title}</span>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-4 text-4xl font-bold">{prompt.title}</h1>
              <p className="mb-6 text-xl text-muted-foreground">
                {prompt.description}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {categoryLabels[prompt.category] || prompt.category}
                </Badge>
                {prompt.role && (
                  <Badge variant="outline">
                    {roleLabels[prompt.role as UserRole] || prompt.role}
                  </Badge>
                )}
                {prompt.pattern && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                    <Icons.brain className="mr-1 h-3 w-3" />
                    {prompt.pattern}
                  </Badge>
                )}
                {prompt.tags?.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Icons.tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Context Explanation - SEO Educational Content */}
            <PromptContextExplanation
              title={prompt.title}
              category={prompt.category}
              description={prompt.description}
              whatIs={prompt.whatIs}
              whyUse={prompt.whyUse}
            />

            {/* Prompt Content */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Prompt Template</h2>
                <CopyButton content={prompt.content} />
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950 dark:text-slate-50">
                {prompt.content}
              </pre>
            </div>

            {/* Interactive Parameters - Leading Questions */}
            {prompt.parameters && prompt.parameters.length > 0 && (
              <PromptParameters
                parameters={prompt.parameters}
                promptContent={prompt.content}
              />
            )}

            {/* Trust & Social Proof */}
            <PromptTrust
              views={prompt.views}
              rating={prompt.rating}
              verified={prompt.verified}
              premium={prompt.isPremium}
              updatedAt={prompt.updatedAt}
            />

            {/* Navigation & Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/prompts">
                  <Icons.arrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Link>
              </Button>
              <FavoriteButton promptId={prompt.id} />
              <ShareButton
                title={prompt.title}
                description={prompt.description}
                promptId={prompt.id}
              />
            </div>

            {/* SEO-Focused Features */}
            <PromptSEOFeatures
              useCases={prompt.useCases}
              bestPractices={prompt.bestPractices}
              examples={prompt.examples}
            />

            {/* Enrichment Details - Case Studies, Best Time to Use, Recommended Models, etc. */}
            <PromptEnrichment
              caseStudies={prompt.caseStudies}
              bestTimeToUse={prompt.bestTimeToUse}
              recommendedModel={prompt.recommendedModel}
              useCases={prompt.useCases}
              examples={prompt.examples}
              bestPractices={prompt.bestPractices}
              whenNotToUse={prompt.whenNotToUse}
              difficulty={prompt.difficulty}
              estimatedTime={prompt.estimatedTime}
            />

            {/* Premium CTA */}
            <PromptPremiumCTA
              isPremium={prompt.isPremium}
              promptTitle={prompt.title}
            />

            {/* Audit Scores - Fetch client-side */}
            <PromptAuditScores promptId={prompt.id} />

            {/* Revision History */}
            <PromptRevisions promptId={prompt.id} />

            {/* Metrics */}
            <div className="mt-6">
              <PromptMetrics
                promptId={prompt.id}
                initialViews={prompt.views || 0}
              />
            </div>

            {/* Related Prompts with Metrics */}
            <RelatedPrompts
              currentPrompt={{
                id: prompt.id,
                category: prompt.category,
                role: prompt.role,
                tags: prompt.tags,
              }}
            />

            {/* Cross-Content Links (Articles & Patterns) */}
            <CrossContentLinks
              tags={prompt.tags || []}
              category={prompt.category}
              excludeId={prompt.id}
            />
          </div>
        </MainLayout>
      </>
    );
  } catch (error) {
    // Log error for debugging
    logger.error('Failed to fetch prompt', {
      idOrSlug: params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // If fetch fails, show 404
    notFound();
  }
}
