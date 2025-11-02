# Component Testing Guide

**Date:** 2025-11-02  
**Purpose:** Guide for writing and maintaining component tests  
**Related:** Day 7 Phase 6, Test Coverage

---

## Overview

Component tests ensure UI components work correctly and prevent regressions. This guide covers testing patterns, best practices, and examples.

---

## Testing Stack

- **Vitest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation

---

## Test Structure

### File Organization

```
src/
├── components/
│   ├── PromptCard.tsx
│   └── __tests__/
│       └── PromptCard.test.tsx
├── app/
│   └── prompts/
│       ├── page.tsx
│       └── __tests__/
│           └── page.test.tsx
```

### Test File Naming

- Component: `ComponentName.test.tsx`
- Page: `page.test.tsx`
- Hook: `useHookName.test.ts`
- Utility: `utility-name.test.ts`

---

## Basic Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from '@/components/ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    await userEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Testing Patterns

### 1. Rendering Tests

**Test that component renders correctly:**
```typescript
it('renders title and description', () => {
  const prompt = {
    title: 'Test Prompt',
    description: 'Test Description',
  };

  render(<PromptCard prompt={prompt} />);

  expect(screen.getByText('Test Prompt')).toBeInTheDocument();
  expect(screen.getByText('Test Description')).toBeInTheDocument();
});
```

### 2. Props Tests

**Test component behavior with different props:**
```typescript
it('handles optional props', () => {
  render(<PromptCard prompt={prompt} showStats={false} />);
  expect(screen.queryByText('Views')).not.toBeInTheDocument();
});

it('handles missing props gracefully', () => {
  render(<PromptCard prompt={prompt} />);
  expect(screen.getByText('No description')).toBeInTheDocument();
});
```

### 3. User Interaction Tests

**Test user interactions:**
```typescript
import userEvent from '@testing-library/user-event';

it('calls onClick when button is clicked', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(<Button onClick={handleClick}>Click me</Button>);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 4. Async Behavior Tests

**Test loading states and async operations:**
```typescript
it('shows loading state', () => {
  render(<Component isLoading={true} />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('handles async data loading', async () => {
  const mockData = { id: '1', name: 'Test' };
  
  vi.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => mockData,
  } as Response);

  render(<Component />);
  
  expect(await screen.findByText('Test')).toBeInTheDocument();
});
```

### 5. Error State Tests

**Test error handling:**
```typescript
it('displays error message', () => {
  render(<Component error="Something went wrong" />);
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

it('handles API errors gracefully', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

  render(<Component />);
  
  expect(await screen.findByText(/network error/i)).toBeInTheDocument();
});
```

### 6. Accessibility Tests

**Test accessibility:**
```typescript
it('has proper ARIA labels', () => {
  render(<Button aria-label="Close dialog">X</Button>);
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
});

it('is keyboard accessible', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();
  
  render(<Button onClick={handleClick}>Submit</Button>);
  
  const button = screen.getByRole('button');
  button.focus();
  await user.keyboard('{Enter}');
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

---

## Server Component Testing

**Server Components require different approach:**

```typescript
import { render } from '@testing-library/react';
import { PromptPage } from '@/app/prompts/page';

// Mock data fetching
vi.mock('@/lib/db', () => ({
  fetchPrompts: vi.fn().mockResolvedValue([
    { id: '1', title: 'Test Prompt' },
  ]),
}));

it('renders prompts from database', async () => {
  const page = await PromptPage();
  render(page);
  
  expect(await screen.findByText('Test Prompt')).toBeInTheDocument();
});
```

---

## Mocking

### Mock External Dependencies

```typescript
// Mock API calls
vi.mock('@/lib/api', () => ({
  fetchPrompts: vi.fn().mockResolvedValue([]),
}));

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/prompts',
}));

// Mock hooks
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: ['1', '2'],
    toggleFavorite: vi.fn(),
  }),
}));
```

### Mock Components

```typescript
vi.mock('@/components/HeavyComponent', () => ({
  HeavyComponent: () => <div>Mocked Heavy Component</div>,
}));
```

---

## Test Utilities

### Custom Render Function

**Create test utilities for common setup:**

```typescript
// src/test/utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={null}>
      {children}
    </SessionProvider>
  );
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
```

---

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ BAD: Testing implementation details
expect(component.state.isLoading).toBe(true);

// ✅ GOOD: Testing user-visible behavior
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

### 2. Use Semantic Queries

```typescript
// ❌ BAD: Fragile selectors
screen.getByTestId('button-123');

// ✅ GOOD: Semantic queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');
screen.getByText('Welcome back');
```

### 3. Test User Flows

```typescript
it('allows user to favorite a prompt', async () => {
  const user = userEvent.setup();
  const mockToggle = vi.fn();
  
  render(<PromptCard prompt={prompt} onToggleFavorite={mockToggle} />);
  
  const favoriteButton = screen.getByRole('button', { name: /favorite/i });
  await user.click(favoriteButton);
  
  expect(mockToggle).toHaveBeenCalledWith(prompt.id);
});
```

### 4. Keep Tests Focused

```typescript
// ❌ BAD: Testing multiple things
it('renders and handles clicks and errors', () => {
  // Too many assertions
});

// ✅ GOOD: One thing per test
it('renders prompt title', () => {
  // Single assertion
});

it('calls onClick when clicked', () => {
  // Single assertion
});
```

### 5. Use Descriptive Test Names

```typescript
// ❌ BAD: Vague
it('works', () => {});

// ✅ GOOD: Descriptive
it('displays error message when API call fails', () => {});
```

---

## Common Test Scenarios

### Form Components

```typescript
it('submits form with valid data', async () => {
  const user = userEvent.setup();
  const handleSubmit = vi.fn();
  
  render(<Form onSubmit={handleSubmit} />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### List Components

```typescript
it('renders list of items', () => {
  const items = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  render(<ItemList items={items} />);

  expect(screen.getByText('Item 1')).toBeInTheDocument();
  expect(screen.getByText('Item 2')).toBeInTheDocument();
});
```

### Modal Components

```typescript
it('opens and closes modal', async () => {
  const user = userEvent.setup();
  
  render(<ModalTrigger />);
  
  await user.click(screen.getByRole('button', { name: /open modal/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  await user.click(screen.getByRole('button', { name: /close/i }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

---

## Test Coverage Goals

**Current Targets:**
- Components: 50%+ coverage
- Critical paths: 80%+ coverage
- Edge cases: Test all error states

**Priority Order:**
1. User-facing components (high priority)
2. Form components (high priority)
3. Utility components (medium priority)
4. Layout components (low priority)

---

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test PromptCard.test.tsx

# Run tests with coverage
pnpm test:coverage

# Run tests in UI mode
pnpm test:ui
```

---

## CI/CD Integration

**GitHub Actions:**
```yaml
name: Component Tests
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
```

---

## Related Documentation

- [Testing Standards](../../CONTRIBUTING.md#testing-standards)
- [Test Coverage Plan](../testing/TEST_COVERAGE_DAY7.md)
- [Vitest Config](../../vitest.config.ts)

---

**Last Updated:** 2025-11-02  
**Status:** ✅ Documentation complete  
**Next Review:** After implementing tests

