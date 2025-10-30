# Day 4 — Enterprise Roadmap: RBAC Completion + Admin Dashboard

## Scope

- Complete role-based access control (RBAC) and org scoping across the stack
- Ship an admin-only dashboard for operations, security, and content curation
- Harden providers and content pipeline toward enterprise readiness

## Priority 0 — RBAC Completion (Edge and Core)

- Roles/scopes: `user`, `admin`, `owner`, `service`
- Permissions matrix: routes, services, and UI areas (read/write/admin/audit)
- Enforce at edges: guards on all `/api/v2/**` routes and server actions (RBAC + Zod)
- Org scoping: all read/write paths default deny; require organization context where applicable
- Tests: integration tests assert 403 for unauthorized roles across key routes

Acceptance:

- All v2 routes checked with RBAC middleware; tests cover allow/deny per role/org
- No admin-only endpoints callable by non-admin

## Priority 1 — Admin Dashboard (Admins Only)

- Access: `/admin` protected by RBAC; link visible only to admins
- Sections:
  - Users: list/filter (role/plan/org), activate/suspend, reset MFA
  - Content: ingestion reports, dedupe stats, retry failed ingests, approve/publish
  - Messaging/Jobs: queue health, dead-letters, requeue actions
  - Audit: searchable audit log (time/user/action), export
  - Settings: feature flags (RAG), provider keys status (masked)
- Observability: surface error rates, latency p50/p95, recent incidents

Acceptance:

- Admin-only access verified by tests; all actions logged to audit

## Priority 2 — Content Pipeline Productionization

- Scheduling: rate-limited jobs for RSS/sitemap; provenance retained
- Quality gates: min-words, dedupe by hash, language and source whitelists
- Admin review queue: approve/reject before publish/index
- RAG readiness: index job stub behind feature flag; keep UI hidden until production-ready

Acceptance:

- Content moves from pending → approved with admin action; unsafe content blocked by gates

## Priority 3 — Provider Hardening

- Replicate: allowlist models, timeouts/retries, cost logging
- Image utility: generate covers/icons; store URLs + metadata on prompts/modules
- Existing providers: unify timeouts/circuit breakers, usage accounting, masked errors
- Secrets: env-only; startup validator checks required prod keys

Acceptance:

- Provider calls respect budgets and timeouts; cost/latency recorded

## Priority 4 — Security & Audit

- Audit everywhere: admin actions include who/what/when, safe deltas
- PII minimization: scrub logs; retention config
- Admin sessions: short TTL and MFA enforced

Acceptance:

- Audit log searchable; key actions captured with sufficient context

## Priority 5 — CI/CD & Policy Gates

- CI gates: typecheck/lint/test; RBAC matrix tests; forbid new public routes without guards
- Secrets policy: disallow file logging in serverless; env checks per environment
- Preview deploys: require green RBAC/route tests

Acceptance:

- PRs adding routes must pass RBAC tests; build blocks on missing envs or unsafe logging

## Initial Task Breakdown

- RBAC
  - Define permission map (file + types) and apply to all v2 routes
  - Add org context to services; default deny on missing org when required
  - Write allow/deny tests for Users, Prompts, API Keys, Jobs
- Admin Dashboard
  - Scaffold `/admin` layout and guards
  - Users table + actions; Content queue + actions; Audit search; basic metrics
  - Add tests for route protection and actions
- Providers & Content
  - Replicate allowlist + utility; image covers/icons for prompts (admin action)
  - Content gates + review queue; indexing stub behind flag
- CI/Gates
  - Add RBAC route matrix tests to CI; env validation for prod

## Risks & Mitigations

- Scope creep: lock scope per priority and feature flag unfinished areas
- Secrets leakage: mask keys, avoid file logs on serverless (only console/json)
- Cost overruns: add rate limits, caching by input hash, and cost logging

## Next Steps

- Implement RBAC matrix + guards (P0)
- Scaffold `/admin` with Users, Content, Audit sections (P1)
- Add tests for allow/deny and admin-only routes
- Iterate with feature flags for content indexing and image assets
