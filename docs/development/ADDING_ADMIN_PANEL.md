# Adding a New Admin Panel

**Guide Type:** Developer Guide  
**Related:** [OpsHub Improvement Plan](../../planning/OPSHUB_IMPROVEMENT_PLAN.md), [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md)

---

## Overview

This guide walks you through adding a new admin panel to OpsHub. Admin panels are organized into tabs and follow consistent patterns for RBAC, error handling, and data display.

---

## Step 1: Create the Panel Component

**Location:** `src/components/admin/[PanelName]Panel.tsx`

**Template:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { requireAuth } from '@/lib/auth/require-auth';

interface [PanelName]PanelProps {
  // Props for the panel
}

export function [PanelName]Panel({}: [PanelName]PanelProps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/[endpoint]');
      
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={loadData} />;
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>[Panel Name]</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Panel content */}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}
```

---

## Step 2: Create the API Route

**Location:** `src/app/api/admin/[endpoint]/route.ts`

**Requirements:**

1. **RBAC Check** - Use `RBACPresets.requireSuperAdmin()`
2. **Rate Limiting** - Apply rate limits
3. **Zod Validation** - Validate all inputs
4. **Error Handling** - Return proper HTTP status codes
5. **Audit Logging** - Log sensitive operations

**Template:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { RBACPresets } from '@/lib/auth/rbac';
import { rateLimit } from '@/lib/rate-limit';
import { auditLog } from '@/lib/logging/audit';

const schema = z.object({
  // Define your schema
});

export async function GET(request: NextRequest) {
  try {
    // 1. RBAC Check
    const user = await RBACPresets.requireSuperAdmin();
    
    // 2. Rate Limiting
    const rateLimitResult = await rateLimit({
      identifier: user.id,
      limit: 100,
      window: '1m',
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // 3. Fetch data from database
    // const data = await fetchDataFromDB();
    
    // 4. Audit logging
    await auditLog({
      userId: user.id,
      action: 'admin.panel.view',
      resource: '[panel-name]',
      metadata: {},
    });
    
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle auth errors
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.error('[Panel] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. RBAC Check
    const user = await RBACPresets.requireSuperAdmin();
    
    // 2. Rate Limiting
    const rateLimitResult = await rateLimit({
      identifier: user.id,
      limit: 50,
      window: '1m',
    });
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // 3. Validate request body
    const body = await request.json();
    const validated = schema.parse(body);
    
    // 4. Process request
    // const result = await processRequest(validated);
    
    // 5. Audit logging
    await auditLog({
      userId: user.id,
      action: 'admin.panel.create',
      resource: '[panel-name]',
      metadata: validated,
    });
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Same error handling as GET
  }
}
```

---

## Step 3: Add to OpsHub Page

**Location:** `src/app/opshub/page.tsx`

**Add the panel to the tabs:**

```typescript
import { [PanelName]Panel } from '@/components/admin/[PanelName]Panel';

// In the tabs array
const tabs = [
  { id: 'dashboard', label: 'Dashboard', component: DashboardPanel },
  { id: '[panel-id]', label: '[Panel Name]', component: [PanelName]Panel },
  // ... other tabs
];
```

---

## Step 4: Add Error Boundary

**Wrap the panel component:**

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <[PanelName]Panel />
</ErrorBoundary>
```

---

## Step 5: Add Loading States

**Use skeleton loaders:**

```typescript
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}
```

---

## Step 6: Add Empty States

**Use consistent empty state component:**

```typescript
import { EmptyState } from '@/components/ui/empty-state';

{data.length === 0 ? (
  <EmptyState
    title="No items yet"
    description="Create your first item to get started"
    action={{
      label: "Create Item",
      onClick: () => handleCreate(),
    }}
  />
) : (
  <DataList data={data} />
)}
```

---

## Step 7: Test Dark Mode

**Ensure all components work in dark mode:**

```typescript
// Use Tailwind dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

---

## Checklist

- [ ] Panel component created with proper TypeScript types
- [ ] API route created with RBAC checks
- [ ] Rate limiting applied
- [ ] Zod validation for inputs
- [ ] Error handling implemented
- [ ] Audit logging added
- [ ] Added to OpsHub tabs
- [ ] Error boundary wrapped
- [ ] Loading skeleton implemented
- [ ] Empty state component used
- [ ] Dark mode tested
- [ ] Tests written (if applicable)

---

## Examples

**Existing Panels:**

- `ContentManagementPanel` - Content CMS
- `PromptManagementPanel` - Prompt management
- `PatternManagementPanel` - Pattern management

**Reference these for patterns:**

- `src/components/admin/ContentManagementPanel.tsx`
- `src/app/api/admin/content/index/route.ts`

---

## Related Documentation

- [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md)
- [OpsHub Improvement Plan](../../planning/OPSHUB_IMPROVEMENT_PLAN.md)
- [Component Standards](./COMPONENT_STANDARDS.md)
- [Creating API Routes](./CREATING_API_ROUTES.md)

---

**Last Updated:** 2025-11-02  
**Author:** Donnie Laur, AI Assistant

