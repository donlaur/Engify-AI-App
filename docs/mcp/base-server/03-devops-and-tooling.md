---
title: "MCP DevOps & Tooling Plan"
status: "Draft"
last_updated: "2025-11-09"
---

# MCP DevOps & Tooling Plan

Outlines local development workflow, CI/CD, observability, and cost management for Engify’s MCP services.

## Local Development

### Tooling

- **Docker Compose**: orchestrate memory service (Python), guardrails server (Node), pattern server (Node), Redis (rate limiting), and optional Mongo/Postgres.
- **Make targets**:
  - `make mcp-up`: start all services with hot reload.
  - `make mcp-down`: stop + clean volumes.
  - `make mcp-logs`: tail logs for all containers.
  - `make memory-up`: start memory service alone (Phase 1 requirement).
- **Environment configuration**:
  - `.env.mcp.local` with default secrets (non-production).
  - Common variables: `MCP_MEMORY_URL`, `MCP_GUARDRAILS_URL`, `MCP_PATTERNS_URL`, `JWT_SECRET`, `REDIS_URL`.

### Developer Experience Tasks

1. Provide npm scripts (`pnpm dev:mcp-guardrails`, etc.) for direct Node startup without Docker.
2. Document in `docs/mcp/DEV_SETUP.md` (to be created) how to configure Windsurf/Cursor clients.
3. Add `scripts/dev/test-mcp-flow.ts` CLI to perform sample guardrail → memory → pattern run.

## Continuous Integration

- GitHub Actions workflow `mcp-ci.yml`:
  - Lint/format (ESLint, Prettier) for Node services.
  - Type-check (tsc) and run Vitest.
  - Python checks: `ruff`, `pytest`, `mypy` for memory service.
  - Integration smoke test: start docker-compose headless and run CLI flow.
- Artifacts: Docker images tagged `mcp-memory`, `mcp-guardrails`, `mcp-patterns`.
- Security scans: `npm audit`, `pip audit`, Trivy (container scan).

## Deployment Strategy

### Staging

- Use Render or Railway for quick staging (cost ~$7/mo). Optional.
- Deploy via GitHub Action to staging after CI passes.
- Stage uses shared dev auth keys; rate limits relaxed.

### Production

- **AWS ECS Fargate** (preferred):
  - Task per service (memory: Python, guardrails: Node, patterns: Node).
  - Application Load Balancer with path routing `/mcp/memory`, `/mcp/guardrails`, etc.
  - Secrets via AWS Secrets Manager.
- **Alternate**: EC2 (t4g.small) for combined services if we need lower cost but accept manual management.
- Deploy using Terraform or SST; maintain `infra/mcp/` module.
- Rollouts: blue/green or canary with automated smoke tests hitting orchestrator.

## Observability

- **Logging**:
  - Structured JSON (pino for Node, structlog for Python).
  - Log fields: `timestamp`, `service`, `executionId`, `userId`, `orgId`, `tool`, `severity`, `durationMs`.
  - Local: write to `./logs`.
  - Production: ship to CloudWatch; optional Logtail pipeline.
- **Metrics**:
  - Expose Prometheus endpoints.
  - Key metrics: guardrail activations, memory hits/misses, pattern acceptance rate, tool latency.
- **Tracing**:
  - OpenTelemetry instrumentation (Node + Python). Export to AWS X-Ray or Honeycomb.
- **Alerts**:
  - Budget: CloudWatch anomaly on invocation count vs. plan.
  - Error rate: page if >5% failures over 5 min.

## Cost Management

- Use autoscaling based on CPU/memory for Fargate tasks.
- Keep memory service on smallest possible task (0.25 vCPU / 0.5GB). Scale out when load increases.
- Monitor AI API usage via orchestrator logs; tie to plan limits.
- Schedule staging resources to shut down nightly.

## Testing Strategy

1. **Unit Tests**:
   - Guardrail trigger evaluation.
   - Pattern recommendation scoring.
   - Memory tag isolation.
2. **Integration Tests**:
   - Compose all services locally and run scenario scripts (RCA agent, retro agent).
   - Validate that guardrail block prevents pattern injection when violation occurs.
3. **Load Tests**:
   - k6 or Locust script hitting memory service with 100 concurrent writes/reads.
   - Monitor latency and error rate.
4. **Chaos Experiments** (Phase 2+):
   - Terminate guardrail service to verify orchestrator fallback behavior.
   - Simulate Redis outage to test rate limit bypass detection.

## Documentation & Onboarding

- Create `docs/mcp/OPERATIONS.md` describing runbooks, rollbacks, emergency access.
- Provide quickstart video (Loom) for starting local MCP stack.
- Add `docs/mcp/SECURITY_CHECKLIST.md` for pre-production hardening.

