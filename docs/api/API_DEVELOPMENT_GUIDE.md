# API Development Guide

## Overview

This guide provides comprehensive documentation for developing, testing, and maintaining APIs in the Engify.ai platform. It covers best practices, testing strategies, and development workflows.

## Table of Contents

1. [API Development Standards](#api-development-standards)
2. [Testing Strategies](#testing-strategies)
3. [Documentation Requirements](#documentation-requirements)
4. [Performance Guidelines](#performance-guidelines)
5. [Security Best Practices](#security-best-practices)
6. [Error Handling](#error-handling)
7. [Versioning Strategy](#versioning-strategy)
8. [Development Workflow](#development-workflow)
9. [Troubleshooting](#troubleshooting)

## API Development Standards

### 1. Code Structure

All API routes should follow this structure:

```typescript
// src/app/api/v2/[endpoint]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

// Request validation schema
const RequestSchema = z.object({
  // Define your schema here
});

// Response type
interface ApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: {
    requestId: string;
    timestamp: string;
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Request validation
    const body = await request.json();
    const validatedData = RequestSchema.parse(body);

    // 3. Business logic
    const result = await processRequest(validatedData);

    // 4. Response
    return NextResponse.json({
      success: true,
      data: result,
      metadata: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Error handling
    return handleApiError(error);
  }
}
```

### 2. Naming Conventions

- **Files**: Use kebab-case for API routes (`user-management/route.ts`)
- **Functions**: Use camelCase (`processUserRequest`)
- **Constants**: Use SCREAMING_SNAKE_CASE (`MAX_RETRIES`)
- **Types**: Use PascalCase (`UserResponse`)

### 3. Import Organization

```typescript
// 1. React/Next.js imports
import { NextRequest, NextResponse } from 'next/server';

// 2. External library imports
import { z } from 'zod';

// 3. Internal imports
import { auth } from '@/lib/auth';
import { validateRequest } from '@/lib/validation';

// 4. Type imports
import type { ApiResponse } from '@/types/api';
```

## Testing Strategies

### 1. Unit Tests

Test individual functions and components:

```typescript
// src/lib/api/__tests__/user-api.test.ts
import { describe, it, expect, vi } from 'vitest';
import { processUserRequest } from '../user-api';

describe('User API', () => {
  it('should process valid user request', async () => {
    const mockRequest = {
      email: 'test@example.com',
      name: 'Test User',
    };

    const result = await processUserRequest(mockRequest);

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
  });
});
```

### 2. Integration Tests

Test API endpoints end-to-end:

```typescript
// src/lib/api/__tests__/integration/user-api.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/v2/users/route';

describe('User API Integration', () => {
  it('should create user successfully', async () => {
    const request = new Request('http://localhost:3000/api/v2/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

### 3. Contract Tests

Ensure API responses match documentation:

```typescript
// src/lib/api/__tests__/contract-testing.test.ts
import { describe, it, expect } from 'vitest';

describe('API Contract Testing', () => {
  it('should match documented response schema', () => {
    const mockResponse = {
      success: true,
      data: { id: '123', email: 'test@example.com' },
      metadata: { requestId: 'req_123', timestamp: '2025-10-28T00:00:00Z' },
    };

    // Test response structure
    expect(mockResponse).toHaveProperty('success');
    expect(mockResponse).toHaveProperty('data');
    expect(mockResponse).toHaveProperty('metadata');
  });
});
```

## Documentation Requirements

### 1. OpenAPI Specification

Every API endpoint must be documented in the OpenAPI specification:

```yaml
# docs/api/openapi.yaml
paths:
  /api/v2/users:
    post:
      summary: Create a new user
      description: Creates a new user account
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                name:
                  type: string
              required:
                - email
                - name
      responses:
        '200':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
```

### 2. Code Comments

Document complex logic and business rules:

```typescript
/**
 * Processes user creation request with validation and error handling
 * @param requestData - Validated user data from request
 * @returns Promise<ApiResponse> - Standardized API response
 */
async function processUserRequest(
  requestData: UserRequestData
): Promise<ApiResponse> {
  // Implementation here
}
```

### 3. README Files

Each API module should have a README:

```markdown
# User Management API

## Overview

Handles user CRUD operations and authentication.

## Endpoints

- `POST /api/v2/users` - Create user
- `GET /api/v2/users` - List users
- `GET /api/v2/users/{id}` - Get user by ID

## Testing

Run tests with: `npm test src/lib/api/__tests__/user-api.test.ts`
```

## Performance Guidelines

### 1. Response Time Targets

- **Health checks**: < 100ms
- **Simple queries**: < 500ms
- **Complex operations**: < 2s
- **AI requests**: < 10s

### 2. Caching Strategy

```typescript
// Implement caching for frequently accessed data
import { cache } from 'react';

export const getCachedUserData = cache(async (userId: string) => {
  // Implementation with caching
});
```

### 3. Database Optimization

- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries

### 4. Rate Limiting

```typescript
// Implement rate limiting
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimitResult = await rateLimit(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  // Continue with request processing
}
```

## Security Best Practices

### 1. Input Validation

Always validate and sanitize input:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email().max(255),
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s]+$/),
  age: z.number().int().min(0).max(120),
});
```

### 2. Authentication

Check authentication for protected endpoints:

```typescript
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  // Continue with authenticated request
}
```

### 3. Authorization

Implement role-based access control:

```typescript
import { checkPermission } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session) return unauthorizedResponse();

  const hasPermission = await checkPermission(session.user.id, 'delete_user');
  if (!hasPermission) {
    return NextResponse.json(
      { success: false, error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
  // Continue with authorized request
}
```

### 4. CORS Configuration

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Access-Control-Allow-Origin', 'https://engify.ai');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  return response;
}
```

## Error Handling

### 1. Standardized Error Responses

```typescript
interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  timestamp: string;
  requestId: string;
}

export function createErrorResponse(
  error: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
    { status }
  );
}
```

### 2. Error Codes

Use consistent error codes:

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `AUTHORIZATION_DENIED` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `RESOURCE_NOT_FOUND` - Requested resource not found
- `PROVIDER_UNAVAILABLE` - External service unavailable
- `QUOTA_EXCEEDED` - API quota exceeded
- `INTERNAL_ERROR` - Internal server error

### 3. Error Logging

```typescript
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Request processing
  } catch (error) {
    logger.error('API Error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });

    return createErrorResponse('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
```

## Versioning Strategy

### 1. URL Versioning

Use URL-based versioning: `/api/v2/users`

### 2. Backward Compatibility

- Maintain backward compatibility for at least 2 major versions
- Deprecate endpoints with 6-month notice
- Provide migration guides for breaking changes

### 3. Version Headers

```typescript
// Include version in response headers
response.headers.set('API-Version', '2.0.0');
response.headers.set('API-Deprecated', 'false');
```

## Development Workflow

### 1. Feature Development

1. Create feature branch: `git checkout -b feature/api-endpoint-name`
2. Implement API endpoint with tests
3. Update documentation
4. Run tests: `npm test`
5. Create pull request

### 2. Code Review Checklist

- [ ] API endpoint follows standard structure
- [ ] Input validation implemented
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Security measures implemented

### 3. Testing Workflow

```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/api/__tests__/user-api.test.ts

# Run tests with coverage
npm test -- --coverage

# Run integration tests
npm test -- --testPathPattern="integration"
```

### 4. Documentation Workflow

1. Update OpenAPI specification
2. Update API guide
3. Update Postman collection
4. Update developer documentation
5. Validate documentation: `npm run validate-docs`

## Troubleshooting

### 1. Common Issues

**Issue**: API endpoint returns 500 error
**Solution**: Check error logs, validate input, ensure database connection

**Issue**: Slow response times
**Solution**: Check database queries, implement caching, optimize algorithms

**Issue**: Authentication failures
**Solution**: Verify session configuration, check CORS settings

### 2. Debugging Tools

```typescript
// Enable debug logging
import { logger } from '@/lib/logger';

logger.debug('API Request', {
  method: request.method,
  url: request.url,
  headers: Object.fromEntries(request.headers),
});
```

### 3. Performance Monitoring

```typescript
// Add performance monitoring
import { performance } from 'perf_hooks';

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Process request
    const result = await processRequest();

    const endTime = performance.now();
    logger.info('API Performance', {
      endpoint: '/api/v2/users',
      duration: endTime - startTime,
      success: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    const endTime = performance.now();
    logger.error('API Performance', {
      endpoint: '/api/v2/users',
      duration: endTime - startTime,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}
```

### 4. Health Checks

```typescript
// Implement health check endpoint
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      database: await checkDatabaseHealth(),
      aiProviders: await checkAIProvidersHealth(),
      cache: await checkCacheHealth(),
    },
  };

  return NextResponse.json(health);
}
```

## Best Practices Summary

1. **Always validate input** - Use Zod schemas for request validation
2. **Handle errors gracefully** - Provide meaningful error messages
3. **Write comprehensive tests** - Unit, integration, and contract tests
4. **Document everything** - Keep OpenAPI spec and guides updated
5. **Monitor performance** - Set up logging and performance tracking
6. **Secure by default** - Implement authentication and authorization
7. **Version your APIs** - Use URL-based versioning
8. **Follow conventions** - Use consistent naming and structure
9. **Test thoroughly** - Run tests before deployment
10. **Monitor in production** - Set up health checks and monitoring

## Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zod Validation](https://zod.dev/)
- [Vitest Testing](https://vitest.dev/)
- [Postman Documentation](https://learning.postman.com/docs/publishing-your-api/documenting-your-api/)

## Support

For questions or issues:

- **Email**: donlaur@gmail.com
- **Documentation**: https://engify.ai/api-docs
- **GitHub**: https://github.com/donlaur/Engify-AI-App
