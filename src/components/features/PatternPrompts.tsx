/**
 * Pattern Prompts Component
 * Shows prompts that use a specific pattern
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { getPromptSlug } from '@/lib/utils/slug';
import { categoryLabels, roleLabels, type PromptCategory, type UserRole } from '@/lib/schemas/prompt';
import { PromptMetrics } from './PromptMetrics';

interface PatternPromptsProps {
  patternId: string; // Pattern ID to match against prompt.pattern field
}

export function PatternPrompts({ patternId }: PatternPromptsProps) {
  const [prompts, setPrompts] = useState<Array<{
    id: string;
    title: string;
    description: string;
    category: PromptCategory;
    role?: UserRole | null;
    tags?: string[];
    views?: number;
    favorites?: number;
    shares?: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setIsLoading(true);
        // Fetch prompts that use this pattern
        const response = await fetch(`/api/prompts?pattern=${encodeURIComponent(patternId)}&limit=12`);
        if (response.ok) {
          const data = await response.json();
          setPrompts(data.prompts || []);
        }
      } catch (error) {
        console.debug('Failed to fetch pattern prompts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patternId) {
      fetchPrompts();
    }
  }, [patternId]);

  if (isLoading) {
    return (
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Example Prompts</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
              <div className="mb-4 h-4 w-3/4 rounded bg-muted" />
              <div className="mb-2 h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Example Prompts</h2>
        </div>
        <div className="rounded-lg border bg-muted/50 p-8 text-center">
          <Icons.library className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No prompts found using this pattern yet.
          </p>
          <Link href="/prompts" className="mt-4 inline-block text-primary hover:underline">
            Browse all prompts →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {prompts.length} Example {prompts.length === 1 ? 'Prompt' : 'Prompts'} Using This Pattern
        </h2>
        {prompts.length > 0 && (
          <Link href={`/prompts?pattern=${encodeURIComponent(patternId)}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
              View All →
            </Badge>
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
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

