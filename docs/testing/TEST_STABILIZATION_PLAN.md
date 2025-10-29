# Test Stabilization and Type Hygiene Plan

## Goals

- Reduce TypeScript errors to zero in src and tests.
- Stabilize unit, API-route, e2e, and visual tests with consistent env/mocks.
- Align fixes with existing patterns (Zod schemas, strict types, DI, RBAC, server actions).

## Problem Groups Observed

- TypeScript type errors across events, execution strategies, messaging, repositories, and services.
- Tests failing due to:
  - Missing DOM env (`document is not defined`) for React tests.
  - External deps not mocked (OpenAI, NextAuth, fetch, Mongo, Redis).
  - Env gaps (OPENAI_API_KEY, RAG_API_URL) causing runtime failures.
  - Strategy/determinism assumptions in `ExecutionStrategySystem`.
  - RAG integration tests relying on actual NextAuth/OpenAI.
- ESLint issues (any, non-null assertions, unused vars, missing custom rules), and script-console noise.
- E2E/visual: missing Playwright deps and baselines.

## Guiding Fix Patterns (repo-aligned)

- Type safety: replace any with unknown + narrow via Zod schemas in `src/lib/schemas`.
- DI over statics: prefer `getDb()/getCollection()` helpers and injected repos in services.
- Provider abstraction: mock via `AIProviderFactory` rather than providers directly.
- API routes: Zod-validate, return `{ error }` with status, mock NextAuth and external calls in tests.
- Tests: central test utils for env, mocks, and providers (`src/test/utils.tsx`).
- Lint: add project overrides for scripts/tests; never weaken src rules.

## Phases and Actions

### Phase 1 — Test Environment & Mocks Baseline

- Configure Vitest to use jsdom for React tests; ensure `src/test/setup.ts` sets:
  - `vi.stubGlobal('fetch', vi.fn())` with sane defaults.
  - `process.env` defaults: `OPENAI_API_KEY=''`, `RAG_API_URL='http://localhost:8000'`, `NEXTAUTH_URL='http://localhost:3000'`.
  - Mocks:
    - `next-auth` and `next/server` modules for route tests.
    - `openai` client to return canned responses.
    - RAG endpoint via fetch mock.
- Ensure `vitest.config.ts` uses setupFiles and test environment=jsdom; separate pool for node route tests if needed via `test.match`/projects.

### Phase 2 — Execution Strategy and Provider Factory Fixes

- Export missing types used by context/strategies (`AIRequest`) from `src/lib/execution/interfaces/IExecutionStrategy.ts`.
- Replace instance misuse of `AIProviderFactory.create` with proper static access.
- Align `canHandle` and `selectStrategy` heuristics with tests (urgent→streaming, normal→batch, fallback→hybrid). If deviating, adjust tests to reflect new deterministic rules.

### Phase 3 — Events and Aggregates Types

- Add/ensure `aggregateId`, `aggregateType`, `timestamp`, `version`, `eventId` exist where referenced.
- Change unsafe casts from `IEvent` to specific events using `unknown` first + type guards.
- Make `version` non-readonly where aggregate applies or clone-and-return pattern when evolving.

### Phase 4 — Services and Repositories (DI + Correct Types)

- Services (`ActivityService`, `FavoriteService`, `NotificationService`, etc.):
  - Ensure base service exposes `getCollection()` instead of reading `.collection` directly.
  - Implement missing CRUD methods invoked by tests (`create`, `update`), or adjust tests to use repository directly.
  - Fix Mongo types (ObjectId) and method signatures to match repository interfaces.
- Repositories: align signatures (e.g., `findByRole`, `findByPlan`, `updateLastLogin`) between `IUserRepository` and `UserRepository` or fix consumers to use existing methods.

### Phase 5 — API Route Tests (RAG, Chat, Stats)

- Mock NextAuth import path resolution for Next 15 (`next/server.js`) and provide `auth()` test double.
- RAG tests: mock fetch to python RAG service; validate Zod schemas success and error branches.
- Chat API: mock OpenAI client; exercise path with and without RAG.
- Stats API: reduce timeouts in test; mock `getMongoDb` to simulate slow DB and provide fallback.

### Phase 6 — React Component Tests

- Ensure `renderWithProviders` sets jsdom and wraps with necessary context providers only.
- Fix `document` errors by moving these tests to jsdom environment and avoiding Next server-only imports.
- Update tests to avoid brittle text expectations involving unescaped quotes; use regex or escape utilities.

### Phase 7 — ESLint and Rule Gaps

- Add eslint overrides for `scripts/**` and `tests/**` to allow `no-console` and relax some rules.
- Replace any with unknown + narrow in `src/lib/**` (firewall, response-parser, usage-tracker, messaging queue param types).
- Remove non-null assertions; add checks or invariant guards.
- Address missing custom rules errors (e.g., `engify/no-hardcoded-collections`) via:
  - Install/enable the custom plugin if exists, or
  - Temporarily disable those rules with a targeted override until plugin is available.

### Phase 8 — E2E and Visual Tests

- Add dev dependency: `@playwright/test` and browsers; configure `webServer` to run Next dev or use `next start` with built build.
- Seed minimal data; stub external requests in `tests/e2e` via route interception.
- Establish baseline snapshots for visual tests once pages load; parameterize per theme/breakpoint.

### Phase 9 — CI/Local Consistency

- Unify scripts in `package.json`:
  - `lint`, `typecheck`, `test:unit`, `test:e2e`, `test:visual`, `build`.
  - Ensure `next build` doesn’t skip type/lint in CI (pass `NEXT_TELEMETRY_DISABLED=1`, `NEXT_RUNTIME_CHECKS` if applicable).
- Document required env for tests in `docs/testing/TESTING_STRATEGY.md` and `.env.test.example`.

## Files Likely Touched

- Testing config: `vitest.config.ts`, `tests/e2e/*`, `tests/e2e/visual-regression.test.ts`, `src/test/setup.ts`, `src/test/utils.tsx`.
- Execution: `src/lib/execution/interfaces/IExecutionStrategy.ts`, `src/lib/execution/context/ExecutionContextManager.ts`, `src/lib/execution/strategies/*`.
- Events: `src/lib/events/*`.
- Services: `src/lib/services/*` and any base service class exposing `getCollection`.
- Repos: `src/lib/repositories/**` types and interfaces.
- API routes: `src/app/api/rag/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/stats/route.ts` tests.
- ESLint config and overrides: `.eslintrc.*`.
- E2E config: `playwright.config.ts`.

## Acceptance Criteria

- tsc: 0 errors.
- ESLint: 0 errors (warnings allowed in scripts/tests via overrides).
- Unit tests: pass >95% suites; skipped only for real provider integration without keys.
- API route tests: RAG/Chat/Stats pass with mocks.
- E2E: smoke suite green locally.
- Visual: baselines generated and stable across three breakpoints.

## Initial Execution Todos (no code changes yet)

- setup-tests: Define jsdom setup and global mocks in `src/test/setup.ts` and config.
- exec-strategies-fix: Export types and align strategy selection methods.
- events-type-guards: Add guards and correct event props across `src/lib/events/**`.
- services-di: Ensure services use `getCollection()` and implement missing CRUD used by tests.
- api-tests-mocks: Mock NextAuth/OpenAI/RAG in route tests.
- eslint-overrides: Add overrides for scripts/tests; remove forbidden non-null in src.
- e2e-visual-setup: Install Playwright, seed data, create baselines, stub network.

## Notes on Prior Fix Patterns (commit history cues)

- Prefer adding Zod schemas and exporting types from schema files as single source of truth.
- Use DI containers under `src/lib/di` to inject fakes in tests rather than mutating singletons.
- Replace `any` with `unknown` and assert via type guards before use.
- Avoid direct `.collection` on services; use repository helper methods.

---

## Quality Dashboard (live)

- Unit tests snapshot (2025-10-29 22:24 UTC):
  - **TOTAL: 506 passing, 13 failing** (out of 523 total, 4 skipped)
  - **Test Files: 41 passing, 2 failing** (out of 43 total)

  **All Major Suites Green:**
  - Users API v2: 9/9 passing
  - AI Execute v2: 8/8 passing
  - Header: 6/6 passing
  - Services (Activity, Favorite, Notification): 42/42 passing
  - Execution Strategy System: 13/13 passing ✅
  - RAG Integration: 6/6 passing ✅
  - CQRS V2 suite: 14/14 passing ✅
  - Stats timeouts (API/integration): 3/3 passing ✅
  - Cache System: all tests passing ✅
  - Messaging System: 26/26 passing ✅
  - UsersAPI repository tests: 9/9 passing ✅

### Update Log

- 2025-10-29 21:27 UTC: First reduction; API v2 routes and execute green; services partially green; CQRS suite pending.
- 2025-10-29 21:46 UTC: Services now all green; RAG health nearly green; messaging suite partially green. Next: queue handler metrics and broker stubs.
- 2025-10-29 22:24 UTC: **Major milestone achieved** - Fixed RAG health, CQRS responses, ExecutionStrategy priority/fallback, UsersAPI expectations, Stats timeouts, and Cache refresh. Core suites now 100% passing. 13 remaining failures are mostly E2E/visual (expected).
