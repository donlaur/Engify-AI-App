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

## Phase 2 — Python RAG Packaging and Service Integration

- ⚠️ Pyproject/virtualenv automation and Dockerfile for `python/`
- ⚠️ Health endpoint + structured logging + timeouts/retries
- ⚠️ Typed TS client and adapters in `src/lib/`
- ⚠️ CI job for unit tests and type checks; docs and quickstart

Acceptance:

- ⚠️ `pnpm test:unit` runs client stubs; service health passes locally and in CI

More detail: [Python RAG Service](../rag/PYTHON_RAG_SERVICE.md)

## Phase 2.5 — Automated Agent Content Creator (carrier‑backed)

- ⚠️ Provider‑agnostic CreatorAgent using the new model carrier with allowlisted models and hard budgets
- ⚠️ Deterministic defaults (low temperature), retries via provider harness, cost caps
- ⚠️ Draft persistence via existing `buildStoredContent` → `web_content` with `reviewStatus='pending'` and `source='agent-generated'`
- ⚠️ Provenance events recorded (`src/lib/content/provenance.ts`)
- ⚠️ API route to trigger single creation: `src/app/api/agents/creator/route.ts` (RBAC: org_admin/super_admin)
- ⚠️ Batch script: `scripts/content/generate-batch.ts` to create N drafts from curated topics
- ⚠️ Topic allowlist: `src/lib/content/topics.ts` (per‑env gating)
- ⚠️ OpsHub: add filter "Source: generated" and Regenerate action in `src/components/admin/ContentReviewQueue.tsx`

Acceptance:

- ⚠️ Drafts appear in OpsHub Review Queue with quality checks, pending status, cost/latency metadata
- ⚠️ Regenerate action works; budgets enforced; models restricted by allowlist

More detail: [Agent Content Creator](../content/AGENT_CONTENT_CREATOR.md)

## Phase 3 — Twilio MFA/SMS Productionization

- ⚠️ E.164 validation + rate limiting; Verify optional path
- ⚠️ Webhook signature verification and replay protection
- ⚠️ Retry/backoff strategy; OpsHub toggles and audit logs

Acceptance:

- ⚠️ End‑to‑end MFA flows pass with and without Verify; webhooks verified

More detail: [Twilio MFA Productionization](../messaging/TWILIO_MFA_PROD.md)

## Phase 4 — SendGrid Transactional Email

- ⚠️ Template registry + type‑safe merge vars
- ⚠️ Event webhook verification (bounce/complaint)
- ⚠️ Alerting for failures; OpsHub status surfaces

Acceptance:

- ⚠️ Emails render with templates in dev; webhooks verified; audits captured

More detail: [SendGrid Transactional Email](../messaging/SENDGRID_TRANSACTIONAL_EMAIL.md)

## Phase 5 — Workbenches Hardening (Agent + Content)

- ⚠️ Tool contracts with deterministic budgets and replay logs
- ⚠️ Artifact persistence with provenance; UI polish and error states

Acceptance:

- ⚠️ Deterministic runs with budget enforcement; artifacts reviewable in OpsHub

## Phase 6 — Observability & SLOs

- ⚠️ RED metrics (rate/errors/duration) + healthz endpoints
- ⚠️ Slow‑query tracing and feature flag telemetry

Acceptance:

- ⚠️ Dashboards show p50/p95 latencies per route/provider; alert rules defined

More detail: [Observability & SLOs](../observability/OBSERVABILITY_SLOS.md)

## Phase 7 — CI/CD Expansions

- ⚠️ Matrix tests, flaky test detection, route‑guard gate, secret scans
- ⚠️ Bundle size budgets and PR templates/checklists

Acceptance:

- ⚠️ CI blocks on missing RBAC guards or failing security checks

More detail: [CI Policy Gates](../ci/CI_POLICY_GATES.md)

## Phase 8 — Security Tightening

- ⚠️ Key rotation scripts and envelope encryption helpers
- ⚠️ Stricter Zod schemas + PII redaction rules

Acceptance:

- ⚠️ Rotation runbook validated; logs contain no sensitive data

More detail: [Key Rotation & Envelope Encryption](../security/KEY_ROTATION_AND_ENVELOPE_ENCRYPTION.md)

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
