---
title: "Phase 1 – Memory Service Agent Brief"
status: "Draft"
last_updated: "2025-11-09"
recommended_model: "gpt-4o-mini (or GPT-4.1-mini) for low-cost iterative work"
---

# Objective

Stand up the Engify memory backbone by adapting the `doobidoo/mcp-memory-service` repo for local development. Deliverables should run entirely on macOS (Apple Silicon) with Docker optional but not required.

## Key References

- `docs/mcp/MEMORY_SERVICE_PLAN.md` – overarching requirements.
- `docs/mcp/base-server/02-auth-tenancy.md` – tag schema & JWT claims.
- External repo: [https://github.com/doobidoo/mcp-memory-service](https://github.com/doobidoo/mcp-memory-service).

## Scope of Work (Tonight)

1. **Repo Fork & Setup**
   - Fork the upstream repo under `engify-ai`.
   - Update README fork section noting Engify-specific changes.
   - Add `.env.mcp.local.example` with placeholders for `JWT_SECRET`, `MCP_MEMORY_DB_PATH`, `PORT`.

2. **Local Runner**
   - Create `docker-compose.mcp.yml` (memory + Redis optional).
   - Add Make targets: `memory-up`, `memory-down`, `memory-logs`.
   - Document quickstart in `docs/mcp/DEV_SETUP.md` (create if missing).

3. **Auth & Tagging Stub**
   - Implement middleware that validates Engify JWT claims (`orgId`, `userId`, `plan`, `scopes`).
   - Ensure writes/read operations automatically apply tags:
     - `org:<orgId>`
     - `user:<userId>`
     - `workspace:<workspaceSlug | "default">`
   - Provide CLI script `scripts/mcp/issue-memory-token.ts` (TypeScript) or `issue_memory_token.py` (Python) to mint dev tokens.

4. **Smoke Test**
   - Write integration test storing a memory for `org:demo`, ensure `org:other` cannot read it.
   - Log output of `memory-up` + `curl` command to fetch stored memory.

5. **Deliverables**
   - Fork link & short summary of modifications.
   - Updated docs committed in current branch (no deploy yet).
   - Verification checklist appended to `docs/mcp/MEMORY_SERVICE_PLAN.md`.

## Model Guidance

- **Primary:** `gpt-4o-mini` (OpenAI) or `GPT-4.1-mini` (Anthropic) – low-cost, high context, adequate for cloning instructions & config generation.
- **Fallback (for reasoning-heavy steps):** `gpt-4o` or Claude 3.5 Sonnet, but reserve for complex debugging to control spend.

## Success Criteria

- `make memory-up` boots service locally and passes smoke test.
- Auth middleware enforces tenant tags.
- Docs clearly explain how to run and issue tokens.

