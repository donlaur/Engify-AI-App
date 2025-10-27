# API Standards & Enforcement

**Mission**: Enforce professional API standards automatically, not manually.

---

## 🎯 Core Principles

1. **Type Safety**: All APIs use TypeScript with proper types (no `any`)
2. **Array Safety**: All array operations use safe methods
3. **Error Handling**: Consistent error responses across all endpoints
4. **Validation**: All inputs validated using Zod
5. **Authentication**: All protected endpoints verify user identity
6. **Rate Limiting**: All endpoints implement rate limiting (Phase 2)
7. **Documentation**: All APIs documented with JSDoc

---

## 📋 Required Patterns

### 1. Array Safety

**❌ NEVER use unsafe array methods:**
```typescript
// BAD - Will crash if undefined
const items = data.items.map(...);
const first = data.items[0];
const count = data.items.length;
```

**✅ ALWAYS use safe array methods:**
```typescript
import { safeArray, safeFirst, safeLength } from '@/lib/utils/array';

// GOOD - Safe with fallback
const items = safeArray(data.items).map(...);
const first = safeFirst(data.items);
const count = safeLength(data.items);

// Or use optional chaining
const items = data.items?.map(...) ?? [];
const first = data.items?.[0];
const count = data.items?.length ?? 0;
```

### 2. Request Validation

**All endpoints MUST validate input using Zod:**

```typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const CreatePromptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000),
  content: z.string().min(1, 'Content is required'),
  category: z.string(),
  role: z.enum(['junior_engineer', 'mid_engineer', 'senior_engineer', 'manager']),
  tags: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = CreatePromptSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: result.error.issues 
        },
        { status: 400 }
      );
    }
    
    const data = result.data;
    
    // Use validated data...
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### 3. Response Utilities

**Consistent response format:**

```typescript
// src/lib/api/response.ts

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Success response
 */
export function success<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Error response
 */
export function fail(
  error: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      error,
      details,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

/**
 * Paginated response
 */
export function paginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  
  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
```

**Usage:**

```typescript
import { success, fail, paginated } from '@/lib/api/response';

// Success
return success({ id: '123', name: 'Test' });

// Error
return fail('Resource not found', 404);

// Paginated
return paginated(items, 1, 20, 100);
```

### 4. Authentication & Authorization

**All protected endpoints MUST verify user:**

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { fail } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return fail('Unauthorized', 401);
  }
  
  // Get user from database
  const user = await userService.findById(session.user.id);
  if (!user) {
    return fail('User not found', 404);
  }
  
  // Check authorization (if needed)
  if (!['admin', 'owner'].includes(user.role)) {
    return fail('Forbidden - Admin access required', 403);
  }
  
  // Continue with operation...
}
```

**Or use middleware (better):**

```typescript
import { withAuth, withAdmin } from '@/lib/middleware';

// Simple auth
export const GET = withAuth(async (req, { user }) => {
  const data = await getData(user.id);
  return success(data);
});

// Admin only
export const DELETE = withAdmin(async (req, { user }) => {
  await deleteResource(user.organizationId);
  return success({ message: 'Deleted' });
});
```

### 5. Error Handling

**Consistent error handling pattern:**

```typescript
import { fail } from '@/lib/api/response';

export async function POST(req: NextRequest) {
  try {
    // Validate input
    const result = schema.safeParse(await req.json());
    if (!result.success) {
      return fail('Validation failed', 400, result.error.issues);
    }
    
    // Business logic
    const data = await createResource(result.data);
    
    return success(data);
    
  } catch (error) {
    // Log error for debugging
    console.error('API error:', error);
    
    // Return generic error to client
    if (error instanceof Error) {
      return fail(error.message, 500);
    }
    
    return fail('Internal server error', 500);
  }
}
```

### 6. Database Operations

**Safe database queries:**

```typescript
import { userService } from '@/lib/services/UserService';
import { safeArray } from '@/lib/utils/array';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return fail('Unauthorized', 401);
    }
    
    // Use service layer (includes organizationId)
    const users = await userService.findByOrganization(
      session.user.organizationId
    );
    
    // Safe array handling
    const items = safeArray(users);
    
    return success(items);
    
  } catch (error) {
    console.error('Database error:', error);
    return fail('Failed to fetch users', 500);
  }
}
```

---

## 🔒 Security Requirements

### 1. Input Sanitization

```typescript
// src/lib/api/security.ts

/**
 * Sanitize string input
 * Removes extra whitespace and trims
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Sanitize object inputs
 */
export function sanitizeInput<T extends Record<string, unknown>>(
  input: T
): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(input)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value as T[keyof T];
    }
  }
  
  return sanitized;
}
```

### 2. Rate Limiting (Phase 2)

```typescript
// src/lib/api/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const { success, limit, remaining } = await ratelimit.limit(identifier);
  return { success, limit, remaining };
}

// Usage in API route
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await checkRateLimit(ip);
  
  if (!success) {
    return fail('Too many requests', 429);
  }
  
  // Continue...
}
```

---

## 📊 Response Patterns

### Success Response

```typescript
{
  "data": {
    "id": "123",
    "title": "Example"
  },
  "message": "Success message (optional)",
  "meta": {
    "timestamp": "2025-10-27T12:00:00Z"
  }
}
```

### Error Response

```typescript
{
  "error": "Error message",
  "details": {
    "field": "Specific error"
  },
  "meta": {
    "timestamp": "2025-10-27T12:00:00Z"
  }
}
```

### Paginated Response

```typescript
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2025-10-27T12:00:00Z"
  }
}
```

---

## 🧪 Testing Requirements

### 1. API Tests

```typescript
// tests/api/prompts.test.ts
import { describe, it, expect } from 'vitest';

describe('POST /api/prompts', () => {
  it('creates prompt with valid data', async () => {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Prompt',
        content: 'Test content',
        category: 'engineering',
        role: 'mid_engineer',
      }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data.title).toBe('Test Prompt');
  });
  
  it('rejects invalid data', async () => {
    const response = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '', // Invalid - empty
      }),
    });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Validation failed');
  });
});
```

---

## 📝 Documentation Requirements

### JSDoc Comments

**All API functions MUST have JSDoc:**

```typescript
/**
 * Create a new prompt template
 * 
 * @param req - Next.js request object
 * @returns Created prompt or error
 * 
 * @example
 * POST /api/prompts
 * Body: {
 *   title: "Code Review Helper",
 *   content: "Act as a senior engineer...",
 *   category: "engineering",
 *   role: "mid_engineer"
 * }
 * 
 * Response: {
 *   data: {
 *     id: "123",
 *     title: "Code Review Helper",
 *     ...
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  // Implementation...
}
```

---

## ✅ API Checklist

Before deploying any API endpoint, verify:

- [ ] **Input validation** using Zod schema
- [ ] **Authentication** check (if protected)
- [ ] **Authorization** check (if user-specific)
- [ ] **Array safety** (all arrays use safe methods)
- [ ] **Error handling** with consistent format
- [ ] **TypeScript types** for all responses
- [ ] **Service layer** usage (not direct DB access)
- [ ] **organizationId** included in queries (if multi-tenant)
- [ ] **JSDoc comments** added
- [ ] **Tests** written
- [ ] **Response utilities** used (success/fail)

---

## 🚨 Common Mistakes to Avoid

### 1. Unsafe Array Access

```typescript
// ❌ BAD
const items = data.items.map(x => x.name);
const first = data.items[0];

// ✅ GOOD
import { safeArray, safeFirst } from '@/lib/utils/array';
const items = safeArray(data.items).map(x => x.name);
const first = safeFirst(data.items);
```

### 2. Missing Validation

```typescript
// ❌ BAD
const { title, content } = await req.json();

// ✅ GOOD
const result = schema.safeParse(await req.json());
if (!result.success) {
  return fail('Validation failed', 400, result.error.issues);
}
const { title, content } = result.data;
```

### 3. Missing Authentication

```typescript
// ❌ BAD
export async function POST(req: NextRequest) {
  const data = await req.json();
  // No auth check!
}

// ✅ GOOD
export const POST = withAuth(async (req, { user }) => {
  // user.id is guaranteed
  const data = await getData(user.id);
  return success(data);
});
```

### 4. Inconsistent Error Responses

```typescript
// ❌ BAD
return NextResponse.json({ error: 'Failed' }, { status: 500 });

// ✅ GOOD
return fail('Failed to process request', 500);
```

### 5. Direct Database Access

```typescript
// ❌ BAD
const users = await db.collection('users').find({ email }).toArray();

// ✅ GOOD
const users = await userService.findByEmail(email, organizationId);
```

---

## 📊 Code Quality Metrics

### Targets

| Metric | Target | Enforced By |
|--------|--------|-------------|
| **TypeScript Errors** | 0 | Pre-commit + CI |
| **ESLint Errors** | 0 | Pre-commit + CI |
| **Test Coverage** | 80%+ | CI |
| **API Documentation** | 90%+ | Manual review |
| **Array Safety** | 100% | Pre-commit hook |
| **Input Validation** | 100% | Pre-commit hook |
| **Response Format** | 100% | Pre-commit hook |

---

## 🔧 Enforcement

### Pre-Commit Hooks

Automatically check:
1. Schema validation
2. Array safety
3. Input validation
4. organizationId in queries
5. No any types
6. Consistent error responses

### CI/CD Pipeline

```yaml
# .github/workflows/quality.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: TypeScript check
        run: pnpm type-check
      
      - name: ESLint
        run: pnpm lint
      
      - name: Tests
        run: pnpm test
      
      - name: Coverage
        run: pnpm test:coverage
      
      - name: Schema validation
        run: node scripts/validate-schema.js
```

---

## 📚 Resources

- **Response Utilities**: `src/lib/api/response.ts`
- **Security**: `src/lib/api/security.ts`
- **Array Utils**: `src/lib/utils/array.ts`
- **Middleware**: `src/lib/middleware/`
- **Services**: `src/lib/services/`

---

**These standards are enforced automatically, not manually. Write code once, correctly.** 🎯

**Last Updated**: 2025-10-27  
**Status**: Active - Enforce on Every Commit
