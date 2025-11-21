'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';

/**
 * Props for the AdminEmptyState component
 */
interface AdminEmptyStateProps {
  /** Optional icon to display at the top (defaults to Icons.inbox) */
  icon?: ReactNode;
  /** Title text displayed prominently */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional action button with label, onClick handler, and optional icon */
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

/**
 * AdminEmptyState - A reusable empty state component for admin panels
 *
 * Displays a centered empty state UI with icon, title, optional description,
 * and optional action button. Useful for displaying when no data is available.
 *
 * Features:
 * - Centered vertically and horizontally
 * - Customizable icon (defaults to inbox)
 * - Prominent title with proper typography
 * - Optional description with muted styling
 * - Optional action button with icon support
 * - Responsive spacing and sizing
 *
 * @example
 * // Basic empty state with default styling
 * ```tsx
 * <AdminEmptyState
 *   title="No items found"
 *   description="There are no items to display at this time."
 * />
 * ```
 *
 * @example
 * // Empty state with action button
 * ```tsx
 * <AdminEmptyState
 *   title="No workflows"
 *   description="Create your first workflow to get started."
 *   action={{
 *     label: "Create Workflow",
 *     onClick: () => handleCreateWorkflow(),
 *     icon: <Icons.add className="h-4 w-4" />
 *   }}
 * />
 * ```
 *
 * @example
 * // Custom icon
 * ```tsx
 * <AdminEmptyState
 *   icon={<Icons.search className="h-12 w-12 text-muted-foreground" />}
 *   title="No results found"
 *   description="Try adjusting your search filters."
 * />
 * ```
 *
 * @example
 * // Empty state with only title (minimal)
 * ```tsx
 * <AdminEmptyState title="Empty" />
 * ```
 */
export function AdminEmptyState({
  icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  // Use provided icon or default to inbox icon
  const displayIcon = icon || (
    <Icons.inbox className="h-12 w-12 text-muted-foreground" />
  );

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Icon - positioned at top */}
        <div className="flex justify-center">
          {displayIcon}
        </div>

        {/* Title - prominent and centered */}
        <h3 className="text-lg font-semibold text-foreground">
          {title}
        </h3>

        {/* Optional Description - muted styling */}
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}

        {/* Optional Action Button - with icon support */}
        {action && (
          <Button
            onClick={action.onClick}
            className="mt-2"
          >
            {action.icon && (
              <span className="mr-2 flex items-center">
                {action.icon}
              </span>
            )}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
