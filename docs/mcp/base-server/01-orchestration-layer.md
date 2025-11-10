---
title: "MCP Orchestration Layer Plan"
status: "Draft"
last_updated: "2025-11-09"
---

# MCP Orchestration Layer Plan

Purpose: define how Engify’s guardrails, pattern selector, memory service, and future workbench agents cooperate during any MCP-assisted workflow.

## Goals

- Provide deterministic request lifecycle: **Guardrails → Context Fetch → Pattern Selection → Execution → Logging**.
- Support both manual user requests (e.g., Windsurf chat) and automated Engify agents.
- Remain language-agnostic: Python services (memory, analytics) and TypeScript services (guardrails, pattern selector) must interoperate.

## Reference Implementations

- [`diet103/claude-code-infrastructure-showcase`](https://github.com/diet103/claude-code-infrastructure-showcase): hook ordering and progressive disclosure.
- [`transitive-bullshit/agentic`](https://github.com/transitive-bullshit/agentic): planning + evaluation harness for multi-step agent workflows.
- [`campfirein/cipher`](https://github.com/campfirein/cipher): secure prompt execution and step orchestration patterns.
- [`lastmile-ai/mcp-agent`](https://github.com/lastmile-ai/mcp-agent): MCP agent scaffolding for chaining tools/resources.

## Lifecycle Diagram (Draft)

1. **Trigger Detection**
   - MCP client (e.g., Windsurf) dispatches request metadata to Engify orchestrator.
   - Orchestrator inspects action kind (edit code, plan sprint, generate doc).

2. **Guardrail Auto-Activation**
   - Call `engify-guardrails-mcp` `before_action` prompt.
   - Mandatory tool call `check_guardrails` returns applicable rules.
   - If severity `critical`, block until acknowledgement.

3. **Context Assembly**
   - Query `engify-memory-mcp` with tags `org:<id>`, `user:<id>`, `workspace:<slug>`, `topic:<intent>`.
   - Fallback: fetch ISR JSON / Mongo if memory misses.
   - Cache assembled bundle to reuse during multi-step flows.

4. **Pattern Selection**
   - Invoke `engify-patterns-mcp` `select_pattern` tool with context summary.
   - Tool returns recommended pattern + rationale + required resources.
   - Orchestrator injects pattern resources into conversation (respecting <500 line rule).

5. **Execution & Logging**
   - Workbench agent or assistant executes with pattern guidance.
   - `log_pattern_usage` tool saves metadata to memory + analytics queue.
   - Guardrail post-check `validate_commit`/`validate_icons` optional based on action.

## Engineering Tasks

1. **Define Orchestrator Contract**
   - TypeScript interface `MCPWorkflowContext` (`action`, `files`, `intent`, `tags`, `user`).
   - Implement in `@/lib/mcp/orchestrator.ts`.

2. **Implement Workflow Runner (Phase 1 Scope)**
   - Minimal pipeline: guardrails → memory fetch → pattern recommendation.
   - Use promises to serialize; add retries/backoff for network errors.
   - Provide instrumentation hooks (OpenTelemetry spans).

3. **Shared Context Cache**
   - In-memory (Redis later) keyed by `executionId`.
   - Avoid re-fetching memory for repeated tool calls within same request.

4. **Fallback Strategy**
   - If guardrail service unavailable: degrade gracefully but log violation.
   - If memory service unavailable: fallback to Mongo JSON static context.
   - Document policy per severity level.

5. **Evaluation Harness**
   - Adapt `agentic` evaluation scripts to simulate end-to-end flows.
   - Record metrics: guardrail compliance rate, pattern acceptance rate, time-to-response.

## Risks & Open Questions

- **Cross-language latency**: Each step is network hop; ensure sub-100ms median via local network or co-located containers.
- **User overrides**: Provide manual override hook while ensuring audit trail.
- **Multi-agent coordination**: Future phases may involve parallel agents; orchestrator must scale beyond serial flow.
- **Telemetry volume**: Ensure logging does not introduce token leakage; anonymize or hash sensitive data.

