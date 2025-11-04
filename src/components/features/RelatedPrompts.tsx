/**
 * Related Prompts Component
 * Shows related prompts with metrics and sorting options
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getPromptSlug } from '@/lib/utils/slug';
import {
  categoryLabels,
  roleLabels,
  type PromptCategory,
  type UserRole,
} from '@/lib/schemas/prompt';
import { PromptMetrics } from './PromptMetrics';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface RelatedPromptsProps {
  currentPrompt: {
    id: string;
    category: PromptCategory;
    role?: UserRole | null;
    tags?: string[];
  };
  allPrompts?: Array<{
    id: string;
    title: string;
    description: string;
    category: PromptCategory;
    role?: UserRole | null;
    tags?: string[];
    views?: number;
  }>; // Make optional - will fetch via API if not provided
}

type SortOption = 'related' | 'views' | 'favorites' | 'shares';

export function RelatedPrompts({
  currentPrompt,
  allPrompts,
}: RelatedPromptsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('related');
  const [topPrompts, setTopPrompts] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      category: PromptCategory;
      role?: UserRole | null;
      views?: number;
      favorites?: number;
      shares?: number;
    }>
  >([]);
  const [relatedPrompts, setRelatedPrompts] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      category: PromptCategory;
      role?: UserRole | null;
      tags?: string[];
      views?: number;
    }>
  >([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  // Fetch related prompts if allPrompts is not provided
  useEffect(() => {
    const fetchRelatedPrompts = async () => {
      if (allPrompts && allPrompts.length > 0) {
        // Use provided prompts
        const related = allPrompts
          .filter(
            (p) =>
              p.id !== currentPrompt.id &&
              (p.category === currentPrompt.category ||
                p.role === currentPrompt.role ||
                (currentPrompt.tags &&
                  p.tags &&
                  p.tags.some((tag) => currentPrompt.tags?.includes(tag))))
          )
          .slice(0, 6);
        setRelatedPrompts(related);
      } else {
        // Fetch via API
        setIsLoadingRelated(true);
        try {
          const params = new URLSearchParams({
            category: currentPrompt.category,
            limit: '6',
          });
          if (currentPrompt.role) {
            params.append('role', currentPrompt.role);
          }
          const response = await fetch(`/api/prompts?${params.toString()}`);
          if (response.ok) {
            const data = await response.json();
            const related = (data.prompts || [])
              .filter((p: { id: string }) => p.id !== currentPrompt.id)
              .slice(0, 6);
            setRelatedPrompts(related);
          }
        } catch (error) {
          // Silently fail - related prompts are not critical
          // eslint-disable-next-line no-console
          console.debug('Failed to fetch related prompts:', error);
        } finally {
          setIsLoadingRelated(false);
        }
      }
    };

    if (sortBy === 'related') {
      fetchRelatedPrompts();
    }
  }, [sortBy, allPrompts, currentPrompt]);

  useEffect(() => {
    const fetchTopPrompts = async () => {
      try {
        const response = await fetch(
          `/api/prompts/metrics?metric=${sortBy}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setTopPrompts(data.prompts || []);
        }
      } catch (error) {
        // Silently fail - top prompts are not critical
        // eslint-disable-next-line no-console
        console.debug('Failed to fetch top prompts:', error);
      }
    };

    if (sortBy !== 'related') {
      fetchTopPrompts();
    }
  }, [sortBy]);

  const displayedPrompts = sortBy === 'related' ? relatedPrompts : topPrompts;

  return (
    <ErrorBoundary
      fallback={
        <div className="mt-12 rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load related prompts. Please refresh the page.
          </p>
        </div>
      }
    >
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {sortBy === 'related'
              ? 'Related Prompts'
              : `Most ${sortBy === 'views' ? 'Viewed' : sortBy === 'favorites' ? 'Favorited' : 'Shared'} Prompts`}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('related')}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                sortBy === 'related'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Related
            </button>
            <button
              onClick={() => setSortBy('views')}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                sortBy === 'views'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Most Viewed
            </button>
            <button
              onClick={() => setSortBy('favorites')}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                sortBy === 'favorites'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Most Favorited
            </button>
            <button
              onClick={() => setSortBy('shares')}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                sortBy === 'shares'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Most Shared
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingRelated && sortBy === 'related' ? (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              Loading related prompts...
            </div>
          ) : displayedPrompts.length === 0 ? (
            <div className="col-span-full text-center text-sm text-muted-foreground">
              No related prompts found.
            </div>
          ) : (
            displayedPrompts.map((prompt) => (
              <Link
                key={prompt.id}
                href={`/prompts/${getPromptSlug(prompt)}`}
                className="surface-frosted surface-frosted-hover dark:surface-frosted dark:hover:surface-frosted-hover group relative rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold transition-colors group-hover:text-white dark:group-hover:text-white">
                    {prompt.title}
                  </h3>
                </div>
                <p className="text-secondary-light dark:text-secondary-light mb-3 line-clamp-2 text-sm">
                  {prompt.description}
                </p>
                <div className="mb-2 flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {categoryLabels[prompt.category] || prompt.category}
                  </Badge>
                  {prompt.role && (
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[prompt.role as UserRole] || prompt.role}
                    </Badge>
                  )}
                </div>
                <PromptMetrics
                  promptId={prompt.id}
                  initialViews={prompt.views || 0}
                  initialFavorites={
                    (prompt as { favorites?: number }).favorites || 0
                  }
                  initialShares={(prompt as { shares?: number }).shares || 0}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
