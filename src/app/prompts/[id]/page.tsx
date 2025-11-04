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
import { PromptPageClient } from '@/components/features/PromptPageClient';

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

// Generate static params for all prompts (SSG) - both ID and slug routes
// OPTIMIZED: Only fetch IDs and slugs, not full prompt data
export async function generateStaticParams() {
  try {
    // Use promptRepository to fetch only IDs efficiently
    const { promptRepository } = await import(
      '@/lib/db/repositories/ContentService'
    );
    const prompts = await promptRepository.getAll();
    const params: Array<{ id: string }> = [];

    prompts.forEach((prompt) => {
      // Add ID route
      params.push({ id: prompt.id });
      // Add slug route if slug exists (or generate from title)
      const slug = getPromptSlug(prompt);
      if (slug && slug !== prompt.id) {
        params.push({ id: slug });
      }
    });

    return params;
  } catch (error) {
    // Fallback: return empty array if fetch fails (build will still work)
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Fetch only the single prompt needed (more efficient than getAllPrompts)
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
  return generatePromptMetadata(prompt, categoryLabel, roleLabel, patternLabel);
}

export default async function PromptPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch only the single prompt needed (more efficient than getAllPrompts)
  const prompt = await getPromptById(params.id);

  if (!prompt) {
    notFound();
  }

  // Note: RelatedPrompts now fetches related prompts via API (client-side)
  // This eliminates the need to fetch all prompts during build, dramatically improving performance
  // Pass empty array - RelatedPrompts will fetch via API client-side

  const slug = getPromptSlug(prompt);

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

          {/* Prompt Content */}
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Prompt Template</h2>
              <CopyButton content={prompt.content} />
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
              {prompt.content}
            </pre>
          </div>

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
}
