# Critical Tasks - November 2, 2025

**Status:** 1 of 4 complete  
**Branch:** `feature/day-7-qa-improvements`  
**Blocker:** Node modules need installation

---

## ✅ COMPLETED

### 1. Add Tests for `/api/favorites` Endpoint ✅
**File Created:** `src/app/api/favorites/__tests__/route.test.ts`

**Coverage:**
- ✅ GET endpoint (5 tests)
  - Unauthorized access
  - Empty favorites
  - Return favorites
  - Rate limiting
  - Database errors
- ✅ POST endpoint (7 tests)
  - Authentication checks
  - Input validation
  - Prompt validation
  - Add to favorites with $addToSet
  - Audit logging
  - User existence check
  - Rate limiting
- ✅ DELETE endpoint (6 tests)
  - Authentication checks
  - Input validation
  - Remove from favorites with $pull
  - Audit logging
  - User existence check
  - Rate limiting

**Total:** 18 comprehensive tests covering all enterprise requirements

---

## 🚨 CRITICAL - Must Do Next

### 2. Install Dependencies
**Command:**
```bash
cd /Users/donlaur/.cursor/worktrees/Engify-AI-App/VLhSW
pnpm install
```

**Why Critical:** All remaining tasks require node_modules

**Time:** 2-5 minutes

---

### 3. Run MongoDB Text Indexes Script
**Command:**
```bash
tsx scripts/admin/ensure-text-indexes.ts
```

**Why Critical:** RAG chat won't work properly without text indexes

**Blocks:** Production RAG/search functionality

**Time:** < 1 minute

---

### 4. Verify Tests Pass
**Command:**
```bash
pnpm test -- src/app/api/favorites/__tests__/route.test.ts
```

**Why Critical:** Ensure favorites API tests pass before committing

**Time:** 10 seconds

---

### 5. Commit and Push to Remote
**Commands:**
```bash
git add src/app/api/favorites/__tests__/route.test.ts
git add docs/CRITICAL_TASKS_NOV_2.md
git commit -m "test: add comprehensive tests for favorites API endpoints

- Add 18 tests covering GET, POST, DELETE endpoints
- Test authentication, rate limiting, validation
- Test audit logging and error handling
- Verify $addToSet and $pull MongoDB operations
- Enterprise compliance: RBAC, error boundaries, Zod validation"

git push origin feature/day-7-qa-improvements
```

**Why Critical:** Share progress, trigger CI/CD checks

**Time:** 1-2 minutes

---

## 📋 Enterprise Compliance Items (Post-Critical)

### 6. Add organizationId to Feedback Schemas
**Files:**
- `src/lib/db/schemas/user-feedback.ts`
- `src/app/api/feedback/quick/route.ts`
- `src/app/api/feedback/rating/route.ts`

**Change:**
```typescript
export const QuickFeedbackSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),  // ✅ Add this
  promptId: z.string(),
  // ...
});
```

**Priority:** High - Multi-tenant data isolation

**Time:** 15 minutes

---

### 7. Add Rate Limiting to Feedback APIs
**Files:**
- `src/app/api/feedback/quick/route.ts`
- `src/app/api/feedback/rating/route.ts`

**Add:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit';

const rateLimitResult = await checkRateLimit(userId, 'authenticated');
if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}
```

**Priority:** High - Prevent spam/abuse

**Time:** 10 minutes

---

## 🎯 Execution Order

**Right Now:**
1. Run: `pnpm install` (terminal, 2-5 min)
2. Run: `tsx scripts/admin/ensure-text-indexes.ts` (< 1 min)
3. Run: `pnpm test -- src/app/api/favorites/__tests__/route.test.ts` (< 1 min)
4. Commit + Push (1-2 min)

**Total Time:** ~5-10 minutes

**After That:**
5. Add organizationId to feedback schemas (15 min)
6. Add rate limiting to feedback APIs (10 min)
7. Run full test suite (1 min)
8. Commit + Push again (1 min)

**Total Time:** ~30 minutes

---

## 📊 Progress Tracking

| Task | Status | Time | Priority |
|------|--------|------|----------|
| Favorites API Tests | ✅ Done | - | Critical |
| Install Dependencies | ⏳ Next | 2-5 min | Critical |
| MongoDB Text Indexes | ⏳ Next | < 1 min | Critical |
| Verify Tests Pass | ⏳ Next | < 1 min | Critical |
| Commit + Push | ⏳ Next | 1-2 min | Critical |
| organizationId | ⏳ After | 15 min | High |
| Rate Limiting | ⏳ After | 10 min | High |

---

## 🚀 Quick Commands Reference

```bash
# In directory: /Users/donlaur/.cursor/worktrees/Engify-AI-App/VLhSW

# Install dependencies
pnpm install

# Run MongoDB text indexes
tsx scripts/admin/ensure-text-indexes.ts

# Run favorites tests
pnpm test -- src/app/api/favorites/__tests__/route.test.ts

# Commit
git add .
git commit -m "test: add comprehensive tests for favorites API endpoints"

# Push
git push origin feature/day-7-qa-improvements
```

---

## 📝 Notes

**Test File Quality:**
- ✅ 18 comprehensive tests
- ✅ All HTTP methods covered (GET, POST, DELETE)
- ✅ Authentication checks
- ✅ Rate limiting enforcement
- ✅ Input validation (Zod)
- ✅ Audit logging verification
- ✅ Error handling
- ✅ MongoDB operations ($addToSet, $pull)
- ✅ Enterprise patterns followed

**What This Unblocks:**
- Pre-commit hooks (tests now exist)
- Enterprise compliance audit
- Production deployment confidence
- Code review approval

---

**Last Updated:** November 2, 2025  
**Status:** Ready to execute critical path  
**Next Action:** Run `pnpm install`

