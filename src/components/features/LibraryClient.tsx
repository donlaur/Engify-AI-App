/**
 * Library Client Component
 *
 * Client-side filtering and search for the library page
 * Separated from server component for performance
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { PromptCard } from '@/components/features/PromptCard';
import { EmptyState } from '@/components/features/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import type { Prompt, PromptCategory, UserRole } from '@/lib/schemas/prompt';
import { categoryLabels, roleLabels } from '@/lib/schemas/prompt';
import { useFavorites } from '@/hooks/use-favorites';
import { trackSearchEvent, trackFilterUsage } from '@/lib/utils/ga-events';

interface LibraryClientProps {
  initialPrompts: Prompt[];
  categoryStats: Record<string, number>;
  roleStats: Record<string, number>;
  patternStats: Record<string, number>;
  uniqueCategories: string[];
  uniqueRoles: string[];
  uniquePatterns: string[];
}

type SortOption = 'alphabetical' | 'last-modified' | 'version' | 'category';

const INITIAL_VISIBLE_CATEGORIES = 8;
const INITIAL_VISIBLE_ROLES = 10;
const INITIAL_VISIBLE_PATTERNS = 8;
const INITIAL_VISIBLE_PROMPTS = 18; // Show 18 initially (6 rows x 3 columns) - but ALL are in HTML for SEO
const LOAD_MORE_INCREMENT = 18; // Load 18 more at a time

export function LibraryClient({
  initialPrompts,
  categoryStats,
  roleStats,
  patternStats,
  uniqueCategories,
  uniqueRoles,
  uniquePatterns,
}: LibraryClientProps) {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  const showFavoritesOnly = filterParam === 'favorites';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | 'all'
  >('all');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [selectedPattern, setSelectedPattern] = useState<string | 'all'>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllRoles, setShowAllRoles] = useState(false);
  const [showAllPatterns, setShowAllPatterns] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [visiblePromptCount, setVisiblePromptCount] = useState(
    INITIAL_VISIBLE_PROMPTS
  );

  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisiblePromptCount(INITIAL_VISIBLE_PROMPTS);
  }, [
    searchQuery,
    selectedCategory,
    selectedRole,
    selectedPattern,
    showFavoritesOnly,
    favorites,
    sortBy,
  ]);

  // Filter prompts using useMemo to prevent recalculations
  const filteredPrompts = useMemo(() => {
    let filtered = initialPrompts.filter((prompt) => {
      const matchesSearch =
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || prompt.category === selectedCategory;
      const matchesRole =
        selectedRole === 'all' || prompt.role === selectedRole;
      const matchesPattern =
        selectedPattern === 'all' || prompt.pattern === selectedPattern;

      return matchesSearch && matchesCategory && matchesRole && matchesPattern;
    });

    // Apply favorites filter if active
    if (showFavoritesOnly) {
      filtered = filtered.filter((prompt) => favorites.includes(prompt.id));
    }

    // Sort prompts based on selected sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'last-modified':
          const aDate = a.updatedAt || a.lastRevisedAt || a.createdAt || new Date(0);
          const bDate = b.updatedAt || b.lastRevisedAt || b.createdAt || new Date(0);
          return bDate.getTime() - aDate.getTime(); // Newest first
        
        case 'version':
          const aVersion = a.currentRevision || 1;
          const bVersion = b.currentRevision || 1;
          return bVersion - aVersion; // Higher version first
        
        case 'category':
          // First sort by category, then alphabetically within category
          const categoryCompare = (a.category || '').localeCompare(b.category || '');
          if (categoryCompare !== 0) return categoryCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    initialPrompts,
    searchQuery,
    selectedCategory,
    selectedRole,
    selectedPattern,
    showFavoritesOnly,
    favorites,
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
          result_count: filteredPrompts.length,
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredPrompts.length]);

  // IMPORTANT: For SEO, all prompts are rendered in HTML, but we use CSS to hide/show them
  const hasMore = visiblePromptCount < filteredPrompts.length;

  // Load more prompts function
  const loadMore = useCallback(() => {
    setVisiblePromptCount((prev) =>
      Math.min(prev + LOAD_MORE_INCREMENT, filteredPrompts.length)
    );
  }, [filteredPrompts.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;

    const element = loadMoreRef.current; // Capture ref value for cleanup

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading 200px before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [hasMore, loadMore]);

  // Dynamic filters from DB (already sorted alphabetically from server)
  const allCategories: Array<PromptCategory | 'all'> = [
    'all',
    ...(uniqueCategories as PromptCategory[]),
  ];

  const allRoles: Array<UserRole | 'all'> = [
    'all',
    ...(uniqueRoles as UserRole[]),
  ];

  const allPatterns: Array<string | 'all'> = [
    'all',
    ...uniquePatterns,
  ];

  // Limit visible items with "Show More" functionality
  const visibleCategories = showAllCategories
    ? allCategories
    : allCategories.slice(0, INITIAL_VISIBLE_CATEGORIES);

  const visibleRoles = showAllRoles
    ? allRoles
    : allRoles.slice(0, INITIAL_VISIBLE_ROLES);

  const visiblePatterns = showAllPatterns
    ? allPatterns
    : allPatterns.slice(0, INITIAL_VISIBLE_PATTERNS);

  // Format pattern name from kebab-case to Title Case
  const formatPatternName = (pattern: string): string => {
    if (pattern === 'all') return 'All';
    return pattern
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      {/* Header with Favorites Filter Indicator */}
      {showFavoritesOnly && (
        <div className="mb-6 rounded-lg border bg-primary/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.heart className="h-5 w-5 fill-red-600 text-red-600" />
              <div>
                <h2 className="font-semibold">My Favorites</h2>
                <p className="text-sm text-muted-foreground">
                  {favoritesLoading
                    ? 'Loading favorites...'
                    : `${favorites.length} saved ${favorites.length === 1 ? 'prompt' : 'prompts'}`}
                </p>
              </div>
            </div>
            <Link href="/prompts">
              <Button variant="outline" size="sm">
                View All Prompts
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
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
                {categoryStats[selectedCategory] || 0} prompts
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
                      result_count: filteredPrompts.length,
                    });
                  }
                }}
              >
                {category === 'all'
                  ? `All (${initialPrompts.length})`
                  : `${categoryLabels[category] || category} (${categoryStats[category] || 0})`}
              </Badge>
            ))}
            {allCategories.length > INITIAL_VISIBLE_CATEGORIES && (
              <Badge
                variant="ghost"
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
                    Show {allCategories.length -
                      INITIAL_VISIBLE_CATEGORIES}{' '}
                    More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Role</p>
            {selectedRole !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {roleStats[selectedRole] || 0} prompts
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleRoles.map((role) => (
              <Badge
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedRole(role);
                  if (role !== 'all') {
                    trackFilterUsage('role', role, {
                      result_count: filteredPrompts.length,
                    });
                  }
                }}
              >
                {role === 'all'
                  ? `All (${initialPrompts.length})`
                  : `${roleLabels[role] || role} (${roleStats[role] || 0})`}
              </Badge>
            ))}
            {allRoles.length > INITIAL_VISIBLE_ROLES && (
              <Badge
                variant="ghost"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllRoles(!showAllRoles)}
              >
                {showAllRoles ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allRoles.length - INITIAL_VISIBLE_ROLES} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>

        {/* Pattern Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Pattern</p>
            {selectedPattern !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {patternStats[selectedPattern] || 0} prompts
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visiblePatterns.map((pattern) => (
              <Badge
                key={pattern}
                variant={selectedPattern === pattern ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedPattern(pattern);
                  if (pattern !== 'all') {
                    trackFilterUsage('pattern', pattern, {
                      result_count: filteredPrompts.length,
                    });
                  }
                }}
              >
                {pattern === 'all'
                  ? `All (${initialPrompts.length})`
                  : `${formatPatternName(pattern)} (${patternStats[pattern] || 0})`}
              </Badge>
            ))}
            {allPatterns.length > INITIAL_VISIBLE_PATTERNS && (
              <Badge
                variant="ghost"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllPatterns(!showAllPatterns)}
              >
                {showAllPatterns ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allPatterns.length - INITIAL_VISIBLE_PATTERNS} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPrompts.length === initialPrompts.length
            ? `Showing all ${filteredPrompts.length} prompts`
            : `Showing ${filteredPrompts.length} of ${initialPrompts.length} prompts`}
        </p>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-muted-foreground">
              Sort:
            </label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger id="sort-select" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
                <SelectItem value="last-modified">Last Modified</SelectItem>
                <SelectItem value="version">Version Number</SelectItem>
                <SelectItem value="category">By Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(searchQuery ||
            selectedCategory !== 'all' ||
            selectedRole !== 'all' ||
            selectedPattern !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedRole('all');
                setSelectedPattern('all');
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {showFavoritesOnly && favoritesLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border bg-card p-6"
            >
              <div className="mb-4 h-4 w-3/4 rounded bg-muted" />
              <div className="mb-2 h-3 w-full rounded bg-muted" />
              <div className="h-3 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : filteredPrompts.length > 0 ? (
        <>
          <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt, index) => {
              const isVisible = index < visiblePromptCount;
              return (
                <div
                  key={prompt.id}
                  className={isVisible ? '' : 'hidden'}
                  // Use CSS to hide, but keep in DOM for SEO
                  style={isVisible ? undefined : { display: 'none' }}
                >
                  <PromptCard
                    {...prompt}
                    // Pass raw role/category - PromptCard will handle display labels
                    role={prompt.role as UserRole | undefined}
                    category={prompt.category as PromptCategory}
                  />
                </div>
              );
            })}
          </div>

          {/* Load More Trigger (invisible element for intersection observer) */}
          {hasMore && (
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Loading more prompts...
                </div>
                {/* Fallback button in case intersection observer doesn't work */}
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More ({filteredPrompts.length - visiblePromptCount}{' '}
                  remaining)
                </Button>
              </div>
            </div>
          )}

          {/* Show total count when all loaded */}
          {!hasMore && filteredPrompts.length > INITIAL_VISIBLE_PROMPTS && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing all {filteredPrompts.length} prompts
            </div>
          )}
        </>
      ) : showFavoritesOnly ? (
        <EmptyState
          icon={Icons.heart}
          title="No favorites yet"
          description="Start saving prompts you love to access them quickly"
          action={{
            label: 'Browse Prompts',
            onClick: () => {
              window.location.href = '/prompts';
            },
          }}
        />
      ) : (
        <EmptyState
          icon={Icons.brain}
          title="No prompts found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRole('all');
            },
          }}
        />
      )}
    </>
  );
}
