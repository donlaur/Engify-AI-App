import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRecommendationBySlug, loadRecommendationsFromJson } from '@/lib/workflows/load-recommendations-from-json';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import { AuthorAttribution } from '@/components/workflows/AuthorAttribution';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

interface RecommendationPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const recommendations = await loadRecommendationsFromJson();
  return recommendations
    .filter((rec) => rec.status === 'published')
    .map((rec) => ({
      slug: rec.slug,
    }));
}

export async function generateMetadata({ params }: RecommendationPageProps): Promise<Metadata> {
  const { slug } = await params;
  const recommendation = await getRecommendationBySlug(slug);

  if (!recommendation) {
    return {
      title: 'Recommendation Not Found | Engify.ai',
    };
  }

  const title = `${recommendation.title} - AI Development Recommendation | Engify.ai`;
  const description = recommendation.description || recommendation.recommendationStatement;
  // Combine all keywords for SEO
  const allKeywords = [
    ...(recommendation.primaryKeywords || []),
    ...(recommendation.recommendationKeywords || []),
    ...(recommendation.solutionKeywords || []),
    ...(recommendation.keywords || []),
  ];

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows/recommendations/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows/recommendations/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: allKeywords.length > 0 ? allKeywords : recommendation.keywords || [],
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  'best-practices': 'Best Practices',
  'strategic-guidance': 'Strategic Guidance',
  'tool-selection': 'Tool Selection',
  'team-structure': 'Team Structure',
  'process-optimization': 'Process Optimization',
  'risk-mitigation': 'Risk Mitigation',
};

export default async function RecommendationPage({ params }: RecommendationPageProps) {
  const { slug } = await params;
  const recommendation = await getRecommendationBySlug(slug);

  if (!recommendation || recommendation.status !== 'published') {
    notFound();
  }

  // Load all workflows for related content matching
  const allWorkflows = await loadWorkflowsFromJson();

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: recommendation.title,
    description: recommendation.description,
    url: `${APP_URL}/workflows/recommendations/${slug}`,
    about: {
      '@type': 'Thing',
      name: 'AI Development Recommendations',
    },
  };

  // Find related workflows
  const relatedWorkflows = recommendation.relatedWorkflows
    .map((workflowPath) => {
      return allWorkflows.find((w) => {
        const path = `${w.category}/${w.slug}`;
        return path === workflowPath;
      });
    })
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  // Find related guardrails
  const relatedGuardrails = recommendation.relatedGuardrails
    .map((guardrailPath) => {
      return allWorkflows.find((w) => {
        if (w.category !== 'guardrails') return false;
        // Guardrails can be referenced as "guardrails/[slug]" or "guardrails/subcategory/slug"
        // We'll match both formats
        const path1 = `guardrails/${w.slug}`;
        const path2 = w.subcategory ? `guardrails/${w.subcategory}/${w.slug}` : null;
        return guardrailPath === path1 || guardrailPath === path2;
      });
    })
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

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
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/workflows" className="hover:text-foreground">
              Workflows
            </Link>
            <span className="mx-2">/</span>
            <Link href="/workflows/recommendations" className="hover:text-foreground">
              Recommendations
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{recommendation.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant={recommendation.priority === 'high' ? 'default' : 'outline'}>
                {recommendation.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge variant="outline">
                {CATEGORY_LABELS[recommendation.category] || recommendation.category}
              </Badge>
              {recommendation.audience.map((audience) => (
                <Badge key={audience} variant="secondary" className="text-xs">
                  {audience.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              ))}
            </div>
            <h1 className="mb-4 text-4xl font-bold">{recommendation.title}</h1>
            <p className="text-lg text-muted-foreground">{recommendation.description}</p>
          </header>

          {/* Recommendation Statement */}
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium leading-relaxed text-foreground">{recommendation.recommendationStatement}</p>
            </CardContent>
          </Card>

          {/* Why This Matters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Why This Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{recommendation.whyThisMatters}</p>
            </CardContent>
          </Card>

          {/* When to Apply */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>When to Apply</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{recommendation.whenToApply}</p>
            </CardContent>
          </Card>

          {/* Implementation Guidance */}
          {recommendation.implementationGuidance && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle>Implementation Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{recommendation.implementationGuidance}</p>
              </CardContent>
            </Card>
          )}

          {/* Related Workflows */}
          {relatedWorkflows.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Related Workflows</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Workflows that implement or support this recommendation.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedWorkflows.map((workflow) => (
                    <Link
                      key={workflow.slug}
                      href={`/workflows/${workflow.category}/${workflow.slug}`}
                      className="group rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                    >
                      <h3 className="mb-2 font-semibold group-hover:text-primary">{workflow.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{workflow.problemStatement}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related Guardrails */}
          {relatedGuardrails.length > 0 && (
            <Card className="mb-8 border-orange-500/20 bg-orange-500/5">
              <CardHeader>
                <CardTitle>Related Guardrails</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Guardrails that help prevent incidents related to this recommendation.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {relatedGuardrails.map((guardrail) => (
                    <Link
                      key={guardrail.slug}
                      href={`/workflows/${guardrail.category}/${guardrail.slug}`}
                      className="group rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-semibold group-hover:text-primary">{guardrail.title}</h3>
                        {guardrail.severity && (
                          <Badge variant={guardrail.severity === 'critical' || guardrail.severity === 'high' ? 'destructive' : 'default'} className="text-xs">
                            {guardrail.severity.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{guardrail.problemStatement}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Research Citations */}
          {recommendation.researchCitations && recommendation.researchCitations.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Research & Citations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {recommendation.researchCitations.map((citation, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{citation.source}</strong>
                      {citation.url && (
                        <>
                          {' - '}
                          <a
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {citation.url}
                          </a>
                        </>
                      )}
                      {citation.summary && (
                        <>
                          <br />
                          <span className="text-xs">{citation.summary}</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold">Ready to implement this recommendation?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Explore our workflows and guardrails to learn how teams put this recommendation into practice.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/workflows#workflow-library">Explore workflows &amp; guardrails</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/workflows/recommendations">View all recommendations</Link>
              </Button>
            </div>
          </div>

          {/* Author Attribution */}
          <div className="mt-12">
            <AuthorAttribution showFull={true} />
          </div>
        </div>
      </MainLayout>
    </>
  );
}

