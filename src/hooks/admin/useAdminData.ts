import { useState, useEffect, useCallback } from 'react';

/**
 * Base interface for all admin data items requiring an _id field
 */
export interface AdminDataItem {
  _id: string;
}

/**
 * Pagination metadata returned from admin API endpoints
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Filter configuration for admin data queries
 */
export interface FilterConfig {
  [key: string]: string | boolean | number | undefined;
}

/**
 * Configuration options for the useAdminData hook
 */
export interface UseAdminDataConfig {
  /** API endpoint path (e.g., '/api/admin/prompts') */
  endpoint: string;
  /** Number of items per page (default: 50, max: 100) */
  pageSize?: number;
  /** Initial filter values */
  initialFilters?: FilterConfig;
  /** Data key in the API response (e.g., 'prompts', 'workflows') */
  dataKey?: string;
  /** Enable auto-fetch on mount (default: true) */
  autoFetch?: boolean;
}

/**
 * API response structure from admin endpoints
 */
interface AdminApiResponse {
  success: boolean;
  pagination?: PaginationMeta;
  [key: string]: any; // Dynamic data key (e.g., prompts, workflows, etc.)
}

/**
 * Return value from the useAdminData hook
 */
export interface UseAdminDataReturn<T extends AdminDataItem> {
  /** Array of data items */
  data: T[];
  /** Loading state indicator */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total count of items across all pages */
  totalCount: number;
  /** Number of items per page */
  pageSize: number;
  /** Current filter configuration */
  filters: FilterConfig;
  /** Search term for text-based filtering */
  searchTerm: string;
  /** Navigate to next page */
  nextPage: () => void;
  /** Navigate to previous page */
  prevPage: () => void;
  /** Navigate to specific page */
  goToPage: (page: number) => void;
  /** Update filter values (merges with existing filters) */
  setFilters: (filters: FilterConfig) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Update search term */
  setSearchTerm: (term: string) => void;
  /** Manually refresh data */
  refresh: () => Promise<void>;
  /** Check if there's a next page */
  hasNext: boolean;
  /** Check if there's a previous page */
  hasPrev: boolean;
}

/**
 * Reusable hook for managing admin data with pagination, filtering, and search
 *
 * @template T - Data item type extending AdminDataItem
 * @param config - Configuration object for the hook
 * @returns Object containing data, loading states, pagination methods, and filter methods
 *
 * @example
 * ```tsx
 * interface Workflow extends AdminDataItem {
 *   name: string;
 *   status: string;
 * }
 *
 * function WorkflowPanel() {
 *   const {
 *     data: workflows,
 *     loading,
 *     error,
 *     currentPage,
 *     totalPages,
 *     nextPage,
 *     prevPage,
 *     setFilters,
 *     refresh
 *   } = useAdminData<Workflow>({
 *     endpoint: '/api/admin/workflows',
 *     pageSize: 50,
 *     initialFilters: { status: 'active' },
 *     dataKey: 'workflows'
 *   });
 *
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {workflows.map(workflow => (
 *         <div key={workflow._id}>{workflow.name}</div>
 *       ))}
 *       <button onClick={prevPage}>Previous</button>
 *       <button onClick={nextPage}>Next</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdminData<T extends AdminDataItem>(
  config: UseAdminDataConfig
): UseAdminDataReturn<T> {
  const {
    endpoint,
    pageSize: configPageSize = 50,
    initialFilters = {},
    dataKey,
    autoFetch = true,
  } = config;

  // Ensure pageSize doesn't exceed API limit
  const pageSize = Math.min(configPageSize, 100);

  // State management
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [filters, setFiltersState] = useState<FilterConfig>(initialFilters);
  const [searchTerm, setSearchTermState] = useState<string>('');
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);

  /**
   * Build query string from filters, search term, and pagination params
   */
  const buildQueryString = useCallback(
    (page: number): string => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Add search term if present
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      return params.toString();
    },
    [filters, searchTerm, pageSize]
  );

  /**
   * Fetch data from the API endpoint
   */
  const fetchData = useCallback(
    async (page: number = currentPage): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(page);
        const url = `${endpoint}?${queryString}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AdminApiResponse = await response.json();

        if (!result.success) {
          throw new Error('API returned unsuccessful response');
        }

        // Extract data using provided dataKey or infer from response
        let extractedData: T[] = [];
        if (dataKey) {
          extractedData = result[dataKey] || [];
        } else {
          // Try to infer data key by finding the array property
          const dataKeys = Object.keys(result).filter(
            key => Array.isArray(result[key]) && key !== 'pagination'
          );
          if (dataKeys.length > 0) {
            extractedData = result[dataKeys[0]] || [];
          }
        }

        setData(extractedData);

        // Update pagination metadata
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
          setTotalCount(result.pagination.total);
          setHasNext(result.pagination.hasNext);
          setHasPrev(result.pagination.hasPrev);
        } else {
          // Fallback if pagination is not provided
          setTotalPages(1);
          setTotalCount(extractedData.length);
          setHasNext(false);
          setHasPrev(false);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error(`Failed to fetch data from ${endpoint}:`, err);

        // Reset to empty state on error
        setData([]);
        setTotalPages(1);
        setTotalCount(0);
        setHasNext(false);
        setHasPrev(false);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, currentPage, buildQueryString, dataKey]
  );

  /**
   * Auto-fetch data when dependencies change
   */
  useEffect(() => {
    if (autoFetch) {
      fetchData(currentPage);
    }
  }, [currentPage, filters, searchTerm, pageSize, autoFetch]); // fetchData intentionally excluded to prevent infinite loop

  /**
   * Navigate to the next page
   */
  const nextPage = useCallback(() => {
    if (hasNext && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNext, currentPage, totalPages]);

  /**
   * Navigate to the previous page
   */
  const prevPage = useCallback(() => {
    if (hasPrev && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrev, currentPage]);

  /**
   * Navigate to a specific page
   * @param page - Page number (1-indexed)
   */
  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      if (validPage !== currentPage) {
        setCurrentPage(validPage);
      }
    },
    [currentPage, totalPages]
  );

  /**
   * Update filter values (merges with existing filters)
   * Resets to page 1 when filters change
   * @param newFilters - New filter values to merge
   */
  const setFilters = useCallback((newFilters: FilterConfig) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  /**
   * Clear all filters and reset to initial state
   */
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearchTermState('');
    setCurrentPage(1);
  }, [initialFilters]);

  /**
   * Update search term
   * Resets to page 1 when search term changes
   * @param term - New search term
   */
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  /**
   * Manually refresh data (re-fetches current page)
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(currentPage);
  }, [fetchData, currentPage]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,
    searchTerm,
    nextPage,
    prevPage,
    goToPage,
    setFilters,
    clearFilters,
    setSearchTerm,
    refresh,
    hasNext,
    hasPrev,
  };
}
