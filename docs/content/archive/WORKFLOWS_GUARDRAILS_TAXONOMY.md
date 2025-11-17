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

### 4. **Recommendations** (Strategic Guidance & Best Practices)
**What:** Strategic guidance that explains WHY you should adopt certain practices, WHEN to apply them, and WHAT benefits they provide. Recommendations provide the rationale and context; workflows provide the HOW.

**Key Distinction from Workflows:**
- **Recommendations** = Strategic (WHY, WHEN, WHAT) - Focus on rationale, context, and business value
- **Workflows** = Tactical (HOW) - Focus on step-by-step checklists and procedures
- Recommendations often link to workflows that implement them (e.g., "You should enforce small PRs" → links to `keep-prs-under-control` workflow)

**Examples:**
- `start-with-few-shot-learning` - WHY: Improves accuracy; WHEN: Complex tasks; links to `trust-but-verify-triage` workflow
- `implement-guardrails-for-critical-paths` - WHY: Security at scale; WHEN: Day 1; links to security guardrail workflows
- `choose-ai-model-by-task` - WHY: Cost optimization; WHEN: Tool selection; strategic guidance, not a checklist
- `enforce-small-prs-for-ai-code` - WHY: Quality and velocity; WHEN: All teams; links to `keep-prs-under-control` workflow

**Structure:**
- Recommendation statement (what you should do)
- Why this matters (business/technical rationale - the core value)
- When to apply (context/scenarios - timing and conditions)
- Implementation guidance (high-level guidance, not detailed steps)
- Related workflows/guardrails/pain points (links to HOW)
- Keywords for SEO

**Relationship:**
- Recommendations provide strategic rationale (WHY/WHEN/WHAT)
- Workflows provide tactical implementation (HOW)
- Recommendations often link to workflows that implement them
- Some recommendations may have implementation guidance, but detailed step-by-step checklists belong in workflows
- Recommendations help avoid pain points (proactive strategic guidance)

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
  │
  └── Recommendations: /workflows/recommendations/[slug]
      ├── start-with-few-shot-learning
      ├── use-guardrails-for-critical-paths
      └── choose-ai-model-by-task
```

---

## Taxonomy Summary

| Type | Purpose | Focus | Examples |
|------|---------|-------|----------|
| **Workflows** | How to do something | Tactical/process/procedure | PR management (step-by-step checklist), merge discipline, agent control |
| **Guardrails** | Prevent incidents | Prevention/detection | Prevent data corruption, prevent SQL injection |
| **Pain Points** | Problems solved | Problem description | Almost correct code, trust deficit, schema drift |
| **Recommendations** | Why/when/what to do | Strategic guidance/rationale | Start with few-shot (WHY: accuracy), use guardrails (WHY: security), enforce small PRs (WHY: quality) |

**Key Insight:** 
- Guardrails are workflows with prevention focus
- Both workflows and guardrails solve pain points
- **Recommendations provide strategic guidance (WHY/WHEN/WHAT); workflows provide tactical implementation (HOW)**
- Recommendations often link to workflows that implement them (e.g., "enforce small PRs" recommendation → `keep-prs-under-control` workflow)
- Guardrails have additional fields (severity, incident pattern, detection, mitigation)

---

## Content Relationships

```
Recommendation (Strategic: WHY/WHEN/WHAT)
    ↓ (provides rationale and context)
    ↓ (links to)
Workflow/Guardrail (Tactical: HOW)
    ↓ (implements the recommendation)
    ↓ (solves)
Pain Point (Problem)
    ↓ (uses)
Prompts, Patterns, Tools (Resources)
```

**Example:**
- **Recommendation**: `enforce-small-prs-for-ai-code` (WHY: Quality and velocity; WHEN: All teams)
- **Workflow**: `code-quality/keep-prs-under-control` (HOW: Step-by-step checklist)
- **Pain Point**: `oversized-prs` (Problem: Large PRs cause review fatigue)
- **Guardrail**: (Optional automation of the workflow)
- **Resources**: Prompts, patterns, tools

**Key Pattern:**
- Recommendations explain WHY/WHEN/WHAT (strategic guidance)
- Workflows provide HOW (tactical checklists)
- Recommendations often link to workflows that implement them
- Some recommendations have high-level implementation guidance, but detailed steps belong in workflows

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
- Recommendations: `/workflows/recommendations/[slug]`

### Listing Page
- Shows workflows + guardrails together
- Filter by type, category, severity
- Guardrails show severity badge
- Recommendations can be shown separately or integrated into workflows page

---

## Content Volume

- **26 Workflows** (existing)
- **70 Guardrails** (prevention patterns - existing)
- **31 Pain Points** (existing)
- **0 Recommendations** (to be created)
- **Total: 127+ content items**

---

## Next Steps

1. ✅ **Taxonomy Defined:** Workflows, Guardrails (prevention workflows), Pain Points, Recommendations
2. ✅ **Schema Extension:** Add guardrails category with subcategories
3. ✅ **Guardrails Complete:** 70 guardrail entries with prevention strategies
4. ✅ **Pages Built:** Guardrail listing and detail pages
5. 🔄 **Recommendations:** Define schema and create initial recommendations
6. 🔄 **Cross-Link:** Link recommendations to workflows, guardrails, pain points, prompts
