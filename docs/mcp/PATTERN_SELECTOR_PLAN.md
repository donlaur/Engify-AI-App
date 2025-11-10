# Pattern Selector MCP Plan

## Objective

Expose Engify's 300+ prompt/pattern assets through MCP so assistants can recommend, load, and adapt patterns automatically across IDEs. We will lean on scaffolds from [lastmile-ai/mcp-agent](https://github.com/lastmile-ai/mcp-agent) for tool/resource definitions and [campfirein/cipher](https://github.com/campfirein/cipher) for workflow orchestration patterns.

## Current Assets

- Prompt metadata (roles, categories, success metrics) in `public/data/*.json`
- Documentation on progressive learning + Jellyfish-inspired UX (`docs/design/`, `docs/strategy/PATTERN_TUTORIALS_SPEC.md`)
- Guardrail requirements (patterns must be acknowledged before risky operations)

## Deliverables

1. **Pattern Catalog Schema**
   - Define TypeScript types for `Pattern` (id, title, role, tags, difficulty, success stories, recommended models).
   - Source of truth: Mongo JSON fallback + immutable backup.
   - Add optional `relatedPatterns` array for cross-selling.

2. **MCP Resources**
   - `pattern://catalog` – paginated list with filters.
   - `pattern://detail/{id}` – full pattern content (<500 lines per resource, decompose as needed).
   - `pattern://recommendations?role=engineer&task=rca` – dynamic endpoint returning top matches.

3. **Tools**
   - `select_pattern` – returns recommended pattern + summary + checklist to confirm adoption.
   - `inject_pattern` – delivers final prompt with context merged (user info, project memory, guardrail notes).
   - `log_pattern_usage` – writes to analytics (Redis) and memory (store that user used pattern X).

4. **Auto-Recommendation Logic**
   - Combine request text + memory context (project type, previous successes) to rank patterns.
   - Use TF-IDF or embeddings (consider `OpenAI text-embedding-3-small` with caching).
   - Provide fallback heuristics if embeddings unavailable.

5. **Integration Notes**
   - Guardrails MUST wrap pattern injection (call `check_guardrails` before executing).
   - Memory service tags every usage with `pattern:<id>` for personalization.
   - Workbench agents leverage `select_pattern` to explain why pattern was chosen.

## Implementation Steps

1. **Data Preparation**
   - Write script `scripts/patterns/export-for-mcp.ts` to transform JSON into catalog files.
   - Ensure each pattern has <500 line resources (split long ones into `resources/` directory).

2. **Server Skeleton**
- Node/TypeScript project using `@anthropic-ai/mcp-sdk` or similar, bootstrapped from `mcp-agent` skeleton.
- Provide `pnpm dev` for local run, `pnpm build` for dist.

3. **Recommendation Engine**
- Implement scoring: `score = intentMatch + roleBoost + successHistory + noveltyPenalty`. Use `cipher`'s multi-signal scoring as reference, and evaluate `agentic` planners for multi-step recommendation flows.
- Source intent from natural language classification (cheap LLM or keyword rules initially); map to Claude showcase auto-activation when guardrails trigger.

4. **Observability**
- Log each recommendation (pattern id, score breakdown, accepted/rejected); align telemetry schema with Portkey gateway to centralize logs later.
   - Export metrics to Redis/ClickHouse later.

5. **Testing**
   - Unit tests for recommendation algorithm.
   - Golden file tests for resource outputs to avoid accidental churn.
- End-to-end tests via MCP client script (select + inject flow), plus scenario replays based on `agentic` eval harness.

## Open Questions

- Do we need multilingual support now? (Probably later.)
- Should we allow custom org patterns? (Future feature; design to append additional catalog entries synced via memory service.)
- How do we surface pattern success metrics to the user in MCP responses? (Maybe include top 3 stats in resource.) Leverage `mcp-agent` presentation utilities if we adopt them.
