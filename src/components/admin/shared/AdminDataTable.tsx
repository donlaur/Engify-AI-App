'use client';

import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

/**
 * Column definition interface for AdminDataTable
 * Defines how each column should be rendered and behave
 *
 * @template T - The data type (must have _id field)
 */
export interface ColumnDef<T> {
  /** Unique identifier for the column */
  id: string;
  /** Display label for column header */
  label: string;
  /** Optional width class (e.g., "w-[300px]", "w-[80px]") */
  width?: string;
  /** Whether the column is sortable (future enhancement) */
  sortable?: boolean;
  /** Function to render cell content for this column */
  render: (item: T) => ReactNode;
  /** Optional className for header cell */
  headerClassName?: string;
  /** Optional className for body cells in this column */
  cellClassName?: string;
}

/**
 * Props interface for AdminDataTable component
 *
 * @template T - The data type (must have _id field)
 */
export interface AdminDataTableProps<T extends { _id: string }> {
  /** Array of data items to display */
  data: T[];
  /** Column definitions for the table */
  columns: ColumnDef<T>[];
  /** Loading state indicator */
  loading?: boolean;
  /** Message to display when no data is available */
  emptyMessage?: string;
  /** Custom icon/element to show in empty state */
  emptyIcon?: ReactNode;
  /** Optional callback when a row is clicked */
  onRowClick?: (item: T) => void;
  /** Optional function to render action buttons in the last column */
  renderRowActions?: (item: T) => ReactNode;
  /** Field name to use for status toggle (displays Switch in first column) */
  statusField?: keyof T;
  /** Callback when status toggle is changed */
  onStatusToggle?: (id: string, currentValue: any) => void;
}

/**
 * AdminDataTable - A generic, reusable data table component for admin panels
 *
 * This component eliminates 40-50% code duplication across admin panels by providing
 * a flexible, type-safe table with common features like status toggles, row actions,
 * loading states, and empty states.
 *
 * @template T - The data type, must extend `{ _id: string }`
 *
 * @example
 * // Basic usage with prompts
 * interface Prompt {
 *   _id: string;
 *   title: string;
 *   active: boolean;
 *   category: string;
 *   updatedAt: string;
 * }
 *
 * const columns: ColumnDef<Prompt>[] = [
 *   {
 *     id: 'title',
 *     label: 'Title',
 *     width: 'w-[300px]',
 *     render: (prompt) => (
 *       <button className="text-left hover:text-blue-600 hover:underline">
 *         {prompt.title}
 *       </button>
 *     ),
 *     cellClassName: 'font-medium'
 *   },
 *   {
 *     id: 'category',
 *     label: 'Category',
 *     render: (prompt) => <Badge variant="outline">{prompt.category}</Badge>
 *   },
 *   {
 *     id: 'updated',
 *     label: 'Updated',
 *     render: (prompt) => (
 *       <span className="text-sm text-muted-foreground">
 *         {formatDate(prompt.updatedAt)}
 *       </span>
 *     )
 *   }
 * ];
 *
 * <AdminDataTable
 *   data={prompts}
 *   columns={columns}
 *   loading={loading}
 *   statusField="active"
 *   onStatusToggle={handleToggleActive}
 *   renderRowActions={(prompt) => (
 *     <Button variant="ghost" size="sm" onClick={() => handleView(prompt)}>
 *       <Icons.eye className="h-4 w-4" />
 *     </Button>
 *   )}
 *   emptyMessage="No prompts found"
 * />
 *
 * @example
 * // Without status toggle, with custom empty state
 * <AdminDataTable
 *   data={workflows}
 *   columns={workflowColumns}
 *   loading={loading}
 *   onRowClick={handleRowClick}
 *   emptyMessage="No workflows available"
 *   emptyIcon={<Icons.inbox className="h-12 w-12 text-gray-400 mb-4" />}
 * />
 *
 * @example
 * // Minimal usage (no actions, no status)
 * <AdminDataTable
 *   data={items}
 *   columns={columns}
 * />
 */
export function AdminDataTable<T extends { _id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  onRowClick,
  renderRowActions,
  statusField,
  onStatusToggle,
}: AdminDataTableProps<T>) {
  // Show loading state
  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading data...
      </div>
    );
  }

  // Show empty state
  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        {emptyIcon && <div className="flex justify-center mb-4">{emptyIcon}</div>}
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Determine if we need status or actions columns
  const hasStatusColumn = statusField && onStatusToggle;
  const hasActionsColumn = renderRowActions !== undefined;

  return (
    <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            {/* Status Column Header */}
            {hasStatusColumn && (
              <TableHead className="w-[80px] font-semibold">Status</TableHead>
            )}

            {/* Dynamic Column Headers */}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={`font-semibold ${column.width || ''} ${
                  column.headerClassName || ''
                }`}
              >
                {column.label}
              </TableHead>
            ))}

            {/* Actions Column Header */}
            {hasActionsColumn && (
              <TableHead className="text-right font-semibold">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item._id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={
                onRowClick
                  ? (e) => {
                      // Don't trigger row click if clicking on interactive elements
                      const target = e.target as HTMLElement;
                      if (
                        target.tagName === 'BUTTON' ||
                        target.closest('button') ||
                        target.closest('[role="switch"]')
                      ) {
                        return;
                      }
                      onRowClick(item);
                    }
                  : undefined
              }
            >
              {/* Status Toggle Cell */}
              {hasStatusColumn && statusField && onStatusToggle && (
                <TableCell>
                  <Switch
                    checked={Boolean(item[statusField])}
                    onCheckedChange={() =>
                      onStatusToggle(item._id, item[statusField])
                    }
                  />
                </TableCell>
              )}

              {/* Dynamic Data Cells */}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={column.cellClassName || ''}
                >
                  {column.render(item)}
                </TableCell>
              ))}

              {/* Actions Cell */}
              {hasActionsColumn && renderRowActions && (
                <TableCell className="text-right">
                  {renderRowActions(item)}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Type utility to extract data type from AdminDataTable props
 * Useful for creating strongly-typed helper functions
 *
 * @example
 * type MyData = ExtractDataType<typeof myTableProps>;
 */
export type ExtractDataType<T> = T extends AdminDataTableProps<infer U>
  ? U
  : never;
