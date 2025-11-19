/**
 * Pain Points Client Component
 *
 * Client-side filtering and search for the pain points page
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
import type { PainPoint } from '@/lib/workflows/pain-point-schema';
import { trackSearchEvent, trackFilterUsage } from '@/lib/utils/ga-events';

interface PainPointsClientProps {
  initialPainPoints: PainPoint[];
  keywordStats: Record<string, number>;
  uniqueKeywords: string[];
}

type SortOption = 'alphabetical' | 'keyword';

const INITIAL_VISIBLE_KEYWORDS = 10;
const INITIAL_VISIBLE_PAIN_POINTS = 18; // Show 18 initially (6 rows x 3 columns) - but ALL are in HTML for SEO
const LOAD_MORE_INCREMENT = 18; // Load 18 more at a time

export function PainPointsClient({
  initialPainPoints,
  keywordStats,
  uniqueKeywords,
}: PainPointsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState<string | 'all'>('all');
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [visiblePainPointCount, setVisiblePainPointCount] = useState(INITIAL_VISIBLE_PAIN_POINTS);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset visible count when filters change
  useEffect(() => {
    setVisiblePainPointCount(INITIAL_VISIBLE_PAIN_POINTS);
  }, [searchQuery, selectedKeyword, sortBy]);

  // Filter pain points using useMemo to prevent recalculations
  const filteredPainPoints = useMemo(() => {
    let filtered = initialPainPoints.filter((painPoint) => {
      const matchesSearch =
        painPoint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painPoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painPoint.problemStatement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painPoint.impact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        painPoint.keywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        painPoint.primaryKeywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        painPoint.painPointKeywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesKeyword =
        selectedKeyword === 'all' ||
        painPoint.keywords.includes(selectedKeyword) ||
        painPoint.primaryKeywords.includes(selectedKeyword) ||
        painPoint.painPointKeywords.includes(selectedKeyword);

      return matchesSearch && matchesKeyword;
    });

    // Sort pain points based on selected sort option
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        case 'keyword':
          // Sort by first matching keyword, then alphabetically
          const aKeywords = [...a.keywords, ...a.primaryKeywords, ...a.painPointKeywords];
          const bKeywords = [...b.keywords, ...b.primaryKeywords, ...b.painPointKeywords];
          const aFirstKeyword = aKeywords[0] || '';
          const bFirstKeyword = bKeywords[0] || '';
          const keywordCompare = aFirstKeyword.localeCompare(bFirstKeyword);
          if (keywordCompare !== 0) return keywordCompare;
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });

    return sorted;
  }, [initialPainPoints, searchQuery, selectedKeyword, sortBy]);

  // Track search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearchEvent('search', {
          query: searchQuery,
          result_count: filteredPainPoints.length,
        });
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredPainPoints.length]);

  // IMPORTANT: For SEO, all pain points are rendered in HTML, but we use CSS to hide/show them
  const hasMore = visiblePainPointCount < filteredPainPoints.length;

  // Load more pain points function
  const loadMore = useCallback(() => {
    setVisiblePainPointCount((prev) =>
      Math.min(prev + LOAD_MORE_INCREMENT, filteredPainPoints.length)
    );
  }, [filteredPainPoints.length]);

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
  const allKeywords: Array<string | 'all'> = ['all', ...uniqueKeywords];

  // Limit visible items with "Show More" functionality
  const visibleKeywords = showAllKeywords
    ? allKeywords
    : allKeywords.slice(0, INITIAL_VISIBLE_KEYWORDS);

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="relative">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="Search pain points..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Keyword Filter */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Keywords</p>
            {selectedKeyword !== 'all' && (
              <span className="text-xs text-muted-foreground">
                {keywordStats[selectedKeyword] || 0} pain points
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleKeywords.map((keyword) => (
              <Badge
                key={keyword}
                variant={selectedKeyword === keyword ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/10"
                onClick={() => {
                  setSelectedKeyword(keyword);
                  if (keyword !== 'all') {
                    trackFilterUsage('keyword', keyword, {
                      result_count: filteredPainPoints.length,
                    });
                  }
                }}
              >
                {keyword === 'all'
                  ? `All (${initialPainPoints.length})`
                  : `${keyword} (${keywordStats[keyword] || 0})`}
              </Badge>
            ))}
            {allKeywords.length > INITIAL_VISIBLE_KEYWORDS && (
              <Badge
                variant="outline"
                className="cursor-pointer text-primary hover:bg-primary/10"
                onClick={() => setShowAllKeywords(!showAllKeywords)}
              >
                {showAllKeywords ? (
                  <>
                    <Icons.chevronUp className="mr-1 h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="mr-1 h-3 w-3" />
                    Show {allKeywords.length - INITIAL_VISIBLE_KEYWORDS} More
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredPainPoints.length === initialPainPoints.length
            ? `Showing all ${filteredPainPoints.length} pain points`
            : `Showing ${filteredPainPoints.length} of ${initialPainPoints.length} pain points`}
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
                <SelectItem value="keyword">By Keyword</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || selectedKeyword !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedKeyword('all');
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredPainPoints.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPainPoints.map((painPoint, index) => {
              const isVisible = index < visiblePainPointCount;
              return (
                <div
                  key={painPoint.id}
                  className={isVisible ? '' : 'hidden'}
                  // Use CSS to hide, but keep in DOM for SEO
                  style={isVisible ? undefined : { display: 'none' }}
                >
                  <Card className="group relative flex h-full flex-col transition-all duration-200 hover:border-primary hover:shadow-lg">
                    <CardContent className="flex flex-1 flex-col p-6">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h2 className="text-lg font-semibold group-hover:text-primary">
                          {painPoint.title}
                        </h2>
                      </div>
                      <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
                        {painPoint.description}
                      </p>
                      {painPoint.impact && (
                        <p className="mb-4 text-xs italic text-muted-foreground line-clamp-2">
                          {painPoint.impact}
                        </p>
                      )}
                      {painPoint.keywords && painPoint.keywords.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                          {painPoint.keywords.slice(0, 3).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link href={`/workflows/pain-points/${painPoint.slug}`}>
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
                  Loading more pain points...
                </div>
                {/* Fallback button in case intersection observer doesn't work */}
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="min-w-[200px]"
                >
                  Load More ({filteredPainPoints.length - visiblePainPointCount}{' '}
                  remaining)
                </Button>
              </div>
            </div>
          )}

          {/* Show total count when all loaded */}
          {!hasMore && filteredPainPoints.length > INITIAL_VISIBLE_PAIN_POINTS && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              Showing all {filteredPainPoints.length} pain points
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={Icons.alertCircle}
          title="No pain points found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedKeyword('all');
            },
          }}
        />
      )}
    </>
  );
}

