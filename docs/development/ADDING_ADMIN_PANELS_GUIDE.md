# Adding Admin Panels to OpsHub - Developer Guide

**Date:** 2025-11-02  
**Purpose:** Step-by-step guide for adding new admin panels to OpsHub  
**Related:** ADR-008, OpsHub Enterprise Build-Out, Day 7 Phase 2

---

## Overview

OpsHub uses a tabbed interface with multiple admin panels. This guide walks through adding a new panel following established patterns.

---

## Architecture

### Current Structure

```
src/
├── app/
│   └── opshub/
│       └── page.tsx              # Server Component (auth, data fetching)
└── components/
    └── admin/
        ├── OpsHubTabs.tsx        # Tab container (Client Component)
        ├── ContentManagementCMS.tsx
        ├── PromptManagementPanel.tsx
        ├── PatternManagementPanel.tsx
        ├── UserManagementPanel.tsx
        └── SystemSettingsPanel.tsx
```

### Key Components

1. **OpsHub Page** (`src/app/opshub/page.tsx`)
   - Server Component for authentication and initial data fetching
   - RBAC checks (admin/super_admin only)
   - MFA verification (if enabled)

2. **OpsHubTabs** (`src/components/admin/OpsHubTabs.tsx`)
   - Client Component managing tab state
   - Renders all admin panels

3. **Individual Panels** (`src/components/admin/*Panel.tsx`)
   - Client Components for interactivity
   - Fetch data from API routes
   - Handle CRUD operations

---

## Step-by-Step Guide

### Step 1: Create API Route

**Location:** `src/app/api/admin/[feature]/route.ts`

**Requirements:**
- RBAC protection (super_admin or admin)
- Rate limiting
- Zod validation
- Audit logging
- Error handling

**Example:**
```typescript
// src/app/api/admin/my-feature/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { RBACPresets } from '@/lib/rbac';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { logAuditEvent } from '@/server/middleware/audit';

const schema = z.object({
  // Define your schema
});

export async function GET(request: NextRequest) {
  // 1. Check authentication
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check RBAC
  const rbac = RBACPresets.requireSuperAdmin();
  const hasPermission = await rbac.check(session.user);
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Rate limiting
  const rateLimitResult = await checkRateLimit(request, {
    identifier: session.user.id,
    limit: 60,
    window: '1m',
  });
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
  }

  // 4. Fetch data
  try {
    const db = await getDb();
    const data = await db.collection('my_collection').find().toArray();

    // 5. Audit log
    await logAuditEvent({
      userId: session.user.id,
      action: 'admin.my-feature.viewed',
      metadata: { count: data.length },
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Similar structure for POST
  // 1. Auth
  // 2. RBAC
  // 3. Rate limit
  // 4. Validate body with Zod
  // 5. Process request
  // 6. Audit log
  // 7. Return response
}
```

### Step 2: Create Panel Component

**Location:** `src/components/admin/MyFeaturePanel.tsx`

**Requirements:**
- Client Component (`'use client'`)
- Error boundary (wrap in ErrorBoundary)
- Loading states (skeletons)
- Empty states
- Error handling

**Example:**
```typescript
// src/components/admin/MyFeaturePanel.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface MyFeature {
  id: string;
  name: string;
  // ... other fields
}

export function MyFeaturePanel() {
  const [data, setData] = useState<MyFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/my-feature');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error: {error}</p>
        <Button onClick={fetchData} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Feature</h2>
        <Button onClick={() => {/* Handle create */}}>
          Create New
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            {/* Add more columns */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              {/* Add more cells */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Wrap in ErrorBoundary
export function MyFeaturePanelWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<div>Error loading panel</div>}>
      <MyFeaturePanel />
    </ErrorBoundary>
  );
}
```

### Step 3: Add to OpsHubTabs

**File:** `src/components/admin/OpsHubTabs.tsx`

**Steps:**
1. Import your panel component
2. Add TabsTrigger to TabsList
3. Add TabsContent with your panel

**Example:**
```typescript
// Add import
import { MyFeaturePanel } from './MyFeaturePanel';

// Add to TabsList (update grid-cols-5 to grid-cols-6)
<TabsList className="grid w-full grid-cols-6">
  {/* Existing tabs */}
  <TabsTrigger value="my-feature" className="flex items-center gap-2">
    <Icons.settings className="h-4 w-4" />
    My Feature
  </TabsTrigger>
</TabsList>

// Add TabsContent
<TabsContent value="my-feature" className="space-y-4">
  <MyFeaturePanel />
</TabsContent>
```

### Step 4: Add Icon (if needed)

**File:** `src/lib/icons.ts`

```typescript
// Add icon import
import { IconName } from 'lucide-react';

// Add to Icons object
export const Icons = {
  // ... existing icons
  myFeature: IconName,
};
```

---

## Best Practices

### 1. Security

**Always:**
- ✅ Check authentication
- ✅ Enforce RBAC (super_admin or admin)
- ✅ Rate limit all endpoints
- ✅ Validate all inputs with Zod
- ✅ Audit log all actions
- ✅ Sanitize user inputs

**Never:**
- ❌ Skip RBAC checks
- ❌ Trust client-side data
- ❌ Expose sensitive data
- ❌ Allow SQL injection (use parameterized queries)

### 2. Error Handling

**Client Component:**
```typescript
try {
  const response = await fetch('/api/admin/my-feature');
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  // Handle success
} catch (error) {
  // Show user-friendly error
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
}
```

**Server Component:**
```typescript
try {
  // Process request
  return NextResponse.json({ data });
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 3. Loading States

**Use skeletons, not "Loading..." text:**
```typescript
import { Skeleton } from '@/components/ui/skeleton';

if (loading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

### 4. Empty States

**Provide helpful empty states:**
```typescript
if (data.length === 0) {
  return (
    <div className="rounded-lg border p-8 text-center">
      <Icons.inbox className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No items found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first item.
      </p>
      <Button className="mt-4">Create Item</Button>
    </div>
  );
}
```

### 5. Type Safety

**Use TypeScript interfaces:**
```typescript
interface MyFeature {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Use in component
const [data, setData] = useState<MyFeature[]>([]);
```

### 6. Data Fetching

**Options:**
- **Server Component:** Fetch in `page.tsx`, pass as props
- **Client Component:** Use `useEffect` + `fetch` or SWR
- **Recommended:** Server Component for initial data, Client Component for updates

---

## Checklist

### Before Creating Panel
- [ ] API route designed and documented
- [ ] RBAC requirements defined
- [ ] Data schema defined (Zod)
- [ ] Audit events identified

### During Development
- [ ] API route implemented with all security checks
- [ ] Panel component created (Client Component)
- [ ] Error boundary added
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] TypeScript types defined
- [ ] Tests written (optional but recommended)

### Before Merging
- [ ] Pre-commit hooks pass
- [ ] RBAC tested
- [ ] Rate limiting tested
- [ ] Error handling tested
- [ ] Loading/empty states tested
- [ ] Mobile responsive
- [ ] Documentation updated

---

## Example: Complete Panel

See `src/components/admin/ContentManagementCMS.tsx` for a complete example.

**Key Features:**
- Table with sortable columns
- Sheet (drawer) for preview
- Dialog for create/edit
- Loading states
- Error handling
- CRUD operations

---

## Testing

### Manual Testing

1. **Authentication:**
   - Login as admin → Should access panel
   - Login as user → Should be redirected

2. **RBAC:**
   - Test with admin role
   - Test with super_admin role
   - Test with user role (should fail)

3. **Functionality:**
   - Create new item
   - Edit existing item
   - Delete item
   - View list
   - Search/filter (if applicable)

4. **Error Handling:**
   - Test with invalid data
   - Test with network errors
   - Test with API errors

### Automated Testing

**API Route Test:**
```typescript
// src/__tests__/api/admin/my-feature.test.ts
describe('/api/admin/my-feature', () => {
  it('requires authentication', async () => {
    const response = await fetch('/api/admin/my-feature');
    expect(response.status).toBe(401);
  });

  it('requires admin role', async () => {
    // Test with user role
    // Should return 403
  });

  it('returns data for admin', async () => {
    // Test with admin role
    // Should return 200 with data
  });
});
```

**Component Test:**
```typescript
// src/components/admin/__tests__/MyFeaturePanel.test.tsx
describe('MyFeaturePanel', () => {
  it('renders loading state', () => {
    render(<MyFeaturePanel />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders data', async () => {
    // Mock API response
    render(<MyFeaturePanel />);
    expect(await screen.findByText('Item Name')).toBeInTheDocument();
  });
});
```

---

## Related Documentation

- [ADR-008: OpsHub CMS Simplification](../development/ADR/ADR-008-opshub-cms-simplification.md)
- [Enterprise RBAC Guide](../../planning/ENTERPRISE_RBAC_AND_ADMIN_DASHBOARD.md)
- [OpsHub Improvement Plan](../../planning/OPSHUB_IMPROVEMENT_PLAN.md)
- [Component Testing Guide](../testing/COMPONENT_TESTING_GUIDE.md)

---

## Common Pitfalls

### 1. Missing RBAC Checks
**Problem:** Forgetting to check permissions  
**Solution:** Always use `RBACPresets.requireSuperAdmin()` or similar

### 2. No Rate Limiting
**Problem:** API routes without rate limiting  
**Solution:** Add `checkRateLimit` to all admin routes

### 3. Poor Error Handling
**Problem:** Generic error messages  
**Solution:** Provide specific, actionable error messages

### 4. No Loading States
**Problem:** Blank screen during data fetch  
**Solution:** Always show skeleton or loading indicator

### 5. Missing Audit Logs
**Problem:** No audit trail for admin actions  
**Solution:** Log all significant actions with `logAuditEvent`

---

**Last Updated:** 2025-11-02  
**Status:** ✅ Documentation complete  
**Next Review:** After adding new panel

