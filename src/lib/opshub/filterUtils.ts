/**
 * Utility functions for filtering admin data
 */

/**
 * Generic filter function for exact field matching
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
 * Filter items by category
 */
export function filterByCategory<T extends { category: string }>(
  items: T[],
  categoryFilter: string
): T[] {
  return filterByField(items, categoryFilter, item => item.category);
}

/**
 * Filter items by status
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  statusFilter: string
): T[] {
  return filterByField(items, statusFilter, item => item.status);
}

/**
 * Filter items by audience (supports array of audiences)
 */
export function filterByAudience<T extends { audience: string[] }>(
  items: T[],
  audienceFilter: string
): T[] {
  return filterByArrayField(items, audienceFilter, item => item.audience);
}

/**
 * Filter items by priority
 */
export function filterByPriority<T extends { priority: string }>(
  items: T[],
  priorityFilter: string
): T[] {
  return filterByField(items, priorityFilter, item => item.priority);
}

/**
 * Search items by text in title and slug fields
 */
export function searchByText<T extends { title: string; slug: string }>(
  items: T[],
  searchTerm: string
): T[] {
  return searchByFields(items, searchTerm, item => [item.title, item.slug]);
}

/**
 * Search items by text in title, slug, and description fields
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
 */
function applyFilterPipeline<T>(
  items: T[],
  filters: Array<(items: T[]) => T[]>
): T[] {
  return filters.reduce((filtered, filterFn) => filterFn(filtered), items);
}

/**
 * Combine multiple filters for workflows
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
 * Combine multiple filters for recommendations
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
 * Combine multiple filters for pain points
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

