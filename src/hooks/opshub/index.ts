/**
 * Admin Hooks
 * Barrel export file for cleaner imports of admin-related hooks and types
 *
 * Usage:
 * import { useAdminData, useAdminToast, useDebouncedValue } from '@/hooks/opshub';
 * import type { AdminDataItem, PaginationMeta, ToastVariant } from '@/hooks/opshub';
 */

// useAdminData hook and types
export { useAdminData } from './useAdminData';
export type {
  AdminDataItem,
  PaginationMeta,
  FilterConfig,
  UseAdminDataConfig,
} from './useAdminData';

// useAdminToast hook and types
export { useAdminToast } from './useAdminToast';
export type {
  ToastVariant,
  ToastOptions,
  UseAdminToastReturn,
} from './useAdminToast';

// useDebouncedValue hook
export { useDebouncedValue } from './useDebouncedValue';
