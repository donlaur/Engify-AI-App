# Pillar Page Audit & Gap Analysis

**Date:** 2025-11-20  
**Status:** Analysis Complete

---

## Executive Summary

**Good news:** We already have 4 complete pillar pages covering most of the SEO cluster.  
**Gap:** We need to add 2 new pillars (AI-SDLC and AI-Enabled Agile) to the registry and create spoke content.

---

## Existing Pillar Pages (Complete)

### ✅ 1. Prompt Engineering Masterclass
- **URL:** `/learn/prompt-engineering-masterclass`
- **Status:** Complete
- **Target:** Practitioners (engineers, tech leads)
- **Keywords:** prompt engineering training, prompt patterns, chain of thought
- **Overlap:** Covers patterns but not SDLC/Agile workflows

### ✅ 2. AI Upskilling Program for Engineering Teams
- **URL:** `/ai-upskilling-program-for-engineering-teams`
- **Status:** Complete (MongoDB)
- **Target:** Engineering leaders (CTOs, VPs, Directors)
- **Keywords:** AI training ROI, upskilling, competency framework
- **Overlap:** Covers training but not day-to-day SDLC

### ✅ 3. Ultimate Guide to AI-Assisted Software Development
- **URL:** `/ultimate-guide-to-ai-assisted-software-development`
- **Status:** Complete (MongoDB)
- **Target:** Hybrid (engineers + leaders)
- **Keywords:** AI in SDLC, AI-driven development lifecycle, AI-DLC
- **Overlap:** ⚠️ **STRONG OVERLAP** with proposed "AI-Enabled SDLC" pillar
- **Note:** Already targets "AI in SDLC", "AI-driven development lifecycle"

### ✅ 4. Building an AI-First Engineering Organization
- **URL:** `/building-an-ai-first-engineering-organization`
- **Status:** Complete (MongoDB)
- **Target:** Engineering leaders
- **Keywords:** AI transformation, AI-first vs AI-native, AI maturity model
- **Overlap:** Organizational strategy, not day-to-day workflows

---

## Proposed New Pillars (From SEO Cluster)

### 🆕 PILLAR 1: AI-Enabled Software Development Lifecycle (AI-SDLC)
**Status:** ⚠️ **PARTIAL OVERLAP** with existing "Ultimate Guide"

**Recommendation:** 
- **Option A (Recommended):** Update existing "Ultimate Guide" to be the AI-SDLC pillar
  - Already has keywords: "AI in SDLC", "AI-driven development lifecycle"
  - Add PBVR, memory layer, guardrails sections
  - Retarget to "AI-enabled software development lifecycle"
  
- **Option B:** Create new page, deprecate old
  - Risk: Lose existing SEO juice
  - Benefit: Clean slate with new structure

**Decision:** Update existing page, add to pillar registry as AI-SDLC

---

### 🆕 PILLAR 2: AI-Enabled Agile
**Status:** ✅ **NO OVERLAP** - This is net new

**Recommendation:** 
- Keep as new pillar (already created at `/ai-enabled-agile`)
- Add to pillar registry
- Target keywords: "AI in Agile software development", "AI-augmented Agile"

---

### 🆕 PILLAR 3: AI-Enabled Estimation & WSJF
**Status:** ⚠️ **PARTIAL COVERAGE** in existing content

**Current Coverage:**
- WSJF prompt exists: `/prompts/wsjf-prioritization-agile`
- Time estimation pain point: (to be created)

**Recommendation:**
- **Option A:** Create dedicated pillar page
- **Option B:** Make this a spoke under AI-Enabled Agile
- **Recommended:** Option B (spoke, not pillar) - estimation is a subset of Agile

---

### 🆕 PILLAR 4: AI-Assisted Engineering Workflows
**Status:** ⚠️ **STRONG OVERLAP** with "Prompt Engineering Masterclass"

**Current Coverage:**
- Prompt Engineering Masterclass covers patterns
- Workflows exist in `/workflows`
- PBVR not yet documented as pillar

**Recommendation:**
- **Option A:** Expand Prompt Engineering Masterclass to include workflows
- **Option B:** Create new "AI-Assisted Engineering Workflows" pillar
- **Recommended:** Option A (expand existing) - patterns + workflows are related

---

## Recommended Action Plan

### Phase 1: Update Existing Pillars (2-3 hours)

**1. Update "Ultimate Guide to AI-Assisted Software Development"**
- Retarget as "AI-Enabled Software Development Lifecycle (AI-SDLC)"
- Add sections:
  - PBVR cycle (Plan → Build → Verify → Refactor)
  - Memory layer (persistent context)
  - Guardrails (prevent AI slop)
  - Time estimation reality check (5-10% rule)
- Update pillar registry with new keywords

**2. Update "Prompt Engineering Masterclass"**
- Add workflows section
- Link to PBVR, guardrails, patterns
- Position as "AI-Assisted Engineering Workflows" pillar

### Phase 2: Add New Pillars (1 hour)

**3. Register AI-Enabled Agile in Pillar Registry**
- Already created at `/ai-enabled-agile`
- Add to `pillar-pages.ts`
- Link to existing content

**4. Create WSJF/Estimation Spoke (not pillar)**
- Expand WSJF prompt page
- Create time estimation pain point
- Link from AI-Enabled Agile

### Phase 3: Create Spoke Content (Future)

**Spokes for AI-SDLC:**
- "What Is an AI-Enabled SDLC?" (definition)
- "AI-SDLC vs Traditional SDLC" (comparison)
- "How to Implement AI-Enabled SDLC" (step-by-step)
- "The AI Memory Layer" (deep dive)
- "Guardrails in AI-SDLC" (deep dive)
- "AI-SDLC Tool Integrations" (Jira, GitHub, MCP)

**Spokes for AI-Enabled Agile:**
- "AI in Agile Software Development" (overview)
- "AI-Enabled Sprint Planning Workflow" (PBVR + WSJF)
- "AI-Enabled Backlog Grooming Workflow"
- "AI-Augmented Standup Workflow"
- "AI-Enabled Retrospectives"
- "AI-Augmented Agile Sprint Ceremonies"

**Spokes for AI-Assisted Engineering Workflows:**
- "The PBVR Cycle" (deep dive)
- "AI Patterns for Engineers" (20 most useful)
- "AI-Enabled PR Reviews"
- "AI-Enabled Test Generation"
- "AI-Enabled Documentation Workflow"

---

## Updated Pillar Structure

```
PILLAR 1: AI-Enabled Software Development Lifecycle (AI-SDLC)
├── URL: /ultimate-guide-to-ai-assisted-software-development (update)
├── Status: Complete (needs update)
├── Spokes: 6 articles (to be created)
└── Keywords: ai-enabled software development lifecycle, ai-sdlc, ai in sdlc

PILLAR 2: AI-Enabled Agile
├── URL: /ai-enabled-agile (new, already created)
├── Status: Complete
├── Spokes: 6 articles (to be created)
└── Keywords: ai in agile software development, ai-enabled agile

PILLAR 3: Prompt Engineering Masterclass → AI-Assisted Engineering Workflows
├── URL: /learn/prompt-engineering-masterclass (expand)
├── Status: Complete (needs expansion)
├── Spokes: 5 articles (to be created)
└── Keywords: ai assisted software engineering workflows, patterns, pbvr

PILLAR 4: AI Upskilling Program
├── URL: /ai-upskilling-program-for-engineering-teams
├── Status: Complete
├── Spokes: Existing
└── Keywords: ai training, upskilling, roi

PILLAR 5: Building an AI-First Engineering Organization
├── URL: /building-an-ai-first-engineering-organization
├── Status: Complete
├── Spokes: Existing
└── Keywords: ai transformation, ai-first, organizational change
```

---

## SEO Impact Analysis

### ✅ What We Already Rank For
- AI in SDLC (Ultimate Guide)
- AI training/upskilling (Upskilling Program)
- Prompt engineering (Masterclass)
- AI transformation (AI-First Organization)

### 🆕 What We'll Rank For (After Updates)
- **AI-enabled software development lifecycle** (updated Ultimate Guide)
- **AI in Agile software development** (new AI-Enabled Agile)
- **AI-augmented Agile** (new AI-Enabled Agile)
- **AI-enabled estimation** (spoke under Agile)
- **PBVR cycle** (spoke under Workflows)

### 📊 Keyword Gaps (Still Missing)
- "AI-enabled sprint planning workflow" (spoke needed)
- "AI-enabled backlog grooming" (spoke needed)
- "AI-augmented standup" (spoke needed)
- "AI time estimation reality check" (spoke needed)
- "Guardrails in AI-SDLC" (spoke needed)

---

## Next Steps

1. ✅ **Register AI-Enabled Agile in pillar registry** (5 min)
2. ⏳ **Update Ultimate Guide → AI-SDLC** (2-3 hours)
3. ⏳ **Expand Prompt Masterclass → Workflows** (1-2 hours)
4. ⏳ **Create spoke content** (future, 20-30 articles)

---

## Files to Update

1. `/src/lib/data/pillar-pages.ts` - Add AI-Enabled Agile
2. `/ultimate-guide-to-ai-assisted-software-development` (MongoDB) - Update to AI-SDLC
3. `/learn/prompt-engineering-masterclass/page.tsx` - Add workflows section
4. Create spoke articles (future)

---

**Recommendation:** We have strong pillar coverage. Focus on:
1. Registering AI-Enabled Agile (already built)
2. Updating existing pillars with new keywords
3. Creating spoke content over time

**Estimated Time:** 3-5 hours focused work (not 2 weeks!)
