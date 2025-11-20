# Enhanced Content Generation System

**Date:** 2025-11-20  
**Status:** Design Ready  
**Purpose:** Build comprehensive content generation system with multiple content types and AI model integration

---

## Overview

Extend existing content generation system in OpsHub to support multiple content types with AI-powered question answering and automated generation.

**Key Features:**
1. **Multiple Content Types** - Pillar pages, articles, hub & spoke, news updates, etc.
2. **AI Question Answering** - Ask AI about content strategy before generating
3. **Model Selection** - Use existing AI models infrastructure
4. **Multi-Agent Workflow** - SEO, SME, Agile, Editor agents
5. **Batch Processing** - Generate multiple pieces at once

---

## Content Types

### 1. Pillar Page
**Purpose:** SEO anchor page (8,000+ words)  
**Agents:** SEO Expert → SME → Agile Expert → Editor  
**Features:**
- H1/H2/H3 structure optimization
- Code examples
- Internal linking
- FAQ schema
- Meta descriptions

**Example:** "AI-Enabled Software Development Lifecycle"

---

### 2. Hub & Spoke
**Purpose:** Topic cluster (1 hub + 5-10 spokes)  
**Agents:** SEO Expert → SME → Editor  
**Features:**
- Hub page (3,000-5,000 words)
- Spoke articles (1,500-2,500 words each)
- Internal linking map
- Topic clustering

**Example:** 
- Hub: "AI in Agile"
- Spokes: "AI Sprint Planning", "AI Backlog Grooming", etc.

---

### 3. Tutorial Article
**Purpose:** Step-by-step guide (1,500-3,000 words)  
**Agents:** SME → Editor  
**Features:**
- Step-by-step instructions
- Code examples
- Screenshots/diagrams
- Prerequisites
- Troubleshooting

**Example:** "How to Use PBVR Cycle in Your Workflow"

---

### 4. Guide Article
**Purpose:** Comprehensive reference (2,000-4,000 words)  
**Agents:** SME → Editor  
**Features:**
- In-depth coverage
- Best practices
- Anti-patterns
- Real-world examples

**Example:** "Complete Guide to AI Guardrails"

---

### 5. News Update
**Purpose:** Short news/update (300-800 words)  
**Agents:** Editor only  
**Features:**
- Quick turnaround
- News-style writing
- Links to sources
- Brief analysis

**Example:** "OpenAI Releases GPT-4.5: What It Means for Developers"

---

### 6. Case Study
**Purpose:** Real-world example (1,500-2,500 words)  
**Agents:** SME → Editor  
**Features:**
- Problem/Solution/Results format
- Metrics and data
- Quotes (if available)
- Lessons learned

**Example:** "How Team X Reduced Sprint Planning Time by 60% with AI"

---

### 7. Comparison Article
**Purpose:** Compare tools/approaches (1,500-2,500 words)  
**Agents:** SME → Editor  
**Features:**
- Side-by-side comparison
- Pros/cons
- Use case recommendations
- Decision matrix

**Example:** "Cursor vs Copilot vs Windsurf: Which AI Coding Assistant?"

---

### 8. Best Practices
**Purpose:** Actionable recommendations (1,000-2,000 words)  
**Agents:** SME → Agile Expert → Editor  
**Features:**
- Numbered list format
- Do's and don'ts
- Examples
- Common mistakes

**Example:** "10 Best Practices for AI-Enabled Sprint Planning"

---

## AI Question Answering System

### Purpose
Allow admins to ask questions about content strategy before generating, using existing AI models.

### Questions to Answer
1. **"What content type should I use for [topic]?"**
   - Analyzes topic and recommends content type
   - Explains reasoning

2. **"What keywords should I target for [topic]?"**
   - Suggests primary + secondary keywords
   - Provides search volume estimates (if available)

3. **"What's the best structure for [content type] about [topic]?"**
   - Generates H1/H2/H3 outline
   - Suggests sections

4. **"Should this be a pillar page or hub & spoke?"**
   - Analyzes topic breadth
   - Recommends structure

5. **"What internal links should I include?"**
   - Suggests related content
   - Provides linking strategy

### Implementation
```typescript
// AI Q&A Component
<ContentStrategyQA
  question="What content type should I use for 'AI in Agile'?"
  onAnswer={(answer) => {
    // Pre-fill form with recommendations
    setContentType(answer.recommendedType);
    setKeywords(answer.suggestedKeywords);
    setOutline(answer.suggestedOutline);
  }}
/>
```

---

## Enhanced UI Design

### Tab 1: Content Strategy (NEW)
**Purpose:** Ask AI questions before generating

**Layout:**
```
┌─────────────────────────────────────────┐
│ Content Strategy Assistant              │
├─────────────────────────────────────────┤
│ Ask AI about your content strategy:     │
│                                          │
│ [Text area for question]                │
│                                          │
│ Model: [GPT-4 ▼]                        │
│                                          │
│ [Ask AI] button                          │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ AI Response:                        │ │
│ │                                     │ │
│ │ Based on your topic "AI in Agile", │ │
│ │ I recommend:                        │ │
│ │                                     │ │
│ │ Content Type: Hub & Spoke           │ │
│ │ Hub: "AI-Enabled Agile" (pillar)    │ │
│ │ Spokes: 6 articles                  │ │
│ │                                     │ │
│ │ Keywords:                           │ │
│ │ - ai in agile (primary)             │ │
│ │ - ai sprint planning                │ │
│ │ - ai scrum                          │ │
│ │                                     │ │
│ │ [Use These Recommendations] button  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Tab 2: Generate Content (ENHANCED)
**Purpose:** Generate content with selected type

**Layout:**
```
┌─────────────────────────────────────────┐
│ Content Generation                      │
├─────────────────────────────────────────┤
│ Content Type: [Pillar Page ▼]          │
│   - Pillar Page                         │
│   - Hub & Spoke                         │
│   - Tutorial Article                    │
│   - Guide Article                       │
│   - News Update                         │
│   - Case Study                          │
│   - Comparison Article                  │
│   - Best Practices                      │
│                                          │
│ Generator Type: [Multi-Agent ▼]        │
│   - Single Agent (Fast, $0.01/piece)   │
│   - Multi-Agent (Quality, $0.25/piece) │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Pillar Page Options:                │ │
│ │                                     │ │
│ │ ☑ Include code examples             │ │
│ │ ☑ Include FAQs                      │ │
│ │ ☑ Include internal links            │ │
│ │ ☑ Generate meta description         │ │
│ │                                     │ │
│ │ Target Word Count: [8000]           │ │
│ │                                     │ │
│ │ Primary Keyword: [ai-enabled sdlc]  │ │
│ │ Secondary Keywords:                 │ │
│ │ [ai-sdlc, ai in sdlc, ...]          │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ Topics (one per line):                  │
│ [Text area]                             │
│                                          │
│ [Generate Batch] button                 │
└─────────────────────────────────────────┘
```

---

### Tab 3: Job Status (EXISTING)
**Purpose:** Track generation progress

**Enhancements:**
- Show content type for each job
- Show agent progress (SEO → SME → Agile → Editor)
- Show estimated cost per piece
- Show word count achieved

---

## Content Type Configurations

```typescript
// src/lib/content/content-types.ts

export interface ContentTypeConfig {
  id: string;
  name: string;
  description: string;
  targetWordCount: number;
  agents: ('seo' | 'sme' | 'agile' | 'editor')[];
  features: {
    codeExamples?: boolean;
    faqs?: boolean;
    internalLinks?: boolean;
    metaDescription?: boolean;
    images?: boolean;
    diagrams?: boolean;
  };
  estimatedCost: number;
  estimatedTime: number; // minutes
}

export const CONTENT_TYPES: Record<string, ContentTypeConfig> = {
  'pillar-page': {
    id: 'pillar-page',
    name: 'Pillar Page',
    description: 'SEO anchor page (8,000+ words)',
    targetWordCount: 8000,
    agents: ['seo', 'sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 0.25,
    estimatedTime: 10,
  },
  'hub-spoke': {
    id: 'hub-spoke',
    name: 'Hub & Spoke',
    description: '1 hub + 5-10 spokes',
    targetWordCount: 3000, // hub
    agents: ['seo', 'sme', 'editor'],
    features: {
      internalLinks: true,
      metaDescription: true,
    },
    estimatedCost: 1.50, // hub + 6 spokes
    estimatedTime: 60,
  },
  'tutorial': {
    id: 'tutorial',
    name: 'Tutorial Article',
    description: 'Step-by-step guide (1,500-3,000 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
  },
  'guide': {
    id: 'guide',
    name: 'Guide Article',
    description: 'Comprehensive reference (2,000-4,000 words)',
    targetWordCount: 3000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
      faqs: true,
    },
    estimatedCost: 0.15,
    estimatedTime: 7,
  },
  'news': {
    id: 'news',
    name: 'News Update',
    description: 'Short news/update (300-800 words)',
    targetWordCount: 500,
    agents: ['editor'],
    features: {},
    estimatedCost: 0.02,
    estimatedTime: 2,
  },
  'case-study': {
    id: 'case-study',
    name: 'Case Study',
    description: 'Real-world example (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      images: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
  },
  'comparison': {
    id: 'comparison',
    name: 'Comparison Article',
    description: 'Compare tools/approaches (1,500-2,500 words)',
    targetWordCount: 2000,
    agents: ['sme', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.10,
    estimatedTime: 5,
  },
  'best-practices': {
    id: 'best-practices',
    name: 'Best Practices',
    description: 'Actionable recommendations (1,000-2,000 words)',
    targetWordCount: 1500,
    agents: ['sme', 'agile', 'editor'],
    features: {
      codeExamples: true,
    },
    estimatedCost: 0.08,
    estimatedTime: 4,
  },
};
```

---

## Implementation Plan

### Phase 1: Content Type System (2-3 hours)
1. Create `/src/lib/content/content-types.ts` (1 hour)
2. Create `/src/lib/content/content-strategy-qa.ts` (1 hour)
3. Update API schema to support content types (1 hour)

### Phase 2: AI Q&A Component (2-3 hours)
1. Create `ContentStrategyQA.tsx` component (2 hours)
2. Create `/api/admin/content/strategy-qa` endpoint (1 hour)

### Phase 3: Enhanced UI (3-4 hours)
1. Update `ContentGeneratorPanel.tsx` (2 hours)
   - Add content type selector
   - Add type-specific options
   - Add AI Q&A tab
2. Add agent progress visualization (1 hour)
3. Add cost/time estimates (1 hour)

### Phase 4: Pillar Page Agent (3-4 hours)
1. Create `/lambda/agents/pillar_page_generation.py` (2 hours)
2. Deploy to Lambda (1 hour)
3. Test with AI-SDLC pillar (1 hour)

### Phase 5: Hub & Spoke Generator (2-3 hours)
1. Create hub & spoke workflow (2 hours)
2. Test with "AI in Agile" hub (1 hour)

### Phase 6: Testing & Polish (2-3 hours)
1. Test all content types (1 hour)
2. Polish UI (1 hour)
3. Documentation (1 hour)

**Total Time:** 14-20 hours

---

## Cost Estimates

### Per Content Type
- **Pillar Page:** $0.25 (4 agents)
- **Hub & Spoke:** $1.50 (1 hub + 6 spokes)
- **Tutorial:** $0.10 (2 agents)
- **Guide:** $0.15 (2 agents)
- **News:** $0.02 (1 agent)
- **Case Study:** $0.10 (2 agents)
- **Comparison:** $0.10 (2 agents)
- **Best Practices:** $0.08 (3 agents)

### For 27 Pages (4 pillars + 23 spokes)
- 4 pillars × $0.25 = $1.00
- 23 spokes × $0.10 = $2.30
- **Total: ~$3.30**

---

## AI Model Integration

### Use Existing AI Models Infrastructure
**Location:** `/src/app/opshub/ai-models/page.tsx`

**Available Models:**
- OpenAI (GPT-4, GPT-4o, GPT-4o-mini)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Google (Gemini 1.5 Pro, Gemini 1.5 Flash)

### Model Selection Strategy
**For Content Strategy Q&A:**
- Use GPT-4 or Claude 3.5 Sonnet (high quality)

**For Content Generation:**
- SEO Expert: GPT-4o-mini (fast, cheap)
- SME: GPT-4 or Claude 3.5 Sonnet (accuracy)
- Agile Expert: GPT-4o-mini (fast, cheap)
- Editor: GPT-4o-mini (fast, cheap)

---

## Next Steps

1. ✅ Create content type definitions
2. ⏳ Create AI Q&A component
3. ⏳ Update ContentGeneratorPanel UI
4. ⏳ Create pillar page agent
5. ⏳ Test with AI-SDLC pillar
6. ⏳ Generate all 27 pages

**Estimated Time:** 14-20 hours focused work  
**Estimated Cost:** ~$3.30 for all content

---

## Files to Create/Modify

### New Files
- `/src/lib/content/content-types.ts` - Content type definitions
- `/src/lib/content/content-strategy-qa.ts` - AI Q&A logic
- `/src/components/admin/ContentStrategyQA.tsx` - Q&A component
- `/src/app/api/admin/content/strategy-qa/route.ts` - Q&A API
- `/lambda/agents/pillar_page_generation.py` - Pillar page agent
- `/lambda/agents/hub_spoke_generation.py` - Hub & spoke agent

### Modified Files
- `/src/components/admin/ContentGeneratorPanel.tsx` - Enhanced UI
- `/src/app/api/admin/content/generate/batch/route.ts` - Content type support
- `/lambda/Dockerfile.multi-agent` - Include new agents
- `/src/components/admin/OpsHubTabs.tsx` - Add Q&A tab

---

## Success Metrics

**Time Savings:**
- Manual writing: 40-60 hours for 27 pages
- AI-assisted: 14-20 hours (setup) + 10-15 hours (review/edit)
- **Savings: 50-60%**

**Cost:**
- AI generation: ~$3.30
- Human time saved: 25-35 hours × $50/hour = $1,250-1,750
- **ROI: 400-500x**

**Quality:**
- SEO-optimized structure
- Technical accuracy (SME review)
- Consistent brand voice
- Internal linking strategy
