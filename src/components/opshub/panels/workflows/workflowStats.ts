import type { Workflow } from '@/lib/workflows/workflow-schema';

/**
 * Extended workflow interface with metadata
 */
export interface WorkflowWithMetadata extends Workflow {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Calculate statistics for workflows
 * 
 * Computes aggregate statistics from a workflow array, including counts by status.
 * Used for displaying workflow statistics in admin panels.
 * 
 * @param workflows - Array of workflows with metadata
 * @param totalCount - Total count of workflows (may differ from array length due to pagination)
 * @returns Object containing total, published, draft, and comingSoon counts
 * 
 * @example
 * ```tsx
 * const stats = calculateWorkflowStats(workflows, 100);
 * // Result: { total: 100, published: 45, draft: 30, comingSoon: 25 }
 * ```
 */
export function calculateWorkflowStats(
  workflows: WorkflowWithMetadata[],
  totalCount: number
) {
  return {
    total: totalCount,
    published: workflows.filter(w => w.status === 'published').length,
    draft: workflows.filter(w => w.status === 'draft').length,
    comingSoon: workflows.filter(w => w.status === 'coming_soon').length,
  };
}

/**
 * Calculate category breakdown for workflows
 * 
 * Groups workflows by category and counts them. Returns a dictionary mapping
 * category names to their counts.
 * 
 * @param workflows - Array of workflows with metadata
 * @returns Dictionary mapping category names to counts
 * 
 * @example
 * ```tsx
 * const categoryStats = calculateCategoryStats(workflows);
 * // Result: { 'marketing': 15, 'sales': 10, 'support': 8 }
 * ```
 */
export function calculateCategoryStats(workflows: WorkflowWithMetadata[]) {
  return workflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

