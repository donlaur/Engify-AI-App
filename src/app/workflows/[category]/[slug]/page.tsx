import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { WorkflowDetailTracking } from './WorkflowDetailTracking';
import {
  getWorkflowByCategoryAndSlug,
  getWorkflowsMetadata,
  loadWorkflowsFromJson,
} from '@/lib/workflows/load-workflows-from-json';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import { loadPatternsFromJson } from '@/lib/patterns/load-patterns-from-json';
import { loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { getVerifiedSourceUrl } from '@/lib/workflows/verified-sources';
import { AuthorAttribution } from '@/components/workflows/AuthorAttribution';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://engify.ai';

const CATEGORY_LABELS: Record<string, string> = {
  'code-quality': 'Code Quality',
  'ai-behavior': 'AI Behavior',
  'risk-management': 'Risk Management',
  memory: 'Memory & Knowledge',
  security: 'Security',
  community: 'Community',
  guardrails: 'Guardrail',
};

const SUBCATEGORY_LABELS: Record<string, string> = {
  'data-integrity': 'Data Integrity',
  security: 'Security',
  performance: 'Performance',
  availability: 'Availability',
  financial: 'Financial',
  integration: 'Integration',
  testing: 'Testing',
};

const SEVERITY_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

const AUDIENCE_LABELS: Record<string, string> = {
  engineers: 'Engineers',
  'engineering-managers': 'Engineering Managers',
  'product-managers': 'Product Managers',
  analysts: 'Analysts',
  security: 'Security',
  qa: 'QA',
};

const APP_SECTION_LABELS: Record<string, string> = {
  prompts: 'Related Prompts',
  patterns: 'Patterns',
  learn: 'Further Reading',
};

export const revalidate = 3600;
export const dynamicParams = true;

interface WorkflowDetailParams {
  category: string;
  slug: string;
}

export async function generateStaticParams() {
  const workflows = await loadWorkflowsFromJson();
  return workflows.map((workflow) => ({
    category: workflow.category,
    slug: workflow.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<WorkflowDetailParams>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const workflow = await getWorkflowByCategoryAndSlug(category, slug);

  if (!workflow) {
    return {
      title: 'Workflow not found | Engify.ai',
      description: 'The requested workflow does not exist yet. Explore other guardrails in the Engify library.',
    };
  }

  const categoryLabel = CATEGORY_LABELS[workflow.category] ?? formatLabel(workflow.category);
  const title = `${workflow.title} · ${categoryLabel} Workflow Guardrail | Engify.ai`;
  const description = workflow.problemStatement;

  return {
    title,
    description,
    alternates: {
      canonical: `${APP_URL}/workflows/${workflow.category}/${workflow.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/workflows/${workflow.category}/${workflow.slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: [
      workflow.title,
      categoryLabel,
      ...workflow.painPointKeywords,
      'ai guardrail workflow',
      'engify guardrails',
    ],
  };
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<WorkflowDetailParams>;
}) {
  const { category, slug } = await params;
  const workflow = await getWorkflowByCategoryAndSlug(category, slug);

  if (!workflow) {
    notFound();
  }

  const [_metadata, allWorkflows, allPrompts, allPatterns, allPainPoints] = await Promise.all([
    getWorkflowsMetadata(),
    loadWorkflowsFromJson(),
    loadPromptsFromJson(),
    loadPatternsFromJson(),
    loadPainPointsFromJson(),
  ]);

  const categoryLabel = CATEGORY_LABELS[workflow.category] ?? formatLabel(workflow.category);

  const adjacentWorkflows = (workflow.relatedResources?.adjacentWorkflows ?? [])
    .map((slug) => allWorkflows.find((item) => item.slug === slug))
    .filter((item): item is Workflow => Boolean(item));

  // Find other workflows for the same audience (role-based recommendations)
  const roleBasedWorkflows = allWorkflows
    .filter((item) => {
      // Don't include current workflow
      if (item.slug === workflow.slug && item.category === workflow.category) {
        return false;
      }
      // Include workflows that share at least one audience with current workflow
      return item.audience.some((aud) => workflow.audience.includes(aud));
    })
    .slice(0, 6); // Limit to 6 recommendations

  // Generate JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: workflow.title,
    description: workflow.problemStatement,
    url: `${APP_URL}/workflows/${workflow.category}/${workflow.slug}`,
    about: {
      '@type': 'Thing',
      name: categoryLabel,
    },
    step: workflow.manualChecklist.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      text: step,
    })),
    audience: {
      '@type': 'Audience',
      audienceType: workflow.audience.map((aud) => AUDIENCE_LABELS[aud] ?? formatLabel(aud)).join(', '),
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
        <WorkflowDetailTracking
          workflowId={`${workflow.category}/${workflow.slug}`}
          workflowTitle={workflow.title}
          category={workflow.category}
        />
        <div className="container py-10">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Icons.chevronRight className="h-4 w-4" />
          <Link
            href={`/workflows${workflow.category ? `?category=${encodeURIComponent(workflow.category)}` : ''}`}
            className="hover:text-primary"
          >
            Workflows
          </Link>
          <Icons.chevronRight className="h-4 w-4" />
          <span className="text-foreground">{workflow.title}</span>
        </nav>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{categoryLabel}</Badge>
                {workflow.subcategory && (
                  <Badge variant="outline">
                    {SUBCATEGORY_LABELS[workflow.subcategory] ?? formatLabel(workflow.subcategory)}
                  </Badge>
                )}
                {workflow.severity && (
                  <Badge variant={SEVERITY_COLORS[workflow.severity] || 'default'}>
                    {workflow.severity.toUpperCase()}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold">{workflow.title}</h1>
            </div>
          </div>
          <p className="max-w-3xl text-lg text-muted-foreground">{workflow.problemStatement}</p>
        </header>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">Who this helps</h2>
          <p className="mb-3 text-sm text-muted-foreground">
            This workflow addresses pain points commonly faced by:
          </p>
          <div className="flex flex-wrap gap-2">
            {workflow.audience.map((audience) => (
              <Badge 
                key={audience}
                variant="secondary" 
                className="text-sm"
              >
                {AUDIENCE_LABELS[audience] ?? formatLabel(audience)}
              </Badge>
            ))}
          </div>
        </section>

        {workflow.painPointIds && workflow.painPointIds.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold">Addresses these pain points</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              This workflow helps prevent or mitigate:
            </p>
            <div className="flex flex-wrap gap-2">
              {workflow.painPointIds.map((painPointId) => {
                const painPoint = allPainPoints.find(pp => pp.id === painPointId);
                if (painPoint) {
                  return (
                    <Link
                      key={painPointId}
                      href={`/workflows/pain-points/${painPoint.slug}`}
                    >
                      <Badge 
                        variant="outline" 
                        className="text-sm transition-colors hover:border-primary hover:text-primary"
                      >
                        {painPoint.title}
                      </Badge>
                    </Link>
                  );
                }
                return null;
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <Link href="/workflows/pain-points" className="text-primary hover:underline">
                View all pain points →
              </Link>
            </p>
          </section>
        )}

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">
            {workflow.category === 'guardrails' ? 'Prevention checklist' : 'Manual checklist'}
          </h2>
          <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
            {workflow.manualChecklist.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </section>

        {workflow.earlyDetection && (workflow.earlyDetection.cicd || workflow.earlyDetection.static || workflow.earlyDetection.runtime) && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Early detection</h2>
            <div className="space-y-4 rounded-lg border bg-card p-6">
              {workflow.earlyDetection.cicd && (
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">CI/CD</h3>
                  <p className="text-sm text-muted-foreground">{workflow.earlyDetection.cicd}</p>
                </div>
              )}
              {workflow.earlyDetection.static && (
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Static Analysis</h3>
                  <p className="text-sm text-muted-foreground">{workflow.earlyDetection.static}</p>
                </div>
              )}
              {workflow.earlyDetection.runtime && (
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Runtime</h3>
                  <p className="text-sm text-muted-foreground">{workflow.earlyDetection.runtime}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {workflow.mitigation && workflow.mitigation.length === 3 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Mitigation</h2>
            <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
              {workflow.mitigation.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        )}


        {workflow.researchCitations.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Research basis</h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {workflow.researchCitations.map((citation, index) => {
                // Try to get verified URL from citation or verified sources
                const sourceUrl = citation.url || getVerifiedSourceUrl(citation.source);
                return (
                  <li key={`${citation.source}-${index}`}>
                    <strong>
                      {sourceUrl ? (
                        <Link
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {citation.source}
                        </Link>
                      ) : (
                        citation.source
                      )}
                    </strong>
                    : {citation.summary}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mb-12">
          <h2 className="mb-4 text-2xl font-semibold">Related resources</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {(['prompts', 'patterns', 'learn'] as const).map((sectionKey) => {
              const entries = workflow.relatedResources?.[sectionKey];
              if (!entries || entries.length === 0) {
                return null;
              }

              return (
                <div key={sectionKey}>
                  <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
                    {APP_SECTION_LABELS[sectionKey]}
                  </h3>
                  <ul className="space-y-2 text-sm text-primary">
                    {entries.map((entry) => {
                      const displayText = formatResourceDisplayText(sectionKey, entry, allPrompts, allPatterns);
                      return (
                        <li key={entry}>
                          <Link href={resolveResourceUrl(sectionKey, entry)} className="hover:underline">
                            {displayText}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {roleBasedWorkflows.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">
              Other workflows for {workflow.audience.length === 1 
                ? AUDIENCE_LABELS[workflow.audience[0]] ?? formatLabel(workflow.audience[0])
                : 'your role'}
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              These workflows address similar pain points for {workflow.audience.map(aud => AUDIENCE_LABELS[aud] ?? formatLabel(aud)).join(', ')}.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roleBasedWorkflows.map((item) => (
                <Link
                  key={item.slug}
                  href={`/workflows/${item.category}/${item.slug}`}
                  className="group rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {item.title}
                    </h3>
                    <Badge variant="outline" className="text-xs text-foreground dark:text-foreground border-foreground/20">
                      {CATEGORY_LABELS[item.category] ?? formatLabel(item.category)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.problemStatement}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {adjacentWorkflows.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold">Related workflows</h2>
            <div className="flex flex-wrap gap-3">
              {adjacentWorkflows.map((item) => (
                <Link
                  key={item.slug}
                  href={`/workflows/${item.category}/${item.slug}`}
                  className="rounded-lg border bg-card px-4 py-3 text-sm font-medium text-primary shadow-sm transition hover:border-primary"
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link href={`/workflows${workflow.category ? `?category=${encodeURIComponent(workflow.category)}` : ''}`}>
              <Icons.arrowLeft className="mr-2 h-4 w-4" /> Back to workflows
            </Link>
          </Button>
          {workflow.cta?.href && (
            <Button asChild>
              <Link href={workflow.cta.href} target="_blank" rel="noopener noreferrer">
                <Icons.sparkles className="mr-2 h-4 w-4" /> {workflow.cta.label}
              </Link>
            </Button>
          )}
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


function formatLabel(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatResourceDisplayText(
  section: 'prompts' | 'patterns' | 'learn',
  identifier: string,
  prompts: Array<{ slug?: string; id?: string; title: string }>,
  patterns: Array<{ id?: string; name: string }>
): string {
  if (section === 'prompts') {
    const prompt = prompts.find((p) => p.slug === identifier || p.id === identifier);
    return prompt?.title || formatLabel(identifier);
  }

  if (section === 'patterns') {
    const pattern = patterns.find((p) => p.id === identifier);
    return pattern?.name || formatLabel(identifier);
  }

  // For learn resources, format the path nicely
  if (identifier.startsWith('/learn/')) {
    const pathParts = identifier.replace('/learn/', '').split('/');
    return pathParts.map((part) => formatLabel(part)).join(' › ');
  }

  return formatLabel(identifier);
}

// function formatKeyword(keyword: string): string {
//   return keyword.replace(/[-_]/g, ' ').toLowerCase();
// }

function resolveResourceUrl(
  section: 'prompts' | 'patterns' | 'learn',
  identifier: string,
) {
  if (section === 'prompts') {
    return `/prompts/${identifier}`;
  }

  if (section === 'patterns') {
    return `/patterns/${identifier}`;
  }

  return identifier.startsWith('/') ? identifier : `/learn/${identifier}`;
}
