# Testing Documentation

Welcome to the Engify AI Application testing documentation! This directory contains comprehensive guides for writing, running, and maintaining tests.

## 📚 Documentation Index

### [Testing Guide](./TESTING_GUIDE.md)
Complete overview of the testing infrastructure including:
- Test infrastructure setup (Vitest, Playwright, Stryker)
- Running tests and generating coverage
- Coverage gates and thresholds
- CI/CD integration
- Best practices and debugging

**Start here** if you're new to the project or want a complete overview.

### [Fixtures and Mocks Guide](./FIXTURES_AND_MOCKS.md)
Detailed reference for all test utilities:
- User fixtures and factories
- Prompt fixtures and builders
- API response helpers
- Database mocking
- AI provider mocking
- HTTP request mocking
- Practical usage examples

**Use this** as a reference when writing tests.

### [Mutation Testing Guide](./MUTATION_TESTING.md)
Everything about mutation testing with Stryker:
- What is mutation testing and why use it
- Running mutation tests
- Understanding and improving mutation scores
- Configuration and best practices
- Troubleshooting common issues

**Read this** to improve your test quality beyond coverage.

## 🚀 Quick Start

### Run Tests

```bash
# Run all tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage

# Run mutation tests
pnpm test:mutation
```

### Write Your First Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createMockDatabase,
  userFixtures,
  builders,
} from '@/test/utils';
import { UserService } from '../UserService';

describe('UserService', () => {
  const mockDb = createMockDatabase();
  let service: UserService;

  beforeEach(() => {
    service = new UserService(mockDb.collection('users'));
    mockDb.seed('users', [userFixtures.regular()]);
  });

  it('should find user by email', async () => {
    const user = await service.findByEmail('regular@example.com');
    expect(user).toBeDefined();
  });

  it('should create new user', async () => {
    const newUser = builders.user()
      .withEmail('new@example.com')
      .asPro()
      .build();

    const created = await service.create(newUser);
    expect(created.plan).toBe('pro');
  });
});
```

## 📊 Coverage Requirements

### Global Thresholds
- Lines: 70%
- Functions: 70%
- Branches: 65%
- Statements: 70%

### Critical Code (Higher Standards)
- Security (`src/lib/security`): 90%
- Services (`src/lib/services`): 85%
- Repositories (`src/lib/repositories`): 85%
- API Routes (`src/app/api`): 80%

### Mutation Testing
- High: 80%+ (Excellent)
- Low: 60% (Acceptable)
- Break: 50% (Build fails)

## 🛠️ Available Test Utilities

### Fixtures
- `createUser()`, `userFixtures` - User test data
- `createPrompt()`, `promptFixtures` - Prompt test data
- `createSession()` - Session data
- `createSuccessResponse()`, `createErrorResponse()` - API responses

### Builders
- `builders.user()` - Fluent user builder
- `builders.prompt()` - Fluent prompt builder
- `builders.session()` - Fluent session builder

### Mocks
- `createMockDatabase()` - In-memory MongoDB
- `createMockOpenAI()`, `createMockAnthropic()` - AI providers
- `MockFetch`, `createMockNextRequest()` - HTTP mocking

All available from:
```typescript
import { /* anything you need */ } from '@/test/utils';
```

## 📋 Testing Checklist

When writing tests, ensure you:

- [ ] Test the happy path
- [ ] Test error cases
- [ ] Test edge cases (null, undefined, empty, etc.)
- [ ] Test authorization/authentication
- [ ] Use fixtures instead of inline data
- [ ] Mock external dependencies
- [ ] Clean up after each test
- [ ] Write descriptive test names
- [ ] Follow AAA pattern (Arrange, Act, Assert)

## 🎯 Testing Strategy

### Unit Tests (70% of tests)
Test individual functions and classes in isolation.

**Tools**: Vitest + Test Fixtures
**Coverage Target**: 80%+

```typescript
// Example: Testing a utility function
import { formatCurrency } from '@/lib/utils';

it('should format currency correctly', () => {
  expect(formatCurrency(1234.56)).toBe('$1,234.56');
});
```

### Integration Tests (20% of tests)
Test how components work together.

**Tools**: Vitest + Database Mocks
**Coverage Target**: 70%+

```typescript
// Example: Testing service with repository
describe('UserService integration', () => {
  const mockDb = createMockDatabase();
  const repository = new UserRepository(mockDb);
  const service = new UserService(repository);

  it('should create user with validation', async () => {
    const user = await service.createUser({ email: 'test@example.com' });
    expect(user.emailVerified).toBeDefined();
  });
});
```

### E2E Tests (10% of tests)
Test complete user workflows.

**Tools**: Playwright
**Coverage Target**: Critical paths only

```typescript
// Example: Testing user registration flow
test('user can sign up and log in', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'secure-password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 🔄 CI/CD Pipeline

### On Pull Request
```bash
# Run unit tests with coverage
pnpm test:coverage:threshold

# Run incremental mutation tests
pnpm test:mutation:incremental
```

### On Main Branch
```bash
# Full test suite with coverage
pnpm test:coverage:ci

# Full mutation testing
pnpm test:mutation:ci

# E2E tests
pnpm test:e2e
```

### Before Release
```bash
# Complete test verification
pnpm test:run
pnpm test:coverage:threshold
pnpm test:mutation
pnpm test:e2e
```

## 🐛 Debugging Tests

### VS Code Configuration

Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Current Test File",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test", "${file}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Run Specific Tests

```bash
# Run specific file
pnpm test src/lib/services/__tests__/UserService.test.ts

# Run tests matching pattern
pnpm test --grep "UserService"

# Run in watch mode
pnpm test --watch
```

### Common Issues

**Issue**: Tests pass locally but fail in CI
**Solution**: Check for environment-specific code, ensure proper mocking

**Issue**: Flaky tests
**Solution**: Use `pnpm ci:flaky` to detect, avoid time-dependent logic

**Issue**: Slow tests
**Solution**: Use mocks instead of real dependencies, parallelize tests

## 📈 Metrics and Reporting

### Coverage Reports
```bash
# Generate and view coverage report
pnpm test:coverage:report

# Coverage files:
# - coverage/index.html - HTML report
# - coverage/lcov.info - LCOV format for CI
# - coverage/coverage-summary.json - JSON summary
```

### Mutation Testing Reports
```bash
# Run mutation tests and view report
pnpm test:mutation
open reports/mutation/html/index.html
```

### Test Performance
```bash
# Check for slow tests
pnpm test --reporter=verbose

# Run with timing
pnpm test --reporter=default --reporter=json --outputFile=test-results.json
```

## 🔍 Additional Resources

### External Links
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Stryker Mutator](https://stryker-mutator.io/)

### Internal Resources
- [Project README](/README.md)
- [Contributing Guide](/CONTRIBUTING.md)
- [Code Style Guide](/docs/CODE_STYLE.md)

## 💡 Tips and Tricks

### 1. Use Test IDs for Components
```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
const button = screen.getByTestId('submit-button');
```

### 2. Test Custom Hooks
```typescript
import { renderHook } from '@testing-library/react';

it('should use custom hook', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current.value).toBe(expected);
});
```

### 3. Mock Only What You Need
```typescript
// ❌ Don't mock everything
vi.mock('@/lib/utils', () => ({ ...actualUtils, one: mockOne }));

// ✅ Mock specific imports
vi.mock('@/lib/utils', async () => ({
  ...(await vi.importActual('@/lib/utils')),
  specificFunction: vi.fn(),
}));
```

### 4. Use waitFor for Async
```typescript
import { waitFor } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 5. Group Related Tests
```typescript
describe('UserService', () => {
  describe('authentication', () => {
    // Auth tests
  });

  describe('profile management', () => {
    // Profile tests
  });
});
```

## 🤝 Contributing

When adding new test utilities:

1. Add to appropriate file in `src/test/`
2. Export from `src/test/utils.tsx`
3. Document in this guide
4. Add usage examples
5. Update type definitions

## 📝 License

This documentation is part of the Engify AI Application and follows the same license terms.

---

**Questions?** Check the guides above or ask in the team chat.

**Found an issue?** Submit a PR or create an issue on GitHub.

Happy Testing! 🧪
