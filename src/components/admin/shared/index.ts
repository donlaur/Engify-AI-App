/**
 * Admin Shared Components
 * Barrel export file for cleaner imports
 *
 * Usage:
 * import {
 *   AdminDataTable,
 *   AdminErrorBoundary,
 *   AdminErrorFallback,
 *   AdminEmptyState,
 *   AdminTableSkeleton,
 *   AdminPaginationControls,
 *   AdminStatsCard,
 * } from '@/components/admin/shared';
 */

// Data display components
export { AdminDataTable } from './AdminDataTable';
export { AdminTableSkeleton } from './AdminTableSkeleton';
export { AdminPaginationControls } from './AdminPaginationControls';
export { AdminStatsCard } from './AdminStatsCard';

// Error and empty state components
export { AdminErrorBoundary } from './AdminErrorBoundary';
export { AdminErrorFallback } from './AdminErrorFallback';
export { AdminEmptyState } from './AdminEmptyState';
