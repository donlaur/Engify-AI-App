# Guardrails MCP Plan

## Goal

Translate Engify's existing guardrail policies into MCP-aware tooling that auto-activates before risky operations and enforces compliance across IDEs and MCP clients.

## Inputs on Hand

- `.ai-guardrails.md` master policy
- Claude Code infrastructure showcase (skill auto-activation patterns)
- Existing pre-commit hooks and org guardrail memories (@see `docs/security/`)

## Deliverables

1. **Auto-Activation Prompt**
   - MCP `before_action` prompt (similar to Claude UserPromptSubmit) that fires when requests include keywords (commit, database, icon, etc.).
   - Must instruct assistants to call guardrail tools before proceeding.

2. **Guardrail Tools**
   - `check_guardrails`: returns applicable rules + acknowledgement checklist.
   - `validate_commit`: enforces commit message standards (ties to Git plan in `docs/development/BRANCHING_STRATEGY.md`).
   - `validate_icons`: ensures icon usage follows lucide-react constraints.
   - `validate_db_operation`: blocks destructive Mongo/Postgres actions unless approved.

3. **Policy Engine**
   - JSON schema describing guardrail rules (condition → message → severity → remediation).
   - Implementation in TypeScript using Zod for parsing.
   - Support for custom org rules in the future (load from Mongo collection `guardrail_rules`).

4. **Testing Harness**
   - Unit tests (Vitest) for rule matching and responses.
   - Integration tests using MCP client simulator (e.g., `@anthropic-ai/mcp-sdk` or `mcp-cli`).
   - Regression checklist covering previous guardrail failures (icon misuse, bypassed staleness checks, DB wipes).

5. **Documentation**
   - Update `.ai-guardrails.md` to reference MCP tool usage (links into this folder).
   - How-to guide for adding new guardrails (Ops team playbook).

## Implementation Steps

1. **Schema & Metadata**
   - Define `GuardrailRule` interface (id, name, trigger patterns, severity, instructions, remediation steps).
   - Store baseline rules in `config/guardrails/base.json`.

2. **MCP Server Skeleton**
   - Node/TypeScript project using Express or Fastify (for REST) + MCP library for tool definitions.
   - Provide CLI script `pnpm dev` for local run.

3. **Auto-Activation Logic**
   - Hook into `before_action` prompt; parse user request; match triggers; respond with instructions to call `check_guardrails`.
   - Provide code snippet for Claude Desktop config.

4. **Tool Handlers**
   - Implement each tool to read rules, evaluate context (request payload, file list), and return structured response.
   - Add `action_required` boolean; if true, the assistant must confirm compliance before continuing.

5. **Integration**
   - Document how Engify agents (RCA, Sprint Planner) must call guardrail tool at start.
   - Provide middleware for Node/Python clients to enforce call sequence.

6. **Metrics & Logging**
   - Emit structured logs for guardrail hits (rule id, severity, compliance status).
   - Store summary in Redis or Mongo for future dashboards.

## Open Questions

- Should destructive DB actions require human approval token? (Maybe integrate with Slack approvals.)
- How do we support per-tenant override (disable certain rules)?
- Do we need offline cache for guardrails when memory service down? (Likely load from local JSON + sync.)
