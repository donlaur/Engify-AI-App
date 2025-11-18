'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AdminTableSkeletonProps {
  /**
   * Number of skeleton rows to display (excluding header)
   * @default 5
   */
  rows?: number;

  /**
   * Number of columns in the table
   * @default 6
   */
  columns?: number;

  /**
   * Whether to show a skeleton header row
   * @default true
   */
  showHeader?: boolean;
}

/**
 * AdminTableSkeleton Component
 *
 * A loading skeleton component that displays a table structure with animated skeleton bars.
 * Useful for displaying while table data is loading.
 *
 * @component
 * @example
 * ```tsx
 * import { AdminTableSkeleton } from '@/components/admin/shared/AdminTableSkeleton';
 *
 * export function UserManagementPanel() {
 *   const [loading, setLoading] = useState(true);
 *
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Users</CardTitle>
 *       </CardHeader>
 *       <CardContent>
 *         {loading ? (
 *           <AdminTableSkeleton rows={5} columns={6} showHeader={true} />
 *         ) : (
 *           <Table>
 *             {/* Your actual table content */}
 *           </Table>
 *         )}
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 */
export function AdminTableSkeleton({
  rows = 5,
  columns = 6,
  showHeader = true,
}: AdminTableSkeletonProps) {
  // Width variants for more realistic skeleton appearance
  const widthVariants = ['w-20', 'w-32', 'w-40', 'w-24', 'w-28', 'w-full'];

  // Generate column indices for rendering
  const columnIndices = Array.from({ length: columns }, (_, i) => i);

  return (
    <div className="overflow-x-auto rounded-md border bg-white dark:bg-gray-900">
      <Table>
        {/* Skeleton Header */}
        {showHeader && (
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              {columnIndices.map((colIndex) => (
                <TableHead key={`header-${colIndex}`}>
                  <Skeleton
                    className={`h-4 ${
                      widthVariants[colIndex % widthVariants.length]
                    }`}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        )}

        {/* Skeleton Body Rows */}
        <TableBody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <TableRow
              key={`row-${rowIndex}`}
              className="hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {columnIndices.map((colIndex) => (
                <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                  <Skeleton
                    className={`h-4 ${
                      widthVariants[(colIndex + rowIndex) % widthVariants.length]
                    }`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
