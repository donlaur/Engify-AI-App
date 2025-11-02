# AI Assistant Guardrails: Enforce Use of Existing Tools

**CRITICAL:** This document exists to prevent AI assistants from ignoring existing tooling and patterns.

**Date Created:** November 2, 2025 (After React Error #130 production breakage)

---

## The Problem

AI assistants (including Cursor's multi-agent features) can:

- ❌ Ignore existing validation scripts
- ❌ Create duplicate tooling instead of using existing
- ❌ Bypass pre-commit hooks with `--no-verify`
- ❌ Miss existing patterns and conventions
- ❌ Break production by not checking tool availability

**Real Example:** Icon audit script (`scripts/development/audit-icons.ts`) existed but wasn't in pre-commit. AI made changes that broke production instead of:

1. Finding the existing script
2. Adding it to pre-commit
3. Running it before committing

---

## Mandatory Pre-Change Checklist (AI Must Complete)

### BEFORE Making ANY Changes:

#### 1. **Search for Existing Tools**

**MANDATORY:** Search for existing scripts/tools before creating new ones.

```bash
# Pattern: Search for existing validation/check scripts
find scripts/ -name "*check*" -o -name "*validate*" -o -name "*audit*" -o -name "*lint*"

# Pattern: Search for existing helpers
grep -r "function.*check\|function.*validate\|function.*audit" scripts/ lib/

# Pattern: Check for related tooling
ls scripts/*/ | grep -i "<feature-name>"
```

**If existing tool found:**

- ✅ USE IT (don't create duplicate)
- ✅ Extend it if needed
- ✅ Add to pre-commit if missing
- ❌ DO NOT create new tool

#### 2. **Check Pre-Commit Hooks**

**MANDATORY:** Review `.husky/pre-commit` before making changes.

```bash
cat .husky/pre-commit
```

**Check:**

- What validations already exist?
- Is your change covered by existing hook?
- Should your new validation be added to hook?

**Example:** Icon validation existed but wasn't in hook → Should have added it, not ignored it.

#### 3. **Check Existing Patterns**

**MANDATORY:** Search codebase for similar patterns before implementing.

```bash
# Pattern: Find similar implementations
grep -r "pattern-you-want-to-use" src/ --include="*.ts" --include="*.tsx"

# Pattern: Check ADRs for decisions
find docs/development/ADR -name "*.md" | xargs grep -l "related-topic"
```

**If pattern exists:**

- ✅ FOLLOW IT (don't create new pattern)
- ❌ DO NOT invent new approach

#### 4. **Verify Tooling Before Use**

**MANDATORY:** Verify tools exist and work before using them.

```bash
# Pattern: Test tool exists
test -f scripts/development/audit-icons.ts && echo "EXISTS" || echo "MISSING"

# Pattern: Run tool to verify it works
tsx scripts/development/audit-icons.ts || echo "TOOL FAILED"
```

**If tool doesn't work:**

- ✅ FIX IT (don't bypass it)
- ❌ DO NOT create workaround

---

## Guardrail Script: Pre-Change Validation

Create: `scripts/ai/pre-change-check.sh`

```bash
#!/bin/bash
# Pre-Change Validation Guardrail
# MUST run before AI makes any changes

set -e

echo "🛡️  Running Pre-Change Guardrails..."
echo ""

CHANGE_TYPE=$1
SEARCH_TERMS=$2

if [ -z "$CHANGE_TYPE" ]; then
    echo "Usage: ./scripts/ai/pre-change-check.sh <type> <search-terms>"
    echo "Types: validation, helper, pattern, script"
    exit 1
fi

echo "Checking for existing $CHANGE_TYPE related to: $SEARCH_TERMS"
echo ""

# Search for existing tools
EXISTING=$(find scripts/ -name "*$SEARCH_TERMS*" 2>/dev/null || true)
if [ -n "$EXISTING" ]; then
    echo "⚠️  WARNING: Existing tooling found:"
    echo "$EXISTING"
    echo ""
    echo "❌ DO NOT create duplicate. Use existing tool instead!"
    exit 1
fi

# Check pre-commit hooks
if grep -q "$SEARCH_TERMS" .husky/pre-commit 2>/dev/null; then
    echo "⚠️  WARNING: Similar check already in pre-commit!"
    echo "Review .husky/pre-commit before adding new validation"
fi

echo "✅ No existing tooling found. Proceed with caution."
```

---

## AI Assistant Rules (Add to .cursorrules)

```markdown
## Mandatory Checks Before Changes

1. **Search for Existing Tools First**
   - Before creating ANY script: `find scripts/ -name "*<keyword>*"`
   - Before adding validation: `grep -r "validate\|check\|audit" scripts/`
   - If tool exists: USE IT, don't duplicate

2. **Check Pre-Commit Hooks**
   - Always read `.husky/pre-commit` before adding new validations
   - If similar check exists: EXTEND IT, don't create new
   - Never bypass hooks with `--no-verify` unless explicitly told

3. **Verify Tooling Works**
   - Test existing tools before using: `tsx scripts/path/to/tool.ts`
   - If tool broken: FIX IT, don't work around it

4. **Follow Existing Patterns**
   - Search codebase for similar implementations
   - Check ADRs for architectural decisions
   - Don't invent new patterns if one exists

5. **Document Why Bypassing**
   - If you MUST bypass a check, document why in commit message
   - If you MUST create duplicate tool, explain why existing won't work
```

---

## Automated Check: Script to Enforce Guardrails

Create: `scripts/ai/check-before-change.ts`

```typescript
#!/usr/bin/env tsx
/**
 * Pre-Change Guardrail Checker
 *
 * Scans for:
 * 1. Duplicate scripts/tools
 * 2. Missing pre-commit hooks
 * 3. Ignored existing patterns
 *
 * Run this BEFORE making changes to catch issues early.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface CheckResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

function findScripts(pattern: string): string[] {
  const scripts: string[] = [];
  const dir = 'scripts';

  function scanDir(currentDir: string) {
    try {
      const items = readdirSync(currentDir);
      for (const item of items) {
        const fullPath = join(currentDir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.includes(pattern)) {
          scripts.push(fullPath);
        }
      }
    } catch (err) {
      // Ignore errors
    }
  }

  scanDir(dir);
  return scripts;
}

function checkPreCommitHooks(): CheckResult {
  const result: CheckResult = {
    passed: true,
    warnings: [],
    errors: [],
  };

  try {
    const preCommit = readFileSync('.husky/pre-commit', 'utf-8');

    // Check if icon validation is in pre-commit
    if (!preCommit.includes('audit-icons')) {
      result.warnings.push(
        'Icon validation script exists but not in pre-commit hook!'
      );
    }

    // Check if enterprise compliance is in pre-commit
    if (!preCommit.includes('check-enterprise-compliance')) {
      result.warnings.push(
        'Enterprise compliance check should be in pre-commit'
      );
    }
  } catch (err) {
    result.errors.push('Could not read .husky/pre-commit');
    result.passed = false;
  }

  return result;
}

function checkForDuplicateScripts(): CheckResult {
  const result: CheckResult = {
    passed: true,
    warnings: [],
    errors: [],
  };

  // Common patterns that might have duplicates
  const patterns = ['check', 'validate', 'audit', 'lint'];

  for (const pattern of patterns) {
    const scripts = findScripts(pattern);
    if (scripts.length > 3) {
      result.warnings.push(
        `Multiple ${pattern} scripts found (${scripts.length}). Might be duplicates:`
      );
      scripts.forEach((s) => result.warnings.push(`  - ${s}`));
    }
  }

  return result;
}

function main() {
  console.log('🛡️  Running Pre-Change Guardrails...\n');

  const results = [checkPreCommitHooks(), checkForDuplicateScripts()];

  const allPassed = results.every((r) => r.passed);
  const allWarnings = results.flatMap((r) => r.warnings);
  const allErrors = results.flatMap((r) => r.errors);

  if (allErrors.length > 0) {
    console.log('❌ ERRORS:');
    allErrors.forEach((e) => console.log(`  ${e}`));
    console.log('');
  }

  if (allWarnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    allWarnings.forEach((w) => console.log(`  ${w}`));
    console.log('');
  }

  if (allPassed && allErrors.length === 0) {
    console.log('✅ Guardrails check passed');
    process.exit(0);
  } else {
    console.log('❌ Guardrails check failed');
    process.exit(1);
  }
}

main();
```

---

## Enforcement: Add to Pre-Commit

Add to `.husky/pre-commit`:

```bash
# 0. Pre-Change Guardrails Check (NEW - CRITICAL)
echo "🛡️  Running pre-change guardrails..."
tsx scripts/ai/check-before-change.ts
if [ $? -ne 0 ]; then
    echo "❌ Guardrails check failed. Review warnings above."
    exit 1
fi
echo ""
```

---

## Process Improvement

### When AI Needs to Make Changes:

1. **Run guardrail check first:**

   ```bash
   tsx scripts/ai/pre-change-check.sh validation icon
   ```

2. **If existing tool found:**
   - Document: "Using existing tool X instead of creating new"
   - Use existing tool
   - Extend if needed

3. **If no existing tool:**
   - Document: "Searched for existing tool, none found"
   - Create new tool
   - Add to pre-commit immediately

4. **Never:**
   - Create duplicate tools
   - Ignore existing validations
   - Bypass hooks without documenting why

---

## Success Metrics

This guardrail system will prevent:

- ✅ Ignoring existing tooling (icon audit script)
- ✅ Creating duplicate validations
- ✅ Bypassing pre-commit hooks silently
- ✅ Missing existing patterns
- ✅ Breaking production from preventable errors

**Goal:** Zero preventable production breakages from ignoring existing tooling.

---

**Status:** Implemented  
**Next:** Test guardrail system and refine based on results
