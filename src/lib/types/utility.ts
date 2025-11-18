/**
 * Shared Utility Types
 *
 * Common type utilities used across the application to improve type safety
 * and reduce code duplication.
 *
 * @module lib/types/utility
 */

/**
 * Makes specified keys of T required
 *
 * @example
 * type User = { id?: string; name?: string; email?: string };
 * type UserWithId = RequiredKeys<User, 'id'>; // { id: string; name?: string; email?: string }
 */
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Makes specified keys of T optional
 *
 * @example
 * type User = { id: string; name: string; email: string };
 * type PartialUser = OptionalKeys<User, 'email'>; // { id: string; name: string; email?: string }
 */
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes all nested properties of T optional
 *
 * @example
 * type Config = { db: { host: string; port: number } };
 * type PartialConfig = DeepPartial<Config>; // { db?: { host?: string; port?: number } }
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Makes all nested properties of T readonly
 *
 * @example
 * type Config = { db: { host: string } };
 * type ReadonlyConfig = DeepReadonly<Config>;
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Extracts keys from T that have values of type V
 *
 * @example
 * type User = { id: string; age: number; active: boolean };
 * type StringKeys = KeysOfType<User, string>; // 'id'
 */
export type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

/**
 * Creates a type with all properties of T except those that are functions
 *
 * @example
 * type Model = { id: string; getName: () => string };
 * type Data = NonFunctionKeys<Model>; // { id: string }
 */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
}[keyof T];

/**
 * Creates a type with only the function properties of T
 *
 * @example
 * type Model = { id: string; getName: () => string };
 * type Methods = FunctionKeys<Model>; // { getName: () => string }
 */
export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

/**
 * Promise that resolves to T
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Makes T nullable (T | null)
 */
export type Nullable<T> = T | null;

/**
 * Makes T maybe (T | undefined)
 */
export type Maybe<T> = T | undefined;

/**
 * Makes T optional (T | null | undefined)
 */
export type Optional<T> = T | null | undefined;

/**
 * Extracts the type of elements in an array
 *
 * @example
 * type Items = string[];
 * type Item = ArrayElement<Items>; // string
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

/**
 * Extracts the return type of a Promise
 *
 * @example
 * type Result = Awaited<Promise<string>>; // string
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Creates a union of all values in T
 *
 * @example
 * type Config = { dev: 'development'; prod: 'production' };
 * type Env = ValueOf<Config>; // 'development' | 'production'
 */
export type ValueOf<T> = T[keyof T];

/**
 * Creates a type that is either T or an array of T
 */
export type OneOrMany<T> = T | T[];

/**
 * Excludes null and undefined from T
 */
export type NonNullable<T> = Exclude<T, null | undefined>;

/**
 * Object with string keys and values of type T
 */
export type Dictionary<T = unknown> = Record<string, T>;

/**
 * Object that can have any string keys
 */
export type AnyObject = Dictionary<unknown>;

/**
 * JSON-serializable primitive types
 */
export type JSONPrimitive = string | number | boolean | null;

/**
 * JSON-serializable value
 */
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;

/**
 * JSON-serializable object
 */
export interface JSONObject {
  [key: string]: JSONValue;
}

/**
 * JSON-serializable array
 */
export interface JSONArray extends Array<JSONValue> {}

/**
 * Extracts constructor parameters
 */
export type ConstructorParameters<T> = T extends new (...args: infer P) => unknown ? P : never;

/**
 * Extracts instance type from constructor
 */
export type InstanceType<T> = T extends new (...args: unknown[]) => infer R ? R : never;

/**
 * Makes specified keys of T readonly
 */
export type ReadonlyKeys<T, K extends keyof T> = Omit<T, K> & Readonly<Pick<T, K>>;

/**
 * Makes specified keys of T writable (mutable)
 */
export type WritableKeys<T, K extends keyof T> = Omit<T, K> & {
  -readonly [P in K]: T[P];
};

/**
 * Pick properties from T that are assignable to U
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/**
 * Omit properties from T that are assignable to U
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

/**
 * ID type - can be string or number
 */
export type ID = string | number;

/**
 * Timestamp - ISO 8601 string or Date
 */
export type Timestamp = string | Date;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    totalPages: number;
  };
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams<T = string> {
  field: T;
  order: SortOrder;
}

/**
 * Filter operator
 */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

/**
 * Filter condition
 */
export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
}

/**
 * Result wrapper for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Async result wrapper
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Extract error type from Result
 */
export type ExtractError<T> = T extends Result<unknown, infer E> ? E : never;

/**
 * Extract data type from Result
 */
export type ExtractData<T> = T extends Result<infer D, unknown> ? D : never;

/**
 * Brand type for creating nominal types
 *
 * @example
 * type UserId = Brand<string, 'UserId'>;
 * type ProductId = Brand<string, 'ProductId'>;
 *
 * const userId: UserId = 'user-123' as UserId;
 * const productId: ProductId = 'prod-456' as ProductId;
 * // userId and productId are not assignable to each other
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Opaque type for creating nominal types
 */
export type Opaque<T, K> = T & { readonly __opaque: K };

/**
 * Merge two types, with properties from B overriding properties from A
 */
export type Merge<A, B> = Omit<A, keyof B> & B;

/**
 * Strict extract - ensures all values in U exist in T
 */
export type StrictExtract<T, U extends T> = Extract<T, U>;

/**
 * Strict exclude - ensures all values in U exist in T
 */
export type StrictExclude<T, U extends T> = Exclude<T, U>;

/**
 * Create a type with readonly properties
 */
export type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K];
};

/**
 * Create a type with mutable properties
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K];
};
