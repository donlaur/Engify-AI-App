# MCP Architecture Overview

This document outlines how Engify's MCP ecosystem fits together. It anchors the other plans in this directory.

## Core Services

| Service | Language | Purpose | Hosting (MVP) | Hosting (Phase 2) | Reference Repo |
|---------|----------|---------|---------------|-------------------|---------------|
| `mcp-memory-service` (Engify fork) | Python | Long-term memory, semantic search, document ingestion | Local Docker on MacBook Air | ECS Fargate (or EC2) with hybrid SQLite + Cloudflare KV | [`doobidoo/mcp-memory-service`](https://github.com/doobidoo/mcp-memory-service) |
| `engify-guardrails-mcp` | TypeScript | Guardrail enforcement, auto-activation, policy checks | Node process via `tsx` | AWS Lambda (container image) or Fargate | [`diet103/claude-code-infrastructure-showcase`](https://github.com/diet103/claude-code-infrastructure-showcase), [`aipotheosis-labs/gate22`](https://github.com/aipotheosis-labs/gate22) |
| `engify-patterns-mcp` | TypeScript | Pattern catalog, recommendation, skill injection | Node process | Same as guardrails | [`lastmile-ai/mcp-agent`](https://github.com/lastmile-ai/mcp-agent), [`campfirein/cipher`](https://github.com/campfirein/cipher) |
| `engify-workbench-mcp` | Python + Node | Task-specific agents (RCA, Sprint Planner, etc.) | Local `uv` / `node` scripts | Combination of Lambda + Fargate | [`transitive-bullshit/agentic`](https://github.com/transitive-bullshit/agentic), [`campfirein/cipher`](https://github.com/campfirein/cipher) |

Clients (Claude Desktop, Windsurf, Cursor, etc.) can connect to multiple servers simultaneously. Our orchestration layer will guide when each tool is invoked, and we will lean on `agentic`/`cipher` style planners to coordinate multi-step flows (e.g., guardrails → pattern recommendation → workbench agent).

## Data Boundaries

- **MongoDB (existing)** – Remains the source of truth for ISR JSON, prompt backups, analytics fallbacks.
- **Redis (existing)** – Real-time analytics events (favorites, views). No change.
- **MCP Memory SQLite/KV** – Stores tenant-specific memories accessed by MCP tools. Indexed by tags (`org:<id>`, `user:<id>`, `workspace:<slug>`). Keep parity with `mem0` tag semantics where possible for future migration.
- **Optional Postgres** – Reserved for transactional data if/when we outgrow Mongo for auth/billing.

## Authentication & Multi-Tenancy

1. Auth service issues JWTs containing `orgId`, `userId`, `role`, `plan`.
2. MCP clients include the JWT when calling memory or guardrail tools (Authorization: Bearer ...).
3. Memory service enforces isolation via tag filters + per-token namespaces; evaluate encryption strategy based on `memory-bank-mcp`.
4. Guardrail/pattern servers validate JWTs before servicing requests and can optionally proxy requests through the Portkey gateway once deployed.

## Deployment Strategy

1. **Local-first**: docker-compose file spins up memory service, guardrails, pattern server on localhost. Provide Make targets that run reference tests from external repos (Claude showcase smoke tests, etc.).
2. **Staging**: same containers deployed to ECS Fargate with Secrets Manager. API Gateway routes `/mcp/*` to the appropriate service. Consider Portkey gateway in front for central logging/rate limiting.
3. **Production**: add Cloudflare KV for memory sync, CloudWatch metrics, OpenTelemetry traces. Adopt `agentic` telemetry pipeline for multi-agent traces.

## Observability

- Structured logs (`jsonl`) from each server.
- OpenTelemetry spans emitted to AWS X-Ray (Phase 2).
- Health endpoints for each service exposed over HTTP.

## Next Steps

- Finalize JWT schema in `docs/security/AUTH_STRATEGY.md` (create if missing).
- Produce docker-compose for local triad (memory, guardrails, patterns).
- Define API gateway routes and infrastructure IaC (SST or CDK).
