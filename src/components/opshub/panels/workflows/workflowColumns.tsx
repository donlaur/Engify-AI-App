import { Badge } from '@/components/ui/badge';
import { formatAdminDate } from '@/lib/opshub/utils';
import type { ColumnDef } from '@/components/opshub/panels/shared/AdminDataTable';
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
 * Creates column definitions for the workflow data table
 *
 * @param onView - Callback function when a workflow is clicked
 * @returns Array of column definitions
 */
export function createWorkflowColumns(
  onView: (workflow: WorkflowWithMetadata) => void
): ColumnDef<WorkflowWithMetadata>[] {
  return [
    {
      id: 'title',
      label: 'Title',
      width: 'w-[300px]',
      render: (workflow) => (
        <button
          onClick={() => onView(workflow)}
          className="text-left hover:text-blue-600 hover:underline dark:hover:text-blue-400"
        >
          {workflow.title}
        </button>
      ),
      cellClassName: 'font-medium'
    },
    {
      id: 'category',
      label: 'Category',
      render: (workflow) => <Badge variant="outline">{workflow.category}</Badge>
    },
    {
      id: 'audience',
      label: 'Audience',
      render: (workflow) => (
        <div className="flex flex-wrap gap-1">
          {workflow.audience.slice(0, 2).map((aud) => (
            <Badge key={aud} variant="secondary" className="text-xs">
              {aud}
            </Badge>
          ))}
          {workflow.audience.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{workflow.audience.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      id: 'checklist',
      label: 'Checklist Items',
      render: (workflow) => (
        <Badge variant="outline" className="text-center">
          {workflow.manualChecklist.length}
        </Badge>
      )
    },
    {
      id: 'updated',
      label: 'Updated',
      render: (workflow) => (
        <span className="text-sm text-muted-foreground">
          {formatAdminDate(workflow.updatedAt)}
        </span>
      )
    }
  ];
}

