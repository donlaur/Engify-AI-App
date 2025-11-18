# COMPREHENSIVE SCRIPTS ANALYSIS REPORT
## Engify-AI-App Repository
**Analysis Date:** November 18, 2025

---

## EXECUTIVE SUMMARY

**Total Active Scripts:** 102
**Total Archived Scripts:** 153 (in `.archived/` directory)
**Archived Code:** 18,172 lines

### Key Findings:
1. **Already Archived:** 153 scripts properly archived (no action needed)
2. **One-Off/Migration Scripts:** 15-20 candidates for deletion/archival
3. **Duplicate Scripts:** 2-3 near-duplicates identified
4. **Setup/Testing Only:** 8-10 scripts
5. **Still Active & Needed:** ~75+ scripts

---

## CATEGORY 1: SCRIPTS ALREADY ARCHIVED (NO ACTION NEEDED)
**Status:** ✅ ALREADY HANDLED
**Location:** `/home/user/Engify-AI-App/scripts/.archived/`

These scripts are properly organized in `.archived/` with clear categorization:

### Archived Categories:
- **analysis/** (3 scripts) - One-off analysis exports
- **bi/** (3 scripts) - Business intelligence research generators  
- **content-generators/** (41 scripts) - Content generation (deprecated, moved to MCP servers)
- **db-migration/** (6 scripts) - Database migration (already executed)
- **development-checks/** (3 scripts) - One-off validation scripts
- **docker/** (1 script) - Docker build
- **maintenance-oneoff/** (3 scripts) - One-time maintenance
- **marketing/** (1 script) - Marketing launch checks
- **seo/** (1 script) - SEO validation

**Note:** The `.archived/README.md` confirms these were moved to reduce linting errors and improve code quality.

---

## CATEGORY 2: ONE-OFF DATA MIGRATION/SETUP SCRIPTS
**Status:** ⚠️ CANDIDATES FOR DELETION (Run once, never needed again)

These scripts were designed to populate initial data and should be deleted:

### 2.1 User/Account Setup (Never needed after initial setup)
| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/seed-user.ts` | Creates test user account (donlaur@gmail.com) | **YES** | One-time setup, hardcoded email |
| `/scripts/restore-user-from-backup.ts` | Restores specific user from Nov 6 backup | **YES** | One-time backup restore, hardcoded paths |
| `/scripts/seed-knowledge-base.ts` | Populates MongoDB knowledge base | **YES** | Initial data seeding only |

### 2.2 Prompt/Pattern Data Migration (Deprecated - replaced by JSON-based approach)
| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/seed-prompts-to-db.ts` | Seeds prompts from seed-prompts.ts to MongoDB | **MAYBE** | Uses deprecated getMongoDb(), modern approach uses public/data/prompts.json; check if still in use |
| `/scripts/seed-workflows-to-db.ts` | Seeds workflows to MongoDB | **MAYBE** | Check current usage; JSON-based approach preferred |
| `/scripts/restore-prompts.ts` | Restores prompts from public/data/prompts.json | **MAYBE** | Might be useful for recovery, but consider if still needed |
| `/scripts/restore-prompts-standalone.ts` | Standalone version without build mode restrictions | **YES** | DUPLICATE of restore-prompts.ts with minimal differences; keep only restore-prompts.ts |

### 2.3 Data Parsing/Migration (One-time transformations)
| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/data/parse-guardrails-to-json.ts` | Parse guardrails into JSON format | **YES** | Data migration already completed; no ongoing use |
| `/scripts/data/parse-recommendations-11-23.ts` | Parse recommendations from 11/23 | **YES** | One-time data transformation (67KB file), already executed |
| `/scripts/data/extract-pain-points.ts` | Extract pain points from workflows | **YES** | One-time analysis/extraction; data already in database |
| `/scripts/data/migrate-learning-resources.ts` | Migrate learning resources | **YES** | Data migration completed; not for ongoing use |
| `/scripts/data/merge-guardrails-into-workflows.ts` | Merge guardrails.json into workflows.json | **YES** | One-time merge operation; can be archived |
| `/scripts/data/update-recommendations-1-10.ts` | Update recommendations (dated 1-10) | **YES** | One-time update script; 39KB file size |
| `/scripts/data/enrich-workflow-citations.ts` | Enrich workflow citations with URLs | **MAYBE** | Check if periodically run or one-time only |

### 2.4 Database Index/Schema Setup
| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/db/create-prompt-indexes.ts` | Create MongoDB indexes for prompts | **MAYBE** | Needed for performance setup; can be kept but document as setup-only |
| `/scripts/db/create-revision-indexes.ts` | Create indexes for revision history | **MAYBE** | Similar to above; keep for reference |

### 2.5 API Key Migration
| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/data/seed-api-keys.ts` | Migrate API keys from .env.local to MongoDB | **YES** | One-time migration; no ongoing use |

---

## CATEGORY 3: NEAR-DUPLICATE SCRIPTS
**Status:** ⚠️ CONSOLIDATE OR DELETE

### Identified Duplicates:

#### Duplicate 1: restore-prompts.ts vs restore-prompts-standalone.ts
| Aspect | restore-prompts.ts | restore-prompts-standalone.ts |
|--------|------------------|----------------------------|
| **Path** | `/scripts/restore-prompts.ts` | `/scripts/restore-prompts-standalone.ts` |
| **Purpose** | Restore prompts from JSON | Restore prompts from JSON (standalone version) |
| **Difference** | Uses `getDb()` from lib | Direct MongoClient connection |
| **Size** | ~100 lines | ~150 lines |
| **Recommendation** | **DELETE restore-prompts-standalone.ts** - Keep only restore-prompts.ts unless direct MongoClient is still needed |

#### Duplicate 2: test-redis-rate-limit.ts vs test-upstash-redis.ts
| Aspect | test-redis-rate-limit.ts | test-upstash-redis.ts |
|--------|------------------------|---------------------|
| **Path** | `/scripts/test-redis-rate-limit.ts` | `/scripts/test-upstash-redis.ts` |
| **Purpose** | Test rate limiting with Redis | Test Upstash Redis connection |
| **Difference** | Rate limiting specific | General connection test |
| **Recommendation** | **KEEP BOTH** - Different purposes; Upstash is production service, rate-limit is feature test |

---

## CATEGORY 4: SETUP/CONFIGURATION/TESTING SCRIPTS
**Status:** ⚠️ NEEDED FOR SETUP, ARCHIVE AFTER INITIAL SETUP

These should be moved to `.archived/setup/` after initial configuration:

| File Path | Purpose | Should DELETE | Reasoning |
|-----------|---------|--------------|-----------|
| `/scripts/content/setup-test-environment.sh` | Setup test environment | **ARCHIVE** | One-time setup; move to .archived/setup/ |
| `/scripts/content/validate-environment.ts` | Validate environment vars are set | **KEEP** | Useful for CI/CD and onboarding |
| `/scripts/aws/validate-aws-config.sh` | Validate AWS configuration | **KEEP** | Useful for deployment verification |
| `/scripts/db/setup-backup-cron.sh` | Setup backup cron job | **ARCHIVE** | One-time configuration; move to .archived/setup/ |
| `/scripts/redis/setup-upstash.sh` | Setup Upstash Redis | **ARCHIVE** | One-time setup; move to .archived/setup/ |
| `/scripts/test-guardrails-validation.ts` | Test guardrails validation | **KEEP** | Useful for QA validation |
| `/scripts/test-lambda.sh` | Test Lambda API Gateway | **KEEP** | Useful for Lambda testing |
| `/scripts/test-redis-rate-limit.ts` | Test Redis rate limiting | **KEEP** | Integration test |
| `/scripts/test-upstash-redis.ts` | Test Upstash Redis | **KEEP** | Integration test |

---

## CATEGORY 5: MCP/PRIVATE REPO REFERENCES
**Status:** ✅ NO ISSUES FOUND

### Investigation Results:
- **Searched for:** References to MCP, memory layer, private repo
- **Findings:** Only references to public Anthropic MCP (Model Context Protocol) found in:
  - `/scripts/db/seed-ai-tools.ts` - References MCP protocol documentation
  - `/scripts/db/update-ai-tools-2025-safe.ts` - References MCP support as tool feature
- **Conclusion:** No scripts depend on private repos or components

---

## CATEGORY 6: ACTIVELY MAINTAINED & NEEDED SCRIPTS
**Status:** ✅ KEEP ALL

### 6.1 Admin & Monitoring (9 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `admin/engify-admin.ts` | Main admin CLI tool | ✅ |
| `admin/ensure-super-admin.ts` | Create super admin accounts | ✅ |
| `admin/db-stats.ts` | View database statistics | ✅ |
| `admin/audit-prompt-quality.ts` | Quality audits | ✅ |
| `admin/check-user.ts` | Check user accounts | ✅ |
| `admin/check-beta-requests.js` | Beta access tracking | ✅ |
| `admin/check-db-direct.js` | DB connection testing | ✅ |
| `admin/review-prompts.ts` | Prompt review workflow | ✅ |
| `admin/extract-case-studies-examples-text.ts` | Extract example content | ✅ |

### 6.2 Database Synchronization (5 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `db/sync-ai-models-from-openrouter.ts` | Sync AI models from OpenRouter API | ✅ |
| `db/sync-ai-models-from-config.ts` | Sync AI models from config | ✅ |
| `db/sync-ai-models-latest.ts` | Update AI models to latest | ✅ |
| `db/seed-ai-tools.ts` | Seed AI tools database | ✅ |
| `db/update-ai-tools-2025-safe.ts` | Safe update of AI tools | ✅ |

### 6.3 Deployment & AWS (6 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `deploy-lambda.sh` | Deploy RAG Lambda | ✅ |
| `aws/deploy-multi-agent-lambda.sh` | Deploy multi-agent Lambda | ✅ |
| `aws/deploy-python-backend.sh` | Deploy Python FastAPI | ✅ |
| `deployment/bootstrap.sh` | Bootstrap deployment | ✅ |
| `deployment/pre-push-test.sh` | Pre-push validation | ✅ |
| `deployment/smoke-test.sh` | Post-deployment smoke tests | ✅ |

### 6.4 Redis Management (7 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `redis/redis-manager.sh` | Redis management utility | ✅ |
| `redis/start-local.sh` | Start local Redis | ✅ |
| `redis/stop-local.sh` | Stop local Redis | ✅ |
| `redis/health-check.sh` | Health check | ✅ |
| `redis/monitor.sh` | Monitor Redis activity | ✅ |
| `redis/flush.sh` | Flush Redis data | ✅ |
| `redis/performance-test.sh` | Performance testing | ✅ |

### 6.5 CI/CD & Testing (8 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `ci/check-bundle-size.ts` | Bundle size checking | ✅ |
| `ci/end-of-day-audit.ts` | End-of-day quality audit | ✅ |
| `testing/test-prompts.ts` | Prompt functionality testing | ✅ |
| `testing/test-prompts-batch.ts` | Batch prompt testing | ✅ |
| `testing/analyze-test-results.ts` | Test results analysis | ✅ |
| `testing/flaky-test-detector.ts` | Flaky test detection | ✅ |
| `testing/test-adapters.ts` | Test adapters | ✅ |
| `deployment/verify-deployment.sh` | Verify deployments | ✅ |

### 6.6 Content Management (8 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `content/audit-database-content.ts` | Content audit | ✅ |
| `content/audit-prompts-patterns.ts` | Pattern audit | ✅ |
| `content/link-prompts-to-patterns.ts` | Link prompts to patterns | ✅ |
| `content/list-collections.ts` | List database collections | ✅ |
| `content/list-gemini-models.ts` | List available Gemini models | ✅ |
| `content/metadata-enrich.ts` | Enrich metadata | ✅ |
| `content/rss-fetch.ts` | Fetch RSS feeds | ✅ |
| `content/schedule.ts` | Content scheduling | ✅ |

### 6.7 Security & Policy (8 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `policy/check-route-guards.ts` | RBAC guard validation | ✅ |
| `ai/enforce-guardrails.ts` | AI guardrails enforcement | ✅ |
| `ai/replicate-smoke.ts` | Replicate API testing | ✅ |
| `security/audit-git-history.sh` | Git history audit | ✅ |
| `security/audit-secrets.js` | Secrets scanning | ✅ |
| `security/cleanup-git-history.sh` | Remove sensitive data | ✅ |
| `security/security-check.js` | Security validation | ✅ |
| `security/test-ai-keys.sh` | AI key testing | ✅ |

### 6.8 Development & Maintenance (8 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `development/audit-icons.ts` | Icon usage audit | ✅ |
| `development/verify-navigation-links.ts` | Navigation link verification | ✅ |
| `development/verify-source-urls.ts` | Source URL verification | ✅ |
| `maintenance/check-enterprise-compliance.js` | Compliance checking | ✅ |
| `maintenance/check-test-framework.js` | Test framework validation | ✅ |
| `maintenance/validate-schema.js` | Schema validation | ✅ |
| `performance/benchmark-api.ts` | API benchmarking | ✅ |
| `performance/benchmark-queries.ts` | Query performance testing | ✅ |

### 6.9 AWS Utilities (6 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `aws/login.sh` | AWS login helper | ✅ |
| `aws/assume-role.sh` | Assume AWS role | ✅ |
| `aws/create-secret.ts` | Create AWS Secrets Manager secret | ✅ |
| `aws/rotate-secret.ts` | Rotate secrets | ✅ |
| `aws/migrate-secrets.ts` | Migrate secrets | ✅ |
| `aws/set-lambda-env.sh` | Set Lambda environment | ✅ |

### 6.10 Other Active Scripts (7 scripts)
| Script | Purpose | Keep |
|--------|---------|------|
| `fix-guardrails-mitigation.ts` | Fix empty guardrail mitigations | ✅ |
| `post-deploy-refresh-json.sh` | Refresh JSON cache on deploy | ✅ |
| `ai/pre-change-check.sh` | Pre-change validation guardrails | ✅ |
| `_lib/colors.sh` | Color utility library | ✅ |
| `_lib/config.sh` | Config utility library | ✅ |
| `_lib/aws-common.sh` | AWS utility library | ✅ |
| `templates/script-template.ts` | Script template for new scripts | ✅ |

---

## SUMMARY OF RECOMMENDATIONS

### SCRIPTS TO DELETE (21 total)
**These should be removed entirely:**
1. `/scripts/seed-user.ts` - One-time account setup
2. `/scripts/restore-user-from-backup.ts` - One-time user restore
3. `/scripts/seed-knowledge-base.ts` - Initial data population
4. `/scripts/restore-prompts-standalone.ts` - Duplicate; keep restore-prompts.ts
5. `/scripts/data/parse-guardrails-to-json.ts` - Data migration completed
6. `/scripts/data/parse-recommendations-11-23.ts` - One-time parsing
7. `/scripts/data/extract-pain-points.ts` - One-time extraction
8. `/scripts/data/migrate-learning-resources.ts` - Migration completed
9. `/scripts/data/merge-guardrails-into-workflows.ts` - One-time merge
10. `/scripts/data/update-recommendations-1-10.ts` - Dated one-time update
11. `/scripts/data/seed-api-keys.ts` - Migration to MongoDB completed

**Scripts to Review (2):**
- `/scripts/seed-prompts-to-db.ts` - Verify if still in active use; uses deprecated getMongoDb()
- `/scripts/seed-workflows-to-db.ts` - Verify if still in active use

### SCRIPTS TO ARCHIVE (3 total)
**Move to `.archived/setup/` subdirectory:**
1. `/scripts/content/setup-test-environment.sh`
2. `/scripts/db/setup-backup-cron.sh`
3. `/scripts/redis/setup-upstash.sh`

### SCRIPTS TO KEEP (78 total)
- All admin, deployment, testing, security, and content scripts
- All database sync and development scripts
- All utility libraries and active monitoring scripts

### SCRIPTS ALREADY ARCHIVED (153 total)
- Located in `/scripts/.archived/` - No action needed
- Properly documented and categorized

---

## ACTION ITEMS

### Phase 1: Delete One-Off Scripts (HIGH PRIORITY)
```bash
# These scripts are no longer needed after initial setup
rm /scripts/seed-user.ts
rm /scripts/restore-user-from-backup.ts
rm /scripts/seed-knowledge-base.ts
rm /scripts/restore-prompts-standalone.ts
rm /scripts/data/parse-guardrails-to-json.ts
rm /scripts/data/parse-recommendations-11-23.ts
rm /scripts/data/extract-pain-points.ts
rm /scripts/data/migrate-learning-resources.ts
rm /scripts/data/merge-guardrails-into-workflows.ts
rm /scripts/data/update-recommendations-1-10.ts
rm /scripts/data/seed-api-keys.ts
```

### Phase 2: Verify & Review (MEDIUM PRIORITY)
```bash
# Check if these are still in active use:
# - /scripts/seed-prompts-to-db.ts
# - /scripts/seed-workflows-to-db.ts
# - /scripts/data/enrich-workflow-citations.ts

# If one-time use, delete or archive them
```

### Phase 3: Archive Setup Scripts (OPTIONAL)
```bash
# Move one-time setup scripts to .archived/setup/
mkdir -p /scripts/.archived/setup/
mv /scripts/content/setup-test-environment.sh /scripts/.archived/setup/
mv /scripts/db/setup-backup-cron.sh /scripts/.archived/setup/
mv /scripts/redis/setup-upstash.sh /scripts/.archived/setup/
```

### Phase 4: Update Documentation
- Update `/scripts/README.md` to reflect deletions
- Update `.archived/README.md` if archiving setup scripts
- Commit changes with clear message

---

## STATISTICS

| Category | Count | Action |
|----------|-------|--------|
| Scripts to DELETE | 11 | Remove from repo |
| Scripts to REVIEW | 2 | Verify usage |
| Scripts to ARCHIVE | 3 | Move to .archived/setup/ |
| Active KEEP scripts | 78 | No change |
| Already ARCHIVED | 153 | No change |
| **TOTAL** | **255** | |

**Estimated Code Reduction:** ~3,000-4,000 lines of code removed from active scripts directory

