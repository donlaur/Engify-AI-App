/**
 * Admin Data Management Hook
 * 
 * Reusable React hook for managing paginated, filterable admin data tables.
 * Provides a complete data fetching and state management solution for admin panels.
 * 
 * @pattern CUSTOM_HOOK
 * @principle DRY - eliminates boilerplate across admin panels
 * @features
 * - Automatic pagination management
 * - Filter and search state management
 * - Loading and error state handling
 * - Automatic data refresh on filter changes
 * - Type-safe generic implementation
 * 
 * @ai-readability
 * - Comprehensive JSDoc with examples
 * - Clear interface definitions
 * - Descriptive function and variable names
 * - Comments explain complex logic and patterns
 * 
 * @usage
 * Used by all admin management panels (Workflows, Recommendations, Prompts, etc.)
 * to provide consistent data fetching and pagination behavior.
 * 
 * @see docs/opshub/OPSHUB_PATTERNS.md for usage examples
 */

import { useState, useEffect, useCallback } from 'react';
import { clientLogger } from '@/lib/logging/client-logger';

/**
 * Base interface for all admin data items
 * 
 * All items managed by useAdminData must have an _id field for React key generation
 * and unique identification. This is typically the MongoDB document ID.
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
   * Reset pagination state to initial empty state
   * 
   * Called when an error occurs during data fetching to reset the UI to a clean state.
   * This prevents showing stale data or incorrect pagination information.
   * 
   * @pattern ERROR_RECOVERY
   * @usage Called from fetchData error handler
   */
  const resetPaginationState = useCallback(() => {
    setData([]);
    setTotalPages(1);
    setTotalCount(0);
    setHasNext(false);
    setHasPrev(false);
  }, []);

  /**
   * Update pagination metadata from API response
   * 
   * Extracts pagination information from the API response and updates state.
   * If pagination metadata is missing, falls back to calculating from data length.
   * 
   * @param pagination - Pagination metadata from API (optional)
   * @param dataLength - Length of the data array (used for fallback calculation)
   * 
   * @pattern STATE_SYNCHRONIZATION
   * @usage Called after successful data fetch to update pagination UI
   */
  const updatePaginationState = useCallback((pagination: PaginationMeta | undefined, dataLength: number) => {
    if (pagination) {
      // Use server-provided pagination metadata (preferred)
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.total);
      setHasNext(pagination.hasNext);
      setHasPrev(pagination.hasPrev);
    } else {
      // Fallback: calculate pagination from data length
      // This handles APIs that don't provide pagination metadata
      setTotalPages(1);
      setTotalCount(dataLength);
      setHasNext(false);
      setHasPrev(false);
    }
  }, []);

  /**
   * Extract data array from API response
   * 
   * Handles two scenarios:
   * 1. If dataKey is provided, extracts data from that specific key
   * 2. If dataKey is not provided, infers the data key by finding the first array property
   * 
   * This flexibility allows the hook to work with different API response structures.
   * 
   * @param result - The API response object
   * @returns Array of data items extracted from the response
   * 
   * @pattern ADAPTER
   * @usage Called during fetchData to extract the actual data array
   */
  const extractDataFromResponse = useCallback((result: AdminApiResponse): T[] => {
    if (dataKey) {
      // Explicit data key provided - use it directly
      return result[dataKey] || [];
    }
    // No data key provided - infer by finding the first array property
    // This handles APIs that return { success: true, items: [...] } format
    const dataKeys = Object.keys(result).filter(
      key => Array.isArray(result[key]) && key !== 'pagination'
    );
    if (dataKeys.length > 0) {
      return result[dataKeys[0]] || [];
    }
    return [];
  }, [dataKey]);

  /**
   * Build query string from filters, search term, and pagination params
   * 
   * Constructs a URL query string that includes:
   * - Pagination parameters (page, limit)
   * - Filter values (only non-empty values are included)
   * - Search term (if provided)
   * 
   * @param page - Current page number (1-indexed)
   * @returns URL-encoded query string (without leading '?')
   * 
   * @pattern QUERY_BUILDER
   * @usage Called by fetchData to construct the API request URL
   */
  const buildQueryString = useCallback(
    (page: number): string => {
      const params = new URLSearchParams();
      
      // Always include pagination params
      params.append('page', page.toString());
      params.append('limit', pageSize.toString());

      // Add filter values (skip undefined, null, and empty strings)
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Add search term if provided (trimmed to remove whitespace)
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      return params.toString();
    },
    [filters, searchTerm, pageSize]
  );

  /**
   * Fetch data from the API endpoint
   * 
   * Performs the actual HTTP request to fetch paginated, filtered data.
   * Handles loading states, error handling, and data extraction.
   * 
   * @param page - Page number to fetch (defaults to currentPage)
   * @returns Promise that resolves when data fetch completes
   * 
   * @pattern DATA_FETCHING
   * @error-handling
   * - HTTP errors are caught and logged via clientLogger
   * - API errors (success: false) are caught and logged
   * - Network errors are caught and logged
   * - All errors reset pagination state to prevent stale UI
   * 
   * @usage Called automatically when filters/search/page changes, or manually via refresh()
   */
  const fetchData = useCallback(
    async (page: number = currentPage): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Build query string with pagination, filters, and search
        const queryString = buildQueryString(page);
        const url = `${endpoint}?${queryString}`;

        // Fetch data from API
        const response = await fetch(url);

        // Check for HTTP errors (4xx, 5xx)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const result: AdminApiResponse = await response.json();

        // Check for API-level errors (success: false)
        if (!result.success) {
          throw new Error('API returned unsuccessful response');
        }

        // Extract data array from response (handles different response formats)
        const extractedData = extractDataFromResponse(result);
        setData(extractedData);

        // Update pagination metadata (from API or calculated fallback)
        updatePaginationState(result.pagination, extractedData.length);
      } catch (err) {
        // Handle all error types consistently
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        
        // Log error for observability (sends to server-side logger)
        clientLogger.apiError(endpoint, err, { component: 'useAdminData' });

        // Reset to empty state to prevent showing stale data
        resetPaginationState();
      } finally {
        // Always clear loading state, even on error
        setLoading(false);
      }
    },
    [endpoint, currentPage, buildQueryString, extractDataFromResponse, updatePaginationState, resetPaginationState]
  );

  /**
   * Auto-fetch data when dependencies change
   * 
   * Automatically refetches data when:
   * - Current page changes (user navigates pages)
   * - Filters change (user applies/removes filters)
   * - Search term changes (user types in search box)
   * - Page size changes (user changes items per page)
   * 
   * @note fetchData is intentionally excluded from dependencies to prevent infinite loops.
   *       The function is stable due to useCallback, but including it would cause
   *       unnecessary re-renders. Instead, we rely on the actual dependencies (filters, etc.)
   * 
   * @pattern REACTIVE_DATA_FETCHING
   * @usage Automatically handles data refresh when user interacts with filters/pagination
   */
  useEffect(() => {
    if (autoFetch) {
      fetchData(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // fetchData intentionally excluded to prevent infinite loop - it's stable via useCallback
  }, [currentPage, filters, searchTerm, pageSize, autoFetch]);

  /**
   * Navigate to the next page
   * 
   * Only advances if there is a next page available (hasNext) and we're not
   * already on the last page. This prevents invalid page navigation.
   * 
   * @pattern SAFE_NAVIGATION
   * @usage Called by pagination controls when user clicks "Next"
   */
  const nextPage = useCallback(() => {
    if (hasNext && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNext, currentPage, totalPages]);

  /**
   * Navigate to the previous page
   * 
   * Only goes back if there is a previous page available (hasPrev) and we're not
   * already on the first page. This prevents invalid page navigation.
   * 
   * @pattern SAFE_NAVIGATION
   * @usage Called by pagination controls when user clicks "Previous"
   */
  const prevPage = useCallback(() => {
    if (hasPrev && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPrev, currentPage]);

  /**
   * Navigate to a specific page number
   * 
   * Validates the page number to ensure it's within valid bounds (1 to totalPages).
   * Only updates state if the page is different from current page.
   * 
   * @param page - Page number to navigate to (1-indexed)
   * 
   * @pattern INPUT_VALIDATION
   * @usage Called by pagination controls when user types a page number or clicks a page button
   */
  const goToPage = useCallback(
    (page: number) => {
      // Clamp page number to valid range [1, totalPages]
      const validPage = Math.max(1, Math.min(page, totalPages));
      // Only update if different (prevents unnecessary re-renders)
      if (validPage !== currentPage) {
        setCurrentPage(validPage);
      }
    },
    [currentPage, totalPages]
  );

  /**
   * Update filter values (merges with existing filters)
   * 
   * Merges new filter values with existing filters, allowing partial updates.
   * Automatically resets to page 1 when filters change, as filtered results
   * may have different pagination than the original dataset.
   * 
   * @param newFilters - New filter values to merge (partial updates supported)
   * 
   * @pattern IMMUTABLE_STATE_UPDATE
   * @usage Called when user changes filter dropdowns or toggles
   */
  const setFilters = useCallback((newFilters: FilterConfig) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  /**
   * Clear all filters and reset to initial state
   * 
   * Resets filters to their initial values (from config), clears search term,
   * and resets to page 1. Useful for "Clear Filters" buttons in admin panels.
   * 
   * @pattern STATE_RESET
   * @usage Called by "Clear Filters" or "Reset" buttons
   */
  const clearFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSearchTermState('');
    setCurrentPage(1);
  }, [initialFilters]);

  /**
   * Update search term
   * 
   * Updates the search term and automatically resets to page 1, as search results
   * may have different pagination than the original dataset.
   * 
   * @param term - New search term (empty string clears search)
   * 
   * @pattern SEARCH_STATE_MANAGEMENT
   * @usage Called when user types in search input (typically debounced by parent component)
   */
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  /**
   * Manually refresh data (re-fetches current page)
   * 
   * Useful for "Refresh" buttons or after mutations (create/update/delete).
   * Re-fetches the current page without changing pagination state.
   * 
   * @returns Promise that resolves when refresh completes
   * 
   * @pattern MANUAL_REFRESH
   * @usage Called after successful mutations or when user clicks "Refresh"
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
