import { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const metadata: Metadata = {
  title: 'Donnie Laur - AI Guardrails & Engineering Leadership | Engify.ai',
  description:
    'Donnie Laur leads AI guardrail strategy and engineering excellence. Human-created, AI-assisted workflows and content for operationalizing AI in engineering teams.',
  keywords: [
    'Donnie Laur',
    'AI guardrails',
    'engineering leadership',
    'AI-assisted development',
    'engineering director',
  ],
  authors: [{ name: 'Donnie Laur', url: `${APP_URL}/authors/donnie-laur` }],
  openGraph: {
    title: 'Donnie Laur - AI Guardrails & Engineering Leadership',
    description:
      'Leading AI guardrail strategy and engineering excellence. Human-created, AI-assisted workflows and content.',
    type: 'profile',
    url: `${APP_URL}/authors/donnie-laur`,
  },
  twitter: {
    card: 'summary',
    title: 'Donnie Laur - AI Guardrails & Engineering Leadership',
    description:
      'Leading AI guardrail strategy and engineering excellence. Human-created, AI-assisted workflows.',
  },
};


export const revalidate = 3600; // Revalidate once per hour

export default async function AuthorPage() {
  const workflows = await loadWorkflowsFromJson();
  const publishedWorkflows = workflows.filter((w) => w.status === 'published').slice(0, 6);

  // Generate Person structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Donnie Laur',
    jobTitle: 'Engineering Leader & AI Guardrails Leader',
    url: `${APP_URL}/authors/donnie-laur`,
    email: 'donlaur@engify.ai',
    sameAs: [
      'https://github.com/donlaur', // Update with actual GitHub URL
      'https://linkedin.com/in/donnie-laur', // Update with actual LinkedIn URL
    ],
    description:
      'Leading AI guardrail strategy and engineering excellence. Creating workflows and content to operationalize AI in engineering teams. Human-created, AI-assisted.',
    knowsAbout: [
      'AI Guardrails',
      'Engineering Leadership',
      'AI-Assisted Development',
      'Software Engineering',
      'Platform Engineering',
    ],
    creator: {
      '@type': 'Organization',
      name: 'Engify.ai',
      url: APP_URL,
    },
    // Transparency: Human-created, AI-assisted
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'Creation Process',
      value: 'Human-created, AI-assisted',
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
        <div className="container py-16">
          {/* Header */}
          <header className="mx-auto mb-12 max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icons.user className="h-16 w-16" />
              </div>
            </div>
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Donnie Laur</h1>
            <p className="mb-2 text-xl font-semibold text-muted-foreground">
              Engineering Leader & AI Guardrails Leader
            </p>
            <p className="mb-6 text-sm italic text-muted-foreground">
              Human-created, AI-assisted
            </p>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Leading AI guardrail strategy and engineering excellence. Building Engify.ai—a
              production B2B SaaS platform that helps engineering teams operationalize AI through
              structured workflows, guardrails, and best practices based on real production incidents
              and audit findings.
            </p>
          </header>

          {/* Contact & Links */}
          <section className="mx-auto mb-12 max-w-4xl">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">Contact & Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild variant="outline" size="sm">
                    <Link href="mailto:donlaur@engify.ai">
                      <Icons.mail className="mr-2 h-4 w-4" />
                      Email
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="https://github.com/donlaur" target="_blank" rel="noopener noreferrer">
                      <Icons.github className="mr-2 h-4 w-4" />
                      GitHub
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link
                      href="https://linkedin.com/in/donnie-laur"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icons.linkedin className="mr-2 h-4 w-4" />
                      LinkedIn
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/hireme">
                      <Icons.briefcase className="mr-2 h-4 w-4" />
                      Hire Me
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Bio */}
          <section className="mx-auto mb-12 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Donnie Laur is an Engineering Leader specializing in AI guardrail strategy and
                  engineering excellence. He is the creator of Engify.ai, a production B2B SaaS
                  platform that helps engineering teams operationalize AI through structured workflows,
                  automated guardrails, and best practices based on real production incidents and
                  audit findings.
                </p>
                <p>
                  Engify.ai demonstrates enterprise-grade engineering practices including RBAC security,
                  audit logging, cost optimization, incident playbooks, ADRs, and systematic quality
                  gates that prevent production issues. The platform serves as both a practical tool
                  and a showcase of how to build production-ready, AI-enabled SaaS applications.
                </p>
                <p>
                  All workflows, pain points, and content are <strong>human-created, AI-assisted</strong>,
                  representing real production incidents, audit findings, and industry best practices
                  from engineering teams working with AI tools.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Featured Work */}
          <section className="mx-auto mb-12 max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Featured Work</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Workflows, guardrails, and content authored by Donnie Laur
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Workflows & Guardrails</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Industry-proven workflows that prevent common AI-assisted development issues.
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {publishedWorkflows.slice(0, 4).map((workflow) => (
                      <Badge key={workflow.slug} variant="outline" className="text-xs">
                        {workflow.title}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/workflows">
                      View All Workflows
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Pain Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Real production incidents and audit findings from AI-assisted development
                    teams.
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      Almost Correct Code
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Missing Validations
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Oversized PRs
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Context Forgetting
                    </Badge>
                  </div>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/workflows/pain-points">
                      View All Pain Points
                      <Icons.arrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cross-links */}
          <section className="mx-auto max-w-4xl">
            <Card className="border-primary/10 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-xl">Explore More</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/workflows">
                      <Icons.bookOpen className="mr-2 h-4 w-4" />
                      Workflows & Guardrails
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/workflows/pain-points">
                      <Icons.alertCircle className="mr-2 h-4 w-4" />
                      Pain Points
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/learn">
                      <Icons.graduationCap className="mr-2 h-4 w-4" />
                      Learn Articles
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/hireme">
                      <Icons.briefcase className="mr-2 h-4 w-4" />
                      Resume & Hiring
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </MainLayout>
    </>
  );
}

