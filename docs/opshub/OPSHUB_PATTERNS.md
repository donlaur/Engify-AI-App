# OpsHub Admin Area - Pattern Guide

**Last Updated:** 2025-01-20  
**Purpose:** Comprehensive pattern guide for building and maintaining OpsHub admin panels  
**Target Audience:** Developers and AI assistants adding new admin features

---

## 🎯 Core Principles

1. **Password Protection:** Every OpsHub page MUST be password-protected
2. **Shared Patterns:** Duplication should be eliminated across the entire area, not just individual pages
3. **AI-Friendly:** Code should be self-documenting with clear patterns for AI models to follow
4. **Code Quality:** All code must maintain <4% duplication, Grade A quality scores

---

## 📁 Directory Structure

```
src/
├── app/
│   └── opshub/
│       ├── page.tsx                    # Main entry (uses requireOpsHubAuth)
│       ├── ai-models/
│       │   └── page.tsx                # Feature page (uses requireOpsHubAuth)
│       └── ai-tools/
│           └── page.tsx                # Feature page (uses requireOpsHubAuth)
├── components/
│   └── opshub/                         # All OpsHub components
│       ├── panels/                     # Management panel components
│       │   ├── OpsHubTabs.tsx         # Tab container
│       │   ├── *ManagementPanel.tsx   # Individual panels
│       │   └── shared/                # Shared panel components
│       ├── ai-models/                  # AI models feature components
│       ├── ai-tools/                   # AI tools feature components
│       └── shared/                     # Shared opshub components
├── hooks/
│   └── opshub/                          # Shared OpsHub hooks
├── lib/
│   └── opshub/                         # OpsHub utilities
│       ├── auth.ts                    # Authentication patterns
│       ├── utils.ts                   # Formatting, calculations
│       └── filterUtils.ts             # Filtering logic
```

---

## 🔐 Authentication Pattern

**MANDATORY:** Every OpsHub page must use `requireOpsHubAuth()`.

```tsx
// src/app/opshub/my-feature/page.tsx
import { requireOpsHubAuth } from '@/lib/opshub/auth';

/**
 * @pattern OPSHUB_PAGE
 * @auth requireOpsHubAuth() - All opshub pages require admin authentication
 * @description Feature description for AI context
 */
export default async function MyFeaturePage() {
  // ✅ REQUIRED: Call at top of every page
  const { user, role } = await requireOpsHubAuth();
  
  // Page content here
  return <div>...</div>;
}
```

**Why:** Centralizes auth logic, ensures consistency, makes it easy for AI to add new pages.

---

## 🎨 Component Patterns

### Pattern 1: Management Panel Component

**Location:** `src/components/admin/*ManagementPanel.tsx`

**Structure:**
```tsx
'use client';

/**
 * @pattern OPSHUB_MANAGEMENT_PANEL
 * @description Brief description for AI context
 * 
 * This panel follows the standard OpsHub management pattern:
 * 1. Uses useAdminData hook for data fetching
 * 2. Uses shared hooks (useAdminStatusToggle, useAdminViewDrawer)
 * 3. Uses shared components (AdminDataTable, AdminStatsCard, etc.)
 * 4. Uses shared utilities (filterUtils, formatAdminDate)
 * 5. Maintains <4% code duplication
 */
import { useAdminData } from '@/hooks/opshub/useAdminData';
import { useAdminStatusToggle } from '@/hooks/opshub/useAdminStatusToggle';
import { useAdminViewDrawer } from '@/hooks/opshub/useAdminViewDrawer';
import { AdminDataTable } from '@/components/opshub/panels/shared/AdminDataTable';
import { AdminStatsCard } from '@/components/opshub/panels/shared/AdminStatsCard';
import { filterUtils } from '@/lib/opshub/filterUtils';
import { formatAdminDate } from '@/lib/opshub/utils';

export function MyManagementPanel() {
  // 1. Data fetching
  const { data, loading, refresh } = useAdminData({
    endpoint: '/api/admin/my-feature',
    dataKey: 'items',
  });
  
  // 2. Status toggle
  const { toggleStatus } = useAdminStatusToggle({
    endpoint: '/api/admin/my-feature',
    entityName: 'Item',
    onRefresh: refresh,
  });
  
  // 3. View drawer
  const { selectedItem, isDrawerOpen, openDrawer, closeDrawer } = 
    useAdminViewDrawer();
  
  // 4. Filtering (use shared utilities)
  const filtered = useMemo(
    () => filterUtils.filterByStatus(data, statusFilter),
    [data, statusFilter]
  );
  
  // 5. Stats (use shared utilities)
  const stats = useMemo(
    () => calculateStats(data, [
      { key: 'total', calculate: () => totalCount },
      { key: 'active', calculate: (items) => items.filter(i => i.active).length },
    ]),
    [data, totalCount]
  );
  
  return (
    <AdminErrorBoundary>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <AdminStatsCard label="Total" value={stats.total} />
        {/* ... */}
      </div>
      
      {/* Data Table */}
      <AdminDataTable
        data={filtered}
        columns={columns}
        onStatusToggle={toggleStatus}
        onRowClick={openDrawer}
      />
      
      {/* View Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
        {/* ... */}
      </Sheet>
    </AdminErrorBoundary>
  );
}
```

---

### Pattern 2: Shared Hooks

**Location:** `src/hooks/admin/*.ts`

**Available Hooks:**
- `useAdminData` - Data fetching with pagination
- `useAdminStatusToggle` - Status toggle logic
- `useAdminViewDrawer` - Drawer state management
- `useAdminToast` - Toast notifications
- `useDebouncedValue` - Debounced search

**Usage:**
```tsx
// ✅ DO: Use shared hooks
const { data, loading, refresh } = useAdminData({ endpoint: '/api/admin/items' });
const { toggleStatus } = useAdminStatusToggle({ endpoint: '/api/admin/items', onRefresh: refresh });

// ❌ DON'T: Create custom hooks that duplicate existing functionality
```

---

### Pattern 3: Shared Components

**Location:** `src/components/admin/shared/*.tsx`

**Available Components:**
- `AdminDataTable` - Data table with sorting, filtering
- `AdminStatsCard` - Statistics display card
- `AdminPaginationControls` - Pagination UI
- `AdminTableSkeleton` - Loading skeleton
- `AdminEmptyState` - Empty state display
- `AdminErrorBoundary` - Error boundary wrapper

**Usage:**
```tsx
// ✅ DO: Use shared components
<AdminStatsCard label="Total" value={stats.total} />
<AdminDataTable data={items} columns={columns} />

// ❌ DON'T: Create custom components that duplicate shared functionality
```

---

### Pattern 4: Shared Utilities

**Location:** `src/lib/admin/*.ts`

**Available Utilities:**
- `formatAdminDate` - Date formatting
- `calculateStats` - Statistics calculation
- `truncateText` - Text truncation
- `filterUtils` - Filtering functions

**Usage:**
```tsx
// ✅ DO: Use shared utilities
import { formatAdminDate, calculateStats } from '@/lib/opshub/utils';
import { filterByStatus, filterByCategory } from '@/lib/opshub/filterUtils';

// ❌ DON'T: Duplicate utility functions
```

---

## 🔄 CRUD Operation Pattern

**Standard CRUD operations should follow this pattern:**

```tsx
// 1. Create
const handleCreate = async (data: CreateData) => {
  const res = await fetch('/api/admin/my-feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    refresh();
    success('Created', 'Item created successfully');
  }
};

// 2. Update
const handleUpdate = async (id: string, data: UpdateData) => {
  const res = await fetch(`/api/admin/my-feature/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (res.ok) {
    refresh();
    success('Updated', 'Item updated successfully');
  }
};

// 3. Delete
const handleDelete = async (id: string) => {
  if (!confirm('Are you sure?')) return;
  const res = await fetch(`/api/admin/my-feature/${id}`, {
    method: 'DELETE',
  });
  if (res.ok) {
    refresh();
    success('Deleted', 'Item deleted successfully');
  }
};

// 4. Status Toggle (use shared hook)
const { toggleStatus } = useAdminStatusToggle({
  endpoint: '/api/admin/my-feature',
  entityName: 'Item',
  onRefresh: refresh,
});
```

---

## 📊 Data Table Pattern

**Standard data table setup:**

```tsx
// 1. Define columns
const columns: ColumnDef<Item>[] = useMemo(() => [
  {
    id: 'title',
    label: 'Title',
    width: 'w-[300px]',
    render: (item) => (
      <button onClick={() => openDrawer(item)}>
        {item.title}
      </button>
    ),
    cellClassName: 'font-medium'
  },
  {
    id: 'status',
    label: 'Status',
    render: (item) => <Badge>{item.status}</Badge>
  },
  {
    id: 'updated',
    label: 'Updated',
    render: (item) => formatAdminDate(item.updatedAt)
  }
], [openDrawer]);

// 2. Use AdminDataTable
<AdminDataTable
  data={filteredItems}
  columns={columns}
  statusField="status"
  onStatusToggle={(id, status) => toggleStatus(id, status)}
  onRowClick={openDrawer}
  renderRowActions={(item) => (
    <Button onClick={() => openDrawer(item)}>
      <Icons.eye />
    </Button>
  )}
/>
```

---

## 🎯 Code Quality Standards

**All OpsHub code must:**
- ✅ Maintain <4% code duplication
- ✅ Achieve Grade A (9.5+) quality scores
- ✅ Use shared hooks, components, and utilities
- ✅ Include JSDoc documentation
- ✅ Follow TypeScript strict mode
- ✅ Remove all `console.log` statements
- ✅ Use error boundaries for error handling

**Before committing:**
1. Run `engify_guardrail_assess_code_quality` on new/modified files
2. Verify duplication is <4%
3. Verify Grade A quality score
4. Ensure build passes (`npm run build`)

---

## 🤖 AI Assistant Guidelines

**When adding new OpsHub features:**

1. **Check existing patterns first:**
   - Search for similar panels/components
   - Use shared hooks and utilities
   - Follow established patterns

2. **Add AI summary to page:**
   ```tsx
   /**
    * @pattern OPSHUB_PAGE
    * @auth requireOpsHubAuth()
    * @description Brief description for AI context
    */
   ```

3. **Use shared components:**
   - `AdminDataTable` for tables
   - `AdminStatsCard` for stats
   - `useAdminData` for data fetching
   - `useAdminStatusToggle` for status toggles

4. **Eliminate duplication:**
   - Extract common logic to shared utilities
   - Use shared hooks instead of custom hooks
   - Reuse components instead of duplicating

5. **Maintain quality:**
   - Run code quality assessment
   - Ensure <4% duplication
   - Add JSDoc documentation

---

## 📝 Example: Adding a New Admin Panel

**Step 1: Create API Route**
```tsx
// src/app/api/admin/my-feature/route.ts
import { withRBAC } from '@/lib/middleware/rbac';
import { RBACPresets } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  const rbac = await RBACPresets.requireAdmin()(request);
  if (rbac) return rbac;
  // ... handler
}
```

**Step 2: Create Page**
```tsx
// src/app/opshub/my-feature/page.tsx
import { requireOpsHubAuth } from '@/lib/opshub/auth';

export default async function MyFeaturePage() {
  const { user } = await requireOpsHubAuth();
  return <MyFeaturePanel />;
}
```

**Step 3: Create Panel Component**
```tsx
// src/components/admin/MyFeatureManagementPanel.tsx
'use client';

/**
 * @pattern OPSHUB_MANAGEMENT_PANEL
 * @description Manages my feature items
 */
export function MyFeatureManagementPanel() {
  // Use shared hooks and components
  const { data, loading, refresh } = useAdminData({
    endpoint: '/api/admin/my-feature',
    dataKey: 'items',
  });
  
  // ... rest of implementation
}
```

**Step 4: Add to OpsHubTabs**
```tsx
// src/components/admin/OpsHubTabs.tsx
import { MyFeatureManagementPanel } from './MyFeatureManagementPanel';

// Add tab trigger and content
```

---

## 🔍 Code Quality Checklist

Before committing any OpsHub changes:

- [ ] All pages use `requireOpsHubAuth()`
- [ ] Code duplication <4%
- [ ] Quality score Grade A (9.5+)
- [ ] Uses shared hooks (`useAdminData`, `useAdminStatusToggle`, etc.)
- [ ] Uses shared components (`AdminDataTable`, `AdminStatsCard`, etc.)
- [ ] Uses shared utilities (`formatAdminDate`, `filterUtils`, etc.)
- [ ] No `console.log` statements
- [ ] JSDoc documentation added
- [ ] Error boundaries in place
- [ ] Build passes (`npm run build`)
- [ ] AI summary comment added to page

---

## 📚 Related Documentation

- `docs/opshub/OPSHUB_CODE_REVIEW.md` - Code review guidelines
- `docs/development/ADDING_ADMIN_PANELS_GUIDE.md` - Step-by-step guide
- `src/hooks/admin/useAdminData.ts` - Data fetching hook documentation
- `src/components/admin/shared/` - Shared component documentation

---

## 🎓 Learning Resources

**For AI Assistants:**
1. Read this pattern guide first
2. Review existing panels (WorkflowManagementPanel, PromptManagementPanel)
3. Use shared hooks and components
4. Run code quality assessment before committing
5. Maintain <4% duplication

**For Developers:**
1. Follow established patterns
2. Extract common logic to shared utilities
3. Use TypeScript strict mode
4. Write tests for critical paths
5. Document complex logic

