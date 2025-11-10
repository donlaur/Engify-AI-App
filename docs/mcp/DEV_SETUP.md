---
title: "Engify MCP – Local Development Setup"
status: "Draft (Phase 1 In Progress)"
last_updated: "2025-11-10"
---

# MCP Local Development Setup (Phase 1)

This guide tracks the Phase 1 work to bring up the memory MCP service locally. As steps land, update the status column so we maintain a live checklist before moving on to Phase 2 integrations.

## Prerequisites

- macOS (Apple Silicon recommended)
- `pnpm` ≥ 10
- Python 3.11 with `pyenv` or system install
- Docker Desktop (optional, but required for the Docker Compose flow)
- `make`

## Quickstart Checklist

| Area | Task | Owner | Status |
| --- | --- | --- | --- |
| Environment | Add `.env.mcp.local.example` for the memory service (`JWT_SECRET`, `MCP_MEMORY_DB_PATH`, `PORT`) | Memory Agent | In Progress |
| Tooling | Create `docker-compose.mcp.yml` (memory + optional Redis) | Memory Agent | Pending |
| Tooling | Extend root `Makefile` with `memory-up`, `memory-down`, `memory-logs` | Memory Agent | Pending |
| Auth | Implement JWT/tag middleware in `services/memory-mcp/src/server.py` | Memory Agent | Pending |
| Auth | Provide CLI script `scripts/mcp/issue-memory-token.ts` to mint dev tokens | Memory Agent | Pending |
| Testing | Add tenant isolation smoke test (`org:demo` vs `org:other`) | Memory Agent | Pending |
| Docs | Update this file once each step lands; append verification checklist to `docs/mcp/MEMORY_SERVICE_PLAN.md` | Memory Agent | Pending |

## Implementation Notes

1. **Environment template**  
   The example env file lives at the repo root: `env.mcp.local.example`. Copy to `.env.mcp.local` during setup (macOS Finder may hide files starting with a dot).

2. **Docker Compose**  
   Compose file will run the memory service container and (optionally) Redis for future guardrail integration. In Phase 1 Redis remains optional, but ports must not conflict with existing Engify services.

3. **Make targets**  
   Add helper targets to the root `Makefile` so contributors can run the memory service alone:  
   - `memory-up` – `docker compose -f docker-compose.mcp.yml up --build`  
   - `memory-down` – `docker compose -f docker-compose.mcp.yml down`  
   - `memory-logs` – `docker compose -f docker-compose.mcp.yml logs -f memory`

4. **JWT + Tag Middleware**  
   Middleware validates `Authorization: Bearer <token>` using Engify’s JWT secret. Required claims: `orgId`, `userId`, `plan`, `scopes`, `workspaceSlug`. All reads/writes must auto-apply the tags:  
   - `org:<orgId>`  
   - `user:<userId>`  
   - `workspace:<workspaceSlug \| "default">`  
   - Optional additional tag: `topic:<intent>` if provided by the request.

5. **Token Issuer Script**  
   Place the script under `scripts/mcp/issue-memory-token.ts`. It should accept CLI arguments (`--org`, `--user`, `--workspace`, `--topic`) and output a signed JWT compatible with the middleware validation above.

6. **Smoke Test**  
   Create an integration test in `services/memory-mcp/tests/tenant_isolation.test.py` (or similar) that:
   - Spins up the FastAPI app in process.
   - Inserts a memory for `org:demo`.
   - Confirms `org:other` is denied access to that memory.

7. **Docs & Verification**  
   After implementing each item, update the status table and extend `docs/mcp/MEMORY_SERVICE_PLAN.md` with a verification checklist that mirrors the deliverables.

## Next Steps

- Implement the environment template and Make targets.
- Stand up Docker Compose for the memory service.
- Layer in JWT/tag middleware alongside the smoke test.
- Update documentation as each milestone completes.

