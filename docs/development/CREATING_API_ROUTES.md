# Creating API Routes

**Guide Type:** Developer Guide  
**Related:** [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md), [Auth Audit Day 7](../../testing/AUTH_AUDIT_DAY7.md)

---

## Overview

This guide covers creating API routes in Next.js App Router with proper authentication, authorization, rate limiting, validation, and error handling.

---

## File Structure

**Location:** `src/app/api/[route]/route.ts`

**Example:**
- `src/app/api/prompts/route.ts` - GET list of prompts
- `src/app/api/prompts/[id]/route.ts` - GET single prompt
- `src/app/api/admin/content/index/route.ts` - Admin content management

---

## Standard Template

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/require-auth';
import { RBACPresets } from '@/lib/auth/rbac';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/logging/audit';

// 1. Define Zod schema for validation
const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

// 2. GET handler
export async function GET(request: NextRequest) {
  try {
    // Authentication (if needed)
    const user = await requireAuth(); // or RBACPresets.requireSuperAdmin()
    
    // Rate limiting (for public routes)
    const rateLimitResult = await rateLimit({
      identifier: user?.id || request.ip || 'anonymous',
      limit: 100,
      window: '1m',
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Fetch data
    // const data = await fetchData();
    
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

// 3. POST handler
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await requireAuth();
    
    // Rate limiting
    const rateLimitResult = await rateLimit({
      identifier: user.id,
      limit: 50,
      window: '1m',
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Validate request body
    const body = await request.json();
    const validated = createSchema.parse(body);
    
    // Process request
    // const result = await createItem(validated);
    
    // Audit logging (for sensitive operations)
    await auditLog({
      userId: user.id,
      action: 'item.create',
      resource: 'item',
      metadata: validated,
    });
    
    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// 4. Error handler
function handleError(error: unknown): NextResponse {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  
  // Authentication errors
  if (error instanceof Error && error.message.includes('Unauthorized')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Database errors
  if (error instanceof Error && error.message.includes('MongoDB')) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Database error' },
      { status: 500 }
    );
  }
  
  // Unknown errors
  console.error('API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Authentication Patterns

### Public Routes (No Auth Required)

```typescript
export async function GET(request: NextRequest) {
  // No auth check needed
  // Still apply rate limiting
  const rateLimitResult = await rateLimit({
    identifier: request.ip || 'anonymous',
    limit: 100,
    window: '1m',
  });
  
  // ...
}
```

**Examples:**
- `/api/stats` - Public stats
- `/api/prompts` - Public prompt list
- `/api/health` - Health check

### Authenticated Routes

```typescript
export async function GET(request: NextRequest) {
  // Require authentication
  const user = await requireAuth();
  
  // Use user.id in queries
  // ...
}
```

**Examples:**
- `/api/favorites` - User favorites
- `/api/dashboard` - User dashboard

### Admin Routes (RBAC)

```typescript
export async function GET(request: NextRequest) {
  // Require super admin
  const user = await RBACPresets.requireSuperAdmin();
  
  // Admin operations
  // ...
}
```

**Examples:**
- `/api/admin/*` - All admin routes
- `/api/opshub/*` - OpsHub routes

### Background Jobs (Cron)

```typescript
import { verifyCronRequest } from '@/lib/auth/verify-cron';

export async function GET(request: NextRequest) {
  // Verify cron secret or QStash signature
  await verifyCronRequest(request);
  
  // Background job logic
  // ...
}
```

**Examples:**
- `/api/jobs/monthly-analytics`
- `/api/jobs/daily-usage-report`

---

## Rate Limiting

**Apply to all routes:**

```typescript
const rateLimitResult = await rateLimit({
  identifier: user?.id || request.ip || 'anonymous',
  limit: 100,        // Requests per window
  window: '1m',      // Time window
});

if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

**Rate Limit Guidelines:**

- Public routes: 100/min
- Authenticated routes: 200/min
- Admin routes: 500/min
- Background jobs: No rate limit (cron verified)

---

## Validation

**Always validate with Zod:**

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(120),
});

// In handler
const body = await request.json();
const validated = schema.parse(body);
```

**Error Response:**

```typescript
if (error instanceof z.ZodError) {
  return NextResponse.json(
    { error: 'Validation failed', details: error.errors },
    { status: 400 }
  );
}
```

---

## Error Handling

**Standard Error Responses:**

```typescript
// 400 - Bad Request (validation errors)
return NextResponse.json(
  { error: 'Validation failed', details: error.errors },
  { status: 400 }
);

// 401 - Unauthorized (auth required)
return NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }
);

// 403 - Forbidden (no permission)
return NextResponse.json(
  { error: 'Forbidden' },
  { status: 403 }
);

// 404 - Not Found
return NextResponse.json(
  { error: 'Resource not found' },
  { status: 404 }
);

// 429 - Rate Limited
return NextResponse.json(
  { error: 'Rate limit exceeded' },
  { status: 429 }
);

// 500 - Internal Server Error
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
);
```

**Never expose internal errors:**

```typescript
// ❌ BAD
return NextResponse.json({ error: error.message }, { status: 500 });

// ✅ GOOD
console.error('Internal error:', error);
return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
```

---

## Audit Logging

**Log sensitive operations:**

```typescript
await auditLog({
  userId: user.id,
  action: 'item.create',        // Action type
  resource: 'item',              // Resource type
  resourceId: result.id,         // Resource ID
  metadata: {                    // Additional context
    name: validated.name,
    // ... other relevant data
  },
});
```

**Common Actions:**

- `user.create`, `user.update`, `user.delete`
- `item.create`, `item.update`, `item.delete`
- `admin.panel.view`, `admin.panel.edit`
- `favorite.added`, `favorite.removed`

---

## Response Format

**Success Response:**

```typescript
// GET - Single resource
return NextResponse.json({ data: item });

// GET - List
return NextResponse.json({ data: items, count: items.length });

// POST - Created
return NextResponse.json({ success: true, data: result }, { status: 201 });

// PUT/PATCH - Updated
return NextResponse.json({ success: true, data: result });

// DELETE - Deleted
return NextResponse.json({ success: true }, { status: 204 });
```

**Error Response:**

```typescript
return NextResponse.json(
  { error: 'Error message', details: {} },
  { status: 400 }
);
```

---

## Checklist

- [ ] Route file created in correct location
- [ ] Zod schema defined for validation
- [ ] Authentication check added (if needed)
- [ ] Rate limiting applied
- [ ] Error handling implemented
- [ ] Audit logging added (for sensitive operations)
- [ ] Proper HTTP status codes used
- [ ] Response format consistent
- [ ] Tests written (if applicable)
- [ ] Documentation updated

---

## Examples

**Public Route:**

```typescript
// src/app/api/stats/route.ts
export async function GET(request: NextRequest) {
  const rateLimitResult = await rateLimit({
    identifier: request.ip || 'anonymous',
    limit: 100,
    window: '1m',
  });
  
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  
  const stats = await getStats();
  return NextResponse.json({ data: stats });
}
```

**Authenticated Route:**

```typescript
// src/app/api/favorites/route.ts
export async function GET(request: NextRequest) {
  const user = await requireAuth();
  
  const favorites = await getFavorites(user.id);
  return NextResponse.json({ data: favorites });
}
```

**Admin Route:**

```typescript
// src/app/api/admin/content/index/route.ts
export async function GET(request: NextRequest) {
  const user = await RBACPresets.requireSuperAdmin();
  
  const rateLimitResult = await rateLimit({
    identifier: user.id,
    limit: 500,
    window: '1m',
  });
  
  const content = await getAllContent();
  return NextResponse.json({ data: content });
}
```

---

## Related Documentation

- [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md)
- [Auth Audit Day 7](../../testing/AUTH_AUDIT_DAY7.md)
- [Pattern Audit Day 7](../../testing/PATTERN_AUDIT_DAY7.md)
- [Component Standards](./COMPONENT_STANDARDS.md)

---

**Last Updated:** 2025-11-02  
**Author:** Donnie Laur, AI Assistant

