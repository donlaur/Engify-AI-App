# Centralized Error Registry

A comprehensive, type-safe error handling system for the Engify AI application. This system provides standardized error codes, consistent error responses, and powerful error handling utilities.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

## Features

- ✅ **Centralized Error Registry** - Single source of truth for all error codes
- ✅ **Type-Safe** - Full TypeScript support with type guards
- ✅ **Consistent Error Responses** - Standardized error format across all APIs
- ✅ **HTTP Status Code Mapping** - Automatic status code assignment
- ✅ **Error Categories** - Organized by domain (validation, auth, database, etc.)
- ✅ **Severity Levels** - Low, Medium, High, Critical for monitoring
- ✅ **Operational vs Programmer Errors** - Distinguish expected vs unexpected errors
- ✅ **Retry Logic Support** - Flag errors as retryable/non-retryable
- ✅ **Metadata Support** - Attach context and additional data to errors
- ✅ **Logging Integration** - Automatic logging with Winston
- ✅ **Production Sanitization** - Prevent information leakage
- ✅ **Development Debug Info** - Stack traces and metadata in dev mode

## Architecture

### Directory Structure

```
src/lib/errors/
├── types.ts        # Core types and interfaces
├── base.ts         # Base error classes
├── registry.ts     # Error code registry
├── factory.ts      # Error creation utilities
├── handler.ts      # Error handling middleware
├── index.ts        # Main exports
├── examples.ts     # Usage examples
├── sanitize.ts     # Legacy compatibility (existing)
└── README.md       # Documentation
```

### Error Hierarchy

```
AppError (base class)
├── ValidationError
├── AuthenticationError
├── AuthorizationError
├── NotFoundError
├── ConflictError
├── RateLimitError
├── DatabaseError
├── ExternalServiceError
├── ConfigurationError
└── BusinessLogicError
```

### Error Properties

Every error includes:

- `code` - Unique error code (e.g., `USER_NOT_FOUND`)
- `message` - Human-readable error message
- `statusCode` - HTTP status code (400, 401, 404, 500, etc.)
- `category` - Error category (validation, auth, database, etc.)
- `severity` - Severity level (low, medium, high, critical)
- `isOperational` - Whether error is expected/handled
- `retryable` - Whether operation can be retried
- `metadata` - Additional context data
- `timestamp` - When error occurred

## Quick Start

### Basic Usage

```typescript
import { ErrorFactory, handleApiError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      throw ErrorFactory.requiredField('userId');
    }

    const user = await findUser(userId);

    if (!user) {
      throw ErrorFactory.userNotFound(userId);
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### Using Error Handler HOF

```typescript
import { withErrorHandler, assertFound } from '@/lib/errors';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = request.nextUrl.searchParams.get('userId');
  const user = await findUser(userId);

  assertFound(user, 'User', userId);

  return NextResponse.json(user);
});
```

## Usage Guide

### 1. Throwing Errors

#### Using ErrorFactory (Recommended)

```typescript
// Validation errors
throw ErrorFactory.validation('Invalid email format', 'email', email);
throw ErrorFactory.requiredField('username');
throw ErrorFactory.invalidField('age', age, 'Must be 18 or older');

// Authentication errors
throw ErrorFactory.authentication('Please log in');
throw ErrorFactory.invalidCredentials();
throw ErrorFactory.tokenExpired();

// Authorization errors
throw ErrorFactory.authorization('Admin access required', 'admin');
throw ErrorFactory.insufficientPermissions('users:delete', userRole);

// Not found errors
throw ErrorFactory.notFound('User', userId);
throw ErrorFactory.userNotFound(userId);
throw ErrorFactory.promptNotFound(promptId);

// Conflict errors
throw ErrorFactory.conflict('Email already in use');
throw ErrorFactory.userAlreadyExists(email);
throw ErrorFactory.duplicatePrompt();

// Rate limit errors
throw ErrorFactory.rateLimit(resetDate, limit, current);

// Database errors
throw ErrorFactory.database('Query failed', 'find', 'users');
throw ErrorFactory.databaseConnection();

// External service errors
throw ErrorFactory.externalService('OpenAI', 'API request failed');
throw ErrorFactory.aiProvider('OpenAI', 'Model not available');

// Business logic errors
throw ErrorFactory.businessLogic('Cannot delete active subscription');
throw ErrorFactory.quotaExceeded(maxQuota, currentUsage);
throw ErrorFactory.featureNotAvailable('Advanced AI', 'Premium');

// Configuration errors
throw ErrorFactory.configuration('Invalid API key');
throw ErrorFactory.missingEnv('DATABASE_URL');
```

#### Using Error Codes

```typescript
import { ErrorFactory } from '@/lib/errors';

throw ErrorFactory.fromCode('USER_NOT_FOUND', 'Custom message', {
  userId: '123',
  additionalContext: 'value',
});
```

### 2. Handling Errors

#### Automatic Error Handling

```typescript
import { handleApiError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    // Your route logic
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

#### Using withErrorHandler HOF

```typescript
import { withErrorHandler } from '@/lib/errors';

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Any errors thrown here are automatically caught and handled
  const data = await processRequest(request);
  return NextResponse.json(data);
});
```

#### Using asyncHandler

```typescript
import { asyncHandler } from '@/lib/errors';

export async function DELETE(request: NextRequest) {
  return asyncHandler(request, async () => {
    await deleteResource();
    return new NextResponse(null, { status: 204 });
  });
}
```

### 3. Validation

#### Schema Validation

```typescript
import { validateSchema } from '@/lib/errors';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().min(18),
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Automatically validates and throws on failure
  const body = await validateSchema(request, userSchema);

  // body is now typed as { email: string; name: string; age: number; }
  const user = await createUser(body);
  return NextResponse.json(user);
});
```

### 4. Assertions

```typescript
import {
  assertFound,
  assertAuthorized,
  assertAuthenticated,
  assertValidState
} from '@/lib/errors';

// Assert resource exists
const user = await findUser(userId);
assertFound(user, 'User', userId);

// Assert user is authenticated
assertAuthenticated(!!session);

// Assert user has permission
assertAuthorized(user.role === 'admin', 'admin');

// Assert valid business state
assertValidState(user.status === 'active', 'User must be active');
```

### 5. Error Metadata

Add context to errors:

```typescript
throw ErrorFactory.validation('Invalid input', 'email', email, {
  pattern: /^[a-z]+@[a-z]+\.[a-z]+$/,
  attemptedValue: email,
  validationRule: 'email-format',
  userId: currentUserId,
  timestamp: new Date(),
});
```

### 6. Custom Error Codes

Create errors from registry codes:

```typescript
import { ERROR_REGISTRY, ErrorFactory } from '@/lib/errors';

// Use predefined error codes
throw ErrorFactory.fromCode('RATE_LIMIT_EXCEEDED', undefined, {
  resetAt: new Date(Date.now() + 60000),
  limit: 100,
  current: 105,
});

// Check all available codes
console.log(Object.keys(ERROR_REGISTRY));
```

## API Reference

### ErrorFactory

Static methods for creating errors:

- `fromCode(code, message?, metadata?)` - Create from error code
- `validation(message, field?, value?, metadata?)` - Validation error
- `requiredField(field, metadata?)` - Required field error
- `invalidField(field, value, reason?, metadata?)` - Invalid field error
- `authentication(message?, metadata?)` - Auth error
- `invalidCredentials(metadata?)` - Invalid credentials
- `tokenExpired(metadata?)` - Token expired
- `authorization(message?, permission?, metadata?)` - Authorization error
- `insufficientPermissions(permission, role?, metadata?)` - Permission error
- `notFound(resource, resourceId?, metadata?)` - Not found error
- `userNotFound(userId?, metadata?)` - User not found
- `promptNotFound(promptId?, metadata?)` - Prompt not found
- `conflict(message, metadata?)` - Conflict error
- `userAlreadyExists(email, metadata?)` - User exists error
- `duplicatePrompt(metadata?)` - Duplicate prompt
- `rateLimit(resetAt?, limit?, current?, metadata?)` - Rate limit error
- `database(message, operation?, collection?, metadata?)` - Database error
- `databaseConnection(metadata?)` - DB connection error
- `externalService(service, message?, metadata?)` - External service error
- `aiProvider(provider, message?, metadata?)` - AI provider error
- `businessLogic(message, rule?, metadata?)` - Business logic error
- `quotaExceeded(quota, current, metadata?)` - Quota exceeded
- `featureNotAvailable(feature, plan?, metadata?)` - Feature not available
- `configuration(message, configKey?, metadata?)` - Configuration error
- `missingEnv(variable, metadata?)` - Missing env variable
- `internal(message?, metadata?)` - Internal error
- `fromUnknown(error, defaultMessage?)` - Convert unknown error

### Error Handling

- `handleApiError(error, request?, options?)` - Handle error in API route
- `toAppError(error)` - Convert unknown error to AppError
- `withErrorHandler(handler, options?)` - HOF wrapper for routes
- `asyncHandler(request, handler, options?)` - Async handler wrapper
- `validateSchema(request, schema)` - Validate request body

### Assertions

- `assertFound(value, resource, resourceId?)` - Assert resource exists
- `assertAuthorized(condition, permission?, message?)` - Assert authorized
- `assertAuthenticated(condition, message?)` - Assert authenticated
- `assertValidState(condition, message, rule?)` - Assert valid state

### Error Properties

- `error.code` - Error code string
- `error.message` - Error message
- `error.statusCode` - HTTP status code
- `error.category` - Error category
- `error.severity` - Severity level
- `error.isOperational` - Is operational error
- `error.retryable` - Is retryable
- `error.metadata` - Additional metadata
- `error.timestamp` - Error timestamp
- `error.toJSON()` - Serialize for API
- `error.toLog()` - Serialize for logging
- `error.toSanitized()` - Sanitized for production

## Migration Guide

### From Old Pattern

**Before:**
```typescript
try {
  const user = await findUser(id);
  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }
} catch (error) {
  logger.error('Error finding user', { error });
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**After:**
```typescript
import { ErrorFactory, handleApiError, assertFound } from '@/lib/errors';

try {
  const user = await findUser(id);
  assertFound(user, 'User', id);
  // ... continue with user
} catch (error) {
  return handleApiError(error, request);
}
```

### From sanitize.ts Functions

**Before:**
```typescript
import { sanitizeNotFoundError, sanitizeAuthError } from '@/lib/errors/sanitize';

if (!user) {
  const error = sanitizeNotFoundError('User');
  return NextResponse.json({ error: error.message }, { status: error.statusCode });
}
```

**After:**
```typescript
import { ErrorFactory, handleApiError } from '@/lib/errors';

if (!user) {
  throw ErrorFactory.notFound('User', userId);
}
// handleApiError will automatically format the response
```

### From Response Helpers

**Before:**
```typescript
import { fail, unauthorized, notFound } from '@/lib/api/response';

if (!session) {
  return unauthorized('Please log in');
}

if (!resource) {
  return notFound('Resource not found');
}
```

**After:**
```typescript
import { ErrorFactory, assertAuthenticated, assertFound } from '@/lib/errors';

assertAuthenticated(!!session, 'Please log in');
assertFound(resource, 'Resource', resourceId);
```

### Complete Route Migration

**Before:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const user = await findUser(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    logger.error('Error in GET /api/users', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

  const user = await findUser(id);
  assertFound(user, 'User', id);

  return NextResponse.json(user);
});
```

## Best Practices

### 1. Use Assertion Helpers

Instead of manual checks, use assertion helpers:

```typescript
// ❌ Don't
if (!user) {
  throw ErrorFactory.notFound('User', userId);
}

// ✅ Do
assertFound(user, 'User', userId);
```

### 2. Use withErrorHandler for Routes

Wrap route handlers to avoid try-catch boilerplate:

```typescript
// ❌ Don't
export async function GET(request: NextRequest) {
  try {
    // logic
  } catch (error) {
    return handleApiError(error, request);
  }
}

// ✅ Do
export const GET = withErrorHandler(async (request: NextRequest) => {
  // logic
});
```

### 3. Add Meaningful Metadata

Include context that helps debugging:

```typescript
throw ErrorFactory.database('Query failed', 'findOne', 'users', {
  userId,
  query: { email },
  timestamp: new Date(),
});
```

### 4. Use Specific Error Methods

Use specific factory methods instead of generic ones:

```typescript
// ❌ Less specific
throw ErrorFactory.notFound('User', userId);

// ✅ More specific
throw ErrorFactory.userNotFound(userId);
```

### 5. Validate Early

Validate input at the start of route handlers:

```typescript
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Validate first
  const body = await validateSchema(request, createUserSchema);

  // Then process
  const user = await createUser(body);
  return NextResponse.json(user);
});
```

### 6. Handle Retryable Errors

Check if errors are retryable for retry logic:

```typescript
try {
  await operation();
} catch (error) {
  const appError = toAppError(error);

  if (appError.retryable) {
    // Implement retry logic
    await retry(operation, { maxRetries: 3 });
  } else {
    throw appError;
  }
}
```

### 7. Log Appropriately

Errors are automatically logged by `handleApiError`, but you can add custom logging:

```typescript
try {
  await criticalOperation();
} catch (error) {
  logger.error('Critical operation failed', {
    operation: 'criticalOperation',
    userId,
    metadata: { ... },
  });
  throw error; // Re-throw to be handled by error handler
}
```

## Error Categories

- **VALIDATION** - Request/data validation failures
- **AUTHENTICATION** - Authentication failures
- **AUTHORIZATION** - Permission/access control failures
- **BUSINESS_LOGIC** - Domain/business rule violations
- **EXTERNAL_SERVICE** - Third-party API failures
- **DATABASE** - Database operation failures
- **NETWORK** - Network-related errors
- **CONFIGURATION** - Configuration/environment issues
- **SYSTEM** - System-level errors
- **RATE_LIMIT** - Rate limiting
- **NOT_FOUND** - Resource not found

## Severity Levels

- **LOW** - Minor issues, user errors
- **MEDIUM** - Moderate issues, operational errors
- **HIGH** - Serious issues, system errors
- **CRITICAL** - Critical issues, requires immediate attention

## Error Response Format

### Development

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "statusCode": 404,
    "category": "not_found",
    "severity": "low",
    "metadata": {
      "userId": "123"
    },
    "timestamp": "2025-01-15T10:30:00.000Z",
    "stack": "Error: User not found\n    at ..."
  }
}
```

### Production

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "statusCode": 404,
    "category": "not_found",
    "timestamp": "2025-01-15T10:30:00.000Z"
  }
}
```

## Contributing

When adding new error codes:

1. Add to `ERROR_REGISTRY` in `registry.ts`
2. Optionally add factory method in `factory.ts`
3. Document in this README
4. Add example in `examples.ts`

## Support

For questions or issues, please refer to:
- Examples: `src/lib/errors/examples.ts`
- Tests: `src/lib/errors/__tests__/`
- Main docs: `src/lib/errors/README.md`
