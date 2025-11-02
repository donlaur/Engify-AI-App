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
import { getAllPrompts } from '@/lib/prompts/mongodb-prompts';
import {
  categoryLabels,
  roleLabels,
  type UserRole,
} from '@/lib/schemas/prompt';
import { CopyButton, ShareButton } from '@/components/features/PromptActions';
import Link from 'next/link';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

// Generate static params for all prompts (SSG)
export async function generateStaticParams() {
  const prompts = await getAllPrompts();
  return prompts.map((prompt) => ({
    id: prompt.id,
  }));
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const prompts = await getAllPrompts();
  const prompt = prompts.find((p) => p.id === params.id);

  if (!prompt) {
    return {
      title: 'Prompt Not Found | Engify.ai',
      description: 'The requested prompt could not be found.',
    };
  }

  const title = `${prompt.title} - AI Prompt Template | Engify.ai`;
  const description = prompt.description;
  const url = `${APP_URL}/prompts/${prompt.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Engify.ai',
      article: {
        tags: prompt.tags || [],
        section: categoryLabels[prompt.category] || prompt.category,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      prompt.title,
      categoryLabels[prompt.category] || prompt.category,
      prompt.role ? roleLabels[prompt.role as UserRole] : '',
      'prompt engineering',
      'AI prompt',
      'ChatGPT',
      'Claude',
      ...(prompt.tags || []),
    ].filter(Boolean),
  };
}

export default async function PromptPage({
  params,
}: {
  params: { id: string };
}) {
  const prompts = await getAllPrompts();
  const prompt = prompts.find((p) => p.id === params.id);

  if (!prompt) {
    notFound();
  }

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: prompt.title,
    description: prompt.description,
    author: {
      '@type': 'Organization',
      name: 'Engify.ai',
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
      '@id': `${APP_URL}/prompts/${prompt.id}`,
    },
    keywords: prompt.tags?.join(', '),
    articleSection: categoryLabels[prompt.category] || prompt.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // SECURITY: JSON-LD is safe - it's JSON.stringify of our own data, no user input
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

          {/* Navigation & Share */}
          <div className="mt-8 flex gap-4">
            <Button asChild>
              <Link href="/prompts">
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
            <ShareButton
              title={prompt.title}
              description={prompt.description}
            />
          </div>

          {/* Related Prompts */}
          <div className="mt-12">
            <h2 className="mb-4 text-2xl font-bold">More Prompts</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {prompts
                .filter(
                  (p) =>
                    p.id !== prompt.id &&
                    (p.category === prompt.category || p.role === prompt.role)
                )
                .slice(0, 3)
                .map((relatedPrompt) => (
                  <Link
                    key={relatedPrompt.id}
                    href={`/prompts/${relatedPrompt.id}`}
                    className="rounded-lg border p-4 transition-colors hover:border-primary hover:bg-accent"
                  >
                    <h3 className="mb-2 font-semibold">
                      {relatedPrompt.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {relatedPrompt.description}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
