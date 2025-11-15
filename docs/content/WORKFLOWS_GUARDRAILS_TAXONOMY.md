# Workflows & Guardrails Taxonomy

## Content Structure

### 1. **Workflows** (Process Checklists)
**What:** Step-by-step procedures for doing something with AI-assisted development.

**Examples:**
- `keep-prs-under-control` - How to manage PR size
- `stop-schema-guessing` - How to prevent schema hallucinations
- `daily-merge-discipline` - How to prevent merge conflicts
- `cursor-obedience-kit` - How to control AI agents

**Structure:**
- Manual checklist items
- Problem statement
- Related resources (prompts, patterns)
- Research citations
- Category: `ai-behavior`, `code-quality`, `process`, `security`, `governance`, etc.

---

### 2. **Guardrails** (Prevention Workflows)
**What:** Prevention-focused workflows that stop specific incidents before they happen.

**Relationship:** Guardrails ARE workflows (prevention category).

**Examples:**
- `prevent-data-corruption-migrations` - Prevents data loss in migrations
- `prevent-sql-injection` - Prevents SQL injection vulnerabilities
- `prevent-n-plus-one-queries` - Prevents performance issues
- `prevent-hardcoded-secrets` - Prevents secret exposure

**Structure:** Same as workflows, PLUS:
- Severity (critical, high, medium, low)
- Incident pattern description
- Prevention strategies (primary focus)
- Early detection methods
- Mitigation & response procedures

**Category:** `guardrails` (with subcategories: `data-integrity`, `security`, `performance`, `availability`, `financial`, `integration`, `testing`)

---

### 3. **Pain Points** (Problems Solved)
**What:** Problems/challenges in AI-assisted development that workflows and guardrails address.

**Examples:**
- `almost-correct-code` - AI generates code that looks right but has bugs
- `trust-deficit` - Developers don't trust AI output
- `schema-drift` - AI causes database/app mismatches

**Structure:**
- Description, problem statement, impact
- Real-world examples
- Solution workflows (links to workflows/guardrails)
- Related pain points
- Keywords for SEO

**Relationship:**
- Workflows and guardrails solve pain points
- Each workflow/guardrail has `painPointIds` array
- Each pain point has `solutionWorkflows` array

---

## Unified Structure

```
/workflows
  ├── Listing Page (All: Workflows + Guardrails)
  │   ├── Filter: Type (All | Workflows | Guardrails)
  │   ├── Filter: Category (ai-behavior, code-quality, guardrails, etc.)
  │   └── Filter: Guardrail Subcategory (data-integrity, security, etc.)
  │
  ├── Workflows: /workflows/[category]/[slug]
  │   ├── ai-behavior/stop-schema-guessing
  │   ├── code-quality/keep-prs-under-control
  │   └── process/daily-merge-discipline
  │
  ├── Guardrails: /workflows/guardrails/[subcategory]/[slug]
  │   ├── guardrails/data-integrity/prevent-data-corruption
  │   ├── guardrails/security/prevent-sql-injection
  │   └── guardrails/performance/prevent-n-plus-one-queries
  │
  └── Pain Points: /workflows/pain-points/[slug]
      ├── almost-correct-code
      ├── trust-deficit
      └── schema-drift
```

---

## Taxonomy Summary

| Type | Purpose | Focus | Examples |
|------|---------|-------|----------|
| **Workflows** | How to do something | Process/procedure | PR management, merge discipline, agent control |
| **Guardrails** | Prevent incidents | Prevention/detection | Prevent data corruption, prevent SQL injection |
| **Pain Points** | Problems solved | Problem description | Almost correct code, trust deficit, schema drift |

**Key Insight:** 
- Guardrails are workflows with prevention focus
- Both workflows and guardrails solve pain points
- Guardrails have additional fields (severity, incident pattern, detection, mitigation)

---

## Content Relationships

```
Pain Point (Problem)
    ↓ (solved by)
Workflow/Guardrail (Solution)
    ↓ (uses)
Prompts, Patterns, Tools (Resources)
```

**Example:**
- Pain Point: `almost-correct-code`
- Workflow: `code-quality/keep-prs-under-control`
- Guardrail: `guardrails/testing/prevent-missing-edge-case-tests`
- Resources: Prompts, patterns, tools

---

## Implementation

### Schema Extension
Add `"guardrails"` to workflow categories. Guardrails use workflow schema + optional guardrail-specific fields:

```typescript
{
  category: "guardrails",
  subcategory: "data-integrity" | "security" | "performance" | ...
  severity: "critical" | "high" | "medium" | "low",
  incidentPattern: { name, realWorldImpact, whyItHappens },
  preventionStrategies: [...],
  earlyDetection: {...},
  mitigationResponse: {...}
}
```

### Pages
- Workflows: `/workflows/[category]/[slug]`
- Guardrails: `/workflows/guardrails/[subcategory]/[slug]`
- Pain Points: `/workflows/pain-points/[slug]`

### Listing Page
- Shows workflows + guardrails together
- Filter by type, category, severity
- Guardrails show severity badge

---

## Content Volume

- **26 Workflows** (existing)
- **70 Guardrails** (prevention patterns - to be created)
- **31 Pain Points** (existing)
- **Total: 127 content items**

---

## Next Steps

1. ✅ **Taxonomy Defined:** Workflows, Guardrails (prevention workflows), Pain Points
2. ✅ **Schema Extension:** Add guardrails category with subcategories
3. 🔄 **Research Prompt:** Generate 70 guardrail entries with prevention strategies
4. 🔄 **Build Pages:** Guardrail listing and detail pages
5. 🔄 **Cross-Link:** Link guardrails to workflows, pain points, prompts
