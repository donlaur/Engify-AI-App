# Testing Guide

## Overview

Comprehensive testing strategy covering unit, integration, and end-to-end tests.

## Test Stack

- **Framework**: Vitest
- **React Testing**: @testing-library/react
- **E2E**: Playwright (planned)
- **Coverage**: v8

## Running Tests

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# Specific file
pnpm test PromptCard

# E2E (planned)
pnpm test:e2e
```

## Test Structure

```
src/
├── components/
│   ├── __tests__/
│   │   └── PromptCard.test.tsx
│   └── PromptCard.tsx
├── lib/
│   ├── __tests__/
│   │   └── utils.test.ts
│   └── utils.ts
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { PromptCard } from '../PromptCard';

describe('PromptCard', () => {
  it('renders prompt title', () => {
    render(<PromptCard title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<PromptCard onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### API Tests

```typescript
import { POST } from '@/app/api/prompts/route';

describe('POST /api/prompts', () => {
  it('creates prompt', async () => {
    const request = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

### Utility Tests

```typescript
import { calculateScore } from '../utils';

describe('calculateScore', () => {
  it('returns correct score', () => {
    expect(calculateScore(90, 80, 85)).toBe(85);
  });

  it('handles edge cases', () => {
    expect(calculateScore(0, 0, 0)).toBe(0);
    expect(calculateScore(100, 100, 100)).toBe(100);
  });
});
```

## Test Coverage

### Current Coverage

- Statements: 75%
- Branches: 70%
- Functions: 80%
- Lines: 75%

### Target Coverage

- Statements: 85%
- Branches: 80%
- Functions: 90%
- Lines: 85%

## Mocking

### API Mocks

```typescript
vi.mock('@/lib/api', () => ({
  fetchPrompts: vi.fn(() => Promise.resolve([])),
}));
```

### Component Mocks

```typescript
vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>
}));
```

## Integration Tests

```typescript
describe('Prompt Flow', () => {
  it('creates and displays prompt', async () => {
    // Create
    await createPrompt({ title: 'Test' });

    // Verify
    const prompts = await getPrompts();
    expect(prompts).toContainEqual(expect.objectContaining({ title: 'Test' }));
  });
});
```

## E2E Tests (Planned)

```typescript
test('user can audit prompt', async ({ page }) => {
  await page.goto('/audit');
  await page.fill('textarea', 'Test prompt');
  await page.click('button:has-text("Audit")');
  await expect(page.locator('.score')).toBeVisible();
});
```

## Performance Tests

```typescript
describe('Performance', () => {
  it('renders 100 prompts quickly', () => {
    const start = performance.now();
    render(<PromptList prompts={generate(100)} />);
    const end = performance.now();
    expect(end - start).toBeLessThan(100); // ms
  });
});
```

## Accessibility Tests

```typescript
import { axe } from 'jest-axe';

it('has no accessibility violations', async () => {
  const { container } = render(<PromptCard />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see/do
   - Avoid testing internal state

2. **Keep Tests Simple**
   - One assertion per test (when possible)
   - Clear test names
   - Minimal setup

3. **Use Factories**
   - Create test data generators
   - Reduce duplication
   - Improve maintainability

4. **Mock Sparingly**
   - Only mock external dependencies
   - Prefer real implementations
   - Document why mocking

5. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Boundary values
   - Loading states

## Debugging Tests

```bash
# Run single test
pnpm test -t "renders prompt title"

# Debug mode
node --inspect-brk node_modules/.bin/vitest

# Update snapshots
pnpm test -u
```

## Common Issues

### Tests Timing Out

- Increase timeout: `{ timeout: 10000 }`
- Check for unresolved promises
- Verify async/await usage

### Flaky Tests

- Add proper waits
- Avoid time-based assertions
- Check for race conditions

### Memory Leaks

- Clean up after tests
- Clear timers/intervals
- Unmount components

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)

---

**Last Updated**: October 2025
