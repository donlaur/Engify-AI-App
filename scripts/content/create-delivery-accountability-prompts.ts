/**
 * Delivery Accountability & Engineering Process Improvement Prompts
 * Creates prompts for improving delivery accountability through KPIs and
 * overhauling engineering processes (CI/CD, prioritization, delivery cadence, KPI tracking)
 */

import { ObjectId } from 'mongodb';
import { generateUniqueSlug } from '@/lib/utils/slug';
import { getMongoDb } from '@/lib/db/mongodb';

// Simple ID generator
function generateId(prefix: string): string {
  return `${prefix}-${new ObjectId().toString()}`;
}

interface PromptToCreate {
  title: string;
  description: string;
  category: 'management' | 'leadership' | 'process';
  role: 'engineering-director' | 'product-director' | 'vp-engineering' | 'vp-product' | 'engineering-manager' | 'product-manager';
  tags: string[];
  content: string;
}

const DELIVERY_ACCOUNTABILITY_PROMPTS: PromptToCreate[] = [
  {
    title: 'Improving Delivery Accountability Through Measurable KPIs',
    description: 'Guide for Engineering Directors and VPs on establishing measurable KPIs that drive delivery accountability across teams. Focuses on defining meaningful metrics, tracking progress, and creating accountability frameworks.',
    category: 'management',
    role: 'engineering-director',
    tags: ['kpis', 'metrics', 'delivery-accountability', 'performance-tracking', 'leadership', 'process-improvement', 'engineering-management'],
    content: `# Improving Delivery Accountability Through Measurable KPIs

You are an Engineering Director or VP establishing KPIs (Key Performance Indicators) to improve delivery accountability across your engineering organization. Your goal is to create measurable metrics that drive behavior, track progress, and ensure teams consistently meet delivery commitments.

## The Challenge

- Teams miss deadlines without clear accountability
- No visibility into delivery performance trends
- Goals are vague or not measurable
- Accountability is unclear or only enforced reactively
- Hard to identify patterns or systemic issues

## Context

- **Your Role**: [Engineering Director / VP of Engineering]
- **Organization Size**: [Team size / number of teams]
- **Current State**: [Describe current delivery performance]
- **Target Outcome**: [What you want to achieve]

## Step 1: Define Meaningful KPIs

### Delivery Metrics

**Commitment Delivery Rate**
- **Definition**: % of planned work delivered on time
- **Formula**: (Work delivered on time / Total committed work) × 100
- **Target**: 85%+ (allows for reasonable uncertainty)
- **Tracking**: Weekly sprint/delivery cycle reviews

**Predictability Score**
- **Definition**: How accurately teams estimate delivery dates
- **Formula**: (1 - (|Actual - Estimated| / Estimated)) × 100
- **Target**: 70%+ accuracy
- **Tracking**: Compare estimates vs. actuals over rolling 4-week period

**Delivery Velocity**
- **Definition**: Consistent output measured in story points, features, or business value
- **Formula**: Average completed work per sprint/delivery cycle
- **Target**: Consistent velocity ±20% variance
- **Tracking**: Rolling average over last 6 sprints

**Cycle Time**
- **Definition**: Time from work start to delivery
- **Formula**: Average days from "in progress" to "done"
- **Target**: Based on team/product needs (e.g., < 2 weeks for features)
- **Tracking**: Track throughput per team

### Quality Metrics

**Defect Rate**
- **Definition**: Bugs found after release
- **Formula**: (Post-release bugs / Total features delivered) × 100
- **Target**: < 5% of features have critical bugs
- **Tracking**: Monthly review

**Code Review Speed**
- **Definition**: Time from PR creation to merge
- **Formula**: Average hours from "ready for review" to "merged"
- **Target**: < 24 hours for standard PRs
- **Tracking**: Weekly review

**Deployment Frequency**
- **Definition**: How often teams deploy to production
- **Formula**: Number of deployments per week/month
- **Target**: At least weekly (ideally daily for web apps)
- **Tracking**: Automated tracking from CI/CD

### Process Metrics

**Sprint/Delivery Cycle Completion Rate**
- **Definition**: % of cycles where committed work is completed
- **Formula**: (Sprints with 100% completion / Total sprints) × 100
- **Target**: 80%+ of sprints
- **Tracking**: After each sprint

**Estimation Accuracy**
- **Definition**: How well teams estimate story points or complexity
- **Formula**: (Estimated points / Actual points) × 100 (closer to 100% = better)
- **Target**: 80-120% accuracy range
- **Tracking**: Retrospective review

## Step 2: Establish Accountability Framework

### Individual Accountability

**For Team Leads:**
- Own team delivery metrics
- Report on KPI performance weekly
- Identify blockers and escalate proactively
- Coach team members on delivery practices

**For Individual Contributors:**
- Complete assigned work within estimated timeframes
- Communicate blockers within 4 hours
- Participate in estimation and planning
- Focus on quality and completeness

**For Directors/VPs:**
- Review organization-level KPIs weekly
- Identify trends and systemic issues
- Provide support and remove blockers
- Hold teams accountable to commitments

### Team Accountability

**Sprint/Delivery Commitments:**
- Teams commit to work at sprint planning
- Commitments are visible and tracked
- Teams report progress daily
- Retrospectives review what went well/poorly

**Escalation Process:**
- Blockers escalated within 24 hours
- At-risk work flagged immediately
- Weekly sync on delivery status
- Monthly review of KPI trends

### Organizational Accountability

**Weekly Delivery Reviews:**
- All teams report on delivery metrics
- Directors review organization-wide trends
- Identify patterns and systemic issues
- Action items assigned and tracked

**Monthly Performance Reviews:**
- Review KPI trends over time
- Celebrate wins and improvements
- Address persistent issues
- Adjust goals and processes as needed

## Step 3: Implement Tracking Systems

### Tools & Dashboards

**KPI Dashboard Should Include:**
- Delivery rate trends
- Cycle time distribution
- Velocity charts
- Defect rate trends
- Blockers and escalation status

**Key Reports:**
- Weekly delivery status report
- Monthly KPI summary
- Quarterly trend analysis
- Team performance comparisons

### Data Collection

**Automated Metrics:**
- CI/CD deployment data
- Issue tracking system (Jira, Linear, etc.)
- Code review tools (GitHub, GitLab)
- Monitoring/observability tools

**Manual Tracking:**
- Weekly team standups
- Sprint planning commitments
- Retrospective notes
- Post-mortem findings

## Step 4: Create Accountability Culture

### Make Metrics Visible

- Display KPIs prominently (dashboards, team channels)
- Share organization-wide metrics regularly
- Make individual/team performance visible (non-punitive)
- Celebrate improvements and wins

### Focus on Learning, Not Blame

- Use metrics to identify process issues, not individual failures
- Retrospectives focus on "what can we improve?" not "who messed up?"
- Celebrate transparency and early flagging of issues
- Reward accountability and proactive communication

### Continuous Improvement

- Review KPIs monthly and adjust as needed
- Remove metrics that don't drive behavior
- Add metrics that reveal new insights
- Iterate on accountability frameworks

## Step 5: Address Common Issues

### Problem: Teams Gaming Metrics

**Solution:**
- Focus on outcome metrics, not just output
- Review work quality, not just quantity
- Use multiple metrics to paint full picture
- Create culture of honesty over optimization

### Problem: Metrics Don't Drive Behavior

**Solution:**
- Ensure metrics are tied to visible goals
- Make metrics part of regular reviews
- Create accountability for meeting targets
- Adjust metrics if they're not meaningful

### Problem: Too Many Metrics

**Solution:**
- Focus on 3-5 key metrics per team
- Remove metrics that don't drive decisions
- Consolidate related metrics
- Different metrics for different levels (team vs. org)

## Example KPI Framework

### Team-Level KPIs (Weekly Review)

1. **Commitment Delivery Rate**: 85%+
2. **Cycle Time**: < 2 weeks average
3. **Code Review Speed**: < 24 hours
4. **Sprint Completion**: 100% of committed work

### Organization-Level KPIs (Monthly Review)

1. **Predictability Score**: 70%+ accuracy
2. **Defect Rate**: < 5% of features
3. **Deployment Frequency**: 2+ times per week
4. **Delivery Velocity**: Consistent ±20% variance

## Success Criteria

- ✅ Teams consistently meet delivery commitments
- ✅ Visibility into delivery performance trends
- ✅ Clear accountability at all levels
- ✅ Proactive identification of blockers
- ✅ Metrics drive continuous improvement
- ✅ Culture of accountability without blame

## Next Steps

1. Define 3-5 key KPIs for your organization
2. Set up tracking dashboards
3. Establish weekly/monthly review cadence
4. Communicate metrics and accountability framework
5. Iterate based on results

---

*Remember: KPIs should drive behavior change, not just measurement. Focus on metrics that help teams understand and improve their delivery process.*`,
  },
  {
    title: 'Overhauling Engineering Processes for Consistent Delivery',
    description: 'Comprehensive guide for Engineering Directors and VPs on overhauling engineering processes (CI/CD, prioritization, delivery cadence, KPI tracking) to consistently meet or exceed product roadmap deadlines. Includes process redesign, implementation, and measurement.',
    category: 'process',
    role: 'vp-engineering',
    tags: ['process-improvement', 'cicd', 'prioritization', 'delivery-cadence', 'kpi-tracking', 'roadmap', 'engineering-processes', 'leadership'],
    content: `# Overhauling Engineering Processes for Consistent Delivery

You are a VP of Engineering or Engineering Director overhauling your engineering processes to ensure teams consistently meet or exceed product roadmap deadlines. Your goal is to redesign CI/CD, prioritization, delivery cadence, and KPI tracking to create a predictable, high-performing delivery system.

## The Challenge

- Engineering teams consistently miss roadmap deadlines
- Unclear prioritization leads to scope creep and delays
- CI/CD pipeline is slow, unreliable, or manual
- Delivery cadence is inconsistent or unpredictable
- No visibility into delivery performance or blockers
- Processes don't scale as teams grow

## Context

- **Your Role**: [VP of Engineering / Engineering Director]
- **Organization Size**: [Number of teams / engineers]
- **Current State**: [Describe current process issues]
- **Target Outcome**: [Consistent delivery, meeting roadmap deadlines]

## Step 1: Assess Current State

### Audit Existing Processes

**CI/CD Pipeline:**
- [ ] Build time (target: < 10 minutes)
- [ ] Test execution time (target: < 15 minutes)
- [ ] Deployment frequency (target: daily)
- [ ] Failure rate (target: < 5%)
- [ ] Manual steps remaining
- [ ] Rollback capability

**Prioritization Process:**
- [ ] How are priorities decided?
- [ ] Who owns prioritization decisions?
- [ ] How often are priorities reviewed?
- [ ] Visibility into prioritization logic
- [ ] How are urgent requests handled?

**Delivery Cadence:**
- [ ] Sprint/delivery cycle length
- [ ] Consistency of delivery dates
- [ ] How often do teams deliver?
- [ ] Planning overhead vs. delivery time
- [ ] Buffer time for uncertainty

**KPI Tracking:**
- [ ] What metrics are tracked?
- [ ] How often are metrics reviewed?
- [ ] Visibility into delivery performance
- [ ] Action items from metric reviews
- [ ] Accountability for metrics

### Identify Root Causes

**Common Issues:**
- Slow CI/CD delays all deployments
- Unclear prioritization causes rework
- Inconsistent cadence prevents predictability
- No metrics means no visibility
- Lack of accountability means no improvement

## Step 2: Redesign CI/CD Pipeline

### Principles

**Speed:**
- Automated builds and tests
- Parallel execution where possible
- Fast feedback loops (< 15 minutes)
- Optimize slowest steps first

**Reliability:**
- Automated testing at multiple levels
- Canary deployments or feature flags
- Quick rollback capability
- Monitoring and alerting

**Automation:**
- Minimize manual steps
- Self-service deployments
- Automated testing and validation
- Infrastructure as code

### Implementation Plan

**Phase 1: Foundation (Weeks 1-2)**
- [ ] Set up automated builds
- [ ] Implement basic test automation
- [ ] Create deployment scripts
- [ ] Add basic monitoring

**Phase 2: Speed (Weeks 3-4)**
- [ ] Parallelize test execution
- [ ] Optimize build times
- [ ] Implement caching
- [ ] Review and remove slow steps

**Phase 3: Reliability (Weeks 5-6)**
- [ ] Add integration tests
- [ ] Implement canary deployments
- [ ] Add automated rollback
- [ ] Improve monitoring and alerting

**Phase 4: Scale (Weeks 7-8)**
- [ ] Infrastructure as code
- [ ] Self-service deployments
- [ ] Advanced testing strategies
- [ ] Cross-team standardization

### Success Metrics

- ✅ Build time < 10 minutes
- ✅ Test execution < 15 minutes
- ✅ Deployment frequency: daily
- ✅ Failure rate < 5%
- ✅ Zero manual deployment steps
- ✅ Rollback time < 5 minutes

## Step 3: Redesign Prioritization Process

### Principles

**Clear Decision Framework:**
- Business impact (high/medium/low)
- Strategic alignment (critical/nice-to-have)
- Dependencies and blockers
- Resource availability

**Transparency:**
- Visible prioritization criteria
- Public roadmap with priorities
- Regular updates on priority changes
- Clear explanation of decisions

**Adaptability:**
- Regular priority reviews (weekly/bi-weekly)
- Quick response to urgent requests
- Buffer for unexpected work
- Clear escalation path

### Implementation Framework

**Priority Levels:**

1. **P0 - Critical**: Blocks roadmap or production issue
   - Response: Immediate
   - Approval: VP/Director
   - Timeline: As soon as possible

2. **P1 - High**: Aligned with roadmap, high business impact
   - Response: Within sprint
   - Approval: Director/Manager
   - Timeline: Next delivery cycle

3. **P2 - Medium**: Aligned with roadmap, moderate impact
   - Response: Within quarter
   - Approval: Manager/Team Lead
   - Timeline: Planned in roadmap

4. **P3 - Low**: Nice-to-have, low impact
   - Response: When bandwidth available
   - Approval: Team Lead
   - Timeline: Backlog

**Prioritization Process:**

1. **Product/Engineering Alignment Meeting** (Weekly)
   - Review roadmap priorities
   - Discuss new requests
   - Assess dependencies
   - Make priority decisions

2. **Team Planning** (Per sprint/cycle)
   - Pull prioritized work
   - Assess capacity
   - Commit to delivery
   - Raise blockers early

3. **Urgent Request Process**
   - Submit request with impact assessment
   - VP/Director reviews within 4 hours
   - If approved, identify what gets deprioritized
   - Communicate changes to teams

### Success Metrics

- ✅ P0 requests resolved within 24 hours
- ✅ P1 requests resolved within sprint
- ✅ Roadmap alignment: 90%+ of work aligns with roadmap
- ✅ Priority changes tracked and communicated
- ✅ Teams understand prioritization logic

## Step 4: Establish Consistent Delivery Cadence

### Principles

**Predictability:**
- Regular delivery cycles
- Consistent sprint lengths
- Predictable release dates
- Clear commitment process

**Balance:**
- Enough time for quality work
- Not too much overhead
- Flexible enough for uncertainty
- Rigid enough for predictability

### Delivery Cadence Framework

**Sprint/Delivery Cycle Length:**
- **2-week sprints** (recommended for most teams)
  - 1 week planning/execution
  - 1 week execution/delivery
  - 1 day sprint planning
  - 1 day sprint review/retrospective

- **3-week cycles** (for larger features)
  - 2 weeks execution
  - 1 week polish/delivery
  - More buffer for uncertainty

**Delivery Schedule:**
- **Weekly releases** (web/mobile apps)
  - Fast feedback loops
  - Lower risk per release
  - Continuous delivery

- **Bi-weekly releases** (platform/infrastructure)
  - More thorough testing
  - Lower release overhead
  - Still predictable cadence

**Commitment Process:**

1. **Sprint Planning** (Day 1)
   - Review prioritized backlog
   - Estimate work complexity
   - Commit to sprint goals
   - Identify dependencies

2. **Daily Standups** (Daily)
   - Progress updates
   - Blocker identification
   - Team coordination

3. **Sprint Review** (End of sprint)
   - Demo completed work
   - Gather feedback
   - Review delivery metrics

4. **Retrospective** (End of sprint)
   - What went well?
   - What could improve?
   - Action items
   - Process adjustments

### Success Metrics

- ✅ 100% of sprints complete on time
- ✅ Consistent sprint length (no extensions)
- ✅ Predictable release dates
- ✅ Delivery velocity stays consistent
- ✅ Teams meet commitments 85%+ of time

## Step 5: Implement KPI Tracking System

### Key Metrics Dashboard

**Delivery Metrics:**
- Commitment Delivery Rate (target: 85%+)
- Cycle Time (target: < 2 weeks)
- Velocity (target: consistent ±20%)
- Predictability Score (target: 70%+)

**Quality Metrics:**
- Defect Rate (target: < 5%)
- Code Review Speed (target: < 24 hours)
- Test Coverage (target: 80%+)

**Process Metrics:**
- CI/CD Build Time (target: < 10 minutes)
- Deployment Frequency (target: daily)
- Failure Rate (target: < 5%)

### Tracking Systems

**Tools:**
- Project management (Jira, Linear, etc.)
- CI/CD (GitHub Actions, GitLab CI, etc.)
- Monitoring (Datadog, New Relic, etc.)
- Custom dashboards (Grafana, etc.)

**Review Cadence:**
- **Daily**: Team standups
- **Weekly**: Delivery status review
- **Monthly**: KPI trend analysis
- **Quarterly**: Process improvement review

### Accountability Framework

**Team Level:**
- Teams track own metrics
- Weekly review of delivery performance
- Retrospectives focus on improvement
- Action items from metrics

**Organization Level:**
- Directors review team metrics weekly
- VPs review org metrics monthly
- Identify trends and systemic issues
- Hold teams accountable to commitments

## Step 6: Implementation Roadmap

### Phase 1: Foundation (Month 1)
- [ ] Assess current state
- [ ] Define target metrics
- [ ] Set up basic tracking
- [ ] Communicate new processes

### Phase 2: CI/CD Overhaul (Month 2)
- [ ] Redesign CI/CD pipeline
- [ ] Implement automation
- [ ] Optimize for speed
- [ ] Add monitoring

### Phase 3: Prioritization & Cadence (Month 3)
- [ ] Implement prioritization framework
- [ ] Establish delivery cadence
- [ ] Train teams on new processes
- [ ] Begin tracking KPIs

### Phase 4: Optimization (Month 4+)
- [ ] Review metrics and trends
- [ ] Iterate on processes
- [ ] Scale successful patterns
- [ ] Continuous improvement

## Success Criteria

- ✅ Teams consistently meet roadmap deadlines
- ✅ CI/CD pipeline fast and reliable
- ✅ Clear prioritization framework
- ✅ Predictable delivery cadence
- ✅ Visibility into delivery performance
- ✅ Accountability at all levels
- ✅ Continuous process improvement

## Common Pitfalls to Avoid

**Over-Engineering:**
- Start simple, iterate
- Don't build complex systems before validating simple ones
- Focus on outcomes, not process perfection

**Ignoring Culture:**
- Processes alone won't solve delivery issues
- Invest in team training and buy-in
- Create culture of accountability

**Too Many Metrics:**
- Focus on 3-5 key metrics
- Remove metrics that don't drive behavior
- Keep it simple and actionable

**Set-and-Forget:**
- Processes need continuous improvement
- Review metrics regularly
- Adjust based on results

---

*Remember: The goal is consistent delivery, not perfect processes. Focus on outcomes and iterate based on results.*`,
  },
];

async function main() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    const db = await getMongoDb();
    const promptsCollection = db.collection('prompts');

    // Fetch all existing slugs to ensure uniqueness
    const existingSlugs = await promptsCollection
      .find({}, { projection: { slug: 1 } })
      .toArray();
    const allSlugs = new Set(
      existingSlugs.map((p) => p.slug).filter((s): s is string => Boolean(s))
    );

    console.log(`\n📝 Creating ${DELIVERY_ACCOUNTABILITY_PROMPTS.length} delivery accountability prompts...\n`);

    let created = 0;
    let skipped = 0;

    for (const promptData of DELIVERY_ACCOUNTABILITY_PROMPTS) {
      // Check if prompt already exists
      const existing = await promptsCollection.findOne({
        title: promptData.title,
      });

      if (existing) {
        console.log(`⏭️  Skipping: ${promptData.title} (already exists)`);
        skipped++;
        continue;
      }

      // Generate unique slug
      const slug = generateUniqueSlug(promptData.title, allSlugs);
      allSlugs.add(slug); // Add to set to avoid duplicates in this batch

      // Create prompt document
      const promptDoc = {
        id: generateId('prompt'),
        slug,
        title: promptData.title,
        description: promptData.description,
        content: promptData.content,
        category: promptData.category,
        role: promptData.role,
        tags: promptData.tags,
        views: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        isFeatured: false,
        active: true,
        source: 'seed',
        currentRevision: 1,
        auditVersion: 0,
      };

      await promptsCollection.insertOne(promptDoc);
      console.log(`✅ Created: ${promptData.title}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`\n✨ Done!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

