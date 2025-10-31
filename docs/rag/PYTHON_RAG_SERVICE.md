<!--
AI Summary: Packaging and integration of the Python RAG service with health/logging, TS client schemas, retries/timeouts, and CI hooks.
-->

# Python RAG Service

This work is part of Day 5: [Day 5 Plan](../planning/DAY_5_PLAN.md).

## Overview

Containerized service with a health endpoint and structured logs. TS client uses Zod schemas and provider harness patterns.

## File Map

- `python/pyproject.toml`, `python/Dockerfile`
- `python/api/health.py` (or FastAPI route)
- `src/lib/rag/client.ts` (Zod schemas + fetch)
- `scripts/start-rag-service.py` (local dev helper)

## Health & Logging

- Health: `GET /health` returns `{ status: 'ok' }`
- Logs: JSON with requestId, latency, error fields

## Timeouts/Retry

- Client wraps requests with provider harness-like helper for timeout/backoff

## CI

- Add a job to build image or run a lightweight health stub; unit tests pass

## Tests & Acceptance

- Unit tests for client parsing and error paths
- Local `pnpm test:unit` green; service health OK in dev
