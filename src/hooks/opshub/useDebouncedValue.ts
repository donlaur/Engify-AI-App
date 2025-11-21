/**
 * Debounced Value Hook
 *
 * React hook that returns a debounced version of a value. Debouncing delays
 * updates to a value, useful for expensive operations like API calls or
 * search queries that should wait for user input to stop changing.
 *
 * @example
 * // Usage with search input
 * const [searchInput, setSearchInput] = useState('');
 * const debouncedSearchInput = useDebouncedValue(searchInput, 300);
 *
 * useEffect(() => {
 *   if (debouncedSearchInput) {
 *     // Perform expensive search operation
 *     searchPrompts(debouncedSearchInput);
 *   }
 * }, [debouncedSearchInput]);
 *
 * return (
 *   <input
 *     value={searchInput}
 *     onChange={(e) => setSearchInput(e.target.value)}
 *     placeholder="Search..."
 *   />
 * );
 */

'use client';

import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of the input value
 *
 * @template T - The type of the value to debounce
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 500)
 * @returns The debounced value
 *
 * @remarks
 * - The hook will only update the debounced value after the specified delay
 *   has elapsed without the input value changing
 * - Useful for: search inputs, filter fields, API calls, form validation
 * - Always clears the timeout on cleanup to prevent memory leaks
 * - Initial debounced value equals the input value
 *
 * @example
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebouncedValue(query, 300);
 *
 * // debouncedQuery updates 300ms after user stops typing
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout to update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout on value change or component unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
