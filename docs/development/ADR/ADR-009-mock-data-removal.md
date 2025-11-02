# ADR 009: Mock Data Removal Strategy

**Date:** 2025-11-02  
**Status:** ✅ Accepted  
**Deciders:** Engineering Team  
**Related:** Day 7 QA Process, Phase 3 Mock Data Audit

---

## Context

During Day 7 QA audit, the user repeatedly emphasized: **"No mock data in production code."**

**Current State:**

- Some components display hardcoded values (views, ratings, stats)
- Dashboard shows fake metrics (e.g., `totalPatterns: 15`)
- Prompt cards had fake engagement metrics
- Some API routes return placeholder data

**Problem:**

- Misleading user experience
- Cannot measure real engagement
- Hardcoded values become stale
- Violates user trust principle
- Makes debugging harder

**Example Issues Found:**

1. `PromptCard.tsx` - Fake views/ratings displayed
2. `dashboard/page.tsx` - Hardcoded `totalPatterns: 15`
3. Homepage - Some hardcoded stat numbers

---

## Decision Drivers

1. **User Trust** - Honest metrics build trust
2. **Data Integrity** - Real data enables analytics
3. **Professionalism** - Production-ready code has no placeholders
4. **Maintainability** - Hardcoded values become technical debt
5. **User Experience** - Empty states better than fake data

---

## Decision

**Adopt "Zero Mock Data" policy for production code**

### Principles

1. **Real Data or Empty States**
   - If data doesn't exist, show empty state
   - Never show fake numbers
   - Start metrics at 0, not hardcoded

2. **Single Source of Truth**
   - All stats from `/api/stats` endpoint
   - MongoDB queries, not hardcoded arrays
   - Redis caching for performance

3. **Systematic Removal**
   - Pattern-based audit (see ADR 009)
   - Search entire codebase
   - Fix all instances at once

4. **Documentation**
   - Document data sources
   - Mark all metrics origins
   - Update when sources change

---

## Implementation Strategy

### Phase 1: Audit (Day 7)

**Search Patterns:**

```bash
# Find hardcoded numbers in components
grep -r "views:\s*\d\+" src/components --include="*.tsx"
grep -r "rating:\s*\d\+" src/components --include="*.tsx"
grep -r "totalPatterns.*=.*\d\+" src/ --include="*.tsx"

# Find TODO/FIXME comments about mock data
grep -r "TODO.*mock\|TODO.*fake\|TODO.*replace.*real" src/

# Find hardcoded arrays
grep -r "const.*=.*\[.*\]" src/ | grep -i "mock\|fake\|dummy"
```

**Files to Check:**

- `src/components/**/*.tsx` - All components
- `src/app/**/*.tsx` - All pages
- `src/app/api/**/*.ts` - All API routes
- `src/data/**/*.ts` - Data files (keep for seeding only)

### Phase 2: Remove Mock Data

**Rules:**

1. **Remove fake metrics**
   ```typescript
   // ❌ BEFORE
   <div>Views: 576</div>
   <div>Rating: 4.5</div>
   
   // ✅ AFTER
   // Metrics removed - will add real tracking later
   // Or: <div>Views: {prompt.views || 0}</div>
   ```

2. **Replace hardcoded stats**
   ```typescript
   // ❌ BEFORE
   const totalPatterns = 15;
   
   // ✅ AFTER
   const stats = await fetch('/api/stats');
   const totalPatterns = stats.patterns || 0;
   ```

3. **Add proper empty states**
   ```typescript
   // ✅ GOOD
   {prompts.length === 0 ? (
     <EmptyState message="No prompts yet" />
   ) : (
     <PromptList prompts={prompts} />
   )}
   ```

### Phase 3: Add Real Tracking

**Where Data Doesn't Exist:**

- Add database fields (e.g., `views` to prompts schema)
- Create tracking endpoints (e.g., `/api/prompts/[id]/view`)
- Implement client-side tracking hooks
- Start at 0, not fake numbers

---

## Alternatives Considered

### Alternative 1: Keep Mock Data for Development

**Pros:**
- Faster development
- UI always looks "good"

**Cons:**
- Misleading in production
- Hard to distinguish real vs fake
- User trust issues

**Verdict:** ❌ Rejected - Not production-ready

### Alternative 2: Show Mock Data Only for Non-Auth Users

**Pros:**
- Better UX for visitors
- Real data for logged-in users

**Cons:**
- Still misleading
- Complex conditional logic
- Harder to maintain

**Verdict:** ❌ Rejected - Empty states better than fake

### Alternative 3: Start Metrics at 0

**Pros:**
- Honest representation
- Real data from day one
- Simple implementation

**Cons:**
- Looks "empty" initially
- Requires patience

**Verdict:** ✅ Accepted - Current approach

---

## Chosen Solution: Zero Mock Data

### Implementation Steps

1. **Audit** - Find all mock data (Day 7 Phase 3)
2. **Remove** - Delete fake metrics
3. **Replace** - Use real data sources
4. **Track** - Add real tracking where missing
5. **Document** - Update data source docs

### Examples

**Example 1: Prompt Cards**

```typescript
// ❌ BEFORE
<PromptCard
  prompt={prompt}
  views={576}  // Fake
  rating={4.5} // Fake
/>

// ✅ AFTER
<PromptCard
  prompt={prompt}
  // Views/ratings removed - will add real tracking
/>
```

**Example 2: Dashboard Stats**

```typescript
// ❌ BEFORE
const stats = {
  totalPatterns: 15, // Hardcoded
  totalPrompts: 132, // Hardcoded
};

// ✅ AFTER
const stats = await getStats(); // From /api/stats
// Or: const stats = await fetch('/api/stats').then(r => r.json());
```

**Example 3: Empty States**

```typescript
// ✅ GOOD
{user.favorites.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-muted-foreground">
      No favorites yet. Start exploring prompts!
    </p>
    <Button href="/prompts">Browse Prompts</Button>
  </div>
) : (
  <FavoriteList favorites={user.favorites} />
)}
```

---

## Trade-offs

### Advantages

1. **User Trust**
   - Honest metrics build credibility
   - No misleading data
   - Professional appearance

2. **Data Integrity**
   - Real analytics possible
   - Accurate measurements
   - Better decision-making

3. **Maintainability**
   - No stale hardcoded values
   - Single source of truth
   - Easier debugging

### Disadvantages

1. **Initial Appearance**
   - Metrics start at 0
   - Looks "empty" initially
   - Requires patience

2. **Development Velocity**
   - Need real data sources
   - Empty states required
   - More upfront work

3. **Tracking Overhead**
   - Need to implement tracking
   - Database schema changes
   - API endpoints needed

### Mitigation

**Empty States:**
- Design helpful empty states
- Provide clear CTAs
- Make it feel intentional

**Development:**
- Use test data in development
- Keep seeding scripts
- Mock APIs for testing only

**Tracking:**
- Implement incrementally
- Start with critical metrics
- Add as needed

---

## Decision Outcome

**Status:** ✅ Accepted and Implemented

**Progress:**

- ✅ Phase 0: Removed fake views/ratings from PromptCard
- ✅ Phase 1: Fixed dashboard hardcoded patterns count
- ✅ Phase 1: Created `/api/stats` endpoint with real data
- ⏳ Phase 2: Comprehensive audit pending
- ⏳ Phase 3: Add real view tracking

**Success Criteria:**

- Zero hardcoded stats in production code
- All metrics show real data or 0
- Empty states are helpful, not blank
- Documentation lists all data sources

**Review Date:** 2025-11-09 (1 week)

---

## References

- [Day 7 Plan](../../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Pattern Audit Report](../../testing/PATTERN_AUDIT_DAY7.md)
- [ADR 009: Pattern-Based Bug Fixing](./009-pattern-based-bug-fixing.md)

---

## Notes

**Future Work:**

1. Add view tracking to prompts
2. Add engagement metrics
3. Implement analytics dashboard
4. Create metrics documentation

**Related ADRs:**

- ADR 009: Pattern-Based Bug Fixing
- ADR 008: Favorites System (MongoDB Persistence)

---

**Last Updated:** 2025-11-02  
**Authors:** Donnie Laur, AI Assistant  
**Tags:** #quality #data #mock-data #day7 #user-trust

