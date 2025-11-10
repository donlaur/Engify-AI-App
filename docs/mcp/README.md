# MCP Platform Roadmap

This directory consolidates the plan for Engify's Model Context Protocol (MCP) stack. The goal is to deliver a local-first MVP (MacBook Air) that can later be lifted into AWS without major rewrites.

## Why MCP?

Engify's differentiator is an agentic senior-engineer experience with institutional memory and proactive guardrails. MCP gives us a vendor-neutral way to deliver that in Windsurf, Cursor, Claude Desktop, or any future client. We combine:

- **Guardrail auto-activation** inspired by the Claude Code infrastructure showcase
- **Persistent memory** via the doobidoo `mcp-memory-service`
- **Prompt/pattern selection** backed by Engify's 300+ prompt library
- **Workbench agents** that teach while solving engineering tasks (see `AGENT_TOOLS_SPEC.md`)

## Snapshot: What We Have vs Need

| Area | Current Assets | Gaps |
|------|----------------|------|
| Guardrails | `.ai-guardrails.md`, Claude Code hook patterns, red/green analysis | MCP prompt/tool equivalents, enforcement tests, client wiring |
| Memory | doobidoo `mcp-memory-service`, mem0 research, tag strategy ideas | Deployment scripts, Engify auth integration, tenant tagging, failover |
| Pattern Selection | 300+ prompts, Jellyfish-style UX docs | MCP resource catalog, metadata schema, auto-recommendation logic |
| Workbench Agents | `AGENT_TOOLS_SPEC.md` workflows | MCP tool wrappers, orchestration planner, evaluation harness |
| Infrastructure | Mongo ISR fallback, Redis analytics, AWS Lambda path | Containerized MCP services, local dev scripts, logging/metrics |

Each markdown file in this folder drills into those gaps so we can execute methodically.

> **Note:** Implementation code now lives in the private `Engify-MCP-Platform` repo; these docs remain publicly visible for architecture and planning.

## Reference Implementations & Inspiration

To accelerate execution we are explicitly borrowing patterns from mature open-source MCP projects:

- [diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase) – baseline for auto-activation prompts, policy evaluation, and guardrail UX.
- [doobidoo/mcp-memory-service](https://github.com/doobidoo/mcp-memory-service) – our starting point for memory (fork + customize).
- [mem0ai/mem0](https://github.com/mem0ai/mem0) & [supermemoryai/supermemory-mcp](https://github.com/supermemoryai/supermemory-mcp) – richer memory backends we can graduate to if we need vector orchestration, sync, or managed hosting.
- [alioshr/memory-bank-mcp](https://github.com/alioshr/memory-bank-mcp) – guidance for encryption-at-rest and audit logging.
- [campfirein/cipher](https://github.com/campfirein/cipher) & [transitive-bullshit/agentic](https://github.com/transitive-bullshit/agentic) – multi-agent planning, evaluation harnesses, and workflow orchestration.
- [lastmile-ai/mcp-agent](https://github.com/lastmile-ai/mcp-agent) – ready-made MCP agent scaffolding we can adapt for Phase 4 workbench tooling.
- [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) – reference for browser-context integrations.
- [Portkey-AI/gateway](https://github.com/Portkey-AI/gateway) & [aipotheosis-labs/gate22](https://github.com/aipotheosis-labs/gate22) – ideas for model routing, centralized logging, and advanced guardrail policy engines.

The individual plans below call out where these repositories plug in so we avoid reinventing components that already exist.
