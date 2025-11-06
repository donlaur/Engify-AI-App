#!/usr/bin/env tsx
/**
 * Create RICE Scoring Prompts for Leadership Roles
 * 
 * RICE (Reach, Impact, Confidence, Effort) is a prioritization framework
 * used by leaders at all levels. This script creates RICE scoring prompts
 * tailored for each leadership role.
 * 
 * Usage:
 *   tsx scripts/content/create-rice-scoring-prompts.ts
 */

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface RICEPrompt {
  title: string;
  description: string;
  role: string;
  category: string;
  tags: string[];
  content: string;
}

const RICE_PROMPTS: RICEPrompt[] = [
  {
    title: 'RICE Scoring Framework for Engineering Directors',
    description: 'Prioritize engineering initiatives using RICE scoring with detailed stakeholder communication and technical context. Includes feature prioritization, technical debt, infrastructure investments, and team capacity planning.',
    role: 'engineering-director',
    category: 'leadership',
    tags: ['rice', 'prioritization', 'frameworks', 'decision-making', 'engineering-director', 'technical-debt'],
    content: `# RICE Scoring Framework for Engineering Directors

You are an Engineering Director prioritizing engineering initiatives across multiple teams. Use RICE scoring to make data-driven decisions and communicate priorities clearly to stakeholders.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many users/engineers will this affect? (per quarter, 1-10)
- **Impact**: How much will this impact each person? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (estimate, 1-10)

## Context Setup

**Your Role**: Engineering Director
**Scope**: [Team/Platform/Organization level]
**Timeframe**: [Quarter/Sprint/Year]
**Team Capacity**: [Person-months available]

## Initiatives to Evaluate

[List 5-10 initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many engineers will this affect?
- How many users/customers will benefit?
- How many teams will be impacted?
- Consider: Current user base × % affected

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (game-changing, must-have)
- **2.0 = High impact** (significantly improves experience)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (nice to have)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have data, similar past projects)
- **80% = Medium-high confidence** (good estimates, some unknowns)
- **50% = Low confidence** (guesses, many unknowns)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Development + Testing + Deployment + Documentation
- Include: Engineering time, design time, QA time
- Consider: Dependencies, technical complexity, team velocity

## RICE Calculation

**Example:**
- Reach: 8 (affects 80% of engineers)
- Impact: 2.0 (high impact - reduces debugging time by 50%)
- Confidence: 0.8 (we've done similar migrations before)
- Effort: 4 person-months

**RICE Score = (8 × 2.0 × 0.8) / 4 = 12.8 / 4 = 3.2**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning]
- **Impact**: [X.X] - [Reasoning]
- **Confidence**: [XX%] - [Reasoning]
- **Effort**: [X person-months] - [Breakdown]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Stakeholder Talking Points:**
- Why this matters
- What we're optimizing for
- Trade-offs we're making
- Alternative approaches considered

**Risks & Dependencies:**
- Technical risks
- Resource dependencies
- Timeline dependencies

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence rationale]

**Strategic Considerations:**
- Balancing short-term fixes vs. long-term investments
- Technical debt vs. new features
- Infrastructure vs. product features
- Individual team needs vs. platform-wide initiatives

## Next Steps

1. Review RICE scores with engineering leads
2. Validate effort estimates with tech leads
3. Present top priorities to stakeholders
4. Get buy-in on resource allocation
5. Track actual vs. estimated effort for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- Team morale and excitement
- Learning opportunities for engineers
- Technical excellence and quality
- Risk mitigation and resilience`,
  },
  {
    title: 'RICE Scoring Framework for Product Directors',
    description: 'Prioritize product features and initiatives using RICE scoring with market context, user research, and business metrics. Includes feature prioritization, user experience improvements, and strategic product investments.',
    role: 'product-director',
    category: 'product',
    tags: ['rice', 'prioritization', 'frameworks', 'product-management', 'product-director', 'feature-planning'],
    content: `# RICE Scoring Framework for Product Directors

You are a Product Director prioritizing product features and initiatives across multiple product lines. Use RICE scoring to make data-driven decisions and communicate priorities clearly to stakeholders.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many users will this affect? (per quarter, 1-10)
- **Impact**: How much will this impact each user? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (estimate, 1-10)

## Context Setup

**Your Role**: Product Director
**Scope**: [Product Line/Platform/Organization level]
**Timeframe**: [Quarter/Sprint/Year]
**Team Capacity**: [Person-months available]
**Current User Base**: [Active users/MRR/Customers]

## Features/Initiatives to Evaluate

[List 5-10 features, each with brief description]

## Evaluation Process

### For Each Feature:

**1. Calculate Reach (1-10 scale)**
- How many users will this affect?
- What % of user base?
- Consider: Active users × % adoption rate × frequency of use
- Example: "10,000 MAU × 60% adoption × weekly use = 6,000 users/week"

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (game-changing, solves critical pain point)
- **2.0 = High impact** (significantly improves user experience)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (nice to have, incremental)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have user research, A/B test data, similar features)
- **80% = Medium-high confidence** (user interviews, market research)
- **50% = Low confidence** (assumptions, guesses, limited data)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Design + Development + Testing + Launch + Support
- Include: Product, Engineering, Design, QA, Marketing
- Consider: Dependencies, technical complexity, integration challenges

## RICE Calculation

**Example:**
- Reach: 7 (affects 70% of active users)
- Impact: 2.5 (high impact - removes major friction)
- Confidence: 0.85 (backed by user research)
- Effort: 3 person-months

**RICE Score = (7 × 2.5 × 0.85) / 3 = 14.875 / 3 = 4.96**

## Output Format

For each feature, provide:

### [Feature Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with user numbers]
- **Impact**: [X.X] - [Reasoning with user benefit]
- **Confidence**: [XX%] - [Reasoning with data sources]
- **Effort**: [X person-months] - [Breakdown by discipline]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**User Value Proposition:**
- What problem does this solve?
- Who benefits most?
- How does this improve their experience?

**Business Impact:**
- Revenue impact (if applicable)
- User retention/growth
- Competitive advantage
- Strategic alignment

**Stakeholder Talking Points:**
- Why this matters
- What we're optimizing for
- Trade-offs we're making
- Alternative approaches considered

**Risks & Assumptions:**
- User adoption risks
- Technical risks
- Market/competitive risks
- Resource dependencies

## Priority Ranking

Rank all features by RICE score (highest first).

**Top 3 Priorities:**
1. [Feature] - RICE: [X.XX] - [One-sentence rationale]
2. [Feature] - RICE: [X.XX] - [One-sentence rationale]
3. [Feature] - RICE: [X.XX] - [One-sentence rationale]

**Strategic Considerations:**
- Balancing user needs vs. business needs
- Quick wins vs. long-term investments
- Feature improvements vs. foundational work
- Core product vs. adjacent opportunities

## Next Steps

1. Review RICE scores with product team
2. Validate estimates with engineering leads
3. Present top priorities to stakeholders
4. Get buy-in on resource allocation
5. Track actual vs. estimated metrics for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- User research and feedback
- Competitive positioning
- Technical feasibility and quality
- Team capacity and morale`,
  },
  {
    title: 'RICE Scoring Framework for VP of Engineering',
    description: 'Prioritize organization-wide engineering initiatives using RICE scoring with strategic alignment, resource allocation, and executive communication. Includes platform investments, team structure, and engineering excellence initiatives.',
    role: 'vp-engineering',
    category: 'leadership',
    tags: ['rice', 'prioritization', 'frameworks', 'engineering-leadership', 'vp-engineering', 'strategic-planning'],
    content: `# RICE Scoring Framework for VP of Engineering

You are a VP of Engineering prioritizing organization-wide engineering initiatives. Use RICE scoring to make strategic decisions and communicate priorities clearly to executives and engineering teams.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many engineers/teams will this affect? (organization-wide, 1-10)
- **Impact**: How much will this impact engineering velocity/quality? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (cross-team, 1-10)

## Context Setup

**Your Role**: VP of Engineering
**Scope**: Organization-wide engineering initiatives
**Timeframe**: [Quarter/Year]
**Engineering Capacity**: [Total person-months available]
**Organization Size**: [Number of engineers/teams]

## Initiatives to Evaluate

[List 5-10 strategic initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many engineers will this affect?
- How many teams/product lines?
- What % of engineering organization?
- Consider: Total engineers × % affected × frequency of impact

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (organization-wide transformation, 10x improvement)
- **2.0 = High impact** (significantly improves engineering velocity/quality)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (incremental improvement)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have data, similar past initiatives)
- **80% = Medium-high confidence** (good estimates, some unknowns)
- **50% = Low confidence** (guesses, many unknowns)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Planning + Execution + Change Management + Training
- Include: Cross-team coordination, infrastructure, tooling
- Consider: Dependencies, organizational complexity, adoption time

## RICE Calculation

**Example:**
- Reach: 9 (affects 90% of engineers)
- Impact: 2.5 (high impact - reduces deployment time by 70%)
- Confidence: 0.75 (we've seen similar implementations)
- Effort: 6 person-months

**RICE Score = (9 × 2.5 × 0.75) / 6 = 16.875 / 6 = 2.81**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with engineering impact]
- **Impact**: [X.X] - [Reasoning with velocity/quality improvement]
- **Confidence**: [XX%] - [Reasoning with data/experience]
- **Effort**: [X person-months] - [Breakdown by phase]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Strategic Value:**
- Engineering velocity improvement
- Quality/reliability improvement
- Team satisfaction and retention
- Technical excellence and innovation

**Executive Talking Points:**
- Why this matters strategically
- ROI and business impact
- Resource requirements
- Timeline and milestones
- Risks and mitigation

**Organizational Impact:**
- Teams affected
- Change management required
- Training and adoption needs
- Cross-team dependencies

**Risks & Dependencies:**
- Technical risks
- Organizational risks
- Resource dependencies
- Timeline dependencies

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]

**Strategic Considerations:**
- Balancing innovation vs. stability
- Platform investments vs. product features
- Engineering excellence vs. business needs
- Short-term efficiency vs. long-term scalability

## Next Steps

1. Review RICE scores with engineering leadership team
2. Validate estimates with engineering directors
3. Present top priorities to executives
4. Get buy-in on resource allocation
5. Track actual vs. estimated impact for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- Engineering culture and values
- Team morale and retention
- Technical excellence and innovation
- Risk mitigation and resilience`,
  },
  {
    title: 'RICE Scoring Framework for VP of Product',
    description: 'Prioritize product strategy and organization-wide initiatives using RICE scoring with market analysis, competitive positioning, and executive communication. Includes product line investments, user experience initiatives, and strategic product bets.',
    role: 'vp-product',
    category: 'product',
    tags: ['rice', 'prioritization', 'frameworks', 'product-leadership', 'vp-product', 'strategic-planning'],
    content: `# RICE Scoring Framework for VP of Product

You are a VP of Product prioritizing organization-wide product initiatives and strategic bets. Use RICE scoring to make strategic decisions and communicate priorities clearly to executives and product teams.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many users/customers will this affect? (organization-wide, 1-10)
- **Impact**: How much will this impact each user? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (cross-team, 1-10)

## Context Setup

**Your Role**: VP of Product
**Scope**: Organization-wide product initiatives
**Timeframe**: [Quarter/Year]
**Product Capacity**: [Total person-months available]
**User Base**: [Active users/MRR/Customers/Product lines]

## Initiatives to Evaluate

[List 5-10 strategic initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many users will this affect?
- How many product lines/customers?
- What % of user base?
- Consider: Total users × % affected × adoption rate

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (game-changing, market-defining)
- **2.0 = High impact** (significantly improves user experience/value)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (incremental improvement)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have market research, user data, competitive analysis)
- **80% = Medium-high confidence** (user research, market trends)
- **50% = Low confidence** (assumptions, limited data)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Research + Design + Development + Launch + Marketing
- Include: Product, Engineering, Design, Marketing, Sales
- Consider: Dependencies, market timing, competitive landscape

## RICE Calculation

**Example:**
- Reach: 8 (affects 80% of customer base)
- Impact: 2.5 (high impact - increases customer value by 40%)
- Confidence: 0.8 (backed by market research)
- Effort: 5 person-months

**RICE Score = (8 × 2.5 × 0.8) / 5 = 16 / 5 = 3.2**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with user numbers]
- **Impact**: [X.X] - [Reasoning with user value/business impact]
- **Confidence**: [XX%] - [Reasoning with data sources]
- **Effort**: [X person-months] - [Breakdown by discipline]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Strategic Value:**
- Market opportunity size
- Competitive advantage
- User value creation
- Revenue/growth impact

**Executive Talking Points:**
- Why this matters strategically
- Market opportunity and timing
- Competitive positioning
- Resource requirements
- Timeline and milestones
- Risks and mitigation

**Market Context:**
- Competitive landscape
- Market trends
- User needs and trends
- Technology trends

**Risks & Assumptions:**
- Market risks
- User adoption risks
- Competitive risks
- Technical risks
- Resource dependencies

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]

**Strategic Considerations:**
- Balancing user needs vs. business needs
- Core product vs. new opportunities
- Quick wins vs. long-term bets
- Market timing and competitive positioning

## Next Steps

1. Review RICE scores with product leadership team
2. Validate estimates with product directors
3. Present top priorities to executives
4. Get buy-in on resource allocation
5. Track actual vs. estimated metrics for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- Market timing and competitive positioning
- User research and feedback
- Technical feasibility and quality
- Team capacity and execution capability`,
  },
  {
    title: 'RICE Scoring Framework for Directors',
    description: 'Prioritize cross-functional initiatives using RICE scoring with organizational context, resource constraints, and stakeholder alignment. Includes strategic initiatives, process improvements, and organizational investments.',
    role: 'director',
    category: 'leadership',
    tags: ['rice', 'prioritization', 'frameworks', 'leadership', 'director', 'strategic-planning'],
    content: `# RICE Scoring Framework for Directors

You are a Director prioritizing cross-functional initiatives and strategic investments. Use RICE scoring to make data-driven decisions and communicate priorities clearly to stakeholders and executives.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many people/teams will this affect? (organization-wide, 1-10)
- **Impact**: How much will this impact each person/team? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (cross-functional, 1-10)

## Context Setup

**Your Role**: Director
**Scope**: [Area of responsibility - Engineering/Product/Operations/etc.]
**Timeframe**: [Quarter/Year]
**Team Capacity**: [Total person-months available]
**Organization Context**: [Size, structure, priorities]

## Initiatives to Evaluate

[List 5-10 strategic initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many people will this affect?
- How many teams/departments?
- What % of organization?
- Consider: Total people × % affected × frequency of impact

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (organization-wide transformation)
- **2.0 = High impact** (significantly improves outcomes)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (incremental improvement)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have data, similar past initiatives)
- **80% = Medium-high confidence** (good estimates, some unknowns)
- **50% = Low confidence** (guesses, many unknowns)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Planning + Execution + Change Management + Training
- Include: Cross-functional coordination, dependencies
- Consider: Organizational complexity, adoption time

## RICE Calculation

**Example:**
- Reach: 8 (affects 80% of organization)
- Impact: 2.0 (high impact - improves efficiency by 50%)
- Confidence: 0.75 (we've seen similar implementations)
- Effort: 4 person-months

**RICE Score = (8 × 2.0 × 0.75) / 4 = 12 / 4 = 3.0**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with organizational impact]
- **Impact**: [X.X] - [Reasoning with outcome improvement]
- **Confidence**: [XX%] - [Reasoning with data/experience]
- **Effort**: [X person-months] - [Breakdown by phase]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Strategic Value:**
- Organizational impact
- Alignment with company goals
- ROI and business value
- Team satisfaction and retention

**Stakeholder Talking Points:**
- Why this matters strategically
- Expected outcomes and benefits
- Resource requirements
- Timeline and milestones
- Risks and mitigation

**Organizational Impact:**
- Teams/departments affected
- Change management required
- Training and adoption needs
- Cross-functional dependencies

**Risks & Dependencies:**
- Organizational risks
- Resource dependencies
- Timeline dependencies
- Stakeholder alignment

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]

**Strategic Considerations:**
- Balancing short-term vs. long-term investments
- Quick wins vs. transformative initiatives
- Resource allocation across teams
- Alignment with company priorities

## Next Steps

1. Review RICE scores with leadership team
2. Validate estimates with team leads
3. Present top priorities to executives
4. Get buy-in on resource allocation
5. Track actual vs. estimated impact for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- Organizational culture and values
- Team morale and retention
- Risk mitigation and resilience`,
  },
  {
    title: 'RICE Scoring Framework for VPs',
    description: 'Prioritize executive-level initiatives using RICE scoring with company-wide context, strategic alignment, and C-level communication. Includes company-wide investments, organizational changes, and strategic bets.',
    role: 'vp',
    category: 'leadership',
    tags: ['rice', 'prioritization', 'frameworks', 'executive-leadership', 'vp', 'strategic-planning'],
    content: `# RICE Scoring Framework for VPs

You are a VP prioritizing company-wide initiatives and strategic investments. Use RICE scoring to make data-driven decisions and communicate priorities clearly to the C-suite and board.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many people/customers will this affect? (company-wide, 1-10)
- **Impact**: How much will this impact each person/customer? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (cross-company, 1-10)

## Context Setup

**Your Role**: VP of [Engineering/Product/Sales/etc.]
**Scope**: Company-wide strategic initiatives
**Timeframe**: [Quarter/Year]
**Company Capacity**: [Total person-months available]
**Company Context**: [Size, stage, priorities]

## Initiatives to Evaluate

[List 5-10 strategic initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many people will this affect?
- How many customers/users?
- What % of company/customer base?
- Consider: Total people/customers × % affected × frequency

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (company-wide transformation, market-defining)
- **2.0 = High impact** (significantly improves outcomes)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (incremental improvement)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have data, market research, similar past initiatives)
- **80% = Medium-high confidence** (good estimates, some unknowns)
- **50% = Low confidence** (guesses, many unknowns)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Planning + Execution + Change Management + Training
- Include: Cross-functional coordination, dependencies
- Consider: Company-wide complexity, adoption time

## RICE Calculation

**Example:**
- Reach: 9 (affects 90% of company)
- Impact: 2.5 (high impact - increases revenue by 30%)
- Confidence: 0.8 (backed by market research)
- Effort: 7 person-months

**RICE Score = (9 × 2.5 × 0.8) / 7 = 18 / 7 = 2.57**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with company impact]
- **Impact**: [X.X] - [Reasoning with outcome improvement]
- **Confidence**: [XX%] - [Reasoning with data/experience]
- **Effort**: [X person-months] - [Breakdown by phase]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Strategic Value:**
- Company-wide impact
- Alignment with company goals
- ROI and business value
- Competitive advantage

**C-Suite Talking Points:**
- Why this matters strategically
- Market opportunity and timing
- Expected outcomes and benefits
- Resource requirements
- Timeline and milestones
- Risks and mitigation

**Company-Wide Impact:**
- Departments/teams affected
- Change management required
- Training and adoption needs
- Cross-functional dependencies

**Risks & Dependencies:**
- Market risks
- Organizational risks
- Resource dependencies
- Timeline dependencies
- Strategic dependencies

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]

**Strategic Considerations:**
- Balancing short-term vs. long-term investments
- Quick wins vs. transformative initiatives
- Resource allocation across departments
- Alignment with company vision and goals

## Next Steps

1. Review RICE scores with leadership team
2. Validate estimates with department heads
3. Present top priorities to C-suite
4. Get buy-in on resource allocation
5. Track actual vs. estimated impact for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company vision
- Market timing and competitive positioning
- Organizational culture and values
- Risk mitigation and resilience`,
  },
  {
    title: 'RICE Scoring Framework for CTOs',
    description: 'Prioritize technology strategy and engineering investments using RICE scoring with company-wide technical context, strategic alignment, and executive communication. Includes platform investments, technology choices, and engineering excellence initiatives.',
    role: 'cto',
    category: 'leadership',
    tags: ['rice', 'prioritization', 'frameworks', 'cto', 'technology-strategy', 'engineering-excellence'],
    content: `# RICE Scoring Framework for CTOs

You are a CTO prioritizing technology strategy and engineering investments company-wide. Use RICE scoring to make strategic decisions and communicate priorities clearly to the board and engineering organization.

## RICE Framework Overview

**RICE Score = (Reach × Impact × Confidence) / Effort**

- **Reach**: How many engineers/systems will this affect? (company-wide, 1-10)
- **Impact**: How much will this impact engineering velocity/quality? (minimal to massive, 0.25-3)
- **Confidence**: How confident are we in these estimates? (50-100%, converted to 0.5-1.0)
- **Effort**: How many person-months will this take? (cross-company, 1-10)

## Context Setup

**Your Role**: CTO
**Scope**: Company-wide technology strategy
**Timeframe**: [Quarter/Year]
**Engineering Capacity**: [Total person-months available]
**Technology Context**: [Current stack, architecture, scale]

## Technology Initiatives to Evaluate

[List 5-10 strategic technology initiatives, each with brief description]

## Evaluation Process

### For Each Initiative:

**1. Calculate Reach (1-10 scale)**
- How many engineers will this affect?
- How many systems/platforms?
- What % of engineering organization?
- Consider: Total engineers × % affected × frequency of impact

**2. Estimate Impact (0.25-3 scale)**
- **3.0 = Massive impact** (company-wide transformation, 10x improvement)
- **2.0 = High impact** (significantly improves engineering velocity/quality)
- **1.0 = Medium impact** (meaningful improvement)
- **0.5 = Low impact** (incremental improvement)
- **0.25 = Minimal impact** (barely noticeable)

**3. Assess Confidence (50-100%)**
- **100% = High confidence** (we have data, similar past implementations)
- **80% = Medium-high confidence** (good estimates, some unknowns)
- **50% = Low confidence** (guesses, many unknowns)

**4. Estimate Effort (person-months, 1-10 scale)**
- Break down into: Planning + Execution + Migration + Training
- Include: Cross-team coordination, infrastructure, tooling
- Consider: Dependencies, organizational complexity, adoption time

## RICE Calculation

**Example:**
- Reach: 10 (affects 100% of engineering organization)
- Impact: 2.5 (high impact - reduces deployment time by 80%)
- Confidence: 0.75 (we've seen similar implementations)
- Effort: 8 person-months

**RICE Score = (10 × 2.5 × 0.75) / 8 = 18.75 / 8 = 2.34**

## Output Format

For each initiative, provide:

### [Initiative Name]

**RICE Breakdown:**
- **Reach**: [X] - [Reasoning with engineering impact]
- **Impact**: [X.X] - [Reasoning with velocity/quality improvement]
- **Confidence**: [XX%] - [Reasoning with data/experience]
- **Effort**: [X person-months] - [Breakdown by phase]

**RICE Score**: [X.XX]

**Rank**: [X of Y]

**Strategic Value:**
- Engineering velocity improvement
- Quality/reliability improvement
- Team satisfaction and retention
- Technical excellence and innovation
- Company competitive advantage

**Board Talking Points:**
- Why this matters strategically
- ROI and business impact
- Resource requirements
- Timeline and milestones
- Risks and mitigation
- Competitive advantage

**Technology Impact:**
- Systems/platforms affected
- Engineering teams affected
- Change management required
- Training and adoption needs
- Cross-team dependencies

**Risks & Dependencies:**
- Technical risks
- Organizational risks
- Resource dependencies
- Timeline dependencies
- Strategic dependencies

## Priority Ranking

Rank all initiatives by RICE score (highest first).

**Top 3 Priorities:**
1. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
2. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]
3. [Initiative] - RICE: [X.XX] - [One-sentence strategic rationale]

**Strategic Considerations:**
- Balancing innovation vs. stability
- Platform investments vs. product features
- Engineering excellence vs. business needs
- Short-term efficiency vs. long-term scalability
- Technology choices vs. business outcomes

## Next Steps

1. Review RICE scores with engineering leadership team
2. Validate estimates with VPs and Directors
3. Present top priorities to board
4. Get buy-in on resource allocation
5. Track actual vs. estimated impact for calibration

---

**Tip**: RICE is a guide, not a rule. Use it to inform decisions, but also consider:
- Strategic alignment with company goals
- Technology landscape and trends
- Engineering culture and values
- Team morale and retention
- Risk mitigation and resilience
- Competitive positioning`,
  },
];

async function createRICEPrompts() {
  console.log('🚀 Creating RICE Scoring Prompts for Leadership Roles\n');
  console.log('='.repeat(70));

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  // Check existing prompts
  const existingPrompts = await promptsCollection
    .find({
      title: { $regex: /rice.*scoring/i },
    })
    .project({ title: 1, role: 1 })
    .toArray();

  console.log(`\n📊 Existing RICE Scoring Prompts: ${existingPrompts.length}`);
  existingPrompts.forEach(p => {
    console.log(`  - ${p.title} (${p.role})`);
  });

  let created = 0;
  let skipped = 0;

  for (const prompt of RICE_PROMPTS) {
    // Check if prompt already exists for this role
    const existing = await promptsCollection.findOne({
      role: prompt.role,
      title: { $regex: new RegExp(prompt.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    });

    if (existing) {
      console.log(`\n⏭️  Skipped: "${prompt.title}" (already exists for ${prompt.role})`);
      skipped++;
      continue;
    }

    // Generate unique slug
    const baseSlug = generateSlug(prompt.title);
    let slug = baseSlug;
    let suffix = 1;
    
    // Check for slug conflicts
    while (await promptsCollection.findOne({ slug })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

    // Create prompt document
    const promptDoc = {
      id: randomUUID(),
      slug,
      title: prompt.title,
      description: prompt.description,
      content: prompt.content,
      category: prompt.category,
      role: prompt.role,
      tags: prompt.tags,
      currentRevision: 1,
      views: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: true,
      isFeatured: false,
      active: true,
      source: 'seed' as const,
    };

    try {
      await promptsCollection.insertOne(promptDoc);
      created++;
      console.log(`\n✅ Created: "${prompt.title}"`);
      console.log(`   Role: ${prompt.role} | Category: ${prompt.category}`);
      console.log(`   Slug: ${slug}`);
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        console.log(`\n⏭️  Skipped (duplicate): "${prompt.title}"`);
        skipped++;
      } else {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`\n❌ Error creating "${prompt.title}":`, errorMessage);
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   - Created: ${created} prompts`);
  console.log(`   - Skipped: ${skipped} prompts`);
  console.log(`\n✨ Complete!`);

  process.exit(0);
}

createRICEPrompts().catch(console.error);

