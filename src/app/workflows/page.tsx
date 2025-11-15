import type { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { WorkflowsClient } from './WorkflowsClient';
import { WorkflowTracking } from './WorkflowTracking';
import {
  listWorkflowAudiences,
  listWorkflowCategories,
  loadWorkflowsFromJson,
  getWorkflowsMetadata,
} from '@/lib/workflows/load-workflows-from-json';
import { getPainPointsMetadata } from '@/lib/workflows/load-pain-points-from-json';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

export const revalidate = 3600; // Revalidate once per hour

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getWorkflowsMetadata();
  const title = `${metadata.totalWorkflows || 0} Industry-Proven AI Guardrail Workflows | Engify.ai`;
  const description =
    'Industry-proven workflows and guardrails that prevent AI-assisted teams from shipping regressions, breaking trust, or losing context. Filter by team and failure mode.';

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      'ai guardrails',
      'engineering workflows',
      'ai risk mitigation',
      'workflow library',
      'ai safety playbooks',
    ],
    authors: [{ name: 'Donnie Laur' }],
  };
}

export default async function WorkflowsPage() {
  const [workflows, categories, audiences, metadata, painPointsMetadata] = await Promise.all([
    loadWorkflowsFromJson(),
    listWorkflowCategories(),
    listWorkflowAudiences(),
    getWorkflowsMetadata(),
    getPainPointsMetadata(),
  ]);

  // Filter out coming_soon workflows
  const visibleWorkflows = workflows.filter((workflow) => workflow.status !== 'coming_soon');

  // Calculate stats
  const categoryStats = visibleWorkflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const audienceStats = visibleWorkflows.reduce((acc, workflow) => {
    workflow.audience.forEach((aud) => {
      acc[aud] = (acc[aud] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Guardrail Workflows',
    description: `Browse ${metadata.totalWorkflows || visibleWorkflows.length} industry-proven workflows and guardrails that prevent AI-assisted teams from shipping regressions.`,
    url: `${APP_URL}/workflows`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: visibleWorkflows.length,
      itemListElement: visibleWorkflows.slice(0, 50).map((workflow, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'HowTo',
          name: workflow.title,
          description: workflow.problemStatement,
          url: `${APP_URL}/workflows/${workflow.category}/${workflow.slug}`,
          about: {
            '@type': 'Thing',
            name: workflow.category,
          },
        },
      })),
    },
    about: {
      '@type': 'Thing',
      name: 'AI Guardrails and Engineering Workflows',
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
        <WorkflowTracking />
        <div className="container py-10">
        <header className="mb-8 text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <h1 className="mb-4 text-4xl font-bold">
              Industry-Proven AI Guardrails &amp; Workflows
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              Precisely documented checklists that teams can run today. Pick a failure mode, follow the
              manual steps, and see how these workflows help prevent common AI-assisted development issues.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button asChild size="lg">
                <Link href="#workflow-library">Explore workflows</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/workflows/pain-points">View pain points</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/workflows/recommendations">View recommendations</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Brief intro - Workflows & Guardrails Cards */}
        <section className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Workflows Card */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Workflows</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Workflows</strong> are step-by-step checklists that address specific <Link href="/workflows/pain-points" className="text-primary hover:underline">pain points</Link> in AI-assisted development. Each workflow transforms a pain point into a preventable pattern with actionable steps your team can implement today.
              </p>
              <p>
                These are <strong className="text-foreground">manual processes</strong> you can start using immediately—no automation required. They're battle-tested patterns backed by industry research and real-world production incidents.
              </p>
            </div>
          </div>

          {/* Guardrails Card */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold">Guardrails</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Guardrails</strong> are automated quality gates that enforce workflow checklists automatically. They transform manual processes into always-on automation that prevents <Link href="/workflows/pain-points" className="text-primary hover:underline">pain points</Link> before code reaches production.
              </p>
              <p>
                While workflows are manual checklists you can use today, <strong className="text-foreground">guardrails automate these workflows</strong> to catch issues before they become incidents. Automated guardrails turn pain points into prevented patterns at every commit.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/guardrails">
                    Browse all guardrails →
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How we select and maintain workflows & Evolution Path - 2 Cards */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          {/* How we select and maintain workflows */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">How we select and maintain workflows</h2>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Every guardrail originates from repeated audit findings and real-world production incidents.
              We document the pain point, provide the manual checklist, and cite third-party research.
              These workflows are battle-tested patterns that teams can implement today.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Selection Criteria:</strong>
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Addresses a failure mode that appears in multiple production incidents or audit reports</li>
                <li>Has measurable impact (defect rates, security vulnerabilities, time lost)</li>
                <li>Can be implemented manually with existing tools (no proprietary dependencies)</li>
                <li>Backed by third-party research or industry-standard practices</li>
                <li>Includes clear, actionable checklist steps that teams can follow immediately</li>
              </ul>
            </div>
          </div>

          {/* From Manual Checklists to Automated Guardrails */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold">From Manual Checklists to Automated Guardrails</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Each workflow provides a <strong className="text-foreground">manual checklist</strong> you can implement today. These are the foundation of guardrail automation—proven patterns that work when executed manually, ready to be codified into pre-commit hooks, CI/CD gates, and automated validation.
              </p>
              <p>
                <strong className="text-foreground">The Evolution Path:</strong>
              </p>
              <ol className="ml-6 list-decimal space-y-2">
                <li><strong className="text-foreground">Start Manual:</strong> Use the checklist in code reviews and PR templates</li>
                <li><strong className="text-foreground">Add Automation:</strong> Convert checklist steps into pre-commit hooks and CI checks</li>
                <li><strong className="text-foreground">Scale with Platform:</strong> Deploy guardrail automation that runs across all commits and PRs</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Teams can start with manual checklists and evolve to automated enforcement as patterns mature and tooling becomes available.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow Library - Search and Cards */}
        <section id="workflow-library" className="mb-16">
          <WorkflowsClient
            initialWorkflows={visibleWorkflows}
            categoryStats={categoryStats}
            audienceStats={audienceStats}
            uniqueCategories={categories}
            uniqueAudiences={audiences}
          />
        </section>

        {/* Why These Pain Points Matter */}
        <section className="mb-12">
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-2xl font-bold">Why These Pain Points Matter</h2>
            <p className="text-sm text-muted-foreground">
              These are the most common failure modes we see in AI-assisted development. Each represents real production incidents and audit findings from engineering teams.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {WHY_GUARDRAILS_MATTER.map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>
                {item.explanation && (
                  <div className="mb-3 rounded-md border-l-4 border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Why This Matters</p>
                    <p className="text-xs text-muted-foreground">{item.explanation}</p>
                  </div>
                )}
                {item.example && (
                  <div className="mb-3 rounded-md border-l-4 border-muted bg-muted/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Example</p>
                    <p className="text-xs italic text-muted-foreground">{item.example}</p>
                  </div>
                )}
                <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                  Source:{' '}
                  {item.sourceUrl ? (
                    <Link
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {item.source}
                    </Link>
                  ) : (
                    item.source
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
        </div>
      </MainLayout>
    </>
  );
}

const WHY_GUARDRAILS_MATTER = [
  {
    title: 'Productivity Without Regressions',
    description:
      "GitClear's 2025 State of AI Commit Quality shows PR defect rates jump 7.2% when reviews cross ~300 changed lines. Our workflows force small, reviewable slices.",
    explanation: 'Large pull requests are harder to review thoroughly, leading to defects that slip into production. This pain point affects every team using AI to generate code at scale.',
    example: 'A developer asks AI to refactor a feature, and the AI generates a 400-line PR that touches 15 files. Reviewers miss critical edge cases, and the feature breaks in production.',
    source: 'GitClear 2025 State of AI Commit Quality',
    sourceUrl: 'https://www.gitclear.com/blog/state-of-ai-commit-quality-2025',
  },
  {
    title: 'Quality & Verification Discipline',
    description:
      "Stack Overflow's 2025 survey reports 66% of developers struggle with \"almost-right\" AI answers. TDD, scratchpads, and confidence scoring workflows reclaim review time.",
    explanation: 'AI-generated code often looks correct but contains subtle bugs that only appear in edge cases. Without verification workflows, teams waste time debugging production issues.',
    example: 'AI generates a function that handles 90% of cases correctly but fails on null inputs or empty arrays. The code passes initial review but causes production incidents.',
    source: 'Stack Overflow 2025 Developer Survey',
    sourceUrl: 'https://survey.stackoverflow.co/2025',
  },
  {
    title: 'Security and Compliance Resilience',
    description:
      "Veracode's AI Security Report found 45% of AI-generated snippets ship with vulnerabilities. Our workflows require SAST/SCA and secret scanning before merge.",
    explanation: 'AI assistants don\'t understand security implications by default. They may generate code with SQL injection risks, hardcoded secrets, or missing authentication checks.',
    example: 'An AI generates a database query using string concatenation instead of parameterized queries, creating a SQL injection vulnerability that passes code review.',
    source: 'Veracode 2025 AI Security Report',
    sourceUrl: 'https://www.veracode.com/resources/reports/ai-security-report',
  },
  {
    title: 'Context Drift Containment',
    description:
      "Teams lose significant time when AI incidents aren't logged and lessons aren't documented. Memory workflows document cause, impact, and resolution so lessons persist across incidents.",
    explanation: 'When AI causes production issues, teams often fix them without documenting what went wrong. The same mistakes repeat because there\'s no institutional memory.',
    example: 'An AI agent deletes a production database table. The team restores from backup but doesn\'t document why the agent had destructive permissions. Three months later, it happens again.',
    source: 'Industry Best Practices',
    sourceUrl: undefined,
    notes: 'Based on incident response best practices and team productivity research - needs specific citation',
  },
];
