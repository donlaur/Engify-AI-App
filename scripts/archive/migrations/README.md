# Archived Migration Scripts

This directory contains one-off migration scripts that have been executed and are no longer needed in the active codebase.

**Archived:** November 4, 2025  
**Reason:** Enterprise standards compliance - removing one-off scripts per ENTERPRISE_STANDARDS_AUDIT_2025.md

## Scripts Archived

### `migrate-prompts-slugs.ts`
- **Purpose:** Backfill prompts with slugs
- **Date:** Executed during Day 6 content hardening
- **Status:** ✅ Migration complete
- **Action:** Archived (can be restored from git if needed)

### `migrate-prompts-clean-slugs.ts`
- **Purpose:** Clean up slugs by removing IDs (e.g., "unit-test-generator-test-001" → "unit-test-generator")
- **Date:** Executed during Day 6 content hardening
- **Status:** ✅ Migration complete
- **Action:** Archived (can be restored from git if needed)

### `reset-mock-metrics.ts`
- **Purpose:** Reset all mock metrics to 0 per ADR-009 (Zero Mock Data policy)
- **Date:** Executed during Day 6 content hardening
- **Status:** ✅ Migration complete
- **Action:** Archived (can be restored from git if needed)

### `verify-new-patterns.ts`
- **Purpose:** Verify that 3 critical patterns were added to database
- **Date:** One-off verification script
- **Status:** ✅ Verification complete
- **Action:** Archived (can be restored from git if needed)

## Restoration

If you need to restore any of these scripts:
```bash
# Example: Restore a script
cp scripts/archive/migrations/migrate-prompts-slugs.ts scripts/
```

## Related Documentation

- [Enterprise Standards Audit](../docs/ENTERPRISE_STANDARDS_AUDIT_2025.md)
- [ADR-009: Mock Data Removal Strategy](../../docs/development/ADR/009-mock-data-removal-strategy.md)
- [Day 6 Content Hardening](../../docs/planning/DAY_6_CONTENT_HARDENING.md)

