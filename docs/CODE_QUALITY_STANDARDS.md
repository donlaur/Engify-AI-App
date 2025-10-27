# Code Quality Standards - Senior Developer Practices

**Mission**: Write code like a Staff/Principal Engineer—DRY, type-safe, maintainable, and elegant.

---

## 🎯 Core Principles

### 1. DRY (Don't Repeat Yourself)
- If you write the same code twice, extract it
- Use base classes, helper functions, and middleware
- Share logic through composition, not duplication

### 2. Type Safety
- No `any` types (TypeScript strict mode)
- Validate all external data (Zod schemas)
- Type database schemas explicitly

### 3. Schema as Source of Truth
- Database schema defines types
- Generate TypeScript types from schema
- Prevent schema drift with validation

### 4. Safe Array Operations
- Always check array exists and has length
- Use optional chaining and nullish coalescing
- Validate array contents with Zod

### 5. Abstraction Layers
- Base services for common operations
- Middleware for cross-cutting concerns
- Helper functions for repeated logic

---

## 📊 Schema Management

### Single Source of Truth

```typescript
// src/lib/db/schema.ts
import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Database Schema Definitions
 * 
 * This is the SINGLE SOURCE OF TRUTH for all database schemas.
 * - TypeScript types are derived from Zod schemas
 * - Runtime validation uses Zod schemas
 * - Database queries use these types
 * 
 * NEVER define types separately from schemas.
 */

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export const OrganizationSchema = z.object({
  _id: z.instanceof(ObjectId),
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  domain: z.string().optional(),
  plan: z.enum(['free', 'pro', 'team', 'enterprise_starter', 'enterprise_pro', 'enterprise_premium']),
  status: z.enum(['active', 'trial', 'suspended', 'canceled']),
  
  billing: z.object({
    stripeCustomerId: z.string().optional(),
    contractStart: z.date().optional(),
    contractEnd: z.date().optional(),
    seats: z.number().int().positive(),
    usedSeats: z.number().int().nonnegative(),
  }),
  
  sso: z.object({
    enabled: z.boolean(),
    provider: z.enum(['okta', 'azure_ad', 'google_workspace']).optional(),
    samlMetadataUrl: z.string().url().optional(),
  }).optional(),
  
  settings: z.object({
    allowedDomains: z.array(z.string()).default([]),
    dataRetention: z.number().int().positive().default(90),
    auditLogRetention: z.number().int().positive().default(365),
  }),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Derive TypeScript type from Zod schema
export type Organization = z.infer<typeof OrganizationSchema>;

// Partial schema for inserts (without _id, dates)
export const OrganizationInsertSchema = OrganizationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrganizationInsert = z.infer<typeof OrganizationInsertSchema>;

// ============================================================================
// USERS
// ============================================================================

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId),
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  image: z.string().url().optional(),
  
  // Multi-tenant
  organizationId: z.instanceof(ObjectId).nullable(),
  role: z.enum(['member', 'manager', 'admin', 'owner']).default('member'),
  jobRole: z.enum(['engineer', 'senior_engineer', 'staff_engineer', 'manager', 'director', 'vp']).optional(),
  department: z.string().max(100).optional(),
  
  // Authentication
  password: z.string().optional(), // Hashed, only for email/password auth
  emailVerified: z.date().nullable(),
  
  // Settings
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    defaultProvider: z.enum(['gemini', 'openai', 'anthropic']).default('gemini'),
    notifications: z.object({
      email: z.boolean().default(true),
      usage: z.boolean().default(true),
      billing: z.boolean().default(true),
    }).default({}),
  }).default({}),
  
  // Usage tracking
  usage: z.object({
    totalPrompts: z.number().int().nonnegative().default(0),
    totalTokens: z.number().int().nonnegative().default(0),
    lastActive: z.date().optional(),
  }).default({}),
  
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const UserInsertSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserInsert = z.infer<typeof UserInsertSchema>;

// ============================================================================
// CONVERSATIONS
// ============================================================================

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.date(),
  provider: z.enum(['gemini', 'openai', 'anthropic']).optional(),
  tokens: z.number().int().nonnegative().optional(),
  cost: z.number().nonnegative().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  _id: z.instanceof(ObjectId),
  userId: z.instanceof(ObjectId),
  organizationId: z.instanceof(ObjectId).nullable(),
  
  title: z.string().min(1).max(200),
  
  // Sharing
  visibility: z.enum(['private', 'team', 'organization']).default('private'),
  sharedWith: z.array(z.instanceof(ObjectId)).default([]),
  
  messages: z.array(MessageSchema).default([]),
  
  metadata: z.object({
    tool: z.string().optional(),
    templateId: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }).default({}),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export const ConversationInsertSchema = ConversationSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type ConversationInsert = z.infer<typeof ConversationInsertSchema>;

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

export const PromptTemplateSchema = z.object({
  _id: z.instanceof(ObjectId),
  
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  content: z.string().min(1),
  
  category: z.string(),
  role: z.enum(['junior_engineer', 'mid_engineer', 'senior_engineer', 'staff_engineer', 'manager', 'director', 'vp', 'pm']),
  
  tags: z.array(z.string()).default([]),
  
  // Usage tracking
  usageCount: z.number().int().nonnegative().default(0),
  rating: z.object({
    average: z.number().min(0).max(5).default(0),
    count: z.number().int().nonnegative().default(0),
  }).default({}),
  
  // Ownership
  isPublic: z.boolean().default(true),
  organizationId: z.instanceof(ObjectId).nullable(),
  createdBy: z.instanceof(ObjectId),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export const PromptTemplateInsertSchema = PromptTemplateSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});

export type PromptTemplateInsert = z.infer<typeof PromptTemplateInsertSchema>;

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const AuditLogSchema = z.object({
  _id: z.instanceof(ObjectId),
  organizationId: z.instanceof(ObjectId).nullable(),
  userId: z.instanceof(ObjectId),
  
  action: z.string(), // 'user.login', 'prompt.executed', 'settings.changed'
  resource: z.string(), // 'user', 'conversation', 'settings'
  resourceId: z.instanceof(ObjectId).optional(),
  
  details: z.record(z.unknown()).default({}),
  
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  
  timestamp: z.date(),
  retainUntil: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

export const AuditLogInsertSchema = AuditLogSchema.omit({
  _id: true,
});

export type AuditLogInsert = z.infer<typeof AuditLogInsertSchema>;

// ============================================================================
// SCHEMA VALIDATION
// ============================================================================

/**
 * Validate data against schema
 * Throws error if validation fails
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.message}`);
  }
  
  return result.data;
}

/**
 * Validate data against schema (safe version)
 * Returns null if validation fails
 */
export function validateSchemaSafe<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
}
```

---

## 🏗️ Base Service Pattern

### Abstract Base Service

```typescript
// src/lib/services/BaseService.ts
import { Db, Collection, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/lib/db/mongodb';

/**
 * Base Service Class
 * 
 * Provides common CRUD operations for all services.
 * Extend this class for specific collections.
 * 
 * Benefits:
 * - DRY: Common logic in one place
 * - Type-safe: Generic types ensure correctness
 * - Consistent: All services use same patterns
 * - Testable: Easy to mock and test
 */
export abstract class BaseService<T extends { _id: ObjectId }> {
  protected db: Db | null = null;
  protected collection: Collection<T> | null = null;
  
  constructor(
    protected collectionName: string,
    protected schema: z.ZodSchema<T>
  ) {}
  
  /**
   * Get database connection
   * Lazy initialization
   */
  protected async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await getDb();
    }
    return this.db;
  }
  
  /**
   * Get collection
   * Lazy initialization
   */
  protected async getCollection(): Promise<Collection<T>> {
    if (!this.collection) {
      const db = await this.getDb();
      this.collection = db.collection<T>(this.collectionName);
    }
    return this.collection;
  }
  
  /**
   * Validate data against schema
   */
  protected validate(data: unknown): T {
    const result = this.schema.safeParse(data);
    
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    
    return result.data;
  }
  
  /**
   * Find one document by ID
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const doc = await collection.findOne({ _id: objectId } as Filter<T>);
    return doc;
  }
  
  /**
   * Find multiple documents
   */
  async find(filter: Filter<T> = {}): Promise<T[]> {
    const collection = await this.getCollection();
    return collection.find(filter).toArray();
  }
  
  /**
   * Find one document
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    const collection = await this.getCollection();
    return collection.findOne(filter);
  }
  
  /**
   * Insert one document
   */
  async insertOne(data: Omit<T, '_id'>): Promise<T> {
    const collection = await this.getCollection();
    
    const doc = {
      ...data,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as T;
    
    await collection.insertOne(doc);
    return doc;
  }
  
  /**
   * Update one document
   */
  async updateOne(
    id: string | ObjectId,
    update: UpdateFilter<T>
  ): Promise<T | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId } as Filter<T>,
      {
        ...update,
        $set: {
          ...update.$set,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    
    return result.value;
  }
  
  /**
   * Delete one document
   */
  async deleteOne(id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
    return result.deletedCount > 0;
  }
  
  /**
   * Count documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = await this.getCollection();
    return collection.countDocuments(filter);
  }
}
```

### Concrete Service Example

```typescript
// src/lib/services/UserService.ts
import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { User, UserSchema, UserInsert } from '@/lib/db/schema';
import { hash } from 'bcryptjs';

/**
 * User Service
 * 
 * Extends BaseService with user-specific operations.
 * Inherits all CRUD operations from BaseService.
 */
export class UserService extends BaseService<User> {
  constructor() {
    super('users', UserSchema);
  }
  
  /**
   * Find user by email
   * ALWAYS includes organizationId for data isolation
   */
  async findByEmail(
    email: string,
    organizationId: string | ObjectId | null
  ): Promise<User | null> {
    return this.findOne({
      email,
      organizationId: organizationId ? new ObjectId(organizationId) : null,
    });
  }
  
  /**
   * Find users in organization
   * CRITICAL: Always includes organizationId for data isolation
   */
  async findByOrganization(organizationId: string | ObjectId): Promise<User[]> {
    const orgId = typeof organizationId === 'string' ? new ObjectId(organizationId) : organizationId;
    
    return this.find({
      organizationId: orgId,
    });
  }
  
  /**
   * Create user with hashed password
   */
  async createWithPassword(
    data: Omit<UserInsert, 'password'> & { password: string }
  ): Promise<User> {
    // Hash password
    const hashedPassword = await hash(data.password, 12);
    
    // Create user
    return this.insertOne({
      ...data,
      password: hashedPassword,
    } as Omit<User, '_id'>);
  }
  
  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string | ObjectId): Promise<void> {
    await this.updateOne(userId, {
      $set: {
        lastLoginAt: new Date(),
      },
    });
  }
  
  /**
   * Increment usage counters
   */
  async incrementUsage(
    userId: string | ObjectId,
    prompts: number = 1,
    tokens: number = 0
  ): Promise<void> {
    await this.updateOne(userId, {
      $inc: {
        'usage.totalPrompts': prompts,
        'usage.totalTokens': tokens,
      },
      $set: {
        'usage.lastActive': new Date(),
      },
    });
  }
}

// Export singleton instance
export const userService = new UserService();
```

---

## 🛡️ Safe Array Operations

### Helper Functions

```typescript
// src/lib/utils/array.ts

/**
 * Safe array operations
 * 
 * Always check array exists and has length before operating.
 * Use these helpers instead of direct array operations.
 */

/**
 * Check if array exists and has items
 */
export function hasItems<T>(arr: T[] | null | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Get first item safely
 */
export function first<T>(arr: T[] | null | undefined): T | null {
  return hasItems(arr) ? arr[0] : null;
}

/**
 * Get last item safely
 */
export function last<T>(arr: T[] | null | undefined): T | null {
  return hasItems(arr) ? arr[arr.length - 1] : null;
}

/**
 * Map array safely (returns empty array if input is null/undefined)
 */
export function safeMap<T, U>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  return hasItems(arr) ? arr.map(fn) : [];
}

/**
 * Filter array safely
 */
export function safeFilter<T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T[] {
  return hasItems(arr) ? arr.filter(fn) : [];
}

/**
 * Find item safely
 */
export function safeFind<T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T | null {
  return hasItems(arr) ? arr.find(fn) ?? null : null;
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (!hasItems(arr) || size <= 0) {
    return [];
  }
  
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function unique<T>(arr: T[]): T[] {
  return hasItems(arr) ? Array.from(new Set(arr)) : [];
}

/**
 * Group array by key
 */
export function groupBy<T>(
  arr: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  if (!hasItems(arr)) {
    return {};
  }
  
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
```

### Usage Examples

```typescript
// ❌ WRONG - Unsafe array operations
const firstUser = users[0]; // Might crash if users is empty
const userNames = users.map(u => u.name); // Might crash if users is null

// ✅ CORRECT - Safe array operations
import { first, safeMap, hasItems } from '@/lib/utils/array';

const firstUser = first(users); // Returns null if empty
const userNames = safeMap(users, u => u.name); // Returns [] if null

if (hasItems(users)) {
  // TypeScript knows users is T[] here
  const firstUser = users[0]; // Safe because we checked
}
```

---

## 🔧 Middleware Pattern

### Base Middleware

```typescript
// src/lib/middleware/withAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Authentication Middleware
 * 
 * Wraps API routes to ensure user is authenticated.
 * Returns 401 if not authenticated.
 */
export function withAuth(
  handler: (req: NextRequest, context: { user: { id: string } }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return handler(req, { user: { id: session.user.id } });
  };
}

// src/lib/middleware/withOrganization.ts
import { userService } from '@/lib/services/UserService';

/**
 * Organization Middleware
 * 
 * Wraps API routes to ensure user belongs to an organization.
 * Adds organization context to handler.
 */
export function withOrganization(
  handler: (
    req: NextRequest,
    context: { user: { id: string; organizationId: string } }
  ) => Promise<NextResponse>
) {
  return withAuth(async (req, { user }) => {
    const dbUser = await userService.findById(user.id);
    
    if (!dbUser?.organizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 403 }
      );
    }
    
    return handler(req, {
      user: {
        id: user.id,
        organizationId: dbUser.organizationId.toString(),
      },
    });
  });
}

// src/lib/middleware/withAdmin.ts
/**
 * Admin Middleware
 * 
 * Wraps API routes to ensure user is admin or owner.
 */
export function withAdmin(
  handler: (
    req: NextRequest,
    context: { user: { id: string; organizationId: string; role: string } }
  ) => Promise<NextResponse>
) {
  return withOrganization(async (req, { user }) => {
    const dbUser = await userService.findById(user.id);
    
    if (!dbUser || !['admin', 'owner'].includes(dbUser.role)) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    return handler(req, {
      user: {
        id: user.id,
        organizationId: user.organizationId,
        role: dbUser.role,
      },
    });
  });
}
```

### Usage in API Routes

```typescript
// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import { withAdmin } from '@/lib/middleware/withAdmin';
import { userService } from '@/lib/services/UserService';

// ❌ WRONG - No middleware, manual checks
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const user = await userService.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!user.organizationId) return NextResponse.json({ error: 'No org' }, { status: 403 });
  if (!['admin', 'owner'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Finally, the actual logic...
}

// ✅ CORRECT - Middleware handles all checks
export const GET = withAdmin(async (req, { user }) => {
  // user.id, user.organizationId, user.role are all guaranteed to exist
  const users = await userService.findByOrganization(user.organizationId);
  return NextResponse.json({ users });
});
```

---

## 📝 Helper Functions

### Common Helpers

```typescript
// src/lib/utils/helpers.ts

/**
 * Common helper functions
 * Extract repeated logic into reusable functions
 */

import { ObjectId } from 'mongodb';

/**
 * Convert string to ObjectId safely
 */
export function toObjectId(id: string | ObjectId): ObjectId {
  return typeof id === 'string' ? new ObjectId(id) : id;
}

/**
 * Convert ObjectId to string safely
 */
export function toString(id: ObjectId | string | null | undefined): string | null {
  if (!id) return null;
  return typeof id === 'string' ? id : id.toString();
}

/**
 * Check if string is valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

/**
 * Parse pagination params
 */
export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Format date consistently
 */
export function formatDate(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Sanitize user input (remove extra whitespace, trim)
 */
export function sanitizeString(str: string | null | undefined): string {
  return (str || '').trim().replace(/\s+/g, ' ');
}

/**
 * Generate slug from string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Calculate retention date based on days
 */
export function calculateRetentionDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
```

---

## ✅ Pre-Commit Quality Gates

### ESLint Configuration

```javascript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "rules": {
    // Enforce no any types
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    
    // Enforce array safety
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn",
    
    // Enforce naming conventions
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE", "PascalCase"]
      },
      {
        "selector": "function",
        "format": ["camelCase", "PascalCase"]
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      }
    ],
    
    // Enforce DRY
    "no-duplicate-imports": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    
    // Enforce code quality
    "complexity": ["warn", 10],
    "max-lines-per-function": ["warn", 50],
    "max-depth": ["warn", 3]
  }
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

---

## 📊 Code Quality Metrics

### Targets

- **Cyclomatic Complexity**: < 10 per function
- **Function Length**: < 50 lines
- **File Length**: < 300 lines
- **Nesting Depth**: < 3 levels
- **DRY Violations**: 0 (no duplicate code)
- **Type Safety**: 100% (no `any` types)
- **Test Coverage**: 80%+ for business logic

---

**This is how Staff/Principal Engineers write code. Follow these patterns religiously.** 🎯

**Last Updated**: 2025-10-27  
**Status**: Active - Enforce on Every Commit
