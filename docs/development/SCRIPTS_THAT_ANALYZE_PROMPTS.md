# Scripts That Analyze Prompts in Database

This document lists all scripts that query or analyze prompts from the MongoDB database.

## Analysis Scripts

### 1. `audit-prompts-patterns.ts`
**Purpose**: Comprehensive audit of prompts and patterns
**Queries**: Filters by type, category, role, limit
**Key Features**:
- Audits prompts with latest auditVersion
- Prioritizes prompts with lowest auditVersion first
- Can filter by role (e.g., `--role=product-manager`)
- Supports quick mode (2 agents) and fast mode (skip execution testing)

### 2. `compare-external-pm-prompts.ts`
**Purpose**: Compare external prompt sources to our database
**Queries**: Filters PM prompts by role (`pm`, `product-manager`, etc.)
**Key Features**:
- Identifies gaps between external sources and our DB
- Red Hat analysis of best practices
- Prioritizes missing prompts (high/medium/low)

### 3. `analyze-general-prompts.ts`
**Purpose**: Analyze prompt distribution and quality
**Queries**: All prompts
**Key Features**:
- Category distribution
- Tag analysis
- Sample prompts review

### 4. `expand-prompt-library.ts`
**Purpose**: Analyze gaps and generate new prompts
**Queries**: All prompts
**Key Features**:
- Identifies missing roles
- Category distribution analysis
- Generates new prompts with AI
- Red Hat review of generated prompts

### 5. `audit-database-content.ts`
**Purpose**: Audit overall database content quality
**Queries**: Prompts, patterns, learning resources
**Key Features**:
- Quality checks across collections
- Missing fields analysis
- Completeness scoring

### 6. `batch-improve-from-audits.ts`
**Purpose**: Apply improvements based on audit results
**Queries**: Prompts with audit results
**Key Features**:
- Analyzes audit patterns
- Applies SEO improvements
- Adds case studies
- Improves completeness

### 7. `check-audit-status.ts`
**Purpose**: Check audit status of prompts
**Queries**: Prompts and audit results
**Key Features**:
- Shows which prompts need auditing
- Audit version tracking
- Status summary

### 8. `show-category-dist.ts`
**Purpose**: Show category distribution
**Queries**: All prompts
**Key Features**:
- Category counts
- Role distribution

### 9. `test-all-ai-models.ts`
**Purpose**: Test prompts across multiple AI models
**Queries**: Specific prompts or sample prompts
**Key Features**:
- Tests prompt execution on different models
- Performance comparison
- Can filter by prompt ID

### 10. `review-audit-scores.ts`
**Purpose**: Review audit scores and patterns
**Queries**: Prompt audit results
**Key Features**:
- Score distribution
- Common issues
- Recommendations

## Common Query Patterns

Most scripts use similar patterns:
```typescript
// Get all prompts
const prompts = await db.collection('prompts').find({}).toArray();

// Filter by role
const prompts = await db.collection('prompts').find({
  role: { $in: ['pm', 'product-manager'] }
}).toArray();

// Filter by category
const prompts = await db.collection('prompts').find({
  category: 'product'
}).toArray();

// Get prompts with audit results
const audits = await db.collection('prompt_audit_results')
  .find({ promptId: promptId })
  .sort({ auditVersion: -1 })
  .toArray();
```

## Recommendations

1. **Consolidate Analysis**: Many scripts do similar analysis - consider consolidating
2. **Shared Utilities**: Extract common query patterns into utility functions
3. **Script Registry**: Create a registry of analysis scripts with descriptions
4. **Documentation**: Each script should document what it analyzes and why

