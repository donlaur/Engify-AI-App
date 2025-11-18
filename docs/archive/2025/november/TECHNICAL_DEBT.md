# Technical Debt Tracking

**Last Updated:** 2025-11-17
**Total Items:** 39 TODO comments + 8 NOTE comments = 47 total

> **Project Policy:** `.cursorrules` line 138 states "❌ NO TODO comments without tickets"
> This document serves as the central tracking system for all technical debt items.

---

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| **Total Technical Debt Comments** | 47 |
| **TODO Comments** | 39 |
| **NOTE Comments** | 8 |
| **FIXME Comments** | 0 |
| **HACK Comments** | 0 |
| **XXX Comments** | 0 |
| **Critical Priority** | 10 |
| **High Priority** | 11 |
| **Medium Priority** | 11 |
| **Low Priority** | 7 |
| **Archived/Inactive** | 8 |

---

## 🎯 Priority Breakdown

### Critical Priority (10 items) 🔴
**Impact:** Security vulnerabilities, authentication bypasses, data integrity issues

1. **Admin Role Authorization Missing**
   - **File:** `src/server/trpc.ts:91`
   - **Type:** Security - Authentication/Authorization
   - **Issue:** Admin procedure has no actual admin role check (commented out)
   - **Risk:** Any authenticated user can access admin-only endpoints
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE IMMEDIATELY**
   ```typescript
   // TODO: Check if user has admin role
   // const user = await getUserById(ctx.session.user.id);
   // if (user.role !== 'admin' && user.role !== 'owner') {
   //   throw new TRPCError({ code: 'FORBIDDEN' });
   // }
   ```

2. **Bug Reports API - No Authentication (2 instances)**
   - **Files:**
     - `src/app/api/bug-reports/route.ts:39` (GET)
     - `src/app/api/bug-reports/route.ts:82` (POST)
   - **Type:** Security - Authentication
   - **Issue:** Endpoints marked for production auth implementation
   - **Risk:** Unauthenticated access to bug reports, potential spam/abuse
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

3. **Content Review RBAC Missing**
   - **File:** `src/app/api/content/review/route.ts:42`
   - **Type:** Security - Authorization
   - **Issue:** No role-based access control for content review
   - **Risk:** Unauthorized content approval/rejection
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

4. **Team Manager Verification Missing**
   - **File:** `src/app/api/manager/team/[teamId]/route.ts:55`
   - **Type:** Security - Authorization
   - **Issue:** No verification that user is manager of the specific team
   - **Risk:** Cross-team data access, privilege escalation
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

5. **QStash Signature Verification Missing**
   - **File:** `src/app/api/stats/invalidate/route.ts:74`
   - **Type:** Security - Webhook Verification
   - **Issue:** No signature verification for QStash webhooks
   - **Risk:** Unauthorized cache invalidation, DOS attacks
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

6. **HMAC Signature Verification Incomplete**
   - **File:** `src/lib/auth/verify-cron.ts:47`
   - **Type:** Security - Cryptographic Verification
   - **Issue:** Full HMAC signature verification not implemented
   - **Risk:** Cron job authentication bypass
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

7. **Password Reset Email Not Sent**
   - **File:** `src/lib/auth/AuthService.ts:308`
   - **Type:** Feature - Security
   - **Issue:** Password reset token created but email not sent
   - **Risk:** Feature appears broken, users cannot reset passwords
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

8. **Twilio Verification Code Storage Missing (2 instances)**
   - **Files:**
     - `src/lib/services/twilioService.ts:154` (code storage)
     - `src/lib/services/twilioService.ts:204` (code verification)
   - **Type:** Security - 2FA
   - **Issue:** SMS verification codes not stored or verified properly
   - **Risk:** 2FA bypass, insecure verification flow
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

9. **Dead Letter Queue Not Implemented**
   - **File:** `src/lib/messaging/queues/RedisMessageQueue.ts:485`
   - **Type:** Reliability - Message Queue
   - **Issue:** Failed messages logged but not moved to DLQ for retry
   - **Risk:** Message loss, no failed message recovery
   - **Recommendation:** ⚠️ **CREATE GITHUB ISSUE**

---

### High Priority (11 items) 🟠
**Impact:** Business revenue, user experience, data quality

#### **Monetization/Business (8 items)**

10-17. **Missing Affiliate/Referral Links**
   - **File:** `src/data/affiliate-links.ts`
   - **Type:** Business - Monetization
   - **Locations:**
     - Line 48: Codeium referral link
     - Line 57: Tabnine referral link
     - Line 96: Bolt referral link
     - Line 114: Anthropic affiliate program
     - Line 123: Google affiliate program
     - Line 132: Perplexity affiliate program
     - Line 151: Anthropic Claude partner program
     - Line 160: Groq referral link
   - **Issue:** Potential revenue sources not activated
   - **Business Impact:** Lost referral commissions
   - **Recommendation:** **CREATE TRACKING ISSUE** - Group as "Affiliate Program Outreach"
   - **Action Items:**
     - Contact each company's partnership team
     - Use partnership template in same file (line 202)
     - Track outreach status in CRM

18. **Analytics Tracking Not Implemented**
   - **File:** `src/data/affiliate-links.ts:181`
   - **Type:** Business - Analytics
   - **Function:** `trackAffiliateClick()`
   - **Issue:** Affiliate clicks not tracked for conversion optimization
   - **Business Impact:** No attribution data, cannot optimize referral strategy
   - **Recommendation:** **CREATE GITHUB ISSUE**

#### **Core Features (2 items)**

19. **Analytics Provider Integration Missing**
   - **File:** `src/lib/utils/analytics.ts:20`
   - **Type:** Feature - Analytics
   - **Issue:** No integration with PostHog, Mixpanel, or other analytics provider
   - **Impact:** No user behavior tracking, cannot measure product-market fit
   - **Recommendation:** **CREATE GITHUB ISSUE** - "Integrate Analytics Provider (PostHog/Mixpanel)"

20. **Pricing/Checkout Navigation Missing**
   - **File:** `src/components/features/MakeItMineButton.tsx:149`
   - **Type:** Feature - Conversion
   - **Issue:** "Make It Mine" button has no navigation logic
   - **Impact:** Broken conversion funnel, lost revenue
   - **Recommendation:** **CREATE GITHUB ISSUE** - High priority for monetization

---

### Medium Priority (11 items) 🟡
**Impact:** Feature completeness, data schema improvements

#### **Data Schema & Database (6 items)**

21-23. **Missing updatedAt Fields in Schemas**
   - **File:** `src/app/sitemap.ts`
   - **Type:** Refactor - Schema
   - **Locations:**
     - Line 547: Workflow schema
     - Line 572: Pain point schema
     - Line 588: Recommendation schema
   - **Issue:** Sitemap uses hardcoded `now`, should use actual update timestamps
   - **Impact:** SEO - Search engines don't know when content was actually updated
   - **Recommendation:** **CREATE ISSUE** - "Add updatedAt field to content schemas"

24-25. **MongoDB Stats Migration Incomplete**
   - **Files:**
     - `src/lib/constants.ts:68` - Remove after migration
     - `src/lib/ai/firewall.ts:356` - Implement stats from MongoDB
   - **Type:** Refactor - Data Migration
   - **Issue:** Stats still using old constants instead of MongoDB
   - **Impact:** Stale data, inconsistent stats
   - **Recommendation:** **CREATE ISSUE** - "Complete MongoDB stats migration"

26. **User Data Model Extension Needed**
   - **File:** `src/app/api/auth/signup/route.ts:59`
   - **Type:** Refactor - Schema
   - **Issue:** CreateUserData needs password field extension
   - **Impact:** Auth implementation incomplete
   - **Recommendation:** Medium priority - Part of auth system hardening

#### **Feature Implementations (5 items)**

27. **Notification System Not Implemented**
   - **File:** `src/lib/services/ApiKeyUsageService.ts:373`
   - **Type:** Feature - Notifications
   - **Issue:** Usage limit notifications via SendGrid/Twilio not implemented
   - **Impact:** Users hit rate limits without warning
   - **Recommendation:** **CREATE ISSUE** - "Implement API usage notifications"

28. **Learning Resources Generation Missing**
   - **File:** `src/app/api/webhooks/content-updated/route.ts:106`
   - **Type:** Feature - Content
   - **Issue:** Webhook doesn't regenerate learning resources JSON
   - **Impact:** Learning resources may be stale after content updates
   - **Recommendation:** Medium priority - Complete content pipeline

29. **Rich Content Sanitization Not Implemented**
   - **File:** `src/lib/security/sanitize.ts:62`
   - **Type:** Security - Input Validation
   - **Issue:** Proper rich content sanitization needed (currently regex-based)
   - **Impact:** Potential XSS if rich content is ever allowed
   - **Recommendation:** Low-Medium - Only needed if rich content support is added

30. **Password Reset Validation Schema Unused**
   - **File:** `src/lib/auth/AuthService.ts:42`
   - **Type:** Refactor - Validation
   - **Issue:** Commented validation schema for password reset
   - **Impact:** No input validation on password reset flow
   - **Recommendation:** Medium priority - Related to item #7

31. **Archived Script: Database Query TODOs**
   - **File:** `scripts/.archived/content-generators/generate-pillar-page.ts`
   - **Lines:** 871, 875, 876, 877, 878
   - **Type:** Refactor - Database Queries
   - **Issue:** 5 TODOs for database queries in archived script
   - **Status:** Script is archived, may not need fixing
   - **Recommendation:** **SKIP** - Only fix if script is reactivated

---

### Low Priority (7 items) ⚪
**Impact:** Code quality, future features, optional improvements

#### **Archived Scripts (6 items)**

32. **Gemini Research Generator**
   - **File:** `scripts/.archived/bi/gemini-research-generator.ts:494`
   - **Type:** Feature - Enhancement
   - **Issue:** More research types could be added
   - **Status:** Script is archived
   - **Recommendation:** **SKIP** - Only revisit if script is reactivated

33-37. **Pillar Page Generator - Database Queries**
   - **File:** `scripts/.archived/content-generators/generate-pillar-page.ts`
   - **Lines:** 871, 875, 876, 877, 878
   - **Type:** Feature - Database Integration
   - **Issue:** Hardcoded empty arrays instead of database queries
   - **Status:** Script is archived
   - **Recommendation:** **SKIP** - Archived, not in active use

38. **Embedding Generation Not Implemented**
   - **File:** `scripts/seed-knowledge-base.ts:9`
   - **Type:** Feature - ML/AI
   - **Issue:** Actual embedding generation not implemented
   - **Impact:** Knowledge base seeding may not work fully
   - **Recommendation:** Low priority - Only needed if RAG/semantic search is planned

---

### NOTE Comments (8 items) 📝
**These are informational, not actionable debt**

1. **Middleware NOTE** - `src/middleware.ts:5`
   - Explains prompt slug redirect behavior
   - **Status:** ✅ Documentation, not debt

2. **Seed Prompts NOTE** - `src/data/seed-prompts.ts:7`
   - Explains file contains curated examples
   - **Status:** ✅ Documentation, not debt

3. **Sanitize Library NOTEs (2)** - `src/lib/security/sanitize.ts:5,55`
   - Explains regex-based approach for serverless
   - Suggests DOMPurify for client-side
   - **Status:** ✅ Architecture decision, not debt

4. **Prompt Audit Scores NOTE** - `src/components/features/PromptAuditScores.tsx:7`
   - Explains why security scores are hidden (fake data removal - ADR-009)
   - **Status:** ✅ Policy documentation, not debt

5. **Test NOTE** - `src/components/__tests__/PromptCard.test.tsx:53`
   - Documents removal of view count/rating (Issue #20)
   - **Status:** ✅ Historical context, not debt

6. **Site Stats NOTE** - `src/lib/site-stats.ts:7`
   - Explains static/cached stats for SSR
   - **Status:** ✅ Architecture decision, not debt

7. **Page Component NOTE** - `src/app/prompts/[id]/page.tsx:79`
   - Explains force-dynamic setting prevents 404s
   - **Status:** ✅ Configuration explanation, not debt

---

## 📈 Statistics & Insights

### By Category

| Category | Count | % of Total |
|----------|-------|------------|
| Security/Authentication | 10 | 26% |
| Business/Monetization | 9 | 23% |
| Feature Implementation | 6 | 15% |
| Data Schema/Database | 6 | 15% |
| Refactoring | 3 | 8% |
| Archived Scripts | 5 | 13% |

### By Priority

| Priority | Count | % of Total |
|----------|-------|------------|
| Critical 🔴 | 10 | 26% |
| High 🟠 | 11 | 28% |
| Medium 🟡 | 11 | 28% |
| Low ⚪ | 7 | 18% |

### By File Type

| Type | Count |
|------|-------|
| API Routes | 11 |
| Services/Libraries | 10 |
| Data/Config | 11 |
| Components | 1 |
| Scripts (Active) | 1 |
| Scripts (Archived) | 5 |

### Hotspot Files (Most TODOs)

| File | TODO Count | Priority Level |
|------|------------|----------------|
| `src/data/affiliate-links.ts` | 9 | High (Business) |
| `scripts/.archived/content-generators/generate-pillar-page.ts` | 5 | Low (Archived) |
| `src/app/sitemap.ts` | 3 | Medium (Schema) |
| `src/lib/auth/AuthService.ts` | 2 | Critical (Security) |
| `src/lib/services/twilioService.ts` | 2 | Critical (Security) |
| `src/app/api/bug-reports/route.ts` | 2 | Critical (Security) |

---

## 🎯 Top 10 Most Critical Items

### Immediate Action Required

1. **Admin Authorization Bypass** (`src/server/trpc.ts:91`)
   - **Risk:** Critical security vulnerability
   - **Action:** Implement admin role check immediately
   - **Issue Type:** GitHub Issue + Security Review

2. **Bug Reports API - No Auth** (2 instances)
   - **Risk:** Unauthenticated data access
   - **Action:** Add proper session/auth for production
   - **Issue Type:** GitHub Issue

3. **Content Review RBAC Missing** (`src/app/api/content/review/route.ts:42`)
   - **Risk:** Unauthorized content manipulation
   - **Action:** Implement role-based access control
   - **Issue Type:** GitHub Issue

4. **Team Manager Verification** (`src/app/api/manager/team/[teamId]/route.ts:55`)
   - **Risk:** Cross-team privilege escalation
   - **Action:** Verify user is manager of specific team
   - **Issue Type:** GitHub Issue

5. **QStash Webhook Security** (`src/app/api/stats/invalidate/route.ts:74`)
   - **Risk:** Unauthorized webhook calls
   - **Action:** Implement @upstash/qstash signature verification
   - **Issue Type:** GitHub Issue

6. **Twilio 2FA Storage** (2 instances)
   - **Risk:** 2FA verification bypass
   - **Action:** Implement code storage with expiration + verification
   - **Issue Type:** GitHub Issue

7. **Password Reset Email** (`src/lib/auth/AuthService.ts:308`)
   - **Risk:** Broken feature, poor UX
   - **Action:** Integrate SendGrid/Twilio for reset emails
   - **Issue Type:** GitHub Issue

8. **Dead Letter Queue** (`src/lib/messaging/queues/RedisMessageQueue.ts:485`)
   - **Risk:** Message loss in production
   - **Action:** Implement DLQ for failed messages
   - **Issue Type:** GitHub Issue

9. **Affiliate Analytics Tracking** (`src/data/affiliate-links.ts:181`)
   - **Risk:** No conversion data, lost revenue optimization
   - **Action:** Integrate with analytics provider (PostHog/Mixpanel)
   - **Issue Type:** GitHub Issue

10. **Make It Mine Button** (`src/components/features/MakeItMineButton.tsx:149`)
    - **Risk:** Broken conversion funnel
    - **Action:** Implement pricing/checkout navigation
    - **Issue Type:** GitHub Issue

---

## 🏗️ Recommended GitHub Issues

### Batch 1: Security Hardening (URGENT)
**Create Epic:** "Security & Authentication Hardening"

- [ ] Issue #1: Implement admin role authorization in tRPC (`src/server/trpc.ts:91`)
- [ ] Issue #2: Add authentication to bug reports API (2 instances)
- [ ] Issue #3: Implement RBAC for content review API
- [ ] Issue #4: Add team manager verification
- [ ] Issue #5: Implement QStash webhook signature verification
- [ ] Issue #6: Complete HMAC signature verification for cron jobs
- [ ] Issue #7: Implement Twilio verification code storage & verification

**Priority:** P0 - Critical
**Estimated Effort:** 2-3 sprints
**Dependencies:** User role schema, RBAC middleware

---

### Batch 2: Monetization & Analytics (HIGH)
**Create Epic:** "Revenue & Analytics Tracking"

- [ ] Issue #8: Affiliate program outreach (8 companies - see `src/data/affiliate-links.ts`)
  - Subtasks: Codeium, Tabnine, Bolt, Anthropic, Google, Perplexity, Groq
- [ ] Issue #9: Implement affiliate click tracking with PostHog/Mixpanel
- [ ] Issue #10: Integrate analytics provider (PostHog recommended)
- [ ] Issue #11: Fix "Make It Mine" button navigation to pricing
- [ ] Issue #12: Implement API key usage notifications (SendGrid/Twilio)

**Priority:** P1 - High
**Estimated Effort:** 2 sprints
**Business Impact:** Direct revenue increase

---

### Batch 3: Data Schema & Content (MEDIUM)
**Create Epic:** "Schema Improvements & Content Pipeline"

- [ ] Issue #13: Add `updatedAt` field to workflow/pain-point/recommendation schemas
- [ ] Issue #14: Complete MongoDB stats migration (remove constants fallback)
- [ ] Issue #15: Extend CreateUserData to include password field
- [ ] Issue #16: Implement learning resources JSON generation in webhook
- [ ] Issue #17: Implement password reset email sending (SendGrid)
- [ ] Issue #18: Implement message queue dead letter queue

**Priority:** P2 - Medium
**Estimated Effort:** 1-2 sprints
**Dependencies:** MongoDB schema updates, email service setup

---

### Batch 4: Code Quality & Technical Improvements (LOW)
**Optional - Good First Issues**

- [ ] Issue #19: Implement proper rich content sanitization (if needed)
- [ ] Issue #20: Clean up archived scripts or reactivate with database queries
- [ ] Issue #21: Implement knowledge base embedding generation (if RAG planned)

**Priority:** P3 - Low
**Estimated Effort:** 1 sprint
**Note:** Some may not be needed - evaluate before implementing

---

## 📋 Maintenance Recommendations

### 1. **Immediate Actions** (This Week)
- Create GitHub issues for all Critical priority items (10 issues)
- Schedule security review meeting
- Assign owners to top 5 critical items
- Add to current sprint if capacity allows

### 2. **Short Term** (This Month)
- Create GitHub issues for High priority items (11 issues)
- Prioritize monetization items (affiliate tracking)
- Complete at least 5 critical security items

### 3. **Medium Term** (This Quarter)
- Address all Medium priority items
- Complete MongoDB migration
- Implement full analytics tracking
- Schema improvements for SEO

### 4. **Long Term** (Ongoing)
- Enforce "no TODO without ticket" policy from `.cursorrules`
- Pre-commit hook to block TODO comments without GitHub issue reference
- Monthly technical debt review
- Target: Reduce technical debt by 50% per quarter

---

## 🔄 Process Improvements

### Prevent New Technical Debt

1. **Enforce `.cursorrules` Policy**
   ```bash
   # Add pre-commit hook to reject TODOs without tickets
   # Format: TODO(#123): Description
   ```

2. **GitHub Issue Template**
   - Create "Technical Debt" issue template
   - Required fields: Priority, Category, File, Risk Assessment

3. **Code Review Checklist**
   - [ ] No TODO comments without GitHub issue reference
   - [ ] All TODOs follow format: `TODO(#issue-number): description`
   - [ ] Security TODOs escalated to security review

4. **Quarterly Debt Review**
   - Review this document
   - Update priorities based on product roadmap
   - Close resolved items
   - Re-prioritize based on business needs

---

## 📚 Related Documentation

- **ADR-009:** Mock Data Removal Strategy - Zero tolerance for fake data
- **ENTERPRISE_QUALITY_CHECKS.md:** Enterprise-grade quality standards
- **.cursorrules:** Code quality rules and patterns
- **scripts/maintenance/find-issues.sh:** Automated TODO detection script

---

## 📊 Progress Tracking

**Initial Baseline (2025-11-17):**
- Total Items: 47
- Critical: 10
- High: 11
- Medium: 11
- Low: 7

**Target (Q1 2026):**
- Total Items: <20
- Critical: 0
- High: <5
- All TODOs have GitHub issue references

---

## 🎯 Success Metrics

1. **Security:** All 10 critical security items resolved within 2 sprints
2. **Monetization:** Affiliate tracking implemented + 4+ affiliate programs activated
3. **Code Quality:** Zero TODOs without GitHub issue reference
4. **Velocity:** Resolve 10+ technical debt items per month
5. **Prevention:** Pre-commit hooks prevent new untracked TODOs

---

**Last Updated:** 2025-11-17
**Document Owner:** Engineering Team
**Review Frequency:** Monthly (1st week of each month)
**Next Review:** 2025-12-01
