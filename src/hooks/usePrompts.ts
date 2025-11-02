/**
 * usePrompts Hook
 * 
 * Reusable hook for fetching and managing prompts in client components.
 * Consolidates duplicate prompt fetching logic from multiple components.
 * Uses SWR for caching, revalidation, and optimistic updates.
 */

'use client';

import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { PAGINATION, CACHE_TTL } from '@/lib/constants/limits';

export interface PromptFilters {
  category?: string;
  role?: string;
  search?: string;
  tags?: string[];
  isFeatured?: boolean;
  limit?: number;
  skip?: number;
}

export interface Prompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  category: string;
  role: string;
  pattern?: string;
  tags: string[];
  isFeatured: boolean;
  active: boolean;
  views?: number;
  rating?: number;
  ratingCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PromptsResponse {
  prompts: Prompt[];
  total: number;
  page: number;
  pages: number;
  source: 'mongodb' | 'static';
}

/**
 * Fetcher function for SWR
 */
async function fetchPrompts(filters: PromptFilters = {}): Promise<PromptsResponse> {
  const params = new URLSearchParams();
  
  if (filters.category) params.append('category', filters.category);
  if (filters.role) params.append('role', filters.role);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.skip) params.append('skip', filters.skip.toString());
  
  const response = await fetch(`/api/prompts?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch prompts');
  }
  
  return response.json();
}

/**
 * Main hook for fetching prompts
 */
export function usePrompts(filters: PromptFilters = {}) {
  const {
    limit = PAGINATION.DEFAULT_PAGE_SIZE,
    skip = PAGINATION.DEFAULT_SKIP,
    ...otherFilters
  } = filters;

  const swrKey = ['/api/prompts', { ...otherFilters, limit, skip }];
  
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<PromptsResponse>(
    swrKey,
    () => fetchPrompts({ ...otherFilters, limit, skip }),
    {
      revalidateOnFocus: false,
      dedupingInterval: CACHE_TTL.PROMPTS_LIST * 1000,
      keepPreviousData: true,
    }
  );

  return {
    prompts: data?.prompts ?? [],
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
 * Hook for fetching a single prompt by ID or slug
 */
export function usePrompt(idOrSlug: string) {
  const swrKey = idOrSlug ? `/api/prompts/${idOrSlug}` : null;
  
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<{ prompt: Prompt; source: string }>(
    swrKey,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch prompt');
      }
      return response.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: CACHE_TTL.PROMPT_DETAIL * 1000,
    }
  );

  return {
    prompt: data?.prompt,
    source: data?.source,
    error,
    isLoading,
    refetch: mutate,
  };
}

/**
 * Hook for paginated prompts with local state management
 */
export function usePaginatedPrompts(initialFilters: PromptFilters = {}) {
  const [filters, setFilters] = useState<PromptFilters>(initialFilters);
  const [page, setPage] = useState(1);
  
  const limit = filters.limit || PAGINATION.DEFAULT_PAGE_SIZE;
  const skip = (page - 1) * limit;

  const result = usePrompts({ ...filters, limit, skip });

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

  const updateFilters = useCallback((newFilters: Partial<PromptFilters>) => {
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
 * Hook for searching prompts with debounce
 */
export function usePromptSearch(initialQuery = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  });

  const result = usePrompts({ search: debouncedQuery });

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
 * Hook for featured prompts only
 */
export function useFeaturedPrompts(limit = 10) {
  return usePrompts({ isFeatured: true, limit });
}

/**
 * Hook for prompts by category
 */
export function usePromptsByCategory(category: string, limit?: number) {
  return usePrompts({ category, limit });
}

/**
 * Hook for prompts by role
 */
export function usePromptsByRole(role: string, limit?: number) {
  return usePrompts({ role, limit });
}

