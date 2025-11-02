# OpsHub Improvement Plan

**Date:** November 2, 2025  
**Status:** 🚧 In Progress  
**Priority:** High - Admin functionality critical for site management

---

## Current State

### ✅ What's Working

- **ContentManagementCMS** - Full CRUD for learning content (20 AI adoption questions)
- **Basic Stats** - User count, content count, audit log count
- **MFA Bypass** - super_admin emergency access
- **AffiliateLinkManagement** - Was implemented but currently disabled

### ❌ What's Broken (Disabled)

1. **ContentReviewQueue** → `/api/admin/content/review` (500 error)
2. **UserManagement** → Component exists but disabled for consistency
3. **AuditLogViewer** → `/api/admin/audit` (403 forbidden)
4. **SettingsPanel** → `/api/admin/settings` (500 error)
5. **ContentQualityPanel** → Had icon issue, now fixed but still disabled

---

## Critical Issues

### 1. Prompt Count: 132 (Should be ~67)

**Problem:** 30 AI-generated prompts (`generated-*` prefix) were added automatically

**Analysis:**

- Original seed: 17 prompts (!)
- Database has: 132 prompts
- 30 are AI-generated (likely low quality)
- 1 duplicate title found
- Only 76 have quality scores

**Action Needed:**

- Review & delete low-quality AI-generated prompts
- Run quality scoring on all prompts
- Remove duplicate
- Verify seed file is correct

### 2. Missing Admin Features

According to `ENTERPRISE_RBAC_AND_ADMIN_DASHBOARD.md`, we planned:

**User Management:**

- List/filter users (role/plan/org)
- Activate/suspend accounts
- Reset MFA
- View user activity

**Content Review:**

- Pending content queue
- Approve/reject workflow
- Quality scoring
- Tag/categorize content

**Audit Logs:**

- Search/filter audit events
- Export compliance reports
- User activity tracking
- Security event monitoring

**Settings:**

- System configuration
- Feature flags
- Rate limits
- Email templates

### 3. API Routes vs tRPC Confusion

**Currently Using REST:**

- `/api/admin/settings` (broken)
- `/api/admin/content/review` (broken)
- `/api/admin/audit` (broken)
- `/api/admin/content/manage` (working)
- `/api/admin/affiliate-links` (working)

**Currently Using tRPC:**

- `user.getProfile`, `user.updateProfile`, `user.getProgress`
- `prompt.getAll`, `prompt.getById`, `prompt.rate`, etc.

**Decision Needed:** Migrate all admin to tRPC or fix REST routes?

---

## Immediate Actions (This Session)

### Priority 1: Fix Broken API Routes

#### 1.1 Fix `/api/admin/audit`

**Issue:** 403 forbidden (RBAC issue)

**Tasks:**

- [ ] Check current RBAC implementation
- [ ] Add proper role checks (super_admin, admin)
- [ ] Test with admin user
- [ ] Re-enable AuditLogViewer component

#### 1.2 Fix `/api/admin/settings`

**Issue:** 500 error (implementation missing)

**Tasks:**

- [ ] Check if route file exists
- [ ] Implement basic settings GET/PUT
- [ ] Add RBAC and rate limiting
- [ ] Re-enable SettingsPanel component

#### 1.3 Fix `/api/admin/content/review`

**Issue:** 500 error (implementation missing)

**Tasks:**

- [ ] Check if route file exists
- [ ] Implement content review queue logic
- [ ] Add approve/reject endpoints
- [ ] Re-enable ContentReviewQueue component

### Priority 2: Prompt Database Cleanup

#### 2.1 Audit All Prompts

**Tasks:**

- [ ] Run quality scoring script on all 132 prompts
- [ ] Identify low-quality AI-generated ones
- [ ] Create deletion script for bulk removal
- [ ] Run deletion (with backup!)

#### 2.2 Fix Seed File

**Tasks:**

- [ ] Verify `seed-prompts.ts` has all intended prompts
- [ ] Currently only has 17 prompts (seems wrong!)
- [ ] Check if there's a master prompts file elsewhere
- [ ] Document correct seeding process

### Priority 3: Essential Admin Tools

#### 3.1 Database Management Scripts

**Created:**

- [x] Unified `db-stats.ts` for collection counts

**Needed:**

- [ ] Bulk delete prompts script
- [ ] Quality scoring batch script
- [ ] Duplicate detection and merge script
- [ ] Data migration scripts

#### 3.2 Quick Admin Actions

**Add to OpsHub UI:**

- [ ] "Re-seed prompts" button (with confirmation)
- [ ] "Run quality check" button
- [ ] "Delete AI-generated prompts" button
- [ ] "View database stats" page

---

## Short-term Plan (Next 2-3 Sessions)

### Phase 1: API Routes (2 hours)

1. Fix `/api/admin/audit` - RBAC issue
2. Implement `/api/admin/settings` - Basic GET/PUT
3. Implement `/api/admin/content/review` - Queue logic
4. Test all routes with Postman/tests
5. Re-enable all admin components

### Phase 2: Data Cleanup (1 hour)

1. Create prompt quality scoring script
2. Review all 132 prompts
3. Delete low-quality AI-generated ones
4. Remove duplicate
5. Verify seed file integrity

### Phase 3: Essential Features (2 hours)

1. User management (list, filter, suspend)
2. Prompt management (bulk actions)
3. System settings (feature flags, limits)
4. Quick stats dashboard

---

## Long-term Vision

### Admin Panel Features

**User & Access:**

- SSO management
- API key management
- Role assignments
- Usage limits

**Content:**

- Bulk import/export
- Content scheduling
- Versioning/history
- Approval workflows

**Analytics:**

- Usage metrics
- Cost tracking
- Performance monitoring
- User engagement

**System:**

- Email templates
- Feature flags
- Rate limits
- Cache management

### Architecture Decision

**Recommendation:** Migrate all admin APIs to tRPC

**Why:**

- Type-safe
- Better DX
- Already using for user/prompt
- Consistent approach
- Better testing

**How:**

1. Create `adminRouter` in `src/server/routers/admin.ts`
2. Add procedures for audit, settings, review, users
3. Replace REST calls in components
4. Delete old API routes
5. Update tests

---

## Success Criteria

### Immediate (Today)

- [ ] At least 2 admin panels re-enabled and working
- [ ] Prompt count reduced to ~70-80 high-quality ones
- [ ] No console errors in OpsHub

### Short-term (This Week)

- [ ] All 5 admin panels working
- [ ] Full CRUD for users, prompts, content
- [ ] Quality scores on all content
- [ ] Comprehensive admin documentation

### Long-term (This Month)

- [ ] All admin APIs migrated to tRPC
- [ ] Bulk operations supported
- [ ] Analytics dashboard
- [ ] Feature flag management

---

## Files to Update

### API Routes

- `src/app/api/admin/audit/route.ts` - Fix RBAC
- `src/app/api/admin/settings/route.ts` - Implement
- `src/app/api/admin/content/review/route.ts` - Implement

### Components

- `src/components/admin/AuditLogViewer.tsx` - Test and re-enable
- `src/components/admin/SettingsPanel.tsx` - Test and re-enable
- `src/components/admin/ContentReviewQueue.tsx` - Test and re-enable
- `src/components/admin/UserManagement.tsx` - Test and re-enable

### Scripts

- `scripts/admin/score-prompts.ts` - Create
- `scripts/admin/delete-generated-prompts.ts` - Create
- `scripts/admin/verify-seed-integrity.ts` - Create

### Docs

- This file (update as we progress)
- ADR-009 for tRPC migration decision (if we go that route)

---

## Notes

- Keep DRY principle - no more one-off scripts
- Follow enterprise standards (RBAC, rate limiting, audit logging)
- Test before re-enabling components
- Document all decisions
- Atomic commits

---

## Related Documents

- [ADR-008: OpsHub CMS Simplification](../development/ADR/ADR-008-opshub-cms-simplification.md)
- [Day 6 Content Hardening Plan](./DAY_6_CONTENT_HARDENING.md)
- [Enterprise RBAC Plan](./ENTERPRISE_RBAC_AND_ADMIN_DASHBOARD.md)
- [Day 4 RBAC Implementation](./DAY_4_COMPLETE.md)
