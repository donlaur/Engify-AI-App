/**
 * Utility functions for filtering admin data
 */

/**
 * Filter items by category
 */
export function filterByCategory<T extends { category: string }>(
  items: T[],
  categoryFilter: string
): T[] {
  if (categoryFilter === 'all') return items;
  return items.filter(item => item.category === categoryFilter);
}

/**
 * Filter items by status
 */
export function filterByStatus<T extends { status: string }>(
  items: T[],
  statusFilter: string
): T[] {
  if (statusFilter === 'all') return items;
  return items.filter(item => item.status === statusFilter);
}

/**
 * Filter items by audience (supports array of audiences)
 */
export function filterByAudience<T extends { audience: string[] }>(
  items: T[],
  audienceFilter: string
): T[] {
  if (audienceFilter === 'all') return items;
  return items.filter(item => item.audience.includes(audienceFilter));
}

/**
 * Filter items by priority
 */
export function filterByPriority<T extends { priority: string }>(
  items: T[],
  priorityFilter: string
): T[] {
  if (priorityFilter === 'all') return items;
  return items.filter(item => item.priority === priorityFilter);
}

/**
 * Search items by text in title and slug fields
 */
export function searchByText<T extends { title: string; slug: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) return items;
  const search = searchTerm.toLowerCase();
  return items.filter(
    item =>
      item.title.toLowerCase().includes(search) ||
      item.slug.toLowerCase().includes(search)
  );
}

/**
 * Search items by text in title, slug, and description fields
 */
export function searchByTextWithDescription<T extends { title: string; slug: string; description?: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) return items;
  const search = searchTerm.toLowerCase();
  return items.filter(
    item =>
      item.title.toLowerCase().includes(search) ||
      item.slug.toLowerCase().includes(search) ||
      (item.description && item.description.toLowerCase().includes(search))
  );
}

/**
 * Combine multiple filters for workflows
 */
export function filterWorkflows<T extends { category: string; status: string; audience: string[]; title: string; slug: string }>(
  items: T[],
  filters: { category: string; status: string; audience: string },
  searchTerm: string
): T[] {
  let filtered = items;
  filtered = filterByCategory(filtered, filters.category);
  filtered = filterByStatus(filtered, filters.status);
  filtered = filterByAudience(filtered, filters.audience);
  filtered = searchByText(filtered, searchTerm);
  return filtered;
}

/**
 * Combine multiple filters for recommendations
 */
export function filterRecommendations<T extends { category: string; status: string; audience: string[]; priority: string; title: string; slug: string }>(
  items: T[],
  filters: { category: string; audience: string; priority: string; status: string },
  searchTerm: string
): T[] {
  let filtered = items;
  filtered = filterByCategory(filtered, filters.category);
  filtered = filterByAudience(filtered, filters.audience);
  filtered = filterByPriority(filtered, filters.priority);
  filtered = filterByStatus(filtered, filters.status);
  filtered = searchByText(filtered, searchTerm);
  return filtered;
}

/**
 * Combine multiple filters for pain points
 */
export function filterPainPoints<T extends { status: string; title: string; slug: string; description?: string }>(
  items: T[],
  statusFilter: string,
  searchTerm: string
): T[] {
  let filtered = items;
  filtered = filterByStatus(filtered, statusFilter);
  filtered = searchByTextWithDescription(filtered, searchTerm);
  return filtered;
}

