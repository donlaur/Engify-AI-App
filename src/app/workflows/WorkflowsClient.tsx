/**
 * Workflows Client Component
 *
 * Client-side filtering and search for the workflows page
 * Similar to LibraryClient for prompts
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/features/EmptyState';
import { FileQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkflowCardClient } from './WorkflowCardClient';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { trackSearchEvent, trackFilterUsage } from '@/lib/utils/ga-events';

interface WorkflowsClientProps {
  initialWorkflows: Workflow[];
  categoryStats: Record<string, number>;
  audienceStats: Record<string, number>;
  uniqueCategories: string[];
  uniqueAudiences: string[];
}

type SortOption = 'alphabetical' | 'category';

const INITIAL_VISIBLE_CATEGORIES = 8;
const INITIAL_VISIBLE_AUDIENCES = 10;
const INITIAL_VISIBLE_WORKFLOWS = 8; // Show 8 initially (4 rows x 2 columns)
const LOAD_MORE_INCREMENT = 8; // Load 8 more at a time

const CATEGORY_LABELS: Record<string, string> = {
  'ai-behavior': 'AI Behavior',
  'code-quality': 'Code Quality',
  communication: 'Communication',
  community: 'Community',
  enablement: 'Enablement',
  governance: 'Governance',
  guardrails: 'Guardrails',
  memory: 'Memory & Knowledge',
  process: 'Process & Delivery',
  'risk-management': 'Risk Management',
  security: 'Security',
};

// const SUBCATEGORY_LABELS: Record<string, string> = {
//   'data-integrity': 'Data Integrity',
//   security: 'Security',
//   performance: 'Performance',
//   availability: 'Availability',
//   financial: 'Financial',
//   integration: 'Integration',
//   testing: 'Testing',
// };

// const SEVERITY_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = {
//   critical: 'destructive',
//   high: 'destructive',
//   medium: 'default',
//   low: 'secondary',
// };

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

export function WorkflowsClient({
  initialWorkflows,
  categoryStats,
  audienceStats,
  uniqueCategories,
  uniqueAudiences,
}: WorkflowsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<string | 'all'>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAudiences, setShowAllAudiences] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [visibleWorkflowCount, setVisibleWorkflowCount] = useState(
    INITIAL_VISIBLE_WORKFLOWS
  );

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleWorkflowCount(INITIAL_VISIBLE_WORKFLOWS);
  }, [searchQuery, selectedCategory, selectedAudience, sortBy]);

  // Filter workflows using useMemo to prevent recalculations
  const filteredWorkflows = useMemo(() => {
    let filtered = initialWorkflows.filter((workflow) => {
      const matchesSearch =
        workflow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workflow.manualChecklist.some((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === 'all' || workflow.category === selectedCategory;
      const matchesAudience =
        selectedAudience === 'all' ||
        (selectedAudience !== 'all' && workflow.audience.includes(selectedAudience));

      return matchesSearch && matchesCategory && matchesAudience;
    });

    // Sort workflows based on selected sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'category':
          // First sort by category, then alphabetically within category
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    initialWorkflows,
    searchQuery,
    selectedCategory,
    selectedAudience,
    sortBy,
  ]);

  // Track search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearchEvent('search', {
          query: searchQuery,
          result_count: filteredWorkflows.length,
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredWorkflows.length]);

  // IMPORTANT: For SEO, all workflows are rendered in HTML, but we use CSS to hide/show them
  const hasMore = visibleWorkflowCount < filteredWorkflows.length;

  // Load more workflows function
  const loadMore = useCallback(() => {
    setVisibleWorkflowCount((prev) =>
      Math.min(prev + LOAD_MORE_INCREMENT, filteredWorkflows.length)
    );
  }, [filteredWorkflows.length]);

  // Dynamic filters from data
  const allCategories: Array<string | 'all'> = [
    'all',
    ...uniqueCategories,
  ];

  const allAudiences: Array<string | 'all'> = [
    'all',
    ...uniqueAudiences,
  ];

  // Limit visible items with "Show More" functionality
  const visibleCategories = showAllCategories
    ? allCategories
    : allCategories.slice(0, INITIAL_VISIBLE_CATEGORIES);

  const visibleAudiences = showAllAudiences
    ? allAudiences
    : allAudiences.slice(0, INITIAL_VISIBLE_AUDIENCES);

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Category</p>
            {selectedCategory !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {categoryStats[selectedCategory] || 0} workflows
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedCategory(category);
                  if (category !== 'all') {
                    trackFilterUsage('category', category, {
                      result_count: filteredWorkflows.length,
                    });
                  }
                }}
              >
                {category === 'all'
                  ? `All (${initialWorkflows.length})`
                  : `${CATEGORY_LABELS[category] || category} (${categoryStats[category] || 0})`}
              </Badge>
            ))}
            {allCategories.length > INITIAL_VISIBLE_CATEGORIES && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allCategories.length - INITIAL_VISIBLE_CATEGORIES} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Audience Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Audience</p>
            {selectedAudience !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {audienceStats[selectedAudience] || 0} workflows
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleAudiences.map((audience) => (
              <Badge
                key={audience}
                variant={selectedAudience === audience ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedAudience(audience);
                  if (audience !== 'all') {
                    // Track as 'category' type since 'audience' is not in the filterType union
                    trackFilterUsage('category', audience, {
                      result_count: filteredWorkflows.length,
                    });
                  }
                }}
              >
                {audience === 'all'
                  ? `All (${initialWorkflows.length})`
                  : `${AUDIENCE_LABELS[audience] || audience} (${audienceStats[audience] || 0})`}
              </Badge>
            ))}
            {allAudiences.length > INITIAL_VISIBLE_AUDIENCES && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllAudiences(!showAllAudiences)}
              >
                {showAllAudiences ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allAudiences.length - INITIAL_VISIBLE_AUDIENCES} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredWorkflows.length} {filteredWorkflows.length === 1 ? 'workflow' : 'workflows'}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="category">Category</option>
          </select>
        </div>
      </div>

      {/* Workflows Grid - 2 per row on md+ */}
      {/* IMPORTANT: All workflows are rendered for SEO, but we hide the extra ones with CSS */}
      {filteredWorkflows.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No workflows found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredWorkflows.map((workflow, index) => (
              <div
                key={`${workflow.category}-${workflow.slug}`}
                style={{
                  display: index < visibleWorkflowCount ? 'block' : 'none',
                }}
              >
                <WorkflowCardClient workflow={workflow} />
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMore}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-primary/10"
              >
                Show {Math.min(LOAD_MORE_INCREMENT, filteredWorkflows.length - visibleWorkflowCount)} More
                <Icons.chevronDown className="h-4 w-4" />
              </button>
              <p className="mt-2 text-xs text-muted-foreground">
                Showing {visibleWorkflowCount} of {filteredWorkflows.length} workflows
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

