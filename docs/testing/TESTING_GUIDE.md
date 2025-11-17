# Testing Guide

Comprehensive guide to testing in the Engify AI Application.

## Table of Contents

- [Overview](#overview)
- [Test Infrastructure](#test-infrastructure)
- [Coverage Gates](#coverage-gates)
- [Mutation Testing](#mutation-testing)
- [Test Fixtures & Factories](#test-fixtures--factories)
- [Mocking Utilities](#mocking-utilities)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Our testing infrastructure uses:

- **Vitest** - Fast unit test runner with native TypeScript support
- **Testing Library** - Component testing utilities
- **Playwright** - E2E testing
- **Stryker** - Mutation testing framework
- **V8** - Code coverage provider

## Test Infrastructure

### Running Tests

```bash
# Run all tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run unit tests only
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run with UI
pnpm test:ui

# Run security-critical tests
pnpm test:security
```

### Coverage Commands

```bash
# Generate coverage report
pnpm test:coverage

# Enforce coverage thresholds (fails if not met)
pnpm test:coverage:threshold

# Generate coverage for CI (lcov + json-summary)
pnpm test:coverage:ci

# Generate and open coverage report in browser
pnpm test:coverage:report
```

## Coverage Gates

### Global Thresholds

We enforce minimum coverage thresholds across the codebase:

- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 65%
- **Statements**: 70%

### Per-Directory Thresholds

Critical paths require higher coverage:

| Directory | Lines | Functions | Branches | Statements |
|-----------|-------|-----------|----------|------------|
| `src/lib/services` | 85% | 85% | 80% | 85% |
| `src/lib/repositories` | 85% | 85% | 80% | 85% |
| `src/lib/security` | 90% | 90% | 85% | 90% |
| `src/app/api` | 80% | 80% | 75% | 80% |
| `src/lib/utils` | 80% | 80% | 75% | 80% |
| `src/lib/cache` | 80% | 80% | 75% | 80% |
| `src/components` | 65% | 65% | 60% | 65% |

### Critical Files (100% Coverage Required)

These files handle security and critical functionality:

- `src/lib/security/sanitizer.ts`
- `src/lib/logging/sanitizer.ts`
- `src/lib/utils/validation.ts`
- `src/lib/security/piiRedaction.ts`

### Configuration

Coverage configuration is defined in:

- `vitest.config.ts` - Main coverage settings
- `vitest.coverage.config.ts` - Per-directory thresholds

## Mutation Testing

Mutation testing verifies the quality of your tests by introducing small code changes (mutations) and checking if tests catch them.

### Running Mutation Tests

```bash
# Run all mutation tests
pnpm test:mutation

# Run mutation tests (CI mode - single concurrency)
pnpm test:mutation:ci

# Run incremental mutation tests (only changed files)
pnpm test:mutation:incremental

# Test specific directories
pnpm test:mutation:services
pnpm test:mutation:critical
```

### Mutation Score Thresholds

- **High**: 80%+ (Excellent test quality)
- **Low**: 60% (Minimum acceptable)
- **Break**: 50% (Build fails)

### Configuration

Mutation testing is configured in `stryker.config.json`.

### Understanding Results

The mutation report shows:

- **Killed** ✅ - Test caught the mutation (good!)
- **Survived** ❌ - Mutation wasn't detected (needs better tests)
- **No Coverage** ⚠️ - Code has no tests
- **Timeout** ⏱️ - Tests took too long

## Test Fixtures & Factories

We provide comprehensive test fixtures and factories for creating test data.

### User Fixtures

```typescript
import { createUser, userFixtures, builders } from '@/test/utils';

// Simple factory
const user = createUser({ role: 'admin' });

// Multiple users
const users = createUsers(5, { plan: 'pro' });

// Pre-defined fixtures
const admin = userFixtures.admin();
const superAdmin = userFixtures.superAdmin();
const regular = userFixtures.regular();

// Fluent builder API
const customUser = builders.user()
  .withEmail('test@example.com')
  .withRole('admin')
  .withPlan('enterprise')
  .verified()
  .build();
```

### Prompt Fixtures

```typescript
import { createPrompt, promptFixtures, builders } from '@/test/utils';

// Simple factory
const prompt = createPrompt({ category: 'coding' });

// Pre-defined fixtures
const codingPrompt = promptFixtures.coding();
const writingPrompt = promptFixtures.writing();

// Builder API
const customPrompt = builders.prompt()
  .withTitle('My Prompt')
  .withCategory('coding')
  .withTags('typescript', 'testing')
  .featured()
  .popular()
  .build();
```

### API Response Fixtures

```typescript
import {
  createSuccessResponse,
  createErrorResponse,
  errorFixtures,
  MockResponse,
} from '@/test/utils';

// Success response
const response = createSuccessResponse({ id: '123', name: 'Test' });

// Error responses
const notFound = errorFixtures.notFound();
const unauthorized = errorFixtures.unauthorized();

// Mock HTTP responses
const mockResp = MockResponse.success({ data: 'test' });
const errorResp = MockResponse.notFound();
```

### Session Fixtures

```typescript
import { createSession, builders } from '@/test/utils';

// Simple session
const session = createSession({ role: 'admin' });

// Builder API
const adminSession = builders.session()
  .asAdmin()
  .withExpiry(24)
  .build();
```

## Mocking Utilities

### Database Mocking

```typescript
import { createMockDatabase, InMemoryDatabase } from '@/test/utils';

describe('UserService', () => {
  const mockDb = createMockDatabase();

  beforeEach(() => {
    // Seed test data
    mockDb.seed('users', [
      { _id: '1', email: 'test@example.com', role: 'user' },
    ]);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  it('should find user', async () => {
    const collection = mockDb.collection('users');
    const user = await collection.findOne({ _id: '1' });
    expect(user).toBeDefined();
  });
});
```

### AI Provider Mocking

```typescript
import {
  createMockOpenAI,
  createMockAnthropic,
  aiErrors,
} from '@/test/utils';

// Mock successful response
const openai = createMockOpenAI({
  response: 'Test AI response',
});

// Mock streaming response
const streamingAI = createMockOpenAI({
  response: 'Test streaming response',
  streaming: true,
});

// Mock error
const errorAI = createMockOpenAI({
  error: aiErrors.rateLimited(),
});
```

### HTTP Request Mocking

```typescript
import {
  createMockNextRequest,
  RequestBuilder,
  MockFetch,
  requestScenarios,
} from '@/test/utils';

// Create mock request
const request = createMockNextRequest({
  url: 'http://localhost:3000/api/test',
  method: 'POST',
  body: { data: 'test' },
});

// Use request builder
const authRequest = new RequestBuilder()
  .withUrl('/api/users')
  .asPost()
  .withAuth('token-123')
  .withBody({ name: 'Test' })
  .build();

// Common scenarios
const authenticated = requestScenarios.authenticated('my-token').build();
const withJson = requestScenarios.withJson({ data: 'test' }).build();

// Mock fetch
const mockFetch = new MockFetch()
  .onJson(/api\/users/, { users: [] })
  .onError(/api\/error/, 'ERROR', 'Something failed', 500)
  .build();

global.fetch = mockFetch;
```

## Best Practices

### 1. Use Descriptive Test Names

```typescript
// ❌ Bad
it('works', () => {});

// ✅ Good
it('should return 401 when user is not authenticated', () => {});
```

### 2. Follow AAA Pattern

```typescript
it('should create user successfully', async () => {
  // Arrange
  const userData = createUser({ email: 'test@example.com' });

  // Act
  const result = await userService.create(userData);

  // Assert
  expect(result.email).toBe('test@example.com');
});
```

### 3. Use Fixtures Over Inline Data

```typescript
// ❌ Bad
const user = {
  id: '123',
  email: 'test@example.com',
  role: 'admin',
  // ... many more fields
};

// ✅ Good
const user = userFixtures.admin();
```

### 4. Test Edge Cases

```typescript
describe('divide', () => {
  it('should divide two numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  it('should throw error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  it('should handle negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });
});
```

### 5. Isolate Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockDb: ReturnType<typeof createMockDatabase>;

  beforeEach(() => {
    mockDb = createMockDatabase();
    service = new UserService(mockDb);
  });

  afterEach(() => {
    mockDb.clearAll();
  });

  // Each test is isolated
});
```

### 6. Use Builders for Complex Data

```typescript
// ❌ Bad - hard to maintain
const prompt = {
  title: 'Test',
  description: 'Desc',
  content: 'Content',
  category: 'coding',
  tags: ['test'],
  status: 'published',
  featured: true,
  rating: 4.5,
  // ... many more fields
};

// ✅ Good - clear and maintainable
const prompt = builders.prompt()
  .withTitle('Test')
  .withCategory('coding')
  .featured()
  .popular()
  .build();
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests with coverage
        run: pnpm test:coverage:ci

      - name: Check coverage thresholds
        run: pnpm test:coverage:threshold

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  mutation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run mutation tests
        run: pnpm test:mutation:ci
```

### Coverage Badges

Add to README:

```markdown
[![Coverage](https://img.shields.io/codecov/c/github/donlaur/Engify-AI-App)](https://codecov.io/gh/donlaur/Engify-AI-App)
[![Mutation Score](https://img.shields.io/badge/mutation-80%25-brightgreen)]()
```

## Debugging Tests

### Run Specific Tests

```bash
# Run tests in a specific file
pnpm test src/lib/services/__tests__/UserService.test.ts

# Run tests matching pattern
pnpm test --grep "UserService"

# Run in watch mode
pnpm test --watch
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "pnpm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Stryker Mutator](https://stryker-mutator.io/)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)
