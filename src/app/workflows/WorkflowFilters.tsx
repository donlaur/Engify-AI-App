'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { WORKFLOW_AUDIENCES } from '@/lib/workflows/workflow-schema';

interface WorkflowFiltersProps {
  categories: string[];
  audiences: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'ai-behavior': 'AI Behavior',
  'code-quality': 'Code Quality',
  communication: 'Communication',
  community: 'Community',
  enablement: 'Enablement',
  governance: 'Governance',
  memory: 'Memory & Knowledge',
  process: 'Process & Delivery',
  'risk-management': 'Risk Management',
  security: 'Security',
};

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

export function WorkflowFilters({ categories, audiences }: WorkflowFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategory = searchParams.get('category');
  const selectedAudience = searchParams.get('audience');

  const validAudiences = audiences.filter(isWorkflowAudience);

  const handleCategoryChange = (category?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!category) {
      params.delete('category');
    } else {
      params.set('category', category);
    }

    router.push(`/workflows${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleAudienceChange = (audience?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!audience) {
      params.delete('audience');
    } else {
      params.set('audience', audience);
    }

    router.push(`/workflows${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Category</p>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            active={!selectedCategory}
            onClick={() => handleCategoryChange(undefined)}
          >
            All Categories
          </FilterButton>
          {categories.map((category) => (
            <FilterButton
              key={category}
              active={selectedCategory === category}
              onClick={() => handleCategoryChange(category)}
            >
              {CATEGORY_LABELS[category] ?? formatLabel(category)}
            </FilterButton>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase text-muted-foreground">Audience</p>
        <div className="flex flex-wrap items-center gap-2">
          <FilterButton
            active={!selectedAudience}
            onClick={() => handleAudienceChange(undefined)}
          >
            All Audiences
          </FilterButton>
          {validAudiences.map((audience) => (
            <FilterButton
              key={audience}
              active={selectedAudience === audience}
              onClick={() => handleAudienceChange(audience)}
            >
              {AUDIENCE_LABELS[audience] ?? formatLabel(audience)}
            </FilterButton>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

function FilterButton({ active, children, onClick }: FilterButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'outline'}
      size="sm"
      className={cn(
        'rounded-full border px-4 py-1 text-sm transition',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow'
          : 'border-muted-foreground/20 bg-background text-foreground dark:text-foreground hover:border-primary/60 hover:text-primary dark:hover:text-primary'
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function isWorkflowAudience(value: string | undefined): value is Workflow['audience'][number] {
  if (!value) {
    return false;
  }

  return (WORKFLOW_AUDIENCES as readonly string[]).includes(value);
}

function formatLabel(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
