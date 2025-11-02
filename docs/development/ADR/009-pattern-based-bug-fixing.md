# ADR 009: Pattern-Based Bug Fixing Strategy

**Date:** 2025-11-02  
**Status:** ✅ Accepted  
**Deciders:** Engineering Team  
**Related:** Day 7 QA Process, PATTERN_AUDIT_DAY7.md

---

## Context

During Day 7 QA, we identified a critical inefficiency in our bug-fixing workflow:

**Problem:**

- Fixing bugs one-at-a-time as reported
- Same bug patterns recurring across codebase
- Bug backlog not shrinking despite active fixes
- Regression of previously fixed issues

**Example:**

- Fixed: Server Component with `onClick` handler causing build error on `/prompts/[id]`
- Risk: Same pattern could exist in 15+ other files
- Traditional approach: Fix when reported (reactive)
- Better approach: Find and fix all instances (proactive)

---

## Decision Drivers

1. **Efficiency** - Fix once, not repeatedly
2. **Quality** - Prevent regressions
3. **Velocity** - Exponentially reduce bug count
4. **Learning** - Build pattern recognition skills
5. **Maintainability** - Systematic vs. ad-hoc fixes

---

## Decision

**Adopt Pattern-Based Bug Fixing as primary QA strategy**

### The 5-Step Process

#### 1. Identify Pattern

When fixing a bug, document:

- Root cause (not just symptom)
- File/component type where it occurred
- Code pattern that caused it

**Example:**

```markdown
Pattern: Server Component with Event Handlers

- Root Cause: onClick in async Server Component
- File Type: `src/app/**/page.tsx` without 'use client'
- Code Pattern: `onClick={() => { ... }}`
```

#### 2. Systematic Audit

Search entire codebase for same pattern:

```bash
# Find all files with onClick
grep -r "onClick=" src/app --include="*.tsx"

# Check which are Server Components (missing 'use client')
for file in $(grep -rl "onClick=" src/app --include="*.tsx"); do
  if ! grep -q "'use client'" "$file"; then
    echo "⚠️  $file - Missing 'use client'"
  fi
done
```

**Tools:**

- `grep` - Text search
- `ripgrep` (rg) - Faster alternative
- IDE global search
- AST-based tools (future)

#### 3. Fix All Instances

Address all occurrences at once:

- Group related fixes in single commit
- Use DRY principles (extract to shared component/util)
- Document why each fix is needed

**Anti-pattern:**

```typescript
// DON'T: Fix only reported instance
// File: src/app/prompts/[id]/page.tsx
<Button onClick={handleClick}>Click</Button>

// Result: Same bug exists in 14 other files
```

**Correct:**

```typescript
// DO: Extract to Client Component
// File: src/components/features/PromptActions.tsx
'use client';
export function CopyButton({ content }: Props) {
  return <Button onClick={() => copy(content)}>Copy</Button>;
}

// Use in all Server Components
// Result: Pattern fixed everywhere
```

#### 4. Document

Create audit report:

```markdown
## Audit #N: [Pattern Name]

**Issue:** [Description]
**Files Audited:** X files
**Issues Found:** Y instances
**Fixes Applied:** Z commits

**Prevention:**

- [Pre-commit hook / Linting rule / Documentation]
```

**Location:** `docs/testing/PATTERN_AUDIT_DAY7.md`

#### 5. Prevent

Add guardrails to prevent recurrence:

**Options:**

- **Pre-commit Hook** - Block problematic patterns
- **ESLint Rule** - Catch during development
- **Documentation** - Update coding standards
- **Type System** - Use TypeScript to enforce correctness

**Example:**

```javascript
// Pre-commit hook check
if (fileHasOnClick && !fileHasUseClient) {
  console.error('❌ Server Component with onClick handler');
  process.exit(1);
}
```

---

## Alternatives Considered

### Alternative 1: One-Off Bug Fixes (Status Quo)

**Pros:**

- Faster initial fix
- Less upfront work

**Cons:**

- Bug backlog grows
- Same bugs reported multiple times
- Reactive, not proactive
- No learning/improvement

**Verdict:** ❌ Rejected - Not scalable

### Alternative 2: Comprehensive Test Coverage

**Pros:**

- Catches bugs automatically
- Good long-term strategy

**Cons:**

- High upfront cost
- Doesn't find existing bugs
- Test maintenance overhead

**Verdict:** ⚠️ Complementary - Use both strategies

### Alternative 3: Weekly Bug Triage

**Pros:**

- Organized approach
- Prioritization built-in

**Cons:**

- Still reactive
- Doesn't prevent patterns
- Slower velocity

**Verdict:** ⚠️ Complementary - Use for cross-cutting issues

---

## Chosen Solution: Pattern-Based Fixing

### Implementation

**Day 7 Example:**

1. **Bug Reported:** Build error on `/prompts/[id]`
   - Error: "Event handlers cannot be passed to Client Component props"
2. **Pattern Identified:** Server Component with `onClick`
3. **Audit Conducted:**
   ```bash
   grep -r "onClick=" src/app --include="*.tsx" | wc -l
   # Result: 15 files
   ```
4. **All Instances Checked:**
   - ✅ All 15 files had `'use client'` directive
   - ✅ No other instances found
   - ✅ Pattern already prevented by existing practices
5. **Documentation Created:**
   - `docs/testing/PATTERN_AUDIT_DAY7.md`
   - Audit results documented
   - Process recorded for future reference

### Metrics

**Before Pattern-Based Fixing:**

- Bugs fixed: 1 per report
- Backlog: Growing
- Time to fix: Low per bug, high total
- Regression rate: High

**After Pattern-Based Fixing:**

- Bugs fixed: 1-N per pattern
- Backlog: Shrinking
- Time to fix: Higher per session, lower total
- Regression rate: Low

**Day 7 Results:**

- Patterns audited: 6
- Critical issues found: 2
- Issues fixed: 2 (dashboard hardcoded patterns)
- Potential future bugs prevented: Unknown (likely 5-10)

---

## Trade-offs

### Advantages

1. **Exponential Bug Reduction**
   - Fix N bugs in time it takes to fix 1
   - Backlog shrinks rapidly

2. **Quality Improvement**
   - Systematic vs. reactive
   - Prevents regressions
   - Builds best practices

3. **Learning**
   - Team develops pattern recognition
   - Faster diagnosis in future
   - Better code reviews

4. **Documentation**
   - Audit reports serve as knowledge base
   - Future engineers benefit
   - Onboarding resource

### Disadvantages

1. **Upfront Time**
   - Audit takes longer than single fix
   - Requires discipline
   - May feel slower initially

2. **Scope Creep**
   - Risk of over-auditing
   - Need to balance thoroughness vs. velocity
   - Can delay shipping

3. **False Positives**
   - Audit may find non-issues
   - Need good judgment
   - Can waste time on edge cases

### Mitigation

**Time Management:**

- Set time limit per audit (30 min max)
- Focus on high-impact patterns first
- Use automated tools where possible

**Scope Control:**

- Audit only related patterns
- Don't fix unrelated issues
- Stay focused on original bug

**Judgment:**

- Validate findings before fixing
- Discuss ambiguous cases
- Document intentional exceptions

---

## Decision Outcome

**Status:** ✅ Accepted and Implemented

**Rollout:**

- ✅ Day 7: Initial implementation
- ✅ Created audit process
- ✅ Documented methodology
- 🔄 Ongoing: Refine based on experience

**Success Criteria:**

- Bug backlog decreases by 50% over 2 weeks
- Regression rate < 5%
- Team reports increased confidence
- Audit reports used as reference

**Review Date:** 2025-11-09 (1 week)

---

## Examples in Practice

### Example 1: Hardcoded Stats

**Pattern Identified:**

```typescript
// Dashboard had hardcoded patterns count
const totalPatterns = 15; // ❌ Hardcoded
```

**Audit:**

```bash
grep -r "totalPatterns.*=.*\d\d" src/ --include="*.tsx"
```

**Fix:**

```typescript
// Fetch from API
const [totalPatterns, setTotalPatterns] = useState(0);
const data = await fetch('/api/stats');
setTotalPatterns(data.stats?.patterns || 0);
```

**Impact:**

- 1 pattern identified
- 1 critical issue fixed
- Prevented: Unknown future instances

### Example 2: Server Component Event Handlers

**Pattern Identified:**

```typescript
// Server Component with onClick
export default async function Page() {
  return <Button onClick={() => {}}> // ❌ Build error
}
```

**Audit:**

```bash
# Find all onClick in src/app
grep -r "onClick=" src/app --include="*.tsx"
# Check for 'use client' directive
```

**Result:**

- 15 files found with onClick
- ✅ All had 'use client'
- ✅ No issues found
- ✅ Existing practices working

**Impact:**

- 0 additional bugs found
- Validated existing practices
- Documented for future reference

---

## References

- [Day 7 Plan](../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Pattern Audit Report](../../testing/PATTERN_AUDIT_DAY7.md)
- [Pre-commit Hooks](../maintenance/validate-schema.js)
- [Enterprise Compliance Checks](../ci/check-enterprise-compliance.js)

---

## Notes

**Future Enhancements:**

1. AST-based pattern detection (vs. regex)
2. Automated audit scripts
3. Pattern library/database
4. AI-assisted pattern recognition

**Related ADRs:**

- ADR 002: Enterprise Compliance Checks
- ADR 007: Favorites System (MongoDB Persistence)
- ADR 008: Pre-commit Hook Strategy

---

**Last Updated:** 2025-11-02  
**Authors:** Donnie Laur, AI Assistant  
**Tags:** #quality #process #methodology #bug-fixing #day7
