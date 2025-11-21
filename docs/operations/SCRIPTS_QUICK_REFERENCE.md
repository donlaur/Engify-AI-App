# Scripts Cleanup - Quick Reference Guide

## Overview - COMPLETED ✅
- **Original Scripts:** 175 active scripts
- **After Cleanup:** 166 active scripts
- **Scripts Removed:** 9 one-off/completed scripts
- **Reduction:** 5% script count reduction

---

## COMPLETED ACTIONS ✅

These 11 scripts have been deleted:

```bash
rm -f /scripts/seed-user.ts
rm -f /scripts/restore-user-from-backup.ts
rm -f /scripts/seed-knowledge-base.ts
rm -f /scripts/restore-prompts-standalone.ts
rm -f /scripts/data/parse-guardrails-to-json.ts
rm -f /scripts/data/parse-recommendations-11-23.ts
rm -f /scripts/data/extract-pain-points.ts
rm -f /scripts/data/migrate-learning-resources.ts
rm -f /scripts/data/merge-guardrails-into-workflows.ts
rm -f /scripts/data/update-recommendations-1-10.ts
rm -f /scripts/data/seed-api-keys.ts
```

**Status:** ✅ DELETED (2025-11-18)
**Reason:** One-time setup/migration scripts that are no longer needed

Additional scripts removed:
- `/scripts/fix-guardrails-mitigation.ts` - One-off fix (completed)
- `/scripts/test-guardrails-validation.ts` - One-off test (completed)

---

## REVIEW BEFORE DELETION - MEDIUM PRIORITY

Verify if these are still in active use before deleting:

1. **`/scripts/seed-prompts-to-db.ts`**
   - Uses deprecated `getMongoDb()` function
   - Check if modern JSON-based approach has replaced it
   - Status: Likely can be deleted

2. **`/scripts/seed-workflows-to-db.ts`**
   - Check current usage in CI/CD
   - If not in active pipelines, delete

3. **`/scripts/data/enrich-workflow-citations.ts`**
   - Check if run periodically or one-time only
   - If one-time, archive to `.archived/maintenance-oneoff/`

---

## OPTIONAL - SETUP SCRIPTS TO ARCHIVE

Move these to `.archived/setup/` for future reference:

```bash
mkdir -p /scripts/.archived/setup/
mv /scripts/content/setup-test-environment.sh /scripts/.archived/setup/
mv /scripts/db/setup-backup-cron.sh /scripts/.archived/setup/
mv /scripts/redis/setup-upstash.sh /scripts/.archived/setup/
```

---

## SCRIPTS TO KEEP (78 Total)

All scripts in these categories should be kept:

- ✅ **Admin Scripts** (9) - User/database management
- ✅ **Deployment Scripts** (6) - AWS Lambda, Python backend
- ✅ **Testing Scripts** (8) - Unit tests, integration tests
- ✅ **Security Scripts** (8) - Audit, secrets, guards
- ✅ **Database Sync** (5) - AI models, tools sync
- ✅ **Redis Management** (7) - Local/Upstash Redis ops
- ✅ **Content Management** (8) - Audits, enrichment
- ✅ **Development Tools** (8) - Icons, links, validation
- ✅ **AWS Utilities** (6) - Secrets, roles, env vars
- ✅ **Utility Libraries** (3) - colors.sh, config.sh, aws-common.sh
- ✅ **Templates** (1) - script-template.ts (reference for new scripts)

---

## ALREADY ARCHIVED (153 scripts in `.archived/`)

**Status:** ✅ No action needed - Already properly organized

- **analysis/** (3) - One-off analysis
- **bi/** (3) - Business intelligence research
- **content-generators/** (41) - Content generation (moved to MCP servers)
- **db-migration/** (6) - Database migration (completed)
- **development-checks/** (3) - One-off checks
- **docker/** (1) - Docker builds
- **maintenance-oneoff/** (3) - One-time maintenance
- **marketing/** (1) - Marketing launch
- **seo/** (1) - SEO validation

---

## KEY FINDINGS

### No MCP/Private Repo Issues
- MCP references found are only for the **public Anthropic MCP protocol**
- No dependencies on private repositories or moved components
- Scripts are clean in this regard

### Duplicate Scripts Identified
1. **`restore-prompts.ts`** vs **`restore-prompts-standalone.ts`**
   - Keep: `restore-prompts.ts` (uses lib getDb())
   - Delete: `restore-prompts-standalone.ts` (direct MongoClient)

2. **`test-redis-rate-limit.ts`** vs **`test-upstash-redis.ts`**
   - Keep BOTH - Different purposes
   - One tests rate limiting, other tests Upstash connection

---

## NEXT STEPS

1. **Phase 1:** Delete high-priority one-off scripts (15 min)
2. **Phase 2:** Review usage of 2-3 questionable scripts (30 min)
3. **Phase 3:** Archive 3 setup scripts (10 min)
4. **Phase 4:** Update documentation (15 min)
5. **Phase 5:** Commit changes with clear message

**Total Time:** ~1.5 hours to complete cleanup

---

## FILES FOR REFERENCE

- **Full Analysis:** `/scripts/SCRIPTS_CLEANUP_ANALYSIS.md`
- **This Guide:** `/SCRIPTS_QUICK_REFERENCE.md`

