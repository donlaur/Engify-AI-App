# Input Validation Quick Reference Guide

## For Developers: How to Secure Your API Routes

This guide shows you how to add enterprise-level input validation to API routes using our new validation utilities.

## Quick Start

### 1. Import Validation Utilities

```typescript
import { z } from 'zod';
import { sanitizeText } from '@/lib/security/sanitize';
import { isValidObjectId } from '@/lib/validation/mongodb';
import { safeValidate, CommonSchemas } from '@/lib/validation/api';
```

### 2. Define Validation Schema

```typescript
const MyRequestSchema = z.object({
  title: z.string().min(1).max(200),
  email: CommonSchemas.email,
  category: z.enum(['option1', 'option2', 'option3']),
  items: z.array(z.string()).max(100), // Prevent DOS
});
```

### 3. Validate Request Data

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Option 1: Manual validation
  const validation = MyRequestSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: validation.error.flatten() },
      { status: 400 }
    );
  }
  const data = validation.data;

  // Option 2: Auto validation (returns validated data or error response)
  const result = safeValidate(MyRequestSchema, body);
  if (!result.success) {
    return result.response;
  }
  const data = result.data;
}
```

### 4. Sanitize Text Fields

```typescript
const sanitizedTitle = sanitizeText(data.title);
const sanitizedDescription = sanitizeText(data.description);
```

## Common Validation Patterns

### Query Parameters

```typescript
const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.enum(['cat1', 'cat2']).optional(),
});

// In your handler
const params = QuerySchema.parse({
  page: searchParams.get('page'),
  limit: searchParams.get('limit'),
  search: searchParams.get('search'),
  category: searchParams.get('category'),
});
```

### ObjectId Path Parameters

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  // Safe to use
  const objectId = new ObjectId(id);
}
```

### Email Validation

```typescript
const EmailSchema = z.object({
  email: CommonSchemas.email, // Validates, lowercases, trims
});
```

### Date Ranges

```typescript
const DateRangeSchema = CommonSchemas.dateRange;

const data = DateRangeSchema.parse({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});
// Ensures endDate >= startDate
```

### File Upload Validation

```typescript
const FileUploadSchema = z.object({
  filename: z.string().max(255).regex(/^[a-zA-Z0-9._-]+$/),
  size: z.number().int().max(10 * 1024 * 1024), // 10MB max
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});
```

## Security Checklist for API Routes

- [ ] Validate ALL query parameters with Zod schemas
- [ ] Validate ALL request body fields
- [ ] Sanitize text inputs with `sanitizeText()`
- [ ] Validate ObjectIds with `isValidObjectId()` before using
- [ ] Enforce maximum lengths on strings (prevent DOS)
- [ ] Enforce maximum array sizes (prevent DOS)
- [ ] Use enum validation for known values
- [ ] Check request body size with `validateBodySize()`
- [ ] Return detailed error messages for validation failures
- [ ] Add rate limiting for public endpoints
- [ ] Check RBAC permissions before processing
- [ ] Log validation failures for security monitoring

## Common Validation Schemas

### Pagination

```typescript
import { CommonSchemas } from '@/lib/validation/api';

const params = CommonSchemas.pagination.parse({
  page: searchParams.get('page'),
  limit: searchParams.get('limit'),
  skip: searchParams.get('skip'),
});
```

### Search Query

```typescript
const search = CommonSchemas.search.parse(searchParams.get('q'));
// Automatically sanitized and length-limited
```

### ID Array (for bulk operations)

```typescript
const ids = CommonSchemas.idArray.parse(body.ids);
// Max 100 IDs, prevents DOS
```

## Error Response Format

All validation errors follow this format:

```json
{
  "error": "Validation failed",
  "details": {
    "fieldErrors": {
      "email": ["Invalid email format"],
      "age": ["Expected number, received string"]
    },
    "formErrors": []
  },
  "fields": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "age",
      "message": "Expected number, received string"
    }
  ]
}
```

## Examples from Codebase

### Example 1: GET with Query Validation

See: `/src/app/api/prompts/route.ts`

```typescript
const PromptsQuerySchema = z.object({
  category: z.union([PromptCategorySchema, z.literal('all')]).optional(),
  pattern: PromptPatternSchema.optional(),
  search: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

const queryValidation = PromptsQuerySchema.safeParse({
  category: searchParams.get('category'),
  pattern: searchParams.get('pattern'),
  search: searchParams.get('search'),
  limit: searchParams.get('limit'),
  skip: searchParams.get('skip'),
});

if (!queryValidation.success) {
  return NextResponse.json(
    { error: 'Invalid query parameters', details: queryValidation.error.flatten() },
    { status: 400 }
  );
}
```

### Example 2: POST with Body Validation

See: `/src/app/api/prompts/route.ts`

```typescript
const validation = CreatePromptSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: 'Invalid prompt data', details: validation.error.flatten() },
    { status: 400 }
  );
}

const validatedData = validation.data;

// Sanitize text fields
const sanitizedTitle = sanitizeText(validatedData.title);
const sanitizedContent = sanitizeText(validatedData.content);
```

### Example 3: PATCH with Partial Updates

See: `/src/app/api/admin/prompts/[id]/route.ts`

```typescript
const PromptPatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  active: z.boolean().optional(),
  // ... other optional fields
});

const validation = PromptPatchSchema.safeParse(body);
if (!validation.success) {
  return NextResponse.json(
    { error: 'Invalid update data', details: validation.error.flatten() },
    { status: 400 }
  );
}

// Build update doc with sanitized values
const updateDoc: Record<string, unknown> = { updatedAt: new Date() };
if (validatedData.title) {
  updateDoc.title = sanitizeText(validatedData.title);
}
```

## Anti-Patterns to Avoid

### ❌ DON'T: Use request data directly

```typescript
// BAD - No validation
const body = await request.json();
await db.collection('users').insertOne(body);
```

### ✅ DO: Validate then use

```typescript
// GOOD - Validated and sanitized
const body = await request.json();
const validated = UserSchema.parse(body);
const sanitized = sanitizeObject(validated);
await db.collection('users').insertOne(sanitized);
```

### ❌ DON'T: Accept unlimited arrays

```typescript
// BAD - Can cause DOS
const items = z.array(z.string());
```

### ✅ DO: Limit array sizes

```typescript
// GOOD - Limited size
const items = z.array(z.string()).max(100);
```

### ❌ DON'T: Use ObjectId without validation

```typescript
// BAD - Can crash
const id = new ObjectId(params.id);
```

### ✅ DO: Validate before conversion

```typescript
// GOOD - Safe conversion
if (!isValidObjectId(params.id)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
const id = new ObjectId(params.id);
```

## Testing Validation

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('MyRequestSchema', () => {
  it('should accept valid data', () => {
    const result = MyRequestSchema.safeParse({
      title: 'Valid Title',
      email: 'user@example.com',
      category: 'option1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = MyRequestSchema.safeParse({
      title: 'Valid Title',
      email: 'invalid-email',
      category: 'option1',
    });
    expect(result.success).toBe(false);
  });

  it('should reject oversized title', () => {
    const result = MyRequestSchema.safeParse({
      title: 'x'.repeat(201),
      email: 'user@example.com',
      category: 'option1',
    });
    expect(result.success).toBe(false);
  });
});
```

## Performance Considerations

- Zod validation adds ~1-2ms per request (negligible)
- Early validation prevents expensive database queries
- Use `.transform()` sparingly (can impact performance)
- Cache compiled schemas at module level

## Additional Resources

- [Zod Documentation](https://zod.dev)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [MongoDB Injection Prevention](https://owasp.org/www-community/attacks/NoSQL_Injection)

## Questions?

See `/SECURITY_IMPROVEMENTS.md` for detailed security improvements.
