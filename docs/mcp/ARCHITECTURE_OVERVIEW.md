# MCP Architecture Overview

This document outlines how Engify's MCP ecosystem fits together. It anchors the other plans in this directory.

## Core Services

| Service | Language | Purpose | Hosting (MVP) | Hosting (Phase 2) |
|---------|----------|---------|---------------|-------------------|
| `mcp-memory-service` (doobidoo fork) | Python | Long-term memory, semantic search, document ingestion | Local Docker on MacBook Air | ECS Fargate (or EC2) with hybrid SQLite + Cloudflare KV |
| `engify-guardrails-mcp` | TypeScript | Guardrail enforcement, auto-activation, policy checks | Node process via `tsx` | AWS Lambda (container image) or Fargate |
| `engify-patterns-mcp` | TypeScript | Pattern catalog, recommendation, skill injection | Node process | Same as guardrails |
| `engify-workbench-mcp` | Python + Node | Task-specific agents (RCA, Sprint Planner, etc.) | Local `uv` / `node` scripts | Combination of Lambda + Fargate |

Clients (Claude Desktop, Windsurf, Cursor, etc.) can connect to multiple servers simultaneously. Our orchestration layer will guide when each tool is invoked.

## Data Boundaries

- **MongoDB (existing)** – Remains the source of truth for ISR JSON, prompt backups, analytics fallbacks.
- **Redis (existing)** – Real-time analytics events (favorites, views). No change.
- **MCP Memory SQLite/KV** – Stores tenant-specific memories accessed by MCP tools. Indexed by tags (`org:<id>`, `user:<id>`, `workspace:<slug>`).
- **Optional Postgres** – Reserved for transactional data if/when we outgrow Mongo for auth/billing.

## Authentication & Multi-Tenancy

1. Auth service issues JWTs containing `orgId`, `userId`, `role`, `plan`.
2. MCP clients include the JWT when calling memory or guardrail tools (Authorization: Bearer ...).
3. Memory service enforces isolation via tag filters + per-token namespaces.
4. Guardrail/pattern servers validate JWTs before servicing requests.

## Deployment Strategy

1. **Local-first**: docker-compose file spins up memory service, guardrails, pattern server on localhost.
2. **Staging**: same containers deployed to ECS Fargate with Secrets Manager. API Gateway routes `/mcp/*` to the appropriate service.
3. **Production**: add Cloudflare KV for memory sync, CloudWatch metrics, OpenTelemetry traces.

## Observability

- Structured logs (`jsonl`) from each server.
- OpenTelemetry spans emitted to AWS X-Ray (Phase 2).
- Health endpoints for each service exposed over HTTP.

## Next Steps

- Finalize JWT schema in `docs/security/AUTH_STRATEGY.md` (create if missing).
- Produce docker-compose for local triad (memory, guardrails, patterns).
- Define API gateway routes and infrastructure IaC (SST or CDK).
