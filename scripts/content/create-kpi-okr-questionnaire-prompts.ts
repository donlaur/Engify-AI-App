#!/usr/bin/env tsx
/**
 * Create KPI/OKR and Questionnaire Prompts for Product Managers and Leaders
 * 
 * Creates prompts for:
 * - KPI Identification (expanded to include OKRs)
 * - Questionnaire Creation
 * 
 * Expands KPI/OKR prompts for various leadership roles.
 * 
 * Usage:
 *   tsx scripts/content/create-kpi-okr-questionnaire-prompts.ts
 */

import { getDb } from '@/lib/mongodb';
import { generateSlug } from '@/lib/utils/slug';
import { randomUUID } from 'crypto';

interface PromptToCreate {
  title: string;
  description: string;
  role: string;
  category: string;
  tags: string[];
  content: string;
}

const PROMPTS_TO_CREATE: PromptToCreate[] = [
  // Gap prompts for PMs
  {
    title: 'Identify Key Performance Indicators (KPIs) for Features',
    description: 'Create a comprehensive list of KPIs for measuring the success of new features, including engagement, adoption, and business impact metrics.',
    role: 'product-manager',
    category: 'analytics',
    tags: ['kpis', 'metrics', 'measurement', 'feature-success', 'analytics'],
    content: `# Identify Key Performance Indicators (KPIs) for Features

Act as a Product Manager identifying KPIs for measuring feature success.

## Feature Context
- **Feature Name**: [Feature name]
- **Feature Description**: [What the feature does]
- **Target Users**: [User segments]
- **Primary Goal**: [Main objective]

## KPI Framework

### 1. Adoption Metrics
- **Feature Adoption Rate**: [% of users who use the feature]
- **Time to First Use**: [Average time from signup to first use]
- **Feature Discovery Rate**: [% of users who discover the feature without prompts]
- **Return Usage**: [% of users who use the feature more than once]

### 2. Engagement Metrics
- **Daily/Monthly Active Users**: [DAU/MAU for the feature]
- **Session Frequency**: [How often users interact with the feature]
- **Session Duration**: [Average time spent using the feature]
- **Feature Completion Rate**: [% of users who complete core actions]

### 3. User Satisfaction Metrics
- **Net Promoter Score (NPS)**: [Customer satisfaction score]
- **Feature-Specific Satisfaction**: [Survey scores for this feature]
- **Customer Support Tickets**: [Number of tickets related to this feature]
- **User Feedback Sentiment**: [Positive/negative feedback ratio]

### 4. Business Impact Metrics
- **Revenue Impact**: [Revenue attributed to this feature]
- **Conversion Rate**: [% of users who convert after using feature]
- **Retention Impact**: [Change in user retention]
- **Customer Lifetime Value (CLTV)**: [Increase in CLTV]

### 5. Performance Metrics
- **Feature Load Time**: [Technical performance]
- **Error Rate**: [% of errors encountered]
- **Success Rate**: [% of successful feature uses]
- **API Response Time**: [Backend performance]

## Recommended KPIs by Goal Type

**If Goal is User Engagement**:
- Primary: Daily Active Users (DAU)
- Secondary: Session Frequency, Feature Completion Rate

**If Goal is Revenue**:
- Primary: Revenue Impact, Conversion Rate
- Secondary: Customer Lifetime Value, Feature Adoption Rate

**If Goal is User Satisfaction**:
- Primary: NPS, Feature-Specific Satisfaction
- Secondary: Support Tickets, User Feedback Sentiment

**If Goal is Adoption**:
- Primary: Feature Adoption Rate, Time to First Use
- Secondary: Return Usage, Feature Discovery Rate

## Implementation Plan

**Tracking Setup**:
- [ ] Identify analytics tools needed
- [ ] Set up event tracking
- [ ] Configure dashboards
- [ ] Define baseline metrics

**Monitoring Schedule**:
- [ ] Daily: Critical metrics (adoption, errors)
- [ ] Weekly: Engagement and performance metrics
- [ ] Monthly: Business impact and satisfaction metrics

**Success Criteria**:
- [ ] Define target values for each KPI
- [ ] Set thresholds for alerts
- [ ] Define review cadence`,
  },
  {
    title: 'Create Questionnaire for User Research',
    description: 'Generate comprehensive questions for customer interviews, surveys, and feedback collection sessions to gather actionable insights.',
    role: 'product-manager',
    category: 'product',
    tags: ['questionnaires', 'user-research', 'surveys', 'interviews', 'feedback-collection'],
    content: `# Create Questionnaire for User Research

Act as a Product Manager creating a questionnaire for user research.

## Research Context
- **Research Objective**: [What you want to learn]
- **Target Audience**: [User segments]
- **Research Method**: [Interview/Survey/Focus Group]
- **Duration**: [Expected time]

## Questionnaire Structure

### 1. Warm-up Questions (5 minutes)
**Purpose**: Build rapport and get context

- Tell me about yourself and your role.
- How long have you been using [product category]?
- What does a typical day look like for you?
- What tools do you currently use for [relevant task]?

### 2. Background and Context (10 minutes)
**Purpose**: Understand current state

- What are your biggest challenges with [current solution]?
- How do you currently solve [problem]?
- What would make your workflow easier?
- What features do you wish existed?

### 3. Specific Feature Questions (15-20 minutes)
**Purpose**: Gather detailed feedback

**For New Features**:
- How would you use [feature]?
- What problems would this solve for you?
- What concerns do you have about [feature]?
- How does this compare to alternative solutions?

**For Existing Features**:
- How often do you use [feature]?
- What do you like most about [feature]?
- What frustrates you about [feature]?
- What improvements would you suggest?

### 4. Ideal Solution Questions (10 minutes)
**Purpose**: Understand desires

- If you could design your ideal solution, what would it look like?
- What would make you switch from your current solution?
- What's missing from current options?
- What would make this feature indispensable?

### 5. Prioritization Questions (5 minutes)
**Purpose**: Understand importance

- Rank these features by importance: [List features]
- If you could only have one improvement, what would it be?
- What would you pay for this feature?
- What's nice-to-have vs. must-have?

### 6. Closing Questions (5 minutes)
**Purpose**: Capture final thoughts

- Any other thoughts or feedback?
- Would you recommend [product] to others? Why/why not?
- What would make you a power user?
- Anything else you'd like to share?

## Survey-Specific Questions

**For Email/Online Surveys** (use shorter, multiple-choice when possible):

**Multiple Choice**:
- How often do you use [feature]?
  - Daily
  - Weekly
  - Monthly
  - Rarely
  - Never

**Rating Scales**:
- Rate your satisfaction with [feature] (1-10)
- How likely are you to recommend [feature]? (0-10 NPS scale)

**Open-Ended**:
- What would improve your experience with [feature]?
- What features would you like to see added?

## Best Practices

**Question Formulation**:
- Use clear, jargon-free language
- Ask one question at a time
- Avoid leading questions
- Use open-ended questions for insights
- Use closed-ended questions for quantification

**Question Order**:
- Start with easy, non-threatening questions
- Build complexity gradually
- Group related questions together
- End with optional demographic questions

**Interview Tips**:
- Listen more than you speak
- Ask "Why?" to dig deeper
- Use "Tell me more about..." prompts
- Capture exact quotes when possible

**Survey Tips**:
- Keep surveys under 10 minutes
- Use progress indicators
- Make questions optional where appropriate
- Offer incentives for completion`,
  },
  // Expanded KPI/OKR prompts for leadership roles
  {
    title: 'Identify KPIs and OKRs for Engineering Managers',
    description: 'Create KPIs and OKRs for measuring engineering team success, including velocity, quality, and team health metrics.',
    role: 'engineering-manager',
    category: 'management',
    tags: ['kpis', 'okrs', 'metrics', 'engineering-management', 'team-metrics'],
    content: `# Identify KPIs and OKRs for Engineering Managers

Act as an Engineering Manager identifying KPIs and OKRs for team success.

## Objective: [What you want to achieve]

## Key Performance Indicators (KPIs)

### 1. Team Velocity Metrics
- **Story Points Delivered**: [Per sprint/quarter]
- **Velocity Trend**: [Upward/Downward/Stable]
- **Sprint Completion Rate**: [% of planned work completed]
- **Estimation Accuracy**: [Planned vs. actual effort]

### 2. Code Quality Metrics
- **Code Review Time**: [Average time to first review]
- **Bug Rate**: [Bugs per release/critical bugs]
- **Test Coverage**: [% of code covered by tests]
- **Technical Debt Ratio**: [Debt vs. new feature work]

### 3. Delivery Metrics
- **Deployment Frequency**: [Deployments per week/month]
- **Lead Time**: [Time from commit to production]
- **Mean Time to Recovery (MTTR)**: [Time to fix incidents]
- **Release Success Rate**: [% of successful releases]

### 4. Team Health Metrics
- **Team Satisfaction**: [Survey scores]
- **Employee Net Promoter Score (eNPS)**: [Employee advocacy]
- **Retention Rate**: [% of team members retained]
- **Onboarding Time**: [Time to productivity for new hires]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level goal]

**Key Result 1**: [Measurable outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Velocity & Delivery**
- Objective: Increase team velocity and delivery reliability
- KR1: Increase story points delivered by 20%
- KR2: Achieve 95% sprint completion rate
- KR3: Reduce lead time by 15%

**Focus: Quality**
- Objective: Improve code quality and reduce defects
- KR1: Reduce bug rate by 30%
- KR2: Achieve 80% test coverage
- KR3: Increase code review completion time by 50%

**Focus: Team Health**
- Objective: Improve team satisfaction and retention
- KR1: Achieve eNPS score of 50+
- KR2: Maintain 95% retention rate
- KR3: Reduce onboarding time by 25%`,
  },
  {
    title: 'Identify KPIs and OKRs for Product Managers',
    description: 'Create KPIs and OKRs for measuring product success, including user engagement, feature adoption, and business impact.',
    role: 'product-manager',
    category: 'product',
    tags: ['kpis', 'okrs', 'metrics', 'product-success', 'business-metrics'],
    content: `# Identify KPIs and OKRs for Product Managers

Act as a Product Manager identifying KPIs and OKRs for product success.

## Product Context
- **Product**: [Product name]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Primary Goal**: [Main objective]

## Key Performance Indicators (KPIs)

### 1. User Engagement Metrics
- **Daily Active Users (DAU)**: [Number of daily active users]
- **Monthly Active Users (MAU)**: [Number of monthly active users]
- **DAU/MAU Ratio**: [Engagement health indicator]
- **Session Frequency**: [Average sessions per user]

### 2. Feature Adoption Metrics
- **Feature Adoption Rate**: [% of users using new features]
- **Time to Value**: [Time from signup to first value]
- **Feature Stickiness**: [% of users returning to features]
- **Power User Rate**: [% of users using advanced features]

### 3. Business Metrics
- **Monthly Recurring Revenue (MRR)**: [Recurring revenue]
- **Customer Acquisition Cost (CAC)**: [Cost to acquire customers]
- **Customer Lifetime Value (CLTV)**: [Total customer value]
- **Conversion Rate**: [% of users converting]

### 4. Product Health Metrics
- **Net Promoter Score (NPS)**: [Customer satisfaction]
- **Churn Rate**: [% of users leaving]
- **Retention Rate**: [% of users retained]
- **Support Ticket Volume**: [Number of support requests]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level product goal]

**Key Result 1**: [Measurable product outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable business outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable user outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: User Growth**
- Objective: Increase active user base and engagement
- KR1: Increase MAU by 25%
- KR2: Achieve DAU/MAU ratio of 40%+
- KR3: Increase session frequency by 20%

**Focus: Revenue Growth**
- Objective: Drive revenue growth through product improvements
- KR1: Increase MRR by 30%
- KR2: Improve CLTV/CAC ratio to 3:1
- KR3: Increase conversion rate by 15%

**Focus: Product Quality**
- Objective: Improve product satisfaction and reduce churn
- KR1: Achieve NPS score of 50+
- KR2: Reduce churn rate by 20%
- KR3: Improve retention rate to 90%+`,
  },
  {
    title: 'Identify KPIs and OKRs for Directors',
    description: 'Create KPIs and OKRs for measuring departmental success, including cross-functional metrics, strategic outcomes, and organizational impact.',
    role: 'director',
    category: 'leadership',
    tags: ['kpis', 'okrs', 'metrics', 'leadership', 'strategic-metrics'],
    content: `# Identify KPIs and OKRs for Directors

Act as a Director identifying KPIs and OKRs for departmental success.

## Department Context
- **Department**: [Department name]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Strategic Priority**: [Main focus]

## Key Performance Indicators (KPIs)

### 1. Operational Metrics
- **Department Efficiency**: [Output per resource]
- **Process Metrics**: [Key process KPIs]
- **Budget Utilization**: [% of budget used effectively]
- **Resource Allocation**: [Optimal resource distribution]

### 2. Cross-Functional Metrics
- **Inter-Department Collaboration**: [Collaboration effectiveness]
- **Stakeholder Satisfaction**: [Satisfaction scores]
- **Project Delivery**: [% of projects delivered on time]
- **Cross-Functional Initiative Success**: [Success rate]

### 3. Strategic Metrics
- **Strategic Initiative Progress**: [% of initiatives on track]
- **Market Position**: [Competitive position]
- **Innovation Index**: [New ideas/initiatives]
- **Organizational Impact**: [Impact on company goals]

### 4. Team Leadership Metrics
- **Team Performance**: [Overall team effectiveness]
- **Leadership Effectiveness**: [360 feedback scores]
- **Talent Development**: [% of team upskilled]
- **Succession Planning**: [Readiness for key roles]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level strategic goal]

**Key Result 1**: [Measurable strategic outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable operational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable organizational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Strategic Execution**
- Objective: Execute key strategic initiatives successfully
- KR1: Complete 100% of Q[X] strategic initiatives
- KR2: Achieve stakeholder satisfaction score of 4.5/5
- KR3: Deliver 90%+ of projects on time and budget

**Focus: Organizational Impact**
- Objective: Drive measurable organizational impact
- KR1: Contribute to [X]% of company-wide goal achievement
- KR2: Improve cross-functional collaboration score by 25%
- KR3: Launch 3+ new strategic initiatives

**Focus: Team Excellence**
- Objective: Build high-performing team
- KR1: Achieve team satisfaction score of 4.5/5
- KR2: Develop 80% of team members in key skills
- KR3: Maintain 95%+ retention rate`,
  },
  {
    title: 'Identify KPIs and OKRs for Engineering Directors',
    description: 'Create KPIs and OKRs for measuring engineering organization success, including technical excellence, delivery velocity, and organizational health.',
    role: 'engineering-director',
    category: 'leadership',
    tags: ['kpis', 'okrs', 'metrics', 'engineering-leadership', 'technical-metrics'],
    content: `# Identify KPIs and OKRs for Engineering Directors

Act as an Engineering Director identifying KPIs and OKRs for engineering organization success.

## Engineering Context
- **Organization Size**: [Number of engineers]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Strategic Priority**: [Main focus]

## Key Performance Indicators (KPIs)

### 1. Technical Excellence Metrics
- **Code Quality Score**: [Combined quality metrics]
- **System Reliability**: [Uptime/availability]
- **Security Posture**: [Security score/vulnerabilities]
- **Technical Debt Ratio**: [Debt vs. new feature work]

### 2. Delivery Metrics
- **Engineering Velocity**: [Story points/features delivered]
- **Release Frequency**: [Number of releases per period]
- **Deployment Success Rate**: [% of successful deployments]
- **Lead Time**: [Time from commit to production]

### 3. Organizational Health Metrics
- **Engineering Efficiency**: [Output per engineer]
- **Team Satisfaction**: [Employee satisfaction scores]
- **Retention Rate**: [% of engineers retained]
- **Engineering Hiring Velocity**: [Time to fill roles]

### 4. Business Impact Metrics
- **Feature Delivery Rate**: [Features delivered per quarter]
- **Product Reliability**: [System uptime/incidents]
- **Cost Efficiency**: [Engineering cost per feature]
- **Innovation Index**: [New technology adoption]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level engineering goal]

**Key Result 1**: [Measurable technical outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable delivery outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable organizational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Technical Excellence**
- Objective: Improve technical quality and reliability
- KR1: Achieve 99.9% system uptime
- KR2: Reduce critical vulnerabilities by 50%
- KR3: Maintain code quality score above 8/10

**Focus: Delivery Velocity**
- Objective: Increase engineering velocity and delivery speed
- KR1: Increase feature delivery rate by 25%
- KR2: Reduce lead time by 30%
- KR3: Achieve 95% deployment success rate

**Focus: Organizational Health**
- Objective: Build high-performing engineering organization
- KR1: Achieve engineering eNPS of 50+
- KR2: Maintain 95%+ retention rate
- KR3: Reduce time-to-productivity for new hires by 20%`,
  },
  {
    title: 'Identify KPIs and OKRs for Product Directors',
    description: 'Create KPIs and OKRs for measuring product organization success, including product strategy execution, user value delivery, and business growth.',
    role: 'product-director',
    category: 'leadership',
    tags: ['kpis', 'okrs', 'metrics', 'product-leadership', 'strategic-metrics'],
    content: `# Identify KPIs and OKRs for Product Directors

Act as a Product Director identifying KPIs and OKRs for product organization success.

## Product Organization Context
- **Product Portfolio**: [Main products]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Strategic Priority**: [Main focus]

## Key Performance Indicators (KPIs)

### 1. Product Portfolio Metrics
- **Product Portfolio Revenue**: [Total revenue across products]
- **Product Market Fit Score**: [PMF indicators]
- **Product Innovation Index**: [New products/features launched]
- **Portfolio Health Score**: [Overall product health]

### 2. Strategic Execution Metrics
- **Roadmap Execution Rate**: [% of roadmap delivered]
- **Strategic Initiative Completion**: [% of initiatives completed]
- **Product-GTM Alignment**: [Alignment with go-to-market]
- **Market Position**: [Competitive position]

### 3. User Value Metrics
- **User Satisfaction Score**: [Overall satisfaction]
- **Time to Value**: [Time for users to realize value]
- **Feature Adoption Rate**: [Adoption across products]
- **User Retention**: [Retention across product portfolio]

### 4. Business Impact Metrics
- **Revenue Growth**: [Revenue growth rate]
- **Market Share**: [Market share changes]
- **Customer Acquisition**: [New customers acquired]
- **Customer Lifetime Value**: [CLTV across products]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level product goal]

**Key Result 1**: [Measurable strategic outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable user outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable business outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Product Portfolio Growth**
- Objective: Grow product portfolio revenue and market position
- KR1: Increase portfolio revenue by 30%
- KR2: Launch 2+ new products/features
- KR3: Achieve #1 market position in [category]

**Focus: Strategic Execution**
- Objective: Execute product strategy successfully
- KR1: Complete 100% of Q[X] roadmap initiatives
- KR2: Achieve 90%+ strategic initiative completion
- KR3: Improve product-GTM alignment score by 25%

**Focus: User Value Delivery**
- Objective: Deliver exceptional user value
- KR1: Achieve user satisfaction score of 4.5/5
- KR2: Reduce time to value by 30%
- KR3: Improve feature adoption rate to 60%+`,
  },
  {
    title: 'Identify KPIs and OKRs for VPs',
    description: 'Create KPIs and OKRs for measuring VP-level success, including organizational impact, strategic execution, and cross-functional leadership.',
    role: 'vp',
    category: 'leadership',
    tags: ['kpis', 'okrs', 'metrics', 'executive-leadership', 'strategic-metrics'],
    content: `# Identify KPIs and OKRs for VPs

Act as a VP identifying KPIs and OKRs for organizational success.

## VP Context
- **Function**: [VP of Engineering/Product/etc.]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Strategic Priority**: [Main focus]

## Key Performance Indicators (KPIs)

### 1. Organizational Performance Metrics
- **Function Efficiency**: [Output per resource]
- **Strategic Initiative Progress**: [% of initiatives on track]
- **Cross-Functional Collaboration**: [Collaboration effectiveness]
- **Organizational Health**: [Employee satisfaction/retention]

### 2. Strategic Impact Metrics
- **Company Goal Contribution**: [% of company goals achieved]
- **Market Position**: [Competitive position]
- **Innovation Rate**: [New initiatives/ideas]
- **Strategic Alignment**: [Alignment with company strategy]

### 3. Leadership Effectiveness Metrics
- **Team Performance**: [Overall team effectiveness]
- **Leadership Effectiveness**: [360 feedback scores]
- **Succession Planning**: [Readiness for key roles]
- **Talent Development**: [% of team developed]

### 4. Business Impact Metrics
- **Revenue Contribution**: [Revenue attributed to function]
- **Cost Efficiency**: [Cost per unit of output]
- **Customer Impact**: [Customer satisfaction/retention]
- **Market Impact**: [Market share/position]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level organizational goal]

**Key Result 1**: [Measurable strategic outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable operational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable organizational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Strategic Execution**
- Objective: Execute key strategic initiatives successfully
- KR1: Complete 100% of Q[X] strategic initiatives
- KR2: Achieve strategic alignment score of 90%+
- KR3: Contribute to [X]% of company-wide goal achievement

**Focus: Organizational Excellence**
- Objective: Build high-performing organization
- KR1: Achieve organizational eNPS of 50+
- KR2: Maintain 95%+ retention rate
- KR3: Develop 80% of leadership team

**Focus: Business Impact**
- Objective: Drive measurable business impact
- KR1: Contribute [X]% to revenue growth
- KR2: Improve cost efficiency by 20%
- KR3: Achieve #1 market position in [category]`,
  },
  {
    title: 'Identify KPIs and OKRs for CTOs',
    description: 'Create KPIs and OKRs for measuring CTO-level success, including technology strategy execution, innovation, and organizational technical excellence.',
    role: 'cto',
    category: 'leadership',
    tags: ['kpis', 'okrs', 'metrics', 'cto-leadership', 'technology-strategy'],
    content: `# Identify KPIs and OKRs for CTOs

Act as a CTO identifying KPIs and OKRs for technology organization success.

## CTO Context
- **Technology Organization**: [Size and scope]
- **Quarter**: [Q1/Q2/Q3/Q4]
- **Strategic Priority**: [Main focus]

## Key Performance Indicators (KPIs)

### 1. Technology Strategy Metrics
- **Strategic Initiative Completion**: [% of tech initiatives completed]
- **Technology Innovation Index**: [New technologies adopted]
- **Technical Debt Reduction**: [% reduction in technical debt]
- **Architecture Modernization**: [% of systems modernized]

### 2. Technical Excellence Metrics
- **System Reliability**: [Uptime/availability across systems]
- **Security Posture**: [Security score/vulnerabilities]
- **Performance Metrics**: [System performance benchmarks]
- **Code Quality**: [Overall code quality score]

### 3. Organizational Metrics
- **Engineering Velocity**: [Features delivered per quarter]
- **Engineering Efficiency**: [Output per engineer]
- **Team Satisfaction**: [Engineering satisfaction scores]
- **Retention Rate**: [% of engineers retained]

### 4. Business Impact Metrics
- **Technology Contribution to Revenue**: [Revenue enabled by tech]
- **Cost Efficiency**: [Engineering cost per feature]
- **Innovation Rate**: [New products/features enabled]
- **Market Position**: [Technology competitive advantage]

## Objectives and Key Results (OKRs)

### Q[Quarter] Objective: [High-level technology goal]

**Key Result 1**: [Measurable strategic outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 2**: [Measurable technical outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

**Key Result 3**: [Measurable organizational outcome]
- Baseline: [Current value]
- Target: [Goal value]
- Progress: [Current progress]

## Recommended OKRs by Focus Area

**Focus: Technology Strategy**
- Objective: Execute technology strategy and drive innovation
- KR1: Complete 100% of Q[X] technology strategic initiatives
- KR2: Adopt 3+ new strategic technologies
- KR3: Reduce technical debt by 30%

**Focus: Technical Excellence**
- Objective: Achieve world-class technical reliability and security
- KR1: Achieve 99.99% system uptime across all systems
- KR2: Achieve security score of 9/10
- KR3: Improve system performance by 25%

**Focus: Organizational Impact**
- Objective: Build high-performing technology organization
- KR1: Increase engineering velocity by 20%
- KR2: Achieve engineering eNPS of 50+
- KR3: Enable [X]% of company revenue growth through technology`,
  },
];

async function createPrompts() {
  console.log('🚀 Creating KPI/OKR and Questionnaire Prompts\n');
  console.log('='.repeat(70));

  const db = await getDb();
  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;

  for (const prompt of PROMPTS_TO_CREATE) {
    // Check if prompt already exists
    const existing = await promptsCollection.findOne({
      title: { $regex: new RegExp(prompt.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      role: prompt.role,
    });

    if (existing) {
      console.log(`\n⏭️  Skipped: "${prompt.title}" (${prompt.role}) - already exists`);
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
      isFeatured: false,
      active: true,
      source: 'seed' as const,
    };

    try {
      await promptsCollection.insertOne(promptDoc);
      created++;
      console.log(`\n✅ Created: "${prompt.title}"`);
      console.log(`   Role: ${prompt.role} | Category: ${prompt.category}`);
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

createPrompts().catch(console.error);

