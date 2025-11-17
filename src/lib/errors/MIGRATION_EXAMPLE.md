# Migration Example: Real Route Conversion

This document shows a real example of migrating an existing route from the codebase to use the new error registry system.

## Example Route: `/api/auth/signup`

### Before Migration

```typescript
/**
 * Signup API Route
 *
 * Create new user account with email/password
 */

import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { logger } from '@/lib/logging/logger';
import { userService } from '@/lib/services/UserService';
import { success, fail, validationError } from '@/lib/api/response';
import { getMongoDb } from '@/lib/db/mongodb';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(1, 'Name is required').max(100),
});

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string } = {};

  try {
    body = await req.json();

    // Validate input
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return validationError(result.error.flatten());
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existing = await userService.findByEmail(email);
    if (existing) {
      return fail('Email already registered', 400);
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user using service method
    const user = await userService.createUser({
      email,
      name,
      role: 'user',
      plan: 'free',
    });

    // Update password separately
    const db = await getMongoDb();
    await db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(user._id.toString()) },
        { $set: { password: hashedPassword } }
      );

    // Return success (don't include password)
    return success({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    logger.apiError('/api/auth/signup', error, {
      method: 'POST',
      email: body?.email || 'unknown',
    });
    return fail('Failed to create account', 500);
  }
}
```

### After Migration

```typescript
/**
 * Signup API Route
 *
 * Create new user account with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { userService } from '@/lib/services/UserService';
import { getMongoDb } from '@/lib/db/mongodb';
import {
  withErrorHandler,
  validateSchema,
  ErrorFactory,
} from '@/lib/errors';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(1, 'Name is required').max(100),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  // Validate input - automatically throws ValidationError on failure
  const { email, password, name } = await validateSchema(req, signupSchema);

  // Check if user already exists - throw specific error
  const existing = await userService.findByEmail(email);
  if (existing) {
    throw ErrorFactory.userAlreadyExists(email);
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user using service method
  const user = await userService.createUser({
    email,
    name,
    role: 'user',
    plan: 'free',
  });

  // Update password separately
  const db = await getMongoDb();
  await db
    .collection('users')
    .updateOne(
      { _id: new ObjectId(user._id.toString()) },
      { $set: { password: hashedPassword } }
    );

  // Return success (don't include password)
  return NextResponse.json(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
    { status: 201 }
  );
});
```

### Key Changes

1. **Imports Simplified**
   - ❌ Removed: `success`, `fail`, `validationError` from `@/lib/api/response`
   - ❌ Removed: `logger` (automatic logging in error handler)
   - ✅ Added: `withErrorHandler`, `validateSchema`, `ErrorFactory` from `@/lib/errors`

2. **Error Handling**
   - ❌ Removed: Try-catch block with manual error handling
   - ❌ Removed: Manual logging
   - ✅ Added: `withErrorHandler` wrapper (automatic error handling and logging)

3. **Validation**
   - ❌ Removed: Manual `safeParse` and conditional return
   - ✅ Added: `validateSchema` helper (throws on validation failure)

4. **Conflict Checking**
   - ❌ Before: `return fail('Email already registered', 400)`
   - ✅ After: `throw ErrorFactory.userAlreadyExists(email)`

5. **Success Response**
   - ❌ Before: `return success({ ... })`
   - ✅ After: `return NextResponse.json({ ... }, { status: 201 })`

6. **Type Safety**
   - Before: Manual type declaration for `body` variable
   - After: `validateSchema` returns typed data directly

### Benefits of Migration

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of Code** | 82 lines | 52 lines (37% reduction) |
| **Error Handling** | Manual try-catch | Automatic |
| **Logging** | Manual | Automatic |
| **Type Safety** | Manual typing | Automatic from schema |
| **Error Codes** | Generic strings | Standardized codes |
| **Error Format** | Inconsistent | Standardized |
| **Metadata** | None | Email included automatically |
| **Status Codes** | Manual | From error registry |
| **Production Safety** | Manual sanitization | Automatic |

## Another Example: `/api/prompts` GET

### Before Migration

```typescript
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Try MongoDB first
    try {
      const db = await getMongoDb();
      const collection = db.collection('prompts');

      const query: Record<string, unknown> = {
        active: { $ne: false },
      };
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$text = { $search: search };
      }

      const prompts = await collection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      const total = await collection.countDocuments(query);

      return NextResponse.json({
        prompts,
        total,
        source: 'mongodb',
      });
    } catch (dbError) {
      logger.warn('MongoDB not available, using static data', {
        error: dbError instanceof Error ? dbError.message : 'Unknown error',
      });

      const { seedPrompts } = await import('@/data/seed-prompts');
      let filtered = seedPrompts;

      if (category && category !== 'all') {
        filtered = filtered.filter((p) => p.category === category);
      }

      const paginated = filtered.slice(0, limit);

      return NextResponse.json({
        prompts: paginated,
        total: filtered.length,
        source: 'static',
      });
    }
  } catch (error) {
    logger.apiError('/api/prompts', error, { method: 'GET' });
    return NextResponse.json(
      { error: 'Failed to fetch prompts' },
      { status: 500 }
    );
  }
}
```

### After Migration

```typescript
import { withErrorHandler, ErrorFactory } from '@/lib/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');

  // Validate limit
  if (limit < 1 || limit > 100) {
    throw ErrorFactory.invalidField('limit', limit, 'Must be between 1 and 100');
  }

  // Try MongoDB first
  try {
    const db = await getMongoDb();
    const collection = db.collection('prompts');

    const query: Record<string, unknown> = {
      active: { $ne: false },
    };
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }

    const prompts = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    return NextResponse.json({
      prompts,
      total,
      source: 'mongodb',
    });
  } catch (dbError) {
    // Log warning but continue with fallback
    logger.warn('MongoDB not available, using static data', {
      error: dbError instanceof Error ? dbError.message : 'Unknown error',
    });

    // Fallback to static data
    const { seedPrompts } = await import('@/data/seed-prompts');
    let filtered = seedPrompts;

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    const paginated = filtered.slice(0, limit);

    return NextResponse.json({
      prompts: paginated,
      total: filtered.length,
      source: 'static',
    });
  }
});
```

### Key Changes

1. **Wrapped with `withErrorHandler`** - Automatic error handling for unexpected errors
2. **Added validation** - Validate `limit` parameter
3. **Simplified error handling** - Removed outer try-catch (handled by wrapper)
4. **Kept fallback logic** - Still catches DB errors for graceful degradation
5. **Cleaner code** - Less boilerplate

### Testing the Migration

After migrating, test these scenarios:

```bash
# Test valid request
curl http://localhost:3000/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Expected: 201 Created with user data

# Test duplicate email
curl http://localhost:3000/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "existing@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'

# Expected: 409 Conflict with error:
# {
#   "error": {
#     "code": "USER_ALREADY_EXISTS",
#     "message": "User with this email already exists",
#     "statusCode": 409,
#     "category": "business_logic",
#     "timestamp": "2025-01-15T10:30:00.000Z"
#   }
# }

# Test validation error
curl http://localhost:3000/api/auth/signup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "weak",
    "name": ""
  }'

# Expected: 400 Bad Request with validation errors
```

## Migration Checklist

When migrating a route, use this checklist:

- [ ] Import error utilities from `@/lib/errors`
- [ ] Remove old error handling imports (`fail`, `unauthorized`, etc.)
- [ ] Wrap route handler with `withErrorHandler` or use `handleApiError`
- [ ] Replace manual validation with `validateSchema`
- [ ] Replace conditional error returns with `throw ErrorFactory...`
- [ ] Replace assertion checks with `assertFound`, `assertAuthenticated`, etc.
- [ ] Add metadata to errors for better debugging
- [ ] Remove manual logging (now automatic)
- [ ] Update success responses to use `NextResponse.json`
- [ ] Test all error scenarios
- [ ] Verify error response format
- [ ] Check logs to ensure errors are being logged correctly

## Common Gotchas

1. **Don't catch and ignore errors** - Let them bubble to the error handler
2. **Use specific factory methods** - `ErrorFactory.userNotFound()` instead of `ErrorFactory.notFound('User')`
3. **Add metadata** - Include context like `userId`, `email`, etc.
4. **Validate early** - Use `validateSchema` at the start of route handlers
5. **Use assertions** - `assertFound` is cleaner than `if (!x) throw ...`

## Next Steps

1. Migrate high-traffic routes first
2. Update integration tests to expect new error format
3. Monitor error logs to ensure proper logging
4. Update API documentation with new error codes
5. Train team on new error handling patterns
