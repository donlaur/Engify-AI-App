## Quality Dashboard

Goal for all metrics: 0

### Current Metrics (2025-10-29)

- TypeScript compile errors (tsc): 743
- ESLint: 188 errors, 265 warnings
- Unit tests: failing suites present
- E2E (Playwright): not installed
- Visual tests: baselines pending

### How to Recompute Locally

```bash
# TypeScript errors
npx tsc --noEmit --pretty false | grep -c "error TS"

# ESLint full scan (json output if needed)
npx eslint . --ext .ts,.tsx --max-warnings 0

# Unit tests
npm run test:unit

# Build (prod parity)
npm run build:prod

# E2E (after Playwright is installed and configured)
npm run test:e2e

# Visual tests (after baselines exist)
npm run test:visual
```

### Update Log

- 2025-10-29: Initialized dashboard (tsc=743; eslint=188 errors/265 warnings; e2e not installed; visual pending)
