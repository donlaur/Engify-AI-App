# Migration Guide: Centralized Error Registry

This guide helps you migrate existing error handling code to the new centralized error registry system.

## Table of Contents

- [Migration Overview](#migration-overview)
- [Step-by-Step Migration](#step-by-step-migration)
- [Pattern Migrations](#pattern-migrations)
- [Common Scenarios](#common-scenarios)
- [Checklist](#checklist)

## Migration Overview

### What's Changing

**Before**: Ad-hoc error handling with inconsistent patterns
- Manual `NextResponse.json({ error: '...' }, { status: ... })`
- Mixed use of response helpers (`fail()`, `unauthorized()`, etc.)
- Inconsistent error messages and status codes
- Manual logging in each route
- No standardized error metadata

**After**: Centralized error registry with standardized handling
- Throw errors with `ErrorFactory`
- Automatic error handling with `handleApiError()` or `withErrorHandler()`
- Consistent error codes and messages
- Automatic logging and sanitization
- Rich error metadata and context

### Benefits

- ✅ **Consistency** - Same error format across all APIs
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Less Boilerplate** - Reduce try-catch blocks
- ✅ **Better DX** - Clearer error creation and handling
- ✅ **Monitoring Ready** - Structured errors for logging/monitoring
- ✅ **Production Safe** - Automatic sanitization

## Step-by-Step Migration

### Step 1: Import New Error Utilities

Replace old imports:

```typescript
// ❌ Old
import { fail, unauthorized, notFound } from '@/lib/api/response';
import { sanitizeError, sanitizeNotFoundError } from '@/lib/errors/sanitize';

// ✅ New
import { ErrorFactory, handleApiError, withErrorHandler, assertFound } from '@/lib/errors';
```

### Step 2: Replace Response Helpers with ErrorFactory

```typescript
// ❌ Old
if (!user) {
  return notFound('User not found');
}

// ✅ New
if (!user) {
  throw ErrorFactory.notFound('User', userId);
}
```

### Step 3: Use Error Handler

```typescript
// ❌ Old
export async function GET(request: NextRequest) {
  try {
    // logic
  } catch (error) {
    logger.error('Error', { error });
    return fail('Internal server error', 500);
  }
}

// ✅ New - Option 1: withErrorHandler
export const GET = withErrorHandler(async (request: NextRequest) => {
  // logic
});

// ✅ New - Option 2: handleApiError
export async function GET(request: NextRequest) {
  try {
    // logic
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### Step 4: Use Assertions

```typescript
// ❌ Old
if (!user) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}

// ✅ New
assertFound(user, 'User', userId);
```

### Step 5: Add Metadata

```typescript
// ❌ Old
if (!user) {
  return notFound('User not found');
}

// ✅ New
if (!user) {
  throw ErrorFactory.notFound('User', userId, {
    searchedBy: 'email',
    email: userEmail,
  });
}
```

## Pattern Migrations

### Pattern 1: Validation Errors

**Before:**
```typescript
if (!body.email) {
  return NextResponse.json(
    { error: 'Email is required' },
    { status: 400 }
  );
}

if (!isValidEmail(body.email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  );
}
```

**After:**
```typescript
import { validateSchema } from '@/lib/errors';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email format'),
});

// Automatically validates and throws appropriate errors
const body = await validateSchema(request, schema);
```

### Pattern 2: Authentication

**Before:**
```typescript
const session = await getSession();
if (!session) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

**After:**
```typescript
import { assertAuthenticated } from '@/lib/errors';

const session = await getSession();
assertAuthenticated(!!session);
```

### Pattern 3: Authorization

**Before:**
```typescript
if (user.role !== 'admin') {
  return NextResponse.json(
    { error: 'Forbidden' },
    { status: 403 }
  );
}
```

**After:**
```typescript
import { assertAuthorized } from '@/lib/errors';

assertAuthorized(user.role === 'admin', 'admin', 'Admin access required');
```

### Pattern 4: Not Found

**Before:**
```typescript
const prompt = await findPrompt(id);
if (!prompt) {
  return NextResponse.json(
    { error: 'Prompt not found' },
    { status: 404 }
  );
}
```

**After:**
```typescript
import { assertFound } from '@/lib/errors';

const prompt = await findPrompt(id);
assertFound(prompt, 'Prompt', id);
```

### Pattern 5: Duplicate/Conflict

**Before:**
```typescript
const existing = await findUser(email);
if (existing) {
  return NextResponse.json(
    { error: 'Email already registered' },
    { status: 409 }
  );
}
```

**After:**
```typescript
import { ErrorFactory } from '@/lib/errors';

const existing = await findUser(email);
if (existing) {
  throw ErrorFactory.userAlreadyExists(email);
}
```

### Pattern 6: Database Errors

**Before:**
```typescript
try {
  const result = await db.collection('users').insertOne(user);
} catch (error) {
  logger.error('Database error', { error });
  return NextResponse.json(
    { error: 'Failed to create user' },
    { status: 500 }
  );
}
```

**After:**
```typescript
import { ErrorFactory } from '@/lib/errors';

try {
  const result = await db.collection('users').insertOne(user);
} catch (error) {
  // Specific MongoDB duplicate key error
  if (error.code === 11000) {
    throw ErrorFactory.userAlreadyExists(user.email);
  }

  // General database error
  throw ErrorFactory.database('Failed to create user', 'insertOne', 'users', {
    originalError: error,
  });
}
```

### Pattern 7: Rate Limiting

**Before:**
```typescript
if (isRateLimited) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

**After:**
```typescript
import { ErrorFactory } from '@/lib/errors';

if (isRateLimited) {
  throw ErrorFactory.rateLimit(resetDate, limit, currentCount);
}
```

### Pattern 8: External Service Errors

**Before:**
```typescript
const response = await fetch(apiUrl);
if (!response.ok) {
  logger.error('External API failed', { status: response.status });
  return NextResponse.json(
    { error: 'External service error' },
    { status: 502 }
  );
}
```

**After:**
```typescript
import { ErrorFactory } from '@/lib/errors';

const response = await fetch(apiUrl);
if (!response.ok) {
  throw ErrorFactory.externalService('OpenAI', 'API request failed', {
    statusCode: response.status,
    statusText: response.statusText,
  });
}
```

## Common Scenarios

### Scenario 1: Simple GET Route

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const data = await fetchData(id);

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Error in GET', { error });
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandler, ErrorFactory, assertFound } from '@/lib/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    throw ErrorFactory.requiredField('id');
  }

  const data = await fetchData(id);
  assertFound(data, 'Resource', id);

  return NextResponse.json(data);
});
```

### Scenario 2: POST with Validation

**Before:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    if (!body.password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error('Error creating user', { error });
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
```

**After:**
```typescript
import { withErrorHandler, validateSchema } from '@/lib/errors';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await validateSchema(request, createUserSchema);
  const user = await createUser(body);
  return NextResponse.json(user, { status: 201 });
});
```

### Scenario 3: Protected Route

**Before:**
```typescript
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUser(session.userId);

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = request.nextUrl.searchParams.get('id');
    await deleteResource(id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error('Error deleting resource', { error });
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import {
  withErrorHandler,
  assertAuthenticated,
  assertAuthorized,
  ErrorFactory,
} from '@/lib/errors';

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession();
  assertAuthenticated(!!session);

  const user = await findUser(session.userId);
  assertAuthorized(user.role === 'admin', 'admin');

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    throw ErrorFactory.requiredField('id');
  }

  await deleteResource(id);
  return new NextResponse(null, { status: 204 });
});
```

### Scenario 4: Complex Business Logic

**Before:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUser(session.userId);
    const promptCount = await getPromptCount(user.id);

    if (promptCount >= user.maxPrompts) {
      return NextResponse.json(
        { error: 'Quota exceeded' },
        { status: 422 }
      );
    }

    const body = await request.json();
    const duplicate = await findDuplicate(body);

    if (duplicate) {
      return NextResponse.json(
        { error: 'Duplicate prompt' },
        { status: 409 }
      );
    }

    const prompt = await createPrompt(body);
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    logger.error('Error creating prompt', { error });
    return NextResponse.json({ error: 'Creation failed' }, { status: 500 });
  }
}
```

**After:**
```typescript
import {
  withErrorHandler,
  assertAuthenticated,
  assertFound,
  ErrorFactory,
  validateSchema,
} from '@/lib/errors';
import { z } from 'zod';

const promptSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const session = await getServerSession();
  assertAuthenticated(!!session);

  const user = await findUser(session.userId);
  assertFound(user, 'User', session.userId);

  const promptCount = await getPromptCount(user.id);
  if (promptCount >= user.maxPrompts) {
    throw ErrorFactory.quotaExceeded(user.maxPrompts, promptCount, {
      userId: user.id,
      plan: user.plan,
    });
  }

  const body = await validateSchema(request, promptSchema);
  const duplicate = await findDuplicate(body);

  if (duplicate) {
    throw ErrorFactory.duplicatePrompt({
      duplicateId: duplicate.id,
    });
  }

  const prompt = await createPrompt(body);
  return NextResponse.json(prompt, { status: 201 });
});
```

## Checklist

Use this checklist when migrating a route:

- [ ] Replace old imports with new error utilities
- [ ] Replace manual `NextResponse.json({ error: ... })` with `throw ErrorFactory...`
- [ ] Replace response helpers (`fail()`, `unauthorized()`, etc.) with `ErrorFactory`
- [ ] Replace manual checks with assertions (`assertFound`, `assertAuthenticated`, etc.)
- [ ] Wrap handler with `withErrorHandler` or use `handleApiError` in catch block
- [ ] Add error metadata for better context
- [ ] Use `validateSchema` for request validation instead of manual checks
- [ ] Remove manual logging (handled automatically by error handler)
- [ ] Test error scenarios in development
- [ ] Verify error responses match expected format
- [ ] Update tests to expect new error format

## Testing After Migration

After migrating a route, test these scenarios:

1. **Success Case**: Route works as expected
2. **Validation Errors**: Invalid input returns 400 with proper error code
3. **Authentication**: Unauthenticated requests return 401
4. **Authorization**: Unauthorized access returns 403
5. **Not Found**: Missing resources return 404
6. **Conflicts**: Duplicates/conflicts return 409
7. **Rate Limits**: Rate limiting returns 429
8. **Server Errors**: Unexpected errors return 500 with sanitized message

## Backward Compatibility

The new error system maintains backward compatibility:

- Old `sanitize.ts` functions still work
- Old response helpers in `response.ts` still work
- You can migrate routes incrementally
- Both patterns can coexist during migration

## Getting Help

If you encounter issues during migration:

1. Check the examples in `src/lib/errors/examples.ts`
2. Review the full documentation in `src/lib/errors/README.md`
3. Look at migrated routes for reference patterns
4. Check error codes in `src/lib/errors/registry.ts`

## Migration Priority

Recommended migration order:

1. **High Priority**: Public API routes (consistency matters most)
2. **Medium Priority**: Protected routes (authentication/authorization)
3. **Low Priority**: Internal/admin routes
4. **Last**: Webhook handlers and cron jobs

Start with simpler routes to get familiar with the patterns before tackling complex ones.
