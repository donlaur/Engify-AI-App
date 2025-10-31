# Enterprise Compliance Guardrails

**Created:** October 31, 2025  
**Purpose:** Prevent non-compliant code from being committed  
**Status:** ✅ ACTIVE - Blocks commits that violate enterprise standards

---

## 🚨 What We Missed (Day 5 Part 2)

We built code that didn't meet enterprise standards and checked it in. **Root cause:** No automated checks for enterprise compliance.

### Issues Found After Commit:

1. ❌ Missing tests (0% coverage)
2. ❌ Missing organizationId (multi-tenant violation)
3. ❌ Missing audit logging
4. ❌ Missing rate limiting
5. ❌ Missing XSS sanitization
6. ❌ Missing error boundaries
7. ❌ Missing ADR-001 compliance checks

**Result:** Had to go back and fix everything (8 hours of rework)

---

## 🛡️ Solution: Enterprise Compliance Checker

**New Pre-Commit Hook:** `scripts/maintenance/check-enterprise-compliance.js`

### What It Checks:

#### 1. **API Routes**

- ✅ Rate limiting on public endpoints
- ✅ Tests for new API routes
- ✅ Audit logging for significant events
- ✅ XSS sanitization on user input

#### 2. **Database Schemas**

- ✅ organizationId present (multi-tenant compliance)
- ✅ No hardcoded collection names

#### 3. **Client Components**

- ✅ Error boundaries on complex components
- ✅ Tests for new components

#### 4. **AI Provider Code**

- ✅ Uses existing AIProvider interface (ADR-001)
- ✅ No duplicate provider code
- ✅ Uses centralized model config (not hardcoded)

#### 5. **Security**

- ✅ XSS sanitization on user input
- ✅ Rate limiting on public APIs
- ✅ Audit logging for significant events

---

## 📋 Pre-Commit Checklist

**Before every commit, these checks run automatically:**

1. ✅ **Enterprise Compliance** (`check-enterprise-compliance.js`)
   - Blocks CRITICAL and HIGH violations
   - Warns on MEDIUM violations

2. ✅ **Schema Validation** (`validate-schema.js`)
   - Hardcoded collection names
   - Unsafe array access
   - Missing organizationId in queries

3. ✅ **Security Checks** (`security-check.js`)
   - Hardcoded secrets
   - Missing organizationId in DB queries
   - Unsafe patterns (eval, dangerouslySetInnerHTML)

4. ✅ **Secrets Scanning** (`git-secrets`)
   - API keys
   - Passwords
   - Tokens

5. ✅ **Linting & Formatting** (`lint-staged`)
   - ESLint
   - Prettier

---

## 🎯 Compliance Rules

### CRITICAL (Blocks Commit)

- Missing organizationId in schema (multi-tenant violation)
- Creating duplicate AI provider code (ADR-001 violation)
- Missing rate limiting on public API routes

### HIGH (Blocks Commit)

- Missing XSS sanitization on user input
- Missing tests for new API routes
- Missing audit logging for significant events
- Hardcoded AI model names

### MEDIUM (Warning)

- Missing error boundaries on client components
- Missing tests for new components

---

## 🔧 How to Use

### Normal Development Flow:

```bash
# 1. Make changes
git add .

# 2. Pre-commit hook runs automatically
git commit -m "feat: add new feature"
# → Enterprise compliance check runs
# → If violations found, commit is blocked

# 3. Fix violations
# → Add tests
# → Add rate limiting
# → Add organizationId
# → etc.

# 4. Commit again
git commit -m "feat: add new feature"
# → All checks pass ✅
```

### Bypassing Checks (NOT RECOMMENDED):

```bash
# Only use in emergencies!
git commit --no-verify -m "emergency fix"
```

**⚠️ Warning:** Bypassing checks can lead to:

- Security vulnerabilities
- Multi-tenant data leaks
- Compliance violations
- Technical debt

---

## 📚 References

- **Enterprise Standards:** `docs/ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md`
- **ADR-001:** `docs/development/ADR/001-ai-provider-interface.md`
- **Security Guide:** `docs/security/SECURITY_STANDARDS.md`
- **Testing Strategy:** `docs/testing/TESTING_STRATEGY.md`

---

## 🎓 Lessons Learned

### What Went Wrong:

1. **No automated checks** - Relied on manual review
2. **Missing red-hat checklist** - Didn't verify against enterprise standards
3. **Rushed commits** - Skipped validation steps

### What We Fixed:

1. ✅ **Automated compliance checker** - Catches violations before commit
2. ✅ **Comprehensive rules** - Checks all enterprise standards
3. ✅ **Clear error messages** - Shows exactly what to fix

### Prevention:

- ✅ **Always run pre-commit hooks** - Don't bypass unless emergency
- ✅ **Review compliance errors** - Fix before committing
- ✅ **Use existing patterns** - Don't create duplicates (ADR-001)

---

## 🔄 Continuous Improvement

**Feedback Loop:**

1. If checker misses something → Add new rule
2. If checker has false positives → Refine rule
3. If standards change → Update checker

**To Add New Rule:**

1. Edit `scripts/maintenance/check-enterprise-compliance.js`
2. Add pattern and check function
3. Set severity (CRITICAL/HIGH/MEDIUM)
4. Test with real code
5. Commit the improved checker

---

**Remember:** Enterprise standards are non-negotiable. The checker is your friend, not your enemy!
