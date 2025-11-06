# Scripts Audit & Cleanup Recommendations

**Date**: November 6, 2025  
**Purpose**: Identify one-off scripts that can be safely removed or archived

---

## 📊 Summary

**Total Scripts**: ~200+ files across 20+ directories  
**Recommendation**: Remove ~60-80 one-off scripts (30-40% reduction)  
**Keep**: Core infrastructure, seeding, and reusable utilities

---

## 🗑️ HIGH PRIORITY - Safe to Delete (One-Off Scripts)

### `/scripts/content/` - 90 files (Remove ~40)

#### Audit Scripts (One-Time Use)
- ❌ `audit-first-prompt.ts` - One-off audit
- ❌ `audit-one-prompt.ts` - Single prompt audit
- ❌ `audit-single-prompt-simple.ts` - Duplicate functionality
- ❌ `audit-prompts.ts` - Old audit script
- ❌ `audit-prompts-patterns.ts` - 137KB! One-off analysis
- ❌ `audit-pillar-pages.ts` - One-time content audit
- ❌ `full-prompt-pattern-audit.ts` - One-off
- ❌ `quick-audit-improve.ts` - One-off
- ❌ `quick-audit-three.ts` - One-off
- ❌ `test-audit-adr.ts` - Test script
- ❌ `test-audit-single-prompt.ts` - Test script
- ❌ `verify-audit.ts` - One-off verification

#### Batch Creation Scripts (Content Already Created)
- ❌ `create-delivery-accountability-prompts.ts` - Content created
- ❌ `create-enps-prompts.ts` - 31KB, content created
- ❌ `create-gap-prompts.ts` - 31KB, content created
- ❌ `create-incident-devops-playbooks.ts` - 35KB, content created
- ❌ `create-kpi-okr-questionnaire-prompts.ts` - 30KB, content created
- ❌ `create-leadership-prompts.ts` - 52KB, content created
- ❌ `create-oncall-support-prompts.ts` - 29KB, content created
- ❌ `create-pm-core-documents.ts` - Content created
- ❌ `create-prioritization-frameworks.ts` - Content created
- ❌ `create-rice-scoring-prompts.ts` - 36KB, content created
- ❌ `create-tech-doc-prompts.ts` - Content created
- ❌ `seed-weak-role-prompts.ts` - 53KB, content seeded

#### Batch Improvement Scripts (One-Time Migrations)
- ❌ `batch-improve-from-audits.ts` - 66KB, migration complete
- ❌ `batch-improve-patterns-from-audits.ts` - 28KB, migration complete
- ❌ `batch-improve-pillar-pages-from-audits.ts` - Migration complete
- ❌ `batch-audit-enrich.ts` - One-off enrichment
- ❌ `enrich-all-version1.ts` - Old version
- ❌ `pre-enrich-prompts.ts` - Migration complete

#### Comparison/Research Scripts (One-Off Analysis)
- ❌ `compare-external-pm-prompts.ts` - One-off comparison
- ❌ `compare-new-pm-sources.ts` - One-off comparison
- ❌ `export-pillar-pages-for-research.ts` - One-off export

#### Test/Verification Scripts (One-Off)
- ❌ `test-all-ai-models.ts` - 22KB, one-off test
- ❌ `test-prompts-multi-model.ts` - One-off test
- ❌ `test-rubric-first-five.ts` - One-off test
- ❌ `test-rubric-scoring.ts` - One-off test
- ❌ `verify-migration-complete.ts` - Migration verified
- ❌ `verify-prompt.ts` - One-off verification

#### Import Scripts (Content Already Imported)
- ❌ `import-aws-prompt-engineering-article.ts` - 19KB, imported
- ❌ `html-extract.ts` - One-off extraction
- ❌ `sitemap-crawl.ts` - One-off crawl

#### Misc One-Off Scripts
- ❌ `check-db-simple.ts` - Simple check
- ❌ `check-google-models.ts` - One-off check
- ❌ `show-category-dist.ts` - One-off analysis
- ❌ `show-prompt-url.ts` - One-off utility
- ❌ `track-progress.ts` - One-off tracking

**Total to Remove from /content/**: ~40 files (~1.5MB)

---

### `/scripts/admin/` - 22 files (Remove ~8)

#### Index Management (One-Off Migrations)
- ❌ `ensure-text-indexes.ts` - Old version
- ❌ `ensure-text-indexes-atlas.ts` - Migration complete
- ❌ `ensure-text-indexes-optimized.ts` - Migration complete
- ❌ `rebuild-text-indexes-enriched.ts` - One-off rebuild
- ❌ `safe-update-text-indexes.ts` - Migration complete
- ❌ `monitor-text-index-performance.ts` - One-off monitoring

#### Duplicate/Slug Fixes (One-Time Fixes)
- ❌ `find-duplicate-slugs.ts` - Issue fixed
- ❌ `fix-duplicate-slugs.ts` - Issue fixed
- ❌ `ensure-slug-unique-index.ts` - Index created

#### Password Fixes (One-Off)
- ❌ `fix-password-now.js` - One-off fix
- ❌ `quick-reset-password.js` - One-off fix
- ❌ `fix-login.ts` - One-off fix

**Keep**:
- ✅ `engify-admin.ts` - Core admin CLI
- ✅ `db-stats.ts` - Useful for monitoring
- ✅ `check-user.ts` - Useful utility
- ✅ `verify-text-indexes.ts` - Verification utility

**Total to Remove from /admin/**: ~12 files

---

### `/scripts/db/` - 20 files (Remove ~5)

#### One-Off Migrations/Fixes
- ❌ `initialize-prompt-revisions.ts` - Migration complete
- ❌ `fix-learning-content-fields.ts` - Migration complete
- ❌ `remove-duplicate-ai-models.ts` - Duplicates removed
- ❌ `restore-patterns-learning-from-json.ts` - One-off restore
- ❌ `restore-prompts-from-backup.ts` - One-off restore
- ❌ `restore-prompts-from-json.ts` - One-off restore

**Keep**:
- ✅ `seed-ai-tools.ts` - Core seeding
- ✅ `sync-ai-models-*.ts` - Ongoing sync utilities
- ✅ `backup-mongodb.ts` - Core backup utility
- ✅ `create-*-indexes.ts` - Index management
- ✅ `verify-ai-tools.ts` - Verification utility
- ✅ `update-ai-tools-2025-safe.ts` - Recent safe update script

**Total to Remove from /db/**: ~6 files

---

### `/scripts/testing/` - 6 files (Remove ~2)

- ❌ `test-prompts-batch.ts` - One-off batch test
- ❌ `test-prompts.ts` - Duplicate functionality

**Keep**:
- ✅ `analyze-test-results.ts` - Useful utility
- ✅ `flaky-test-detector.ts` - Useful utility
- ✅ `test-adapters.ts` - Core testing
- ✅ `test-multi-agent-production.sh` - Production testing

---

### `/scripts/maintenance/` - 9 files (Keep Most)

**Keep All** - These are useful maintenance utilities:
- ✅ `check-enterprise-compliance.js` - Compliance checking
- ✅ `check-test-framework.js` - Framework validation
- ✅ `validate-schema.js` - Schema validation
- ✅ `smoke-test.sh` - Production testing
- ✅ `find-issues.sh` - Issue detection
- ✅ `cleanup-docs.sh` - Documentation cleanup
- ✅ `auto-fix-icons.js` - Icon fixing
- ✅ `fix-missing-icons.sh` - Icon fixing
- ✅ `count-todos.js` - Code analysis

---

### `/scripts/aws/` - 7 files (Keep All)

**Keep All** - Active AWS deployment scripts:
- ✅ All AWS scripts are actively used for deployment

---

### Root Level Scripts

- ❌ `test-lambda.sh` - One-off test
- ❌ `deploy-lambda.sh` - Superseded by AWS scripts?
- ✅ `seed-knowledge-base.ts` - Core seeding
- ✅ `start-rag-service.py` - Core service

---

## 📁 ARCHIVE vs DELETE

### Recommended Approach

**Create `/scripts/archive/one-off/`** and move (not delete) scripts there:
- Preserves history
- Can be recovered if needed
- Reduces clutter in main scripts/

### Archive Structure
```
scripts/
  archive/
    one-off/
      content-creation/     # Batch creation scripts
      migrations/           # One-time migrations
      audits/              # One-off audits
      tests/               # One-off test scripts
```

---

## 🎯 Cleanup Commands

### Step 1: Create Archive Structure
```bash
mkdir -p scripts/archive/one-off/{content-creation,migrations,audits,tests}
```

### Step 2: Move Content Creation Scripts
```bash
# Move large batch creation scripts
mv scripts/content/create-*-prompts.ts scripts/archive/one-off/content-creation/
mv scripts/content/seed-weak-role-prompts.ts scripts/archive/one-off/content-creation/
```

### Step 3: Move Audit Scripts
```bash
mv scripts/content/audit-*.ts scripts/archive/one-off/audits/
mv scripts/content/batch-audit-*.ts scripts/archive/one-off/audits/
mv scripts/content/quick-audit-*.ts scripts/archive/one-off/audits/
```

### Step 4: Move Migration Scripts
```bash
mv scripts/content/batch-improve-*.ts scripts/archive/one-off/migrations/
mv scripts/content/enrich-all-version1.ts scripts/archive/one-off/migrations/
mv scripts/admin/ensure-text-indexes*.ts scripts/archive/one-off/migrations/
mv scripts/admin/rebuild-text-indexes*.ts scripts/archive/one-off/migrations/
mv scripts/db/initialize-prompt-revisions.ts scripts/archive/one-off/migrations/
mv scripts/db/fix-learning-content-fields.ts scripts/archive/one-off/migrations/
```

### Step 5: Move Test Scripts
```bash
mv scripts/content/test-*.ts scripts/archive/one-off/tests/
mv scripts/testing/test-prompts*.ts scripts/archive/one-off/tests/
```

---

## 📊 Impact Summary

### Before Cleanup
- **Total Scripts**: ~200 files
- **Total Size**: ~3-4MB
- **Directories**: 20+

### After Cleanup
- **Active Scripts**: ~120-140 files
- **Archived**: ~60-80 files
- **Size Reduction**: ~1.5-2MB from active scripts/
- **Benefit**: Clearer structure, faster navigation

---

## ✅ Scripts to KEEP (Core Infrastructure)

### Essential Seeding
- `scripts/db/seed-ai-tools.ts`
- `scripts/seed-knowledge-base.ts`
- `scripts/content/seed-all-content.ts`

### Active Sync/Update
- `scripts/db/sync-ai-models-*.ts`
- `scripts/db/update-ai-tools-2025-safe.ts`

### Core Utilities
- `scripts/admin/engify-admin.ts`
- `scripts/admin/db-stats.ts`
- `scripts/maintenance/*` (all)
- `scripts/aws/*` (all)

### Active Content Generation
- `scripts/content/generate-*.ts` (keep active generators)
- `scripts/content/enrich-prompt.ts`
- `scripts/content/enrich-pattern.ts`

### Backup & Recovery
- `scripts/db/backup-mongodb.ts`
- `scripts/db/setup-backup-cron.sh`

---

## 🚀 Recommended Action Plan

1. **Review this audit** - Confirm scripts to archive
2. **Create archive structure** - Set up organized archive
3. **Move (don't delete)** - Preserve history
4. **Test** - Ensure no dependencies broken
5. **Commit** - Single commit with clear message
6. **Document** - Update scripts/README.md

---

## 💡 Future Best Practices

1. **Mark one-off scripts** - Add `# ONE-OFF` comment at top
2. **Use archive/one-off/** - Move completed one-offs immediately
3. **Regular cleanup** - Quarterly review of scripts/
4. **Document purpose** - Add clear comments about script lifecycle
