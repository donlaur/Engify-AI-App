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
