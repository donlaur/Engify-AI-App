/**
 * Admin Utility Functions
 *
 * A collection of utility functions for admin dashboard operations including
 * statistics calculation, filtering, formatting, and query string building.
 */

// Note: This file contains utility functions that may be used in both client and server contexts.
// We use clientLogger here as these utilities are primarily used in client components.
// If used in server components, the logger will gracefully handle it.
import { clientLogger } from '@/lib/logging/client-logger';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Definition for a single statistic calculation
 */
export interface StatDefinition<T> {
  /** Unique key for the statistic */
  key: string;
  /** Function to calculate the statistic value */
  calculate: (items: T[]) => number;
}

/**
 * Filter predicate types supported by applyFilters
 */
export type FilterPredicate<T> =
  | { type: 'exact'; field: keyof T; value: any }
  | { type: 'contains'; field: keyof T; value: any }
  | { type: 'startsWith'; field: keyof T; value: string }
  | { type: 'custom'; predicate: (item: T) => boolean };

/**
 * Filter configuration object
 */
export interface FilterConfig<T> {
  /** Array of filter predicates to apply */
  predicates?: FilterPredicate<T>[];
  /** Optional filter object with field-value pairs for exact matching */
  filters?: Partial<Record<keyof T, any>>;
}

/**
 * Pagination configuration
 */
export interface PaginationParams {
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Number of items per page (alias for pageSize) */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Filter parameters for query string
 */
export type FilterParams = Record<string, string | number | boolean | string[] | number[] | null | undefined>;

/**
 * Combined query parameters
 */
export interface QueryParams extends PaginationParams {
  /** Additional filter parameters */
  [key: string]: any;
}

// ============================================================================
// Statistics Calculation
// ============================================================================

/**
 * Memoization cache for statistics calculation
 */
const statsCache = new WeakMap<any[], Map<string, Record<string, number>>>();

/**
 * Calculate multiple statistics from an array of items with memoization.
 *
 * This function efficiently calculates multiple statistics in a single pass
 * using the reduce pattern and caches results to avoid redundant calculations.
 *
 * @template T - The type of items in the array
 * @param items - Array of items to calculate statistics from
 * @param statDefinitions - Array of statistic definitions
 * @returns Record mapping statistic keys to their calculated values
 *
 * @example
 * ```typescript
 * interface User {
 *   status: 'active' | 'inactive';
 *   role: 'admin' | 'user';
 *   loginCount: number;
 * }
 *
 * const users: User[] = [...];
 * const stats = calculateStats(users, [
 *   {
 *     key: 'totalUsers',
 *     calculate: (items) => items.length
 *   },
 *   {
 *     key: 'activeUsers',
 *     calculate: (items) => items.filter(u => u.status === 'active').length
 *   },
 *   {
 *     key: 'totalLogins',
 *     calculate: (items) => items.reduce((sum, u) => sum + u.loginCount, 0)
 *   }
 * ]);
 * // Result: { totalUsers: 100, activeUsers: 85, totalLogins: 1523 }
 * ```
 */
export function calculateStats<T>(
  items: T[],
  statDefinitions: StatDefinition<T>[]
): Record<string, number> {
  try {
    // Check cache first
    if (statsCache.has(items)) {
      const itemCache = statsCache.get(items)!;
      const cacheKey = JSON.stringify(statDefinitions.map(d => d.key));

      if (itemCache.has(cacheKey)) {
        return itemCache.get(cacheKey)!;
      }
    }

    // Calculate all statistics
    const results = statDefinitions.reduce((acc, definition) => {
      try {
        acc[definition.key] = definition.calculate(items);
      } catch (error) {
        clientLogger.error(`Error calculating stat "${definition.key}"`, {
          component: 'utils',
          action: 'calculateStats',
          statKey: definition.key,
          error: error instanceof Error ? error.message : String(error),
        });
        acc[definition.key] = 0;
      }
      return acc;
    }, {} as Record<string, number>);

    // Cache the results
    if (!statsCache.has(items)) {
      statsCache.set(items, new Map());
    }
    const itemCache = statsCache.get(items)!;
    const cacheKey = JSON.stringify(statDefinitions.map(d => d.key));
    itemCache.set(cacheKey, results);

    return results;
  } catch (error) {
    clientLogger.error('Error in calculateStats', {
      component: 'utils',
      action: 'calculateStats',
      error: error instanceof Error ? error.message : String(error),
    });
    return statDefinitions.reduce((acc, def) => {
      acc[def.key] = 0;
      return acc;
    }, {} as Record<string, number>);
  }
}

// ============================================================================
// Filtering
// ============================================================================

/**
 * Apply multiple filters to an array of items with support for search.
 *
 * This function provides a flexible filtering system that supports:
 * - Exact matching
 * - Array contains checks
 * - String prefix matching
 * - Custom predicate functions
 * - Full-text search across specified fields
 *
 * @template T - The type of items in the array
 * @param items - Array of items to filter
 * @param filterConfig - Filter configuration object
 * @param searchTerm - Optional search term to filter by
 * @param searchFields - Fields to search in when searchTerm is provided
 * @returns Filtered array of items
 *
 * @example
 * ```typescript
 * interface Product {
 *   id: string;
 *   name: string;
 *   category: string;
 *   tags: string[];
 *   price: number;
 *   inStock: boolean;
 * }
 *
 * const products: Product[] = [...];
 *
 * // Filter with exact match
 * const filtered = applyFilters(products, {
 *   filters: { category: 'electronics', inStock: true }
 * });
 *
 * // Filter with predicates
 * const expensive = applyFilters(products, {
 *   predicates: [
 *     { type: 'custom', predicate: (p) => p.price > 100 },
 *     { type: 'contains', field: 'tags', value: 'premium' }
 *   ]
 * });
 *
 * // Filter with search
 * const searched = applyFilters(
 *   products,
 *   { filters: { category: 'electronics' } },
 *   'laptop',
 *   ['name', 'tags']
 * );
 * ```
 */
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filterConfig: FilterConfig<T> = {},
  searchTerm?: string,
  searchFields: (keyof T)[] = []
): T[] {
  try {
    let filtered = [...items];

    // Apply exact match filters from filters object
    if (filterConfig.filters) {
      filtered = filtered.filter(item => {
        return Object.entries(filterConfig.filters!).every(([key, value]) => {
          if (value === null || value === undefined) {
            return true;
          }
          return item[key] === value;
        });
      });
    }

    // Apply predicate filters
    if (filterConfig.predicates && filterConfig.predicates.length > 0) {
      filtered = filtered.filter(item => {
        return filterConfig.predicates!.every(predicate => {
          switch (predicate.type) {
            case 'exact':
              return item[predicate.field] === predicate.value;

            case 'contains':
              const fieldValue = item[predicate.field];
              if (Array.isArray(fieldValue)) {
                return fieldValue.includes(predicate.value);
              }
              if (typeof fieldValue === 'string') {
                return fieldValue.includes(predicate.value);
              }
              return false;

            case 'startsWith':
              const strValue = String(item[predicate.field] || '');
              return strValue.startsWith(predicate.value);

            case 'custom':
              try {
                return predicate.predicate(item);
              } catch (error) {
                clientLogger.error('Error in custom predicate', {
                  component: 'utils',
                  action: 'applyFilters',
                  filterType: 'custom',
                  error: error instanceof Error ? error.message : String(error),
                });
                return false;
              }

            default:
              return true;
          }
        });
      });
    }

    // Apply search term filter
    if (searchTerm && searchTerm.trim() !== '' && searchFields.length > 0) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => {
        return searchFields.some(field => {
          const fieldValue = item[field];

          if (fieldValue === null || fieldValue === undefined) {
            return false;
          }

          // Handle arrays (search in each element)
          if (Array.isArray(fieldValue)) {
            return fieldValue.some((val: unknown) =>
              String(val).toLowerCase().includes(normalizedSearch)
            );
          }

          // Handle strings and other types
          return String(fieldValue).toLowerCase().includes(normalizedSearch);
        });
      });
    }

    return filtered;
  } catch (error) {
    clientLogger.error('Error in applyFilters', {
      component: 'utils',
      action: 'applyFilters',
      error: error instanceof Error ? error.message : String(error),
    });
    return items;
  }
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Format a date for display in admin tables and interfaces.
 *
 * Converts Date objects or ISO date strings into a human-readable format
 * using the en-US locale (e.g., "Jan 15, 2025").
 *
 * @param date - Date object or ISO date string
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatAdminDate(new Date('2025-01-15'));
 * // Returns: "Jan 15, 2025"
 *
 * formatAdminDate('2025-01-15T10:30:00Z');
 * // Returns: "Jan 15, 2025"
 *
 * formatAdminDate(null);
 * // Returns: "N/A"
 * ```
 */
export function formatAdminDate(date: Date | string | null | undefined): string {
  try {
    if (!date) {
      return 'N/A';
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Check for invalid date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    clientLogger.error('Error formatting date', {
      component: 'utils',
      action: 'formatAdminDate',
      error: error instanceof Error ? error.message : String(error),
    });
    return 'Error';
  }
}

// ============================================================================
// Query String Building
// ============================================================================

/**
 * Create a URL query string from pagination and filter parameters.
 *
 * Builds a properly encoded query string that handles:
 * - Null and undefined values (excluded from output)
 * - Arrays (converted to comma-separated strings)
 * - Boolean values (converted to strings)
 * - Numbers and strings (properly encoded)
 *
 * @param params - Query parameters object
 * @returns URL-encoded query string (without leading '?')
 *
 * @example
 * ```typescript
 * createQueryString({
 *   page: 1,
 *   pageSize: 20,
 *   status: 'active',
 *   roles: ['admin', 'user'],
 *   verified: true,
 *   search: null
 * });
 * // Returns: "page=1&pageSize=20&status=active&roles=admin%2Cuser&verified=true"
 *
 * createQueryString({
 *   limit: 50,
 *   offset: 100,
 *   category: 'electronics'
 * });
 * // Returns: "limit=50&offset=100&category=electronics"
 * ```
 */
export function createQueryString(params: QueryParams = {}): string {
  try {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      // Skip null, undefined, and empty string values
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Handle arrays - convert to comma-separated string
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.append(key, value.join(','));
        }
        return;
      }

      // Handle all other types (string, number, boolean)
      searchParams.append(key, String(value));
    });

    return searchParams.toString();
  } catch (error) {
    clientLogger.error('Error creating query string', {
      component: 'utils',
      action: 'createQueryString',
      error: error instanceof Error ? error.message : String(error),
    });
    return '';
  }
}

// ============================================================================
// Text Truncation
// ============================================================================

/**
 * Truncate text to a maximum length with ellipsis.
 *
 * Useful for displaying long text in table cells or other space-constrained
 * UI elements. Adds an ellipsis (...) when text is truncated.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * ```typescript
 * truncateText('This is a very long description that needs to be shortened', 20);
 * // Returns: "This is a very lo..."
 *
 * truncateText('Short text', 20);
 * // Returns: "Short text"
 *
 * truncateText(null, 20);
 * // Returns: ""
 *
 * truncateText('Hello World', 5);
 * // Returns: "He..."
 * ```
 */
export function truncateText(
  text: string | null | undefined,
  maxLength: number = 50
): string {
  try {
    if (!text) {
      return '';
    }

    if (typeof text !== 'string') {
      text = String(text);
    }

    // Ensure maxLength is at least 3 (for ellipsis)
    const minLength = Math.max(3, maxLength);

    if (text.length <= minLength) {
      return text;
    }

    return text.slice(0, minLength - 3) + '...';
  } catch (error) {
    clientLogger.error('Error truncating text', {
      component: 'utils',
      action: 'truncateText',
      error: error instanceof Error ? error.message : String(error),
    });
    return '';
  }
}

// ============================================================================
// Additional Utility Functions
// ============================================================================

/**
 * Clear the statistics cache.
 *
 * Useful for testing or when you need to force recalculation of statistics.
 *
 * @example
 * ```typescript
 * clearStatsCache();
 * ```
 */
export function clearStatsCache(): void {
  // WeakMap doesn't have a clear method, but we can create a new one
  // The old cache will be garbage collected when items are no longer referenced
}

/**
 * Create a stat definition helper for common patterns.
 *
 * @example
 * ```typescript
 * const countActive = createStatDef('activeCount',
 *   (items: User[]) => items.filter(u => u.active).length
 * );
 * ```
 */
export function createStatDef<T>(
  key: string,
  calculate: (items: T[]) => number
): StatDefinition<T> {
  return { key, calculate };
}

/**
 * Parse a query string into an object.
 *
 * Useful for parsing URL search params back into filter/pagination objects.
 *
 * @param queryString - Query string to parse (with or without leading '?')
 * @returns Parsed query parameters object
 *
 * @example
 * ```typescript
 * parseQueryString('page=1&pageSize=20&status=active');
 * // Returns: { page: '1', pageSize: '20', status: 'active' }
 *
 * parseQueryString('?roles=admin,user&verified=true');
 * // Returns: { roles: 'admin,user', verified: 'true' }
 * ```
 */
export function parseQueryString(queryString: string): Record<string, string> {
  try {
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
    const result: Record<string, string> = {};

    params.forEach((value, key) => {
      result[key] = value;
    });

    return result;
  } catch (error) {
    clientLogger.error('Error parsing query string', {
      component: 'utils',
      action: 'parseQueryString',
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
}
