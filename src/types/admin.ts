/**
 * Centralized admin type definitions for OpsHub management panels
 *
 * This file provides a unified set of types used across all admin panels including:
 * - Prompt Management
 * - Workflow Management
 * - Pattern Management
 * - Pain Point Management
 * - Recommendation Management
 * - And other admin data management panels
 *
 * @module types/admin
 */

// ============================================================================
// Base Interfaces
// ============================================================================

/**
 * Base interface for all admin entities
 *
 * All admin data entities that interact with the database should extend this
 * interface to ensure consistent metadata tracking.
 *
 * @example
 * ```typescript
 * interface Prompt extends AdminEntity {
 *   title: string;
 *   content: string;
 *   category: string;
 * }
 * ```
 */
export interface AdminEntity {
  /** Unique MongoDB ObjectId for the entity */
  _id: string;
  /** ISO 8601 timestamp when entity was created */
  createdAt: string;
  /** ISO 8601 timestamp when entity was last updated */
  updatedAt: string;
}

/**
 * Status values for admin entities
 *
 * Used for workflow status, prompt visibility, pattern approval, etc.
 * Represents the lifecycle state of content items.
 *
 * @example
 * ```typescript
 * const filter = { status: 'published' as AdminStatus };
 * ```
 */
export type AdminStatus = 'draft' | 'published' | 'archived' | 'coming_soon';

/**
 * Priority levels for admin entities
 *
 * Used for ranking, sorting, and filtering high-impact items.
 * Helps identify critical content that needs attention.
 *
 * @example
 * ```typescript
 * const priorityFilter = { priority: 'high' as AdminPriority };
 * ```
 */
export type AdminPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Category classification for admin entities
 *
 * Broad categorization of content types used for organization and filtering.
 * Aligns with workflow categories from workflow-schema.
 *
 * @example
 * ```typescript
 * const categories: AdminCategory[] = ['ai-behavior', 'security'];
 * ```
 */
export type AdminCategory =
  | 'ai-behavior'
  | 'code-quality'
  | 'communication'
  | 'community'
  | 'enablement'
  | 'governance'
  | 'guardrails'
  | 'memory'
  | 'process'
  | 'risk-management'
  | 'security';

// ============================================================================
// Generic Interfaces for API Responses
// ============================================================================

/**
 * Pagination metadata returned from admin API endpoints
 *
 * Provides comprehensive pagination information for managing large datasets
 * in admin panels with proper navigation and state management.
 *
 * @example
 * ```typescript
 * const { pagination } = await fetch('/api/admin/prompts?page=1&limit=50').then(r => r.json());
 * console.log(`Showing page ${pagination.page} of ${pagination.totalPages}`);
 * ```
 */
export interface AdminPaginationMeta {
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Total count of all items across all pages */
  total: number;
  /** Total number of pages available */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Generic pagination wrapper for admin data
 *
 * Wraps any data type with pagination metadata for consistent response handling.
 * Used in the useAdminData hook return value.
 *
 * @template T - The type of individual items in the paginated dataset
 *
 * @example
 * ```typescript
 * interface Prompt extends AdminEntity { ... }
 * type PaginatedPrompts = AdminPaginationResponse<Prompt>;
 * ```
 */
export interface AdminPaginationResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Pagination metadata */
  pagination: AdminPaginationMeta;
}

/**
 * Standard API response format for admin endpoints
 *
 * All admin API endpoints should conform to this structure for consistent
 * client-side handling and error management.
 *
 * @example
 * ```typescript
 * interface Workflow extends AdminEntity { ... }
 * const response: AdminApiResponse = {
 *   success: true,
 *   pagination: { page: 1, limit: 50, total: 100, ... },
 *   workflows: [ ... ]  // dynamic key based on entity type
 * };
 * ```
 */
export interface AdminApiResponse {
  /** Whether the API call was successful */
  success: boolean;
  /** Optional error message if success is false */
  error?: string;
  /** Optional pagination information */
  pagination?: AdminPaginationMeta;
  /** Dynamic data key - the actual entity array key (e.g., 'prompts', 'workflows') */
  [key: string]: any;
}

// ============================================================================
// Filter and Sort Configuration
// ============================================================================

/**
 * Filter configuration for admin data queries
 *
 * Flexible key-value structure for passing filter parameters to API endpoints.
 * Supports multiple filter types: strings, numbers, booleans.
 *
 * @example
 * ```typescript
 * const filters: AdminFilterConfig = {
 *   category: 'security',
 *   status: 'published',
 *   priority: 'high'
 * };
 * ```
 */
export interface AdminFilterConfig {
  /** Allow any string, number, or boolean value for flexible filtering */
  [key: string]: string | number | boolean | undefined;
}

/**
 * Sort configuration for admin data queries
 *
 * Specifies field name and sort direction for ordering results.
 * Used with the useAdminData hook for sortable columns.
 *
 * @example
 * ```typescript
 * const sort: AdminSortConfig = {
 *   field: 'updatedAt',
 *   direction: 'desc'
 * };
 * ```
 */
export interface AdminSortConfig {
  /** The field name to sort by */
  field: string;
  /** Sort direction: ascending or descending */
  direction: 'asc' | 'desc';
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Error type enumeration for admin operations
 *
 * Categorizes different error scenarios for specific error handling strategies.
 * Used with AdminError for robust error management.
 *
 * @example
 * ```typescript
 * if (error.type === AdminErrorType.VALIDATION_ERROR) {
 *   showValidationErrorToast(error.message);
 * }
 * ```
 */
export enum AdminErrorType {
  /** Validation failed for input data */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Network request failed */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** User not authorized for this operation */
  UNAUTHORIZED = 'UNAUTHORIZED',
  /** User not authenticated */
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  /** Resource not found */
  NOT_FOUND = 'NOT_FOUND',
  /** Conflict with existing data (e.g., duplicate entry) */
  CONFLICT = 'CONFLICT',
  /** Server-side error */
  SERVER_ERROR = 'SERVER_ERROR',
  /** Unknown error type */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Admin operation error interface
 *
 * Structured error representation for admin panel operations.
 * Provides detailed error information for proper error handling and user feedback.
 *
 * @example
 * ```typescript
 * const error: AdminError = {
 *   type: AdminErrorType.VALIDATION_ERROR,
 *   message: 'Title is required',
 *   statusCode: 400,
 *   details: { field: 'title', reason: 'empty' }
 * };
 * ```
 */
export interface AdminError {
  /** Type of error that occurred */
  type: AdminErrorType;
  /** User-friendly error message */
  message: string;
  /** HTTP status code if from API response */
  statusCode?: number;
  /** Additional error context or validation details */
  details?: Record<string, any>;
  /** Original error object if available */
  originalError?: Error;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Adds admin metadata fields to any type
 *
 * Utility type for extending existing interfaces with standard admin fields
 * without modifying the original interface definition.
 *
 * @template T - The base type to extend with metadata
 *
 * @example
 * ```typescript
 * interface WorkflowData {
 *   title: string;
 *   category: string;
 * }
 *
 * type WorkflowWithMeta = WithMetadata<WorkflowData>;
 * // Results in: { title: string; category: string; _id: string; createdAt: string; updatedAt: string; }
 * ```
 */
export type WithMetadata<T> = T & {
  /** Unique MongoDB ObjectId */
  _id: string;
  /** ISO 8601 creation timestamp */
  createdAt: string;
  /** ISO 8601 update timestamp */
  updatedAt: string;
};

/**
 * Wraps a data type with pagination information
 *
 * Utility type for paginated data responses from hooks or API calls.
 * Simplifies type declarations for paginated datasets.
 *
 * @template T - The type of individual items in the paginated set
 *
 * @example
 * ```typescript
 * type PaginatedWorkflows = Paginated<Workflow>;
 * const result: PaginatedWorkflows = {
 *   items: [workflow1, workflow2],
 *   pagination: { page: 1, limit: 50, total: 100, totalPages: 2, hasNext: true, hasPrev: false }
 * };
 * ```
 */
export type Paginated<T> = {
  /** Array of paginated items */
  items: T[];
  /** Pagination metadata */
  pagination: AdminPaginationMeta;
};

// ============================================================================
// Hook Configuration Types
// ============================================================================

/**
 * Configuration options for the useAdminData hook
 *
 * Provides comprehensive customization for the admin data management hook.
 * All options are optional for maximum flexibility.
 *
 * @example
 * ```typescript
 * const config: AdminDataHookConfig = {
 *   endpoint: '/api/admin/prompts',
 *   pageSize: 50,
 *   initialFilters: { status: 'published' },
 *   dataKey: 'prompts',
 *   autoFetch: true
 * };
 * ```
 */
export interface AdminDataHookConfig {
  /** API endpoint path (e.g., '/api/admin/prompts') - REQUIRED */
  endpoint: string;
  /** Number of items per page (default: 50, max: 100) */
  pageSize?: number;
  /** Initial filter values to apply on mount */
  initialFilters?: AdminFilterConfig;
  /** Data key in the API response (e.g., 'prompts', 'workflows') */
  dataKey?: string;
  /** Enable auto-fetch on mount and when filters change (default: true) */
  autoFetch?: boolean;
}

/**
 * Return value from the useAdminData hook
 *
 * Comprehensive hook return interface providing data, loading states, and methods
 * for pagination, filtering, and search operations.
 *
 * @template T - Data item type extending AdminEntity
 *
 * @example
 * ```typescript
 * const {
 *   data: prompts,
 *   loading,
 *   error,
 *   currentPage,
 *   totalPages,
 *   setFilters,
 *   setSearchTerm,
 *   refresh
 * } = useAdminData<Prompt>({
 *   endpoint: '/api/admin/prompts',
 *   pageSize: 50
 * });
 * ```
 */
export interface AdminDataHookReturn<T extends AdminEntity> {
  // Data State
  /** Array of data items for the current page */
  data: T[];
  /** Loading state indicator */
  loading: boolean;
  /** Error message if fetch failed, null otherwise */
  error: string | null;

  // Pagination State
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of available pages */
  totalPages: number;
  /** Total count of items across all pages */
  totalCount: number;
  /** Number of items per page */
  pageSize: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;

  // Filter and Search State
  /** Current filter configuration */
  filters: AdminFilterConfig;
  /** Current search term for text-based filtering */
  searchTerm: string;

  // Pagination Methods
  /** Navigate to the next page */
  nextPage: () => void;
  /** Navigate to the previous page */
  prevPage: () => void;
  /** Navigate to a specific page (1-indexed) */
  goToPage: (page: number) => void;

  // Filter and Search Methods
  /** Update filter values (merges with existing filters, resets to page 1) */
  setFilters: (filters: AdminFilterConfig) => void;
  /** Clear all filters and reset to initial state */
  clearFilters: () => void;
  /** Update search term (resets to page 1) */
  setSearchTerm: (term: string) => void;

  // Data Refresh
  /** Manually refresh data (re-fetches current page) */
  refresh: () => Promise<void>;
}

// ============================================================================
// Stats and Analytics Types
// ============================================================================

/**
 * Statistics configuration for admin panels
 *
 * Defines how to calculate a specific statistic from admin data.
 * Used with the calculateStats utility function.
 *
 * @template T - The type of items being analyzed
 *
 * @example
 * ```typescript
 * const statConfigs: AdminStatConfig<Prompt>[] = [
 *   { key: 'total', calculate: (items) => items.length },
 *   { key: 'active', calculate: (items) => items.filter(p => p.active).length },
 *   { key: 'verified', calculate: (items) => items.filter(p => p.verified).length }
 * ];
 * ```
 */
export interface AdminStatConfig<T = any> {
  /** Key for the statistic in the result object */
  key: string;
  /** Function to calculate the statistic value from items array */
  calculate: (items: T[]) => number;
}

/**
 * Admin panel statistics result object
 *
 * Dynamic object containing calculated statistics with string keys
 * and numeric values.
 *
 * @example
 * ```typescript
 * const stats: AdminStats = {
 *   total: 100,
 *   active: 85,
 *   verified: 72,
 *   unscored: 28
 * };
 * ```
 */
export interface AdminStats {
  /** Dynamic key-value pairs for various statistics */
  [key: string]: number;
}

// ============================================================================
// Quality Score Types
// ============================================================================

/**
 * Quality score structure for content items
 *
 * Provides detailed scoring for various quality dimensions.
 * Used in Prompt and other content management panels.
 *
 * @example
 * ```typescript
 * const score: AdminQualityScore = {
 *   overall: 8.5,
 *   clarity: 9,
 *   usefulness: 8,
 *   specificity: 8.5,
 *   completeness: 8,
 *   examples: 8,
 *   reviewedBy: 'reviewer@example.com',
 *   reviewedAt: new Date().toISOString(),
 *   notes: 'Great prompt with minor improvements needed'
 * };
 * ```
 */
export interface AdminQualityScore {
  /** Overall quality score (0-10) */
  overall: number;
  /** Clarity of content (0-10) */
  clarity?: number;
  /** Usefulness for target audience (0-10) */
  usefulness?: number;
  /** Specificity and precision (0-10) */
  specificity?: number;
  /** Completeness of information (0-10) */
  completeness?: number;
  /** Quality and relevance of examples (0-10) */
  examples?: number;
  /** Email of the reviewer */
  reviewedBy?: string;
  /** ISO 8601 timestamp of the review */
  reviewedAt?: string;
  /** Additional notes from the reviewer */
  notes?: string;
}

// ============================================================================
// Bulk Operation Types
// ============================================================================

/**
 * Bulk operation request for admin entities
 *
 * Supports batch operations on multiple items with a single API call.
 * Used for operations like bulk delete, status change, or tagging.
 *
 * @template T - The type of operation-specific payload
 *
 * @example
 * ```typescript
 * const bulkOp: AdminBulkOperation<{ status: string }> = {
 *   operation: 'update_status',
 *   ids: ['id1', 'id2', 'id3'],
 *   payload: { status: 'published' }
 * };
 * ```
 */
export interface AdminBulkOperation<T = any> {
  /** Type of operation to perform */
  operation: 'delete' | 'update_status' | 'update_field' | 'archive' | 'publish';
  /** Array of entity IDs to operate on */
  ids: string[];
  /** Operation-specific payload data */
  payload?: T;
}

/**
 * Response from a bulk operation
 *
 * Provides detailed feedback on bulk operation results including success count,
 * failed items, and detailed error information.
 *
 * @example
 * ```typescript
 * const result: AdminBulkOperationResult = {
 *   success: true,
 *   totalProcessed: 10,
 *   successCount: 9,
 *   failureCount: 1,
 *   failedIds: ['id3'],
 *   errors: { id3: 'Conflict with existing data' }
 * };
 * ```
 */
export interface AdminBulkOperationResult {
  /** Whether the bulk operation succeeded overall */
  success: boolean;
  /** Total number of items processed */
  totalProcessed: number;
  /** Number of items successfully processed */
  successCount: number;
  /** Number of items that failed */
  failureCount: number;
  /** Array of IDs that failed */
  failedIds: string[];
  /** Detailed error messages keyed by ID */
  errors: Record<string, string>;
}

// ============================================================================
// Exports Summary
// ============================================================================

/**
 * Type exports organized by category:
 *
 * Base Interfaces:
 * - AdminEntity
 * - AdminStatus, AdminPriority, AdminCategory (type unions)
 *
 * API Response Types:
 * - AdminPaginationMeta
 * - AdminPaginationResponse<T>
 * - AdminApiResponse
 *
 * Configuration Types:
 * - AdminFilterConfig
 * - AdminSortConfig
 * - AdminDataHookConfig
 *
 * Error Types:
 * - AdminErrorType (enum)
 * - AdminError
 *
 * Utility Types:
 * - WithMetadata<T>
 * - Paginated<T>
 *
 * Hook Types:
 * - AdminDataHookReturn<T>
 *
 * Statistics Types:
 * - AdminStatConfig<T>
 * - AdminStats
 *
 * Quality Types:
 * - AdminQualityScore
 *
 * Bulk Operation Types:
 * - AdminBulkOperation<T>
 * - AdminBulkOperationResult
 */
