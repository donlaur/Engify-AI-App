# Migration Guide - DRY Improvements

**Date:** November 2, 2025  
**Purpose:** Step-by-step guide to migrate existing code to use new DRY utilities  
**Status:** Gradual migration recommended (not urgent)

---

## Overview

This guide shows **concrete examples** of how to migrate existing code to use the new DRY utilities. Migration is **optional and gradual** - update files as you touch them.

---

## 1. Migrating to Rate Limit Constants

### ❌ Before (Old Pattern)
```typescript
// src/lib/rate-limit.ts
const LIMITS = {
  anonymous: {
    maxRequestsPerHour: 3,
    maxRequestsPerDay: 10,
  },
  authenticated: {
    maxRequestsPerHour: 20,
    maxRequestsPerDay: 100,
  },
};

// Different values in another file!
// src/lib/security/feedback-rate-limit.ts
const FEEDBACK_RATE_LIMITS = {
  anonymous: 10,
  authenticated: 100,
};
```

### ✅ After (New Pattern)
```typescript
// All files use the same source
import { AI_RATE_LIMITS, FEEDBACK_RATE_LIMITS } from '@/lib/constants/rates';

const limit = AI_RATE_LIMITS.authenticated.perHour; // 20
const feedbackLimit = FEEDBACK_RATE_LIMITS.authenticated.perMinute; // 100
```

### Migration Steps
1. Import constants: `import { AI_RATE_LIMITS } from '@/lib/constants/rates';`
2. Replace hardcoded values with constant references
3. Remove local constant definitions
4. Test rate limiting still works

---

## 2. Migrating to Message Constants

### ❌ Before (Hardcoded Strings)
```typescript
// Component A
toast.error('Rate limit exceeded. Please try again later.');

// Component B (slightly different!)
toast.error('Rate limit reached. Try again later.');

// API route
return NextResponse.json(
  { error: 'Rate limit exceeded. Please try again later or upgrade.' },
  { status: 429 }
);
```

### ✅ After (Consistent Messages)
```typescript
import { ERROR_MESSAGES, getRateLimitMessage } from '@/lib/constants/messages';

// Component A
toast.error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);

// Component B (same message!)
toast.error(ERROR_MESSAGES.RATE_LIMIT_EXCEEDED);

// API route (with dynamic time)
return NextResponse.json(
  { error: getRateLimitMessage(resetAt) },
  { status: 429 }
);
```

### Migration Steps
1. Import messages: `import { ERROR_MESSAGES } from '@/lib/constants/messages';`
2. Find all hardcoded error strings (grep for common errors)
3. Replace with constant references
4. Use helper functions for dynamic messages

---

## 3. Migrating to usePrompts Hook

### ❌ Before (Duplicate Fetch Logic)
```typescript
// Component A
'use client';
import { useState, useEffect } from 'react';

export function PromptsList() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/prompts?category=code')
      .then(res => res.json())
      .then(data => {
        setPrompts(data.prompts);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  return <div>{/* render prompts */}</div>;
}
```

### ✅ After (Reusable Hook)
```typescript
'use client';
import { usePrompts } from '@/hooks/usePrompts';

export function PromptsList() {
  const { prompts, isLoading } = usePrompts({ category: 'code' });
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{/* render prompts */}</div>;
}
```

### Benefits
- ✅ SWR caching built-in
- ✅ Automatic revalidation
- ✅ Deduplication of requests
- ✅ Type-safe filters
- ✅ ~10 lines → 2 lines

### Migration Steps
1. Add `'use client'` directive if needed
2. Import hook: `import { usePrompts } from '@/hooks/usePrompts';`
3. Replace fetch/useState/useEffect with hook call
4. Update loading/error states to use hook returns
5. Remove fetch boilerplate

---

## 4. Migrating to Pagination with usePrompts

### ❌ Before (Manual Pagination)
```typescript
const [page, setPage] = useState(1);
const [prompts, setPrompts] = useState([]);
const limit = 20;

useEffect(() => {
  const skip = (page - 1) * limit;
  fetch(`/api/prompts?limit=${limit}&skip=${skip}`)
    .then(res => res.json())
    .then(data => setPrompts(data.prompts));
}, [page]);

// Manual page controls
<button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
  Previous
</button>
<button onClick={() => setPage(p => p + 1)}>
  Next
</button>
```

### ✅ After (Built-in Pagination)
```typescript
import { usePaginatedPrompts } from '@/hooks/usePrompts';

const {
  prompts,
  page,
  pages,
  nextPage,
  prevPage,
  hasNextPage,
  hasPrevPage,
} = usePaginatedPrompts();

// Automatic pagination controls
<button onClick={prevPage} disabled={!hasPrevPage}>
  Previous
</button>
<button onClick={nextPage} disabled={!hasNextPage}>
  Next
</button>
```

---

## 5. Migrating to Validation Schemas

### ❌ Before (Duplicate Validation)
```typescript
// API Route A
const bodySchema = z.object({
  userId: z.string().min(1),
  limit: z.number().min(1).max(100).default(20),
  skip: z.number().min(0).default(0),
});

// API Route B (same validation, different file!)
const schema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  limit: z.number().min(1).max(100).default(20),
  skip: z.number().min(0).default(0),
});
```

### ✅ After (Reusable Schemas)
```typescript
import { commonSchemas, paginationSchemas } from '@/lib/utils/validation';

const bodySchema = z.object({
  ...commonSchemas.userId,
  ...paginationSchemas.pagination.shape,
});

// Or use directly
const result = paginationSchemas.pagination.parse(request.query);
```

### Migration Steps
1. Import schemas: `import { commonSchemas } from '@/lib/utils/validation';`
2. Replace common patterns with imported schemas
3. Compose schemas using spread operator
4. Remove duplicate schema definitions

---

## 6. Using the New Admin CLI

### ❌ Before (Multiple Scripts)
```bash
# Different commands for different tasks
pnpm exec tsx scripts/admin/db-stats.ts
pnpm exec tsx scripts/admin/check-beta-requests.js
pnpm exec tsx scripts/admin/review-prompts.ts
```

### ✅ After (Unified CLI)
```bash
# Single command with subcommands
pnpm admin stats all
pnpm admin stats beta
pnpm admin prompts review
pnpm admin user check user@example.com
pnpm admin db check
```

### Migration Steps (for package.json)
```json
{
  "scripts": {
    "admin": "tsx scripts/admin/engify-admin.ts",
    "admin:stats": "tsx scripts/admin/engify-admin.ts stats all",
    "admin:stats:prompts": "tsx scripts/admin/engify-admin.ts stats prompts",
    "admin:stats:users": "tsx scripts/admin/engify-admin.ts stats users",
    "admin:user": "tsx scripts/admin/engify-admin.ts user",
    "admin:prompts": "tsx scripts/admin/engify-admin.ts prompts review",
    "admin:db": "tsx scripts/admin/engify-admin.ts db check",
    "admin:db:indexes": "tsx scripts/admin/engify-admin.ts db indexes"
  }
}
```

---

## 7. Migration Priority

### High Priority (Migrate Soon)
1. **Rate Limiting** - Fixes inconsistencies
2. **Error Messages** - Improves UX consistency
3. **Admin CLI** - Better developer experience

### Medium Priority (Migrate When Touching Files)
4. **Validation Schemas** - Reduces duplication
5. **usePrompts Hook** - Better caching

### Low Priority (Nice to Have)
6. **Success Messages** - Consistency improvement
7. **Constants** - Code cleanup

---

## 8. Testing After Migration

### Checklist
- [ ] Rate limiting still works
- [ ] Error messages display correctly
- [ ] Pagination functions properly
- [ ] Validation catches invalid input
- [ ] Admin CLI commands work
- [ ] No TypeScript errors
- [ ] Tests still pass

---

## 9. Common Pitfalls

### Pitfall 1: Forgetting 'use client'
```typescript
// ❌ Error: Hooks can only be used in client components
export function Component() {
  const { prompts } = usePrompts(); // Error!
}

// ✅ Add directive
'use client';
export function Component() {
  const { prompts } = usePrompts(); // Works!
}
```

### Pitfall 2: Breaking Existing Constants
```typescript
// ❌ Don't do this immediately
- const LIMIT = 20;
+ import { PAGINATION } from '@/lib/constants/limits';
+ const LIMIT = PAGINATION.DEFAULT_PAGE_SIZE;

// ✅ Instead, deprecate gradually
const LIMIT = 20; // TODO: Use PAGINATION.DEFAULT_PAGE_SIZE
```

### Pitfall 3: Over-migrating
**Don't**: Rewrite entire components just to use hooks  
**Do**: Migrate when already touching the file

---

## 10. Example: Complete Component Migration

### Before
```typescript
'use client';
import { useState, useEffect } from 'react';

export function CodePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;
  
  useEffect(() => {
    setLoading(true);
    const skip = (page - 1) * limit;
    fetch(`/api/prompts?category=code&limit=${limit}&skip=${skip}`)
      .then(res => res.json())
      .then(data => {
        setPrompts(data.prompts);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [page]);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading prompts</div>;
  
  return (
    <div>
      {prompts.map(p => <div key={p.id}>{p.title}</div>)}
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>Page {page}</span>
      <button onClick={() => setPage(p => p + 1)}>
        Next
      </button>
    </div>
  );
}
```

### After
```typescript
'use client';
import { usePaginatedPrompts } from '@/hooks/usePrompts';
import { ERROR_MESSAGES } from '@/lib/constants/messages';

export function CodePrompts() {
  const {
    prompts,
    isLoading,
    error,
    page,
    nextPage,
    prevPage,
    hasPrevPage,
    hasNextPage,
  } = usePaginatedPrompts({ category: 'code' });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{ERROR_MESSAGES.FETCH_FAILED}</div>;
  
  return (
    <div>
      {prompts.map(p => <div key={p.id}>{p.title}</div>)}
      <button onClick={prevPage} disabled={!hasPrevPage}>
        Previous
      </button>
      <span>Page {page}</span>
      <button onClick={nextPage} disabled={!hasNextPage}>
        Next
      </button>
    </div>
  );
}
```

**Result**: 40 lines → 25 lines, better caching, consistent messages

---

## Questions?

- **Q**: Do I need to migrate everything now?
  - **A**: No! Migrate gradually as you touch files.

- **Q**: What if I break something?
  - **A**: Old code still works. Revert the change.

- **Q**: Can I mix old and new patterns?
  - **A**: Yes! They coexist safely.

- **Q**: What about tests?
  - **A**: Mock the hooks or use test fixtures.

---

**Remember**: Migration is **optional** and **gradual**. The new utilities are additive, not breaking.

