# MongoDB Connection Audit

**Date:** 2025-11-09  
**Purpose:** Identify all MongoDB connections and optimize for M0 tier limits

## Executive Summary

**M0 Tier Limits:**
- Max connections: 500 total
- Alert threshold: 80% (400 connections)
- Current strategy: 1 connection per serverless function, 5s idle timeout

**Collections with ISR/JSON Cache (LOW RISK):**
- ✅ `prompts` (296 docs) - Has JSON ISR + immutable backup
- ✅ `patterns` (18 docs) - Has JSON ISR + immutable backup
- ✅ `learning_resources` (20 docs) - Has JSON ISR + immutable backup

**Collections WITHOUT ISR Cache (NEEDS REVIEW):**
- ⚠️ `users` - Auth queries on every request
- ⚠️ `workbench_runs` - Real-time workbench data
- ⚠️ `ai_usage` - Usage tracking
- ⚠️ `audit_logs` - Audit trail
- ⚠️ `bug_reports` - User feedback
- ⚠️ `api_keys` - API key management
- ⚠️ `mfa_codes` - MFA verification
- ⚠️ And more...

---

## 1. Content Collections (HAS ISR CACHE)

### Prompts Collection
**Status:** ✅ PROTECTED  
**Documents:** 296  
**ISR Cache:** `public/data/prompts.json`  
**Immutable Backup:** `public/data/prompts-backup.json` (in git)  
**Fallback Chain:** JSON → MongoDB → Backup

**DB Access Points:**
- `src/lib/prompts/load-prompts-from-json.ts` - Primary loader (uses JSON first)
- `src/lib/db/repositories/PromptRepository.ts` - Repository layer
- `src/app/api/prompts/route.ts` - API endpoints (admin only)
- `src/app/api/prompts/[id]/route.ts` - Single prompt fetch
- `src/app/api/prompts/[id]/audit/route.ts` - Audit operations
- `src/app/api/prompts/[id]/view/route.ts` - View tracking
- `src/app/api/prompts/collections/route.ts` - Collections management

**Optimization:** JSON ISR prevents most DB queries. Only admin operations hit DB directly.

---

### Patterns Collection
**Status:** ✅ PROTECTED  
**Documents:** 18  
**ISR Cache:** `public/data/patterns.json`  
**Immutable Backup:** `public/data/patterns-backup.json` (in git)  
**Fallback Chain:** JSON → MongoDB → Backup

**DB Access Points:**
- `src/lib/patterns/load-patterns-from-json.ts` - Primary loader (uses JSON first)
- `src/lib/db/repositories/PatternRepository.ts` - Repository layer

**Optimization:** JSON ISR prevents most DB queries.

---

### Learning Resources Collection
**Status:** ✅ PROTECTED  
**Documents:** 20  
**ISR Cache:** `public/data/learning.json`  
**Immutable Backup:** `public/data/learning-backup.json` (in git)  
**Fallback Chain:** JSON → MongoDB → Backup

**DB Access Points:**
- `src/lib/db/repositories/LearningResourceRepository.ts` - Repository layer

**Optimization:** JSON ISR prevents most DB queries.

---

## 2. User & Auth Collections (NO CACHE - HIGH FREQUENCY)

### Users Collection
**Status:** ⚠️ HIGH FREQUENCY  
**Documents:** ~1-100 (varies)  
**Cache:** None (auth requires fresh data)  
**Risk:** Every authenticated request queries this

**DB Access Points:**
- `src/lib/auth.ts` - NextAuth session validation (EVERY AUTH REQUEST)
- `src/app/api/auth/signup/route.ts` - User registration
- `src/app/api/user-stats/route.ts` - User stats
- `src/app/api/user/stats/route.ts` - User stats (duplicate?)

**Optimization Needed:**
- ✅ Already using NextAuth session caching (JWT)
- ⚠️ Consider Redis cache for user lookups
- ⚠️ Reduce user stats queries (combine endpoints)

---

### MFA Codes Collection
**Status:** ⚠️ MODERATE FREQUENCY  
**Documents:** Temporary (auto-expire)  
**Cache:** None (security requirement)

**DB Access Points:**
- `src/lib/services/mfaService.ts` - MFA code generation/verification
- Auto-cleanup of expired codes

**Optimization:** Already minimal. Only used during MFA flow.

---

## 3. Analytics & Tracking Collections (NO CACHE - WRITE HEAVY)

### AI Usage Collection
**Status:** ⚠️ HIGH WRITE FREQUENCY  
**Documents:** Growing (every AI request)  
**Cache:** None (real-time tracking)

**DB Access Points:**
- `src/lib/ai/usage-tracker.ts` - Tracks every AI request
- `src/app/api/jobs/check-usage-alerts/route.ts` - Usage monitoring
- `src/app/api/jobs/daily-usage-report/route.ts` - Daily reports
- `src/app/api/jobs/monthly-analytics/route.ts` - Monthly analytics

**Optimization Needed:**
- ⚠️ **CRITICAL:** Batch writes instead of per-request
- ⚠️ Consider write buffer (collect 10-50 requests, bulk insert)
- ⚠️ Or use Redis for hot data, sync to Mongo hourly

---

### Audit Logs Collection
**Status:** ⚠️ MODERATE WRITE FREQUENCY  
**Documents:** Growing (security events)  
**Cache:** None (compliance requirement)

**DB Access Points:**
- `src/lib/logging/audit.ts` - Audit trail for all sensitive operations

**Optimization:** Already minimal. Consider batching for non-critical events.

---

### Analytics Tracking Collection
**Status:** ⚠️ MODERATE WRITE FREQUENCY  
**Documents:** Growing (user events)  
**Cache:** None (real-time tracking)

**DB Access Points:**
- `src/app/api/analytics/track/route.ts` - Event tracking

**Optimization Needed:**
- ⚠️ Batch writes (collect events, bulk insert every 30s)
- ⚠️ Or use Redis buffer

---

## 4. Workbench & Real-Time Collections (NO CACHE - ACTIVE USE)

### Workbench Runs Collection
**Status:** ⚠️ MODERATE FREQUENCY  
**Documents:** User session data  
**Cache:** None (real-time state)

**DB Access Points:**
- `src/lib/services/workbenchRuns.ts` - Workbench session management
- Creates/updates runs during active workbench use

**Optimization:** Already minimal. Only active during workbench sessions.

---

## 5. Admin & Management Collections (LOW FREQUENCY)

### API Keys Collection
**Status:** ✅ LOW FREQUENCY  
**Documents:** ~10-100 (varies)  
**Cache:** None (security requirement)

**DB Access Points:**
- `src/lib/services/ApiKeyService.ts` - API key CRUD
- `src/lib/services/ApiKeyUsageService.ts` - Usage tracking

**Optimization:** Already minimal. Only admin operations.

---

### Bug Reports Collection
**Status:** ✅ LOW FREQUENCY  
**Documents:** User-submitted bugs  
**Cache:** None

**DB Access Points:**
- `src/app/api/bug-reports/route.ts` - Bug submission

**Optimization:** Already minimal.

---

### Affiliate Links Collection
**Status:** ✅ LOW FREQUENCY  
**Documents:** Affiliate link tracking  
**Cache:** None

**DB Access Points:**
- `src/app/api/admin/affiliate-links/route.ts` - Admin management

**Optimization:** Already minimal.

---

## 6. Stats & Aggregation (CACHED)

### Platform Stats
**Status:** ✅ CACHED (Redis)  
**Cache:** Redis (1 hour TTL)  
**Fallback:** MongoDB aggregations

**DB Access Points:**
- `src/lib/stats/fetch-platform-stats.ts` - Platform-wide stats
- `src/lib/services/StatsService.ts` - Stats service
- `src/app/api/stats/route.ts` - Stats API

**Optimization:** ✅ Already using Redis cache. Only hits DB if cache miss.

---

## Connection Pool Analysis

### Current Settings (M0 Optimized)
```typescript
{
  maxPoolSize: 1,              // 1 connection per function
  minPoolSize: 0,              // No idle connections
  maxIdleTimeMS: 5000,         // Close after 5s idle
  waitQueueTimeoutMS: 3000,    // Fail fast if pool full
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  connectTimeoutMS: 8000,
}
```

### Estimated Connection Usage

**Per Request (Authenticated):**
- Auth check: 1 connection (NextAuth session)
- Content load: 0 connections (uses JSON ISR)
- **Total: ~1 connection per request**

**Per AI Request:**
- Usage tracking: 1 connection (write)
- Auth check: 1 connection (if authenticated)
- **Total: ~2 connections per AI request**

**Peak Load Estimate:**
- 100 concurrent requests = ~100-200 connections
- Well under 500 limit ✅

---

## Recommendations

### CRITICAL (Do Now)
1. ✅ **DONE:** Add immutable backups for prompts/patterns/learning
2. ✅ **DONE:** Implement triple fallback (JSON → MongoDB → Backup)
3. ✅ **DONE:** Aggressive connection cleanup (5s idle timeout)

### HIGH PRIORITY (Next Sprint)
4. ⚠️ **Batch AI usage writes** - Buffer 10-50 requests, bulk insert
   - File: `src/lib/ai/usage-tracker.ts`
   - Impact: Reduce write connections by 90%

5. ⚠️ **Batch analytics writes** - Buffer events, bulk insert every 30s
   - File: `src/app/api/analytics/track/route.ts`
   - Impact: Reduce write connections by 80%

6. ⚠️ **Add Redis cache for user lookups** - Cache user data for 5 minutes
   - File: `src/lib/auth.ts`
   - Impact: Reduce auth queries by 70%

### MEDIUM PRIORITY (Future)
7. ⚠️ **Consolidate user stats endpoints** - Merge duplicate endpoints
   - Files: `src/app/api/user-stats/route.ts`, `src/app/api/user/stats/route.ts`
   - Impact: Reduce redundant queries

8. ⚠️ **Add connection pool monitoring** - Track active connections
   - Add Datadog/CloudWatch metrics
   - Alert at 60% threshold (300 connections)

### LOW PRIORITY (Nice to Have)
9. ✅ **Consider M10 upgrade** - If traffic grows significantly
   - Cost: $0.08/hour (~$58/month)
   - Benefit: 1,500 connection limit (3x current)

---

## Collections Summary

| Collection | Docs | ISR Cache | Immutable Backup | Frequency | Risk |
|------------|------|-----------|------------------|-----------|------|
| `prompts` | 296 | ✅ | ✅ | Low | ✅ Safe |
| `patterns` | 18 | ✅ | ✅ | Low | ✅ Safe |
| `learning_resources` | 20 | ✅ | ✅ | Low | ✅ Safe |
| `users` | ~100 | ❌ | ❌ | High | ⚠️ Monitor |
| `ai_usage` | Growing | ❌ | ❌ | Very High | ⚠️ Batch writes |
| `analytics` | Growing | ❌ | ❌ | High | ⚠️ Batch writes |
| `workbench_runs` | ~1000 | ❌ | ❌ | Medium | ✅ OK |
| `audit_logs` | Growing | ❌ | ❌ | Medium | ✅ OK |
| `bug_reports` | ~50 | ❌ | ❌ | Low | ✅ OK |
| `api_keys` | ~50 | ❌ | ❌ | Low | ✅ OK |
| `mfa_codes` | Temp | ❌ | ❌ | Low | ✅ OK |

---

## Monitoring Checklist

- [ ] Set up MongoDB Atlas connection alerts (already at 80%)
- [ ] Add Datadog metrics for active connections
- [ ] Monitor `ai_usage` collection growth rate
- [ ] Track Redis cache hit rate for stats
- [ ] Review connection pool usage weekly

---

## Related Files

- `src/lib/mongodb.ts` - Connection pool configuration
- `src/lib/db/repositories/` - All repository implementations
- `docs/DATA_RESILIENCE_STRATEGY.md` - Data fallback strategy
- `.ai-guardrails.md` - Data protection rules

---

**Last Updated:** 2025-11-09  
**Next Review:** When traffic increases 2x or connection alerts trigger
