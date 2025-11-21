/**
 * Filtering Utilities for OpsHub Admin Data
 * 
 * Provides reusable, type-safe filtering functions for admin panels.
 * Implements DRY principle by extracting common filtering patterns into
 * generic functions that can be composed for complex filtering scenarios.
 * 
 * @pattern FUNCTIONAL_FILTERING
 * @principle DRY - eliminates duplication across filter implementations
 * @usage Used by WorkflowManagementPanel, RecommendationManagementPanel, PainPointManagementPanel
 * 
 * @ai-readability
 * - Generic functions with clear type parameters
 * - Descriptive function names that explain purpose
 * - JSDoc comments explain usage and parameters
 * - Examples show how to compose filters
 * 
 * @architecture
 * - Private generic functions (filterByField, filterByArrayField, searchByFields) provide base functionality
 * - Public functions (filterByCategory, filterByStatus, etc.) are domain-specific wrappers
 * - Composite functions (filterWorkflows, filterRecommendations) combine multiple filters
 */

/**
 * Generic filter function for exact field matching
 * 
 * Filters items where a specific field exactly matches the filter value.
 * Returns all items if filterValue is 'all' (common pattern for "show all" filters).
 * 
 * @template T - The type of items being filtered
 * @param items - Array of items to filter
 * @param filterValue - The value to match against (or 'all' to show all)
 * @param getFieldValue - Function to extract the field value from each item
 * @returns Filtered array of items matching the filter value
 * 
 * @example
 * ```typescript
 * // Filter users by role
 * const admins = filterByField(users, 'admin', user => user.role);
 * ```
 */
function filterByField<T>(
  items: T[],
  filterValue: string,
  getFieldValue: (item: T) => string
): T[] {
  if (filterValue === 'all') return items;
  return items.filter(item => getFieldValue(item) === filterValue);
}

/**
 * Generic filter function for array field matching
 * 
 * Filters items where a field contains an array and the filter value is in that array.
 * Useful for filtering by tags, categories, audiences, etc.
 * 
 * @template T - The type of items being filtered
 * @param items - Array of items to filter
 * @param filterValue - The value to search for in the array field (or 'all' to show all)
 * @param getFieldValue - Function to extract the array field from each item
 * @returns Filtered array of items where the array field includes the filter value
 * 
 * @example
 * ```typescript
 * // Filter workflows by audience
 * const developerWorkflows = filterByArrayField(workflows, 'developers', w => w.audience);
 * ```
 */
function filterByArrayField<T>(
  items: T[],
  filterValue: string,
  getFieldValue: (item: T) => string[]
): T[] {
  if (filterValue === 'all') return items;
  return items.filter(item => getFieldValue(item).includes(filterValue));
}

/**
 * Generic search function for text fields
 * 
 * Performs case-insensitive substring search across multiple text fields.
 * Returns all items if searchTerm is empty or whitespace-only.
 * 
 * @template T - The type of items being filtered
 * @param items - Array of items to search
 * @param searchTerm - The text to search for (empty string returns all items)
 * @param getFieldValues - Function to extract all searchable text fields from an item
 * @returns Filtered array of items where any field contains the search term
 * 
 * @example
 * ```typescript
 * // Search prompts by title and slug
 * const results = searchByFields(prompts, 'react', p => [p.title, p.slug]);
 * ```
 */
function searchByFields<T>(
  items: T[],
  searchTerm: string,
  getFieldValues: (item: T) => string[]
): T[] {
  if (!searchTerm.trim()) return items;
  const search = searchTerm.toLowerCase();
  return items.filter(item => {
    const fieldValues = getFieldValues(item);
    return fieldValues.some(value => value?.toLowerCase().includes(search));
  });
}

/**
 * Filter items by category field
 * 
 * Domain-specific wrapper for filtering by category. Uses the generic filterByField
 * function internally to reduce code duplication.
 * 
 * @template T - Item type must have a 'category' string field
 * @param items - Array of items to filter
 * @param categoryFilter - Category value to filter by, or 'all' to show all
 * @returns Filtered array of items matching the category
 */
export function filterByCategory<T extends { category: string }>(
  items: T[],
  categoryFilter: string
): T[] {
  return filterByField(items, categoryFilter, item => item.category);
}

/**
 * Filter items by status field
 * 
 * Domain-specific wrapper for filtering by status (e.g., 'published', 'draft').
 * 
 * @template T - Item type must have a 'status' string field
 * @param items - Array of items to filter
 * @param statusFilter - Status value to filter by, or 'all' to show all
 * @returns Filtered array of items matching the status
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  statusFilter: string
): T[] {
  return filterByField(items, statusFilter, item => item.status);
}

/**
 * Filter items by audience array field
 * 
 * Filters items where the audience array includes the specified value.
 * Useful for filtering content by target audience (e.g., 'developers', 'designers').
 * 
 * @template T - Item type must have an 'audience' string array field
 * @param items - Array of items to filter
 * @param audienceFilter - Audience value to search for, or 'all' to show all
 * @returns Filtered array of items where audience includes the filter value
 */
export function filterByAudience<T extends { audience: string[] }>(
  items: T[],
  audienceFilter: string
): T[] {
  return filterByArrayField(items, audienceFilter, item => item.audience);
}

/**
 * Filter items by priority field
 * 
 * Domain-specific wrapper for filtering by priority (e.g., 'high', 'medium', 'low').
 * 
 * @template T - Item type must have a 'priority' string field
 * @param items - Array of items to filter
 * @param priorityFilter - Priority value to filter by, or 'all' to show all
 * @returns Filtered array of items matching the priority
 */
export function filterByPriority<T extends { priority: string }>(
  items: T[],
  priorityFilter: string
): T[] {
  return filterByField(items, priorityFilter, item => item.priority);
}

/**
 * Search items by text in title and slug fields
 * 
 * Performs case-insensitive search across title and slug fields.
 * Commonly used for admin panel search functionality.
 * 
 * @template T - Item type must have 'title' and 'slug' string fields
 * @param items - Array of items to search
 * @param searchTerm - Text to search for (empty string returns all items)
 * @returns Filtered array of items where title or slug contains the search term
 */
export function searchByText<T extends { title: string; slug: string }>(
  items: T[],
  searchTerm: string
): T[] {
  return searchByFields(items, searchTerm, item => [item.title, item.slug]);
}

/**
 * Search items by text in title, slug, and description fields
 * 
 * Extended search that includes description field for more comprehensive results.
 * Useful when users might search for content by description text.
 * 
 * @template T - Item type must have 'title', 'slug', and optional 'description' fields
 * @param items - Array of items to search
 * @param searchTerm - Text to search for (empty string returns all items)
 * @returns Filtered array of items where title, slug, or description contains the search term
 */
export function searchByTextWithDescription<T extends { title: string; slug: string; description?: string }>(
  items: T[],
  searchTerm: string
): T[] {
  return searchByFields(items, searchTerm, item => [
    item.title,
    item.slug,
    item.description || '',
  ]);
}

/**
 * Apply multiple filters in sequence using a pipeline pattern
 * 
 * Composes multiple filter functions into a single filtering pipeline.
 * Each filter is applied to the result of the previous filter, allowing
 * complex filtering logic to be built from simple, reusable functions.
 * 
 * @template T - The type of items being filtered
 * @param items - Initial array of items to filter
 * @param filters - Array of filter functions to apply in sequence
 * @returns Final filtered array after all filters have been applied
 * 
 * @example
 * ```typescript
 * const filtered = applyFilterPipeline(items, [
 *   items => filterByCategory(items, 'workflow'),
 *   items => filterByStatus(items, 'published'),
 *   items => searchByText(items, 'react')
 * ]);
 * ```
 */
function applyFilterPipeline<T>(
  items: T[],
  filters: Array<(items: T[]) => T[]>
): T[] {
  return filters.reduce((filtered, filterFn) => filterFn(filtered), items);
}

/**
 * Composite filter for workflow items
 * 
 * Applies multiple filters in sequence: category → status → audience → search.
 * This is a domain-specific composite function that combines common filtering
 * patterns for workflow management panels.
 * 
 * @template T - Item type must have category, status, audience, title, and slug fields
 * @param items - Array of workflow items to filter
 * @param filters - Object containing category, status, and audience filter values
 * @param searchTerm - Text to search for in title and slug fields
 * @returns Filtered array of workflows matching all filter criteria
 * 
 * @usage Used by WorkflowManagementPanel for filtering workflow lists
 */
export function filterWorkflows<T extends { category: string; status: string; audience: string[]; title: string; slug: string }>(
  items: T[],
  filters: { category: string; status: string; audience: string },
  searchTerm: string
): T[] {
  const filterPipeline = [
    (items: T[]) => filterByCategory(items, filters.category),
    (items: T[]) => filterByStatus(items, filters.status),
    (items: T[]) => filterByAudience(items, filters.audience),
    (items: T[]) => searchByText(items, searchTerm),
  ];
  return applyFilterPipeline(items, filterPipeline);
}

/**
 * Composite filter for recommendation items
 * 
 * Applies multiple filters in sequence: category → audience → priority → status → search.
 * More complex than workflow filtering due to additional priority field.
 * 
 * @template T - Item type must have category, status, audience, priority, title, and slug fields
 * @param items - Array of recommendation items to filter
 * @param filters - Object containing category, audience, priority, and status filter values
 * @param searchTerm - Text to search for in title and slug fields
 * @returns Filtered array of recommendations matching all filter criteria
 * 
 * @usage Used by RecommendationManagementPanel for filtering recommendation lists
 */
export function filterRecommendations<T extends { category: string; status: string; audience: string[]; priority: string; title: string; slug: string }>(
  items: T[],
  filters: { category: string; audience: string; priority: string; status: string },
  searchTerm: string
): T[] {
  const filterPipeline = [
    (items: T[]) => filterByCategory(items, filters.category),
    (items: T[]) => filterByAudience(items, filters.audience),
    (items: T[]) => filterByPriority(items, filters.priority),
    (items: T[]) => filterByStatus(items, filters.status),
    (items: T[]) => searchByText(items, searchTerm),
  ];
  return applyFilterPipeline(items, filterPipeline);
}

/**
 * Composite filter for pain point items
 * 
 * Simpler composite filter that only applies status and search filters.
 * Pain points don't have category or audience fields, so filtering is more straightforward.
 * 
 * @template T - Item type must have status, title, slug, and optional description fields
 * @param items - Array of pain point items to filter
 * @param statusFilter - Status value to filter by, or 'all' to show all
 * @param searchTerm - Text to search for in title, slug, and description fields
 * @returns Filtered array of pain points matching the filter criteria
 * 
 * @usage Used by PainPointManagementPanel for filtering pain point lists
 */
export function filterPainPoints<T extends { status: string; title: string; slug: string; description?: string }>(
  items: T[],
  statusFilter: string,
  searchTerm: string
): T[] {
  const filterPipeline = [
    (items: T[]) => filterByStatus(items, statusFilter),
    (items: T[]) => searchByTextWithDescription(items, searchTerm),
  ];
  return applyFilterPipeline(items, filterPipeline);
}

