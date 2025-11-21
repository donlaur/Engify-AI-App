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
 */
export function calculateCategoryStats(workflows: WorkflowWithMetadata[]) {
  return workflows.reduce((acc, workflow) => {
    acc[workflow.category] = (acc[workflow.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

