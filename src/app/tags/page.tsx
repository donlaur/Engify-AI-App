/**
 * Tags Dictionary Page
 * Shows all tags with prompt counts, linking to tag pages
 * SEO-optimized for discoverability
 */

import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import { getPromptSlug } from '@/lib/utils/slug';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export async function generateMetadata(): Promise<Metadata> {
  // Load from static JSON (fast, no MongoDB at build time)
  const prompts = await loadPromptsFromJson();
  const allTags = Array.from(
    new Set(prompts.flatMap((p) => p.tags || []).filter(Boolean))
  );
  
  const title = `Prompt Engineering Tags Dictionary - ${allTags.length} Tags | Engify.ai`;
  const description = `Browse all ${allTags.length} prompt engineering tags. Discover tags for prompts across categories, roles, and patterns. Find prompts by tag to improve your AI workflow.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/tags`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/tags`,
      type: 'website',
      siteName: 'Engify.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'prompt engineering tags',
      'AI prompt tags',
      'prompt library tags',
      'prompt categorization',
      'prompt taxonomy',
      ...allTags.slice(0, 20), // Top 20 tags as keywords
    ],
  };
}

export default async function TagsDictionaryPage() {
  // Load from static JSON (fast, no MongoDB at build time)
  const prompts = await loadPromptsFromJson();
  
  // Count tags
  const tagCounts: Record<string, number> = {};
  prompts.forEach((prompt) => {
    (prompt.tags || []).forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by count (most popular first), then alphabetically
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => {
      // First sort by count (descending)
      if (b[1] !== a[1]) {
        return b[1] - a[1];
      }
      // Then alphabetically
      return a[0].localeCompare(b[0]);
    });

  const totalTags = sortedTags.length;
  const totalTaggedPrompts = prompts.filter((p) => (p.tags || []).length > 0).length;

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Prompt Engineering Tags Dictionary',
    description: `Browse all ${totalTags} prompt engineering tags used across ${totalTaggedPrompts} prompts`,
    url: `${APP_URL}/tags`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: totalTags,
      itemListElement: sortedTags.slice(0, 50).map(([tag, count], index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Thing',
          name: tag,
          description: `${count} prompt${count !== 1 ? 's' : ''} tagged with "${tag}"`,
          url: `${APP_URL}/tags/${encodeURIComponent(tag)}`,
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MainLayout>
        <div className="container py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold">Tags Dictionary</h1>
            <p className="text-lg text-muted-foreground">
              Browse all {totalTags} prompt engineering tags. Click any tag to see prompts tagged with it.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalTags}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tagged Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalTaggedPrompts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{prompts.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tags Grid */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">All Tags</h2>
            <div className="flex flex-wrap gap-3">
              {sortedTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/tags/${encodeURIComponent(tag)}`}
                  className="group"
                >
                  <Badge
                    variant="secondary"
                    className="text-sm transition-all hover:scale-105 hover:shadow-md"
                  >
                    {tag}
                    <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Most Popular Tags */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Most Popular Tags</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedTags.slice(0, 12).map(([tag, count]) => (
                <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <CardTitle className="text-lg">{tag}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {count} prompt{count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-2 font-semibold">About Tags</h3>
            <p className="text-sm text-muted-foreground">
              Tags help you discover prompts by topic, use case, or technique. Each tag links to all prompts
              tagged with it. Use tags to find prompts for specific workflows, AI models, or problem types.
            </p>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

