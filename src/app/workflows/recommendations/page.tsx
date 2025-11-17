import type { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { loadRecommendationsFromJson } from '@/lib/workflows/load-recommendations-from-json';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const revalidate = 3600; // Revalidate once per hour

async function getRecommendationsMetadata() {
  const recommendations = await loadRecommendationsFromJson();
  const published = recommendations.filter((rec) => rec.status === 'published');
  return {
    totalRecommendations: published.length,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getRecommendationsMetadata();
  const title = `${metadata.totalRecommendations || 0} AI Development Recommendations | Engify.ai`;
  const description =
    'Best practices and strategic guidance for AI-assisted development. Proactive recommendations that inform workflows and guardrails.';

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows/recommendations`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows/recommendations`,
      type: 'website',
      siteName: 'Engify.ai',
      images: [
        {
          url: `${APP_URL}/og-images/default.png`,
          width: 1200,
          height: 630,
          alt: 'AI Development Recommendations',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${APP_URL}/og-images/default.png`],
    },
    keywords: [
      'ai development recommendations',
      'ai best practices',
      'ai strategic guidance',
      'ai workflow recommendations',
      'ai assisted development',
      'ai coding best practices',
      'ai development strategy',
      'ai tool selection',
      'ai team structure',
      'process optimization',
      'risk mitigation',
      'ai governance',
      'ai development workflows',
      'proactive recommendations',
      'ai code quality',
    ],
    authors: [{ name: 'Donnie Laur' }],
  };
}

export default async function RecommendationsPage() {
  const recommendations = await loadRecommendationsFromJson();
  const metadata = await getRecommendationsMetadata();

  const publishedRecommendations = recommendations
    .filter((rec) => rec.status === 'published')
    .sort((a, b) => {
      // Sort by priority (high, medium, low) then alphabetically
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.title.localeCompare(b.title);
    });

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Development Recommendations',
    description: `Browse ${metadata.totalRecommendations || publishedRecommendations.length} best practice recommendations for AI-assisted development.`,
    url: `${APP_URL}/workflows/recommendations`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: publishedRecommendations.length,
      itemListElement: publishedRecommendations.slice(0, 50).map((rec, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: rec.title,
          description: rec.description,
          url: `${APP_URL}/workflows/recommendations/${rec.slug}`,
        },
      })),
    },
  };

  const CATEGORY_LABELS: Record<string, string> = {
    'best-practices': 'Best Practices',
    'strategic-guidance': 'Strategic Guidance',
    'tool-selection': 'Tool Selection',
    'team-structure': 'Team Structure',
    'process-optimization': 'Process Optimization',
    'risk-mitigation': 'Risk Mitigation',
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
        <div className="container py-10">
          {/* Header */}
          <header className="mb-8 text-center">
            <div className="mx-auto max-w-3xl space-y-4">
              <h1 className="mb-4 text-4xl font-bold">
                AI Development Recommendations
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
                Best practices and strategic guidance for AI-assisted development. Proactive recommendations that inform workflows and guardrails to help teams avoid pain points.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows/pain-points">View pain points</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows#workflow-library">Explore workflows</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/guardrails">View guardrails</Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Recommendations Grid */}
          {publishedRecommendations.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">No recommendations published yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {publishedRecommendations.map((recommendation) => (
                <Card
                  key={recommendation.id}
                  className="group relative flex h-full flex-col transition-all duration-200 hover:border-primary hover:shadow-lg"
                >
                  <CardContent className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant={recommendation.priority === 'high' ? 'default' : 'outline'} className="text-xs">
                            {recommendation.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[recommendation.category] || recommendation.category}
                          </Badge>
                        </div>
                        <h2 className="text-lg font-semibold group-hover:text-primary">
                          {recommendation.title}
                        </h2>
                      </div>
                    </div>
                    <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                      {recommendation.description}
                    </p>
                    <div className="mb-4 text-xs italic text-muted-foreground line-clamp-2">
                      {recommendation.recommendationStatement}
                    </div>
                    {recommendation.keywords && recommendation.keywords.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1">
                        {recommendation.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href={`/workflows/recommendations/${recommendation.slug}`}>
                        Learn More
                        <Icons.arrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold">Ready to implement these recommendations?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Our workflows and guardrails provide actionable steps to put these recommendations into practice.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/workflows#workflow-library">Explore workflows &amp; guardrails</Link>
              </Button>
            </div>
          </div>

        </div>
      </MainLayout>
    </>
  );
}

