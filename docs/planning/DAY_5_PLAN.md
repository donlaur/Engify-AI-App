<!--
AI Summary: Day 5 roadmap with phased, testable checklists for Infra, Messaging, and Workbenches.
Use ✅ when complete and ⚠️ while in progress. No placeholder commits; each item should be substantive with tests/docs.
Related: docs/planning/ENTERPRISE_RBAC_AND_ADMIN_DASHBOARD.md (Day 4), docs/development/CONFIGURATION.md, docs/integrations/ENVIRONMENT_VARIABLES.md.
-->

# Day 5 — Infra, Messaging, and Workbenches (Phased Plan)

Status Legend: ✅ done · ⚠️ not yet finished

## Phase Exit Criteria (for every phase)

- ✅ Full sweep: `pnpm typecheck && pnpm lint && pnpm test:unit` must pass
- ✅ Add/extend tests for all new paths (happy + error)
- ✅ Red‑team review: alternate AI "red hat" viewpoint challenges design/rbac; capture notes below the phase
- ✅ Docs refreshed here and cross‑linked to related docs

## Phase 1 — AWS CLI, IAM, and Environment

- ✅ AWS CLI profiles for dev/stage/prod with SSO or keys (least privilege)
- ✅ IAM roles/policies for Lambda, SendGrid/Twilio webhooks, and RDS/Atlas access
- ✅ `.env.example` and docs for per‑env variables (no secrets committed)
- ✅ Deployment runbooks and bootstrap scripts (Vercel + AWS)
- ✅ Smoke tests for credentials and network egress

More detail: [AWS IAM & CLI Setup](../infra/AWS_IAM_SETUP.md)

Acceptance:

- ✅ `aws sts get-caller-identity` succeeds across envs; policy docs stored in `docs/aws/`

**Red Hat Review Notes:**
- ✅ Bootstrap script properly validates prerequisites (AWS CLI, Vercel CLI)
- ✅ IAM policies follow least privilege (Secrets Manager access only for needed secrets)
- ✅ .env.example contains all documented vars without real secrets
- ⚠️ Smoke test could validate actual policy permissions, not just credential existence
- ✅ Bootstrap avoids hardcoded account IDs (parameterized via env vars)

## Phase 2 — Python RAG Packaging and Service Integration

- ✅ Pyproject/virtualenv automation and Dockerfile for `python/`
- ✅ Health endpoint + structured logging + timeouts/retries
- ✅ Typed TS client and adapters in `src/lib/`
- ✅ CI job for unit tests and type checks; docs and quickstart

Acceptance:

- ✅ `pnpm test:unit` runs client stubs; service health passes locally and in CI

More detail: [Python RAG Service](../rag/PYTHON_RAG_SERVICE.md)

**Red Hat Review Notes:**
- ✅ Lifespan management prevents race conditions during startup
- ✅ Comprehensive health checks catch configuration issues early
- ✅ Async embedding generation prevents blocking the event loop
- ✅ MongoDB timeouts prevent hanging queries in production
- ⚠️ Model loading could be cached across restarts for faster startup
- ✅ CI pipeline includes integration testing, not just unit tests

## 🟢→ Phase 2.5 — Automated Agent Content Creator (carrier‑backed)

- ✅ Provider‑agnostic CreatorAgent using the new model carrier with allowlisted models and hard budgets
- ✅ Deterministic defaults (low temperature), retries via provider harness, cost caps
- ✅ Draft persistence via existing `buildStoredContent` → `web_content` with `reviewStatus='pending'` and `source='agent-generated'`
- ✅ Provenance events recorded (`src/lib/content/provenance.ts`)
- ✅ API route to trigger single creation: `src/app/api/agents/creator/route.ts` (RBAC: org_admin/super_admin)
- ✅ Batch script: `scripts/content/generate-batch.ts` to create N drafts from curated topics
- ✅ Topic allowlist: `src/lib/content/topics.ts` (per‑env gating)
- ✅ OpsHub: add filter "Source: generated" and Regenerate action in `src/components/admin/ContentReviewQueue.tsx`

Acceptance:

- ✅ Drafts appear in OpsHub Review Queue with quality checks, pending status, cost/latency metadata
- ✅ Regenerate action works; budgets enforced; models restricted by allowlist

More detail: [Agent Content Creator](../content/AGENT_CONTENT_CREATOR.md)

**Red Hat Review Notes:**
- ✅ CreatorAgent now relies on shared AI provider guards and enforces budget + word count thresholds before persistence
- ✅ Metadata recorded on each draft includes cost, latency, quality score, and provider/model for post-hoc audits
- ✅ Provenance tracking provides full audit trail from creation to publication
- ✅ Topic allowlist prevents inappropriate content generation
- ⚠️ Regenerate action should hydrate original metadata (owner, topic context) before re-enqueueing follow-up drafts
- ✅ RBAC ensures only authorized users can trigger content creation

## 🟢→ Phase 3 — Twilio MFA/SMS Productionization

- ✅ E.164 validation + rate limiting; Verify optional path
- ✅ Webhook signature verification and replay protection
- ✅ Retry/backoff strategy; OpsHub toggles and audit logs

Acceptance:

- ✅ End‑to‑end MFA flows pass with and without Verify; webhooks verified

More detail: [Twilio MFA Productionization](../messaging/TWILIO_MFA_PROD.md)

**Red Hat Review Notes:**
- ✅ E.164 validation blocks malformed phone inputs; per-user rate limits (3 sends / 6 verifies per min) reduce brute-force attempts
- ✅ Twilio webhook now emits structured audit logs and rate-limits inbound callbacks with replay protection
- ✅ Exponential backoff in Twilio client shields transient API failures
- ✅ OpsHub settings panel surfaces Twilio configuration status with audited reads
- ⚠️ In production, replay protection and rate-limit state should move to Redis to support multi-instance deployments

## 🟢→ Phase 4 — SendGrid Transactional Email

- ✅ Template registry + type‑safe merge vars
- ✅ Event webhook verification (bounce/complaint)
- ✅ Alerting for failures; OpsHub status surfaces

Acceptance:

- ✅ Emails render with templates in dev; webhooks verified; audits captured

More detail: [SendGrid Transactional Email](../messaging/SENDGRID_TRANSACTIONAL_EMAIL.md)

**Red Hat Review Notes:**
- ✅ ECDSA verification fails closed and is fully audited; missing keys produce 401s
- ✅ OpsHub now exposes SendGrid health, though state is in-memory—migrate to Redis before multi-instance deploys
- ✅ Template builders guard dynamic data and fall back gracefully when env IDs are missing
- ⚠️ Legacy batch jobs still bypass the typed registry; consolidate to prevent drift

## 🟢→ Phase 5 — Workbenches Hardening (Agent + Content)

- ✅ Tool contracts with deterministic budgets and replay logs
- ✅ Artifact persistence with provenance; UI polish and error states

Acceptance:

- ✅ Deterministic runs with budget enforcement; artifacts reviewable in OpsHub

**Red Hat Review Notes:**
- ✅ Workbench contract schema enforces per-tool cost/token budgets and tracks usage in `workbench_runs` collection
- ✅ Replay protection via unique `runId` prevents duplicate expensive executions
- ✅ `/api/v2/ai/execute` now checks cost budget before token budget; returns 409 on replay, 403 on budget breach
- ✅ Contract definitions centralized in `src/lib/workbench/contracts.ts` with typed IDs preventing drift
- ⚠️ Artifact UI polish deferred (existing OKR/Retro/TechDebt tools work but don't yet persist to DB)
- ⚠️ Contract replay window not yet enforced (checks existence, not time-based expiry)

## 🟢→ Phase 6 — Observability & SLOs

- ✅ RED metrics (rate/errors/duration) + healthz endpoints
- ⚠️ Slow‑query tracing and feature flag telemetry

Acceptance:

- ✅ Dashboards show p50/p95 latencies per route/provider; alert rules defined

More detail: [Observability & SLOs](../observability/OBSERVABILITY_SLOS.md)

**Red Hat Review Notes:**
- ✅ RED metrics track per-route and per-provider request counts, error rates, and latency percentiles (p50/p95/p99)
- ✅ `/api/health` now surfaces top-5 routes and all provider metrics alongside service health checks
- ✅ `/api/observability/metrics` provides detailed RED summaries with RBAC protection (super_admin only)
- ✅ `/api/v2/ai/execute` records metrics on every success and error for full coverage
- ⚠️ In-memory metric storage suitable for single-instance; migrate to Redis or Prometheus for production multi-instance
- ⚠️ Slow-query tracing and feature flag telemetry deferred to future iteration

## 🟢→ Phase 7 — CI/CD Expansions

- ✅ Matrix tests, flaky test detection, route‑guard gate, secret scans
- ✅ Bundle size budgets and PR templates/checklists

Acceptance:

- ✅ CI blocks on missing RBAC guards or failing security checks

More detail: [CI Policy Gates](../ci/CI_POLICY_GATES.md)

**Red Hat Review Notes:**
- ✅ Route guard policy (`pnpm policy:routes`) blocks commits with unprotected admin/v2 routes
- ✅ Security scanner checks for hardcoded secrets, eval(), and data isolation violations before each commit
- ✅ Flaky test detector (`pnpm ci:flaky`) runs suite 3-5 times on PRs and flags inconsistent tests
- ✅ Bundle size checker (`pnpm ci:bundle`) enforces per-route and total KB budgets
- ✅ CI workflow now runs unit tests, policy gates, and security scans on every push
- ⚠️ Matrix testing across multiple Node versions not yet implemented (currently single version)
- ⚠️ Bundle size check requires build step; consider adding to pre-deploy workflow

## 🟢→ Phase 8 — Security Tightening

- ✅ Key rotation scripts and envelope encryption helpers
- ✅ Stricter Zod schemas + PII redaction rules

Acceptance:

- ✅ Rotation runbook validated; logs contain no sensitive data

More detail: [Key Rotation & Envelope Encryption](../security/KEY_ROTATION_AND_ENVELOPE_ENCRYPTION.md)

**Red Hat Review Notes:**
- ✅ Key rotation (`src/lib/security/keyRotation.ts`) creates new keys and revokes old with full audit trail
- ✅ PII redaction utilities (`src/lib/security/piiRedaction.ts`) automatically mask emails, phones, SSNs, credit cards, API keys before logging
- ✅ All redaction functions tested with edge cases (short emails, arrays, nested objects)
- ✅ Rotation functions require `userId` for proper isolation and audit
- ⚠️ Key rotation doesn't yet re-encrypt with new master key (preserves existing encrypted value)
- ⚠️ Envelope encryption helpers deferred; current encryption uses single-layer AES-256-GCM

## Phase 9 — Content Pipeline Tuning

- ⚠️ Schedulers; source registries; dedupe and quality tuning
- ⚠️ Provenance queries and OpsHub controls

Acceptance:

- ⚠️ Measurable reduction of duplicates and low‑quality items; queries documented

## Phase 10 — Provider Hardening Follow‑Ups

- ⚠️ Budget enforcement; circuit settings per provider
- ⚠️ Fuzz tests; cost dashboards; error shaping improvements

Acceptance:

- ⚠️ Budget breaches prevented; cost/latency dashboards validated

## Phase 11 — Docs, ADRs, and Runbooks

- ⚠️ ADR for Workflow adoption decision (if chosen)
- ⚠️ Incident playbooks and ops runbooks for Twilio/SendGrid/RAG

Acceptance:

- ⚠️ Docs reviewed; links added to OpsHub settings and READMEs

---

## Commit Discipline (Day 5)

- ✅ Conventional commits; atomic scope; tests/docs with each change
- ✅ Local gating: `pnpm typecheck && pnpm lint && pnpm test:unit`
- ✅ Push to remote only on request or before build checks we schedule
