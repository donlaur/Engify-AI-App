<!--
AI Summary: Automated agent that generates draft content via model carrier, enforces budgets, persists drafts as pending for OpsHub review.
-->

# Agent Content Creator

## Overview

Provider-agnostic creator that uses the carrier to select an allowlisted model with deterministic settings and strict cost caps.

## File Map

- `src/lib/agents/creator/CreatorAgent.ts`
- `src/app/api/agents/creator/route.ts` (RBAC: org_admin/super_admin)
- `scripts/content/generate-batch.ts` (batch generation)
- `src/lib/content/topics.ts` (allowlisted topics)
- `src/components/admin/ContentReviewQueue.tsx` (filters + regenerate)

## Draft Persistence

- Use `buildStoredContent` → `web_content` with `reviewStatus='pending'`, `source='agent-generated'`
- Record provenance via `src/lib/content/provenance.ts`

## Budgets & Determinism

- Temperature ≤ 0.3; token caps; max retries; carrier model allowlist env-driven

## Tests & Acceptance

- Unit tests for CreatorAgent (mock carrier); route tests
- Drafts appear in OpsHub with quality checks and cost/latency metadata
