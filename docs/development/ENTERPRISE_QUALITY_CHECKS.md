# Enterprise Quality Checks

**Last Updated:** November 2, 2025  
**Baseline:** Day 5 Audit (85/100, B+)

## 📋 Overview

This document describes our automated quality checks that enforce enterprise standards established during Days 5-6.

## 🎯 Quality Gates

### 1. Pre-Commit Hook (Blocking)

**Location:** `.husky/pre-commit`  
**When:** Before every `git commit`

#### Checks Run:

1. **Enterprise Compliance** (`check-enterprise-compliance.js`)
   - Rate limiting on new API routes
   - XSS sanitization for user input
   - Error boundaries for client components
   - Tests for new API routes/components
   - Multi-tenant organizationId in schemas
   - Audit logging for significant events
   - ADR-001 compliance (AI Provider Interface)
   - Centralized AI model configuration

2. **Schema Validation** (`validate-schema.js`)
   - Zod schema correctness
   - Database schema consistency

3. **Security Scan** (`security-check.js`)
   - No hardcoded secrets
   - Environment variable usage
   - SQL injection patterns
   - XSS vulnerabilities

4. **Secrets Scan** (`git-secrets`)
   - AWS keys
   - API keys
   - Passwords
   - Connection strings

5. **Lint-Staged**
   - ESLint --fix
   - Prettier --write
   - TypeScript type checking

#### Exit Codes:

- `0` - All checks passed ✅
- `1` - CRITICAL or HIGH severity issues found ❌

#### Bypassing (Use Sparingly):

```bash
git commit --no-verify -m "message"
```

**Only bypass when:**

- Tests will be added in next commit
- Audit logging is intentionally deferred
- After consulting with team lead

---

### 2. End-of-Day Audit (Manual)

**Location:** `scripts/ci/end-of-day-audit.ts`  
**When:** End of each development day, before push

#### Usage:

```bash
# Standard audit
pnpm audit:eod

# Strict mode (fails on warnings)
pnpm audit:eod:strict

# JSON output (for CI/CD)
pnpm audit:eod:json
```

#### Categories Audited:

| Category              | Weight | Target | Baseline |
| --------------------- | ------ | ------ | -------- |
| TypeScript Strictness | 10%    | 100%   | 100%     |
| Security Standards    | 20%    | 90%+   | 85%      |
| Test Coverage         | 15%    | 70%+   | 18%      |
| RBAC Implementation   | 10%    | 90%+   | 80%      |
| DRY Principle         | 10%    | 95%+   | 95%      |
| Documentation         | 10%    | 95%+   | 98%      |
| Input Validation      | 10%    | 100%   | 100%     |

#### What It Checks:

**TypeScript Strictness:**

- `strict: true` in tsconfig.json
- No `any` types (or minimal with justification)
- Proper type annotations

**Security Standards:**

- Rate limiting on public API routes
- Authentication on protected routes
- Input sanitization
- Error handling

**Test Coverage:**

- API route tests
- Component tests
- Critical path coverage
- Edge case coverage

**RBAC Implementation:**

- Admin routes protected
- Role-based permissions
- Organization scoping

**DRY Principle:**

- No code duplication
- Shared utilities used
- Consistent patterns

**Documentation:**

- README.md present
- API documentation
- JSDoc comments
- Architecture docs

**Input Validation:**

- Zod schemas for POST/PUT
- Type-safe validation
- Error messages

#### Output:

```
═══════════════════════════════════════════════════════════
   📊 END OF DAY QUALITY AUDIT
═══════════════════════════════════════════════════════════

Branch: feature/day-7-qa-improvements
Date: 2025-11-02T20:30:00.000Z
Files Analyzed: 450

Overall Score: 92/100 (A-)
Baseline: 85/100 (Day 5)
Change: ↑ 7 points

Category Scores:

✅ TypeScript Strictness: 100/100
   No 'any' types found

✅ Security Standards: 90/100
   15/15 routes with rate limiting, 8 with auth

⚠️  Test Coverage: 60/100
   18 test files, 25 API routes, 80 components
   • Test coverage 60.0% is below 70% target

✅ RBAC Implementation: 100/100
   12/12 admin routes protected

✅ DRY Principle: 95/100

✅ Documentation: 98/100
   25/25 API files documented

✅ Input Validation: 100/100

═══════════════════════════════════════════════════════════

✅ QUALITY MAINTAINED OR IMPROVED
Code quality meets or exceeds enterprise standards.

Total Issues: 3
   • 3 high

📖 See docs/CODE_QUALITY_AUDIT_NOV_2.md for detailed standards
```

#### Exit Codes:

- `0` - Score >= baseline, no critical issues
- `1` - Score < baseline OR critical issues found

---

### 3. Route Guard Policy (CI)

**Location:** `scripts/policy/check-route-guards.ts`  
**When:** CI/CD pipeline, manual run

#### Usage:

```bash
pnpm policy:routes
```

#### What It Checks:

- `/api/admin/**` routes have RBAC
- `/api/v2/**` routes have RBAC
- Uses `RBACPresets`, `withRBAC`, or `requireAuth`

#### Example Violation:

```typescript
// ❌ BAD - No RBAC
export async function GET(request: NextRequest) {
  const db = await getDb();
  // ... admin logic
}

// ✅ GOOD - Has RBAC
export async function GET(request: NextRequest) {
  const rbacCheck = await RBACPresets.requireSuperAdmin()(request);
  if (rbacCheck) return rbacCheck;

  const db = await getDb();
  // ... admin logic
}
```

---

### 4. Bundle Size Check (CI)

**Location:** `scripts/ci/check-bundle-size.ts`  
**When:** After build, CI/CD

#### Usage:

```bash
pnpm build
pnpm ci:bundle
```

#### Budgets:

| Bundle             | Budget  | Notes          |
| ------------------ | ------- | -------------- |
| app/page           | 150 KB  | Homepage       |
| app/library/page   | 200 KB  | Prompt library |
| app/workbench/page | 250 KB  | AI workbench   |
| app/patterns/page  | 180 KB  | Patterns page  |
| Total              | 1200 KB | All bundles    |

#### Exit Codes:

- `0` - All bundles within budget
- `1` - One or more bundles exceed budget

---

## 🔧 Running All Checks

### Daily Workflow:

```bash
# 1. Before committing (automatic)
git add .
git commit -m "feat: add new feature"
# Pre-commit hook runs automatically

# 2. End of day (manual)
pnpm audit:eod

# 3. Before pushing
git push
```

### CI/CD Pipeline:

```yaml
# .github/workflows/ci.yml (example)
name: CI

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Tests
        run: pnpm test:run

      - name: Build
        run: pnpm build

      - name: Route guard policy
        run: pnpm policy:routes

      - name: Bundle size check
        run: pnpm ci:bundle

      - name: End of day audit
        run: pnpm audit:eod:json
```

---

## 📊 Quality Metrics

### Current Baseline (Day 5):

- **Overall:** 85/100 (B+)
- **SOLID:** 90%
- **Security:** 85%
- **Testing:** 0% (critical gap)
- **RBAC:** 60%
- **Audit Logging:** 40%
- **Documentation:** 95%

### Target (Production):

- **Overall:** 95/100 (A)
- **SOLID:** 95%
- **Security:** 95%
- **Testing:** 70%+
- **RBAC:** 95%
- **Audit Logging:** 90%
- **Documentation:** 98%

### Current (November 2):

- **Overall:** 92/100 (A-) ✅
- **SOLID:** 90% (maintained)
- **Security:** 90% (+5%)
- **Testing:** 18% (+18%)
- **RBAC:** 80% (+20%)
- **Audit Logging:** 40% (no change)
- **Documentation:** 98% (+3%)

---

## 🚨 Severity Levels

### CRITICAL ⛔

- **Impact:** Blocks commit/CI
- **Examples:**
  - Missing multi-tenant organizationId
  - Duplicate AI provider code (violates ADR-001)
  - Admin route without RBAC

**Action:** MUST fix before commit

### HIGH ⚠️

- **Impact:** Blocks commit, can bypass with --no-verify
- **Examples:**
  - Public API route without rate limiting
  - New API route without tests
  - Missing audit logging for significant events
  - Hardcoded AI model names

**Action:** Fix before commit, or document deferral

### MEDIUM ℹ️

- **Impact:** Warning, doesn't block
- **Examples:**
  - Client component without error boundary
  - New component without tests
  - Missing JSDoc comments

**Action:** Fix when possible, track in backlog

### LOW 📝

- **Impact:** Informational
- **Examples:**
  - Potential code duplication
  - Minor style inconsistencies

**Action:** Address during refactoring

---

## 🎓 Best Practices

### 1. Run audits early and often

```bash
# Before starting work
pnpm audit:eod

# After major changes
pnpm audit:eod

# Before committing
git commit  # Pre-commit hook runs

# End of day
pnpm audit:eod
```

### 2. Fix issues incrementally

Don't let issues accumulate. Fix them as you go:

```bash
# Check specific category
pnpm lint
pnpm typecheck
pnpm test:run

# Fix and commit
git add .
git commit -m "fix: resolve linting issues"
```

### 3. Document exceptions

If you need to bypass a check:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const error = e as any; // MongoDB error types not exported

// TODO: Add tests in next PR (tracked in JIRA-123)
export async function GET(request: NextRequest) {
  // ...
}
```

### 4. Keep baseline improving

Every day, aim to improve one category:

- **Monday:** Add tests
- **Tuesday:** Improve documentation
- **Wednesday:** Refactor duplicates
- **Thursday:** Security hardening
- **Friday:** Performance optimization

---

## 📖 Related Documentation

- [CODE_QUALITY_AUDIT_NOV_2.md](../CODE_QUALITY_AUDIT_NOV_2.md) - Latest audit results
- [ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md](../ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md) - Baseline audit
- [CODE_QUALITY_REVIEW.md](../architecture/CODE_QUALITY_REVIEW.md) - SOLID principles
- [CI_POLICY_GATES.md](../ci/CI_POLICY_GATES.md) - CI/CD policies

---

## ✅ Quick Reference

| Check        | Command              | When         | Blocks |
| ------------ | -------------------- | ------------ | ------ |
| Pre-commit   | automatic            | Every commit | Yes    |
| End-of-day   | `pnpm audit:eod`     | Daily        | No     |
| Route guards | `pnpm policy:routes` | CI/CD        | Yes    |
| Bundle size  | `pnpm ci:bundle`     | After build  | Yes    |
| Lint         | `pnpm lint`          | Anytime      | No     |
| Tests        | `pnpm test:run`      | CI/CD        | Yes    |

---

**Maintained by:** Engineering Team  
**Contact:** donlaur@engify.ai  
**Last Review:** November 2, 2025
