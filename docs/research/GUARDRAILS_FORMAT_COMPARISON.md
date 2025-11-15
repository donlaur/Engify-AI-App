# Guardrail Format Comparison

## Issue

The Gemini research output is too verbose and reads like AI-generated documentation. It doesn't match the concise, actionable style of existing workflows.

## Comparison

### Current Format (Verbose) - ~500 words per guardrail

```markdown
### 1. Prevent Data Corruption in AI-Generated Migrations

**Slug:** `prevent-data-corruption-in-ai-generated-migrations`
**Subcategory:** data-integrity
**Severity:** critical

#### Description

This guardrail provides actionable strategies to ensure AI-generated database migration scripts are safe, reversible, and validated against data loss or corruption. Teams will learn to implement automated validation checks and robust rollback plans, ensuring that any AI-generated schema change is trustworthy and recoverable.

#### Incident Pattern

**Name:** Unvalidated Schema Migration Failure
**Why It Happens:** AI excels at generating syntactically correct migration scripts, especially when prompted. However, it often lacks the context of production data, complex cross-service dependencies, or the existing schema's state. This can lead the AI to "hallucinate" schema needs or generate a destructive migration (e.g., dropping a column) without a corresponding, validated rollback script, leading to data loss upon failure.
**Real-World Impact:** A failed or corrupt migration can lock tables, silently truncate data, corrupt production data, and cause catastrophic, unrecoverable downtime.

#### Prevention Strategies ⭐

**Strategy 1: Enforce Reversible Migrations (Generate Rollbacks)**
- **Description:** Mandate that every AI-generated migration script (up script) is accompanied by a corresponding, validated rollback script (down script). This provides an immediate, tested exit path and is foundational to a zero-downtime migration strategy.
- **Workflow Match:** process/release-readiness-runbook
- **Prompt Ideas:** rollback-script-generator, "Given this 'up' migration script, generate the exact 'down' rollback script that reverses these changes."
- **Implementation Steps:**
  1. Update AI prompts to explicitly request both the migration and its exact rollback script.
  2. Integrate a CI check that fails any pull request that adds a migration file (e.g., V1.2__add_column.sql) without a corresponding rollback file.
  3. Enforce that all migration logic (both up and down) runs within a single database transaction to ensure atomicity.
  4. In the CI pipeline, run the up migration against a test database, and then immediately run the down migration to prove reversibility.
- **Effectiveness:** Prevents 90-95% of unrecoverable migration incidents.
- **Guardrails:** CI job that lints for up/down script pairs. Transaction enforcement.

[... continues for 4-5 more strategies with similar detail ...]
```

**Problems:**
- Too verbose (500+ words)
- Reads like documentation, not quick reference
- Repetitive structure feels AI-generated
- Too many nested sections
- Effectiveness percentages feel templated

---

### Condensed Format (Recommended) - ~150 words per guardrail

```markdown
### 1. Prevent Data Corruption in AI-Generated Migrations

**Slug:** `prevent-data-corruption-in-ai-generated-migrations`
**Category:** data-integrity | **Severity:** critical

**Problem:** AI generates migrations without rollback scripts or validation checks, causing data loss when migrations fail in production.

**Prevention Checklist:**
- [ ] Require every migration to include a tested rollback script
- [ ] Run migration + rollback in CI against test database
- [ ] Add pre/post validation checks (row counts, checksums)
- [ ] Wrap migration in a transaction for atomicity
- [ ] Provide current schema.sql to AI before generating migrations

**Early Detection:**
- **CI/CD:** Fail PR if migration exists without rollback file
- **Static:** Lint for missing transaction blocks in migrations
- **Runtime:** Alert on `migration_errors` during deploy window

**Mitigation:**
1. Execute rollback script immediately
2. If rollback fails, restore from pre-migration backup
3. Run reconciliation queries to identify corruption scope

**Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
**Pain Points:** `pain-point-20-schema-drift`, `pain-point-05-missing-context`
```

**Benefits:**
- Concise (150 words)
- Scannable checklist format
- Direct, actionable language
- Matches existing workflow style
- Less AI-sounding

---

## Side-by-Side Example

### Prevent SQL Injection Vulnerability

**Verbose Format:**
- 3 detailed strategy sections with descriptions, workflow matches, prompt ideas, implementation steps, effectiveness estimates, guardrails
- Multiple paragraphs per section
- ~400 words

**Condensed Format:**
- One-sentence problem statement
- 5 bullet point checklist items
- One-line detection methods
- 3-step mitigation
- ~150 words

---

## Recommendation

**Use the condensed format** for:
1. Better readability and scannability
2. Matching existing workflow style
3. Less AI-generated verbosity
4. Faster review and updates
5. More actionable, practical content

**Updated prompt** emphasizes:
- Keep under 200 words per guardrail
- Focus on actionable items
- Match existing workflow style
- Avoid verbose explanations

