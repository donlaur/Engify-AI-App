'use client';

import { Button } from '@/components/ui/button';

/**
 * Props for the AdminPaginationControls component
 */
interface AdminPaginationControlsProps {
  /** Current active page number (1-indexed) */
  currentPage: number;
  /** Total number of pages available */
  totalPages: number;
  /** Total count of items across all pages */
  totalCount: number;
  /** Number of items displayed per page */
  pageSize: number;
  /** Callback function triggered when page changes */
  onPageChange: (page: number) => void;
  /** Name of the items being paginated (e.g., "prompts", "workflows", "pain points") */
  itemName: string;
  /** Optional CSS class name for custom styling */
  className?: string;
}

/**
 * AdminPaginationControls - A reusable pagination component for admin panels
 *
 * Provides a complete pagination UI with:
 * - First/Previous/Next/Last navigation buttons
 * - Smart page number display (max 5 buttons with windowing)
 * - Current range display (e.g., "Showing 1 to 100 of 287 prompts")
 * - Automatic button disabling based on current position
 *
 * @example
 * ```tsx
 * <AdminPaginationControls
 *   currentPage={currentPage}
 *   totalPages={totalPages}
 *   totalCount={totalCount}
 *   pageSize={pageSize}
 *   onPageChange={setCurrentPage}
 *   itemName="prompts"
 * />
 * ```
 */
export function AdminPaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  itemName,
  className,
}: AdminPaginationControlsProps) {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  // Calculate the range of items currently being displayed
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div
      className={`flex items-center justify-between border-t pt-4 ${className || ''}`}
    >
      {/* Current Range Display */}
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalCount} {itemName}
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          First
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        {/* Page Number Buttons - Smart Windowing Logic */}
        <div className="hidden items-center gap-1 sm:flex">
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum;

            // Smart page number calculation for windowing effect
            if (totalPages <= 5) {
              // Show all pages if 5 or fewer
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              // Show first 5 pages when near the start
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              // Show last 5 pages when near the end
              pageNum = totalPages - 4 + i;
            } else {
              // Show current page in middle with 2 pages on each side
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className="w-10"
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last
        </Button>
      </div>
    </div>
  );
}
