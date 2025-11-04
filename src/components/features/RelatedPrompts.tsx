/**
 * Related Prompts Component
 * Shows related prompts with metrics and sorting options
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getPromptSlug } from '@/lib/utils/slug';
import { categoryLabels, roleLabels, type PromptCategory, type UserRole } from '@/lib/schemas/prompt';
import { PromptMetrics } from './PromptMetrics';

interface RelatedPromptsProps {
  currentPrompt: {
    id: string;
    category: PromptCategory;
    role?: UserRole | null;
    tags?: string[];
  };
  allPrompts: Array<{
    id: string;
    title: string;
    description: string;
    category: PromptCategory;
    role?: UserRole | null;
    tags?: string[];
    views?: number;
  }>;
}

type SortOption = 'related' | 'views' | 'favorites' | 'shares';

export function RelatedPrompts({ currentPrompt, allPrompts }: RelatedPromptsProps) {
  const [sortBy, setSortBy] = useState<SortOption>('related');
  const [topPrompts, setTopPrompts] = useState<Array<{
    id: string;
    title: string;
    description: string;
    category: PromptCategory;
    role?: UserRole | null;
    views?: number;
    favorites?: number;
    shares?: number;
  }>>([]);

  useEffect(() => {
    const fetchTopPrompts = async () => {
      try {
        const response = await fetch(
          `/api/prompts/metrics?metric=${sortBy === 'related' ? 'views' : sortBy}&limit=6`
        );
        if (response.ok) {
          const data = await response.json();
          setTopPrompts(data.prompts || []);
        }
      } catch (error) {
        console.debug('Failed to fetch top prompts:', error);
      }
    };

    if (sortBy !== 'related') {
      fetchTopPrompts();
    }
  }, [sortBy]);

  // Get related prompts (same category/role)
  const relatedPrompts = allPrompts
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

  const displayedPrompts = sortBy === 'related' ? relatedPrompts : topPrompts;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {sortBy === 'related' ? 'Related Prompts' : `Most ${sortBy === 'views' ? 'Viewed' : sortBy === 'favorites' ? 'Favorited' : 'Shared'} Prompts`}
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
        {displayedPrompts.map((prompt) => (
          <Link
            key={prompt.id}
            href={`/prompts/${getPromptSlug(prompt)}`}
            className="group rounded-lg border bg-card p-4 transition-all hover:border-primary hover:bg-accent hover:shadow-md"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-semibold group-hover:text-primary">
                {prompt.title}
              </h3>
            </div>
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
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
              initialFavorites={prompt.favorites || 0}
              initialShares={prompt.shares || 0}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
