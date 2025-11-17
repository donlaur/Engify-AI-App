# Error Registry - Quick Reference

Fast lookup guide for common error handling patterns.

## Quick Import

```typescript
import {
  ErrorFactory,
  handleApiError,
  withErrorHandler,
  assertFound,
  assertAuthenticated,
  assertAuthorized,
  validateSchema,
} from '@/lib/errors';
```

## Common Patterns

### Route Handler Template

```typescript
export const GET = withErrorHandler(async (request: NextRequest) => {
  // Your logic here
  return NextResponse.json(data);
});
```

### Validation

```typescript
// Schema validation
const body = await validateSchema(request, mySchema);

// Required field
throw ErrorFactory.requiredField('email');

// Invalid field
throw ErrorFactory.invalidField('age', value, 'Must be 18+');
```

### Authentication & Authorization

```typescript
// Check authentication
assertAuthenticated(!!session);

// Check authorization
assertAuthorized(user.role === 'admin', 'admin');

// Check permission
assertAuthorized(hasPermission(user, 'posts:write'), 'posts:write');
```

### Not Found

```typescript
// Generic
assertFound(resource, 'Resource', id);

// Specific
throw ErrorFactory.userNotFound(userId);
throw ErrorFactory.promptNotFound(promptId);
```

### Conflicts

```typescript
// User exists
throw ErrorFactory.userAlreadyExists(email);

// Duplicate resource
throw ErrorFactory.duplicatePrompt();

// Generic conflict
throw ErrorFactory.conflict('Resource already exists');
```

### Rate Limiting

```typescript
throw ErrorFactory.rateLimit(
  resetDate,   // When rate limit resets
  100,         // Limit
  105          // Current count
);
```

### Database Errors

```typescript
// Connection error
throw ErrorFactory.databaseConnection();

// Query error
throw ErrorFactory.database('Query failed', 'findOne', 'users');
```

### External Services

```typescript
// Generic external service
throw ErrorFactory.externalService('ServiceName', 'Error message');

// AI provider
throw ErrorFactory.aiProvider('OpenAI', 'Model unavailable');
```

### Business Logic

```typescript
// Quota exceeded
throw ErrorFactory.quotaExceeded(maxQuota, currentUsage);

// Feature not available
throw ErrorFactory.featureNotAvailable('AI Chat', 'Premium');

// Generic business rule
throw ErrorFactory.businessLogic('Cannot delete active subscription');
```

### Configuration

```typescript
// Missing environment variable
throw ErrorFactory.missingEnv('DATABASE_URL');

// Invalid config
throw ErrorFactory.configuration('Invalid API key');
```

## Error Codes Reference

### Validation (400)
- `VALIDATION_ERROR`
- `VALIDATION_FIELD_REQUIRED`
- `VALIDATION_FIELD_INVALID`
- `VALIDATION_EMAIL_INVALID`
- `VALIDATION_PASSWORD_WEAK`

### Authentication (401)
- `AUTHENTICATION_ERROR`
- `AUTHENTICATION_INVALID_CREDENTIALS`
- `AUTHENTICATION_TOKEN_EXPIRED`
- `AUTHENTICATION_TOKEN_INVALID`
- `AUTHENTICATION_SESSION_EXPIRED`
- `AUTHENTICATION_MFA_REQUIRED`

### Authorization (403)
- `AUTHORIZATION_ERROR`
- `AUTHORIZATION_INSUFFICIENT_PERMISSIONS`
- `AUTHORIZATION_ROLE_REQUIRED`
- `AUTHORIZATION_RESOURCE_FORBIDDEN`

### Not Found (404)
- `NOT_FOUND`
- `USER_NOT_FOUND`
- `PROMPT_NOT_FOUND`
- `PATTERN_NOT_FOUND`
- `ROUTE_NOT_FOUND`

### Conflict (409)
- `CONFLICT_ERROR`
- `USER_ALREADY_EXISTS`
- `DUPLICATE_PROMPT`
- `RESOURCE_ALREADY_EXISTS`

### Unprocessable (422)
- `BUSINESS_LOGIC_ERROR`
- `QUOTA_EXCEEDED`
- `INVALID_STATE_TRANSITION`

### Rate Limit (429)
- `RATE_LIMIT_EXCEEDED`
- `RATE_LIMIT_API_QUOTA`
- `RATE_LIMIT_CONCURRENT_REQUESTS`

### Server Error (500)
- `INTERNAL_ERROR`
- `UNKNOWN_ERROR`
- `DATABASE_ERROR`
- `DATABASE_CONNECTION_ERROR`
- `DATABASE_QUERY_ERROR`
- `CONFIGURATION_ERROR`
- `MISSING_ENV_VARIABLE`

### External Service (502/503/504)
- `EXTERNAL_SERVICE_ERROR`
- `EXTERNAL_SERVICE_UNAVAILABLE`
- `EXTERNAL_SERVICE_TIMEOUT`
- `AI_PROVIDER_ERROR`
- `PAYMENT_PROVIDER_ERROR`

## Factory Methods

### Validation
```typescript
ErrorFactory.validation(message, field?, value?, metadata?)
ErrorFactory.requiredField(field)
ErrorFactory.invalidField(field, value, reason?)
```

### Auth
```typescript
ErrorFactory.authentication(message?)
ErrorFactory.invalidCredentials()
ErrorFactory.tokenExpired()
ErrorFactory.authorization(message?, permission?)
ErrorFactory.insufficientPermissions(permission, role?)
```

### Resources
```typescript
ErrorFactory.notFound(resource, resourceId?)
ErrorFactory.userNotFound(userId?)
ErrorFactory.promptNotFound(promptId?)
```

### Conflicts
```typescript
ErrorFactory.conflict(message)
ErrorFactory.userAlreadyExists(email)
ErrorFactory.duplicatePrompt()
```

### Rate Limit
```typescript
ErrorFactory.rateLimit(resetAt?, limit?, current?)
```

### Database
```typescript
ErrorFactory.database(message, operation?, collection?)
ErrorFactory.databaseConnection()
```

### External Services
```typescript
ErrorFactory.externalService(service, message?)
ErrorFactory.aiProvider(provider, message?)
```

### Business Logic
```typescript
ErrorFactory.businessLogic(message, rule?)
ErrorFactory.quotaExceeded(quota, current)
ErrorFactory.featureNotAvailable(feature, requiredPlan?)
```

### Configuration
```typescript
ErrorFactory.configuration(message, configKey?)
ErrorFactory.missingEnv(variable)
```

### Generic
```typescript
ErrorFactory.fromCode(code, message?, metadata?)
ErrorFactory.internal(message?)
ErrorFactory.fromUnknown(error)
```

## Assertion Helpers

```typescript
// Assert resource exists (throws NotFoundError)
assertFound(value, resource, resourceId?)

// Assert authenticated (throws AuthenticationError)
assertAuthenticated(condition, message?)

// Assert authorized (throws AuthorizationError)
assertAuthorized(condition, permission?, message?)

// Assert valid state (throws BusinessLogicError)
assertValidState(condition, message, rule?)
```

## Handler Patterns

### Pattern 1: withErrorHandler
```typescript
export const GET = withErrorHandler(async (request) => {
  // Logic here - errors caught automatically
});
```

### Pattern 2: handleApiError
```typescript
export async function POST(request: NextRequest) {
  try {
    // Logic here
  } catch (error) {
    return handleApiError(error, request);
  }
}
```

### Pattern 3: asyncHandler
```typescript
export async function DELETE(request: NextRequest) {
  return asyncHandler(request, async () => {
    // Logic here
  });
}
```

## Common Recipes

### Protected Route
```typescript
export const GET = withErrorHandler(async (request) => {
  const session = await getSession();
  assertAuthenticated(!!session);

  const user = await findUser(session.userId);
  assertFound(user, 'User', session.userId);

  return NextResponse.json(user);
});
```

### Create Resource
```typescript
export const POST = withErrorHandler(async (request) => {
  const session = await getSession();
  assertAuthenticated(!!session);

  const body = await validateSchema(request, createSchema);

  const existing = await findExisting(body.email);
  if (existing) {
    throw ErrorFactory.conflict('Resource already exists');
  }

  const resource = await create(body);
  return NextResponse.json(resource, { status: 201 });
});
```

### Update Resource
```typescript
export const PUT = withErrorHandler(async (request) => {
  const session = await getSession();
  assertAuthenticated(!!session);

  const id = request.nextUrl.searchParams.get('id');
  if (!id) throw ErrorFactory.requiredField('id');

  const resource = await find(id);
  assertFound(resource, 'Resource', id);

  assertAuthorized(resource.userId === session.userId, 'owner');

  const body = await validateSchema(request, updateSchema);
  const updated = await update(id, body);

  return NextResponse.json(updated);
});
```

### Delete Resource
```typescript
export const DELETE = withErrorHandler(async (request) => {
  const session = await getSession();
  assertAuthenticated(!!session);

  const id = request.nextUrl.searchParams.get('id');
  if (!id) throw ErrorFactory.requiredField('id');

  const resource = await find(id);
  assertFound(resource, 'Resource', id);

  assertAuthorized(
    resource.userId === session.userId || session.role === 'admin',
    'owner-or-admin'
  );

  await delete(id);
  return new NextResponse(null, { status: 204 });
});
```

### Paginated List
```typescript
export const GET = withErrorHandler(async (request) => {
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

  if (page < 1) {
    throw ErrorFactory.invalidField('page', page, 'Must be >= 1');
  }

  if (limit < 1 || limit > 100) {
    throw ErrorFactory.invalidField('limit', limit, 'Must be 1-100');
  }

  const { items, total } = await findPaginated(page, limit);

  return NextResponse.json({
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
```

## Testing

```typescript
import { ErrorFactory, toAppError } from '@/lib/errors';

describe('API Route', () => {
  it('throws NotFoundError when resource missing', async () => {
    const error = ErrorFactory.notFound('User', '123');

    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.category).toBe('not_found');
  });

  it('handles unknown errors', () => {
    const error = new Error('Something went wrong');
    const appError = toAppError(error);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.code).toBe('UNKNOWN_ERROR');
  });
});
```

## Environment-Specific Behavior

### Development
- Full error details in response
- Stack traces included
- All metadata exposed

### Production
- Sanitized error messages
- No stack traces
- Limited metadata
- Detailed logging server-side

## Tips

1. **Always use withErrorHandler** - Reduces boilerplate
2. **Use specific factory methods** - Better than generic `fromCode`
3. **Add metadata** - Helps debugging
4. **Use assertions** - Cleaner than if/throw
5. **Validate early** - Use `validateSchema` at route start
6. **Don't catch and re-throw** - Let errors bubble to handler
7. **Check retryable flag** - For retry logic
8. **Use specific error codes** - Better monitoring

## Links

- Full Documentation: `README.md`
- Migration Guide: `MIGRATION.md`
- Examples: `examples.ts`
- Registry: `registry.ts`
