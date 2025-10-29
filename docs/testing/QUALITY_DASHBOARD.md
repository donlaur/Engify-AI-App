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
- 2025-10-29 21:27 UTC: Unit tests snapshot
  - Users API v2: 9/9 passing
  - AI Execute v2: 8/8 passing
  - Header: 5/6 passing
  - Services
    - ActivityService: 8/13 passing (5 failing)
    - FavoriteService: 9/14 passing (5 failing)
    - NotificationService: 10/15 passing (5 failing)
  - Execution Strategy System: 10/13 passing (3 failing)
  - RAG Integration: 4/6 passing (2 failing; health invert)
  - CQRS V2 suite: 0/14 passing (pending reset shim)
  - Stats timeouts (API/integration): 0/2 passing (both timeouts)

Notes:

- TypeScript and ESLint counts will be recomputed after service/CQRS fixes.
