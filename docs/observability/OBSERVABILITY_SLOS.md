<!--
AI Summary: RED metrics, health checks, tracing, and alerting guidelines for APIs and providers.
-->

# Observability & SLOs

## Metrics

- RED (Rate, Errors, Duration) per route/provider
- p50/p95 latency goals; error budget policy

## File Map

- `src/lib/logging/logger.ts` (sanitized structured logs)
- `src/app/api/*` health endpoints as needed
- Provider harness timings in `src/lib/ai/v2/utils/provider-harness.ts`

## Tracing & Health

- Expose `/health` for critical subsystems; capture slow queries

## Acceptance

- Dashboards/screenshots attached in docs; alert rules documented
