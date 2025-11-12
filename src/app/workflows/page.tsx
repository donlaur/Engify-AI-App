import type { Metadata } from 'next';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowFilters } from './WorkflowFilters';
import {
  listWorkflowAudiences,
  listWorkflowCategories,
  loadWorkflowsFromJson,
  getWorkflowsMetadata,
} from '@/lib/workflows/load-workflows-from-json';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { WORKFLOW_AUDIENCES } from '@/lib/workflows/workflow-schema';
import { formatDate } from '@/lib/utils';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

const CATEGORY_LABELS: Record<string, string> = {
  'code-quality': 'Code Quality',
  security: 'Security',
  'ai-behavior': 'AI Behavior',
  memory: 'Memory & Knowledge',
  'risk-management': 'Risk Management',
  process: 'Process & Delivery',
  governance: 'Governance',
  enablement: 'Enablement',
  community: 'Community',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'code-quality': 'Prevent almost-right code and oversized PRs before they leave review.',
  security: 'Ship AI-assisted changes without opening new attack surfaces or leaking secrets.',
  'ai-behavior': 'Keep agents, copilots, and planners inside the guardrails you set.',
  memory: 'Build organizational memory so incidents and lessons don’t get forgotten.',
  process: 'Tame AI velocity with delivery cadences that reduce conflict and churn.',
  governance: 'Give platform and security teams a single source of truth for AI policy.',
  'risk-management': 'Spot downstream blast radius—metrics, dashboards, and compliance.',
  enablement: 'Upskill juniors and stakeholders without letting skills atrophy.',
  community: 'Community-tested workflows contributed by Engify builders.',
};

const CATEGORY_SECTION_ORDER: string[] = [
  'code-quality',
  'security',
  'ai-behavior',
  'memory',
  'process',
  'governance',
  'risk-management',
  'enablement',
  'community',
];

const AUDIENCE_LABELS: Record<string, string> = {
  engineers: 'Engineers',
  'engineering-managers': 'Engineering Managers',
  'product-managers': 'Product Managers',
  analysts: 'Analysts',
  security: 'Security',
  qa: 'QA',
};

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

interface WorkflowsPageProps {
  searchParams?: {
    category?: string;
    audience?: string;
  };
}

export default async function WorkflowsPage({ searchParams }: WorkflowsPageProps) {
  const [workflows, categories, audiences, metadata] = await Promise.all([
    loadWorkflowsFromJson(),
    listWorkflowCategories(),
    listWorkflowAudiences(),
    getWorkflowsMetadata(),
  ]);

  const selectedCategory = searchParams?.category;

  const selectedAudience = isWorkflowAudience(searchParams?.audience)
    ? searchParams?.audience
    : undefined;

  const lastUpdatedLabel = metadata.generatedAt
    ? formatDate(metadata.generatedAt)
    : 'Unspecified';

  const filteredWorkflows = workflows.filter((workflow) => {
    if (selectedCategory && workflow.category !== selectedCategory) {
      return false;
    }

    if (selectedAudience && !workflow.audience.includes(selectedAudience)) {
      return false;
    }

    return workflow.status !== 'coming_soon';
  });

  const activeCategoryLabel = selectedCategory
    ? CATEGORY_LABELS[selectedCategory] ?? formatLabel(selectedCategory)
    : 'All Categories';

  const activeAudienceLabel = selectedAudience
    ? AUDIENCE_LABELS[selectedAudience] ?? formatLabel(selectedAudience)
    : 'All Audiences';

  const groupedWorkflows = filteredWorkflows.reduce<Record<string, Workflow[]>>((acc, workflow) => {
    acc[workflow.category] = acc[workflow.category] ?? [];
    acc[workflow.category].push(workflow);
    return acc;
  }, {});

  const orderedCategories = [...CATEGORY_SECTION_ORDER];
  Object.keys(groupedWorkflows)
    .filter((category) => !CATEGORY_SECTION_ORDER.includes(category))
    .forEach((category) => orderedCategories.push(category));

  const summaryRows = workflows.map((workflow) => {
    const painPoint = workflow.seoStrategy?.painPointFocus ?? workflow.title;
    const checklistHighlight = workflow.manualChecklist[0] ?? 'See checklist in detail view';

    return {
      id: `${workflow.category}-${workflow.slug}`,
      painPoint,
      checklistHighlight,
      status: formatSolutionStatus(workflow),
    };
  });

  return (
    <MainLayout>
      <div className="container py-10">
        <header className="mb-12 rounded-xl border bg-gradient-to-br from-primary/10 via-background to-background p-10 text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <Badge variant="secondary" className="uppercase tracking-wider">
              Guardrail Library
            </Badge>
            <h1 className="text-4xl font-bold md:text-5xl">
              Industry-Proven AI Guardrails &amp; Workflows
            </h1>
            <p className="text-lg text-muted-foreground">
              Precisely documented checklists that teams can run today—and a preview of the automated
              Engify guardrails rolling out through our private beta. Pick a failure mode, follow the
              manual steps, and see how Engify turns them into always-on protection.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="#workflow-library">Explore workflows &amp; guardrails</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/waitlist/guardrails">Join the guardrail beta</Link>
              </Button>
            </div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Private beta: Guardrail automation cohort applications now open
            </p>
            <p className="text-sm text-muted-foreground">
              Catalog last updated {lastUpdatedLabel} · {metadata.totalWorkflows} workflows published
            </p>
          </div>
        </header>

        <section className="mb-12 grid gap-6 md:grid-cols-2">
          {WHY_GUARDRAILS_MATTER.map((item) => (
            <div key={item.title} className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">
                Source: {item.source}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10 rounded-lg border bg-card/70 p-6">
          <h2 className="mb-3 text-2xl font-bold">How we select and maintain workflows</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every guardrail originates from repeated audit findings inside Engify or across partner
            repos. We document the pain point, ship the manual checklist, cite third-party research,
            and only label items “Live” once the Engify automation is in production. Nothing is
            aspirational. Status badges show what’s manual, what’s in design, and what’s shipping in
            the beta.
          </p>
        </section>

        <section className="mb-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Guardrail delivery tracker</h2>
              <p className="text-xs text-muted-foreground">
                Pain point → current manual checklist → Engify automation status
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing <strong>{filteredWorkflows.length}</strong> workflows · Category: {activeCategoryLabel} · Audience: {activeAudienceLabel}
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50 text-left uppercase tracking-wide text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Pain point focus</th>
                  <th className="px-4 py-3">Checklist highlight</th>
                  <th className="px-4 py-3">Engify solution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {summaryRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      {row.painPoint}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {row.checklistHighlight}
                    </td>
                    <td className="px-4 py-3 align-top text-muted-foreground">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <WorkflowFilters categories={categories} audiences={audiences} />
        </section>

        <section id="workflow-library" className="mb-16 space-y-10">
          {orderedCategories.map((category) => {
            const items = groupedWorkflows[category];
            if (!items || items.length === 0) {
              return null;
            }

            return (
              <div key={category} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {CATEGORY_LABELS[category] ?? formatLabel(category)}
                    </h3>
                    {CATEGORY_DESCRIPTIONS[category] && (
                      <p className="text-sm text-muted-foreground">
                        {CATEGORY_DESCRIPTIONS[category]}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs uppercase">
                    {items.length} workflows
                  </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((workflow) => (
                    <WorkflowCard key={`${workflow.category}-${workflow.slug}`} workflow={workflow} />
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {filteredWorkflows.length === 0 && (
          <div className="mb-16 rounded-lg border border-dashed bg-muted/40 p-8 text-center">
            <p className="text-lg font-semibold">No workflows match these filters yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try clearing the filters or subscribe to the guardrail beta to be notified first.
            </p>
          </div>
        )}

        <section className="mb-16 rounded-lg border bg-card p-8">
          <h2 className="mb-4 text-2xl font-semibold">How Engify runs guardrails today</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            These are not theoretical. They are the guardrails we enforce on every Engify commit.
            Detailed playbooks live in{' '}
            <Link href="/docs/showcase/AI_WORKFLOW_GUARDRAILS" className="text-primary underline">
              AI Workflow Guardrails
            </Link>
            .
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {LIVE_PRACTICES.map((practice) => (
              <div key={practice.title} className="rounded-lg border border-dashed bg-background p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">
                  {practice.title}
                </h3>
                <p className="text-sm text-muted-foreground">{practice.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-2xl font-semibold">Deeper engagement</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {DEEPER_ENGAGEMENT.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}:</strong> {item.description}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/downloads/engify-guardrail-checklist.pdf">Download quality checklist</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/waitlist/guardrails">Join the guardrail beta</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-2xl font-semibold">Community guardrail submissions</h2>
            <p className="text-sm text-muted-foreground">
              Engify is building the largest open library of guardrail workflows. Share yours and we
              will review it for publication with full attribution.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {COMMUNITY_CRITERIA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="https://github.com/engify-ai/engify-ai-app/issues/new?template=workflow-submission.md">
                  Submit via GitHub
                </Link>
              </Button>
              <Button asChild>
                <Link href="https://forms.gle/engify-guardrail-submission">Share via form</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

const WHY_GUARDRAILS_MATTER = [
  {
    title: 'Productivity without regressions',
    description:
      'GitClear’s 2025 State of AI Commit Quality shows PR defect rates jump 7.2% when reviews cross ~300 changed lines. Our workflows force small, reviewable slices.',
    source: 'GitClear 2025, Engify internal PR audits',
  },
  {
    title: 'Quality & verification discipline',
    description:
      'Stack Overflow’s 2025 survey reports 66% of developers struggle with “almost-right” AI answers. TDD, scratchpads, and confidence scoring workflows reclaim review time.',
    source: 'Stack Overflow 2025 Developer Survey',
  },
  {
    title: 'Security and compliance resilience',
    description:
      'Veracode’s AI Security Report found 45% of AI-generated snippets ship with vulnerabilities. Engify’s guardrails require SAST/SCA and secret scanning before merge.',
    source: 'Veracode 2025 AI Security Report',
  },
  {
    title: 'Context drift containment',
    description:
      'Developer surveys show teams lose 10–15 hours per week when AI incidents aren’t logged. Memory workflows document cause, impact, and resolution so lessons persist.',
    source: 'Developer Survey Aggregate 2025',
  },
];

const LIVE_PRACTICES = [
  {
    title: 'Pre-commit guardrail enforcement',
    description:
      'scripts/ai/enforce-guardrails.ts blocks commits that skip icon validation, schema checks, or compliance scripts. No silent bypasses.',
  },
  {
    title: 'Mandatory pre-change checklist',
    description:
      'Before edits, we run ./scripts/ai/pre-change-check.sh to surface existing tools, confirm hooks, and prevent duplicate automation.',
  },
  {
    title: 'Quality gate hierarchy',
    description:
      'Enterprise compliance → schema → tests → icons → security → linting. Each gate is independent, so one failure cannot skip the rest.',
  },
  {
    title: 'Commit discipline metrics',
    description:
      'We monitor --no-verify usage, enforce conventional commits, and keep branch age under 36 hours to avoid merge debt.',
  },
];

const DEEPER_ENGAGEMENT = [
  {
    title: 'Install the guardrail quality checklist',
    description: 'Bundle the manual steps into your own pre-commit hooks with our ready-to-run script.',
  },
  {
    title: 'Join the private beta cohort',
    description: 'Access Engify’s automation engine that turns these manual workflows into MCP-powered guardrails.',
  },
  {
    title: 'Book a governance workshop',
    description: 'Walk through failure modes with Engify advisors and build your own guardrail backlog.',
  },
];

const COMMUNITY_CRITERIA = [
  'Must document the failure mode, manual checklist, and verification steps.',
  'Cite research or production incidents that prove the guardrail is needed.',
  'Share results after 30 days so we can publish measurable impact.',
];

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const audienceBadges = workflow.audience.map((aud) => (
    <Badge key={aud} variant="secondary" className="capitalize">
      {AUDIENCE_LABELS[aud] ?? formatLabel(aud)}
    </Badge>
  ));

  const checklistPreview = workflow.manualChecklist.slice(0, 3);

  return (
    <article className="group flex h-full flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition hover:border-primary/60 hover:shadow-md">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[workflow.category] ?? formatLabel(workflow.category)}
            </p>
            <h3 className="text-2xl font-semibold group-hover:text-primary">
              <Link href={`/workflows/${workflow.category}/${workflow.slug}`}>
                {workflow.title}
              </Link>
            </h3>
          </div>
          <Badge variant={workflow.status === 'published' ? 'secondary' : 'outline'} className="text-xs uppercase">
            {workflow.status.replace('-', ' ')}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground">{workflow.problemStatement}</p>

        <div className="flex flex-wrap gap-2">{audienceBadges}</div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Manual checklist highlight
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {checklistPreview.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span>{item}</span>
              </li>
            ))}
            {workflow.manualChecklist.length > checklistPreview.length && (
              <li className="text-xs uppercase tracking-wide text-muted-foreground">
                +{workflow.manualChecklist.length - checklistPreview.length} more steps inside
              </li>
            )}
          </ul>
        </div>

        {workflow.relatedResources && hasRelatedResources(workflow) && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Related Engify assets
            </h4>
            <div className="flex flex-wrap gap-2 text-xs text-primary">
              {(['prompts', 'patterns', 'learn'] as const).map((key) => {
                const entries = workflow.relatedResources?.[key];
                if (!entries || entries.length === 0) {
                  return null;
                }

                return entries.slice(0, 2).map((entry) => (
                  <Link key={`${key}-${entry}`} href={resolveRelatedLink(key, entry)} className="rounded-full border border-primary/40 px-2 py-1 hover:border-primary">
                    {APP_SECTION_LABELS[key]} · {entry}
                  </Link>
                ));
              })}
            </div>
          </div>
        )}

        {workflow.painPointKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {workflow.painPointKeywords.slice(0, 5).map((keyword) => (
              <span key={keyword} className="rounded-full bg-muted px-2 py-1">
                #{formatKeyword(keyword)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <Link href={`/workflows/${workflow.category}/${workflow.slug}`} className="font-medium text-primary hover:underline">
          View workflow →
        </Link>
        <p className="text-xs text-muted-foreground">{formatSolutionStatus(workflow)}</p>
      </div>

      {workflow.cta?.label || workflow.automationTeaser ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {workflow.cta?.label && workflow.cta.href && (
            <Button asChild size="sm">
              <Link href={workflow.cta.href} target={workflow.cta.type === 'external' ? '_blank' : undefined} rel={workflow.cta.type === 'external' ? 'noopener noreferrer' : undefined}>
                {workflow.cta.label}
              </Link>
            </Button>
          )}
          {workflow.automationTeaser && (
            <Badge variant="outline" className="text-xs uppercase">
              {workflow.automationTeaser}
            </Badge>
          )}
        </div>
      ) : null}
    </article>
  );
}

function formatKeyword(keyword: string): string {
  return keyword.replace(/[-_]/g, ' ').toLowerCase();
}

function isWorkflowAudience(value: string | undefined): value is Workflow['audience'][number] {
  if (!value) {
    return false;
  }

  return (WORKFLOW_AUDIENCES as readonly string[]).includes(value);
}

function formatSolutionStatus(workflow: Workflow): string {
  const statusLabel = workflow.status === 'coming_soon'
    ? 'Planned'
    : workflow.status === 'draft'
      ? 'In design'
      : 'Live';

  if (workflow.automationTeaser) {
    return `${statusLabel}: ${workflow.automationTeaser}`;
  }

  if (workflow.cta?.label) {
    return `${statusLabel}: ${workflow.cta.label}`;
  }

  return statusLabel;
}

function formatLabel(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasRelatedResources(workflow: Workflow): boolean {
  return Boolean(
    workflow.relatedResources?.prompts?.length ||
      workflow.relatedResources?.patterns?.length ||
      workflow.relatedResources?.learn?.length
  );
}

function resolveRelatedLink(section: 'prompts' | 'patterns' | 'learn', identifier: string) {
  if (section === 'prompts') {
    return `/prompts/${identifier}`;
  }

  if (section === 'patterns') {
    return `/patterns/${identifier}`;
  }

  return identifier.startsWith('/') ? identifier : `/learn/${identifier}`;
}
