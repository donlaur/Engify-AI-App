import type { AITool } from '@/lib/db/schemas/ai-tool';

interface ToolDisplay extends AITool {
  _id?: string;
}

export type FilterType = 'all' | 'active' | 'deprecated';

/**
 * Filter tools based on filter type
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
 * Group tools by category
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

