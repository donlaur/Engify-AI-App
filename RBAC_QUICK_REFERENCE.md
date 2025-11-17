# RBAC System - Quick Reference Guide

**Last Updated:** 2025-11-17
**Version:** 2.0 (Enhanced)

---

## Quick Links

- 📋 **Full Audit Report:** [`RBAC_SECURITY_AUDIT.md`](./RBAC_SECURITY_AUDIT.md)
- 🔧 **Migration Guide:** [`RBAC_MIGRATION_GUIDE.md`](./RBAC_MIGRATION_GUIDE.md)
- 📚 **Implementation:** `/src/lib/middleware/rbac-enhanced.ts`

---

## Role Hierarchy (Quick View)

```
super_admin (100)     - System owner, full access
  ├── org_admin (80)       - Organization administrator
  │   └── org_manager (60)     - Team manager
  │       └── org_member (40)      - Organization member
  ├── enterprise (35)      - Enterprise customer
  ├── pro (30)            - Pro subscriber
  ├── user (20)           - Basic user
  └── free (10)           - Free tier
```

---

## Quick Usage Examples

### Example 1: Super Admin Only

```typescript
import { EnhancedRBACPresets } from '@/lib/middleware/rbac-enhanced';

export async function DELETE(request: NextRequest) {
  // Requires: super_admin role + MFA + fresh session
  const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
  if (rbac) return rbac;

  // Your handler code...
}
```

### Example 2: Organization Admin

```typescript
export async function PUT(request: NextRequest) {
  // Requires: org_admin OR super_admin + MFA
  const rbac = await EnhancedRBACPresets.requireOrgAdmin()(request);
  if (rbac) return rbac;

  // Your handler code...
}
```

### Example 3: Permission-Based

```typescript
export async function POST(request: NextRequest) {
  // Requires: users:write permission + MFA
  const rbac = await EnhancedRBACPresets.requireUserWrite()(request);
  if (rbac) return rbac;

  // Your handler code...
}
```

### Example 4: Resource Ownership Check

```typescript
import { composeRBAC, withResourceAuthorization } from '@/lib/middleware/rbac-enhanced';

export async function PUT(request: NextRequest) {
  // Combine RBAC + Resource ownership check
  const rbac = await composeRBAC([
    EnhancedRBACPresets.requireOrgAdmin(),
    withResourceAuthorization({
      collection: 'prompts',
      idParam: 'id',
      ownershipField: 'organizationId',
    }),
  ])(request);
  if (rbac) return rbac;

  // Your handler code...
}
```

### Example 5: Destructive Operations

```typescript
export async function DELETE(request: NextRequest) {
  // Requires: super_admin + MFA + NO break-glass
  const rbac = await EnhancedRBACPresets.requireSuperAdminDestructive()(request);
  if (rbac) return rbac;

  // Your handler code...
}
```

---

## Available RBAC Presets

### Super Admin

| Preset | Role(s) | MFA | Fresh Session | Use Case |
|--------|---------|-----|---------------|----------|
| `requireSuperAdmin()` | super_admin | ✅ | ✅ | System administration |
| `requireSuperAdminDestructive()` | super_admin | ✅ | ✅ | Deletion, data purging |

### Organization Admin

| Preset | Role(s) | MFA | Use Case |
|--------|---------|-----|----------|
| `requireOrgAdmin()` | org_admin, super_admin | ✅ | Org management |
| `requireOrgManager()` | org_manager, org_admin, super_admin | ✅ | Team management |

### User Management

| Preset | Permission | MFA | Use Case |
|--------|-----------|-----|----------|
| `requireUserRead()` | users:read | ❌ | View user lists |
| `requireUserWrite()` | users:write | ✅ | Create/update users |
| `requireUserManagement()` | users:manage_roles | ✅ | Assign roles |

### Content Management

| Preset | Permission | MFA | Use Case |
|--------|-----------|-----|----------|
| `requirePromptWrite()` | prompts:write | ❌ | Create/edit prompts |
| `requirePromptDelete()` | prompts:delete | ✅ | Delete prompts |
| `requirePromptFeatured()` | prompts:featured | ✅ | Mark as featured |

### Analytics & Billing

| Preset | Permission | MFA | Use Case |
|--------|-----------|-----|----------|
| `requireAnalyticsAccess()` | analytics:read | ❌ | View analytics |
| `requireAnalyticsExport()` | analytics:export | ❌ | Export data |
| `requireBillingAccess()` | billing:read | ❌ | View billing |
| `requireBillingManage()` | billing:manage | ✅ | Manage billing |

### Workbench & AI

| Preset | Permission | MFA | Use Case |
|--------|-----------|-----|----------|
| `requireWorkbenchAccess()` | workbench:basic | ❌ | Basic workbench |
| `requireAdvancedWorkbench()` | workbench:advanced | ❌ | Advanced features |
| `requireAIExecution()` | workbench:ai_execution | ❌ | Execute AI prompts |

### System Administration

| Preset | Permission | MFA | Fresh Session | Use Case |
|--------|-----------|-----|---------------|----------|
| `requireSystemAdmin()` | system:admin | ✅ | ✅ | System admin tasks |
| `requireSystemLogs()` | system:logs | ✅ | ❌ | View logs |

---

## Permission Matrix (Quick Reference)

### Who Can Do What?

| Operation | super_admin | org_admin | org_manager | user | free |
|-----------|------------|-----------|-------------|------|------|
| **System Admin** |
| View audit logs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage system settings | ✅ | ❌ | ❌ | ❌ | ❌ |
| Access DLQ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User Management** |
| View users | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create users | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Content** |
| View prompts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create prompts | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete prompts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Mark as featured | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Workbench** |
| Basic access | ✅ | ✅ | ✅ | ✅ | ✅ |
| Advanced features | ✅ | ✅ | ✅ | ❌ | ❌ |
| Execute AI | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Common Patterns

### Pattern 1: Simple Role Check

```typescript
// When you need a simple role check
const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
if (rbac) return rbac;
```

### Pattern 2: Permission-Based Check

```typescript
// When you need permission-based access
const rbac = await EnhancedRBACPresets.requireUserWrite()(request);
if (rbac) return rbac;
```

### Pattern 3: Multiple Checks (Composed)

```typescript
// When you need both RBAC and resource ownership
const rbac = await composeRBAC([
  EnhancedRBACPresets.requireOrgAdmin(),
  withResourceAuthorization({
    collection: 'prompts',
    idParam: 'id',
    ownershipField: 'organizationId',
  }),
])(request);
if (rbac) return rbac;
```

### Pattern 4: Custom RBAC Options

```typescript
// When you need custom configuration
import { withEnhancedRBAC } from '@/lib/middleware/rbac-enhanced';

const rbac = await withEnhancedRBAC({
  roles: ['org_admin', 'super_admin'],
  requireMFA: true,
  requireSessionFresh: true,
  requireAny: true, // User needs ANY of the roles (not all)
})(request);
if (rbac) return rbac;
```

---

## Security Checklist for New Routes

When creating a new admin API route:

- [ ] Import `EnhancedRBACPresets` from `@/lib/middleware/rbac-enhanced`
- [ ] Add RBAC check at start of each handler (GET, POST, PUT, DELETE)
- [ ] Use most restrictive preset that makes sense:
  - Read operations: `requireSuperAdmin()` or `requireOrgAdmin()`
  - Write operations: Preset with `requireMFA: true`
  - Delete operations: `requireSuperAdminDestructive()`
- [ ] Add resource ownership check if multi-tenant
- [ ] Verify rate limiting is in place
- [ ] Add comprehensive audit logging
- [ ] Add unit tests for RBAC enforcement
- [ ] Document in API docs

---

## Common Mistakes to Avoid

### ❌ DON'T: Manual Role Checking

```typescript
// ❌ BAD
if (!['admin', 'super_admin'].includes(role)) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}
```

### ✅ DO: Use RBAC Presets

```typescript
// ✅ GOOD
const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
if (rbac) return rbac;
```

---

### ❌ DON'T: Skip MFA for Privileged Operations

```typescript
// ❌ BAD - No MFA enforcement
const rbac = await withEnhancedRBAC({ roles: ['super_admin'] })(request);
```

### ✅ DO: Enforce MFA

```typescript
// ✅ GOOD - Enforces MFA
const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
```

---

### ❌ DON'T: Leak Information in Errors

```typescript
// ❌ BAD - Reveals role requirements
return NextResponse.json(
  { error: 'Forbidden', required: ['super_admin'], current: 'user' },
  { status: 403 }
);
```

### ✅ DO: Use Generic Errors

```typescript
// ✅ GOOD - Generic message (enhanced RBAC does this automatically)
return NextResponse.json(
  { error: 'Insufficient permissions' },
  { status: 403 }
);
```

---

### ❌ DON'T: Skip Resource Ownership Checks

```typescript
// ❌ BAD - org_admin can modify ANY organization
const rbac = await EnhancedRBACPresets.requireOrgAdmin()(request);
if (rbac) return rbac;

// Directly update resource without checking ownership
await db.collection('organizations').updateOne({ _id }, { ... });
```

### ✅ DO: Verify Resource Ownership

```typescript
// ✅ GOOD - Verify organization ownership
const rbac = await composeRBAC([
  EnhancedRBACPresets.requireOrgAdmin(),
  withResourceAuthorization({
    collection: 'organizations',
    idParam: 'id',
    ownershipField: 'organizationId',
  }),
])(request);
if (rbac) return rbac;
```

---

## Debugging RBAC Issues

### Check User Session

```typescript
const session = await auth();
console.log({
  userId: session?.user?.id,
  role: session?.user?.role,
  mfaVerified: session?.user?.mfaVerified,
  iat: session?.user?.iat,
});
```

### Check Audit Logs

```bash
# View recent unauthorized access attempts
db.audit_logs.find({
  action: 'unauthorized_access',
  timestamp: { $gte: new Date(Date.now() - 3600000) }
}).sort({ timestamp: -1 }).limit(10)
```

### Check MFA Status

```bash
# Check if user has MFA enabled
db.users.findOne({ email: 'user@example.com' }, { mfaVerified: 1, mfaEnabled: 1 })
```

### Performance Debugging

```typescript
// Add timing to RBAC check
const start = Date.now();
const rbac = await EnhancedRBACPresets.requireSuperAdmin()(request);
console.log(`RBAC check took ${Date.now() - start}ms`);
if (rbac) return rbac;
```

---

## Testing Your RBAC Implementation

### Unit Test Example

```typescript
describe('Admin Users Route - RBAC', () => {
  it('should require super_admin role', async () => {
    const session = await loginAs({ role: 'user', mfaVerified: true });
    const response = await testClient
      .get('/api/admin/users')
      .set('Cookie', session.cookie);

    expect(response.status).toBe(403);
  });

  it('should require MFA', async () => {
    const session = await loginAs({ role: 'super_admin', mfaVerified: false });
    const response = await testClient
      .get('/api/admin/users')
      .set('Cookie', session.cookie);

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('MFA');
  });

  it('should allow super_admin with MFA', async () => {
    const session = await loginAs({ role: 'super_admin', mfaVerified: true });
    const response = await testClient
      .get('/api/admin/users')
      .set('Cookie', session.cookie);

    expect(response.status).toBe(200);
  });
});
```

---

## Migration Checklist

For migrating existing routes to enhanced RBAC:

1. [ ] Import `EnhancedRBACPresets`
2. [ ] Remove manual role checking code
3. [ ] Add RBAC preset at start of handler
4. [ ] Keep `await auth()` if you need user details
5. [ ] Add resource ownership check if needed
6. [ ] Update tests
7. [ ] Test manually
8. [ ] Review audit logs
9. [ ] Deploy to staging
10. [ ] Monitor for 24 hours
11. [ ] Deploy to production

---

## Support

- **Full Documentation:** See `RBAC_SECURITY_AUDIT.md`
- **Migration Help:** See `RBAC_MIGRATION_GUIDE.md`
- **Code:** `/src/lib/middleware/rbac-enhanced.ts`
- **Tests:** `/src/__tests__/integration/rbac-*.test.ts`
- **Questions:** Email security@engify.ai

---

## Version History

- **v2.0 (2025-11-17):** Enhanced RBAC with MFA enforcement
- **v1.0 (2025-10-01):** Initial RBAC system

---

**Last Updated:** 2025-11-17
