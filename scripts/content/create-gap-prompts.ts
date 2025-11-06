#!/usr/bin/env tsx
/**
 * Create Prompts for Identified Gaps from External Sources
 * 
 * Creates the 12 prompts identified as gaps from Revo, Glean, and Productboard.
 * 
 * Usage:
 *   tsx scripts/content/create-gap-prompts.ts
 */

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface GapPrompt {
  title: string;
  description: string;
  role: string;
  category: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  content: string;
}

const GAP_PROMPTS: GapPrompt[] = [
  {
    title: 'Usability Test Script Creation',
    description: 'Generate comprehensive usability test scripts for specific features, including test scenarios, tasks, success criteria, and debrief questions.',
    role: 'product-manager',
    category: 'testing',
    tags: ['usability', 'testing', 'user-research', 'ux', 'validation'],
    priority: 'high',
    content: `# Usability Test Script Creation

Act as a Product Manager creating a usability test script for evaluating user experience.

## Context
- **Feature**: [Feature name]
- **Target Users**: [User personas/segments]
- **Test Duration**: [30/60/90 minutes]
- **Test Format**: [Moderated/Unmoderated/Remote/In-person]

## Test Objectives
1. [Primary objective - e.g., "Validate new checkout flow reduces cart abandonment"]
2. [Secondary objective - e.g., "Understand user perception of new navigation"]
3. [Tertiary objective - e.g., "Identify friction points"]

## Pre-Test Setup

### Participant Screening
- [ ] Demographics match target users
- [ ] Previous experience with [product type]
- [ ] Technical comfort level: [Beginner/Intermediate/Advanced]
- [ ] Accessibility needs: [None/Screen reader/Keyboard only/etc.]

### Prerequisites
- [ ] Test environment ready
- [ ] Prototype/mockup available
- [ ] Recording equipment set up
- [ ] Consent forms prepared
- [ ] Incentive/location confirmed

## Test Script Structure

### 1. Introduction (5 minutes)
- Welcome and thank participant
- Explain test purpose and format
- Set expectations: "We're testing the product, not you"
- Ask for permission to record
- Get consent

### 2. Background Questions (5 minutes)
- How familiar are you with [product category]?
- What tools do you currently use for [task]?
- What are your biggest pain points with [current solution]?

### 3. Task Scenarios (20-40 minutes)

#### Task 1: [Primary Task]
**Scenario**: [Context and background]
**Goal**: [What user wants to accomplish]

**Observations to note**:
- [ ] How long does it take?
- [ ] Where do they struggle?
- [ ] Do they understand the interface?
- [ ] What questions do they ask?
- [ ] Do they complete the task?

**Success Criteria**: [Defined outcome]

---

#### Task 2: [Secondary Task]
[Repeat structure]

---

#### Task 3: [Edge Case or Comparison]
[Repeat structure]

### 4. Post-Task Questions (10 minutes)
- What did you think of that experience?
- What was most confusing?
- What worked well?
- Would you use this feature? Why/why not?
- How does this compare to [competitor/current solution]?

### 5. Wrap-up (5 minutes)
- System Usability Scale (SUS) questionnaire
- Overall impressions
- Suggestions for improvement
- Thank participant
- Provide incentive/information

## Debrief Questions for Observers
- What patterns did we see?
- What surprised us?
- What are the critical issues?
- What worked better than expected?
- What should we prioritize fixing?

## Analysis Framework
After tests, analyze:
1. **Task Completion Rate**: X/Y participants completed task
2. **Time on Task**: Average X minutes (target: Y minutes)
3. **Error Rate**: X errors per participant
4. **Critical Issues**: [List top 3-5]
5. **Positive Findings**: [What worked well]
6. **Recommendations**: [Prioritized action items]

## Notes
- Allow users to think aloud
- Don't lead or provide hints
- Observe body language and emotions
- Note where users hesitate or ask questions
- Capture exact quotes when possible`,
  },
  {
    title: 'Predictive Analysis and Forecasting',
    description: 'Forecast product demand, user growth, and identify upcoming industry trends using data analysis and market research.',
    role: 'product-manager',
    category: 'analytics',
    tags: ['forecasting', 'analytics', 'trends', 'prediction', 'market-analysis'],
    priority: 'high',
    content: `# Predictive Analysis and Forecasting

Act as a Product Manager conducting predictive analysis and forecasting for product planning.

## Context
- **Product**: [Product name]
- **Timeframe**: [Next quarter/6 months/year]
- **Current Metrics**: [Key metrics baseline]
- **Data Sources**: [Analytics, sales, user research]

## Forecasting Framework

### 1. Historical Data Analysis

**Collect Historical Data**:
- [ ] User growth trends (last 6-12 months)
- [ ] Feature adoption rates
- [ ] Revenue/MRR trends
- [ ] User engagement metrics
- [ ] Seasonal patterns
- [ ] Market trends

**Identify Patterns**:
- Growth rate: [X% month-over-month]
- Seasonal variations: [Peak months, low months]
- Trend direction: [Upward/Downward/Stable]
- Anomalies: [One-time events that affected metrics]

### 2. Market Trend Analysis

**Industry Trends**:
- [ ] What are the top 3 industry trends?
- [ ] How might these trends affect our product?
- [ ] What are competitors doing?
- [ ] What new technologies are emerging?
- [ ] How are user behaviors changing?

**Market Signals**:
- [ ] Customer feedback themes
- [ ] Sales team insights
- [ ] Support ticket trends
- [ ] Social media mentions
- [ ] Industry reports and research

### 3. Demand Forecasting

**Quantitative Forecast**:
- Use historical growth rate: [Projected = Current × (1 + growth rate)^months]
- Account for seasonality: [Adjust for known seasonal patterns]
- Consider capacity constraints: [Max users/servers available]
- Factor in planned initiatives: [New features/product launches]

**Qualitative Factors**:
- Planned marketing campaigns
- Competitive threats
- Market expansion plans
- Product roadmap items
- Economic conditions

### 4. Trend Identification

**Emerging Trends**:
1. **[Trend Name]**
   - What it is: [Description]
   - Evidence: [Sources/data]
   - Timeline: [When will this impact us?]
   - Opportunity: [How can we capitalize?]
   - Risk: [How might this threaten us?]

2. **[Trend Name]**
   [Repeat structure]

### 5. Forecast Output

**Demand Forecast**:
- **Best Case**: [X users/MRR/Y metrics] - [Assumptions]
- **Expected Case**: [Y users/MRR/Y metrics] - [Assumptions]
- **Worst Case**: [Z users/MRR/Y metrics] - [Assumptions]
- **Confidence Level**: [XX%]

**Trend Forecast**:
- **Near-term (0-3 months)**: [Trends, opportunities, threats]
- **Medium-term (3-6 months)**: [Trends, opportunities, threats]
- **Long-term (6-12 months)**: [Trends, opportunities, threats]

**Key Recommendations**:
1. [Action item based on forecast]
2. [Action item based on trends]
3. [Risk mitigation strategy]

## Analysis Tools

**Quantitative Methods**:
- Linear regression
- Moving averages
- Exponential smoothing
- Time series analysis
- Cohort analysis

**Qualitative Methods**:
- Expert panels
- Delphi method
- Market research
- Customer interviews
- Competitive analysis

## Next Steps
1. Validate forecasts with stakeholders
2. Update product roadmap based on trends
3. Set up monitoring for key metrics
4. Schedule periodic forecast reviews
5. Adjust forecasts as new data arrives`,
  },
  {
    title: 'Complete PRD Generator with UX and Social Integration',
    description: 'Generate comprehensive PRD with UX requirements, social media integration points, and technical considerations.',
    role: 'product-manager',
    category: 'documentation',
    tags: ['prd', 'requirements', 'documentation', 'ux', 'social-media'],
    priority: 'medium',
    content: `# Complete PRD Generator with UX and Social Integration

Act as a Product Manager creating a comprehensive Product Requirements Document.

## Context
- **Feature**: [Feature name]
- **Product**: [Product name]
- **Target Users**: [User segments]
- **Timeline**: [Launch date]

## PRD Sections

### 1. Executive Summary
- [One paragraph: What, why, when, who]

### 2. Problem Statement
- **User Problem**: [Specific pain point]
- **Business Problem**: [Why this matters to business]
- **Market Opportunity**: [Size, urgency]

### 3. Success Metrics
- **Primary KPIs**: [Metric, target, timeframe]
- **Secondary Metrics**: [Supporting metrics]
- **User Engagement**: [Expected adoption/usage]
- **Business Impact**: [Revenue/retention/growth]

### 4. User Stories & Acceptance Criteria

**User Story 1**: As a [user type], I want [goal] so that [benefit]

**Acceptance Criteria**:
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]
- [ ] [Specific, testable criterion]

[Repeat for each user story]

### 5. User Experience Requirements

**UX Principles**:
- [ ] Accessibility (WCAG 2.1 AA compliance)
- [ ] Mobile-first design
- [ ] Loading states and error handling
- [ ] Consistent design system usage

**User Flows**:
- [ ] Happy path: [Step-by-step flow]
- [ ] Error paths: [Handling for failures]
- [ ] Edge cases: [Special scenarios]

**Design Requirements**:
- [ ] Visual design mockups needed
- [ ] Component library references
- [ ] Responsive breakpoints
- [ ] Animation/transition specifications

### 6. Social Media Integration

**Integration Points**:
- [ ] Share functionality: [What/how/where]
- [ ] Social login: [OAuth providers]
- [ ] Social proof: [Reviews, badges, testimonials]
- [ ] Content sharing: [Format, restrictions]

**Social Features**:
- [ ] User-generated content: [What users can share]
- [ ] Social feeds: [Integration with social platforms]
- [ ] Community features: [Discussions, comments]

**Privacy & Permissions**:
- [ ] Data sharing policies
- [ ] User consent requirements
- [ ] GDPR/CCPA compliance
- [ ] Platform-specific limitations

### 7. Technical Considerations

**Architecture**:
- [ ] System integration points
- [ ] API requirements
- [ ] Data model changes
- [ ] Third-party services

**Performance**:
- [ ] Load time requirements
- [ ] Scalability needs
- [ ] Caching strategy
- [ ] CDN requirements

**Security**:
- [ ] Authentication/authorization
- [ ] Data encryption
- [ ] Rate limiting
- [ ] Input validation

### 8. Dependencies & Assumptions

**Dependencies**:
- [ ] [External dependency]
- [ ] [Team dependency]
- [ ] [Technical dependency]

**Assumptions**:
- [ ] [User behavior assumption]
- [ ] [Technical assumption]
- [ ] [Market assumption]

### 9. Risks & Mitigation

**Risks**:
- [ ] **[Risk]**: [Mitigation strategy]
- [ ] **[Risk]**: [Mitigation strategy]

### 10. Timeline & Milestones

- [ ] **[Milestone]**: [Date] - [Deliverable]
- [ ] **[Milestone]**: [Date] - [Deliverable]

## Next Steps
1. Review with stakeholders
2. Get engineering estimates
3. Prioritize user stories
4. Create detailed design specs`,
  },
  {
    title: 'RICE Scoring with Context and Stakeholder Talking Points',
    description: 'Prioritize features using RICE framework with detailed logic and stakeholder communication templates.',
    role: 'product-manager',
    category: 'product',
    tags: ['rice', 'prioritization', 'prioritization-framework', 'decision-making', 'stakeholders'],
    priority: 'medium',
    content: `# RICE Scoring with Context and Stakeholder Talking Points

Act as a Product Manager prioritizing features using RICE scoring with stakeholder communication.

## RICE Framework
**RICE Score = (Reach × Impact × Confidence) / Effort**

## Context
- **Current User Base**: [Size and characteristics]
- **Quarter Objectives**: [2-3 main goals]
- **Engineering Capacity**: [Team size, velocity]
- **Market Pressures**: [Competitive threats, opportunities]

## Features to Evaluate
[List 5-8 features with brief descriptions]

## For Each Feature

### [Feature Name]

**1. Reach Score (1-10)**
- How many users will this affect?
- User impact calculation: [Current users × % affected]
- **Score**: [X] - [Reasoning]

**2. Impact Score (0.25-3)**
- 3.0 = Massive impact (game-changing)
- 2.0 = High impact (significant improvement)
- 1.0 = Medium impact (meaningful)
- 0.5 = Low impact (nice to have)
- 0.25 = Minimal impact

- **Score**: [X.X] - [Reasoning]
- **Business Metrics Connection**: [How this impacts revenue/retention/growth]

**3. Confidence Score (50-100%)**
- **100%**: High confidence (we have data)
- **80%**: Medium-high (good estimates)
- **50%**: Low confidence (guesses)

- **Score**: [XX%] - [Reasoning]
- **Uncertainty Factors**: [What we don't know]

**4. Effort Score (person-months, 1-10)**
- Development: [X person-months]
- Testing: [X person-months]
- Design: [X person-months]
- Documentation: [X person-months]
- **Total**: [X person-months]
- **Score**: [X] - [Complexity breakdown]

**RICE Score**: [X.XX] = ([Reach] × [Impact] × [Confidence]) / [Effort]

**Rank**: [X of Y]

## Stakeholder Talking Points

**For [Feature Name]**:

**Why This Matters**:
- [Business rationale]
- [User value]
- [Strategic alignment]

**What We're Optimizing For**:
- [Primary goal]
- [Secondary goal]

**Trade-offs We're Making**:
- [What we're choosing]
- [What we're not choosing]
- [Why]

**Alternative Approaches Considered**:
- [Option 1]: [Why not chosen]
- [Option 2]: [Why not chosen]

**Timeline & Dependencies**:
- [Expected duration]
- [Resource needs]
- [Blockers]

## Quarterly Roadmap Allocation

**Top Priority (Must Do)**:
1. [Feature] - RICE: [X.XX]
2. [Feature] - RICE: [X.XX]
3. [Feature] - RICE: [X.XX]

**High Priority (Should Do)**:
4. [Feature] - RICE: [X.XX]
5. [Feature] - RICE: [X.XX]

**If Time Permits**:
6. [Feature] - RICE: [X.XX]

**Explanations**:
- [Why top 3 are must-do]
- [Trade-offs between top features]
- [Opportunity cost considerations]`,
  },
  {
    title: 'User Research Plan Development',
    description: 'Design comprehensive user research plans with methodology selection, participant recruitment strategy, timeline, and analysis framework.',
    role: 'product-manager',
    category: 'product',
    tags: ['user-research', 'research-plan', 'methodology', 'validation'],
    priority: 'medium',
    content: `# User Research Plan Development

Act as a Product Manager creating a user research plan.

## Research Objectives
- **Primary Question**: [Main research question]
- **Secondary Questions**: [2-3 supporting questions]
- **Decision Point**: [What decision will this research inform?]

## Research Methodology

**Selected Method**: [Choose one]
- [ ] User Interviews (deep qualitative insights)
- [ ] Surveys (quantitative, broad reach)
- [ ] Usability Testing (task-based validation)
- [ ] Field Studies (contextual observation)
- [ ] Diary Studies (longitudinal behavior)
- [ ] Focus Groups (group dynamics)

**Rationale**: [Why this method best addresses objectives]

## Participant Recruitment

**Target Participants**:
- User Type: [Description]
- Demographics: [Age, role, experience level]
- Inclusion Criteria: [Must-have characteristics]
- Exclusion Criteria: [Avoid these participants]

**Recruitment Strategy**:
- [ ] User database
- [ ] Social media
- [ ] User testing platforms
- [ ] Referrals
- [ ] Incentive: [\$X gift card/credit]

**Sample Size**: [5-8 for interviews, 100+ for surveys]

## Timeline & Milestones

**Week 1**: [Recruitment and screener creation]
**Week 2**: [Conduct research sessions]
**Week 3**: [Analysis and synthesis]
**Week 4**: [Report and recommendations]

## Research Protocol

**Session Structure**:
1. Introduction (5 min)
2. Background questions (10 min)
3. Main research activities (30-45 min)
4. Wrap-up questions (10 min)

**Key Questions**:
- [Question 1]
- [Question 2]
- [Question 3]

## Analysis Framework

**Data Collection**:
- [ ] Record/transcribe sessions
- [ ] Note-taking template
- [ ] Survey analytics

**Analysis Method**:
- [ ] Thematic analysis
- [ ] Affinity mapping
- [ ] Statistical analysis
- [ ] Journey mapping

**Deliverables**:
- [ ] Research report
- [ ] Key insights summary
- [ ] Recommendations
- [ ] Persona updates`,
  },
  {
    title: 'Customer Feedback Summary and Action Plan',
    description: 'Analyze customer feedback from multiple sources (support tickets, surveys, reviews) and create a prioritized action plan.',
    role: 'product-manager',
    category: 'product',
    tags: ['feedback', 'customer-insights', 'analysis', 'prioritization'],
    priority: 'medium',
    content: `# Customer Feedback Summary and Action Plan

Act as a Product Manager analyzing customer feedback and creating action plans.

## Feedback Sources
- [ ] Support tickets (last [timeframe])
- [ ] User surveys
- [ ] Product reviews
- [ ] Social media mentions
- [ ] Sales team notes
- [ ] User interviews

## Feedback Analysis

### Step 1: Collect & Categorize

**Feedback Themes**:
- [Theme 1]: [Description] - [X mentions]
- [Theme 2]: [Description] - [X mentions]
- [Theme 3]: [Description] - [X mentions]

**Sentiment Breakdown**:
- Positive: [X%]
- Neutral: [X%]
- Negative: [X%]

### Step 2: Identify Patterns

**Common Pain Points**:
1. [Pain point] - Affects [X%] of feedback
   - Example quotes: [2-3 direct quotes]
   - Impact: [High/Medium/Low]

2. [Pain point] - Affects [X%] of feedback
   [Repeat structure]

**Feature Requests**:
- [Request 1]: [Frequency, user segments]
- [Request 2]: [Frequency, user segments]

### Step 3: Prioritize Actions

**Priority Matrix**:
- High Impact, Low Effort: [Quick wins]
- High Impact, High Effort: [Major projects]
- Low Impact, Low Effort: [Fill-ins]
- Low Impact, High Effort: [Avoid]

**Action Plan**:

**Immediate Actions (This Sprint)**:
1. [Action] - [Owner] - [Due date]
   - Addresses: [Feedback theme]
   - Expected impact: [Outcome]

**Short-term (Next Quarter)**:
1. [Action] - [Owner] - [Due date]
   [Repeat structure]

**Long-term (Roadmap)**:
1. [Action] - [Owner] - [Due date]
   [Repeat structure]

## Communication Plan

**Stakeholder Updates**:
- [ ] Share findings with [stakeholder group]
- [ ] Present at [meeting]
- [ ] Update roadmap based on priorities

**Customer Communication**:
- [ ] Respond to top feedback themes
- [ ] Announce planned improvements
- [ ] Thank customers for feedback`,
  },
  {
    title: 'Executive Status Update Template',
    description: 'Create weekly executive status updates with business impact focus, key metrics, risks, and resource needs.',
    role: 'product-manager',
    category: 'leadership',
    tags: ['communication', 'stakeholders', 'reporting', 'executive-updates'],
    priority: 'medium',
    content: `# Executive Status Update Template

Act as a Product Manager creating an executive status update.

## Executive Summary (3-5 sentences)
- [Current status]
- [Key achievements]
- [Critical issues/blockers]
- [Resource needs]

## Key Metrics & KPIs

**Product Metrics**:
- [Metric]: [Current value] → [Target] ([Trend])
- [Metric]: [Current value] → [Target] ([Trend])

**Business Impact**:
- Revenue/MRR: [\$X] ([Trend])
- User Growth: [X%] ([Trend])
- Engagement: [X%] ([Trend])

## Status by Initiative

### [Initiative 1]
- **Status**: [On Track / At Risk / Blocked]
- **Progress**: [X% complete]
- **Timeline**: [On schedule / [X] days behind]
- **Business Impact**: [How this drives metrics]
- **Risks**: [Any blockers or concerns]

### [Initiative 2]
[Repeat structure]

## Risks & Blockers

**Critical Risks**:
- [ ] **[Risk]**: [Impact] - [Mitigation plan] - [Owner]

**Blockers**:
- [ ] **[Blocker]**: [Need decision/resource] - [Owner]

## Resource Needs

**Current Quarter**:
- [ ] [Resource need] - [Justification]

**Next Quarter**:
- [ ] [Resource need] - [Justification]

## Decision Requests

**Need Decision On**:
- [ ] [Decision point] - [Context] - [Recommendation] - [Urgency]

## Next Steps
1. [Action item]
2. [Action item]
3. [Action item]`,
  },
  {
    title: 'User Feedback Clustering',
    description: 'Cluster user feedback to identify common themes, pain points, and opportunities for product improvement.',
    role: 'product-manager',
    category: 'product',
    tags: ['feedback', 'clustering', 'analysis', 'themes'],
    priority: 'medium',
    content: `# User Feedback Clustering

Act as a Product Manager clustering user feedback for pattern recognition.

## Feedback Dataset
- **Source**: [Support/Surveys/Reviews/Interviews]
- **Timeframe**: [Date range]
- **Total Feedback Items**: [X]

## Clustering Process

### Step 1: Initial Categorization

**Categories**:
- Feature Requests
- Bug Reports
- UX Issues
- Performance Issues
- Pricing/Billing
- Onboarding
- Support Experience

### Step 2: Theme Identification

**Clusters Identified**:

**Cluster 1: [Theme Name]**
- Count: [X] items ([X%] of total)
- Key Phrases: [Common phrases/quotes]
- User Segments Affected: [Who]
- Severity: [High/Medium/Low]

**Cluster 2: [Theme Name]**
[Repeat structure]

### Step 3: Pattern Analysis

**Emerging Patterns**:
- [Pattern 1]: [Description] - [Evidence]
- [Pattern 2]: [Description] - [Evidence]

**Surprises**:
- [Unexpected finding]
- [Contrary to assumptions]

### Step 4: Prioritization

**Priority Matrix**:
- Frequency × Impact = Priority Score

**Top Clusters**:
1. [Cluster] - Score: [X] - [Recommended action]
2. [Cluster] - Score: [X] - [Recommended action]

## Action Items
- [ ] [Action] - [Owner] - [Timeline]
- [ ] [Action] - [Owner] - [Timeline]`,
  },
  {
    title: 'Feature Breakdown Structure',
    description: 'Decompose complex features into manageable components and sub-tasks for development estimation and planning.',
    role: 'product-manager',
    category: 'product',
    tags: ['feature-planning', 'breakdown', 'estimation', 'work-breakdown'],
    priority: 'medium',
    content: `# Feature Breakdown Structure

Act as a Product Manager breaking down features for development.

## Feature Overview
- **Feature Name**: [Name]
- **Goal**: [What problem this solves]
- **Target Users**: [User segments]

## Feature Breakdown

### Epic Level
**[Epic Name]**

### Feature Level
**[Feature 1]**
- Description: [What]
- User Value: [Why]
- Acceptance Criteria: [How]

**[Feature 2]**
[Repeat structure]

### Story Level
**[User Story 1]**
- As a [user type], I want [goal] so that [benefit]
- Tasks:
  - [ ] [Task 1] - [Estimate]
  - [ ] [Task 2] - [Estimate]
- Dependencies: [Other stories/features]

**[User Story 2]**
[Repeat structure]

### Task Level
**[Task Name]**
- Description: [Specific work item]
- Owner: [Team/Engineer]
- Estimate: [Story points/hours]
- Dependencies: [Other tasks]

## Estimation Summary
- **Total Story Points**: [X]
- **Total Effort**: [X person-weeks]
- **Timeline**: [Estimated duration]

## Dependencies & Risks
- [Dependency 1]: [Impact]
- [Risk 1]: [Mitigation]`,
  },
  {
    title: 'Stakeholder Communication Plan',
    description: 'Develop communication strategies for product launches, feature rollouts, and organizational changes.',
    role: 'product-manager',
    category: 'leadership',
    tags: ['communication', 'stakeholders', 'launch', 'change-management'],
    priority: 'medium',
    content: `# Stakeholder Communication Plan

Act as a Product Manager creating a stakeholder communication plan.

## Communication Objective
- **Event**: [Launch/Change/Update]
- **Timeline**: [Dates]
- **Key Message**: [Main message]

## Stakeholder Mapping

**Stakeholder Groups**:
1. **[Group Name]**
   - Who: [Roles/people]
   - Influence: [High/Medium/Low]
   - Interest: [High/Medium/Low]
   - Key Concerns: [What they care about]
   - Communication Method: [Email/Meeting/Report]

2. **[Group Name]**
   [Repeat structure]

## Communication Timeline

**Pre-Launch (4 weeks before)**:
- [ ] [Message] - [Stakeholder] - [Method] - [Date]

**Pre-Launch (2 weeks before)**:
- [ ] [Message] - [Stakeholder] - [Method] - [Date]

**Launch Week**:
- [ ] [Message] - [Stakeholder] - [Method] - [Date]

**Post-Launch (1 week after)**:
- [ ] [Message] - [Stakeholder] - [Method] - [Date]

## Key Messages

**For [Stakeholder Group]**:
- **What**: [What's happening]
- **Why**: [Why it matters]
- **When**: [Timeline]
- **Impact**: [How it affects them]
- **Action Required**: [What they need to do]

## FAQs

**Anticipated Questions**:
- Q: [Question]
  A: [Answer]

- Q: [Question]
  A: [Answer]

## Success Metrics
- [ ] [Stakeholder] acknowledges message
- [ ] [Stakeholder] prepared for launch
- [ ] No unexpected pushback`,
  },
  {
    title: 'User Documentation Creation',
    description: 'Generate user-facing documentation including tutorials, guides, and help articles based on PRD requirements.',
    role: 'product-manager',
    category: 'documentation',
    tags: ['documentation', 'user-guides', 'tutorials', 'help-content'],
    priority: 'medium',
    content: `# User Documentation Creation

Act as a Product Manager creating user documentation.

## Documentation Scope
- **Feature**: [Feature name]
- **Target Audience**: [User type/experience level]
- **Documentation Types**: [Tutorials/Guides/Help Articles]

## Documentation Structure

### Getting Started Guide
**Purpose**: Help users get started quickly

**Sections**:
1. Overview: [What this feature does]
2. Prerequisites: [What users need beforehand]
3. Quick Start: [3-5 step guide]
4. Common Use Cases: [Examples]

### Detailed Tutorial
**Purpose**: Step-by-step instructions

**Steps**:
1. [Step 1 with screenshots]
2. [Step 2 with screenshots]
3. [Step 3 with screenshots]

**Tips & Tricks**:
- [Tip 1]
- [Tip 2]

### Help Articles
**Common Questions**:
- **Q**: [Question]
  **A**: [Answer with steps]

**Troubleshooting**:
- **Problem**: [Issue]
  **Solution**: [Steps to fix]

## Documentation Standards
- [ ] Screenshots included
- [ ] Clear step numbering
- [ ] Links to related docs
- [ ] Searchable keywords
- [ ] Mobile-friendly format

## Review Checklist
- [ ] Accuracy verified
- [ ] Grammar/spelling checked
- [ ] Links work
- [ ] Screenshots current
- [ ] User tested`,
  },
  {
    title: 'FAQ Generation',
    description: 'Develop comprehensive FAQ sections addressing common user inquiries, troubleshooting, and feature questions.',
    role: 'product-manager',
    category: 'documentation',
    tags: ['faq', 'documentation', 'user-support', 'help'],
    priority: 'medium',
    content: `# FAQ Generation

Act as a Product Manager creating comprehensive FAQs.

## FAQ Categories

**Category 1: Getting Started**
- Q: [Question]
  A: [Answer]

- Q: [Question]
  A: [Answer]

**Category 2: Features**
- Q: [Question]
  A: [Answer]

**Category 3: Troubleshooting**
- Q: [Question]
  A: [Answer with steps]

**Category 4: Billing/Account**
- Q: [Question]
  A: [Answer]

## FAQ Best Practices

**Question Formulation**:
- Use natural language users would search
- Address common pain points
- Include variations of questions

**Answer Guidelines**:
- Keep answers concise (2-3 sentences)
- Include step-by-step instructions when needed
- Link to detailed documentation
- Use clear, jargon-free language

## Sources for FAQs
- [ ] Support ticket analysis
- [ ] User surveys
- [ ] Product reviews
- [ ] Sales team feedback
- [ ] User interviews

## Maintenance Plan
- [ ] Review quarterly
- [ ] Update based on new feedback
- [ ] Archive outdated FAQs
- [ ] Track FAQ effectiveness`,
  },
  {
    title: 'SWOT Analysis for Product Strategy',
    description: 'Conduct SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for product strategy assessment and planning.',
    role: 'product-manager',
    category: 'product',
    tags: ['swot', 'strategic-analysis', 'planning', 'strategy'],
    priority: 'medium',
    content: `# SWOT Analysis for Product Strategy

Act as a Product Manager conducting SWOT analysis.

## Product Context
- **Product**: [Name]
- **Market Position**: [Current state]
- **Analysis Timeframe**: [Current/Future]

## SWOT Framework

### Strengths (Internal, Positive)
**What we do well**:
- [Strength 1]: [Description] - [Evidence]
- [Strength 2]: [Description] - [Evidence]
- [Strength 3]: [Description] - [Evidence]

**Leverage Strategy**: [How to capitalize on strengths]

### Weaknesses (Internal, Negative)
**What we need to improve**:
- [Weakness 1]: [Description] - [Impact]
- [Weakness 2]: [Description] - [Impact]
- [Weakness 3]: [Description] - [Impact]

**Mitigation Strategy**: [How to address weaknesses]

### Opportunities (External, Positive)
**Market trends we can capitalize on**:
- [Opportunity 1]: [Description] - [How to pursue]
- [Opportunity 2]: [Description] - [How to pursue]
- [Opportunity 3]: [Description] - [How to pursue]

**Action Plan**: [Initiatives to seize opportunities]

### Threats (External, Negative)
**Risks we face**:
- [Threat 1]: [Description] - [Likelihood] - [Impact]
- [Threat 2]: [Description] - [Likelihood] - [Impact]
- [Threat 3]: [Description] - [Likelihood] - [Impact]

**Defense Strategy**: [How to protect against threats]

## Strategic Implications

**Key Insights**:
1. [Insight from analysis]
2. [Insight from analysis]
3. [Insight from analysis]

**Strategic Recommendations**:
1. [Recommendation based on SWOT]
2. [Recommendation based on SWOT]
3. [Recommendation based on SWOT]

## Next Steps
- [ ] [Action item]
- [ ] [Action item]
- [ ] [Action item]`,
  },
];

async function createGapPrompts() {
  console.log('🚀 Creating Prompts for Identified Gaps\n');
  console.log('='.repeat(70));

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;

  for (const prompt of GAP_PROMPTS) {
    // Check if prompt already exists
    const existing = await promptsCollection.findOne({
      title: { $regex: new RegExp(prompt.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    });

    if (existing) {
      console.log(`\n⏭️  Skipped: "${prompt.title}" (already exists)`);
      skipped++;
      continue;
    }

    // Generate unique slug
    const baseSlug = generateSlug(prompt.title);
    let slug = baseSlug;
    let suffix = 1;
    
    while (await promptsCollection.findOne({ slug })) {
      suffix++;
      slug = `${baseSlug}-${suffix}`;
    }

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
      isFeatured: prompt.priority === 'high',
      active: true,
      source: 'seed' as const,
    };

    try {
      await promptsCollection.insertOne(promptDoc);
      created++;
      console.log(`\n✅ Created: "${prompt.title}"`);
      console.log(`   Priority: ${prompt.priority} | Role: ${prompt.role}`);
      console.log(`   Tags: ${prompt.tags.join(', ')}`);
    } catch (error) {
      const mongoError = error as { code?: number };
      if (mongoError.code === 11000) {
        console.log(`\n⏭️  Skipped (duplicate): "${prompt.title}"`);
        skipped++;
      } else {
        console.error(`\n❌ Error creating "${prompt.title}":`, error);
      }
    }
  }

  console.log(`\n\n📊 Summary:`);
  console.log(`   - Created: ${created} prompts`);
  console.log(`   - Skipped: ${skipped} prompts`);
  console.log(`\n✨ Complete!`);

  process.exit(0);
}

createGapPrompts().catch(console.error);

