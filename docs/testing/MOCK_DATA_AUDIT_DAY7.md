# Mock Data Audit Report - Day 7

**Date:** 2025-11-02  
**Status:** ✅ Complete  
**Related:** ADR-009: Mock Data Removal Strategy, Day 7 Plan Phase 3

---

## Executive Summary

**Total Instances Found:** ~194 matches across codebase  
**Critical Issues:** 3 (fallback values in production code)  
**Acceptable Instances:** ~191 (tests, initialization, opinion-based content)  
**Action Required:** Fix SEO fallback values, document acceptable patterns

---

## Audit Methodology

**Search Patterns Used:**
```bash
# Mock data patterns
grep -r "views:\s*\d+|rating:\s*\d" src/
grep -r "TODO.*(fake|mock|stub)|MOCK_|FAKE_|STUB_" src/
grep -r "hardcoded|hard-coded" src/
grep -r "localStorage.*(favorite|mock|fake)" src/
grep -r "total.*=.*\d{2,}|count.*=.*\d{2,}" src/
grep -r "\|\|.*\d{2,}|default.*\d{2,}" src/
```

**Categories:**
1. **Critical** - Mock data in production code
2. **Acceptable** - Initialization values (starting at 0)
3. **Acceptable** - Test fixtures and mocks
4. **Acceptable** - Opinion-based editorial content
5. **Needs Review** - Fallback values for SEO

---

## Critical Issues (Fix Required)

### Issue #1: SEO Fallback Values

**Files:**
- `src/app/page.tsx` (lines 61, 65, 96-97)
- `src/app/prompts/page.tsx` (line 20)

**Problem:**
```typescript
// ❌ Fallback values in production
const promptCount = data.prompts?.total || data.stats?.prompts || 100;
const totalPatterns = data.patterns?.total || data.stats?.patterns || 23;
```

**Impact:**
- SEO metadata shows incorrect numbers if API fails
- Violates "no mock data" principle
- Misleading search results

**Fix:**
```typescript
// ✅ Remove fallback or use 0
const promptCount = data.prompts?.total || data.stats?.prompts || 0;
// Or: Don't show number if data unavailable
const promptCount = data.prompts?.total || data.stats?.prompts;
if (!promptCount) {
  // Use generic description without counts
}
```

**Priority:** High  
**Effort:** 15 minutes  
**Status:** ⏳ Pending

---

## Acceptable Patterns (No Action Required)

### 1. Initialization Values (Starting at 0)

**Files:** Multiple seed files, schemas, API routes

**Pattern:**
```typescript
// ✅ Acceptable - Starting at 0 is honest
views: 0,
rating: 0,
```

**Rationale:**
- Starting at 0 is honest, not mock data
- Represents true initial state
- Real data will accumulate over time

**Examples:**
- `src/data/seed-prompts.ts` - All prompts start with `views: 0, rating: 0`
- `src/lib/services/PromptService.ts` - Default values for new prompts
- `src/app/api/prompts/route.ts` - Projection defaults

**Status:** ✅ Acceptable - No action needed

---

### 2. Test Fixtures and Mocks

**Files:** All files in `__tests__/` directories

**Pattern:**
```typescript
// ✅ Acceptable - Test data
const mockPrompt = {
  views: 100,
  rating: 4.5,
};
```

**Rationale:**
- Test files require mock data
- Explicitly marked as test fixtures
- Not included in production bundle

**Examples:**
- `src/lib/repositories/__tests__/PromptService.test.ts`
- `src/components/__tests__/PromptCard.test.tsx`
- `src/__tests__/integration/stats-flow.test.ts`

**Status:** ✅ Acceptable - No action needed

---

### 3. Opinion-Based Editorial Content

**Files:**
- `src/app/ai-coding/page.tsx` (lines 39, 58, 72, 81, 90, 99)
- `src/data/affiliate-links.ts` (lines 163, 170, 177, 184)

**Pattern:**
```typescript
// ✅ Acceptable - Editorial opinion
{
  name: 'Cursor',
  rating: 4.5, // Author's opinion
  review: 'Best for hands-on coding...',
}
```

**Rationale:**
- These are editorial ratings, not user-generated data
- Clearly labeled as author's opinion
- Not attempting to represent aggregate user data
- Similar to product review sites (TechCrunch, etc.)

**Examples:**
- AI tool comparison page (`/ai-coding`)
- Affiliate links data (for partnership outreach)

**Status:** ✅ Acceptable - Consider adding "Editorial Rating" label

**Recommendation:** Add disclaimer:
```typescript
// Editorial ratings based on author's experience
// Not aggregate user ratings
```

---

### 4. localStorage Fallback (Documented)

**File:** `src/hooks/use-favorites.ts`

**Pattern:**
```typescript
// ✅ Acceptable - Documented fallback for non-auth users
if (!session) {
  const stored = localStorage.getItem(FAVORITES_KEY);
  // Fallback for non-authenticated users
}
```

**Rationale:**
- Documented in ADR-008: Favorites System
- Explicitly a fallback, not primary data source
- Graceful degradation for non-auth users
- Will be removed when auth is required

**Status:** ✅ Acceptable - Documented in ADR-008

---

### 5. Date Calculations and Constants

**Pattern:**
```typescript
// ✅ Acceptable - Date calculations, not mock data
const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

**Rationale:**
- These are constants and calculations, not mock data
- Necessary for date logic
- Transparent and correct

**Status:** ✅ Acceptable - No action needed

---

## False Positives (Not Mock Data)

### Pattern: "Hardcoded" in Comments

**Files:**
- `src/test/setup.ts` - Comment about avoiding hardcoded DB URIs ✅
- `src/lib/services/StatsService.ts` - Comment: "NO HARDCODED NUMBERS" ✅
- `src/lib/mongodb.ts` - Comment: "URI is loaded from environment variable" ✅

**Status:** ✅ Comments, not actual code

---

## Summary by Category

| Category | Count | Status | Action |
|----------|-------|--------|--------|
| Critical Issues | 3 | ⚠️ Fix Required | Remove fallback values |
| Initialization (0) | ~150 | ✅ Acceptable | None |
| Test Fixtures | ~30 | ✅ Acceptable | None |
| Editorial Content | ~8 | ✅ Acceptable | Add disclaimer |
| Constants/Calculations | ~50 | ✅ Acceptable | None |
| Comments | ~5 | ✅ Acceptable | None |

---

## Recommendations

### Immediate Actions

1. **Fix SEO Fallback Values** (15 min)
   - Remove `|| 100` and `|| 23` fallbacks
   - Use 0 or omit numbers if data unavailable
   - Update SEO metadata generation

2. **Add Editorial Disclaimer** (5 min)
   - Add note to `/ai-coding` page: "Ratings are editorial opinions"
   - Clarify these are not aggregate user ratings

### Long-term Improvements

1. **Remove localStorage Fallback**
   - Phase out when auth is required for favorites
   - Already documented in ADR-008

2. **Pre-commit Hook**
   - Add check for fallback values in production code
   - Documented in ADR-009 implementation plan

---

## Files Requiring Fixes

### Priority 1: Critical

1. `src/app/page.tsx`
   - Lines 61, 65, 96-97
   - Remove fallback values: `|| 76`, `|| 23`

2. `src/app/prompts/page.tsx`
   - Line 20
   - Remove fallback value: `|| 100`

### Priority 2: Documentation

3. `src/app/ai-coding/page.tsx`
   - Add editorial disclaimer for ratings

---

## Verification

**After Fixes:**
```bash
# Verify no fallback values remain
grep -r "\|\|.*\d{2,}" src/app --include="*.tsx" --include="*.ts"

# Should return: 0 results (or only test files)
```

---

## Related Documentation

- [ADR-009: Mock Data Removal Strategy](../development/ADR/009-mock-data-removal-strategy.md)
- [ADR-008: Favorites System](../development/ADR/008-favorites-system-mongodb-persistence.md)
- [Day 7 Plan](../../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Pattern Audit Report](../../testing/PATTERN_AUDIT_DAY7.md)

---

## Conclusion

**Overall Status:** ✅ Good - Most instances are acceptable patterns

**Critical Issues:** 3 (all fixable in < 30 minutes)

**Key Findings:**
- Codebase follows "start at 0" principle correctly
- Test fixtures properly isolated
- Only issue is SEO fallback values (easy fix)

**Next Steps:**
1. Fix SEO fallback values
2. Add editorial disclaimer
3. Implement pre-commit hook (Phase 6)

---

**Last Updated:** 2025-11-02  
**Reviewed By:** AI Assistant  
**Next Review:** After fixes applied

