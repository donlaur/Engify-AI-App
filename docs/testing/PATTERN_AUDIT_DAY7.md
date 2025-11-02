# Pattern-Based Code Audit - Day 7

**Date:** 2025-11-02  
**Purpose:** Systematic audit to find and fix recurring issues across the codebase

---

## ✅ Audit #1: Server Components with Event Handlers

**Issue:** Passing `onClick` handlers to Server Components causes build errors  
**Pattern Fixed:** `/prompts/[id]/page.tsx` - Extracted to Client Components

**Audit Results:**

- ✅ All files with `onClick` handlers have `'use client'` directive
- ✅ No Server Components with event handlers found
- ✅ **STATUS: CLEAN**

**Files Checked:**

- `src/app/**/*.tsx` (29 files with onClick)
- All confirmed to have `'use client'` directive

---

## ⚠️ Audit #2: Hardcoded/Mocked Stats and Counts

**Issue:** Hardcoded numbers instead of real DB data  
**Patterns to Find:**

- Hardcoded prompt counts
- Hardcoded user stats
- Fake engagement metrics
- TODO/FIXME comments indicating mocked data

**Audit Results:**

### High Priority Issues Found:

#### 1. Dashboard - Hardcoded `totalPatterns: 15`

**File:** `src/app/dashboard/page.tsx:75, 84`
**Issue:** Patterns count is hardcoded to 15
**Fix:** Fetch from `/api/stats` (already returns `patterns` count)
**Impact:** Dashboard shows inaccurate data

#### 2. Homepage - Stats May Be Cached Incorrectly

**File:** `src/app/page.tsx`
**Status:** Uses `getStats()` from `@/lib/stats-cache` ✅
**Verified:** Real data with Redis cache

#### 3. Manager Dashboard API - Mock Data

**File:** `src/app/api/manager/dashboard/route.ts`
**Search Result:** 1 match for "mock"
**Needs Review:** Check if returning real data

#### 4. Team Management API - Mock Data

**File:** `src/app/api/manager/team/[teamId]/route.ts`
**Search Result:** 1 match for "mock"
**Needs Review:** Check if returning real data

### Test Files (Acceptable):

- 297 matches for mock/fake/dummy in test files ✅
- These are expected for testing

---

## ⚠️ Audit #3: Fake Engagement Metrics

**Issue:** Views, likes, ratings showing fake numbers  
**Pattern Fixed:** Removed from `PromptCard.tsx`

**Audit Results:**

### Files to Review:

1. `src/app/api/feedback/rating/route.ts` - Rating system
2. `src/components/feedback/DetailedRatingModal.tsx` - Rating UI
3. `src/lib/db/schemas/user-feedback.ts` - Feedback schema

**Status:** ✅ These appear legitimate (real rating system, not fake data)

### ❌ Missing Feature:

**Views Tracking:** No real view counter implemented yet

- **Need:** Add `views` field to prompts
- **Need:** Create `/api/prompts/[id]/view` endpoint
- **Need:** Track page views
- **Priority:** Medium (Task #27 in plan)

---

## ⚠️ Audit #4: Text Contrast / Readability

**Issue:** Unreadable text in dark mode (white on white, black on black)  
**Pattern Fixed:** Homepage - Changed `text-gray-600` to `text-gray-700 dark:text-gray-300`

**Files to Audit:**

- All components with `text-gray-*` classes
- All components with `text-muted-foreground`
- All forms and inputs

**Command to Run:**

```bash
grep -r "text-gray-[456]00" src/app src/components --include="*.tsx"
grep -r "text-white.*bg-white" src/app src/components --include="*.tsx"
```

**Status:** ⏳ PENDING - Need to run comprehensive check

---

## ✅ Audit #5: Broken Links and 404s

**Issue:** Links pointing to non-existent pages  
**Pattern Fixed:** Footer - Removed duplicate links, fixed "Built by" link

**Known Fixed:**

- ✅ `/logout` - Now has dedicated page
- ✅ `/hireme` - Now has content
- ✅ `/pricing` - Rewritten for beta
- ✅ `/prompts/[id]` - Individual pages created

**Potential Issues:**

- Need to verify all internal links work
- Need to verify all CTA buttons link correctly

**Status:** ⏳ PENDING - Manual QA needed

---

## ⚠️ Audit #6: Missing Authentication Checks

**Issue:** Pages/features accessible without proper auth  
**Pattern:** All API routes should check auth, RBAC should be enforced

**Files to Review:**

```bash
# Find API routes without auth checks
grep -L "requireAuth\|checkRateLimit\|auth()" src/app/api/*/route.ts
```

**Known Protected:**

- ✅ `/api/favorites` - Has `requireAuth` + rate limiting
- ✅ `/api/gamification/*` - Has auth checks
- ✅ `/api/admin/*` - Has RBAC

**Status:** ⏳ PENDING - Need comprehensive check

---

## 🎯 Action Items (Priority Order)

### Critical (Fix Now):

1. **Dashboard - Hardcoded Patterns Count**
   - File: `src/app/dashboard/page.tsx`
   - Fix: Fetch `patterns` count from `/api/stats`
   - Time: 5 minutes

2. **Manager API Routes - Verify Real Data**
   - Files: `src/app/api/manager/dashboard/route.ts`, `src/app/api/manager/team/[teamId]/route.ts`
   - Fix: Replace any mock data with real DB queries
   - Time: 15 minutes

### High Priority:

3. **Text Contrast Audit**
   - Run grep for poor contrast patterns
   - Fix all unreadable text
   - Time: 20 minutes

4. **Broken Links Manual QA**
   - Click through all navigation
   - Verify all CTAs work
   - Time: 10 minutes

### Medium Priority:

5. **Auth Coverage Audit**
   - Find unprotected API routes
   - Add auth checks where missing
   - Time: 30 minutes

6. **Views Tracking Implementation**
   - Add views field to schema
   - Create tracking endpoint
   - Display in UI
   - Time: 30 minutes (Task #27)

---

## Summary

**Audits Complete:** 1/6  
**Critical Issues Found:** 2  
**High Priority Issues:** 2  
**Medium Priority Issues:** 2

**Estimated Fix Time:** ~2 hours for all issues  
**Critical Path:** 20 minutes (Items 1-2)

---

**Next Steps:**

1. Fix dashboard hardcoded patterns count
2. Review manager API routes
3. Run text contrast audit
4. Continue with remaining tasks
