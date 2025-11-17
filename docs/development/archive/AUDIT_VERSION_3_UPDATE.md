# Audit Script Version Update - Version 3

## Summary

Updated all audit and improvement scripts to target version 3 instead of version 2, allowing prompts already at version 2 to be re-audited and improved.

## Changes Made

### 1. Audit Script (`scripts/content/audit-prompts-patterns.ts`)

**Updated:**
- Default `targetVersion` changed from `2` to `3`
- Documentation updated to reflect version 3 targeting
- Script now audits prompts with `auditVersion < 3` (i.e., prompts at version 2 or below)

**Behavior:**
- Audits prompts with `auditVersion < 3`
- Skips prompts already at version 3+
- Creates new audit results with `auditVersion` incremented

### 2. Batch Improvement Script (`scripts/content/batch-improve-from-audits.ts`)

**Updated:**
- Now processes prompts with `currentRevision <= 2`
- Allows re-improving prompts at version 2 (upgrading them to version 3)
- Skips prompts at revision 3+

**Behavior:**
- Processes prompts at revision 1 or 2
- Increments revision: `1 → 2` or `2 → 3`
- Skips prompts already at revision 3+

### 3. Enrichment Script (`scripts/content/enrich-all-version1.ts`)

**Updated:**
- Renamed to handle version 1 & 2 prompts
- Now processes prompts with `currentRevision <= 2`
- Increments revision correctly: `1 → 2` or `2 → 3`
- Updated console messages to reflect version 3 targeting

**Behavior:**
- Finds prompts with `currentRevision <= 2`
- Enriches and increments revision
- Skips prompts already at revision 3+

## Usage

### Audit Prompts to Version 3

```bash
# Default (targets version 3)
tsx scripts/content/audit-prompts-patterns.ts --type=prompts

# Quick mode (faster, fewer agents)
tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick

# Explicitly specify version 3
tsx scripts/content/audit-prompts-patterns.ts --type=prompts --target-version=3
```

### Improve Prompts from Audits

```bash
# Process prompts at revision 1 or 2
tsx scripts/content/batch-improve-from-audits.ts

# Limit to first 20 prompts
tsx scripts/content/batch-improve-from-audits.ts --limit=20
```

### Enrich Version 1 & 2 Prompts

```bash
# Enrich all prompts at revision 1 or 2
tsx scripts/content/enrich-all-version1.ts
```

## Version Flow

1. **Version 1 Prompts** → Audit → Score → Improve → **Version 2**
2. **Version 2 Prompts** → Re-audit → New Score → Improve → **Version 3**
3. **Version 3+ Prompts** → Skipped (already at target version)

## Files Modified

- `scripts/content/audit-prompts-patterns.ts` - Updated default targetVersion to 3
- `scripts/content/batch-improve-from-audits.ts` - Updated to process revision <= 2
- `scripts/content/enrich-all-version1.ts` - Updated to process revision <= 2 and increment correctly

## Next Steps

1. Run audit script to create version 3 audits for version 2 prompts
2. Run batch improvement script to apply improvements based on audits
3. Monitor scores to verify improvements
4. Repeat cycle for version 4 if needed

