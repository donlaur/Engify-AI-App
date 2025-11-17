# Testing Infrastructure Installation Guide

This guide covers installing and setting up the complete testing infrastructure.

## Prerequisites

- Node.js 18+
- pnpm 8+

## Quick Install

All testing dependencies are already in `package.json`. Just run:

```bash
pnpm install
```

## Mutation Testing Setup

The mutation testing packages need to be installed separately:

```bash
pnpm add -D -w @stryker-mutator/core @stryker-mutator/vitest-runner @stryker-mutator/typescript-checker
```

**Note**: If you encounter workspace errors, this means the packages should be installed at the workspace root level.

## Verification

Verify your installation by running:

```bash
# Run unit tests
pnpm test:run

# Generate coverage report
pnpm test:coverage

# Run mutation tests (after installing Stryker packages)
pnpm test:mutation
```

## Configuration Files

The following configuration files are included:

### vitest.config.ts
Main Vitest configuration with coverage settings and thresholds.

### vitest.coverage.config.ts
Per-directory coverage thresholds for different parts of the codebase.

### stryker.config.json
Mutation testing configuration for Stryker.

### playwright.config.ts
E2E testing configuration for Playwright.

## Directory Structure

```
src/test/
├── setup.ts              # Global test setup
├── utils.tsx             # Test utilities (exports everything)
├── fixtures/             # Test data fixtures
│   ├── index.ts
│   ├── users.ts
│   ├── prompts.ts
│   └── api-responses.ts
├── builders/             # Test data builders
│   ├── index.ts
│   └── TestDataBuilder.ts
├── mocks/                # Mocking utilities
│   ├── index.ts
│   ├── database.ts
│   ├── ai-providers.ts
│   └── http.ts
└── examples/             # Usage examples
    └── comprehensive-test.example.ts
```

## Optional: VS Code Extensions

Install these extensions for better testing experience:

1. **Vitest** - Better test debugging
2. **Error Lens** - Inline test errors
3. **Code Coverage** - Visualize coverage in editor

## Optional: Coverage Badges

To add coverage badges to your README:

1. Set up [Codecov](https://codecov.io/) or [Coveralls](https://coveralls.io/)
2. Add badge to README:

```markdown
[![Coverage](https://codecov.io/gh/donlaur/Engify-AI-App/branch/main/graph/badge.svg)](https://codecov.io/gh/donlaur/Engify-AI-App)
```

## CI/CD Integration

### GitHub Actions

Example workflow (`.github/workflows/test.yml`):

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:run

      - name: Generate coverage
        run: pnpm test:coverage:ci

      - name: Check coverage thresholds
        run: pnpm test:coverage:threshold

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  mutation:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Run mutation tests
        run: pnpm test:mutation:ci
```

## Troubleshooting

### Issue: `pnpm add` fails with workspace errors

**Solution**: Use the `-w` flag:
```bash
pnpm add -D -w <package-name>
```

### Issue: Tests fail with "Cannot find module"

**Solution**: Check your `tsconfig.json` paths and ensure `@/` alias is configured in `vitest.config.ts`

### Issue: Coverage not generated

**Solution**: Ensure `@vitest/coverage-v8` is installed:
```bash
pnpm add -D @vitest/coverage-v8
```

### Issue: Mutation tests timeout

**Solution**: Increase timeout in `stryker.config.json`:
```json
{
  "timeoutMS": 120000,
  "timeoutFactor": 2
}
```

### Issue: Out of memory during mutation testing

**Solution**: Increase Node memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 pnpm test:mutation
```

## Next Steps

After installation:

1. Read [Testing Guide](./TESTING_GUIDE.md) for overview
2. Check [Fixtures and Mocks Guide](./FIXTURES_AND_MOCKS.md) for usage
3. Review [Mutation Testing Guide](./MUTATION_TESTING.md) for quality improvement
4. Study examples in `src/test/examples/`
5. Start writing tests!

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the documentation guides
3. Check existing tests for examples
4. Ask in team chat or create an issue

## License

This testing infrastructure is part of the Engify AI Application.
