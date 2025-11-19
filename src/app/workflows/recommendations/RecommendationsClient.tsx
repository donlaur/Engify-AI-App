/**
 * Recommendations Client Component
 *
 * Client-side filtering and search for the recommendations page
 * Similar to LibraryClient for prompts
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Icons } from '@/lib/icons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { EmptyState } from '@/components/features/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Recommendation } from '@/lib/workflows/recommendation-schema';
import { trackSearchEvent, trackFilterUsage } from '@/lib/utils/ga-events';

interface RecommendationsClientProps {
  initialRecommendations: Recommendation[];
  categoryStats: Record<string, number>;
  audienceStats: Record<string, number>;
  priorityStats: Record<string, number>;
  uniqueCategories: string[];
  uniqueAudiences: string[];
  uniquePriorities: string[];
  categoryLabels: Record<string, string>;
  audienceLabels: Record<string, string>;
}

type SortOption = 'alphabetical' | 'category' | 'priority' | 'audience';

const INITIAL_VISIBLE_CATEGORIES = 6;
const INITIAL_VISIBLE_AUDIENCES = 10;
const INITIAL_VISIBLE_RECOMMENDATIONS = 18; // Show 18 initially (6 rows x 3 columns) - but ALL are in HTML for SEO
const LOAD_MORE_INCREMENT = 18; // Load 18 more at a time

export function RecommendationsClient({
  initialRecommendations,
  categoryStats,
  audienceStats,
  priorityStats,
  uniqueCategories,
  uniqueAudiences,
  uniquePriorities,
  categoryLabels,
  audienceLabels,
}: RecommendationsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<string | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<string | 'all'>('all');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAudiences, setShowAllAudiences] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [visibleRecommendationCount, setVisibleRecommendationCount] = useState(INITIAL_VISIBLE_RECOMMENDATIONS);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleRecommendationCount(INITIAL_VISIBLE_RECOMMENDATIONS);
  }, [searchQuery, selectedCategory, selectedAudience, selectedPriority, sortBy]);

  // Filter recommendations using useMemo to prevent recalculations
  const filteredRecommendations = useMemo(() => {
    let filtered = initialRecommendations.filter((recommendation) => {
      const matchesSearch =
        recommendation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recommendation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recommendation.recommendationStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recommendation.whyThisMatters.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recommendation.keywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        recommendation.primaryKeywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesCategory =
        selectedCategory === 'all' || recommendation.category === selectedCategory;
      
      const matchesAudience =
        selectedAudience === 'all' ||
        (selectedAudience !== 'all' && recommendation.audience.includes(selectedAudience as any));
      
      const matchesPriority =
        selectedPriority === 'all' || recommendation.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesAudience && matchesPriority;
    });

    // Sort recommendations based on selected sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'category':
          // First sort by category, then alphabetically within category
          const categoryCompare = a.category.localeCompare(b.category);
          if (categoryCompare !== 0) return categoryCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'priority':
          // Sort by priority (high, medium, low), then alphabetically
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'audience':
          // Sort by first audience, then alphabetically
          const aFirstAudience = a.audience[0] || '';
          const bFirstAudience = b.audience[0] || '';
          const audienceCompare = aFirstAudience.localeCompare(bFirstAudience);
          if (audienceCompare !== 0) return audienceCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [
    initialRecommendations,
    searchQuery,
    selectedCategory,
    selectedAudience,
    selectedPriority,
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
          result_count: filteredRecommendations.length,
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredRecommendations.length]);

  // IMPORTANT: For SEO, all recommendations are rendered in HTML, but we use CSS to hide/show them
  const hasMore = visibleRecommendationCount < filteredRecommendations.length;

  // Load more recommendations function
  const loadMore = useCallback(() => {
    setVisibleRecommendationCount((prev) =>
      Math.min(prev + LOAD_MORE_INCREMENT, filteredRecommendations.length)
    );
  }, [filteredRecommendations.length]);

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

  // Dynamic filters from data
  const allCategories: Array<string | 'all'> = ['all', ...uniqueCategories];
  const allAudiences: Array<string | 'all'> = ['all', ...uniqueAudiences];
  const allPriorities: Array<string | 'all'> = ['all', ...uniquePriorities];

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
            placeholder="Search recommendations..."
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
                {categoryStats[selectedCategory] || 0} recommendations
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
                      result_count: filteredRecommendations.length,
                    });
                  }
                }}
              >
                {category === 'all'
                  ? `All (${initialRecommendations.length})`
                  : `${categoryLabels[category] || category} (${categoryStats[category] || 0})`}
              </Badge>
            ))}
            {allCategories.length > INITIAL_VISIBLE_CATEGORIES && (
              <Badge
                variant="outline"
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
                {audienceStats[selectedAudience] || 0} recommendations
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
                    trackFilterUsage('audience', audience, {
                      result_count: filteredRecommendations.length,
                    });
                  }
                }}
              >
                {audience === 'all'
                  ? `All (${initialRecommendations.length})`
                  : `${audienceLabels[audience] || audience} (${audienceStats[audience] || 0})`}
              </Badge>
            ))}
            {allAudiences.length > INITIAL_VISIBLE_AUDIENCES && (
              <Badge
                variant="outline"
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

        {/* Priority Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Priority</p>
            {selectedPriority !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {priorityStats[selectedPriority] || 0} recommendations
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allPriorities.map((priority) => (
              <Badge
                key={priority}
                variant={
                  selectedPriority === priority
                    ? priority === 'high'
                      ? 'destructive'
                      : priority === 'medium'
                      ? 'default'
                      : 'secondary'
                    : 'outline'
                }
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedPriority(priority);
                  if (priority !== 'all') {
                    trackFilterUsage('priority', priority, {
                      result_count: filteredRecommendations.length,
                    });
                  }
                }}
              >
                {priority === 'all'
                  ? `All Priorities`
                  : `${priority.toUpperCase()} (${priorityStats[priority] || 0})`}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredRecommendations.length === initialRecommendations.length
            ? `Showing all ${filteredRecommendations.length} recommendations`
            : `Showing ${filteredRecommendations.length} of ${initialRecommendations.length} recommendations`}
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
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="priority">By Priority</SelectItem>
                <SelectItem value="audience">By Audience</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            selectedCategory !== 'all' ||
            selectedAudience !== 'all' ||
            selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAudience('all');
                setSelectedPriority('all');
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredRecommendations.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecommendations.map((recommendation, index) => {
              const isVisible = index < visibleRecommendationCount;
              return (
                <div
                  key={recommendation.id}
                  className={isVisible ? '' : 'hidden'}
                  // Use CSS to hide, but keep in DOM for SEO
                  style={isVisible ? undefined : { display: 'none' }}
                >
                  <Card className="group relative flex h-full flex-col transition-all duration-200 hover:border-primary hover:shadow-lg">
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Badge
                              variant={
                                recommendation.priority === 'high'
                                  ? 'destructive'
                                  : recommendation.priority === 'medium'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-xs"
                            >
                              {recommendation.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[recommendation.category] || recommendation.category}
                            </Badge>
                          </div>
                          <h2 className="text-lg font-semibold group-hover:text-primary">
                            {recommendation.title}
                          </h2>
                        </div>
                      </div>
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {recommendation.description}
                      </p>
                      <div className="mb-4 text-xs italic text-muted-foreground line-clamp-2">
                        {recommendation.recommendationStatement}
                      </div>
                      {recommendation.keywords && recommendation.keywords.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {recommendation.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/workflows/recommendations/${recommendation.slug}`}>
                          Learn More
                          <Icons.arrowRight className="ml-2 h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Load More Trigger (invisible element for intersection observer) */}
          {hasMore && (
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-pulse text-sm text-muted-foreground">
                  Loading more recommendations...
                </div>
                {/* Fallback button in case intersection observer doesn't work */}
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More ({filteredRecommendations.length - visibleRecommendationCount}{' '}
                  remaining)
                </Button>
              </div>
            </div>
          )}

          {/* Show total count when all loaded */}
          {!hasMore && filteredRecommendations.length > INITIAL_VISIBLE_RECOMMENDATIONS && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing all {filteredRecommendations.length} recommendations
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Icons.lightbulb}
          title="No recommendations found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedAudience('all');
              setSelectedPriority('all');
            },
          }}
        />
      )}
    </>
  );
}

