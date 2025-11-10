---
title: "Phase 2 – Guardrails MCP Agent Brief"
status: "Draft"
last_updated: "2025-11-09"
recommended_model: "gpt-4o-mini for coding + Claude 3 Haiku for refactors"
target_branch: "feature/mcp-guardrails-agent"
---

# Objective

Bootstrap the Engify guardrails MCP server (TypeScript) by adapting the Claude Code infrastructure patterns. Work should occur on a dedicated branch (`feature/mcp-guardrails-agent`) to minimize merge conflicts with the memory workstream.

## Key References

- `docs/mcp/GUARDRAILS_PLAN.md`
- `docs/mcp/base-server/01-orchestration-layer.md`
- Claude Code showcase: [https://github.com/diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)
- Policy engine ideas: [https://github.com/aipotheosis-labs/gate22](https://github.com/aipotheosis-labs/gate22)

## Scope of Work (Tonight)

1. **Branch & Scaffold**
   - Create branch `feature/mcp-guardrails-agent`.
   - Initialize project `apps/engify-guardrails-mcp` (or `packages/guardrails-mcp` if monorepo fits).
   - Configure `tsconfig`, `pnpm` scripts (`dev`, `build`, `lint`), and `@anthropic-ai/mcp-sdk` dependencies.

2. **Resource Modularization**
   - Break `.ai-guardrails.md` into modular markdown files under `docs/guardrails/`:
     - `overview.md`
     - `commit-standards.md`
     - `database-safety.md`
     - `icon-usage.md`
     - `deployment-checks.md`
   - Ensure each file <500 lines, add frontmatter metadata (severity, tags).

3. **Auto-Activation Prompt**
   - Implement MCP prompt `before_action` mirroring Claude `UserPromptSubmit`.
   - Trigger keywords: `commit`, `git`, `database`, `mongo`, `icon`, `deploy`.
   - Response must instruct assistants to call `check_guardrails` tool before proceeding.

4. **`check_guardrails` Tool MVP**
   - Input: `{ action: string; files?: string[]; }`
   - Logic: load relevant resource(s), return JSON payload with:
     - `rules`: array of { title, severity, summary, docUri }
     - `requiresAcknowledgement`: boolean
   - Log invocation (service, orgId, userId) via pino.

5. **Testing & Docs**
   - Vitest suite covering trigger keywords and resource loading.
   - Document setup in `docs/mcp/DEV_SETUP.md` (guardrails section).
   - Update `docs/mcp/ACTION_PLAN.md` task statuses if progress warrants.

## Model Guidance

- **Primary:** `gpt-4o-mini` (coding, config generation).
- **Secondary:** `Claude 3 Haiku` for summarizing guardrail text if we need cheap refactors (<$).
- Avoid high-cost models unless debugging complex edge cases.

## Success Criteria

- Branch builds (`pnpm build`) and runs (`pnpm dev`) locally.
- Auto-activation prompt triggers for defined keywords.
- `check_guardrails` returns correct resources and acknowledgement flag.
- Documentation reflects new guardrail structure and run instructions.

