/**
 * Application Types
 * Barrel export file for cleaner imports of all type definitions
 *
 * Usage:
 * import type { Role, Persona, WorkbenchTool } from '@/types';
 */

// Workbench types
export type { WorkbenchToolId, WorkbenchTool } from './workbench';
export { WORKBENCH_TOOLS } from './workbench';

// Persona types
export type {
  Role,
  ExperienceLevel,
  Persona,
  ImpersonationMode,
} from './persona';

// Admin hook types (re-exported for convenience)
export type {
  AdminDataItem,
  PaginationMeta,
  FilterConfig,
  UseAdminDataConfig,
  ToastVariant,
  ToastOptions,
  UseAdminToastReturn,
} from '@/hooks/admin';
