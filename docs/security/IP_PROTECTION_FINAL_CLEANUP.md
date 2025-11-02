<!--
AI Summary: Final cleanup to remove intellectual property from public repository.
Content lives only in MongoDB, accessible via authentication.
Critical for protecting competitive advantage in open-source repository.
Part of Day 6 Content Hardening: Phase 7.
-->

# Phase 7: IP Protection - Final Cleanup

**Status:** ⚠️ Not Started  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 7

## IMPORTANT WARNING

**Only execute this phase after Phases 1-6 are complete and verified.**

This is a destructive cleanup - ensure all functionality works before deleting content files.

## Overview

Remove all valuable content from public GitHub repository after confirming MongoDB migration complete.

## Verification Checklist

Before deleting any files, verify:

- [ ] 23 patterns in MongoDB `patterns` collection
- [ ] 90+ prompts in MongoDB `prompts` collection
- [ ] All pages fetch from APIs, not TypeScript imports
- [ ] /patterns page displays all patterns correctly
- [ ] /prompts page displays all prompts correctly
- [ ] Filtering works (category, role, level, tags)
- [ ] Search functionality works
- [ ] Build succeeds: `pnpm build`
- [ ] All tests pass: `pnpm test`
- [ ] Linting clean: `pnpm lint`

## Files to Delete

### Complete Deletion

These files contain the full content library and must be removed:

- `src/data/prompt-patterns.ts` (~500 lines, 8 foundational patterns)
- `src/data/pattern-details.ts` (~800 lines, 8 structural patterns)
- `src/lib/pattern-constants.ts` (~600 lines, 7 cognitive patterns)

### Keep as Examples (2-3 items only)

Create minimal example files for documentation:

**File:** `src/data/examples/pattern-examples.ts`

```typescript
/**
 * Example prompt patterns for documentation only.
 * Full library (23 patterns) stored in MongoDB.
 */

export const examplePatterns = [
  {
    id: 'persona-pattern',
    name: 'Persona Pattern',
    description: 'Define a specific role for the AI',
    example: 'You are a senior software architect...',
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    description: 'Break complex problems into steps',
    example: "Let's solve this step by step...",
  },
];

export const examplePrompts = [
  {
    id: 'code-review-example',
    title: 'Security Code Review',
    description: 'AI-powered security vulnerability detection',
    category: 'engineering',
  },
];
```

## README Update

Add note to main `README.md`:

```markdown
## Content Storage

Engify's content library (prompts, patterns, learning materials) is stored in MongoDB, not in this codebase.

**Public Repository:**

- Contains 2-3 example items for documentation purposes only
- Full library requires database access

**Production:**

- All 90+ prompts and 23 patterns in MongoDB
- Content managed via admin UI or API
- IP protected from public access

**Local Development:**

- Use seed scripts to populate test data
- Run: `pnpm exec tsx scripts/content/seed-patterns-to-db.ts`
```

## Migration Verification Script

Create verification script before deletion:

**File:** `scripts/content/verify-migration-complete.ts`

```typescript
import { MongoClient } from 'mongodb';

async function verifyMigration() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db('engify');

  const patterns = await db.collection('patterns').countDocuments();
  const prompts = await db
    .collection('prompts')
    .countDocuments({ isPublic: true });

  console.log(`Patterns in DB: ${patterns} (expected: 23)`);
  console.log(`Prompts in DB: ${prompts} (expected: 90+)`);

  if (patterns >= 23 && prompts >= 90) {
    console.log('✅ Migration verification passed - safe to delete TS files');
  } else {
    console.log('❌ Migration incomplete - DO NOT DELETE FILES');
  }

  await client.close();
}

verifyMigration();
```

## Cleanup Execution

### Step 1: Verify Migration

```bash
pnpm exec tsx scripts/content/verify-migration-complete.ts
```

### Step 2: Create Example Files

```bash
# Create examples directory
mkdir -p src/data/examples

# Create minimal example files
# (copy 2-3 patterns/prompts for docs)
```

### Step 3: Update Imports

```bash
# Find all imports of deleted files
grep -r "from '@/data/prompt-patterns'" src/
grep -r "from '@/lib/pattern-constants'" src/

# Update to import from MongoDB APIs instead
```

### Step 4: Test Thoroughly

```bash
# Build
pnpm build

# Test
pnpm test

# Run locally
pnpm dev
# Visit /patterns, /prompts, test all functionality
```

### Step 5: Delete Files

```bash
git rm src/data/prompt-patterns.ts
git rm src/data/pattern-details.ts
git rm src/lib/pattern-constants.ts
```

### Step 6: Commit & Push

```bash
git commit -m "chore: remove IP from public repo - patterns/prompts now in MongoDB"
git push origin feature/day6-content-hardening
```

## Related Documentation

- [Content Migration Plan](../operations/CONTENT_MIGRATION_PLAN.md)
- [Public Repo Security Policy](./PUBLIC_REPO_SECURITY_POLICY.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [ADR-007: Content Storage Strategy](../development/ADR/007-content-storage-strategy.md)
- [What is Seeding?](../development/WHAT_IS_SEEDING.md)
