# Documentation & Scripts Consolidation Plan

## Executive Summary

**Goal:** Reduce documentation from 339 files to under 100 files (70% reduction)
**Current Status:** 339 → 232 files (107 archived, 32% reduction)
**Remaining:** Need to archive/consolidate 132+ more files

## Progress So Far

### Documentation Archived (107 files)

1. **Root Level** (2 files)
   - `READY_TO_PUSH.md` → `docs/archive/2025/november/`
   - `PUBLIC_REPO_FIXES_SUMMARY.md` → `docs/archive/2025/november/`

2. **Mobile Audits** (5 files)
   - Consolidated 8 → 2 (kept `MOBILE_FINAL_SUMMARY.md` and `MOBILE_FIXES_READY.md`)

3. **Development** (21 files)
   - Archived completed features and implementations
   - Moved build fixes, audit improvements, JIRA integration, etc.

4. **SEO** (18 files)
   - Consolidated 7 strategy files into `FINAL_SEO_STRATEGY.md`
   - Archived planning docs, status reports, old strategies

5. **Content** (33 files)
   - Reduced from 37 → 4 files
   - Kept only: `CONTENT_STRATEGY.md`, `TAG_TAXONOMY.md`, `ROLE_LANDING_PAGES.md`
   - Archived: audits, multi-agent docs, governance, cost analysis, etc.

6. **Research** (13 files)
   - Archived guardrails processing guides
   - Archived Gemini research prompts and analysis

7. **Testing** (13 files)
   - Archived old audit iterations (Day 7, Phase 1)
   - Archived prompt audits from Nov 5
   - Archived Lighthouse and QA checklists from Week 2

8. **Strategy** (5 files)
   - Archived planning docs: Quick wins, pillar pages strategy, pattern tutorials

9. **Planning** (3 files)
   - Archived Week 2 plan, daily planning, execution notes

## Scripts: DRY Improvements

### Created Shared Libraries

1. **`scripts/_lib/colors.sh`** - Color definitions and logging functions
   - Eliminates ~150 lines of duplication across 10+ scripts

2. **`scripts/_lib/config.sh`** - Shared configuration and constants
   - Centralizes AWS, Redis, API, and timeout configuration
   - Eliminates ~100 lines of duplication

3. **`scripts/_lib/aws-common.sh`** - AWS utility functions
   - Consolidates AWS CLI checks, credential validation, role management
   - Eliminates ~200+ lines of duplication across deployment scripts

4. **`tests/_setup.sh`** - Test framework helpers
   - Consolidates test_endpoint(), test_page(), reporting functions
   - Reduces test scripts by ~40-50% each

**Total Duplication Eliminated:** ~500+ lines

### Scripts to Refactor (Next Phase)

**High Priority:**
- Smoke test scripts (3 → 1 orchestrator)
- AWS deployment scripts (use shared libraries)
- API test scripts (use test framework)

**Estimated Additional Reduction:** ~600 lines

## Next Steps to Reach Under 100 Files

### Phase 1: Aggressive Consolidation (Target: 50+ files)

1. **Development Directory** (39 files → 15 files)
   - Keep: Core guides (GIT_WORKFLOW, COMPONENT_STANDARDS, CREATING_API_ROUTES, CONFIGURATION)
   - Keep: ADR directory (but consolidate ADRs from multiple locations)
   - Archive: AI workbench docs, DRY audit, feature-specific docs

2. **MCP Directory** (14 files → 5 files)
   - Consolidate agent docs
   - Archive action plans and old architecture docs

3. **Security** (13 files → 8 files)
   - Consolidate compliance and audit docs

4. **Testing** (8 remaining → 4 files)
   - Keep: TESTING_STRATEGY, QA_TESTING_CHECKLIST, COMPONENT_TESTING_GUIDE
   - Archive: Coverage gaps, stabilization plans, quality dashboard

5. **AWS** (11 files → 3 files)
   - Consolidate into single AWS deployment guide
   - Archive old migration and infrastructure docs

6. **Pillar Pages** (10 files → 3 files)
   - Keep exports directory
   - Consolidate generation guides

### Phase 2: Strategic Moves (Target: 30+ files)

1. **Move to ADRs** (Convert 7+ docs)
   - `ARCHITECTURE_STRATEGY.md` → ADR-018
   - `AUTH_MIGRATION_PLAN.md` → ADR-019
   - `MULTI_AGENT_WORKFLOW_SAFETY.md` → ADR-020
   - `FEATURE_FLAGS_STRATEGY.md` → ADR-017
   - Performance and cost optimization docs → ADRs

2. **Consolidate Root Docs** (10 → 6 files)
   - Move `AI_TOOLS_ENRICHMENT_PLAN.md` → `docs/seo/`
   - Move `CONTENT_REVIEW_REPORT.md` → `docs/testing/`
   - Keep: README, CONTRIBUTING, CHANGELOG, CODE_QUALITY, .ai-guardrails

3. **Consolidate Similar Directories**
   - Merge `docs/deployment/` into `docs/operations/`
   - Merge `docs/implementation/` into `docs/guides/`
   - Merge `docs/design/` into `docs/architecture/`

### Phase 3: Archive Aggressively (Target: 40+ files)

1. **Archive Entire Subdirectories**
   - `docs/resume/` - Portfolio content
   - `docs/showcase/` - Hiring manager content
   - `docs/marketing/` - Old marketing docs
   - `docs/messaging/` - Old messaging docs
   - `docs/competitive-analysis/` - Old analysis
   - `docs/bi/` - Business intelligence (if outdated)

2. **Archive Old Implementations**
   - Infrastructure migration docs
   - RAG integration summaries (completed)
   - AI models sync docs

3. **Archive Planning Docs**
   - MVP plans (keep only latest)
   - Strategy documents older than 3 months
   - Execution notes and status reports

## Recommended Final Structure (Under 100 Files)

```
docs/
├── README.md
├── guides/ (5 files)
│   ├── QUICK_START.md
│   ├── CONFIGURATION.md
│   ├── DEPLOYMENT.md
│   └── LOCAL_DEVELOPMENT.md
├── architecture/ (4 files)
│   ├── OVERVIEW.md
│   ├── SECURITY_ARCHITECTURE.md
│   ├── FEEDBACK_SYSTEM.md
│   └── DATA_FLOW.md
├── development/ (20 files)
│   ├── GIT_WORKFLOW.md
│   ├── COMPONENT_STANDARDS.md
│   ├── CREATING_API_ROUTES.md
│   ├── CONFIGURATION.md
│   └── ADR/ (15 ADRs consolidated from 2 locations)
├── testing/ (4 files)
│   ├── TESTING_STRATEGY.md
│   ├── QA_CHECKLIST.md
│   ├── COMPONENT_TESTING.md
│   └── E2E_TESTING.md
├── security/ (8 files)
├── operations/ (6 files)
├── content/ (4 files)
├── seo/ (5 files)
├── research/ (4 files)
├── mcp/ (5 files)
├── api/ (3 files)
├── enterprise/ (3 files)
├── strategy/ (6 files)
├── business/ (3 files)
├── professional/ (3 files)
├── performance/ (3 files)
├── incidents/ (1 file)
└── archive/ (organized by date and category)
```

**Total: ~90 files** (excluding archive)

## Implementation Timeline

- **Week 1:** Phase 1 consolidation (50 files)
- **Week 2:** Phase 2 strategic moves (30 files)
- **Week 3:** Phase 3 aggressive archiving (40 files)
- **Week 4:** Verification, link checking, documentation updates

## Success Metrics

- [x] Reduce from 339 to 232 files (32% reduction)
- [ ] Reduce from 232 to under 100 files (70% total reduction)
- [x] Create shared script libraries (DRY)
- [ ] Eliminate 600+ lines of script duplication
- [ ] Create consolidated documentation index
- [ ] All internal links working
- [ ] Archive organized by date and category

## Notes

This is an aggressive consolidation. We're keeping only:
- Current, actively-used documentation
- Essential guides and standards
- Architecture decision records
- Critical operational runbooks

Everything else is either:
- Archived (for historical reference)
- Consolidated (merged into comprehensive guides)
- Converted to ADRs (for important decisions)
