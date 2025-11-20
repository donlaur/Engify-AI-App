# Agile + WSJF Content Strategy

**Date:** 2025-11-20  
**Status:** Planning  
**Goal:** Create Agile landing page + enhance WSJF prompt page

---

## Current State

### Existing WSJF Prompt
- **ID:** `82f919d5-a189-40d6-9332-7f3605c3abf3`
- **Slug:** `wsjf-prioritization-agile`
- **Title:** "WSJF (Weighted Shortest Job First) Prioritization for Vp"
- **Content:** Basic formula + scoring template (minimal)
- **URL:** `https://www.engify.ai/prompts/wsjf-prioritization-agile`

### Available Data Sources
✅ **JSON Files Exist:**
- `prompts.json` (807KB, 296+ prompts)
- `patterns.json` (59KB, 18 patterns)
- `workflows.json` (292KB, workflows)
- `pain-points.json` (230KB, 31 pain points)
- `recommendations.json` (121KB)
- `guardrails.json` (204KB, 70 guardrails)

### Infrastructure
- Static JSON + ISR architecture (ADR-012)
- MongoDB as source of truth
- JSON regeneration via webhooks
- Loaders: `load-*-from-json.ts` pattern

---

## Content Updates Needed

### 1. WSJF Prompt Page Enhancement

**Current Issues:**
- Too basic (just formula)
- No pain points addressed
- No workflows linked
- Missing AI time estimation reality check
- No guardrails or compliance info

**New Sections to Add:**

#### A. Pain Points This Solves
- Link to existing pain points (tactical-trap, plan-derailment)
- Add new: "AI Time Estimation Inaccuracy"

#### B. The WSJF Pattern
- Explain Engify's approach
- Link to relevant pattern in patterns.json

#### C. Formula + Calculation Example
- Keep existing formula
- Add real-world example with numbers
- Show calculation step-by-step

#### D. Workflows
- Link to task-decomposition-prompt-flow
- Link to architecture-intent-validation

#### E. AI Time Estimation Reality Check
- **Key Message:** "Focused engineering time is often 5-10% of naive AI estimates"
- Explain MCP time estimator
- Show before/after example

#### F. Guardrails & Compliance
- EU AI Act warnings (high-risk decisions)
- Link to ai-governance-scorecard workflow

#### G. FAQs
- "How accurate are AI time estimates?"
- "What's the difference between WSJF and other prioritization?"
- "How does Engify improve WSJF?"

---

### 2. New Agile Landing Page

**URL:** `/agile` or `/agile-ai`

**Page Structure:**

#### Hero Section
- **Headline:** "Run Agile Smarter with AI"
- **Subheadline:** "Patterns, workflows, and guardrails for Scrum, Kanban, SAFe, and Lean teams"
- **CTA:** "Explore Agile Prompts" + "Try WSJF Calculator"

#### Pain Points Section
- Show 3-4 relevant pain points
- Focus on: planning, estimation, prioritization

#### Agile Frameworks
- **Scrum:** Sprint planning, retrospectives, daily standups
- **Kanban:** WIP limits, flow optimization
- **SAFe:** PI planning, WSJF prioritization
- **Lean Portfolio:** Value stream mapping
- **Dual-track Agile:** Discovery + delivery

#### WSJF & Time Reality Section
- Explain WSJF
- **Highlight:** "AI estimates are often 10-20x too high. Focused time is 5-10% of naive estimates."
- Link to WSJF prompt
- Show MCP time estimator

#### Workflow Gallery
- Filter workflows by agile methodology
- Show: task-decomposition, daily-merge-discipline, release-readiness-runbook

#### Prompt/Pattern Spotlight
- Featured prompts for each framework
- Link to full prompt library filtered by role

#### Guardrails & Compliance
- EU AI Act for high-risk decisions
- Link to ai-governance-scorecard

#### Testimonials/Stats
- (If available from existing data)

#### FAQ
- "How does AI improve Agile?"
- "What's the ROI of AI in Agile?"
- "Is WSJF better than story points?"

---

## MongoDB Updates Required

### New Content to Create

#### 1. New Pain Point: "AI Time Estimation Inaccuracy"
```json
{
  "slug": "ai-time-estimation-inaccuracy",
  "title": "AI Time Estimation Inaccuracy",
  "description": "AI models consistently overestimate project timelines by 10-20x. Focused engineering time is often 5-10% of naive AI estimates.",
  "coreProblem": "AI lacks context on developer focus time vs. total elapsed time",
  "impact": "Inflated timelines, missed deadlines, poor resource planning",
  "examples": [
    "AI says 3 days → Reality: 4-6 hours focused time",
    "AI says 2 weeks → Reality: 2-3 days actual work"
  ],
  "relatedPrompts": ["wsjf-prioritization-agile"],
  "relatedWorkflows": ["task-decomposition-prompt-flow"],
  "relatedRecommendations": ["Use MCP time estimator for grounded estimates"]
}
```

#### 2. Enhanced WSJF Prompt Content
- Expand from ~500 chars to ~2000 chars
- Add sections: Pain Points, Workflows, Time Reality, FAQs
- Link to new pain point

#### 3. New Workflow: "Agile Sprint Planning with AI"
- Step-by-step workflow
- Integrates WSJF, time estimation, capacity planning

---

## Implementation Plan

### Phase 1: Content Creation (MongoDB)
1. Create new pain point (ai-time-estimation-inaccuracy)
2. Update WSJF prompt with expanded content
3. Create new workflow (optional)

### Phase 2: JSON Regeneration
1. Run generation scripts or trigger webhook
2. Verify JSON files updated

### Phase 3: WSJF Page Updates
1. Update `/src/app/prompts/[id]/page.tsx` if needed
2. Ensure all new content renders correctly
3. Test SEO metadata

### Phase 4: Agile Landing Page
1. Create `/src/app/agile/page.tsx`
2. Reuse `RoleLandingPageContent` pattern
3. Create agile-specific content in `/src/lib/data/agile-content.ts`
4. Add to sitemap

### Phase 5: Testing & Deployment
1. Test locally
2. Verify all links work
3. Check SEO metadata
4. Deploy

---

## Key Messages

1. **AI Time Estimation Reality:** "Focused engineering time is 5-10% of naive AI estimates"
2. **WSJF Value:** "Prioritize by economic value, not gut feeling"
3. **Engify Advantage:** "Patterns + workflows + guardrails = better Agile"

---

## Next Steps

1. ✅ Review this strategy
2. ⏳ Create MongoDB content (pain point, updated prompt)
3. ⏳ Build Agile landing page
4. ⏳ Test and deploy
