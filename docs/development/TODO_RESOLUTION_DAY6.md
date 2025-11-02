<!--
AI Summary: Comprehensive resolution of 39 outstanding TODOs across auth, audit logging, tRPC, and feature implementations.
Prioritized by impact and user-facing criticality.
Part of Day 6 Content Hardening: Phase 6.
-->

# Phase 6: TODO Resolution - Day 6

**Status:** ⚠️ In Progress  
**Part of:** [Day 6 Content Hardening](../planning/DAY_6_CONTENT_HARDENING.md) → Phase 6

## Overview

Resolve 39 TODOs found in codebase, categorized by priority and impact.

## Categories

### 6.1 Auth MongoDB Adapter (High Priority)

**File:** `src/lib/auth/config.ts` line 29

**TODO:**

```typescript
// TODO: Uncomment when MongoDB adapter version matches NextAuth
// adapter: MongoDBAdapter(clientPromise),
```

**Action:**

- Check NextAuth.js version compatibility
- Uncomment MongoDB adapter
- Test login/signup flows
- Verify sessions persist in MongoDB

**Impact:** Critical for user persistence

---

### 6.2 Audit Logging to MongoDB (High Priority)

**File:** `src/lib/logging/audit.ts`

**TODOs:**

- Line 169: `logCriticalEvent()` - Implement MongoDB logging
- Line 253: `queryAuditLogs()` - Implement query with filters
- Line 262: `generateComplianceReport()` - Implement report generation

**Implementation:**

```typescript
async function logCriticalEvent(event: CriticalEvent) {
  const db = await getDb();
  await db.collection('audit_logs').insertOne({
    ...event,
    severity: 'critical',
    timestamp: new Date(),
  });
}
```

**Impact:** Compliance and security audit trail

---

### 6.3 tRPC Implementations (Medium Priority)

**Files:**

- `src/server/routers/user.ts` (4 TODOs)
- `src/server/routers/prompt.ts` (4 TODOs)

**TODOs:** 8 total - all follow same pattern

```typescript
// TODO: Implement MongoDB query
return {
  success: false,
  message: 'Not implemented yet',
};
```

**Replace with:**

```typescript
const db = await getDb();
const result = await db.collection('users').findOne({ _id: userId });
return { success: true, data: result };
```

**Impact:** tRPC API completeness

---

### 6.4 Affiliate Links (Low Priority - OpsHub Feature)

**File:** `src/data/affiliate-links.ts`

**TODOs:** 7 links need referral URLs

**Note:** Affiliate links should be managed in OpsHub admin panel:

- Create `/opshub/settings/affiliate-links` page
- Store in MongoDB `affiliate_config` collection
- Update links via admin UI, not code changes
- Move 7 TODOs to OpsHub feature request

**Action:** Defer to OpsHub admin feature

**Impact:** Low - non-critical monetization

---

### 6.5 Other TODOs (Various Priorities)

**Twilio MFA Code Storage** (2 TODOs)

- File: `src/lib/twilio/mfa.ts`
- Action: Implement secure storage in MongoDB with TTL
- Priority: Medium

**Prompt Rating API** (1 TODO)

- File: `src/app/api/prompts/[id]/rate/route.ts`
- Action: Connect to existing rating service
- Priority: Medium

**Favorite Save API** (1 TODO)

- File: `src/app/api/users/favorites/route.ts`
- Action: Implement upsert in MongoDB
- Priority: Medium

**Analytics Integration** (1 TODO)

- File: `src/lib/analytics/track.ts`
- Action: Connect to GA4 and PostHog
- Priority: Low

**Firewall Stats** (1 TODO)

- File: `src/lib/security/firewall.ts`
- Action: Aggregate rate limit stats
- Priority: Low

**Dead Letter Queue** (1 TODO)

- File: `src/lib/queue/dlq.ts`
- Action: Implement failed job retry logic
- Priority: Low

## Resolution Strategy

### High Priority (Do Now)

1. Auth MongoDB Adapter
2. Audit Logging Implementation
3. Prompt Rating API
4. Favorite Save API

### Medium Priority (This Phase)

5. tRPC User Router (4 TODOs)
6. tRPC Prompt Router (4 TODOs)
7. Twilio MFA Storage (2 TODOs)

### Low Priority (Defer or OpsHub)

8. Affiliate Links → OpsHub admin
9. Analytics Integration → Future sprint
10. Firewall Stats → Future sprint
11. Dead Letter Queue → Future sprint

## Related Documentation

- [Auth Migration Plan](./AUTH_MIGRATION_PLAN.md)
- [Day 6 Content Hardening Plan](../planning/DAY_6_CONTENT_HARDENING.md)
- [Enterprise Compliance](./ENTERPRISE_COMPLIANCE_GUARDRAILS.md)
- [tRPC Setup](./CONFIGURATION.md)
