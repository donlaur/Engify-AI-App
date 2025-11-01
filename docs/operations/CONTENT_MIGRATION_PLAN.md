# Content Migration Plan: Remove IP from Public Repo

## 🎯 Goal

**Remove all proprietary prompt content from public repository** and move to MongoDB. The app should be "flat" - minimal example data only, so people can download and run it, but your valuable prompts/IP stay protected in your database.

## 📋 Files to Remove/Deprecate

### Critical IP Files (Remove Completely):

1. **`src/data/seed-prompts.ts`** - 90+ curated prompts
2. **`src/data/director-prompts.ts`** - Director-specific prompts
3. **`src/data/additional-prompts.ts`** - 81 additional prompts
4. **`src/data/prompts/management/*.ts`** - All 4 management prompt files:
   - `conflict-resolution.ts`
   - `decision-frameworks.ts`
   - `facilitator-guides.ts`
   - `performance-improvement-plans.ts`
5. **`src/data/convert-playbooks.ts`** - Playbook conversion (contains prompts)
6. **`src/data/playbooks.ts`** - Playbook definitions (if contains prompts)

### Learning Resources (Move to DB):

7. **`src/data/learning-resources.json`**
8. **`src/data/learning-resources-advanced.json`**
9. **`src/data/learning-production-ai.json`**
10. **`src/data/learning-ai-agents.json`**

### Keep (Public Safe):

- ✅ `src/data/prompt-patterns.ts` - Pattern definitions (teaching concepts)
- ✅ `src/data/pattern-details.ts` - Pattern metadata (no actual prompts)
- ✅ `src/data/advanced-patterns.json` - Pattern examples only
- ✅ Documentation files

## 🔄 Migration Steps

### Step 1: Create Migration Script (Private - NOT in repo)

**Create:** `scripts/private/migrate-content-to-db.ts` (add to `.gitignore`)

**Purpose:**

- One-time script to migrate all TS file content → MongoDB
- Run locally or on secure server
- Never commit to repo

**Script will:**

1. Read all prompt files
2. Import into MongoDB `prompts` collection
3. Verify all content migrated
4. Output migration report

### Step 2: Run Migration (Before Removing Files)

**Before deleting files, run migration:**

```bash
# Run migration script (private)
tsx scripts/private/migrate-content-to-db.ts

# Verify in MongoDB
# Should see 90+ prompts in database
```

### Step 3: Update Code to Use MongoDB Only

**Find all imports/references:**

```bash
# Find all references
grep -r "from.*seed-prompts" src/
grep -r "from.*director-prompts" src/
grep -r "from.*additional-prompts" src/
grep -r "from.*convert-playbooks" src/
```

**Update to:**

- Fetch from MongoDB API (`/api/prompts`)
- Remove direct imports
- Handle empty state gracefully

### Step 4: Remove Content Files

**After migration verified:**

```bash
# Remove prompt content files
rm src/data/seed-prompts.ts
rm src/data/director-prompts.ts
rm src/data/additional-prompts.ts
rm src/data/prompts/management/*.ts
rm src/data/convert-playbooks.ts

# Remove learning resource JSON files
rm src/data/learning-resources.json
rm src/data/learning-resources-advanced.json
rm src/data/learning-production-ai.json
rm src/data/learning-ai-agents.json
```

### Step 5: Create Minimal Examples

**Create:** `src/data/examples/prompt-examples.ts`

**Content:** Only 3-5 example prompts showing patterns, not your IP:

```typescript
/**
 * Example Prompts (Minimal)
 *
 * These are simple examples for documentation only.
 * Production prompts are stored in MongoDB.
 */
export const examplePrompts = [
  {
    id: 'example-1',
    title: 'Example: Code Review',
    pattern: 'persona',
    content: 'You are a code reviewer. Review: {code}',
  },
  // ... 3-4 more minimal examples
];
```

### Step 6: Update Seed Scripts

**Deprecate:** `scripts/content/seed-management-prompts.ts`

**Add deprecation notice:**

```typescript
/**
 * @deprecated This script is deprecated.
 * Production content should be created via admin UI or private scripts.
 * This only seeds minimal example data for development.
 */
```

### Step 7: Update Documentation

**Update all docs to reflect:**

- Content is in MongoDB, not in code
- Seed scripts are for examples only
- Production content via admin UI

## 🚨 Critical: Before Removing Files

### Checklist:

- [ ] Migration script created (private, not committed)
- [ ] Migration script tested
- [ ] All content migrated to MongoDB
- [ ] Verified in MongoDB (count matches)
- [ ] Code updated to use MongoDB API
- [ ] App works without TS files
- [ ] Empty state handled gracefully
- [ ] Documentation updated

## 📝 New Workflow

### Creating Content:

**Old (Insecure):**

```typescript
// Add to src/data/seed-prompts.ts
// Commit to repo ❌
```

**New (Secure):**

```
1. Admin UI: /opshub/content/create
2. Or: Private script (not in repo)
3. Content → MongoDB directly ✅
```

### App Startup:

**Old:**

```typescript
import { seedPrompts } from '@/data/seed-prompts';
// Loads from file
```

**New:**

```typescript
// Fetch from MongoDB API
const prompts = await fetch('/api/prompts');
// Or fetch from MongoDB directly in server components
```

## 🔐 Security Benefits

✅ **IP Protection:** Prompts not in public repo  
✅ **Flexibility:** Update content without code changes  
✅ **Control:** Who can create/edit content  
✅ **Audit:** Track all changes in database  
✅ **Versioning:** Content versioning in MongoDB

## ⚠️ Important Notes

1. **Migration is irreversible** - Once files are deleted, content must be in MongoDB
2. **Backup first** - Export MongoDB before migration
3. **Test thoroughly** - Verify app works without TS files
4. **Empty state** - App must handle no prompts gracefully
5. **Documentation** - Update all docs about content location

---

**Next Steps:** Create migration script, run migration, then remove files.
