# Testing Strategy and Methodology

Purpose: Document how we test Engify.ai to improve reliability, prevent regressions, and continuously improve AI context quality.

---

## Testing Pillars

- Unit tests: Pure functions, services, adapters, utilities. Fast, isolated, deterministic.
- Integration tests: Repository, service boundaries, API route contracts with in-memory or test DB.
- Smoke tests: Minimal happy-path checks after deploy (health, key APIs respond 200, basic UI renders).
- Regression tests: Lock in previously fixed issues and critical flows (auth, RBAC, AI execution core, RAG search).
- End-to-End (roadmap): Playwright-based flows for signup/login, API key management, AI execute, RAG query.
- Coverage: Target 70%+ on critical libs and routes; measured per package via Vitest.
- Pre-commit and CI gates: Schema/security drift checks, lint/typecheck, minimal smoke suite on PRs.

---

## Tooling

- Test runner: Vitest (unit/integration)
- Component testing: React Testing Library (where client components exist)
- E2E (roadmap): Playwright
- Coverage: Vitest coverage (c8) with thresholds on critical packages
- Lint/Typecheck: ESLint + TypeScript strict mode
- Security: repo scripts under `scripts/security/` for unsafe patterns, data isolation checks

---

## How We Test

### 1) Unit Tests

- Focus: deterministic logic in `src/lib/**`, `src/utils/**` and adapters (e.g., caching, AI strategy selection, CQRS handlers, parsers).
- Pattern: Arrange–Act–Assert with precise inputs/outputs; no external I/O.
- Examples: `src/lib/execution/**` strategies, `src/lib/utils/**`, parsers (email, prompt), permission utils.

Run:

```bash
npm run test:unit
```

### 2) Integration Tests

- Focus: boundaries and contracts (repositories, services, API route handlers via Next.js request mocks).
- DB: prefer in-memory/test containers; otherwise mock collections with realistic shapes.
- Include: RBAC guards on routes, Zod validation behavior, error handling paths.

Run:

```bash
npm run test:integration
```

### 3) Smoke Tests (Post-Deploy / CI Lightweight)

- Purpose: verify the system boots and critical endpoints respond.
- Checks:
  - `/api/health` status ok or degraded (not error)
  - `/api/v2/ai/execute?action=health` or internal strategy health returns ok
  - Webhooks respond 200 to signature-verified noop payload

Run (local/CI):

```bash
npm run test:smoke
```

### 4) Regression Tests

- Add tests whenever we fix a bug or harden a route.
- Current focus areas:
  - RBAC enforcement on v2 routes and prompts write/delete
  - Zod validation error paths returning `{ error }` consistently
  - AI execution selection logic (strategy factory, cache vs streaming)
  - RAG service unavailability (503 handling)

Run:

```bash
npm run test:regression
```

### 5) End-to-End (Roadmap)

- Tool: Playwright (already configured in repo)
- Initial flows:
  - Request Access gate flow (public → form → API receives and validates)
  - Auth flows (login, MFA enable/verify/disable)
  - User settings: API key add/list/rotate/revoke
  - Workbench: basic AI execute, RAG search and render

Run (future):

```bash
npm run test:e2e
```

---

## Coverage Strategy

- Measure: `vitest --coverage`
- Thresholds (initial):
  - Critical libraries and route helpers: 70% lines/branches
  - Non-critical UI: best effort; snapshot tests avoided for flakiness
- Reports: text summary in CI logs; optional HTML locally

Run:

```bash
npm run test:coverage
```

---

## Pre-Commit and CI Gates

- Type safety: `npm run type-check` (or `tsc --noEmit`), required to pass before merge
- Linting/formatting: `npm run lint`
- Security/Isolation checks: `scripts/security/security-check.js` (blocks missing `organizationId` where required, flags unsafe patterns like `eval`, `dangerouslySetInnerHTML` outside allowed files)
- Schema/data rules: `scripts/maintenance/validate-schema.js` (ensures user/org scoping rules; skips known system-wide jobs with inline annotations)
- Secrets scan: optional local hint; CI to integrate TruffleHog/Snyk (planned)

Local pre-commit runs a subset. CI runs extended checks on PRs.

---

## AI-Specific Testing

We test to improve AI context quality and reliability:

- Prompt regression tests: lock prompt templates and expected behaviors for core strategies; detect accidental wording/regression changes.
- Cost/usage accounting: `ApiKeyUsageService` tracked fields validated in unit/integration tests.
- Provider routing: AIProviderFactory and strategy selection covered with unit tests for routing rules (model availability, streaming, batch).
- RAG quality harness (roadmap): offline golden set queries with expected doc IDs/titles and minimum score thresholds.
- Safety and failure mode tests: ensure generic error responses, internal logging with `logger.apiError`, and no info leaks.

---

## How to Run Tests Locally

```bash
# fast feedback
npm run test

# watch mode
npm run test:watch

# coverage report
npm run test:coverage

# smoke tests (quick CI/local check)
npm run test:smoke
```

Note: some scripts are aliases to Vitest. If not present in `package.json`, use:

```bash
npx vitest
npx vitest --coverage
```

---

## Data and Environment Considerations

- Tests must not use production data; use test DBs or mocks.
- External services (OpenAI, Anthropic, Google AI, Twilio, SendGrid): mock at boundaries; never call in unit tests; integration uses fakes.
- Secrets: load via environment (or fixtures), never commit.

---

## Governance and Roadmap

- Expand coverage in `src/lib/**`, `src/app/api/**` for RBAC and Zod validations.
- Add Playwright E2E suite for top user journeys.
- Integrate coverage thresholds in CI to prevent regressions.
- Add SIEM-friendly JSON logs in test runs for incident exercises (future).

This strategy aims to keep velocity while improving correctness and AI-oriented quality signals.
