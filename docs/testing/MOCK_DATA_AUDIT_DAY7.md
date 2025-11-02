# Comprehensive Mock Data Audit - Day 7

**Date:** November 2, 2025  
**Branch:** `feature/day-7-qa-improvements`  
**Type:** Analysis Only (No Code Changes)  
**Effort:** ~2-3 hours  
**Task:** #30 from Day 7 Plan

---

## Executive Summary

This audit systematically identifies all hardcoded values, mock data, and fallback numbers across the codebase. The goal is to create a comprehensive fix plan for removing all fake/mocked data from production code.

**Key Findings:**
- ✅ **Good:** Most test files properly use mocks (acceptable)
- ⚠️  **Issue:** Fallback values in production code (homepage, prompts page)
- ✅ **Good:** No explicit "MOCK" or "FAKE" comments in production code
- ⚠️  **Issue:** Hardcoded counts as fallbacks when API fails

---

## 1. Audit Methodology

### Search Patterns Used

1. **TODO Comments:** `TODO.*mock|TODO.*fake|TODO.*hardcode|TODO.*dummy`
   - **Result:** 0 matches in production code ✅

2. **Explicit Mock Keywords:** `MOCK|FAKE|dummy|hardcoded|hardcode`
   - **Result:** 44 matches - **ALL in test files** ✅ (acceptable)

3. **Hardcoded Numbers:** `views|likes|ratings|clicks|count.*=.*\d+`
   - **Result:** 119 matches - Mostly legitimate calculations, some fallbacks

4. **Fallback Patterns:** `|| \d+|default.*\d+`
   - **Result:** Found 3 critical locations

---

## 2. Critical Issues Found

### 2.1 Homepage Fallback Values ⚠️

**File:** `src/app/page.tsx`

**Lines 61, 65, 96-97:**

```typescript
value: `${data.prompts?.total || data.stats?.prompts || 76}+`,
value: `${data.patterns?.total || data.stats?.patterns || 23}`,
totalPrompts: data.prompts?.total || data.stats?.prompts || 76,
totalPatterns: data.patterns?.total || data.stats?.patterns || 23,
```

**Issue:** Hardcoded fallback values `76` and `23` displayed when API fails.

**Impact:** **MEDIUM** - Shows fake numbers if stats API fails

**Recommendation:**
- Remove fallback values entirely
- Show `0` or "Loading..." if API fails
- Or show placeholder text: "Connect to see stats"

**Fix Complexity:** Easy (5 minutes)

---

### 2.2 Prompts Page Fallback Values ⚠️

**File:** `src/app/prompts/page.tsx`

**Lines 20-22:**

```typescript
const promptCount = data.prompts?.total || data.stats?.prompts || 100;
const categoryCount = data.prompts?.uniqueCategories?.length || 6;
const roleCount = data.prompts?.uniqueRoles?.length || 7;
```

**Issue:** Hardcoded fallback values `100`, `6`, `7` used in metadata generation.

**Impact:** **HIGH** - SEO metadata shows wrong numbers if API fails

**Recommendation:**
- Remove fallback values
- Use actual counts from database (should always be available)
- Or show generic: "Expert Prompts Library" without numbers

**Fix Complexity:** Easy (10 minutes)

---

## 3. Acceptable Patterns (Not Issues)

### 3.1 Test Files ✅

All `MOCK` and `FAKE` patterns found are in test files:
- `src/test/setup.ts` - Test mocks
- `src/lib/services/__tests__/*` - Test mocks
- `src/__tests__/*` - Test data

**Status:** ✅ **Acceptable** - Test files should use mocks

### 3.2 Legitimate Calculations ✅

Most `count`, `total`, `rating` patterns are legitimate:
- Aggregating database results
- Calculating totals from arrays
- Computing averages from ratings

**Examples:**
- `src/app/api/stats/route.ts` - Real aggregation
- `src/lib/services/ManagerDashboardService.ts` - Real calculations
- `src/components/feedback/DetailedRatingModal.tsx` - UI state (0-5 rating)

**Status:** ✅ **Acceptable** - Real calculations, not fake data

### 3.3 Constants and Configuration ✅

Hardcoded numbers used for:
- HTTP status codes (401, 500, etc.)
- UI limits (show top 4, max 10 items)
- Configuration values (timeouts, retries)

**Examples:**
- `src/lib/auth/require-auth.ts` - HTTP status codes
- `src/app/page.tsx` - `.slice(0, 4)` - UI limit
- `src/lib/security/promptValidator.ts` - Threshold: `suspiciousCount >= 3`

**Status:** ✅ **Acceptable** - Configuration values, not fake data

---

## 4. Edge Cases & Patterns to Watch

### 4.1 Default Values in State

**Files:** `src/app/dashboard/page.tsx`, `src/components/chat/ChatWidget.tsx`

```typescript
const [totalPrompts, setTotalPrompts] = useState(0);
```

**Status:** ✅ **Acceptable** - Starting at 0, fetching real data

### 4.2 Demo/Example Data

**File:** `src/components/demo/InteractiveDemo.tsx`

```typescript
const DEMO_EXAMPLES: DemoExample[] = [
  { id: 'code-review', scenario: 'Code Review', ... }
];
```

**Status:** ✅ **Acceptable** - Demo examples are intentional

### 4.3 Multi-Agent Workbench Mocked Tools

**File:** `src/components/features/MultiAgentWorkbench.tsx`

**Line 235:**
```typescript
'This is a mocked draft from the Agent Sandbox. Replace with real tools later.',
```

**Status:** ⚠️ **Feature Flag** - Sandbox mode with mocked tools
- Commented as "mocked" ✅
- Feature-flagged ✅
- Has TODO to replace ✅

**Recommendation:** Keep for now, but track as technical debt

---

## 5. Remaining Hardcoded Values Analysis

### 5.1 Constants File

**File:** `src/data/additional-prompts.ts`

**Line 176:**
```typescript
export const ADDITIONAL_PROMPTS_COUNT = 81; // This brings us to 100 total (19 + 81)
```

**Status:** ✅ **Acceptable** - Documentation constant, not displayed to users

### 5.2 Token Counter Default

**File:** `src/components/workbench/TokenCounter.tsx`

**Line 20:**
```typescript
expectedOutputTokens = 500
```

**Status:** ✅ **Acceptable** - Default parameter value, user can override

### 5.3 Rating System

**File:** `src/components/feedback/DetailedRatingModal.tsx`

**Lines 189-193:**
```typescript
{rating === 5 && '⭐ Excellent!'}
{rating === 4 && '👍 Good'}
{rating === 3 && '✓ Okay'}
{rating === 2 && '⚠️ Needs work'}
{rating === 1 && '❌ Poor'}
```

**Status:** ✅ **Acceptable** - UI labels for rating system (1-5 scale)

---

## 6. Systematic Fix Plan

### Phase 1: Critical Fixes (High Priority)

**Time:** 15 minutes  
**Priority:** HIGH - Affects SEO and user trust

1. **Remove Homepage Fallbacks**
   - File: `src/app/page.tsx`
   - Lines: 61, 65, 96-97
   - Change: Remove `|| 76` and `|| 23` fallbacks
   - Show: `0` or placeholder if API fails

2. **Remove Prompts Page Fallbacks**
   - File: `src/app/prompts/page.tsx`
   - Lines: 20-22
   - Change: Remove `|| 100`, `|| 6`, `|| 7` fallbacks
   - Use: Actual database counts (should always be available)

**Estimated Impact:** 
- ✅ No fake numbers displayed
- ✅ SEO metadata accurate
- ✅ User trust maintained

---

### Phase 2: Verification (Medium Priority)

**Time:** 30 minutes

1. **Test API Failure Scenarios**
   - Verify homepage shows `0` or placeholder when stats API fails
   - Verify prompts page handles missing data gracefully
   - Test error states

2. **Verify All Stats Sources**
   - Confirm `/api/stats` always returns real data
   - Check Redis cache fallback behavior
   - Verify MongoDB queries never fail silently

**Estimated Impact:**
- ✅ Proper error handling
- ✅ No silent failures hiding fake data

---

### Phase 3: Prevention (Low Priority)

**Time:** 1 hour

1. **Add Pre-commit Hook**
   - Create script to detect hardcoded fallback numbers
   - Pattern: `|| \d+|default.*\d+`
   - Block commits with hardcoded fallbacks in production code

2. **Add ESLint Rule**
   - Custom rule to warn about fallback numbers
   - Exclude test files
   - Exclude legitimate constants

3. **Documentation**
   - Add to `.cursorrules`: "No hardcoded fallback values for stats"
   - Document proper error handling patterns

**Estimated Impact:**
- ✅ Prevent future regressions
- ✅ Code quality standards enforced

---

## 7. Files Requiring Changes

### Critical (Must Fix)

1. `src/app/page.tsx` - Remove fallback values (5 min)
2. `src/app/prompts/page.tsx` - Remove fallback values (10 min)

### Optional (Nice to Have)

3. `src/components/features/MultiAgentWorkbench.tsx` - Track as tech debt (already documented)

---

## 8. Testing Checklist

After fixes, verify:

- [ ] Homepage shows real stats when API succeeds
- [ ] Homepage shows `0` or placeholder when API fails (not fake numbers)
- [ ] Prompts page metadata uses real counts
- [ ] SEO metadata is accurate
- [ ] No console errors when stats API fails
- [ ] Error states are user-friendly

---

## 9. Related Documentation

- `docs/testing/PATTERN_AUDIT_DAY7.md` - Pattern audit #2 (hardcoded stats)
- `docs/planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md` - Day 7 plan
- `docs/testing/QA_AUDIT_REPORT_DAY7.md` - QA audit report

---

## 10. Summary

### Issues Found: 2 Critical

1. **Homepage fallback values** - `76` and `23` hardcoded
2. **Prompts page fallback values** - `100`, `6`, `7` hardcoded

### Status: Good Overall

- ✅ No explicit "MOCK" or "FAKE" in production code
- ✅ Test files properly use mocks (acceptable)
- ✅ Most calculations are legitimate
- ⚠️ Only 2 locations need fixes

### Fix Effort: 15 minutes

- Quick fixes remove all fake data
- Low risk changes
- High user trust impact

---

## 11. Recommendations

### Immediate Actions

1. **Remove fallback values** (15 min)
   - Homepage: Remove `|| 76` and `|| 23`
   - Prompts page: Remove `|| 100`, `|| 6`, `|| 7`

2. **Improve error handling** (optional)
   - Show loading states
   - Show error messages if API fails
   - Use placeholder text instead of `0`

### Long-term Actions

3. **Add pre-commit hook** (1 hour)
   - Detect hardcoded fallbacks
   - Prevent regressions

4. **Document patterns** (30 min)
   - Add to `.cursorrules`
   - Document error handling best practices

---

**Report Generated:** 2025-11-02  
**Analysis Type:** Static Code Review + Pattern Matching  
**Code Changes:** None (Analysis Only)  
**Next Steps:** Fix 2 critical issues (15 minutes)

