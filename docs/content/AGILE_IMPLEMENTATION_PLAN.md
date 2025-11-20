# Agile + WSJF Implementation Plan

**Date:** 2025-11-20  
**Status:** Ready to Implement

---

## Overview

Create a comprehensive Agile landing page and enhance the existing WSJF prompt page with:
- AI time estimation reality check (5-10% of naive estimates)
- Pain points, workflows, and guardrails
- Agile framework explainers (Scrum, Kanban, SAFe, Lean, Dual-track)

---

## Phase 1: MongoDB Content Updates

### 1.1 New Pain Point: AI Time Estimation Inaccuracy

**Collection:** `pain_points` (if exists) or hardcoded in JSON

**Content:**
```json
{
  "id": "pain-point-32-ai-time-estimation",
  "slug": "ai-time-estimation-inaccuracy",
  "title": "AI Time Estimation Inaccuracy",
  "description": "AI models consistently overestimate project timelines by 10-20x because they confuse total elapsed time with focused engineering time. Reality: Focused engineering time is often 5-10% of naive AI estimates.",
  "coreProblem": "AI lacks context on developer focus time vs. total elapsed time. It doesn't account for meetings, context switching, code review wait times, or the difference between 'time to complete' and 'actual hands-on-keyboard time.'",
  "problemStatement": "When you ask AI 'How long will this take?', it gives you a number that sounds reasonable but is wildly inflated. AI says '3 days' when the actual focused work is 4-6 hours. This creates planning disasters, missed deadlines, and eroded trust in AI tooling.",
  "impact": "Inflated timelines lead to poor resource planning, missed market windows, and stakeholder frustration. Teams either pad estimates further (compounding the problem) or ignore AI estimates entirely (losing the value). Engineering velocity appears slower than it actually is.",
  "examples": [
    "AI estimates 3 days for a feature → Reality: 4-6 hours of focused coding",
    "AI estimates 2 weeks for a migration → Reality: 2-3 days of actual work",
    "AI estimates 1 month for a refactor → Reality: 1 week of focused effort"
  ],
  "expandedExamples": [
    {
      "scenario": "Feature Development Estimate",
      "aiEstimate": "3 days (24 hours)",
      "realityFocusedTime": "4-6 hours",
      "realityElapsedTime": "2-3 days (with meetings, reviews, etc.)",
      "breakdown": "AI doesn't account for: daily standups (30min), code review wait time (4-8 hours), context switching (2-3 hours lost), actual focused coding (4-6 hours)"
    }
  ],
  "relatedPrompts": ["wsjf-prioritization-agile"],
  "relatedWorkflows": ["task-decomposition-prompt-flow"],
  "relatedRecommendations": ["Use Engify's MCP time estimator for grounded estimates"],
  "relatedGuardrails": ["ai-governance-scorecard"],
  "status": "published",
  "severity": "high",
  "category": "planning",
  "tags": ["estimation", "planning", "agile", "wsjf", "time-management"]
}
```

### 1.2 Enhanced WSJF Prompt Content

**Update Existing Prompt:** `82f919d5-a189-40d6-9332-7f3605c3abf3`

**New Content Structure:**
```markdown
# WSJF (Weighted Shortest Job First) Prioritization

Act as a leader prioritizing work using WSJF methodology from SAFe (Scaled Agile Framework).

## What is WSJF?

WSJF is an economic prioritization framework that helps teams make objective decisions about what to work on next. Instead of relying on gut feelings or the loudest voice in the room, WSJF uses a formula to calculate the economic value of each initiative.

**The Core Insight:** Prioritize work that delivers the most value in the shortest time.

## The WSJF Formula

**WSJF = Cost of Delay / Job Size**

Where **Cost of Delay** = User Business Value + Time Criticality + Risk Reduction/Opportunity Enablement

### Breaking Down the Components

**1. User Business Value (1-10)**
- How valuable is this to users and the business?
- Consider: Revenue impact, user satisfaction, strategic alignment

**2. Time Criticality (1-10)**
- How time-sensitive is this?
- Consider: Market windows, regulatory deadlines, competitive threats

**3. Risk Reduction/Opportunity Enablement (1-10)**
- How much does this reduce risk or enable future opportunities?
- Consider: Technical debt reduction, platform capabilities, compliance

**4. Job Size (1-10)**
- How much effort is required?
- Consider: Complexity, dependencies, team capacity
- **CRITICAL:** Use realistic estimates (see Time Estimation Reality Check below)

## WSJF Calculation Example

### Initiative: Implement OAuth 2.0 Authentication

**Scoring:**
- User Business Value: 8 (Critical for enterprise customers)
- Time Criticality: 7 (Blocking 3 enterprise deals)
- Risk Reduction: 9 (Eliminates security vulnerabilities)
- Job Size: 5 (Moderate complexity, 2-week sprint)

**WSJF Score:** (8 + 7 + 9) / 5 = **4.8**

### Initiative: Add Dark Mode

**Scoring:**
- User Business Value: 4 (Nice-to-have, requested by some users)
- Time Criticality: 2 (No deadline)
- Risk Reduction: 1 (Minimal risk/opportunity impact)
- Job Size: 3 (Relatively simple, 1-week sprint)

**WSJF Score:** (4 + 2 + 1) / 3 = **2.3**

**Result:** Prioritize OAuth implementation (4.8) over Dark Mode (2.3)

## Time Estimation Reality Check ⚠️

**CRITICAL INSIGHT:** Focused engineering time is often 5-10% of naive AI estimates.

When AI says "3 days," it usually means:
- **AI Estimate:** 3 days (24 hours)
- **Reality:** 4-6 hours of focused coding
- **Elapsed Time:** 2-3 days (with meetings, reviews, context switching)

### Why AI Overestimates

AI confuses:
- Total elapsed time vs. focused work time
- Doesn't account for meetings, code reviews, context switching
- Assumes 8 hours of focused work per day (reality: 2-4 hours)

### How Engify Helps

Engify's MCP time estimator uses:
- Historical velocity data from your team
- Actual focused time metrics
- Context-aware adjustments for meetings, reviews, dependencies

**Result:** 10-20x more accurate estimates than naive AI.

## Pain Points This Solves

### 1. Subjective Prioritization
**Problem:** Teams prioritize based on who shouts loudest or gut feelings.
**Solution:** WSJF provides objective, data-driven prioritization.

### 2. AI Time Estimation Inaccuracy
**Problem:** AI estimates are 10-20x too high, leading to poor planning.
**Solution:** Use Engify's MCP time estimator for grounded estimates.
[Learn more about AI Time Estimation Inaccuracy](/pain-points/ai-time-estimation-inaccuracy)

### 3. Tactical Trap
**Problem:** Teams work on urgent-but-not-important tasks.
**Solution:** WSJF balances urgency (Time Criticality) with value.

## Workflows

### Task Decomposition Prompt Flow
Break large initiatives into smaller, estimable chunks before scoring.
[View Workflow](/workflows/task-decomposition-prompt-flow)

### Architecture Intent Validation
Ensure technical decisions align with WSJF priorities.
[View Workflow](/workflows/architecture-intent-validation)

## Guardrails & Compliance

### EU AI Act Warning
If you're using AI to make high-risk decisions (hiring, credit, healthcare), WSJF prioritization may fall under EU AI Act regulations. Ensure:
- Human oversight of AI-generated scores
- Transparency in scoring criteria
- Audit trails for prioritization decisions

[Learn more: AI Governance Scorecard](/workflows/ai-governance-scorecard)

## How to Use This Prompt

### For Each Initiative

**[Initiative Name]**

**1. User Business Value (1-10)**
- How valuable is this to users/business?
- **Score**: [X] - [Reasoning]

**2. Time Criticality (1-10)**
- How time-sensitive is this?
- **Score**: [X] - [Reasoning]

**3. Risk Reduction/Opportunity Enablement (1-10)**
- How much does this reduce risk or enable opportunities?
- **Score**: [X] - [Reasoning]

**4. Job Size (1-10)**
- How much effort is required? (Use realistic estimates!)
- **Score**: [X] - [Reasoning]

**WSJF Score**: [X.XX] = ([Value] + [Time] + [Risk]) / [Size]

**Rank by WSJF score (highest first).**

## FAQs

### How accurate are AI time estimates?
AI estimates are typically 10-20x too high. Focused engineering time is 5-10% of naive estimates. Use Engify's MCP time estimator for grounded estimates based on your team's historical velocity.

### What's the difference between WSJF and story points?
Story points measure relative effort. WSJF measures economic value. Use story points for sprint planning, WSJF for strategic prioritization.

### How does Engify improve WSJF?
Engify provides:
- Realistic time estimates (not naive AI guesses)
- Workflows for task decomposition
- Guardrails for compliance (EU AI Act)
- Patterns for consistent scoring

### Should I use WSJF for every decision?
No. WSJF is best for strategic prioritization (quarterly planning, roadmap decisions). For tactical decisions (daily tasks), use simpler methods like Eisenhower Matrix.

## Related Content

- [AI Time Estimation Inaccuracy Pain Point](/pain-points/ai-time-estimation-inaccuracy)
- [Task Decomposition Workflow](/workflows/task-decomposition-prompt-flow)
- [AI Governance Scorecard](/workflows/ai-governance-scorecard)
- [Agile + AI Landing Page](/agile)
```

---

## Phase 2: Agile Landing Page

### 2.1 Create Agile Content File

**File:** `/src/lib/data/agile-content.ts`

**Structure:**
```typescript
export interface AgileFramework {
  id: string;
  name: string;
  description: string;
  keyPractices: string[];
  aiUseCases: string[];
  relatedPrompts: string[];
  relatedWorkflows: string[];
}

export const AGILE_FRAMEWORKS: AgileFramework[] = [
  {
    id: 'scrum',
    name: 'Scrum',
    description: 'Iterative framework with fixed-length sprints, daily standups, and retrospectives.',
    keyPractices: [
      'Sprint Planning',
      'Daily Standups',
      'Sprint Retrospectives',
      'Backlog Refinement'
    ],
    aiUseCases: [
      'Generate sprint goals from backlog items',
      'Summarize standup notes',
      'Identify retrospective themes',
      'Estimate story points with historical velocity'
    ],
    relatedPrompts: ['wsjf-prioritization-agile'],
    relatedWorkflows: ['task-decomposition-prompt-flow', 'daily-merge-discipline']
  },
  {
    id: 'kanban',
    name: 'Kanban',
    description: 'Continuous flow system with WIP limits and visual boards.',
    keyPractices: [
      'WIP Limits',
      'Flow Optimization',
      'Cycle Time Tracking',
      'Continuous Delivery'
    ],
    aiUseCases: [
      'Analyze flow metrics',
      'Identify bottlenecks',
      'Optimize WIP limits',
      'Predict cycle times'
    ],
    relatedPrompts: [],
    relatedWorkflows: ['keep-prs-under-control']
  },
  {
    id: 'safe',
    name: 'SAFe (Scaled Agile Framework)',
    description: 'Enterprise framework for scaling Agile across large organizations.',
    keyPractices: [
      'PI Planning',
      'WSJF Prioritization',
      'Agile Release Trains',
      'Value Stream Mapping'
    ],
    aiUseCases: [
      'Calculate WSJF scores',
      'Generate PI objectives',
      'Map value streams',
      'Coordinate dependencies'
    ],
    relatedPrompts: ['wsjf-prioritization-agile'],
    relatedWorkflows: ['architecture-intent-validation']
  },
  {
    id: 'lean-portfolio',
    name: 'Lean Portfolio Management',
    description: 'Strategic approach to managing portfolios of work.',
    keyPractices: [
      'Value Stream Mapping',
      'Portfolio Kanban',
      'Economic Prioritization',
      'Lean Budgeting'
    ],
    aiUseCases: [
      'Map value streams',
      'Calculate portfolio ROI',
      'Optimize resource allocation',
      'Track strategic themes'
    ],
    relatedPrompts: ['wsjf-prioritization-agile'],
    relatedWorkflows: []
  },
  {
    id: 'dual-track',
    name: 'Dual-Track Agile',
    description: 'Parallel discovery and delivery tracks for continuous learning.',
    keyPractices: [
      'Discovery Track (Research)',
      'Delivery Track (Build)',
      'Continuous Validation',
      'Rapid Prototyping'
    ],
    aiUseCases: [
      'Synthesize user research',
      'Generate prototype ideas',
      'Validate assumptions',
      'Prioritize experiments'
    ],
    relatedPrompts: [],
    relatedWorkflows: ['trust-but-verify-triage']
  }
];

export const AGILE_CONTENT = {
  hero: {
    headline: 'Run Agile Smarter with AI',
    subheadline: 'Patterns, workflows, and guardrails for Scrum, Kanban, SAFe, and Lean teams. Get realistic estimates, not AI hallucinations.',
    cta: {
      primary: 'Explore Agile Prompts',
      secondary: 'Try WSJF Calculator'
    }
  },
  timeRealitySection: {
    headline: 'The AI Time Estimation Reality Check',
    subheadline: 'Focused engineering time is often 5-10% of naive AI estimates',
    examples: [
      { ai: '3 days', reality: '4-6 hours focused', elapsed: '2-3 days with meetings' },
      { ai: '2 weeks', reality: '2-3 days focused', elapsed: '1-2 weeks with reviews' },
      { ai: '1 month', reality: '1 week focused', elapsed: '3-4 weeks with dependencies' }
    ],
    explanation: 'AI confuses total elapsed time with focused work time. It doesn\'t account for meetings, code reviews, context switching, or the difference between "time to complete" and "actual hands-on-keyboard time."',
    solution: 'Engify\'s MCP time estimator uses historical velocity data and context-aware adjustments for 10-20x more accurate estimates.'
  },
  faqs: [
    {
      question: 'How does AI improve Agile?',
      answer: 'AI automates time-consuming tasks like sprint planning, retrospective analysis, and estimation. It provides data-driven insights for prioritization and helps teams focus on high-value work.'
    },
    {
      question: 'What\'s the ROI of AI in Agile?',
      answer: 'Teams report 30-50% time savings on planning activities, 10-20x more accurate estimates, and faster decision-making with objective prioritization frameworks like WSJF.'
    },
    {
      question: 'Is WSJF better than story points?',
      answer: 'WSJF and story points serve different purposes. Story points measure relative effort for sprint planning. WSJF measures economic value for strategic prioritization. Use both.'
    },
    {
      question: 'How accurate are AI time estimates?',
      answer: 'Naive AI estimates are typically 10-20x too high. Engify\'s MCP time estimator uses historical velocity data for 10-20x more accurate estimates.'
    }
  ]
};
```

### 2.2 Create Agile Landing Page

**File:** `/src/app/agile/page.tsx`

**Structure:**
```typescript
import { Metadata } from 'next';
import { loadPromptsFromJson } from '@/lib/prompts/load-prompts-from-json';
import { loadWorkflowsFromJson } from '@/lib/workflows/load-workflows-from-json';
import { loadPainPointsFromJson } from '@/lib/workflows/load-pain-points-from-json';
import { AGILE_FRAMEWORKS, AGILE_CONTENT } from '@/lib/data/agile-content';
// Import components as needed

export const metadata: Metadata = {
  title: 'Agile + AI: Smarter Scrum, Kanban, SAFe & Lean | Engify',
  description: 'Run Agile smarter with AI patterns, workflows, and guardrails. Get realistic estimates (not AI hallucinations) for Scrum, Kanban, SAFe, and Lean teams.',
  openGraph: {
    title: 'Agile + AI: Smarter Scrum, Kanban, SAFe & Lean',
    description: 'Patterns, workflows, and guardrails for Agile teams. Focused engineering time is 5-10% of naive AI estimates.',
  }
};

export default async function AgilePage() {
  // Load data
  const allPrompts = await loadPromptsFromJson();
  const allWorkflows = await loadWorkflowsFromJson();
  const allPainPoints = await loadPainPointsFromJson();

  // Filter relevant content
  const agilePrompts = allPrompts.filter(p => 
    p.tags?.includes('agile') || 
    p.tags?.includes('wsjf') || 
    p.slug === 'wsjf-prioritization-agile'
  );

  const agilePainPoints = allPainPoints.filter(pp =>
    pp.slug === 'ai-time-estimation-inaccuracy' ||
    pp.slug === 'tactical-trap' ||
    pp.slug === 'plan-derailment'
  );

  return (
    <div className="agile-landing-page">
      {/* Hero Section */}
      {/* Pain Points Section */}
      {/* Frameworks Section */}
      {/* Time Reality Section */}
      {/* Workflows Section */}
      {/* FAQs Section */}
    </div>
  );
}
```

---

## Phase 3: Implementation Checklist

### 3.1 MongoDB Updates
- [ ] Create new pain point: `ai-time-estimation-inaccuracy`
- [ ] Update WSJF prompt content (expand from 500 to 2000+ chars)
- [ ] Add tags to WSJF prompt: `agile`, `wsjf`, `prioritization`, `estimation`

### 3.2 JSON Regeneration
- [ ] Trigger webhook or run generation scripts
- [ ] Verify `pain-points.json` includes new pain point
- [ ] Verify `prompts.json` includes updated WSJF content

### 3.3 Agile Landing Page
- [ ] Create `/src/lib/data/agile-content.ts`
- [ ] Create `/src/app/agile/page.tsx`
- [ ] Add to sitemap
- [ ] Test all links and data loading

### 3.4 WSJF Page Updates
- [ ] Verify updated content renders correctly
- [ ] Test all internal links (pain points, workflows, guardrails)
- [ ] Check SEO metadata

### 3.5 Testing
- [ ] Local testing (all pages load, links work)
- [ ] SEO metadata verification
- [ ] Mobile responsiveness
- [ ] Performance (Lighthouse audit)

### 3.6 Deployment
- [ ] Commit changes
- [ ] Push to remote (with user permission)
- [ ] Verify production deployment
- [ ] Monitor for errors

---

## Success Metrics

### SEO
- WSJF page CTR improvement (baseline: low CTR despite high impressions)
- Agile landing page ranking for "agile + AI" keywords
- Internal linking improvements

### User Engagement
- Time on page (WSJF + Agile pages)
- Bounce rate reduction
- Prompt usage increase

### Content Quality
- Comprehensive WSJF content (2000+ chars)
- Clear value proposition (5-10% time reality)
- Strong internal linking (pain points, workflows, guardrails)

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create MongoDB content** - Pain point + updated prompt
3. **Build Agile landing page** - New page with frameworks
4. **Test locally** - Verify all functionality
5. **Deploy** - Push to production

---

**Status:** Ready for implementation
**Estimated Time:** 4-6 hours focused work (not 3 days! 😉)
