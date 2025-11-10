---
title: "MCP Auth & Tenancy Plan"
status: "Draft"
last_updated: "2025-11-09"
---

# MCP Auth & Tenancy Plan

This document covers authentication, authorization, and multi-tenant isolation for Engify’s MCP services (memory, guardrails, patterns, workbench agents).

## Objectives

- Single-signing authority: Engify auth service issues JWTs used across all MCP servers.
- Enforce tenant isolation via tags/namespaces.
- Support BYOK and rate limiting per subscription tier.
- Provide path to enterprise deployments (self-host, air-gapped).

## Requirements

1. **JWT Claims**
   - `sub`: user ID (UUID).
   - `orgId`: organization/workspace ID.
   - `plan`: `free` | `pro` | `team` | `enterprise`.
   - `role`: `engineer` | `pm` | etc.
   - `scopes`: array of enabled MCP tools (`memory.read`, `guardrails.validate`, `patterns.select`).

2. **Token Lifecycle**
   - Issue via existing NextAuth + Mongo session store (Phase 1).
   - Rotate signing keys using AWS KMS (Phase 2).
   - Support short-lived access tokens (1 hour) + refresh tokens for long sessions.

3. **Service Enforcement**
   - **Memory Service**: Map `orgId/userId` to tag filters (e.g., `org:123`, `user:456`). Deny access if scope missing.
   - **Guardrails**: Validate `plan` (e.g., advanced guardrails for Pro+). Log each request with `userId`.
   - **Pattern Selector**: Filter premium patterns when `plan != pro`.
   - **Workbench Agents**: require `plan` `team`+; verify `scopes` include `agents.run`.

4. **Rate Limiting**
   - Use Redis (existing) to track requests per service + token.
   - Default limits (Phase 1):
     - Free: 100 MCP calls/day.
     - Pro: 3,000/day.
     - Team: 10,000/day.
   - Expose remaining quota via `/api/v1/mcp/quota`.

5. **Audit Logging**
   - Structured JSON logs (service, user, org, tool, result, latency, error).
   - Ship to CloudWatch (prod) / local file (dev).
   - Keep 30-day history; enterprise option for longer retention.

## Implementation Steps

1. **JWT Schema**
   - Define Zod schema `MCPAccessTokenClaims` in `@/lib/auth/mcp-tokens.ts`.
   - Generate tokens via server action `issueMCPToken`.

2. **Common Middleware**
   - Create package `packages/mcp-auth` (TypeScript).
   - Expose helper to validate token, extract claims, build tag filters.
   - Provide Python equivalent (FastAPI dependency) for memory service.

3. **Scoped Tool Exposure**
   - Each MCP server exposes `metadata` endpoint listing tools/resources.
   - Filter based on scopes/plan when responding to discovery requests.

4. **Namespace Strategy**
   - Default namespace: `<orgId>:<workspaceSlug>`.
   - Memory tags: `org:<orgId>`, `workspace:<slug>`, `user:<userId>`, `intent:<taskIntent>`.
   - Guardrail logs: include namespace for auditing.

5. **Secrets Management**
   - Dev: `.env.local` with sample keys.
   - Prod: AWS Secrets Manager or Parameter Store.
   - Rotation: monthly schedule; notify services via SSM.

6. **Testing**
   - Unit tests verifying token parsing, scope enforcement.
   - Integration tests: spin up memory + guardrail services, attempt cross-org access (should fail).
   - Pen test checklist: attempt to bypass rate limits, use expired/forged tokens.

## Future Enhancements

- SSO / SCIM for enterprise `orgId` provisioning.
- IP allow lists per organization.
- Fine-grained scopes (e.g., `memory.write:pattern_usage`).
- Tamper-evident logs (hash chain persisted to S3).

