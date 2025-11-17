/**
 * Decision-Making Framework Prompt Templates
 * DARCI, RACI, Value/Effort, Build/Buy frameworks for strategic decision-making
 */

import type { Prompt } from '@/lib/schemas/prompt';

export const decisionFrameworkPrompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'decision-001',
    title: 'DARCI Decision Framework',
    description: 'Define decision roles: Driver, Approver, Recommender, Consulted, Informed. Clarify who makes decisions and who has input.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['darci', 'decision-making', 'leadership', 'stakeholder-management', 'governance'],
    isPublic: true,
    content: `You are an engineering manager using the DARCI framework to clarify decision-making roles for a project or initiative. Generate a DARCI matrix:

**Decision Context:**
- Decision/Initiative: [What decision needs to be made?]
- Scope: [Team-level / Department-level / Company-wide]
- Timeline: [When does this decision need to be made?]
- Impact: [Who will this affect?]

**Generate a DARCI matrix with these roles:**

## DARCI Roles Explained

**D - Driver** (1 person)
- Owns the decision and drives it to completion
- Does the research, analysis, and preparation
- Recommends a solution
- Typically: PM, Tech Lead, or Engineering Manager

**A - Approver** (1 person, sometimes 2)
- Has final veto power
- Makes the final decision
- Signs off on the Driver's recommendation
- Typically: Director, VP, or CTO

**R - Recommender** (1-3 people)
- Provides input and recommendations
- Contributes expertise and perspective
- Influences but doesn't decide
- Typically: Senior Engineers, Architects, Product Managers

**C - Consulted** (2-5 people)
- Provides expertise when asked
- Subject matter experts
- Consulted before decision but not in every meeting
- Typically: Security, DevOps, Design, Legal, Finance

**I - Informed** (Everyone else affected)
- Told about the decision after it's made
- No input required, but kept in the loop
- Typically: Team members, stakeholders, users

## DARCI Matrix

**Decision:** [Decision/Initiative Name]

| Person/Role | D | A | R | C | I | Notes |
|-------------|---|---|---|---|---|------|
| [Name/Role] | ✓ |   |   |   |   | [Why they're the Driver] |
| [Name/Role] |   | ✓ |   |   |   | [Why they approve] |
| [Name/Role] |   |   | ✓ |   |   | [Their expertise/input] |
| [Name/Role] |   |   | ✓ |   |   | [Their expertise/input] |
| [Name/Role] |   |   |   | ✓ |   | [When to consult them] |
| [Name/Role] |   |   |   | ✓ |   | [When to consult them] |
| [Team/Group] |   |   |   |   | ✓ | [How to inform them] |

## Decision Process

**Phase 1: Research & Analysis (Driver)**
- [ ] Driver researches options
- [ ] Driver consults with Consulted roles
- [ ] Driver prepares recommendation document

**Phase 2: Review & Input (Recommenders)**
- [ ] Driver shares draft with Recommenders
- [ ] Recommenders provide feedback
- [ ] Driver incorporates feedback

**Phase 3: Approval (Approver)**
- [ ] Driver presents final recommendation to Approver
- [ ] Approver reviews and asks questions
- [ ] Approver makes decision

**Phase 4: Communication (Informed)**
- [ ] Decision communicated to Informed roles
- [ ] Rationale and next steps shared
- [ ] Questions answered

## Communication Plan

**To Recommenders:**
- "I'm driving this decision and would value your input. Can you review [document] by [date]?"

**To Consulted:**
- "I'm working on [decision] and would like to consult with you about [specific aspect]. When can we talk?"

**To Approver:**
- "I've researched [decision] and recommend [option]. Here's my analysis: [link]. Ready for your decision."

**To Informed:**
- "We've decided [outcome]. Here's why and what happens next: [summary]."

## Common Mistakes to Avoid

❌ **Too many Drivers** - Only one person should drive
❌ **No Approver** - Decision stalls without clear approver
❌ **Too many Approvers** - Creates deadlock
❌ **Consulted treated as Recommenders** - Slows down process
❌ **Recommenders not given enough time** - Rushed decisions
❌ **Informed roles not informed** - Creates confusion and resentment

## Decision Log

**Decision:** [Outcome]
**Date:** [Date]
**Driver:** [Name]
**Approver:** [Name]
**Rationale:** [Why this decision was made]
**Next Steps:** [What happens next]
**Review Date:** [When to revisit this decision]`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
  {
    id: 'decision-002',
    title: 'RACI Responsibility Matrix',
    description: 'Clarify project roles: Responsible, Accountable, Consulted, Informed. Map who does what on complex projects.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['raci', 'project-management', 'responsibility', 'team-coordination', 'accountability'],
    isPublic: true,
    content: `You are an engineering manager creating a RACI matrix for a project or initiative. Generate a comprehensive responsibility matrix:

**Project Context:**
- Project Name: [What is this project?]
- Scope: [Team-level / Cross-team / Company-wide]
- Duration: [How long will this take?]
- Key Activities: [List major activities/tasks]

**Generate a RACI matrix:**

## RACI Roles Explained

**R - Responsible** (Can be multiple)
- Does the actual work
- Completes the task
- "The doer"
- Typically: Engineers, Designers, QA

**A - Accountable** (Only 1 per activity)
- Ultimately answerable for the outcome
- Has veto power
- "The buck stops here"
- Typically: Engineering Manager, Tech Lead, Product Manager

**C - Consulted** (Multiple)
- Provides input before work is done
- Subject matter experts
- Two-way communication
- Typically: Security, DevOps, Architects, Legal

**I - Informed** (Multiple)
- Told about progress/completion
- One-way communication
- No input required
- Typically: Stakeholders, Leadership, Other Teams

## RACI Matrix Template

**Project:** [Project Name]

| Activity/Task | [Person 1] | [Person 2] | [Person 3] | [Team/Group] | Notes |
|---------------|------------|------------|------------|--------------|-------|
| [Activity 1] | A | R | C | I | [Why this assignment] |
| [Activity 2] | A | R,R | C | I | [Multiple responsible] |
| [Activity 3] | R | A | C,C | I | [Multiple consulted] |
| [Activity 4] | R | A | C | I,I | [Multiple informed] |

## Key Activities to Map

**Planning & Design:**
- [ ] Requirements gathering
- [ ] Architecture design
- [ ] Technical design review
- [ ] Security review
- [ ] Project planning

**Execution:**
- [ ] Backend development
- [ ] Frontend development
- [ ] API development
- [ ] Testing
- [ ] Code review

**Deployment & Operations:**
- [ ] Infrastructure setup
- [ ] Deployment
- [ ] Monitoring setup
- [ ] Documentation
- [ ] Training

**Communication:**
- [ ] Stakeholder updates
- [ ] Team standups
- [ ] Status reports
- [ ] Demo preparation

## RACI Best Practices

✅ **Only ONE Accountable per activity** - Multiple As = confusion
✅ **Multiple Responsible is OK** - Teams work together
✅ **Consulted early** - Don't consult at the last minute
✅ **Informed consistently** - Regular updates, not surprises
✅ **Document exceptions** - If someone is R and A, note why

## Common RACI Mistakes

❌ **Too many As** - "Who's really accountable?" becomes unclear
❌ **No A assigned** - Work falls through cracks
❌ **C treated as R** - Slows down work, creates bottlenecks
❌ **I not informed** - Creates confusion and resentment
❌ **Matrix too complex** - Hard to understand and maintain

## Responsibility Clarity Checklist

Before starting work:
- [ ] Everyone knows their R/A/C/I roles
- [ ] Accountable person identified for each activity
- [ ] Consulted roles know when they'll be asked
- [ ] Informed roles know how they'll receive updates
- [ ] Conflicts resolved (e.g., multiple As)

## Communication Plan

**To Responsible:**
- "You're responsible for [activity]. Here's what needs to be done: [details]"

**To Accountable:**
- "You're accountable for [activity]. [Person] is responsible. Check in [frequency]."

**To Consulted:**
- "We'll consult you on [aspect] before we proceed. Here's when: [timeline]"

**To Informed:**
- "We'll keep you informed via [channel] on [schedule]. Updates include: [what]"

## Project RACI Example

**Project: New Authentication System**

| Activity | Engineering Manager | Tech Lead | Backend Engineer | Frontend Engineer | Security | DevOps | Product | Leadership |
|----------|-------------------|-----------|-----------------|-------------------|----------|--------|---------|------------|
| Requirements | A | R | C | C | C | C | C | I |
| Architecture | A | R | R | C | C | C | C | I |
| Backend Dev | A | C | R | C | C | C | I | I |
| Frontend Dev | A | C | C | R | C | C | I | I |
| Security Review | A | C | C | C | R | C | I | I |
| Infrastructure | A | C | I | I | C | R | I | I |
| Testing | A | R | R | R | C | C | C | I |
| Deployment | A | C | I | I | C | R | I | I |
| Documentation | A | R | R | R | C | C | C | I |
| Stakeholder Updates | A | R | I | I | I | I | C | C |`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
  {
    id: 'decision-003',
    title: 'Value vs. Effort Matrix',
    description: 'Categorize initiatives into Quick Wins, Big Bets, Fill-ins, and Time Sinks. Prioritize strategically.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['prioritization', 'strategy', 'planning', 'value-effort', 'roadmap'],
    isPublic: true,
    content: `You are an engineering manager using the Value vs. Effort matrix to prioritize initiatives. Generate a strategic prioritization matrix:

**Context:**
- Time Horizon: [Q1 / Q2 / H1 / Year]
- Team Capacity: [Available person-months]
- Strategic Goals: [Top 3-5 goals for this period]

**Generate a Value vs. Effort matrix:**

## Value vs. Effort Framework

**Value:** Business impact, user benefit, strategic importance (High/Medium/Low)
**Effort:** Person-months, complexity, risk (High/Medium/Low)

## The Four Quadrants

### 🎯 Quick Wins (High Value, Low Effort)
**Do First** - High ROI, builds momentum
- Ship these immediately
- Great for team morale
- Low risk, high reward

### 🚀 Big Bets (High Value, High Effort)
**Plan Carefully** - Major initiatives, significant impact
- Requires careful planning
- Allocate resources properly
- Break into phases
- Monitor closely

### ⏰ Fill-Ins (Low Value, Low Effort)
**Do When Free** - Nice to have, easy wins
- Good for downtime
- Don't block other work
- Low priority

### ❌ Time Sinks (Low Value, High Effort)
**Avoid** - Low ROI, waste of resources
- Don't do these
- Reconsider if value increases
- Or reduce effort significantly

## Initiative Matrix

**Time Period:** [Q1 2025]

| Initiative | Value | Effort | Quadrant | Priority | Owner | Timeline |
|------------|-------|--------|----------|----------|-------|----------|
| [Initiative 1] | High | Low | Quick Win | 1 | [Name] | [When] |
| [Initiative 2] | High | High | Big Bet | 2 | [Name] | [When] |
| [Initiative 3] | Low | Low | Fill-in | 5 | [Name] | [When] |
| [Initiative 4] | Low | High | Time Sink | Skip | - | - |

## Value Assessment Criteria

**High Value:**
- [ ] Aligns with strategic goals
- [ ] Significant user impact (>10K users)
- [ ] Revenue/cost impact
- [ ] Competitive advantage
- [ ] Reduces risk/tech debt
- [ ] Enables future work

**Medium Value:**
- [ ] Moderate user impact (1K-10K users)
- [ ] Incremental improvement
- [ ] Nice to have feature
- [ ] Quality of life improvement

**Low Value:**
- [ ] Minimal user impact (<1K users)
- [ ] Cosmetic changes
- [ ] "Would be nice"
- [ ] No clear business case

## Effort Assessment Criteria

**High Effort:**
- [ ] >3 person-months
- [ ] Complex architecture changes
- [ ] Multiple teams involved
- [ ] High technical risk
- [ ] Requires new skills/tools
- [ ] Dependencies on other work

**Medium Effort:**
- [ ] 1-3 person-months
- [ ] Moderate complexity
- [ ] Some technical risk
- [ ] Standard engineering work

**Low Effort:**
- [ ] <1 person-month
- [ ] Straightforward implementation
- [ ] Low technical risk
- [ ] Well-understood problem
- [ ] Can be done independently

## Prioritization Strategy

**Phase 1: Quick Wins (Weeks 1-4)**
- Ship 2-3 quick wins immediately
- Build momentum and credibility
- Show progress quickly

**Phase 2: Big Bets Planning (Weeks 1-2)**
- Break down big bets into phases
- Identify dependencies
- Allocate resources
- Start first phase

**Phase 3: Big Bets Execution (Weeks 3-12)**
- Execute big bets in phases
- Ship incrementally
- Monitor progress closely

**Phase 4: Fill-Ins (Throughout)**
- Do fill-ins during downtime
- Don't let them block quick wins or big bets
- Good for onboarding/learning

## Decision Framework

**For Each Initiative, Ask:**

1. **Value Questions:**
   - How many users benefit?
   - What's the business impact?
   - Does it align with goals?
   - What's the strategic importance?

2. **Effort Questions:**
   - How many person-months?
   - What's the complexity?
   - What are the risks?
   - What dependencies exist?

3. **Timing Questions:**
   - When is value highest?
   - When is effort lowest?
   - What's the opportunity cost?
   - Can we defer?

## Example Matrix Output

**Q1 2025 Roadmap**

**Quick Wins (Ship First):**
1. Add dark mode (High value, Low effort) - 2 weeks
2. Improve error messages (High value, Low effort) - 1 week
3. Add keyboard shortcuts (High value, Low effort) - 1 week

**Big Bets (Plan & Execute):**
1. Redesign core workflow (High value, High effort) - 8 weeks
   - Phase 1: Research & design (2 weeks)
   - Phase 2: Backend changes (3 weeks)
   - Phase 3: Frontend changes (3 weeks)

2. Performance optimization (High value, High effort) - 6 weeks
   - Phase 1: Identify bottlenecks (1 week)
   - Phase 2: Backend optimization (3 weeks)
   - Phase 3: Frontend optimization (2 weeks)

**Fill-Ins (Do When Free):**
1. Improve documentation (Low value, Low effort) - 1 week
2. Add analytics (Low value, Low effort) - 1 week

**Time Sinks (Avoid):**
1. Rewrite entire codebase (Low value, High effort) - Skip
2. Build competitor feature (Low value, High effort) - Skip

## Communication Plan

**To Leadership:**
"We've prioritized initiatives using Value vs. Effort. Quick wins ship first, then we tackle big bets in phases."

**To Team:**
"Here's our roadmap. We're starting with quick wins to build momentum, then focusing on big bets."

**To Stakeholders:**
"High-value initiatives are prioritized. Quick wins deliver value fast, big bets deliver strategic value."

## Review & Iteration

**Weekly Review:**
- Progress on quick wins
- Big bet status
- New initiatives to evaluate

**Monthly Review:**
- Re-evaluate value/effort
- Move initiatives between quadrants if needed
- Adjust roadmap based on learnings`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
  {
    id: 'decision-004',
    title: 'Build vs. Buy Decision Framework',
    description: 'Decide whether to build custom solutions or buy/integrate existing platforms. Calculate TCO and risk.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['build-buy', 'architecture', 'strategy', 'tco', 'vendor-evaluation', 'technical-decision'],
    isPublic: true,
    content: `You are an engineering manager evaluating whether to build a custom solution or buy/integrate an existing platform. Generate a comprehensive build vs. buy analysis:

**Decision Context:**
- Need/Problem: [What problem are you solving?]
- Requirements: [Key requirements]
- Timeline: [When do you need this?]
- Budget: [Available budget]
- Team: [Available engineering resources]

**Generate a build vs. buy analysis:**

## Decision Framework

**Build:** Custom development using internal team
**Buy:** Purchase/license existing platform/service
**Hybrid:** Buy core platform, customize/extend

## Step 1: Requirements Assessment

**Core Requirements:**
- [ ] Must-have feature #1
- [ ] Must-have feature #2
- [ ] Must-have feature #3

**Nice-to-Have Features:**
- [ ] Feature #1
- [ ] Feature #2

**Constraints:**
- [ ] Technical constraints (e.g., must run on-premise)
- [ ] Compliance constraints (e.g., SOC2, HIPAA)
- [ ] Integration constraints (e.g., must work with existing systems)
- [ ] Budget constraints
- [ ] Timeline constraints

**Scale Requirements:**
- Current: [Users, transactions, data volume]
- Future (1 year): [Projected growth]
- Future (3 years): [Long-term projection]

## Step 2: Build Analysis

### Build Pros
✅ **Custom Fit**
- Exactly what you need
- No paying for unused features
- Aligned with your workflow

✅ **Control**
- Full control over roadmap
- No vendor lock-in
- Can optimize for your use case

✅ **Competitive Advantage**
- Unique capabilities
- Differentiates your product
- Intellectual property

✅ **Cost at Scale**
- No per-user licensing fees
- No vendor margin
- Lower long-term cost

### Build Cons
❌ **High Initial Cost**
- Development time (person-months)
- Opportunity cost
- Ongoing maintenance

❌ **Risk**
- Technical risk
- Timeline risk
- Unknown complexity

❌ **Maintenance Burden**
- Ongoing engineering time
- Bug fixes
- Updates and improvements
- Security patches

❌ **Time to Market**
- Slower than buying
- Delay in value delivery

### Build Cost Estimate (3-Year TCO)

**Year 1:**
- Initial development: [X] person-months × [cost/person-month] = $[amount]
- Testing & QA: [X] person-months = $[amount]
- Infrastructure: $[amount]/month × 12 = $[amount]
- **Total Year 1: $[amount]**

**Year 2:**
- Maintenance: [X] person-months/year = $[amount]
- Infrastructure: $[amount]/month × 12 = $[amount]
- Updates/improvements: [X] person-months = $[amount]
- **Total Year 2: $[amount]**

**Year 3:**
- Maintenance: [X] person-months/year = $[amount]
- Infrastructure: $[amount]/month × 12 = $[amount]
- Updates/improvements: [X] person-months = $[amount]
- **Total Year 3: $[amount]**

**3-Year TCO: $[total]**

## Step 3: Buy Analysis

### Buy Pros
✅ **Faster Time to Market**
- Available immediately
- Start using today
- Faster value delivery

✅ **Lower Initial Cost**
- No development cost
- Pay as you go
- Lower upfront investment

✅ **Proven Solution**
- Battle-tested
- Less risk
- Vendor handles maintenance

✅ **Rich Feature Set**
- More features than you'd build
- Regular updates
- Community/ecosystem

### Buy Cons
❌ **Vendor Lock-In**
- Hard to switch later
- Dependent on vendor
- Data portability concerns

❌ **Cost at Scale**
- Per-user licensing
- Usage-based pricing
- Can be expensive at scale

❌ **Less Control**
- Vendor controls roadmap
- May not fit perfectly
- Customization limitations

❌ **Security/Compliance**
- Shared responsibility
- Vendor security incidents
- Compliance challenges

### Buy Cost Estimate (3-Year TCO)

**Year 1:**
- Setup/implementation: [X] person-months = $[amount]
- Licensing: $[amount]/month × 12 = $[amount]
- Integration: [X] person-months = $[amount]
- **Total Year 1: $[amount]**

**Year 2:**
- Licensing: $[amount]/month × 12 = $[amount]
- Maintenance/support: $[amount]/year = $[amount]
- Integration updates: [X] person-months = $[amount]
- **Total Year 2: $[amount]**

**Year 3:**
- Licensing: $[amount]/month × 12 = $[amount]
- Maintenance/support: $[amount]/year = $[amount]
- Integration updates: [X] person-months = $[amount]
- **Total Year 3: $[amount]**

**3-Year TCO: $[total]**

## Step 4: Hybrid Option

**Hybrid Approach:**
- Buy core platform
- Customize for your needs
- Extend with custom features

**When Hybrid Makes Sense:**
- Core platform meets 70-80% of needs
- Customization handles gaps
- Lower cost than full build
- Faster than full build

**Hybrid Cost Estimate:**
- Core platform: [Buy cost]
- Customization: [X] person-months = $[amount]
- **Total: $[amount]**

## Step 5: Risk Assessment

**Build Risks:**
- [ ] Technical risk: [Low/Medium/High] - [Why]
- [ ] Timeline risk: [Low/Medium/High] - [Why]
- [ ] Resource risk: [Low/Medium/High] - [Why]
- [ ] Maintenance risk: [Low/Medium/High] - [Why]

**Buy Risks:**
- [ ] Vendor risk: [Low/Medium/High] - [Why]
- [ ] Lock-in risk: [Low/Medium/High] - [Why]
- [ ] Cost escalation risk: [Low/Medium/High] - [Why]
- [ ] Feature gap risk: [Low/Medium/High] - [Why]

**Mitigation Strategies:**
- [Strategy for each risk]

## Step 6: Decision Matrix

| Criteria | Weight | Build Score | Buy Score | Notes |
|----------|--------|-------------|-----------|-------|
| Cost (3-year TCO) | 20% | [X]/10 | [X]/10 | Build: $[X], Buy: $[Y] |
| Time to Market | 25% | [X]/10 | [X]/10 | Build: [X] months, Buy: [X] weeks |
| Feature Fit | 20% | [X]/10 | [X]/10 | Build: Custom, Buy: [X]% fit |
| Risk | 15% | [X]/10 | [X]/10 | [Assessment] |
| Control | 10% | [X]/10 | [X]/10 | Build: Full, Buy: Limited |
| Maintenance Burden | 10% | [X]/10 | [X]/10 | Build: High, Buy: Low |
| **Weighted Score** | 100% | **[X]/10** | **[X]/10** | **Winner: [Build/Buy/Hybrid]** |

## Recommendation

**Recommendation: [Build / Buy / Hybrid]**

**Rationale:**
- [Key reason #1]
- [Key reason #2]
- [Key reason #3]

**Next Steps:**
1. [Immediate action #1]
2. [Immediate action #2]
3. [Immediate action #3]

**Decision Review Date:** [When to revisit this decision]

## Communication Plan

**To Leadership:**
"We evaluated [solution] using build vs. buy framework. Recommendation: [Build/Buy/Hybrid]. 3-year TCO: $[X] vs $[Y]. Key factors: [reasons]."

**To Team:**
"We're [building/buying] [solution]. Here's why: [rationale]. Timeline: [timeline]. Impact: [how it affects team]."

**To Stakeholders:**
"Decision: [Build/Buy/Hybrid]. Expected value: [benefits]. Timeline: [when available]. Cost: $[amount]."`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
];

