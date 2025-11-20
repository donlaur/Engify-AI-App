# SEO Sitemap Structure - AI-SDLC Content Cluster

**Date:** 2025-11-20  
**Status:** Implementation Ready

---

## Pillar Pages (4 Main Hubs)

### 1. AI-Enabled SDLC
**URL:** `/ai-sdlc`  
**Status:** ✅ Complete  
**Word Count Target:** 8,000

**Supporting Articles (Spokes):**
- `/ai-sdlc/what-is-ai-sdlc` - Definition & overview
- `/ai-sdlc/vs-traditional` - Comparison with traditional SDLC
- `/ai-sdlc/implementation` - Step-by-step implementation guide
- `/ai-sdlc/memory-layer` - Deep dive on AI memory
- `/ai-sdlc/guardrails` - Guardrails for AI-SDLC
- `/ai-sdlc/tool-integrations` - GitHub, Jira, VS Code, MCP

---

### 2. AI-Enabled Agile
**URL:** `/ai-enabled-agile`  
**Status:** ✅ Complete  
**Word Count Target:** 6,000

**Supporting Articles (Spokes):**
- `/ai-enabled-agile/overview` - What changes vs traditional Agile
- `/ai-enabled-agile/sprint-planning` - AI-enabled sprint planning workflow
- `/ai-enabled-agile/backlog-grooming` - AI-enabled backlog grooming
- `/ai-enabled-agile/standups` - AI-augmented standup workflow
- `/ai-enabled-agile/retrospectives` - AI-augmented retros
- `/ai-enabled-agile/ceremonies` - Complete breakdown of all ceremonies

---

### 3. AI Estimation Reality Check
**URL:** `/ai-estimation-reality-check`  
**Status:** ⏳ Planned  
**Word Count Target:** 5,000

**Supporting Articles (Spokes):**
- `/ai-estimation-reality-check/why-ai-fails` - Why AI time estimates fail
- `/ai-estimation-reality-check/5-percent-rule` - The 5% rule explained
- `/ai-estimation-reality-check/wsjf` - WSJF + AI prioritization
- `/ai-estimation-reality-check/capacity-planning` - AI-enabled capacity planning
- `/ai-estimation-reality-check/roadmap-planning` - AI in roadmap planning

---

### 4. AI-Assisted Engineering Workflows
**URL:** `/ai-workflows`  
**Status:** ⏳ Planned  
**Word Count Target:** 7,000

**Supporting Articles (Spokes):**
- `/ai-workflows/pbvr` - The PBVR cycle explained
- `/ai-workflows/patterns` - 20 must-use AI patterns for engineers
- `/ai-workflows/pr-review` - AI-enabled PR reviews
- `/ai-workflows/testing` - AI-enabled test generation
- `/ai-workflows/documentation` - AI-enabled documentation workflow
- `/ai-workflows/refactoring` - AI-enabled debugging & refactoring

---

## Complete URL Structure

```
Pillar Pages (4)
├── /ai-sdlc
├── /ai-enabled-agile
├── /ai-estimation-reality-check
└── /ai-workflows

AI-SDLC Cluster (6 spokes)
├── /ai-sdlc/what-is-ai-sdlc
├── /ai-sdlc/vs-traditional
├── /ai-sdlc/implementation
├── /ai-sdlc/memory-layer
├── /ai-sdlc/guardrails
└── /ai-sdlc/tool-integrations

AI-Enabled Agile Cluster (6 spokes)
├── /ai-enabled-agile/overview
├── /ai-enabled-agile/sprint-planning
├── /ai-enabled-agile/backlog-grooming
├── /ai-enabled-agile/standups
├── /ai-enabled-agile/retrospectives
└── /ai-enabled-agile/ceremonies

AI Estimation Cluster (5 spokes)
├── /ai-estimation-reality-check/why-ai-fails
├── /ai-estimation-reality-check/5-percent-rule
├── /ai-estimation-reality-check/wsjf
├── /ai-estimation-reality-check/capacity-planning
└── /ai-estimation-reality-check/roadmap-planning

AI Workflows Cluster (6 spokes)
├── /ai-workflows/pbvr
├── /ai-workflows/patterns
├── /ai-workflows/pr-review
├── /ai-workflows/testing
├── /ai-workflows/documentation
└── /ai-workflows/refactoring
```

**Total Pages:** 4 pillars + 23 spokes = **27 pages**

---

## Internal Linking Strategy

### Pillar → Spoke Links
Each pillar page links to all its spokes in a "Related Articles" section.

### Spoke → Pillar Links
Each spoke has breadcrumbs: `Home > [Pillar] > [Article]`

### Cross-Pillar Links
- AI-SDLC ↔ AI-Enabled Agile (Agile is a practice within SDLC)
- AI-Enabled Agile ↔ AI Estimation (Estimation is part of Agile)
- AI-SDLC ↔ AI Workflows (Workflows are part of SDLC)

### Links to Existing Content
- All pillars link to `/patterns` (Patterns Library)
- All pillars link to `/workflows` (Workflows Library)
- All pillars link to `/guardrails` (Guardrails Library)
- Estimation pillar links to `/prompts/wsjf-prioritization-agile`

---

## SEO Metadata Templates

### Pillar Page Template
```typescript
{
  title: '[Pillar Name]: The Complete Guide | Engify',
  description: '[150-160 char description with primary keyword]',
  keywords: '[primary keyword], [secondary keywords]',
  openGraph: {
    title: '[Pillar Name]: The Complete Guide',
    description: '[Description]',
    type: 'website',
  }
}
```

### Spoke Page Template
```typescript
{
  title: '[Article Title] | [Pillar Name] | Engify',
  description: '[150-160 char description with target keyword]',
  keywords: '[target keyword], [related keywords]',
  openGraph: {
    title: '[Article Title]',
    description: '[Description]',
    type: 'article',
  }
}
```

---

## Content Brief Template (For Spokes)

### Article: [Title]
**Target Keyword:** [keyword]  
**Parent Pillar:** [pillar name]  
**Word Count:** 1,500-2,500  
**Audience:** [practitioners/leaders/hybrid]

**H2 Structure:**
1. Introduction
2. [Main concept]
3. [How it works]
4. [Examples]
5. [Implementation]
6. [Common pitfalls]
7. FAQs

**Internal Links:**
- Link to parent pillar (breadcrumb + body)
- Link to 2-3 related spokes
- Link to 1-2 Engify patterns/workflows
- Link to related pillar (if applicable)

**External Links:**
- 1-2 authoritative sources (for E-E-A-T)

**CTAs:**
- Primary: [Try pattern/workflow]
- Secondary: [Download guide/checklist]

---

## Priority Implementation Order

### Phase 1 (Complete) ✅
1. AI-SDLC pillar page
2. AI-Enabled Agile pillar page

### Phase 2 (Next 2-3 weeks)
1. AI Estimation Reality Check pillar page
2. AI Workflows pillar page
3. Top 5 spokes (highest search volume):
   - `/ai-sdlc/what-is-ai-sdlc`
   - `/ai-enabled-agile/sprint-planning`
   - `/ai-estimation-reality-check/why-ai-fails`
   - `/ai-workflows/pbvr`
   - `/ai-workflows/patterns`

### Phase 3 (1-2 months)
1. Remaining 18 spoke articles
2. Internal linking optimization
3. Schema markup for all pages

---

## Sidebar Navigation (Recommended)

```
AI-Enabled Development
├── AI-SDLC
├── AI-Enabled Agile
├── AI Estimation
└── AI Workflows

Core Concepts
├── PBVR Cycle
├── Memory Layer
├── Guardrails
└── Patterns

Resources
├── Patterns Library
├── Workflows Library
├── Guardrails Library
└── Prompts Library
```

---

## Success Metrics

### SEO Metrics (6 months)
- **Target:** Rank top 10 for all 4 pillar keywords
- **Target:** Rank top 20 for 15+ spoke keywords
- **Target:** 10,000+ organic visits/month from cluster

### Engagement Metrics
- **Target:** 3+ min avg time on pillar pages
- **Target:** 30%+ internal click-through rate
- **Target:** 10%+ conversion to pattern/workflow usage

---

## Next Steps

1. ✅ Register pillars in `pillar-pages.ts`
2. ⏳ Create AI Estimation pillar page
3. ⏳ Create AI Workflows pillar page
4. ⏳ Create top 5 spoke articles
5. ⏳ Implement internal linking
6. ⏳ Add schema markup

**Estimated Time:** 10-15 hours focused work for Phase 2
