# RBAC Security Migration Guide

**Version:** 1.0
**Date:** 2025-11-17
**Priority:** CRITICAL - Must be completed before production deployment

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Critical Fixes (Week 1)](#phase-1-critical-fixes-week-1)
4. [Phase 2: High-Priority Improvements (Week 2-3)](#phase-2-high-priority-improvements-week-2-3)
5. [Phase 3: Medium-Priority Enhancements (Month 1)](#phase-3-medium-priority-enhancements-month-1)
6. [Testing & Validation](#testing--validation)
7. [Rollback Plan](#rollback-plan)

---

## Overview

This guide provides step-by-step instructions for migrating the Engify.ai application from inconsistent manual RBAC checks to enterprise-grade, centralized RBAC middleware.

### Migration Goals

- ✅ Standardize RBAC across all admin routes
- ✅ Enforce MFA for privileged operations
- ✅ Fix role definition mismatches
- ✅ Implement comprehensive security controls
- ✅ Achieve SOC 2 compliance readiness

### Estimated Timeline

- **Phase 1 (Critical):** 2 days (14-15 hours)
- **Phase 2 (High):** 3-4 days (28 hours)
- **Phase 3 (Medium):** 5 days (37 hours)

**Total:** ~10 working days

---

## Prerequisites

### 1. Backup Database

```bash
# Backup MongoDB before making any changes
mongodump --uri="$MONGODB_URI" --out=./backup-$(date +%Y%m%d)

# Verify backup
ls -lh backup-$(date +%Y%m%d)
```

### 2. Create Feature Branch

```bash
# Create feature branch for RBAC migration
git checkout -b security/rbac-migration-phase1
git push -u origin security/rbac-migration-phase1
```

### 3. Install Dependencies (if needed)

```bash
npm install --save zod
npm install --save-dev @types/node
```

### 4. Set Required Environment Variables

Add to `.env.local` or `.env.production`:

```bash
# RBAC Configuration
ADMIN_MFA_REQUIRED=true
ADMIN_SESSION_MAX_AGE_MINUTES=60

# Audit Logging
AUDIT_LOG_SIGNING_KEY=<generate-secure-key>

# Break-Glass (Emergency Access)
BREAK_GLASS_ENABLED=true

# CSRF Protection
CSRF_SECRET=<generate-secure-key>

# Rate Limiting
REDIS_URL=<your-redis-url>
REDIS_TOKEN=<your-redis-token>
```

Generate secure keys:
```bash
# Generate random secure keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Phase 1: Critical Fixes (Week 1)

### Task 1.1: Fix Role Definition Mismatch

**Priority:** CRITICAL
**Estimated Time:** 2-3 hours
**Files Changed:** ~20 files

#### Step 1: Create Migration Script

Create file: `/scripts/migrate-admin-roles.ts`

```typescript
/**
 * Role Migration Script
 *
 * Migrates legacy 'admin' and 'ADMIN' roles to 'super_admin'
 * Run ONCE before deploying new RBAC system
 */

import { getDb } from '@/lib/mongodb';
import { auditLog } from '@/lib/logging/audit';

async function migrateAdminRoles() {
  console.log('🔄 Starting admin role migration...\n');

  const db = await getDb();
  const usersCollection = db.collection('users');

  // Find all users with legacy admin roles
  const adminUsers = await usersCollection
    .find({
      role: { $in: ['admin', 'ADMIN'] },
    })
    .toArray();

  if (adminUsers.length === 0) {
    console.log('✅ No users with legacy admin roles found');
    return;
  }

  console.log(`📊 Found ${adminUsers.length} users with legacy admin roles\n`);

  // Migrate each user
  for (const user of adminUsers) {
    const oldRole = user.role;
    const newRole = 'super_admin';

    console.log(`  Migrating: ${user.email}`);
    console.log(`    ${oldRole} → ${newRole}`);

    // Update in database
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          role: newRole,
          updatedAt: new Date(),
        },
      }
    );

    // Audit log
    await auditLog({
      action: 'admin_action',
      userId: 'SYSTEM_MIGRATION',
      resource: `user:${user._id}`,
      severity: 'info',
      details: {
        operation: 'ROLE_MIGRATION',
        oldRole,
        newRole,
        userEmail: user.email,
        migrationDate: new Date().toISOString(),
      },
    });

    console.log(`    ✅ Migrated successfully\n`);
  }

  console.log(`\n✅ Migration complete: ${adminUsers.length} users migrated`);
  console.log('📝 Audit logs created for all migrations');
}

// Run migration
migrateAdminRoles()
  .then(() => {
    console.log('\n🎉 Migration successful!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
```

#### Step 2: Run Migration

```bash
# Test in development first
NODE_ENV=development npx tsx scripts/migrate-admin-roles.ts

# Verify migration
# Connect to MongoDB and check users collection:
# db.users.find({ role: { $in: ['admin', 'ADMIN'] } })
# Should return 0 results

# Run in production
NODE_ENV=production npx tsx scripts/migrate-admin-roles.ts
```

#### Step 3: Update Type Definitions

No changes needed - `UserRole` type in `/src/lib/auth/rbac.ts` already excludes `'admin'`.

---

### Task 1.2: Migrate Admin Routes to Enhanced RBAC

**Priority:** CRITICAL
**Estimated Time:** 6 hours
**Files Changed:** ~20 files

#### Migration Pattern

**BEFORE:**
```typescript
// ❌ OLD: Manual role checking
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';

  if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Handler code...
}
```

**AFTER:**
```typescript
// ✅ NEW: Enhanced RBAC middleware
import { NextRequest, NextResponse } from 'next/server';
import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Check RBAC permissions
  const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
  if (rbac) return rbac;

  const session = await auth(); // Only for getting user details

  // Handler code...
}
```

#### Files to Migrate (20 routes)

1. `/src/app/api/admin/users/route.ts`
2. `/src/app/api/admin/prompts/route.ts`
3. `/src/app/api/admin/patterns/route.ts`
4. `/src/app/api/admin/system-settings/route.ts`
5. `/src/app/api/admin/content/manage/route.ts`
6. `/src/app/api/admin/stats/route.ts`
7. `/src/app/api/admin/dlq/route.ts`
8. `/src/app/api/admin/ai-tools/route.ts`
9. `/src/app/api/admin/affiliate-links/route.ts`
10. `/src/app/api/admin/content/generate/route.ts`
11. `/src/app/api/admin/content/index/route.ts`
12. `/src/app/api/admin/content/quality/route.ts`
13. `/src/app/api/admin/content/review/route.ts`
14. `/src/app/api/admin/ai-models/migrate/route.ts`
15. `/src/app/api/admin/ai-models/sync/route.ts`
16. `/src/app/api/admin/ai-models/sync/replicate/route.ts`
17. `/src/app/api/admin/prompts/[id]/route.ts`
18. `/src/app/api/admin/prompts/[id]/image/route.ts`
19. (All other admin routes)

#### Detailed Example: Migrating `/src/app/api/admin/users/route.ts`

**Step 1:** Import enhanced RBAC

```typescript
// Add this import
import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';
```

**Step 2:** Update GET handler

```typescript
// BEFORE
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can manage users
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Handler code...
  }
}

// AFTER
export async function GET(request: NextRequest) {
  try {
    // ✅ NEW: Check RBAC permissions
    const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
    if (rbac) return rbac;

    const session = await auth();

    // Handler code...
  }
}
```

**Step 3:** Update POST handler

```typescript
// BEFORE
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only admins can create users
    if (!['admin', 'super_admin', 'org_admin'].includes(role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Rate limiting...
    // Handler code...
  }
}

// AFTER
export async function POST(request: NextRequest) {
  try {
    // ✅ NEW: Check RBAC permissions (with MFA)
    const rbac = await EnhancedRBACPresets.requireUserWrite()(request);
    if (rbac) return rbac;

    const session = await auth();

    // Rate limiting...
    // Handler code...
  }
}
```

**Step 4:** Update DELETE handler (more restrictive)

```typescript
// BEFORE
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role || 'user';

    // RBAC: Only super admins can delete users
    if (role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized - super_admin only' },
        { status: 403 }
      );
    }

    // Handler code...
  }
}

// AFTER
export async function DELETE(request: NextRequest) {
  try {
    // ✅ NEW: Require super_admin with MFA for destructive operations
    const rbac = await EnhancedRBACPresets.requireSuperAdminDestructive()(request);
    if (rbac) return rbac;

    const session = await auth();

    // Handler code...
  }
}
```

#### Quick Migration Script

Create `/scripts/migrate-rbac-imports.sh`:

```bash
#!/bin/bash

# Quick script to add RBAC import to all admin routes
# Review changes carefully before committing!

FILES=$(find src/app/api/admin -name "route.ts")

for file in $FILES; do
  echo "Processing: $file"

  # Check if already has enhanced RBAC import
  if grep -q "rbac-enhanced" "$file"; then
    echo "  ✅ Already migrated"
    continue
  fi

  # Add import after existing auth import
  sed -i "/import { auth } from '@\/lib\/auth';/a import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';" "$file"

  echo "  ✅ Import added"
done

echo "\n🎉 Migration complete! Please review changes and update handlers manually."
```

```bash
chmod +x scripts/migrate-rbac-imports.sh
./scripts/migrate-rbac-imports.sh
```

---

### Task 1.3: Fix DLQ Route

**Priority:** CRITICAL
**Estimated Time:** 15 minutes
**Files Changed:** 1 file

Update `/src/app/api/admin/dlq/route.ts`:

```typescript
// BEFORE
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ❌ BAD: Case-sensitive, doesn't check super_admin
    if (session.user.role !== 'admin' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Handler...
  }
}

// AFTER
import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';

export async function GET(request: NextRequest) {
  try {
    // ✅ GOOD: Consistent, requires MFA
    const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
    if (rbac) return rbac;

    const session = await auth();

    // Handler...
  }
}
```

Apply same fix to POST handler in the same file.

---

### Task 1.4: Remove Super Admin MFA Bypass

**Priority:** CRITICAL
**Estimated Time:** 1 hour
**Files Changed:** 1 file + docs

#### Step 1: Update OpsHub Page

Update `/src/app/opshub/page.tsx`:

```typescript
// BEFORE
export default async function OpsHubPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';
  const isAdmin = role === 'admin' || role === 'super_admin' || role === 'org_admin';

  if (!isAdmin) {
    redirect('/');
  }

  const mfaVerified = Boolean(
    (session?.user as { mfaVerified?: boolean } | null)?.mfaVerified
  );

  // ❌ BAD: Super admin bypass for emergency access
  if (isAdminMFAEnforced && role !== 'super_admin' && !mfaVerified) {
    redirect('/login?error=MFA_REQUIRED');
  }

  // ...
}

// AFTER
export default async function OpsHubPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';
  const isAdmin = role === 'super_admin' || role === 'org_admin'; // ✅ Removed 'admin'

  if (!isAdmin) {
    redirect('/');
  }

  const mfaVerified = Boolean(
    (session?.user as { mfaVerified?: boolean } | null)?.mfaVerified
  );

  // ✅ GOOD: Enforce MFA for ALL admins (no bypass)
  if (isAdminMFAEnforced && !mfaVerified) {
    redirect('/login?error=MFA_REQUIRED');
  }

  // ...
}
```

#### Step 2: Implement Break-Glass Procedure

Create `/src/app/api/admin/break-glass/request/route.ts`:

```typescript
/**
 * Break-Glass Request API
 *
 * Allows super_admin to request emergency access bypass
 * Requires approval from second super_admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { auditLog } from '@/lib/logging/audit';
import { z } from 'zod';
import crypto from 'crypto';

const BreakGlassRequestSchema = z.object({
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  approverEmail: z.string().email(),
  duration: z.number().min(300000).max(3600000), // 5 min to 1 hour
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super_admins can request break-glass access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = BreakGlassRequestSchema.parse(body);

    const db = await getDb();
    const expiresAt = new Date(Date.now() + validated.duration);
    const token = crypto.randomUUID();

    // Create break-glass session (pending approval)
    await db.collection('break_glass_sessions').insertOne({
      userId: session.user.id,
      token,
      reason: validated.reason,
      approver: validated.approverEmail,
      createdAt: new Date(),
      expiresAt,
      used: false,
      approved: false,
    });

    // Critical audit log
    await auditLog({
      action: 'security_alert',
      userId: session.user.id as string,
      resource: 'break_glass',
      severity: 'critical',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        operation: 'BREAK_GLASS_REQUESTED',
        reason: validated.reason,
        approver: validated.approverEmail,
        expiresAt: expiresAt.toISOString(),
      },
    });

    // TODO: Send email/SMS to approver
    // await sendBreakGlassApprovalRequest({ ... });

    return NextResponse.json({
      success: true,
      message: 'Break-glass request sent to approver',
      tokenPreview: token.substring(0, 8),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    // Error handling...
  }
}
```

Create approval endpoint: `/src/app/api/admin/break-glass/approve/route.ts`

(Implementation similar to request endpoint)

#### Step 3: Update Documentation

Add to `/docs/BREAK_GLASS_PROCEDURE.md`:

```markdown
# Break-Glass Emergency Access Procedure

## When to Use

Use break-glass access ONLY in true emergencies:
- System outage preventing normal MFA
- Critical security incident requiring immediate access
- Production data loss requiring urgent restoration

## Procedure

1. **Request Access:**
   ```bash
   POST /api/admin/break-glass/request
   {
     "reason": "Production database offline, restoring from backup",
     "approverEmail": "second-admin@engify.ai",
     "duration": 1800000  // 30 minutes in ms
   }
   ```

2. **Approver Receives Alert:**
   - Email/SMS notification
   - Reviews reason
   - Approves or denies

3. **Use Break-Glass Token:**
   ```bash
   GET /api/admin/users
   Headers:
     Authorization: Bearer <session-token>
     X-Break-Glass-Token: <break-glass-token>
   ```

4. **Post-Incident:**
   - All break-glass usage is logged
   - Review audit logs within 24 hours
   - Document incident in security log

## Limitations

- Maximum duration: 1 hour
- Requires second super_admin approval
- NOT allowed for destructive operations (DELETE)
- All actions logged with CRITICAL severity
- Auto-expires after use or timeout
```

---

### Task 1.5: Testing Phase 1

**Estimated Time:** 2 hours

#### Test Cases

Create `/src/__tests__/integration/rbac-phase1.test.ts`:

```typescript
import { testClient } from '@/lib/test-utils';
import { getDb } from '@/lib/mongodb';

describe('RBAC Phase 1 - Critical Fixes', () => {
  describe('Role Migration', () => {
    it('should have no users with legacy admin role', async () => {
      const db = await getDb();
      const legacyAdmins = await db
        .collection('users')
        .find({ role: { $in: ['admin', 'ADMIN'] } })
        .toArray();

      expect(legacyAdmins).toHaveLength(0);
    });

    it('should have migrated admins to super_admin', async () => {
      const db = await getDb();
      const superAdmins = await db
        .collection('users')
        .find({ role: 'super_admin' })
        .toArray();

      expect(superAdmins.length).toBeGreaterThan(0);
    });
  });

  describe('Enhanced RBAC Middleware', () => {
    it('should enforce MFA for admin routes', async () => {
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: false,
      });

      const response = await testClient
        .get('/api/admin/users')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('MFA');
    });

    it('should allow super_admin with MFA', async () => {
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: true,
      });

      const response = await testClient
        .get('/api/admin/users')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(200);
    });

    it('should reject expired sessions', async () => {
      const expiredTime = Date.now() - 2 * 60 * 60 * 1000; // 2 hours ago
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: true,
        iat: Math.floor(expiredTime / 1000),
      });

      const response = await testClient
        .get('/api/admin/users')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('expired');
    });
  });

  describe('DLQ Route Fix', () => {
    it('should require super_admin for DLQ access', async () => {
      const session = await loginAs({
        role: 'org_admin',
        mfaVerified: true,
      });

      const response = await testClient
        .get('/api/admin/dlq')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(403);
    });

    it('should allow super_admin with MFA', async () => {
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: true,
      });

      const response = await testClient
        .get('/api/admin/dlq')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(200);
    });
  });

  describe('Super Admin MFA Bypass Removed', () => {
    it('should enforce MFA for super_admin on opshub page', async () => {
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: false,
      });

      const response = await testClient
        .get('/opshub')
        .set('Cookie', session.cookie);

      expect(response.status).toBe(302); // Redirect
      expect(response.headers.location).toContain('MFA_REQUIRED');
    });
  });

  describe('Audit Logging', () => {
    it('should log unauthorized access attempts', async () => {
      const session = await loginAs({ role: 'user' });

      await testClient
        .get('/api/admin/users')
        .set('Cookie', session.cookie);

      const auditLogs = await getAuditLogs({
        action: 'unauthorized_access',
      });

      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].details.reason).toBe('INSUFFICIENT_ROLE');
    });

    it('should log MFA enforcement failures', async () => {
      const session = await loginAs({
        role: 'super_admin',
        mfaVerified: false,
      });

      await testClient
        .get('/api/admin/users')
        .set('Cookie', session.cookie);

      const auditLogs = await getAuditLogs({
        action: 'unauthorized_access',
      });

      const mfaLog = auditLogs.find(
        (log) => log.details.reason === 'MFA_NOT_VERIFIED'
      );
      expect(mfaLog).toBeDefined();
    });
  });
});
```

Run tests:
```bash
npm test -- rbac-phase1.test.ts
```

---

## Phase 2: High-Priority Improvements (Week 2-3)

(Detailed implementation steps for HIGH-01 through HIGH-08 from audit report)

### Task 2.1: Fix Information Disclosure

Update `/src/lib/middleware/rbac-enhanced.ts` to use generic error messages (already implemented in enhanced version).

### Task 2.2: Implement IP-Based Rate Limiting

(See implementation in audit report)

### Task 2.3: Implement CSRF Protection

(See implementation in audit report)

### Task 2.4: Implement Audit Log Signing

(See implementation in audit report)

---

## Phase 3: Medium-Priority Enhancements (Month 1)

(Detailed implementation steps for MEDIUM-01 through MEDIUM-12 from audit report)

---

## Testing & Validation

### Pre-Deployment Checklist

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Database backup created
- [ ] Rollback plan documented
- [ ] Audit logs reviewed
- [ ] Performance benchmarks within acceptable range
- [ ] Security scan completed
- [ ] Code review approved

### Performance Benchmarks

Test RBAC middleware performance:

```typescript
// /scripts/benchmark-rbac.ts

import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';
import { performance } from 'perf_hooks';

async function benchmarkRBAC() {
  const iterations = 1000;
  const start = performance.now();

  for (let i = 0; i < iterations; i++) {
    await EnhancedRBACPresets.requireSuperAdmin()(mockRequest);
  }

  const end = performance.now();
  const avgLatency = (end - start) / iterations;

  console.log(`Average RBAC check latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`Target: <10ms`);
  console.log(avgLatency < 10 ? '✅ PASS' : '❌ FAIL');
}

benchmarkRBAC();
```

Expected result: **< 10ms per RBAC check**

---

## Rollback Plan

### If Migration Fails

1. **Revert Code:**
   ```bash
   git revert <commit-hash>
   git push origin main --force-with-lease
   ```

2. **Restore Database:**
   ```bash
   mongorestore --uri="$MONGODB_URI" --drop ./backup-<date>
   ```

3. **Verify:**
   - Check application is accessible
   - Verify admin routes work
   - Review error logs

### Emergency Contacts

- **Engineering Lead:** [Name/Email]
- **DevOps:** [Name/Email]
- **Security:** [Name/Email]

---

## Success Metrics

Track these metrics after deployment:

- **Authorization Check Latency:** < 10ms (p95)
- **Failed Authorization Attempts:** < 1% of total requests
- **MFA Enforcement Rate:** 100% for privileged operations
- **Audit Log Coverage:** 100% of admin operations
- **Session Timeout Enforcements:** As configured

---

## Support & Questions

For questions about this migration:
- **Email:** security@engify.ai
- **Slack:** #security-rbac-migration
- **Documentation:** See `/docs/RBAC_SYSTEM.md`

---

**End of Migration Guide**
