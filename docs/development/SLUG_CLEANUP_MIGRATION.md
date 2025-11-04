# Slug Cleanup: Removing IDs from URLs

**Date:** 2025-11-04  
**Status:** ✅ **COMPLETE** - Code changes complete, migration run, JSON files regenerated  
**Priority:** HIGH - Fixes 500 errors and improves SEO

---

## Problem

**Current Slugs (BAD):**
- `unit-test-generator-test-001` (includes ID)
- `code-review-assistant-cg-001` (includes ID)
- `system-design-review-arch-001` (includes ID)

**Issues:**
1. ❌ Exposes internal record IDs (security/privacy concern)
2. ❌ Poor SEO (search engines don't need IDs)
3. ❌ 500 errors when slugs don't match lookup
4. ❌ URLs look unprofessional

**Target Slugs (GOOD):**
- `unit-test-generator` (clean, SEO-friendly)
- `code-review-assistant` (clean, SEO-friendly)
- `system-design-review` (clean, SEO-friendly)

---

## Changes Made

### 1. Updated Slug Generation Utility (`src/lib/utils/slug.ts`)

✅ **Added `generateUniqueSlug()` function:**
- Handles duplicates by appending numeric suffix (not ID)
- Example: `unit-test-generator` → `unit-test-generator-2` if duplicate

✅ **Improved `generateSlug()` function:**
- Max length: 60 characters (SEO optimal)
- Better character handling
- Documentation added

✅ **Updated `getPromptSlug()` function:**
- Explicitly documented that it does NOT append IDs

### 2. Updated PromptService (`src/lib/services/PromptService.ts`)

✅ **Create Prompt:**
- Uses `generateUniqueSlug()` to ensure uniqueness
- Checks existing slugs before creating

✅ **Update Prompt:**
- Regenerates slug if title changes
- Ensures uniqueness (excludes current prompt)

### 3. Updated All Seed Scripts

✅ **`scripts/content/expand-prompt-library.ts`:**
- Removed ID from slug generation
- Uses clean slug utility

✅ **`scripts/content/seed-management-prompts.ts`:**
- Removed ID from slug generation
- Uses clean slug utility

✅ **`scripts/data/seed-prompts-to-db.ts`:**
- Removed ID from slug generation
- Uses clean slug utility

### 4. Created Migration Script

✅ **`scripts/migrate-prompts-clean-slugs.ts`:**
- Removes IDs from existing slugs
- Handles duplicates with numeric suffix
- Shows before/after examples
- Safe to run multiple times

### 5. Sitemap Already Correct

✅ **`src/app/sitemap.ts`:**
- Already uses `getPromptSlug()` which prioritizes clean slugs
- Will automatically use new slugs after migration

---

## Migration Steps

### Step 1: Run Migration Script

```bash
tsx scripts/migrate-prompts-clean-slugs.ts
```

**What it does:**
- Fetches all prompts from MongoDB
- Generates clean slugs from titles (removes IDs)
- Handles duplicates (adds numeric suffix)
- Updates database with new slugs
- Shows before/after examples

**Example output:**
```
✅ "Unit Test Generator"
   unit-test-generator-test-001 → unit-test-generator
```

### Step 2: Regenerate JSON Files

After migration, regenerate static JSON files:

```bash
tsx scripts/content/generate-prompts-json.ts
```

**Why:** JSON files contain old slugs with IDs, need to be updated.

### Step 3: Verify

1. **Check Database:**
   ```javascript
   // MongoDB shell
   db.prompts.find({}, {title: 1, slug: 1}).limit(10)
   ```

2. **Check JSON:**
   ```bash
   cat public/data/prompts.json | grep -A 2 "slug"
   ```

3. **Test URLs:**
   - Visit `/prompts/unit-test-generator` (should work)
   - Visit `/prompts/unit-test-generator-test-001` (should redirect or 404)

### Step 4: Update Sitemap

Sitemap will auto-regenerate on next build, but you can force it:

```bash
curl https://engify.ai/sitemap.xml | grep "unit-test-generator"
```

---

## Handling Duplicates

**Scenario:** Two prompts with same title  
**Example:** "Code Review Assistant" appears twice

**Solution:**
- First prompt: `code-review-assistant`
- Second prompt: `code-review-assistant-2`
- Third prompt: `code-review-assistant-3`

**Why numeric suffix (not ID):**
- ✅ Cleaner URLs
- ✅ Doesn't expose internal structure
- ✅ Still unique

---

## SEO Impact

**Before:**
- URLs: `/prompts/unit-test-generator-test-001`
- Contains internal ID (not SEO-friendly)
- Longer URLs (harder to remember/share)

**After:**
- URLs: `/prompts/unit-test-generator`
- Clean, keyword-rich URLs
- Better search engine rankings
- Easier to remember/share

---

## Breaking Changes

⚠️ **Old URLs will break:**
- `/prompts/unit-test-generator-test-001` → 404 or redirect needed

**Solutions:**
1. **Add redirects** (recommended for SEO):
   ```typescript
   // middleware.ts or API route
   if (oldSlug.includes('-001') || oldSlug.includes('-002')) {
     // Look up by old slug, redirect to new slug
   }
   ```

2. **Keep backward compatibility:**
   - `getPromptById()` already searches by ID OR slug
   - Old slugs with IDs might still work if ID matches

3. **301 Redirects** (best for SEO):
   - Create redirect mapping
   - Old slug → New slug (301 permanent redirect)

---

## Testing Checklist

- [x] Run migration script (2025-11-04: All prompts already had clean slugs)
- [x] Verify database slugs are clean (2025-11-04: Verified - all 132 prompts have clean slugs)
- [x] Regenerate prompts.json (2025-11-04: Completed, includes clean slugs)
- [ ] Test prompt detail pages load correctly
- [ ] Test sitemap includes clean slugs
- [ ] Test search/filter still works
- [ ] Test related prompts still works
- [ ] Check for 500 errors
- [ ] Verify old URLs handle correctly (404 or redirect)

---

## Rollback Plan

If issues occur:

1. **Restore from backup:**
   ```bash
   # MongoDB restore
   mongorestore --uri="mongodb://..." --db engify dump/engify
   ```

2. **Revert code changes:**
   ```bash
   git revert <commit-hash>
   ```

3. **Re-run old migration:**
   ```bash
   tsx scripts/migrate-prompts-slugs.ts
   ```

---

## Next Steps

1. ✅ Code changes complete
2. ✅ Run migration script (2025-11-04: All 132 prompts already had clean slugs)
3. ✅ Regenerate JSON files (2025-11-04: Completed, 200.64 KB)
4. ⏳ Test URLs (verify prompt detail pages work)
5. ⏳ Add redirects for old URLs (optional, recommended for SEO)
6. ⏳ Monitor for 500 errors

---

## Related Files

- `src/lib/utils/slug.ts` - Slug generation utility
- `src/lib/services/PromptService.ts` - Prompt service (uses clean slugs)
- `scripts/migrate-prompts-clean-slugs.ts` - Migration script
- `src/app/sitemap.ts` - Sitemap generation (already uses clean slugs)
- `scripts/content/*` - Seed scripts (updated to use clean slugs)

