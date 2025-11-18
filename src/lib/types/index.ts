/**
 * Centralized Type Exports
 *
 * Barrel export file for all shared types used across the application.
 *
 * @module lib/types
 */

// User types
export * from './user';

// Utility types
export * from './utility';

// Re-export commonly used utility types for convenience
export type {
  Nullable,
  Maybe,
  Optional,
  Awaitable,
  Dictionary,
  AnyObject,
  JSONValue,
  JSONObject,
  JSONArray,
  PaginatedResponse,
  PaginationParams,
  SortOrder,
  SortParams,
  Result,
  AsyncResult,
  ID,
  Timestamp,
} from './utility';
