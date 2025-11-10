# Memory Service Plan (mcp-memory-service)

## Objective

Integrate the doobidoo `mcp-memory-service` as Engify's shared memory layer, running locally first and migrating to AWS when ready.

## Tasks

1. **Fork & Pin Version**
   - Fork `doobidoo/mcp-memory-service` under Engify org.
   - Choose stable tag (v8.22.2 as of 2025-11-09).
   - Document upstream update process and track feature deltas against [`supermemory-mcp`](https://github.com/supermemoryai/supermemory-mcp) and [`mem0`](https://github.com/mem0ai/mem0) for future upgrades.

2. **Local Environment**
   - Add `docker-compose.memory.yml` that runs the service plus optional Cloudflare KV emulator.
   - Create `.env.memory.local` with defaults: `DB_PATH=./data/memory.db`, `JWT_SECRET=dev-secret`, `PORT=7420`.
   - Write Makefile target `make memory-up` / `memory-down`.

3. **Tenant Tagging Strategy**
   - Standard tags: `org:<uuid>`, `user:<uuid>`, `workspace:<slug>`.
   - For conversations, include `topic:<category>` (e.g., `topic:rca`).
   - Document in README and enforce in client SDK.

4. **Auth Integration**
   - Reuse Engify JWT signing key (see `docs/security/JWT_STRATEGY.md` once created).
   - Implement middleware that validates `Authorization: Bearer <token>` and maps to allowed tags.
   - Provide CLI script to mint dev tokens.

5. **Client Wiring**
   - Claude Desktop / Windsurf / Cursor configuration snippets pointing to localhost.
   - Node SDK helper `libs/mcp/memoryClient.ts` to encapsulate requests.

6. **Migration Plan to AWS**
   - Containerize (Dockerfile already provided).
   - Deploy to ECS Fargate (t4g.small) with Secrets Manager for JWT secret.
   - Evaluate Portkey gateway for central auth/logging if we introduce multiple MCP services.
   - Optional: enable Cloudflare KV sync when domain + account ready; re-check parity with `supermemory-mcp` replication model.
   - Add CloudWatch alarms (memory service down, error rate high).

7. **Testing**
   - Integration test: store + search memory under org A; verify org B cannot access.
   - Load test: 100 concurrent writes (use Locust or k6) to confirm WAL config; compare throughput expectations documented in `supermemory-mcp`.
   - Regression: nightly job to back up SQLite file to S3; look at `mem0` retention policies for inspiration.

## Open Questions

- Do we need per-tenant encryption-at-rest beyond SQLite WAL? (If yes, evaluate KMS envelope encryption and ideas from `memory-bank-mcp`.)
- Should we mirror memories into Mongo for analytics? (Deferred.)
- How do we expose admin UI for support? (Maybe use built-in document viewer.)
