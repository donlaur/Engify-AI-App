import type { AITool } from '@/lib/db/schemas/ai-tool';

interface ToolDisplay extends AITool {
  _id?: string;
}

export type FilterType = 'all' | 'active' | 'deprecated';

/**
 * Filter AI tools based on filter type
 * 
 * Filters an array of AI tools by their status (all, active, or deprecated).
 * Active tools are those with status 'active'. Deprecated includes 'deprecated' and 'sunset' statuses.
 * 
 * @param tools - Array of AI tools to filter
 * @param filter - Filter type: 'all', 'active', or 'deprecated'
 * @returns Filtered array of tools matching the filter criteria
 * 
 * @example
 * ```tsx
 * const activeTools = filterTools(allTools, 'active');
 * const deprecatedTools = filterTools(allTools, 'deprecated');
 * ```
 */
export function filterTools(tools: ToolDisplay[], filter: FilterType): ToolDisplay[] {
  switch (filter) {
    case 'all':
      return tools;
    case 'active':
      return tools.filter((t) => t.status === 'active');
    case 'deprecated':
      return tools.filter((t) => t.status === 'deprecated' || t.status === 'sunset');
    default:
      return tools;
  }
}

/**
 * Group AI tools by their category
 * 
 * Organizes an array of AI tools into a dictionary keyed by category name.
 * Useful for displaying tools grouped by category (e.g., 'code', 'text', 'image').
 * 
 * @param tools - Array of AI tools to group
 * @returns Dictionary mapping category names to arrays of tools
 * 
 * @example
 * ```tsx
 * const grouped = groupToolsByCategory(tools);
 * // Result: { 'code': [...], 'text': [...], 'image': [...] }
 * ```
 */
export function groupToolsByCategory(tools: ToolDisplay[]): Record<string, ToolDisplay[]> {
  return tools.reduce(
    (acc, tool) => {
      const category = tool.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(tool);
      return acc;
    },
    {} as Record<string, ToolDisplay[]>
  );
}

