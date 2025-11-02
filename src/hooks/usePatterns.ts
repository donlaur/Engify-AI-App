/**
 * usePatterns Hook
 * 
 * Reusable hook for fetching and managing patterns in client components.
 * Consolidates duplicate pattern fetching logic.
 * Uses SWR for caching and revalidation.
 */

'use client';

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { PAGINATION, CACHE_TTL } from '@/lib/constants/limits';

export interface PatternFilters {
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
  limit?: number;
  skip?: number;
}

export interface Pattern {
  id: string;
  slug: string;
  name: string;
  title: string;
  description: string;
  explanation: string;
  structure: string;
  example: string;
  benefits: string[];
  useCases: string[];
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  relatedPatterns?: string[];
  active: boolean;
  views?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PatternsResponse {
  patterns: Pattern[];
  total: number;
  page: number;
  pages: number;
  source: 'mongodb' | 'static';
}

/**
 * Fetcher function for SWR
 */
async function fetchPatterns(filters: PatternFilters = {}): Promise<PatternsResponse> {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.skip) params.append('skip', filters.skip.toString());
  
  const response = await fetch(`/api/patterns?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patterns');
  }
  
  return response.json();
}

/**
 * Main hook for fetching patterns
 */
export function usePatterns(filters: PatternFilters = {}) {
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    skip = PAGINATION.DEFAULT_SKIP,
    ...otherFilters
  } = filters;

  const swrKey = ['/api/patterns', { ...otherFilters, limit, skip }];
  
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<PatternsResponse>(
    swrKey,
    () => fetchPatterns({ ...otherFilters, limit, skip }),
    {
      revalidateOnFocus: false,
      dedupingInterval: CACHE_TTL.PATTERNS_LIST * 1000,
      keepPreviousData: true,
    }
  );

  return {
    patterns: data?.patterns ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pages: data?.pages ?? 1,
    source: data?.source,
    error,
    isLoading,
    isValidating,
    refetch: mutate,
  };
}

/**
 * Hook for fetching a single pattern by ID or slug
 */
export function usePattern(idOrSlug: string) {
  const swrKey = idOrSlug ? `/api/patterns/${idOrSlug}` : null;
  
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ pattern: Pattern; source: string }>(
    swrKey,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch pattern');
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: CACHE_TTL.PROMPT_DETAIL * 1000,
    }
  );

  return {
    pattern: data?.pattern,
    source: data?.source,
    error,
    isLoading,
    refetch: mutate,
  };
}

/**
 * Hook for paginated patterns with local state management
 */
export function usePaginatedPatterns(initialFilters: PatternFilters = {}) {
  const [filters, setFilters] = useState<PatternFilters>(initialFilters);
  const [page, setPage] = useState(1);
  
  const limit = filters.limit || PAGINATION.DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const result = usePatterns({ ...filters, limit, skip });

  const nextPage = useCallback(() => {
    if (page < result.pages) {
      setPage((p) => p + 1);
    }
  }, [page, result.pages]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= result.pages) {
      setPage(newPage);
    }
  }, [result.pages]);

  const updateFilters = useCallback((newFilters: Partial<PatternFilters>) => {
    setFilters((f) => ({ ...f, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  return {
    ...result,
    page,
    filters,
    nextPage,
    prevPage,
    goToPage,
    updateFilters,
    clearFilters,
    hasNextPage: page < result.pages,
    hasPrevPage: page > 1,
  };
}

/**
 * Hook for searching patterns with debounce
 */
export function usePatternSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  });

  const result = usePatterns({ search: debouncedQuery });

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    ...result,
    query,
    debouncedQuery,
    updateQuery,
    clearQuery,
    isSearching: query !== debouncedQuery || result.isValidating,
  };
}

/**
 * Hook for patterns by category
 */
export function usePatternsByCategory(category: string, limit?: number) {
  return usePatterns({ category, limit });
}

/**
 * Hook for patterns by difficulty
 */
export function usePatternsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced', limit?: number) {
  return usePatterns({ difficulty, limit });
}

/**
 * Hook for beginner patterns
 */
export function useBeginnerPatterns(limit = 10) {
  return usePatterns({ difficulty: 'beginner', limit });
}

