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

### One-time Data/Content Scripts (6 scripts)
- `data/enrich-workflow-citations.ts` - One-time citation enrichment
- `data/seed-prompts-to-db.ts` - One-time seed (uses deprecated getMongoDb())
- `data/seed-workflows-to-db.ts` - One-time seed
- `content/link-prompts-to-patterns.ts` - One-time linking
- `content/list-collections.ts` - Utility (use mongo shell instead)
- `content/list-gemini-models.ts` - Utility (use API directly)

**NOTE:** `content/audit-prompts-patterns.ts` was initially removed but restored - still used by API route

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

## Cleanup Round 3 (2025-11-18)

### Development/Testing/Performance Scripts (10 scripts)
- `development/audit-icons.ts` - One-time audit
- `development/verify-navigation-links.ts` - One-time verification
- `development/verify-source-urls.ts` - One-time verification
- `performance/benchmark-api.ts` - One-time benchmark
- `performance/benchmark-queries.ts` - One-time benchmark
- `testing/analyze-test-results.ts` - One-time analysis
- `testing/test-adapters.ts` - One-time test
- `testing/test-multi-agent-production.sh` - One-time test
- `testing/test-prompts-batch.ts` - One-time test
- `testing/test-prompts.ts` - One-time test

### Content/Data/Deployment Scripts (9 scripts)
- `content/metadata-enrich.ts` - One-time enrichment
- `content/save-to-mongo.ts` - One-time save
- `content/schedule.ts` - One-time scheduling
- `data/import-content-bulk.ts` - One-time import
- `data/import-external-resources.ts` - One-time import
- `deployment/pre-push-test.sh` - One-time test
- `deployment/verify-deployment.sh` - One-time verification
- `deployment/smoke-test.sh` - Duplicate (kept in maintenance/)
- `maintenance/validate-schema.js` - One-time validation

---

## Cleanup Round 4 (2025-11-18) - Agent-Assisted

### Admin Scripts (4 scripts)
- `admin/check-beta-requests.js` - Duplicate of engify-admin.ts
- `admin/check-db-direct.js` - Duplicate of db-stats.ts
- `admin/extract-case-studies-examples-text.ts` - One-time extraction (completed)
- `admin/create-user-gamification.ts` - Manual setup (not in workflow)

### DB Scripts (4 scripts)
- `db/seed-ai-tools.ts` - Replaced by sync-ai-models-latest.ts
- `db/sync-ai-models-from-config.ts` - Replaced by sync-ai-models-latest.ts
- `db/sync-ai-models-from-openrouter.ts` - Experimental (abandoned)
- `db/update-ai-tools-2025-safe.ts` - One-time 2025 update (completed)

### Security/Content Scripts (3 scripts)
- `security/audit-secrets.js` - Overlaps with security-check.js
- `content/audit-database-content.ts` - One-time audit
- `content/rss-fetch.ts` - Manual utility (not in active workflow)

---

**Total Removed:** 61 scripts (1 restored)
**Reduction:** 175 → 115 scripts (34% reduction)
**Lines Removed:** ~25,000+ lines

All scripts can be recovered from git history using:
```bash
git log --all --full-history -- "scripts/path/to/file.ts"
git show <commit-hash>:scripts/path/to/file.ts > restored-file.ts
```
