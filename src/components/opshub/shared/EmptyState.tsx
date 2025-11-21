import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { ReactNode } from 'react';

/**
 * @interface EmptyStateProps
 */
interface EmptyStateProps {
  title: string;
  description: string | ReactNode;
  actions?: ReactNode;
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states in admin panels.
 * Provides a consistent way to show when no data is available.
 * 
 * @pattern EMPTY_STATE_COMPONENT
 * @principle DRY - Eliminates duplication of empty state markup
 * 
 * @features
 * - Info icon and blue-themed styling
 * - Title and description (supports ReactNode)
 * - Optional action buttons
 * - Responsive card layout
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   title="No Workflows Found"
 *   description="Create your first workflow to get started."
 *   actions={<Button onClick={handleCreate}>Create Workflow</Button>}
 * />
 * ```
 * 
 * @usage
 * Used in admin panels when data arrays are empty.
 * Provides user-friendly messaging and call-to-action options.
 * 
 * @see AdminEmptyState for a more feature-rich alternative
 * 
 * @function EmptyState
 */
export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Icons.info className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof description === 'string' ? (
          <p className="text-sm text-blue-600 dark:text-blue-300">{description}</p>
        ) : (
          description
        )}
        {actions && <div className="flex gap-2 mt-4">{actions}</div>}
      </CardContent>
    </Card>
  );
}

