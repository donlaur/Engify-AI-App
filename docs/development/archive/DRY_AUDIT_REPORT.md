# DRY Improvements Audit Report - Phase 5

**Date:** November 2, 2025  
**Branch:** `feature/dry-improvements`  
**Status:** In Progress  
**Priority:** High - Code quality and maintainability

---

## Executive Summary

Found **7 major duplication patterns** across 50+ files requiring consolidation:

1. **Rate Limiting Values** - 3 different rate limit systems with hardcoded values
2. **Prompt Fetching Logic** - 5 different implementations of prompt queries
3. **Pattern Fetching Logic** - 4 different implementations
4. **MongoDB Queries** - Duplicate query builders in 20+ files
5. **User-Facing Messages** - Hardcoded strings in 30+ files
6. **Validation Logic** - Duplicate Zod schemas and validation
7. **Admin CLI Scripts** - 10+ one-off scripts doing similar tasks

**Impact:**
- **Maintainability**: Changes require updating 5-10 files
- **Consistency**: Different implementations cause bugs
- **Testing**: Duplicate code means duplicate tests

---

## Pattern 1: Rate Limiting Duplication ⚠️ CRITICAL

### Problem

**3 different rate limiting systems** with inconsistent limits:

1. **`src/lib/rate-limit.ts`** (AI requests)
   - Anonymous: 3/hour, 10/day
   - Authenticated: 20/hour, 100/day
   - Pro: 200/hour, 2000/day

2. **`src/lib/db/schemas/usage.ts`** (Plan-based)
   - Free: 5/min, 100/month
   - Pro: 20/min, 1000/month
   - Team: 50/min, 5000/month

3. **`src/lib/security/feedback-rate-limit.ts`** (Feedback)
   - Anonymous: 10/min
   - Authenticated: 100/min

### Solution

Create **single source of truth**: `src/lib/constants/rates.ts`

```typescript
export const RATE_LIMITS = {
  ai: {
    anonymous: { perMinute: 3, perHour: 3, perDay: 10, perMonth: 100 },
    authenticated: { perMinute: 20, perHour: 20, perDay: 100, perMonth: 1000 },
    pro: { perMinute: 200, perHour: 200, perDay: 2000, perMonth: 20000 },
  },
  feedback: {
    anonymous: { perMinute: 10 },
    authenticated: { perMinute: 100 },
  },
  api: {
    public: { perMinute: 60 },
    authenticated: { perMinute: 300 },
  },
} as const;
```

---

## Pattern 2: Prompt Fetching Duplication ⚠️ HIGH

### Problem

**5 different implementations** of prompt fetching:

1. `/api/prompts/route.ts` - REST API with MongoDB
2. `src/lib/prompts/mongodb-prompts.ts` - Direct DB access
3. `src/lib/db/prompts.ts` - Another DB layer
4. `src/server/routers/prompt.ts` - tRPC implementation
5. `src/app/prompts/category/[category]/page.tsx` - Server Component

### Duplication Example

All 5 files have similar code:

```typescript
// Pattern repeated 5 times with slight variations
const db = await getMongoDb();
const collection = db.collection('prompts');
const prompts = await collection
  .find({ active: { $ne: false } })
  .sort({ createdAt: -1 })
  .toArray();
```

### Solution

Create **`src/hooks/usePrompts.ts`** for client components:

```typescript
export function usePrompts(filters?: PromptFilters) {
  const { data, error, isLoading } = useSWR(
    ['/api/prompts', filters],
    () => fetchPrompts(filters)
  );
  return { prompts: data, error, isLoading };
}
```

Create **`src/lib/queries/prompts.ts`** for server:

```typescript
export async function queryPrompts(filters: PromptFilters) {
  const db = await getMongoDb();
  const collection = db.collection('prompts');
  return buildPromptQuery(collection, filters).toArray();
}
```

---

## Pattern 3: Pattern Fetching Duplication ⚠️ HIGH

### Problem

**4 different implementations** of pattern fetching with identical logic

### Solution

Create **`src/hooks/usePatterns.ts`** and **`src/lib/queries/patterns.ts`**

---

## Pattern 4: Hardcoded Messages ⚠️ MEDIUM

### Problem

User-facing messages hardcoded in 30+ files:

```typescript
// Scattered across codebase
"Rate limit exceeded. Please try again later."
"Failed to fetch prompts"
"Please sign in to continue"
"Invalid input provided"
```

### Solution

Create **`src/lib/constants/messages.ts`**:

```typescript
export const ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: "Rate limit exceeded. Please try again later or upgrade your plan.",
  FETCH_FAILED: "Failed to fetch data. Please try again.",
  AUTH_REQUIRED: "Please sign in to continue.",
  INVALID_INPUT: "Invalid input provided. Please check your data.",
} as const;

export const SUCCESS_MESSAGES = {
  SAVED: "Saved successfully!",
  DELETED: "Deleted successfully!",
  COPIED: "Copied to clipboard!",
} as const;
```

---

## Pattern 5: Validation Logic Duplication ⚠️ MEDIUM

### Problem

Similar Zod validation patterns repeated:

```typescript
// Repeated in 10+ API routes
const bodySchema = z.object({
  userId: z.string().min(1),
  organizationId: z.string().optional(),
});
```

### Solution

Create **`src/lib/utils/validation.ts`**:

```typescript
export const commonSchemas = {
  userId: z.string().min(1),
  organizationId: z.string().optional(),
  pagination: z.object({
    limit: z.number().min(1).max(100).default(20),
    skip: z.number().min(0).default(0),
  }),
};
```

---

## Pattern 6: Admin CLI Fragmentation ⚠️ MEDIUM

### Problem

**10+ one-off admin scripts** doing similar tasks:

- `scripts/admin/check-prompts-count.js`
- `scripts/admin/check-today-content.js`
- `scripts/admin/check-content-length.js`
- `scripts/admin/check-beta-requests.js`
- (6 more similar scripts)

### Solution

**Consolidate into unified CLI**: `scripts/admin/engify-admin.ts`

```bash
# Instead of 10 scripts
pnpm admin:check-prompts
pnpm admin:check-content
pnpm admin:check-beta

# Single command with subcommands
pnpm admin stats prompts
pnpm admin stats content
pnpm admin stats beta
```

---

## Pattern 7: MongoDB Query Builders ⚠️ LOW

### Problem

Duplicate query building logic in 15+ files

### Solution

Create **`src/lib/queries/builders.ts`** with reusable query builders

---

## Implementation Plan

### Phase 5.1: Constants (1-2 hours) ✅ COMPLETE
- ✅ Create `src/lib/constants/rates.ts`
- ✅ Create `src/lib/constants/limits.ts`
- ✅ Create `src/lib/constants/messages.ts`
- ⏳ Update 3 rate limiting systems to use constants (gradual)
- ⏳ Update 30+ files with hardcoded messages (gradual)

### Phase 5.2: Hooks (2-3 hours) ✅ COMPLETE
- ✅ Create `src/hooks/usePrompts.ts`
- ✅ Create `src/hooks/usePatterns.ts`
- ⏳ Update 10+ components to use hooks (gradual)

### Phase 5.3: Validation Utilities (1 hour) ✅ COMPLETE
- ✅ Create `src/lib/utils/validation.ts`
- ⏳ Update 10+ API routes (gradual)

### Phase 5.4: Admin CLI (2 hours) ✅ COMPLETE
- ✅ Create `scripts/admin/engify-admin.ts`
- ⏳ Delete 10+ old scripts (after validation)
- ⏳ Update package.json scripts

### Phase 5.5: Tests (2 hours) ⏳ IN PROGRESS
- ⏳ Add tests for hooks
- ⏳ Add tests for validation utilities

### Phase 5.6: Documentation (1 hour) ✅ COMPLETE
- ✅ Create ADR-010: DRY Improvements
- ✅ Update DRY Audit Report

---

## Success Metrics

**Before**:
- 50+ files with duplicate code
- 3 rate limiting systems
- 5 prompt fetching implementations
- 10+ one-off admin scripts
- 30+ hardcoded message strings

**After**:
- Single source of truth for all constants
- 2 prompt fetching utilities (client hook + server query)
- 1 unified admin CLI
- 0 hardcoded messages

**Code Reduction**: ~2,000 lines of duplicate code eliminated

---

## Files to Create (11 new)

1. `src/lib/constants/rates.ts`
2. `src/lib/constants/limits.ts`
3. `src/lib/constants/messages.ts`
4. `src/hooks/usePrompts.ts`
5. `src/hooks/usePatterns.ts`
6. `src/lib/queries/prompts.ts`
7. `src/lib/queries/patterns.ts`
8. `src/lib/queries/builders.ts`
9. `src/lib/utils/validation.ts`
10. `scripts/admin/engify-admin.ts`
11. `docs/development/ADR/010-dry-improvements.md`

---

## Files to Modify (40+)

### Rate Limiting (3 files)
- `src/lib/rate-limit.ts`
- `src/lib/db/schemas/usage.ts`
- `src/lib/security/feedback-rate-limit.ts`

### Prompt Fetching (10 files)
- `/api/prompts/route.ts`
- `src/lib/prompts/mongodb-prompts.ts`
- `src/lib/db/prompts.ts`
- `src/server/routers/prompt.ts`
- `src/app/prompts/category/[category]/page.tsx`
- `src/app/prompts/role/[role]/page.tsx`
- (4 more components)

### Messages (30+ files)
- All API routes with hardcoded error messages
- All components with hardcoded toast messages

---

## Related Documentation

- [Day 7 QA Plan](../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Code Quality Review](../architecture/CODE_QUALITY_REVIEW.md)
- [Enterprise Compliance Audit](../ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md)

---

## Status Update

**Date:** November 2, 2025  
**Status:** ✅ Core Implementation Complete  
**Branch:** `feature/dry-improvements`  
**Commits:** 2 atomic commits

### Completed ✅
1. ✅ Constants files (rates, limits, messages)
2. ✅ Hooks (usePrompts, usePatterns)
3. ✅ Validation utilities (common Zod schemas)
4. ✅ Admin CLI (consolidated tool)
5. ✅ Documentation (ADR-010, audit updates)

### In Progress ⏳
6. ⏳ Tests for hooks and utilities
7. ⏳ Gradual migration of existing code

### Not Started 📋
8. 📋 Update package.json scripts
9. 📋 Delete old admin scripts (after validation)

---

**Estimated Effort:** 12-15 hours total (8 hours complete)  
**Risk Level:** Low (creates new files, minimal changes to existing)  
**Merge Conflicts:** Minimal (parallel work safe with Day 7 QA branch)

