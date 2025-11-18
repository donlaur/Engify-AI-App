# Removed Scripts - Reference Log

Scripts removed during cleanup. Can be recovered from git history if needed.

## Cleanup Round 1 (2025-11-18)

### One-off Setup/Migration Scripts (11 scripts)
- `seed-user.ts` - One-time user seeding
- `restore-user-from-backup.ts` - One-time restore
- `seed-knowledge-base.ts` - One-time KB setup
- `restore-prompts-standalone.ts` - Standalone restore (kept restore-prompts.ts)
- `data/parse-guardrails-to-json.ts` - One-time parsing
- `data/parse-recommendations-11-23.ts` - One-time parsing
- `data/extract-pain-points.ts` - One-time extraction
- `data/migrate-learning-resources.ts` - Completed migration
- `data/merge-guardrails-into-workflows.ts` - One-time merge
- `data/update-recommendations-1-10.ts` - One-time update
- `data/seed-api-keys.ts` - One-time seed

### Test/Fix Scripts (2 scripts)
- `fix-guardrails-mitigation.ts` - Completed fix
- `test-guardrails-validation.ts` - Completed validation

## Cleanup Round 2 (2025-11-18)

### One-time Data/Content Scripts (7 scripts)
- `data/enrich-workflow-citations.ts` - One-time citation enrichment
- `data/seed-prompts-to-db.ts` - One-time seed (uses deprecated getMongoDb())
- `data/seed-workflows-to-db.ts` - One-time seed
- `content/link-prompts-to-patterns.ts` - One-time linking
- `content/list-collections.ts` - Utility (use mongo shell instead)
- `content/list-gemini-models.ts` - Utility (use API directly)
- `content/audit-prompts-patterns.ts` - One-time audit

### One-time Setup Scripts (4 scripts)
- `content/setup-test-environment.sh` - One-time test env setup
- `content/validate-environment.ts` - One-time validation
- `db/setup-backup-cron.sh` - One-time cron setup
- `deployment/bootstrap.sh` - One-time deployment setup

### One-time Index Creation (2 scripts)
- `db/create-prompt-indexes.ts` - One-time index creation (now done)
- `db/create-revision-indexes.ts` - One-time index creation (now done)

### One-off Maintenance/Test Scripts (7 scripts)
- `maintenance/cleanup-docs.sh` - One-off cleanup
- `maintenance/find-issues.sh` - One-off analysis
- `maintenance/fix-missing-icons.sh` - One-off fix
- `maintenance/check-test-framework.js` - One-off check
- `test-redis-rate-limit.ts` - One-off test (functionality tested)
- `test-upstash-redis.ts` - One-off test (connection verified)
- `test-lambda.sh` - One-off test

### Utility Scripts (2 scripts)
- `post-deploy-refresh-json.sh` - One-off post-deploy task
- `restore-prompts.ts` - One-time restore (data now stable)

---

**Total Removed:** 35 scripts
**Reduction:** 175 → 131 scripts (25% reduction)
**Lines Removed:** ~15,000+ lines

All scripts can be recovered from git history using:
```bash
git log --all --full-history -- "scripts/path/to/file.ts"
git show <commit-hash>:scripts/path/to/file.ts > restored-file.ts
```
