import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPainPointBySlug, loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import { AuthorAttribution } from '@/components/workflows/AuthorAttribution';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

interface PainPointPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const painPoints = await loadPainPointsFromJson();
  return painPoints
    .filter(pp => pp.status === 'published')
    .map(pp => ({
      slug: pp.slug,
    }));
}

export async function generateMetadata({ params }: PainPointPageProps): Promise<Metadata> {
  const { slug } = await params;
  const painPoint = await getPainPointBySlug(slug);

  if (!painPoint) {
    return {
      title: 'Pain Point Not Found | Engify.ai',
    };
  }

  const title = `${painPoint.title} - AI Development Pain Point | Engify.ai`;
  const description = painPoint.description || painPoint.problemStatement;
  // Combine all keywords for SEO
  const allKeywords = [
    ...(painPoint.primaryKeywords || []),
    ...(painPoint.painPointKeywords || []),
    ...(painPoint.solutionKeywords || []),
    ...(painPoint.keywords || []),
  ];

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows/pain-points/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows/pain-points/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: allKeywords.length > 0 ? allKeywords : painPoint.keywords || [],
  };
}

export default async function PainPointPage({ params }: PainPointPageProps) {
  const { slug } = await params;
  const painPoint = await getPainPointBySlug(slug);

  if (!painPoint || painPoint.status !== 'published') {
    notFound();
  }

  // Load all workflows for solutionWorkflows matching
  const allWorkflows = await loadWorkflowsFromJson();

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: painPoint.title,
    description: painPoint.description,
    url: `${APP_URL}/workflows/pain-points/${slug}`,
    about: {
      '@type': 'Thing',
      name: 'AI Development Pain Points',
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
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/workflows" className="hover:text-foreground">
              Workflows
            </Link>
            <span className="mx-2">/</span>
            <Link href="/workflows/pain-points" className="hover:text-foreground">
              Pain Points
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{painPoint.title}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">{painPoint.title}</h1>
            <p className="text-lg text-muted-foreground">{painPoint.description}</p>
          </header>

          {/* Problem Statement */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Problem Statement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{painPoint.problemStatement}</p>
            </CardContent>
          </Card>

          {/* Impact on Teams & Business */}
          {painPoint.impact && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle>Impact on Teams & Business</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{painPoint.impact}</p>
              </CardContent>
            </Card>
          )}

          {/* Expanded Examples */}
          {painPoint.expandedExamples && painPoint.expandedExamples.length > 0 ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Real-World Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {painPoint.expandedExamples.map((example, index) => (
                    <div key={index} className="rounded-lg border bg-card p-4">
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{example.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{example.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : painPoint.examples && painPoint.examples.length > 0 ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Real-World Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {painPoint.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-1 text-primary">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : null}

          {/* Solution Workflows */}
          {painPoint.solutionWorkflows && painPoint.solutionWorkflows.length > 0 && (
            <Card className="mb-8 border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle>Solution Workflows</CardTitle>
                <p className="text-sm text-muted-foreground">
                  The problem isn't the AI; it's the lack of a human-in-the-loop verification and governance system. These workflows are the perfect antidote.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {painPoint.solutionWorkflows.map((solution, index) => {
                    const workflow = allWorkflows.find(w => {
                      const workflowPath = `${w.category}/${w.slug}`;
                      return workflowPath === solution.workflowId;
                    });

                    return (
                      <div key={index} className="rounded-lg border bg-card p-6">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="mb-2 text-xl font-semibold text-foreground">{solution.title}</h3>
                            {workflow && (
                              <Link
                                href={`/workflows/${workflow.category}/${workflow.slug}`}
                                className="text-sm text-primary hover:underline"
                              >
                                View workflow →
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              The Pain Point It Solves
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{solution.painPointItSolves}</p>
                          </div>
                          <div>
                            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                              Why It Works
                            </h4>
                            <p className="text-sm leading-relaxed text-muted-foreground">{solution.whyItWorks}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold">Want to prevent this pain point?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Explore our workflows and guardrails to learn how teams address this issue.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/workflows#workflow-library">Explore workflows &amp; guardrails</Link>
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

