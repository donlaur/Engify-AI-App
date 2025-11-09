# MCP Action Plan

Legend:
- ✅ Completed
- ⚠️ Not started / in progress

## Phase 0 – Foundations
1. ✅ **Inventory existing Node MCP scaffold & verify runtime** _(Sequential)_ — `pnpm install` then `pnpm dev` confirmed server + Mongo connection (2025-11-09).
2. ✅ **Create local env scripts (docker-compose, Make targets) for MCP services** _(Sequential)_ — Added `docker-compose.mcp.yml`, `Makefile`, and env file ignores (2025-11-09).

## Phase 1 – Memory Layer
1. ⚠️ **Fork & pin doobidoo `mcp-memory-service` (v8.22.2)** _(Sequential)_ — Unlocks downstream memory work.
2. ⚠️ **Configure local run (`make memory-up`) with SQLite storage** _(Sequential)_ — Requires env file + docker compose.
3. ⚠️ **Implement Engify JWT/tag strategy** _(Sequential)_ — Must happen before clients use the service.
4. ⚠️ **Run integration tests for multi-tenant isolation** _(Sequential)_ — Depends on tagging implementation.

## Phase 2 – Guardrails MCP
1. ⚠️ **Scaffold `engify-guardrails-mcp` server** _(Sequential)_ — Requires Phase 0 scripts.
2. ⚠️ **Implement auto-activation prompt & `check_guardrails` tool** _(Sequential)_ — Follows scaffold.
3. ⚠️ **Add validation tools (`validate_commit`, `validate_icons`, `validate_db_operation`)** _(Sequential)_ — Extends guardrail coverage.
4. ⚠️ **Write unit/integration tests and logging** _(Sequential)_ — Finalizes guardrail service.

## Phase 3 – Pattern Selector MCP
1. ⚠️ **Export pattern catalog for MCP resources** _(Sequential)_ — Uses existing JSON assets.
2. ⚠️ **Build recommendation engine + `select_pattern` / `inject_pattern` tools** _(Sequential)_ — Depends on catalog export.
3. ⚠️ **Track usage (`log_pattern_usage`) and sync tags to memory** _(Sequential)_ — Needs memory layer ready.

## Phase 4 – Workbench Agents
1. ⚠️ **Wrap first agent (RCA) as MCP tool integrating patterns, guardrails, memory** _(Sequential)_ — Requires Phases 1–3 base.
2. ⚠️ **Add additional agents (PD Plan, Code Review, etc.) iteratively** _(Non-blocking)_ — Can proceed once first agent is validated.

## Phase 5 – Observability & Deployment
1. ⚠️ **Add logging, metrics, and health endpoints** _(Non-blocking)_ — Start once key services are running locally.
2. ⚠️ **Prepare ECS/Fargate deployment manifests** _(Sequential)_ — Do after local proof of concept.
3. ⚠️ **Plan migration from local to AWS (config switch, data copy)** _(Sequential)_ — Follows deployment manifest work.

## Phase 6 – QA & Hardening
1. ⚠️ **Execute end-to-end scenarios (memory + guardrail + pattern + agent)** _(Sequential)_ — Verify combined workflows.
2. ⚠️ **Update documentation (client setup, ops playbooks)** _(Sequential)_ — Final prep before release.
