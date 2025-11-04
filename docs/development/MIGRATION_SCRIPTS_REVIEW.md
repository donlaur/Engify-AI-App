# Migration Scripts Review & Cleanup

**Date:** November 4, 2025  
**Purpose:** Review and consolidate migration scripts per DRY principles

---

## Scripts Reviewed

### ✅ Consolidated (Duplicate Removed)

1. **`scripts/migrate-prompts-slugs.ts`** - **CONSOLIDATED**
   - **Status:** Enhanced to handle both backfill and clean operations
   - **Usage:**
     - `tsx scripts/migrate-prompts-slugs.ts` - Backfill slugs
     - `tsx scripts/migrate-prompts-slugs.ts --clean` - Clean slugs (remove IDs)
     - `tsx scripts/migrate-prompts-slugs.ts --all` - Both operations
   - **Replaces:** `scripts/migrate-prompts-clean-slugs.ts` (DELETED)

### ✅ Kept (Still Useful)

2. **`scripts/migrate-learning-resources.ts`** - **KEPT**
   - **Purpose:** Migrates learning resources from JSON files to MongoDB
   - **Status:** May still be needed if migration not complete
   - **Action:** Keep for now (can be run when needed)

3. **`scripts/content/verify-migration-complete.ts`** - **KEPT**
   - **Purpose:** Verification tool to check if patterns/prompts migration is complete
   - **Status:** Useful utility, not a migration script itself
   - **Action:** Keep (useful verification tool)

4. **`scripts/db/reset-mock-metrics.ts`** - **KEPT**
   - **Purpose:** Resets mock metrics to 0 (ADR-009 compliance)
   - **Status:** Useful cleanup tool for removing any remaining mock data
   - **Action:** Keep (useful for ADR-009 compliance)

### ⚠️ Not Migration Scripts (Correctly Categorized)

5. **`scripts/content/expand-prompt-library.ts`** - **NOT A MIGRATION**
   - **Purpose:** Content generation script (uses AI to generate new prompts)
   - **Status:** Correctly categorized, not a migration
   - **Action:** Keep (content generation tool)

---

## Summary

**Deleted:** 1 duplicate script
- `scripts/migrate-prompts-clean-slugs.ts` (consolidated into `migrate-prompts-slugs.ts`)

**Consolidated:** 1 script
- `scripts/migrate-prompts-slugs.ts` now handles both backfill and clean operations

**Kept:** 3 scripts (still useful)
- `scripts/migrate-learning-resources.ts` - Migration may still be needed
- `scripts/content/verify-migration-complete.ts` - Useful verification tool
- `scripts/db/reset-mock-metrics.ts` - Useful cleanup tool

---

## Result

✅ **DRY Principle Improved:** Duplicate slug migration scripts consolidated  
✅ **Useful Scripts Retained:** Verification and cleanup tools kept  
✅ **Clean Codebase:** One duplicate removed, functionality preserved

