/**
 * LibraryPageSkeleton Component
 *
 * Skeleton state for the entire Library page
 * Shows structure while content loads
 */

import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonCard } from './SkeletonCard';

export function LibraryPageSkeleton() {
  return (
    <div className="container py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-2 h-12 w-64" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <Skeleton className="h-10 w-full" />

        {/* Category Filter */}
        <div>
          <Skeleton className="mb-2 h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`cat-${i}`} className="h-8 w-24" />
            ))}
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <Skeleton className="mb-2 h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`role-${i}`} className="h-8 w-28" />
            ))}
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
