# ADR 011: Frontend Component Architecture

**Date:** 2025-11-02  
**Status:** ✅ Accepted  
**Deciders:** Engineering Team  
**Related:** Day 7 QA, Frontend Polish Phase 4

---

## Context

**Current State:**

- Mix of Server and Client Components
- Some components have unclear boundaries
- Error boundaries not consistently applied
- Loading states inconsistent
- Empty states vary in quality

**Problems Identified:**

1. **Server/Client Boundaries**
   - Some Server Components have event handlers
   - Unclear when to use 'use client'
   - Build errors from mixing boundaries

2. **Error Handling**
   - No consistent error boundaries
   - Errors not gracefully handled
   - Poor user experience on failures

3. **Loading States**
   - Generic "Loading..." text
   - No skeleton loaders
   - Inconsistent across pages

4. **Empty States**
   - Some pages blank when empty
   - Inconsistent messaging
   - Missing CTAs

---

## Decision Drivers

1. **User Experience** - Professional, polished UI
2. **Developer Experience** - Clear patterns to follow
3. **Maintainability** - Consistent patterns across codebase
4. **Performance** - Server components by default
5. **Accessibility** - Proper error handling and states

---

## Decision

**Adopt Component Architecture Standards**

### Principles

1. **Server Components by Default**
   - Use Server Components for data fetching
   - Only use Client Components when needed
   - Clear boundaries between server/client

2. **Error Boundaries Everywhere**
   - Wrap all client components
   - Provide meaningful error messages
   - Log errors to monitoring

3. **Consistent Loading States**
   - Use skeleton loaders
   - Branded loading UI
   - Suspense boundaries

4. **Helpful Empty States**
   - Clear messaging
   - Actionable CTAs
   - Consistent design

5. **Dark Mode Support**
   - All components support dark mode
   - Proper contrast
   - Tested in both modes

---

## Architecture Standards

### Server Components (Default)

```typescript
// ✅ GOOD - Server Component
// src/app/prompts/page.tsx
import { getPrompts } from '@/lib/prompts';

export default async function PromptsPage() {
  const prompts = await getPrompts();
  
  return (
    <div>
      <h1>Prompts</h1>
      <PromptList prompts={prompts} />
    </div>
  );
}
```

**When to Use:**
- Data fetching
- Static content
- No interactivity needed

### Client Components (When Needed)

```typescript
// ✅ GOOD - Client Component
// src/components/features/PromptActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PromptActionsProps {
  promptId: string;
  content: string;
}

export function PromptActions({ promptId, content }: PromptActionsProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Button onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
}
```

**When to Use:**
- Event handlers (`onClick`, `onChange`)
- React hooks (`useState`, `useEffect`)
- Browser APIs (`localStorage`, `navigator`)
- Interactive components

### Error Boundaries

```typescript
// ✅ GOOD - Error Boundary
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage:**

```typescript
// Wrap client components
<ErrorBoundary>
  <ClientComponent />
</ErrorBoundary>
```

### Loading States

```typescript
// ✅ GOOD - Skeleton Loader
// src/components/ui/skeleton.tsx
export function PromptCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}

// Usage with Suspense
<Suspense fallback={<PromptCardSkeleton />}>
  <PromptList />
</Suspense>
```

### Empty States

```typescript
// ✅ GOOD - Empty State Component
// src/components/ui/empty-state.tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && (
        <Button href={action.href}>{action.label}</Button>
      )}
    </div>
  );
}

// Usage
{prompts.length === 0 ? (
  <EmptyState
    title="No prompts yet"
    description="Start exploring our prompt library"
    action={{ label: "Browse Prompts", href: "/prompts" }}
  />
) : (
  <PromptList prompts={prompts} />
)}
```

---

## Component Organization

```
src/components/
├── ui/                    # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── skeleton.tsx
│   └── empty-state.tsx
├── features/              # Feature-specific components
│   ├── PromptCard.tsx
│   ├── PromptList.tsx
│   └── PromptActions.tsx
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Sidebar.tsx
└── ErrorBoundary.tsx      # Error boundaries
```

---

## Alternatives Considered

### Alternative 1: All Client Components

**Pros:**
- Simpler mental model
- No boundary confusion

**Cons:**
- Poor performance
- Larger bundle size
- Not Next.js best practice

**Verdict:** ❌ Rejected - Performance critical

### Alternative 2: Minimal Error Handling

**Pros:**
- Less code
- Faster development

**Cons:**
- Poor UX on errors
- Unprofessional appearance
- Hard to debug

**Verdict:** ❌ Rejected - User experience critical

### Alternative 3: Custom Loading States Per Component

**Pros:**
- Flexible
- Component-specific

**Cons:**
- Inconsistent
- More work
- Harder to maintain

**Verdict:** ❌ Rejected - Consistency important

---

## Decision Outcome

**Status:** ✅ Accepted and Partially Implemented

**Current State:**

- ✅ Server/Client boundaries clear
- ✅ Error boundaries pattern defined
- ⏳ Loading states - skeletons needed
- ⏳ Empty states - component needed
- ⏳ Dark mode - all components need testing

**Success Criteria:**

- All components follow architecture standards
- Error boundaries wrap all client components
- Consistent loading/empty states
- Dark mode works everywhere
- Lighthouse accessibility 90+

**Review Date:** 2025-11-09 (1 week)

---

## References

- [Day 7 Plan](../../planning/DAY_7_QA_FRONTEND_IMPROVEMENTS.md)
- [Pattern Audit Report](../../testing/PATTERN_AUDIT_DAY7.md)
- [Next.js App Router Docs](https://nextjs.org/docs/app)

---

## Notes

**Future Enhancements:**

1. Component library documentation
2. Storybook for component showcase
3. Visual regression testing
4. Accessibility audit automation

**Related ADRs:**

- ADR 009: Pattern-Based Bug Fixing
- ADR 010: Admin CLI Consolidation

---

**Last Updated:** 2025-11-02  
**Authors:** Donnie Laur, AI Assistant  
**Tags:** #frontend #architecture #components #day7 #ux

