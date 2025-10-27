/**
 * Safe Array Utilities
 * 
 * Prevents runtime errors from undefined/null arrays and unsafe access.
 * All functions handle null/undefined gracefully.
 */

/**
 * Check if array exists and has items
 * 
 * @example
 * if (hasItems(users)) {
 *   const first = users[0]; // Safe!
 * }
 */
export function hasItems<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Safe array wrapper - always returns an array
 * 
 * @example
 * const items = safeArray(maybeUndefined);
 * items.map(x => x.name); // Never crashes
 */
export function safeArray<T>(arr: T[] | null | undefined): T[] {
  return Array.isArray(arr) ? arr : [];
}

/**
 * Get first item safely
 * 
 * @example
 * const first = first(users); // null if empty
 */
export function first<T>(arr: T[] | null | undefined): T | null {
  return hasItems(arr) ? arr[0] : null;
}

/**
 * Get last item safely
 */
export function last<T>(arr: T[] | null | undefined): T | null {
  return hasItems(arr) ? arr[arr.length - 1] : null;
}

/**
 * Safe map operation
 * 
 * @example
 * const names = safeMap(users, u => u.name);
 */
export function safeMap<T, U>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  return safeArray(arr).map(fn);
}

/**
 * Safe filter operation
 */
export function safeFilter<T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T[] {
  return safeArray(arr).filter(fn);
}

/**
 * Safe find operation
 */
export function safeFind<T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T | undefined {
  return safeArray(arr).find(fn);
}

/**
 * Get array length safely
 */
export function safeLength(arr: unknown[] | null | undefined): number {
  return Array.isArray(arr) ? arr.length : 0;
}

/**
 * Chunk array into smaller arrays
 * 
 * @example
 * chunk([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * Group array items by key
 * 
 * @example
 * groupBy(users, u => u.role)
 * // { admin: [...], user: [...] }
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  fn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  arr: T[],
  fn: (item: T) => string | number,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = fn(a);
    const bVal = fn(b);
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}
