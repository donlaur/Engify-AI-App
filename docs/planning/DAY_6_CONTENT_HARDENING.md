<!--
AI Summary: Day 6 Content Hardening - Remove all mock/hardcoded data from production site, migrate patterns to MongoDB for IP protection, fix MFA blocker for OpsHub access, resolve 39 critical TODOs.
Focus on site credibility, real data only, and protecting intellectual property in public repository.
Related: docs/content/PATTERNS_MIGRATION.md, docs/security/MFA_SUPER_ADMIN_BYPASS.md, docs/features/
-->

# Day 6 — Content Hardening

**Date:** November 1, 2025 (Saturday)  
**Priority:** Critical - Live site credibility + OpsHub access blocked  
**Standards:** Enterprise patterns, no private info in public repo, atomic commits, lint-compliant

Status Legend: ✅ done · ⚠️ in progress

## Phase Exit Criteria (for every phase)

- No hardcoded/mock data remains
- All data fetched from MongoDB or real APIs
- Patterns migrated to MongoDB, TypeScript files removed
- MFA blocker resolved, OpsHub accessible
- Enterprise standards maintained (RBAC, rate limiting, audit logging)
- Build passes, linting clean
- Atomic commits, no force push

---

## Phase 0 — Fix MFA Blocker (URGENT)

**Status:** ⚠️ Not started  
**Priority:** Critical - blocking admin access

**Problem:** Cannot access `/opshub` - "MFA required" blocks super_admin login

### Tasks

- ⚠️ Add super admin MFA bypass in middleware
- ⚠️ Test OpsHub access without MFA prompt
- ⚠️ Verify audit logging still captures actions
- ⚠️ Document security considerations

More detail: [Phase 0: MFA Super Admin Bypass](../security/MFA_SUPER_ADMIN_BYPASS.md)

**Red Hat Review Notes:**

- Security best practice: Super admin should have emergency access
- Production consideration: May want to enforce MFA for super admin in production via env var
- Compliance: Audit log still tracks all super admin actions

---

## Phase 1 — Patterns to MongoDB (USER EXPECTED DONE)

**Status:** ⚠️ Not started  
**Priority:** Critical - IP protection, user expected this completed

**Problem:** User asked for this earlier, believed it was complete. Patterns still in TypeScript files exposing IP in public repo.

### Tasks

- ⚠️ Create Pattern schema with Zod validation
- ⚠️ Create pattern seeding script (merge 3 source files)
- ⚠️ Create `/api/patterns` endpoint with RBAC and rate limiting
- ⚠️ Update patterns page to fetch from MongoDB
- ⚠️ Test migration (verify 23 patterns display correctly)
- ⚠️ Delete pattern TypeScript files from public repo

More detail: [Phase 1: Patterns Migration](../content/PATTERNS_MIGRATION.md)

**Acceptance:**

- ✅ 23 patterns in MongoDB `patterns` collection
- ✅ `/patterns` page fetches from API, not TS imports
- ✅ All pattern functionality works (filtering, display, linking)
- ✅ TypeScript pattern files deleted from public repo
- ✅ 2-3 example patterns kept for documentation only

**Red Hat Review Notes:**

- Protects IP: Patterns no longer exposed in public GitHub
- Performance: MongoDB with indexes faster than TypeScript imports
- Maintainability: Single source of truth (MongoDB), no code deploys for content changes
- Security: Content requires database access, not just git clone

---

## Phase 2 — Dashboard Gamification (Real Data Only)

**Status:** ⚠️ Not started  
**Priority:** High - user reported "mocked" gamification data

**Problem:** Dashboard shows 3 hardcoded achievements, empty activity array

### Tasks

- ⚠️ Fix recent activity display (use API data)
- ⚠️ Fix achievements section (remove 3 hardcoded achievements)
- ⚠️ Award "First Login" achievement automatically
- ⚠️ Add proper empty states ("No achievements yet")

More detail: [Phase 2: Dashboard Real Data](../features/DASHBOARD_REAL_DATA.md)

**Acceptance:**

- ✅ No hardcoded achievements displayed
- ✅ Recent activity shows real data or empty state
- ✅ First-time users see at least "First Login" achievement
- ✅ Progress bars show real XP values

**Red Hat Review Notes:**

- No more mock data: All displayed data comes from MongoDB
- User experience: First-time users see at least one achievement
- Accurate: Reflects real user progress, not fake milestones

---

## Phase 3 — Audit Page (Real AI Analysis)

**Status:** ⚠️ Not started  
**Priority:** High - destroys user trust with fake scores

**Problem:** Audit page shows mock delay and fake analysis scores

### Tasks

- ⚠️ Create `/api/prompts/audit` endpoint
- ⚠️ Integrate GPT-4o-mini for real KERNEL framework analysis
- ⚠️ Add RBAC (authenticated only) and rate limiting (10/hour)
- ⚠️ Update audit page to call real API
- ⚠️ Remove mock delay and fake results

More detail: [Phase 3: Real Audit Analysis](../features/REAL_AUDIT_ANALYSIS.md)

**Acceptance:**

- ✅ Audit uses real AI analysis (GPT-4o-mini)
- ✅ Returns genuine KERNEL framework scores
- ✅ Cost: ~$0.001-0.003 per audit (affordable)
- ✅ No mock data or delays

**Red Hat Review Notes:**

- Credibility: Real AI analysis, not fabricated scores
- Value: Users get actual feedback on their prompts
- Cost: Uses GPT-4o-mini (cheap) to keep costs low

---

## Phase 4 — Career Recommendations (Real API)

**Status:** ⚠️ Not started  
**Priority:** Medium - hardcoded recommendations

**Problem:** Component shows 3 hardcoded career recommendations

### Tasks

- ⚠️ Create `/api/career/recommendations` endpoint
- ⚠️ Connect to existing `CareerRecommendationService`
- ⚠️ Update component to fetch from API
- ⚠️ Add empty state for incomplete profiles

More detail: [Phase 4: Career Recommendations](../features/CAREER_RECOMMENDATIONS_API.md)

**Acceptance:**

- ✅ Recommendations based on real user data
- ✅ Uses existing service (no new business logic)
- ✅ Empty state: "Complete your profile to get recommendations"

**Red Hat Review Notes:**

- Real value: Recommendations based on actual user data
- Service exists: Just needs API endpoint wrapper

---

## Phase 5 — Site Stats (MongoDB Only)

**Status:** ⚠️ Not started  
**Priority:** Medium - stale hardcoded numbers

**Problem:** `siteStats` constant with hardcoded numbers (gets stale as content grows)

### Tasks

- ⚠️ Deprecate `siteStats` constant (mark but don't remove)
- ⚠️ Create `/api/stats` endpoint for real-time counts
- ⚠️ Update `ChatWidget` to fetch from API
- ⚠️ Find and replace other `siteStats` usage

More detail: [Phase 5: Site Stats Migration](../operations/SITE_STATS_MIGRATION.md)

**Acceptance:**

- ✅ Real-time stats from MongoDB
- ✅ Numbers update automatically as content grows
- ✅ No manual updates needed

**Red Hat Review Notes:**

- Accuracy: Real-time stats from MongoDB
- No stale numbers: Updates automatically as content grows

---

## Phase 6 — Resolve Critical TODOs

**Status:** ⚠️ Not started  
**Priority:** Medium-High - code quality and completeness

**Problem:** 39 TODOs scattered across codebase

### Tasks

#### 6.1 Auth MongoDB Adapter

- ⚠️ Uncomment MongoDB adapter in `src/lib/auth/config.ts`
- ⚠️ Fix version mismatch issues
- ⚠️ Test login/signup flows

#### 6.2 Audit Logging to MongoDB

- ⚠️ Implement `logCriticalEvent` in `src/lib/logging/audit.ts`
- ⚠️ Implement `queryAuditLogs`
- ⚠️ Implement `generateComplianceReport`

#### 6.3 tRPC Implementations

- ⚠️ Connect user router to MongoDB services (8 TODOs)
- ⚠️ Connect prompt router to MongoDB services
- ⚠️ Remove placeholder returns

#### 6.4 Affiliate Links (OpsHub Admin Feature)

- ⚠️ Move affiliate link management to OpsHub
- ⚠️ Create `/opshub/settings/affiliate-links` page
- ⚠️ Store in MongoDB `affiliate_config` collection
- ⚠️ Update via admin UI, not code changes

#### 6.5 Other TODOs

- ⚠️ Twilio MFA code storage (2 TODOs)
- ⚠️ Prompt rating API (1 TODO)
- ⚠️ Favorite save API (1 TODO)
- ⚠️ Analytics integration (1 TODO)
- ⚠️ Firewall stats (1 TODO)
- ⚠️ Dead letter queue (1 TODO)

More detail: [Phase 6: TODO Resolution](../development/TODO_RESOLUTION_DAY6.md)

**Acceptance:**

- ✅ All high-priority TODOs resolved
- ✅ Code quality improved
- ✅ No abandoned TODOs in critical paths

**Red Hat Review Notes:**

- Code quality: No abandoned TODOs
- Maintainability: Clear what's implemented vs not
- May defer some low-priority TODOs to Phase 7 if time-constrained

---

## Phase 7 — Delete IP from Public Repo

**Status:** ⚠️ Not started  
**Priority:** High - IP protection

**IMPORTANT:** Only execute after Phases 1-6 complete and verified

**Problem:** Valuable content exposed in TypeScript files in public repository

### Tasks

- ⚠️ Verify all content in MongoDB (patterns, prompts)
- ⚠️ Verify all pages fetch from APIs, not TS files
- ⚠️ Delete/minimize content TypeScript files
- ⚠️ Keep 2-3 examples only for documentation
- ⚠️ Update README with content storage note

More detail: [Phase 7: IP Protection Cleanup](../security/IP_PROTECTION_FINAL_CLEANUP.md)

**Files to Delete:**

- `src/data/prompt-patterns.ts`
- `src/data/pattern-details.ts`
- `src/lib/pattern-constants.ts`

**Files to Keep (Examples Only):**

- `src/data/examples/pattern-examples.ts` (2-3 patterns)
- `src/data/examples/prompt-examples.ts` (2-3 prompts)

**Acceptance:**

- ✅ 23 patterns verified in MongoDB
- ✅ 90+ prompts verified in MongoDB
- ✅ Site functions correctly without large TS content files
- ✅ Public repo contains only 2-3 examples

**Red Hat Review Notes:**

- IP Protection: Valuable content not exposed in public repo
- Public repo safety: Anyone can clone, but won't get full content library
- Compliance: Aligns with CONTENT_MIGRATION_PLAN.md strategy

---

## Success Criteria

1. ✅ MFA blocker resolved - can access /opshub
2. ✅ 23 patterns in MongoDB, /patterns page fetches from API
3. ✅ Dashboard shows real achievements and activity (never empty)
4. ✅ Audit page performs real AI analysis (no mocks)
5. ✅ Career recommendations use real service
6. ✅ Site stats from MongoDB, not constants
7. ✅ All critical TODOs resolved (39 total)
8. ✅ Pattern TypeScript files deleted/minimized
9. ✅ Build passes, all tests green
10. ✅ Linting clean, no violations
11. ✅ Enterprise standards maintained throughout

---

## Commit Strategy

**Atomic commits after each sub-phase:**

- Phase 0: `"fix: allow super admin MFA bypass for emergency access"`
- Phase 1.1-1.3: `"feat: add patterns API with MongoDB backend"`
- Phase 1.4: `"feat: patterns page now fetches from MongoDB"`
- Phase 1.6: `"chore: remove pattern IP from public repo"`
- Phase 2: `"fix: dashboard shows real gamification data, no mocks"`
- Phase 3: `"feat: audit page uses real AI analysis via GPT-4o"`
- Phase 4: `"feat: career recommendations from real service API"`
- Phase 5: `"refactor: migrate site stats to MongoDB"`
- Phase 6: `"fix: resolve critical TODOs (auth adapter, audit logging, tRPC)"`
- Phase 7: `"chore: remove remaining IP from public repo"`

**DO NOT push to remote until user approves**

---

## Files Changed (Estimated)

**New Files (15):**

- `src/lib/db/schemas/pattern.ts`
- `scripts/content/seed-patterns-to-db.ts`
- `src/app/api/patterns/route.ts`
- `src/app/api/prompts/audit/route.ts`
- `src/app/api/career/recommendations/route.ts`
- `src/app/api/stats/route.ts`
- `src/data/examples/pattern-examples.ts`
- `src/data/examples/prompt-examples.ts`
- `docs/planning/DAY_6_MOCK_DATA_REMOVAL.md` (this file)
- 8 supporting documentation files (see below)

**Modified Files (25+):**

- `src/middleware.ts` (MFA bypass)
- `src/app/patterns/page.tsx` (fetch from MongoDB)
- `src/app/dashboard/page.tsx` (real achievements)
- `src/app/audit/page.tsx` (real AI audit)
- `src/components/career/CareerRecommendations.tsx` (real API)
- `src/components/chat/ChatWidget.tsx` (real stats)
- `src/lib/constants.ts` (deprecate siteStats)
- `src/lib/auth/config.ts` (uncomment adapter)
- `src/lib/logging/audit.ts` (implement TODOs)
- `src/lib/services/GamificationService.ts` (first login achievement)
- `src/server/routers/user.ts` (implement TODOs)
- `src/server/routers/prompt.ts` (implement TODOs)
- 13+ other files for TODO resolution

**Deleted Files (3):**

- `src/data/prompt-patterns.ts`
- `src/data/pattern-details.ts`
- `src/lib/pattern-constants.ts`

---

## Related Documentation

### Planning & Architecture

- [Day 5 Part 2 Plan](./DAY_5_PART_2_CONTENT_QUALITY.md) (format reference)
- [Day 6 Content Hardening](./DAY_6_CONTENT_HARDENING.md) (this document)
- [Content Migration Plan](../operations/CONTENT_MIGRATION_PLAN.md)
- [Enterprise Compliance Audit](../ENTERPRISE_COMPLIANCE_AUDIT_DAY5.md)
- [Code Quality Review](../architecture/CODE_QUALITY_REVIEW.md)

### Phase-Specific Documentation

- [Phase 0: MFA Super Admin Bypass](../security/MFA_SUPER_ADMIN_BYPASS.md) (TODO: Create)
- [Phase 1: Patterns Migration](../content/PATTERNS_MIGRATION.md) (TODO: Create)
- [Phase 2: Dashboard Real Data](../features/DASHBOARD_REAL_DATA.md) (TODO: Create)
- [Phase 3: Real Audit Analysis](../features/REAL_AUDIT_ANALYSIS.md) (TODO: Create)
- [Phase 4: Career Recommendations](../features/CAREER_RECOMMENDATIONS_API.md) (TODO: Create)
- [Phase 5: Site Stats Migration](../operations/SITE_STATS_MIGRATION.md) (TODO: Create)
- [Phase 6: TODO Resolution](../development/TODO_RESOLUTION_DAY6.md) (TODO: Create)
- [Phase 7: IP Protection Cleanup](../security/IP_PROTECTION_FINAL_CLEANUP.md) (TODO: Create)

### Architecture Decision Records

- [ADR-007: Content Storage Strategy](../development/ADR/007-content-storage-strategy.md) (TODO: Create)

### Operations & Security

- [Public Repo Security Policy](../security/PUBLIC_REPO_SECURITY_POLICY.md)
- [What is Seeding?](../development/WHAT_IS_SEEDING.md)
