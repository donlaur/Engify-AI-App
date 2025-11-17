import type { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { loadPainPointsFromJson, getPainPointsMetadata } from '@/lib/workflows/load-pain-points-from-json';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const revalidate = 3600; // Revalidate once per hour

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getPainPointsMetadata();
  const title = `${metadata.totalPainPoints || 0} AI Development Pain Points | Engify.ai`;
  const description =
    'Common failure modes and pain points in AI-assisted development. Learn about the problems teams face and workflows that address them.';

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows/pain-points`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows/pain-points`,
      type: 'website',
      siteName: 'Engify.ai',
      images: [
        {
          url: `${APP_URL}/og-images/default.png`,
          width: 1200,
          height: 630,
          alt: 'AI Development Pain Points',
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
      'ai development pain points',
      'ai coding problems',
      'ai development challenges',
      'ai assistant failures',
      'ai coding pitfalls',
      'ai code issues',
      'ai failure modes',
      'production incidents',
      'ai audit findings',
      'ai code quality issues',
      'ai development risks',
      'common ai mistakes',
      'ai coding errors',
      'ai generated code problems',
      'ai technical debt',
    ],
    authors: [{ name: 'Donnie Laur' }],
  };
}

export default async function PainPointsPage() {
  const [painPoints, metadata] = await Promise.all([
    loadPainPointsFromJson(),
    getPainPointsMetadata(),
  ]);

  const publishedPainPoints = painPoints
    .filter(pp => pp.status === 'published')
    .sort((a, b) => a.title.localeCompare(b.title));

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Development Pain Points',
    description: `Browse ${metadata.totalPainPoints || publishedPainPoints.length} common pain points in AI-assisted development.`,
    url: `${APP_URL}/workflows/pain-points`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: publishedPainPoints.length,
      itemListElement: publishedPainPoints.slice(0, 50).map((pp, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: pp.title,
          description: pp.description,
          url: `${APP_URL}/workflows/pain-points/${pp.slug}`,
        },
      })),
    },
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
                AI Development Pain Points
              </h1>
              <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
                Common failure modes and challenges in AI-assisted development. Each pain point represents real production incidents and audit findings from engineering teams.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows#workflow-library">Explore workflows</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/guardrails">View guardrails</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/workflows/recommendations">View recommendations</Link>
                </Button>
              </div>
            </div>
          </header>

          {/* Pain Points Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedPainPoints.map(painPoint => (
              <Card
                key={painPoint.id}
                className="group relative flex h-full flex-col transition-all duration-200 hover:border-primary hover:shadow-lg"
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold group-hover:text-primary">
                      {painPoint.title}
                    </h2>
                  </div>
                  <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                    {painPoint.description}
                  </p>
                  {painPoint.impact && (
                    <p className="mb-4 text-xs italic text-muted-foreground line-clamp-2">
                      {painPoint.impact}
                    </p>
                  )}
                  {painPoint.keywords && painPoint.keywords.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {painPoint.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href={`/workflows/pain-points/${painPoint.slug}`}>
                      Learn More
                      <Icons.arrowRight className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold">Want to address these pain points?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Our workflows provide actionable checklists and best practices to prevent these issues.
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

