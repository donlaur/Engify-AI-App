# Workbench Contracts & Run Ledger

## Overview

Day 5 Phase 5 hardens the AI Workbench surface by introducing deterministic contracts and a durable run ledger. Each server-backed tool now references a contract that defines its cost and token envelopes, replay window, and contract version. Runs are persisted to MongoDB for provenance, OpsHub review, and SRE audits.

## Contract Catalog

- Source: `src/lib/workbench/contracts.ts`
- Structure: `WorkbenchToolContract` couples tool ID, contract version, maximum cost (cents), maximum total tokens, and cost-per-token scaling for fallback estimation.
- Coverage: Prompt Optimizer, Multi-Model Comparison, Knowledge Navigator, Prompt Tester, and the multi-agent simulation entry point.
- Future work: move these definitions into an admin-managed collection with Redis caching for multi-instance deployments.

## Run Ledger (`workbench_runs`)

- Schema: defined in `src/lib/db/schema.ts` with `WorkbenchRunSchema` and indexed via `Collections.WORKBENCH_RUNS`.
- Persistence: service helpers in `src/lib/services/workbenchRuns.ts` handle `startWorkbenchRun`, `completeWorkbenchRun`, and lookups.
- Captured fields: run ID, tool ID, user ID, contract version, budget, actual cost/tokens, provider/model, status (`pending`, `success`, `error`, `budget_exceeded`, `replay`), metadata (latency, mode, roles), and timestamps.
- Replay behavior: duplicate `runId` requests return HTTP 409 and record a `replay` status.

## API Updates

- `POST /api/v2/ai/execute`
  - Accepts optional `toolId` and `runId` inputs.
  - Performs contract lookup, persists run start, enforces cost/token ceilings, and returns the run ID in the response payload.
  - Emits structured audit logs via existing logger helpers.

- `POST /api/multi-agent`
  - Authenticates via `auth()` to capture the initiating user.
  - Applies the multi-agent contract to bound `max_tokens`, enforces cost/token budgets, and records provenance to `workbench_runs`.
  - Surfaces deterministic 403 responses when budgets are exceeded.

## Testing

- Unit coverage:
  - `src/app/api/v2/ai/execute/__tests__/route.test.ts`
  - `src/app/api/multi-agent/__tests__/route.test.ts`
- Tests assert replay handling, budget enforcement, and successful runs with deterministic responses.

## Operational Notes

- Run IDs are returned in API responses to let the UI stitch artifacts back to OpsHub.
- Mongo indexes support chronological OpsHub dashboards (`toolId + createdAt`) and replay detection (`runId` unique).
- Red team findings: migrate in-memory contract catalog to persistent config and add UI surfaces for run history before GA.
