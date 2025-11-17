# Authentication Audit - Day 7

**Date:** 2025-11-02  
**Purpose:** Verify all API routes have appropriate authentication checks  
**Related:** Pattern Audit #6

---

## Methodology

**Search Pattern:**
```bash
# Find routes WITHOUT auth checks
grep -L "requireAuth\|checkRateLimit\|auth()" src/app/api/*/route.ts
```

**Total API Routes:** 76  
**Routes Without Auth Checks:** 30+

---

## Classification

### ✅ Intentionally Public (Legitimate)

**Auth Routes:**
- `/api/auth/signup` - Public signup
- `/api/auth/[...nextauth]` - NextAuth handler
- `/api/auth/forgot-password` - Password reset (has rate limiting)

**Webhooks (Signature Verified):**
- `/api/webhooks/twilio` - Signature verification
- `/api/webhooks/sendgrid` - Signature verification
- `/api/webhooks/gamification` - Signature verification
- `/api/auth/mfa/webhook` - Signature verification
- `/api/email/webhook` - Signature verification

**Public Read-Only:**
- `/api/health` - Health check
- `/api/stats` - Public stats (has rate limiting)
- `/api/prompts` - Public prompt list (read-only)
- `/api/patterns` - Public pattern list (read-only)
- `/api/learning` - Public learning content
- `/api/learning/[slug]` - Individual learning content
- `/api/tags` - Public tags list

**Infrastructure:**
- `/api/trpc/[trpc]` - tRPC handler (has own auth)
- `/api/test-connection` - Development tool

---

### ⚠️ NEEDS AUTH (Critical)

**Admin Routes (CRITICAL):**
- ❌ `/api/admin/content/index` - Content index (admin only)
- ❌ `/api/admin/audit` - Audit logs (admin only)

**Manager Routes (HIGH):**
- ❌ `/api/manager/dashboard` - Manager dashboard
- ❌ `/api/manager/team/[teamId]` - Team management

**Background Jobs (MEDIUM):**
- ❌ `/api/jobs/monthly-analytics` - Should be internal
- ❌ `/api/jobs/cleanup` - Should be internal
- ❌ `/api/jobs/daily-usage-report` - Should be internal
- ❌ `/api/jobs/weekly-digest` - Should be internal
- ❌ `/api/jobs/check-usage-alerts` - Should be internal

**Message Processing (MEDIUM):**
- ❌ `/api/messaging/[queueName]/process` - Should be internal
- ❌ `/api/messaging/[queueName]/callback` - Should be internal
- ❌ `/api/messaging/gamification-events/process` - Should be internal

**User-Specific (MEDIUM):**
- ❌ `/api/multi-agent` - Needs auth if user-specific
- ❌ `/api/agents/artifacts` - Needs auth if user-specific
- ❌ `/api/github/callback` - OAuth callback (probably OK)

**Research/Dev (LOW):**
- ❌ `/api/research/gemini` - Research endpoint

---

## Action Plan

### Priority 1: Admin Routes (CRITICAL)

1. **`/api/admin/content/index`**
   - Add: `requireAuth(request)` + role check (`super_admin`)
   - Add: Rate limiting
   - Add: Audit logging

2. **`/api/admin/audit`**
   - Add: `requireAuth(request)` + role check (`super_admin`, `admin`)
   - Add: Rate limiting

### Priority 2: Manager Routes (HIGH)

3. **`/api/manager/dashboard`**
   - Add: `requireAuth(request)` + role check (`manager`, `director`)
   - Verify: User is manager of teams being accessed

4. **`/api/manager/team/[teamId]`**
   - Add: `requireAuth(request)` + role check (`manager`, `director`)
   - Verify: User is manager of this specific team

### Priority 3: Background Jobs (MEDIUM) ✅ COMPLETE

Strategy: Add internal API key check or cron secret

5-9. **`/api/jobs/*`** - ✅ ALL PROTECTED
   - ✅ `/api/jobs/monthly-analytics` - verifyCronRequest()
   - ✅ `/api/jobs/cleanup` - verifyCronRequest()
   - ✅ `/api/jobs/daily-usage-report` - verifyCronRequest()
   - ✅ `/api/jobs/weekly-digest` - verifyCronRequest()
   - ✅ `/api/jobs/check-usage-alerts` - verifyCronRequest()

### Priority 4: Message Processing (MEDIUM)

Strategy: Add internal API key or signature verification

10-12. **`/api/messaging/*`**
   - Add: Internal API key or QStash signature
   - Verify: Only QStash can call these

---

## Implementation

### Pattern: Admin Route Auth

```typescript
import { requireAuth } from '@/lib/auth/require-auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Auth check
  const { user, error } = await requireAuth(request);
  if (error) return error;
  
  // Role check
  if (!['super_admin', 'admin'].includes(user.role)) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // Rate limit
  const rateLimitResult = await checkRateLimit(
    request,
    'admin-api',
    10, // 10 requests
    60  // per minute
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }
  
  // ... rest of handler
}
```

### Pattern: Cron/Job Auth

```typescript
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... rest of handler
}
```

---

## Summary

**Routes Checked:** 76  
**Public/Legitimate:** ~46  
**Protected:** 15

**Critical:** 2 (admin routes) - ✅ DONE  
**High:** 2 (manager routes) - ✅ DONE  
**Medium:** 5 (background jobs) - ✅ DONE  
**Low:** 1 (research) - Deferred  
**Messaging:** 3 (QStash) - Deferred (already has signature verification)

**Time Spent:** ~2 hours  
**Routes Fixed:** 7

---

## Completed Steps

1. ✅ Document all routes (DONE)
2. ✅ Fix critical admin routes (DONE - already had RBAC)
3. ✅ Fix high priority manager routes (DONE)
4. ✅ Add cron verification to jobs (DONE - verifyCronRequest)
5. ✅ Update Pattern Audit doc (DONE)

---

## Implementation Summary

**Created:** `src/lib/auth/verify-cron.ts`
- `verifyCronRequest()` - Verifies CRON_SECRET, Vercel Cron header, or QStash signature
- `verifyInternalRequest()` - Verifies internal API key

**Protected Routes:**
- 5 job routes: monthly-analytics, cleanup, daily-usage-report, weekly-digest, check-usage-alerts
- 2 manager routes: dashboard, team/[teamId]

**Deferred:**
- Messaging routes: Already have QStash signature verification in place
- Research endpoint: Low priority, development use only

