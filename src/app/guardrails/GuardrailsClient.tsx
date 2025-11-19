/**
 * Guardrails Client Component
 *
 * Client-side filtering and search for guardrails by subcategory and severity
 */

'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/features/EmptyState';
import { ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowCardClient } from '@/app/workflows/WorkflowCardClient';
import type { Workflow } from '@/lib/workflows/workflow-schema';
import { trackSearchEvent, trackFilterUsage } from '@/lib/utils/ga-events';

interface GuardrailsClientProps {
  initialGuardrails: Workflow[];
  subcategoryStats: Record<string, number>;
  severityStats: Record<string, number>;
  uniqueSubcategories: string[];
  uniqueSeverities: string[];
}

type SortOption = 'alphabetical' | 'subcategory' | 'severity';

const INITIAL_VISIBLE_SUBCATEGORIES = 7;
const INITIAL_VISIBLE_GUARDRAILS = 12; // Show 12 initially (6 rows x 2 columns)
const LOAD_MORE_INCREMENT = 12; // Load 12 more at a time

const SUBCATEGORY_LABELS: Record<string, string> = {
  'data-integrity': 'Data Integrity',
  security: 'Security',
  performance: 'Performance',
  availability: 'Availability',
  financial: 'Financial',
  integration: 'Integration',
  testing: 'Testing',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const SEVERITY_COLORS: Record<string, 'destructive' | 'default' | 'secondary'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'default',
  low: 'secondary',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export function GuardrailsClient({
  initialGuardrails,
  subcategoryStats,
  severityStats,
  uniqueSubcategories,
  uniqueSeverities,
}: GuardrailsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string | 'all'>('all');
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [visibleGuardrailCount, setVisibleGuardrailCount] = useState(INITIAL_VISIBLE_GUARDRAILS);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleGuardrailCount(INITIAL_VISIBLE_GUARDRAILS);
  }, [searchQuery, selectedSubcategory, selectedSeverity, sortBy]);

  // Filter guardrails using useMemo
  const filteredGuardrails = useMemo(() => {
    const filtered = initialGuardrails.filter((guardrail) => {
      const matchesSearch =
        guardrail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guardrail.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guardrail.manualChecklist.some((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesSubcategory =
        selectedSubcategory === 'all' || guardrail.subcategory === selectedSubcategory;
      const matchesSeverity =
        selectedSeverity === 'all' || guardrail.severity === selectedSeverity;

      return matchesSearch && matchesSubcategory && matchesSeverity;
    });

    // Sort guardrails
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'subcategory':
          const subcategoryCompare = (a.subcategory || '').localeCompare(b.subcategory || '');
          if (subcategoryCompare !== 0) return subcategoryCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'severity':
          const severityA = SEVERITY_ORDER.indexOf(a.severity || 'low');
          const severityB = SEVERITY_ORDER.indexOf(b.severity || 'low');
          if (severityA !== severityB) return severityA - severityB;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [initialGuardrails, searchQuery, selectedSubcategory, selectedSeverity, sortBy]);

  // Track search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearchEvent('search', {
          query: searchQuery,
          result_count: filteredGuardrails.length,
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredGuardrails.length]);

  const hasMore = visibleGuardrailCount < filteredGuardrails.length;

  const loadMore = useCallback(() => {
    setVisibleGuardrailCount((prev) =>
      Math.min(prev + LOAD_MORE_INCREMENT, filteredGuardrails.length)
    );
  }, [filteredGuardrails.length]);

  // Dynamic filters from data
  const allSubcategories: Array<string | 'all'> = ['all', ...uniqueSubcategories];
  const allSeverities: Array<string | 'all'> = [
    'all',
    ...SEVERITY_ORDER.filter((s) => uniqueSeverities.includes(s)),
  ];

  const visibleSubcategories = showAllSubcategories
    ? allSubcategories
    : allSubcategories.slice(0, INITIAL_VISIBLE_SUBCATEGORIES);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Icons.search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search guardrails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4"
        />
      </div>

      {/* Subcategory Filter */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Category</p>
          <span className="text-xs text-muted-foreground">
            Showing {filteredGuardrails.length} guardrail
            {filteredGuardrails.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleSubcategories.map((subcategory) => (
            <Badge
              key={subcategory}
              variant={selectedSubcategory === subcategory ? 'default' : 'outline'}
              className="cursor-pointer transition-colors hover:bg-primary/10"
              onClick={() => {
                setSelectedSubcategory(subcategory);
                if (subcategory !== 'all') {
                  trackFilterUsage('subcategory', subcategory, {
                    result_count: filteredGuardrails.length,
                  });
                }
              }}
            >
              {subcategory === 'all'
                ? `All (${initialGuardrails.length})`
                : `${SUBCATEGORY_LABELS[subcategory] || subcategory} (${
                    subcategoryStats[subcategory] || 0
                  })`}
            </Badge>
          ))}
          {allSubcategories.length > INITIAL_VISIBLE_SUBCATEGORIES && (
            <Badge
              variant="secondary"
              className="cursor-pointer text-primary hover:bg-primary/10"
              onClick={() => setShowAllSubcategories(!showAllSubcategories)}
            >
              {showAllSubcategories ? (
                <>
                  <Icons.chevronUp className="mr-1 h-3 w-3" />
                  Show Less
                </>
              ) : (
                <>
                  <Icons.chevronDown className="mr-1 h-3 w-3" />
                  Show {allSubcategories.length - INITIAL_VISIBLE_SUBCATEGORIES} More
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Severity Filter */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase text-muted-foreground">Severity</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="subcategory">Category</option>
              <option value="severity">Severity</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {allSeverities.map((severity) => (
            <Badge
              key={severity}
              variant={
                selectedSeverity === severity
                  ? SEVERITY_COLORS[severity] || 'default'
                  : 'outline'
              }
              className="cursor-pointer transition-colors hover:bg-primary/10"
              onClick={() => {
                setSelectedSeverity(severity);
                if (severity !== 'all') {
                  trackFilterUsage('severity', severity, {
                    result_count: filteredGuardrails.length,
                  });
                }
              }}
            >
              {severity === 'all'
                ? `All Severities`
                : `${SEVERITY_LABELS[severity] || severity} (${
                    severityStats[severity] || 0
                  })`}
            </Badge>
          ))}
        </div>
      </div>

      {/* Guardrails Grid */}
      {filteredGuardrails.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No guardrails found"
          description="Try adjusting your search or filters to find guardrails."
        />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredGuardrails.slice(0, visibleGuardrailCount).map((guardrail) => (
              <WorkflowCardClient key={`${guardrail.category}-${guardrail.slug}`} workflow={guardrail} />
            ))}
            {/* Hidden guardrails for SEO */}
            {filteredGuardrails.slice(visibleGuardrailCount).map((guardrail) => (
              <div key={`${guardrail.category}-${guardrail.slug}`} style={{ display: 'none' }}>
                <WorkflowCardClient workflow={guardrail} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button onClick={loadMore} variant="outline" size="lg">
                Show More Guardrails ({filteredGuardrails.length - visibleGuardrailCount} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

