# Condensed Guardrail Format

## Problem with Current Format

The detailed markdown format produces verbose, AI-generated-sounding content that:
- Reads like documentation, not actionable workflows
- Is too long for quick reference
- Sounds templated and repetitive
- Doesn't match existing workflow style

## Proposed Condensed Format

Match the existing workflow JSON structure - concise, scannable, actionable.

### Format Structure

```markdown
### 1. Prevent Data Corruption in AI-Generated Migrations

**Slug:** `prevent-data-corruption-in-ai-generated-migrations`
**Category:** data-integrity | **Severity:** critical

**Problem:** AI generates migrations without rollback scripts or validation checks, causing data loss when migrations fail.

**Prevention Checklist:**
- [ ] Require every migration to include a tested rollback script
- [ ] Run migrations against a test database and verify rollback works
- [ ] Add pre/post migration validation checks (row counts, checksums)
- [ ] Wrap migration logic in a transaction to ensure atomicity
- [ ] Provide current schema.sql to AI before generating migrations

**Early Detection:**
- CI: Fail PR if migration file exists without rollback
- Static: Lint for missing transaction blocks
- Runtime: Alert on migration errors during deploy window

**Mitigation:**
1. Execute rollback script immediately
2. If rollback fails, restore from pre-migration backup
3. Run data reconciliation scripts to identify corruption scope

**Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
**Pain Points:** `pain-point-20-schema-drift`, `pain-point-01-almost-correct-code`
```

### Key Changes from Current Format

1. **Shorter Sections** - Cut "Incident Pattern" from paragraph to one sentence
2. **Checklist Format** - Bullet points instead of numbered implementation steps
3. **Condensed Detection** - One line per type instead of detailed explanations
4. **Brief Mitigation** - 3 numbered steps instead of detailed procedures
5. **Inline Links** - Workflows and pain points on one line
6. **No Redundancy** - Remove effectiveness percentages and verbose descriptions

### Comparison

**Current Format (Verbose):**
- ~500 words per guardrail
- 5-6 detailed sections
- Multiple paragraphs per strategy
- Effectiveness estimates
- Step-by-step implementation details

**Condensed Format:**
- ~150 words per guardrail
- 4 sections: Problem, Checklist, Detection, Mitigation
- Bullet points and one-liners
- Actionable items only
- Quick reference style

## Example: Condensed Version

### 1. Prevent Data Corruption in AI-Generated Migrations

**Slug:** `prevent-data-corruption-in-ai-generated-migrations`
**Category:** data-integrity | **Severity:** critical

**Problem:** AI generates migrations without rollback scripts or validation, causing data loss when migrations fail in production.

**Prevention Checklist:**
- [ ] Require every migration to include a tested rollback script
- [ ] Run migration + rollback in CI against test database
- [ ] Add pre/post validation checks (row counts, checksums)
- [ ] Wrap migration in a transaction for atomicity
- [ ] Provide current schema.sql to AI before generating migrations

**Early Detection:**
- CI: Fail PR if migration exists without rollback file
- Static: Lint for missing transaction blocks in migrations
- Runtime: Alert on `migration_errors` during deploy window

**Mitigation:**
1. Execute rollback script immediately
2. If rollback fails, restore from pre-migration backup
3. Run reconciliation queries to identify corruption scope

**E-E-A-T Signals (SEO):**
- **Experience:** Informed by Engify audits of legacy systems where AI proposed invalid migrations.
- **Expertise:** References ADRs, diff tools, and schema validation prompts.
- **Authoritativeness:** Cites Qodo's 2025 developer survey showing 65% report AI guessing schema.
- **Trustworthiness:** Calls out manual verification and acknowledges AI limits.

**Workflows:** `ai-behavior/stop-schema-guessing`, `process/release-readiness-runbook`
**Pain Points:** `pain-point-20-schema-drift`, `pain-point-05-missing-context`

---

### 12. Prevent SQL Injection Vulnerability

**Slug:** `prevent-sql-injection-vulnerability`
**Category:** security | **Severity:** critical

**Problem:** AI generates queries using string concatenation instead of parameterized queries, allowing attackers to inject malicious SQL.

**Prevention Checklist:**
- [ ] Mandate parameterized queries (prepared statements) - no string formatting
- [ ] Use ORM query builders instead of raw SQL where possible
- [ ] Limit database user permissions (no DROP, TRUNCATE)
- [ ] Run SAST scans (Snyk, SonarQube) in CI to detect SQLi

**Early Detection:**
- CI: SAST tool scans for string concatenation in SQL queries
- Static: Linter rule flags `f"SELECT * FROM users WHERE id = '{id}'"`
- Runtime: WAF blocks common SQLi payloads

**Mitigation:**
1. Block attacker IP at WAF level
2. Refactor vulnerable code to use parameterized queries
3. Audit database logs for data exfiltration or corruption

**E-E-A-T Signals (SEO):**
- **Experience:** Security engineers reviewed Engify's AI-assisted commits and noted missing scans.
- **Expertise:** Checklist references industry-standard SAST/SCA practices (Snyk, SonarQube).
- **Authoritativeness:** Veracode's 2025 AI Security Report provides quantitative backing.
- **Trustworthiness:** Acknowledges manual review requirements and cites OWASP guidance.

**Workflows:** `security/security-guardrails`, `process/release-readiness-runbook`
**Pain Points:** `pain-point-17-insecure-code`, `pain-point-22-missing-validations`

---

## Benefits of Condensed Format

1. **Scannable** - Easy to quickly find what you need
2. **Actionable** - Focus on "do this" not "here's why"
3. **Consistent** - Matches existing workflow style
4. **Less AI-Sounding** - Shorter, more direct language
5. **Maintainable** - Easier to update and review
6. **SEO-Optimized** - Includes E-E-A-T signals for Google ranking

## Recommendation

Update the research prompt to request condensed format (~200-250 words per guardrail) with:
- One-sentence problem statement
- 5-6 item checklist (actionable items)
- One-line detection methods
- 3-step mitigation
- **E-E-A-T signals** (4 one-sentence signals for SEO)
- Inline workflow/pain point links

This matches your existing workflow style, prevents AI-generated verbosity, and optimizes for Google E-E-A-T ranking factors.

