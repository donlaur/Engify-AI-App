# Prompt Audit & Enrichment Scripts Reference

**Last Updated:** 2025-11-05  
**Purpose:** Complete reference guide for all prompt audit, enrichment, and improvement scripts

---

## 📋 Quick Reference

### Most Common Commands

```bash
# Quick audit (fastest - 2 agents, skips version > 1)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick

# Audit by category (e.g., engineering prompts)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=code-generation --quick

# Audit by role (e.g., PM prompts)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --role=product-manager --quick

# Pre-enrich prompts before auditing
pnpm tsx scripts/content/pre-enrich-prompts.ts

# Track audit progress
pnpm tsx scripts/content/track-progress.ts
```

---

## 🔍 Audit Scripts

### Main Audit Script

**File:** `scripts/content/audit-prompts-patterns.ts`

**Purpose:** Comprehensive audit system with multi-agent scoring across 8 categories.

**Usage:**
```bash
# Basic audit
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts

# Quick mode (fastest - only 2 agents)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick

# Fast mode (skip execution testing)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --fast

# Quick + Fast (fastest possible)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick --fast

# Filter by category
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=code-generation

# Filter by role
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --role=engineer

# Filter by both category and role
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=documentation --role=engineer

# Limit number of prompts
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --limit=10

# Audit patterns only
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=patterns

# Audit both prompts and patterns
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=both
```

**Flags:**
- `--type=prompts|patterns|both` - What to audit (required)
- `--quick` or `-q` - Quick mode: only 2 core agents (fastest)
- `--fast` or `-f` - Skip execution testing
- `--category=<category>` - Filter by category
- `--role=<role>` - Filter by role
- `--limit=<number>` - Limit number of items to audit
- `--no-cache` - Disable Redis caching

**Behavior:**
- ✅ Automatically skips prompts with version > 1 (already improved)
- ✅ Saves audit results incrementally (no data loss on crash)
- ✅ Shows skip count summary at end
- ✅ Uses Redis caching for faster subsequent audits

**Categories:**
- `code-generation`
- `debugging`
- `documentation`
- `testing`
- `refactoring`
- `architecture`
- `learning`
- `general`

**Roles:**
- `engineer`
- `product-manager`
- `engineering-manager`
- `architect`
- `designer`
- `qa`
- `devops-sre`
- `scrum-master`
- `product-owner`
- `c-level`

---

### Audit Single Prompt

**File:** `scripts/content/audit-one-prompt.ts`

**Purpose:** Audit a single prompt by ID.

**Usage:**
```bash
# Audit specific prompt
pnpm tsx scripts/content/audit-one-prompt.ts --id=<prompt-id>

# Quick mode
pnpm tsx scripts/content/audit-one-prompt.ts --id=<prompt-id> --quick

# Fast mode (skip execution test)
pnpm tsx scripts/content/audit-one-prompt.ts --id=<prompt-id> --fast
```

---

### Quick Audit Three Prompts

**File:** `scripts/content/quick-audit-three.ts`

**Purpose:** Quick test audit on first 3 prompts.

**Usage:**
```bash
pnpm tsx scripts/content/quick-audit-three.ts
```

---

### Review Audit Scores

**File:** `scripts/content/review-audit-scores.ts`

**Purpose:** Review audit score distribution and identify high/low scores.

**Usage:**
```bash
# Review all scores
pnpm tsx scripts/content/review-audit-scores.ts

# Review only audits
pnpm tsx scripts/content/review-audit-scores.ts --type=audits

# Review only enrichments
pnpm tsx scripts/content/review-audit-scores.ts --type=enrichments
```

---

## ✨ Enrichment Scripts

### Enrich Single Prompt

**File:** `scripts/content/enrich-prompt.ts`

**Purpose:** Enrich a single prompt with AI-generated content (case studies, examples, etc.).

**Usage:**
```bash
# Enrich specific prompt
pnpm tsx scripts/content/enrich-prompt.ts --id=<prompt-id>
```

**Behavior:**
- ✅ Only enriches prompts at audit version 1
- ✅ Skips if already enriched (version > 1)
- ✅ Generates: case studies, examples, use cases, best practices, whatIs, whyUse, etc.

---

### Enrich All Version 1 Prompts

**File:** `scripts/content/enrich-all-version1.ts`

**Purpose:** Batch enrich all prompts that are at audit version 1.

**Usage:**
```bash
pnpm tsx scripts/content/enrich-all-version1.ts
```

**Behavior:**
- ✅ Finds all prompts with latest audit version = 1
- ✅ Enriches each one sequentially
- ✅ Skips prompts already enriched

---

### Pre-Enrich Prompts (Before Auditing)

**File:** `scripts/content/pre-enrich-prompts.ts`

**Purpose:** Add missing basic fields (whatIs, whyUse, metaDescription, slug) before auditing to improve scores.

**Usage:**
```bash
# Pre-enrich all prompts
pnpm tsx scripts/content/pre-enrich-prompts.ts

# Pre-enrich with limit
pnpm tsx scripts/content/pre-enrich-prompts.ts --limit=20

# Dry run (preview changes)
pnpm tsx scripts/content/pre-enrich-prompts.ts --dry-run
```

**What it does:**
- Adds `whatIs` explanations (if missing or too short)
- Adds `whyUse` reasons (if missing)
- Adds `metaDescription` (if missing or too short)
- Optimizes `slug` (if missing or poor quality)

**Behavior:**
- ✅ Safe to run multiple times (only fills missing fields)
- ✅ Improves audit scores by ensuring basic SEO fields exist

---

## 🔄 Batch Improvement Scripts

### Batch Improve from Audits

**File:** `scripts/content/batch-improve-from-audits.ts`

**Purpose:** Analyze audit patterns and apply improvements across multiple prompts.

**Usage:**
```bash
# Analyze patterns and improve (only prompts with existing audits)
pnpm tsx scripts/content/batch-improve-from-audits.ts

# Dry run (preview changes)
pnpm tsx scripts/content/batch-improve-from-audits.ts --dry-run

# Limit number of prompts
pnpm tsx scripts/content/batch-improve-from-audits.ts --limit=20

# Audit prompts without audits first, then improve
pnpm tsx scripts/content/batch-improve-from-audits.ts --audit-first
```

**Behavior:**
- ✅ Analyzes common issues, recommendations, missing elements
- ✅ Applies SEO improvements (slug, meta description, keywords)
- ✅ Adds case studies based on patterns
- ✅ Only processes prompts with existing audits (unless `--audit-first`)
- ✅ Saves incrementally (no data loss on crash)

---

### Batch Audit & Enrich

**File:** `scripts/content/batch-audit-enrich.ts`

**Purpose:** Audit and enrich prompts in batches of 20.

**Usage:**
```bash
pnpm tsx scripts/content/batch-audit-enrich.ts
```

**Behavior:**
- ✅ Processes prompts in batches of 20
- ✅ Marks prompts as processed
- ✅ Skips already processed prompts

---

## 📊 Progress & Status Scripts

### Track Progress

**File:** `scripts/content/track-progress.ts`

**Purpose:** Show progress of batch operations (audits, enrichments).

**Usage:**
```bash
# Track all progress
pnpm tsx scripts/content/track-progress.ts

# Track only audits
pnpm tsx scripts/content/track-progress.ts --type=audits

# Track only enrichments
pnpm tsx scripts/content/track-progress.ts --type=enrichments
```

**Shows:**
- Total prompts audited / not audited
- Average score
- Score distribution (high/medium/low)
- Enrichment status (whatIs, whyUse, metaDescription, case studies)
- Recent audit activity

---

### Verify Audit

**File:** `scripts/content/verify-audit.ts`

**Purpose:** Verify audit and enrichment results for a specific prompt.

**Usage:**
```bash
pnpm tsx scripts/content/verify-audit.ts --id=<prompt-id>
```

---

### Show Prompt URL

**File:** `scripts/content/show-prompt-url.ts`

**Purpose:** Display the public URL and enrichment status of a prompt.

**Usage:**
```bash
pnpm tsx scripts/content/show-prompt-url.ts --id=<prompt-id>
```

---

## 🧪 Testing Scripts

### Test Rubric Scoring

**File:** `scripts/content/test-rubric-scoring.ts`

**Purpose:** Test the updated rubric and scoring logic on a specific prompt.

**Usage:**
```bash
pnpm tsx scripts/content/test-rubric-scoring.ts --id=<prompt-id>
```

---

### Test Rubric First Five

**File:** `scripts/content/test-rubric-first-five.ts`

**Purpose:** Audit first 5 prompts and compare scores with previous audits.

**Usage:**
```bash
pnpm tsx scripts/content/test-rubric-first-five.ts
```

---

### Quick Audit & Improve

**File:** `scripts/content/quick-audit-improve.ts`

**Purpose:** Audit one prompt and immediately apply improvements.

**Usage:**
```bash
pnpm tsx scripts/content/quick-audit-improve.ts
```

---

## 📚 Database Scripts

### Sync AI Models

**File:** `scripts/db/sync-ai-models-latest.ts`

**Purpose:** Sync AI models from providers (OpenAI, Anthropic, Google) to database.

**Usage:**
```bash
pnpm tsx scripts/db/sync-ai-models-latest.ts
```

**Or via API:**
```bash
curl -X POST https://engify.ai/api/admin/ai-models/sync
```

---

## 🎯 Common Workflows

### Workflow 1: Initial Audit of New Prompts

```bash
# Step 1: Pre-enrich with basic fields
pnpm tsx scripts/content/pre-enrich-prompts.ts

# Step 2: Quick audit (fastest)
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --quick

# Step 3: Review scores
pnpm tsx scripts/content/review-audit-scores.ts

# Step 4: Enrich version 1 prompts
pnpm tsx scripts/content/enrich-all-version1.ts
```

### Workflow 2: Audit Specific Category

```bash
# Audit all engineering prompts
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --category=code-generation --role=engineer --quick

# Review results
pnpm tsx scripts/content/review-audit-scores.ts
```

### Workflow 3: Audit PM Prompts You Just Added

```bash
# Audit all PM prompts
pnpm tsx scripts/content/audit-prompts-patterns.ts --type=prompts --role=product-manager --quick

# Review results
pnpm tsx scripts/content/review-audit-scores.ts
```

### Workflow 4: Batch Improvement

```bash
# Step 1: Audit prompts without audits first
pnpm tsx scripts/content/batch-improve-from-audits.ts --audit-first --limit=20

# Step 2: Apply improvements based on audit patterns
pnpm tsx scripts/content/batch-improve-from-audits.ts --limit=20

# Step 3: Track progress
pnpm tsx scripts/content/track-progress.ts
```

### Workflow 5: Single Prompt Improvement Cycle

```bash
# Step 1: Audit
pnpm tsx scripts/content/audit-one-prompt.ts --id=<prompt-id>

# Step 2: Check results
pnpm tsx scripts/content/verify-audit.ts --id=<prompt-id>

# Step 3: Enrich (if at version 1)
pnpm tsx scripts/content/enrich-prompt.ts --id=<prompt-id>

# Step 4: View URL
pnpm tsx scripts/content/show-prompt-url.ts --id=<prompt-id>
```

---

## 📝 Notes

### Scoring Guidelines

- **First versions:** Should score 5.0-6.5/10
- **Improved versions:** Should score 6.5-8.0/10
- **Highly improved (multiple iterations):** Should score 8.0-9.5/10

### Skip Logic

- Scripts automatically skip prompts with `auditVersion > 1`
- Only audits prompts at version 1 or without audits
- Prevents re-auditing improved prompts

### Incremental Saves

- All scripts save results immediately after each prompt completes
- No data loss if process crashes or times out
- Each audit creates a new version record

### Quick Mode vs Full Mode

- **Quick Mode:** 2 agents only (Grading Rubric + Completeness) - ~30-40 seconds per prompt
- **Full Mode:** All agents - ~60-90 seconds per prompt
- **Fast Mode:** Skip execution testing - saves ~20 seconds per prompt

---

## 🔗 Related Documentation

- **Learning System:** `docs/development/LEARNING_SYSTEM.md`
- **Audit Workflow:** `docs/CURRENT_TASK_PROMPT_AUDIT_WORKFLOW.md`
- **AI Models Sync:** `docs/development/AI_MODELS_SYNC.md`
- **Prompt Enrichment:** `docs/content/PROMPT_ENRICHMENT_REQUIREMENTS.md`

---

**Remember:** Always use `--quick` for initial batch audits, then use full mode for important prompts that need improvement.

