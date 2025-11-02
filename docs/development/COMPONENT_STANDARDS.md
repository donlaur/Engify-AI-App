# Component Standards

**Guide Type:** Developer Guide  
**Related:** [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md), [Pattern Audit Day 7](../../testing/PATTERN_AUDIT_DAY7.md)

---

## Overview

This guide covers component architecture standards, including Server vs Client Components, error boundaries, loading states, empty states, and dark mode support.

---

## Server vs Client Components

### Server Components (Default)

**Use for:**
- Data fetching
- Static content
- No interactivity needed

**Example:**

```typescript
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

**Benefits:**
- Smaller bundle size
- Faster initial load
- Better SEO
- Direct database access

### Client Components (When Needed)

**Use for:**
- Event handlers (`onClick`, `onChange`)
- React hooks (`useState`, `useEffect`)
- Browser APIs (`localStorage`, `navigator`)
- Interactive components

**Example:**

```typescript
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

**Rules:**
- Must have `'use client'` directive
- Cannot be async
- Cannot use Server-only APIs
- Can import Server Components (but they become Client)

---

## Error Boundaries

**Wrap all Client Components:**

```typescript
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
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <ClientComponent />
</ErrorBoundary>
```

---

## Loading States

**Use skeleton loaders (not "Loading..."):**

```typescript
// src/components/ui/skeleton.tsx
export function PromptCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
    </div>
  );
}

// Usage with Suspense
import { Suspense } from 'react';

<Suspense fallback={<PromptCardSkeleton />}>
  <PromptList />
</Suspense>
```

**Skeleton Guidelines:**
- Match the actual content layout
- Use `animate-pulse` for animation
- Support dark mode
- Show realistic placeholder shapes

---

## Empty States

**Use consistent empty state component:**

```typescript
// src/components/ui/empty-state.tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && (
        action.href ? (
          <Button href={action.href}>{action.label}</Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
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

**Empty State Guidelines:**
- Clear, helpful message
- Actionable CTA when appropriate
- Consistent design across app
- Support dark mode

---

## Dark Mode Support

**All components must support dark mode:**

```typescript
// Use Tailwind dark mode classes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <h1 className="text-gray-900 dark:text-gray-100">
    Title
  </h1>
  <p className="text-gray-600 dark:text-gray-400">
    Description
  </p>
</div>
```

**Common Patterns:**

```typescript
// Backgrounds
bg-white dark:bg-gray-900
bg-gray-50 dark:bg-gray-800

// Text
text-gray-900 dark:text-gray-100
text-gray-700 dark:text-gray-300
text-gray-600 dark:text-gray-400
text-gray-500 dark:text-gray-500

// Borders
border-gray-200 dark:border-gray-700

// Muted foreground (shadcn/ui)
text-muted-foreground // Handles dark mode automatically
```

**Testing:**
- Test all components in light and dark mode
- Check contrast ratios
- Verify readability

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

## TypeScript Standards

**Props Interface:**

```typescript
interface ComponentProps {
  title: string;                    // Required
  description?: string;            // Optional
  onAction: () => void;             // Callback
  items?: Item[];                   // Array
  variant?: 'primary' | 'secondary'; // Union type
}
```

**Export Pattern:**

```typescript
// Named export for components
export function PromptCard({ title, description }: ComponentProps) {
  // ...
}

// Type export for props
export type { ComponentProps };
```

---

## Accessibility

**Semantic HTML:**

```typescript
// Use semantic elements
<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>
```

**ARIA Labels:**

```typescript
<button aria-label="Copy to clipboard">
  <CopyIcon />
</button>
```

**Keyboard Navigation:**

```typescript
// Ensure all interactive elements are keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

---

## Checklist

- [ ] Server Component by default (unless Client needed)
- [ ] `'use client'` directive if Client Component
- [ ] Error boundary wrapped (for Client Components)
- [ ] Loading skeleton implemented
- [ ] Empty state component used
- [ ] Dark mode classes applied
- [ ] TypeScript types defined
- [ ] Accessibility considerations
- [ ] Tests written (if applicable)

---

## Examples

**Complete Component Example:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PromptCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PromptCard } from '@/components/features/PromptCard';

interface PromptListProps {
  initialPrompts?: Prompt[];
}

export function PromptList({ initialPrompts = [] }: PromptListProps) {
  const [prompts, setPrompts] = useState(initialPrompts);
  const [loading, setLoading] = useState(!initialPrompts.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompts.length === 0) {
      loadPrompts();
    }
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/prompts');
      const data = await response.json();
      setPrompts(data.prompts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <button onClick={loadPrompts}>Retry</button>
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <EmptyState
        title="No prompts found"
        description="Try adjusting your filters"
        action={{ label: "Clear Filters", onClick: () => {} }}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </ErrorBoundary>
  );
}
```

---

## Related Documentation

- [ADR 011: Frontend Component Architecture](./ADR/ADR-011-frontend-architecture.md)
- [Pattern Audit Day 7](../../testing/PATTERN_AUDIT_DAY7.md)
- [Adding a New Admin Panel](./ADDING_ADMIN_PANEL.md)
- [Creating API Routes](./CREATING_API_ROUTES.md)

---

**Last Updated:** 2025-11-02  
**Author:** Donnie Laur, AI Assistant

