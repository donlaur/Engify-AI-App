'use client';

import Link from 'next/link';
import { trackWorkflowClick } from '@/lib/analytics/ga-events';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Icons } from '@/lib/icons';

const AUDIENCE_LABELS: Record<string, string> = {
  analysts: 'Analysts',
  architects: 'Architects',
  engineers: 'Engineers',
  'engineering-managers': 'Engineering Managers',
  executives: 'Executives',
  platform: 'Platform',
  'product-managers': 'Product Managers',
  qa: 'QA',
  security: 'Security',
};

const CATEGORY_LABELS: Record<string, string> = {
  'ai-behavior': 'AI Behavior',
  'code-quality': 'Code Quality',
  communication: 'Communication',
  community: 'Community',
  enablement: 'Enablement',
  governance: 'Governance',
  guardrails: 'Guardrail',
  memory: 'Memory & Knowledge',
  process: 'Process & Delivery',
  'risk-management': 'Risk Management',
  security: 'Security',
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

const APP_SECTION_LABELS: Record<'prompts' | 'patterns' | 'learn', string> = {
  prompts: 'Related Prompts',
  patterns: 'Patterns',
  learn: 'Further Reading',
};

function formatLabel(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatResourceSlug(section: 'prompts' | 'patterns' | 'learn', identifier: string): string {
  if (section === 'learn' && identifier.startsWith('/learn/')) {
    const pathParts = identifier.replace('/learn/', '').split('/');
    return pathParts.map((part) => formatLabel(part)).join(' › ');
  }
  return formatLabel(identifier);
}

function resolveRelatedLink(section: 'prompts' | 'patterns' | 'learn', entry: string): string {
  if (section === 'prompts') {
    return `/prompts/${entry}`;
  }
  if (section === 'patterns') {
    return `/patterns/${entry}`;
  }
  return `/learn/${entry}`;
}

function hasRelatedResources(workflow: Workflow): boolean {
  if (!workflow.relatedResources) {
    return false;
  }
  return (
    (workflow.relatedResources.prompts?.length ?? 0) > 0 ||
    (workflow.relatedResources.patterns?.length ?? 0) > 0 ||
    (workflow.relatedResources.learn?.length ?? 0) > 0
  );
}

interface WorkflowCardClientProps {
  workflow: Workflow;
}

export function WorkflowCardClient({ workflow }: WorkflowCardClientProps) {
  const audienceBadges = workflow.audience.map((aud) => (
    <Badge key={aud} variant="outline" className="capitalize">
      {AUDIENCE_LABELS[aud] ?? formatLabel(aud)}
    </Badge>
  ));

  const checklistPreview = workflow.manualChecklist.slice(0, 3);

  const handleClick = () => {
    trackWorkflowClick(`${workflow.category}/${workflow.slug}`, workflow.title, workflow.category);
  };

  return (
    <Card className="group relative flex h-full flex-col rounded-xl transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10">
      <CardHeader className="flex-1 pb-4">
        <div className="flex items-start justify-between">
          <Link
            href={`/workflows/${workflow.category}/${workflow.slug}`}
            className="flex-1 space-y-1 pr-2 transition-colors hover:text-primary"
            onClick={handleClick}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[workflow.category] ?? formatLabel(workflow.category)}
              </p>
              {workflow.subcategory && (
                <Badge variant="outline" className="text-xs">
                  {SUBCATEGORY_LABELS[workflow.subcategory] ?? formatLabel(workflow.subcategory)}
                </Badge>
              )}
              {workflow.severity && (
                <Badge variant={SEVERITY_COLORS[workflow.severity] || 'default'} className="text-xs">
                  {workflow.severity.toUpperCase()}
                </Badge>
              )}
            </div>
            <CardTitle className="break-words text-lg leading-tight transition-colors group-hover:text-white dark:group-hover:text-white sm:text-xl">
              {workflow.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 min-h-[3.5rem] leading-relaxed">
              {workflow.problemStatement}
            </CardDescription>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end space-y-3 pt-0">
        <div className="flex flex-wrap gap-2">{audienceBadges}</div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Manual Checklist
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {checklistPreview.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>
                <span className="line-clamp-2">{item}</span>
              </li>
            ))}
            {workflow.manualChecklist.length > checklistPreview.length && (
              <li className="text-xs text-muted-foreground">
                +{workflow.manualChecklist.length - checklistPreview.length} more steps inside
              </li>
            )}
          </ul>
        </div>

        {workflow.relatedResources && hasRelatedResources(workflow) && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Related Resources
            </h4>
            <div className="flex flex-wrap gap-2">
              {(['prompts', 'patterns', 'learn'] as const).map((key) => {
                const entries = workflow.relatedResources?.[key];
                if (!entries || entries.length === 0) {
                  return null;
                }

                return entries.slice(0, 2).map((entry) => {
                  const displayText = formatResourceSlug(key, entry);
                  return (
                    <Link
                      key={`${key}-${entry}`}
                      href={resolveRelatedLink(key, entry)}
                      className="rounded-full border border-foreground/20 bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary/60 hover:text-primary"
                    >
                      {APP_SECTION_LABELS[key]} · {displayText}
                    </Link>
                  );
                });
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-shrink-0 items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Link href={`/workflows/${workflow.category}/${workflow.slug}`} onClick={handleClick}>
            View Workflow
            <Icons.externalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

