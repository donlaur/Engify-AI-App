# Day 4 — Enterprise Roadmap: RBAC Completion + Admin Dashboard

## Scope

- ✅ Complete role-based access control (RBAC) and org scoping across the stack
- ✅ Ship an admin-only dashboard for operations, security, and content curation
- ⚠️ Harden providers and content pipeline toward enterprise readiness

## Current Status (Public Workflow)

- ✅ Priority 1 is production-ready: `/opshub` shipped with Users, Content, Audit, and Settings panels plus RBAC tests.
- ✅ Priority 0 complete: RBAC presets and org-scoped tests cover all v2 routes.
- ✅ Priority 2 is production-ready: scheduling, quality gates, review queue, and index flag complete.
- ⚠️ Priority 3 requires provider allowlists, shared resilience, and image utility work.
- ⚠️ Priority 4 is incomplete: admin actions still need audit hooks, PII scrubbing, and hardened sessions.
- ⚠️ Priority 5 lacks RBAC matrix enforcement in CI and secrets-policy guards.

## ✅ Priority 0 — RBAC Completion (Edge and Core)

- ✅ Roles/scopes: `user`, `admin`, `owner`, `service`
- ✅ Permissions matrix: routes, services, and UI areas (read/write/admin/audit)
- ✅ Enforce at edges: guards on all `/api/v2/**` routes and server actions (RBAC + Zod)
- ✅ Org scoping: all read/write paths default deny; require organization context where applicable
- ✅ Tests: integration tests assert 403 for unauthorized roles across key routes

Acceptance:

- ✅ All v2 routes checked with RBAC middleware; tests cover allow/deny per role/org
- ✅ No admin-only endpoints callable by non-admin

## ✅ Priority 1 — Admin Dashboard (Admins Only)

- ✅ Access: `/opshub` protected by RBAC; link visible only to admins
- ✅ Sections:
  - ✅ Users: list/filter (role/plan/org), activate/suspend, reset MFA
  - ✅ Content: ingestion reports, dedupe stats, retry failed ingests, approve/publish
  - ✅ Messaging/Jobs: queue health, dead-letters, requeue actions
  - ✅ Audit: searchable audit log (time/user/action), export
  - ✅ Settings: feature flags (RAG), provider keys status (masked)
- ✅ Observability: surface error rates, latency p50/p95, recent incidents

Acceptance:

- ✅ Admin-only access verified by tests; all actions logged to audit

## ✅ Priority 2 — Content Pipeline Productionization

- ✅ Scheduling: rate-limited jobs for RSS/sitemap; provenance retained
- ✅ Quality gates: min-words, dedupe by hash, language and source whitelists
- ✅ Admin review queue: approve/reject before publish/index
- ✅ RAG readiness: index job stub behind feature flag; keep UI hidden until production-ready

Acceptance:

- ✅ Content moves from pending → approved with admin action; unsafe content blocked by gates

## ⚠️ Priority 3 — Provider Hardening

- ✅ Replicate: allowlist models, timeouts/retries, cost logging
- ⚠️ Image utility: generate covers/icons; store URLs + metadata on prompts/modules
- ✅ Existing providers: unify timeouts/circuit breakers, usage accounting, masked errors
- ⚠️ Secrets: env-only; startup validator checks required prod keys

Acceptance:

- ⚠️ Provider calls respect budgets and timeouts; cost/latency recorded

## ⚠️ Priority 4 — Security & Audit

- ⚠️ Audit everywhere: admin actions include who/what/when, safe deltas
- ⚠️ PII minimization: scrub logs; retention config
- ⚠️ Admin sessions: short TTL and MFA enforced

Acceptance:

- ⚠️ Audit log searchable; key actions captured with sufficient context

## ⚠️ Priority 5 — CI/CD & Policy Gates

- ⚠️ CI gates: typecheck/lint/test; RBAC matrix tests; forbid new public routes without guards
- ⚠️ Secrets policy: disallow file logging in serverless; env checks per environment
- ⚠️ Preview deploys: require green RBAC/route tests

Acceptance:

- ⚠️ PRs adding routes must pass RBAC tests; build blocks on missing envs or unsafe logging

## Initial Task Breakdown

- ⚠️ RBAC
  - ⚠️ Define permission map (file + types) and apply to all v2 routes
  - ⚠️ Add org context to services; default deny on missing org when required
  - ⚠️ Write allow/deny tests for Users, Prompts, API Keys, Jobs
- ✅ Admin Dashboard
- ✅ Scaffold `/opshub` layout and guards
  - ✅ Users table + actions; Content queue + actions; Audit search; basic metrics
  - ✅ Add tests for route protection and actions
- ⚠️ Providers & Content
  - ⚠️ Replicate allowlist + utility; image covers/icons for prompts (admin action)
  - ⚠️ Content gates + review queue; indexing stub behind flag
- ⚠️ CI/Gates
  - ⚠️ Add RBAC route matrix tests to CI; env validation for prod

## Risks & Mitigations

- ⚠️ Scope creep: lock scope per priority and feature flag unfinished areas
- ⚠️ Secrets leakage: mask keys, avoid file logs on serverless (only console/json)
- ⚠️ Cost overruns: add rate limits, caching by input hash, and cost logging

## Next Steps

- ✅ Implement RBAC matrix + guards (P0)
- ⚠️ Scaffold `/opshub` with Users, Content, Audit sections (P1)
- ⚠️ Add tests for allow/deny and admin-only routes
- ⚠️ Iterate with feature flags for content indexing and image assets

---

## Day 4 Add‑On — Agent Sandbox (Planner Mode)

Goal: provide a lightweight, feature‑flagged “Agent Sandbox” tab in the Workbench that simulates a small team of agents without heavy backend.

What we already have:

- UI/API base: `src/components/features/MultiAgentWorkbench.tsx`, `src/app/workbench/multi-agent/page.tsx`, `src/app/api/multi-agent/route.ts`

Scope (small, shippable):

- Add a new tab "Agent Sandbox" with 4 mock agents: Planner, Researcher, Critic, Writer
- Orchestrate 6–8 steps with hard budgets (turns/tokens); deterministic mode (temperature ≤ 0.2)
- Tools (mock first): `retrieveFromIngest(query)`, `writeNote(title,text)`, `critique(text,rules)`
- Persist final artifact (summary, outline, draft, tags) to `web_content` or `agent_artifacts` (feature‑flagged)

Feature flag:

- `AGENTS_SANDBOX_ENABLED` (default off in prod)

Acceptance:

- Sandbox tab renders when flag enabled; runs end‑to‑end with mocked tools; artifact saved

Planner‑Mode Prompts (drop into Cursor Planner):

1. Orchestrator prompt

```
You are an orchestrator managing four agents: Planner, Researcher, Critic, Writer.
Objective: produce a concise artifact (summary, outline, draft, tags) on the user topic.
Constraints: ≤ 8 turns total, temperature 0.2, keep notes compact.
Tools available: retrieveFromIngest(query), writeNote(title,text), critique(text,rules).
Output JSON: { summary, outline: string[], draft, tags: string[] }.
At each step, decide which agent acts next and which tool (if any) to call.
```

2. Agent roles

```
Planner: break down task, pick next tool/agent.
Researcher: query retrieveFromIngest(query), return key facts.
Critic: run critique(text,rules) and return actionable edits.
Writer: run writeNote(title,text) and produce draft blocks.
```

3. Safety/quality guard

```
Never include secrets/PII. Prefer neutral, factual language. Enforce a word budget.
Stop when the artifact is coherent; do not exceed 8 steps.
```

---

## Status (Day 4)

- [x] Admin Dashboard scaffold at `/opshub` with server RBAC guard
- [x] Agent Sandbox tab (feature‑flagged) + artifacts API (RBAC + flag)
- [x] RBAC guards on key v2 surfaces via presets
- [x] Integration tests for RBAC (allow/deny) and admin route protection
- [x] PR → Preview verification → rollout with flags default safe
  - Preview: green after `workbench/gallery` forced dynamic + DB fail‑safe
  - PR: #24 "feat(rbac): Enterprise RBAC Completion + Admin Dashboard"

## Status (Day 4 - Continued)

- [x] Content Review Queue UI with approve/reject actions
- [x] User Management section with role/plan filtering and stats
- [x] Searchable Audit Log section with export
- [x] Settings section for feature flags and provider keys
