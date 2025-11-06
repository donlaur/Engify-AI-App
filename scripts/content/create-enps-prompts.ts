/**
 * eNPS Improvement Prompts Generator
 * Creates prompts for improving Employee Net Promoter Score
 * Target roles: Engineering Managers, Directors, VPs, Product Managers, Product Directors
 */

import { ObjectId } from 'mongodb';
import { generateUniqueSlug } from '@/lib/utils/slug';

// Simple ID generator
function generateId(prefix: string): string {
  return `${prefix}-${new ObjectId().toString()}`;
}

interface PromptToCreate {
  title: string;
  description: string;
  category: 'management' | 'leadership' | 'culture';
  role: 'engineering-manager' | 'director' | 'vp' | 'product-manager' | 'engineering-director' | 'product-director';
  tags: string[];
  content: string;
}

const ENPS_PROMPTS: PromptToCreate[] = [
  {
    title: 'Analyzing eNPS Results to Identify Action Items',
    description: 'Transform raw eNPS survey data into actionable improvement plans. Identifies patterns, root causes, and priority action items from quantitative scores and qualitative feedback.',
    category: 'management',
    role: 'engineering-manager',
    tags: ['enps', 'employee-engagement', 'survey-analysis', 'action-planning', 'leadership'],
    content: `# Analyzing eNPS Results to Identify Action Items

You are an experienced engineering leader analyzing eNPS (Employee Net Promoter Score) survey results to create actionable improvement plans.

## Context
- **Organization**: [Company/Team Name]
- **Survey Period**: [Date Range]
- **Response Rate**: [X%]
- **Overall eNPS Score**: [Score]
- **Historical Trend**: [Improving/Declining/Stable]

## eNPS Data Analysis

### Quantitative Scores
- **Promoters (9-10)**: [X%] - [Count]
- **Passives (7-8)**: [X%] - [Count]
- **Detractors (0-6)**: [X%] - [Count]
- **eNPS Calculation**: Promoters% - Detractors% = [Score]

### Segment Breakdown (if available)
- By Team: [Team A eNPS, Team B eNPS, etc.]
- By Tenure: [0-6mo, 6mo-2yrs, 2yrs+]
- By Level: [IC, Manager, Director]
- By Location: [Remote, Hybrid, On-site]

## Qualitative Feedback Analysis

### Promoter Themes
[List key themes from Promoters - what's working well]
1. [Theme 1] - [Example quotes]
2. [Theme 2] - [Example quotes]
3. [Theme 3] - [Example quotes]

### Detractor Themes
[List key themes from Detractors - what needs improvement]
1. [Theme 1] - [Example quotes]
2. [Theme 2] - [Example quotes]
3. [Theme 3] - [Example quotes]

## Root Cause Analysis

For each major detractor theme:
1. **What is the pain point?**
   - [Description]
   
2. **Why is this happening?**
   - [Root cause 1]
   - [Root cause 2]
   - [Root cause 3]
   
3. **Who is affected?**
   - [Team/Group]
   - [Impact level: High/Medium/Low]

4. **What would fix this?**
   - [Solution idea 1]
   - [Solution idea 2]
   - [Solution idea 3]

## Action Plan

### High Priority (Quick Wins, High Impact)
1. **[Action Item]**
   - **Owner**: [Who]
   - **Timeline**: [Date]
   - **Success Metric**: [How to measure]
   - **Cost/Effort**: [Low/Medium/High]

2. **[Action Item]**
   - **Owner**: [Who]
   - **Timeline**: [Date]
   - **Success Metric**: [How to measure]
   - **Cost/Effort**: [Low/Medium/High]

### Medium Priority (Strategic Improvements)
1. **[Action Item]**
   - **Owner**: [Who]
   - **Timeline**: [Date]
   - **Success Metric**: [How to measure]
   - **Cost/Effort**: [Low/Medium/High]

### Low Priority (Nice to Have)
1. **[Action Item]**
   - **Owner**: [Who]
   - **Timeline**: [Date]
   - **Success Metric**: [How to measure]

## Communication Plan

### Share Results
- **Who**: [Audience]
- **When**: [Date]
- **Format**: [All-hands, Team meeting, Email, etc.]
- **Key Messages**: [What to emphasize]

### Follow-Up Survey
- **Timeline**: [When to resurvey]
- **Focus Areas**: [What to measure next time]
- **Questions to Add**: [Any new questions based on findings]

## Success Metrics

Track these metrics to measure improvement:
- **eNPS Score**: Target [X] by [Date]
- **Detractor Reduction**: Reduce detractors by [X]%
- **Promoter Increase**: Increase promoters by [X]%
- **Action Item Completion**: [X]% of high-priority items completed

## Notes
- Focus on actionable items, not just observations
- Prioritize items that address root causes
- Balance quick wins with strategic improvements
- Ensure actions are visible to employees
- Follow up regularly on progress`,
  },
  {
    title: 'Creating Effective eNPS Surveys',
    description: 'Design comprehensive eNPS surveys that provide actionable insights. Includes question design, survey timing, anonymity considerations, and response rate optimization.',
    category: 'management',
    role: 'engineering-manager',
    tags: ['enps', 'survey-design', 'employee-feedback', 'data-collection', 'leadership'],
    content: `# Creating Effective eNPS Surveys

You are an experienced HR/People operations leader designing an eNPS survey that will provide actionable insights for improving employee engagement.

## Survey Objectives

### Primary Goals
- [ ] Measure overall employee satisfaction and loyalty
- [ ] Identify specific improvement areas
- [ ] Track progress over time
- [ ] Understand segment differences (teams, roles, tenure)

### Success Criteria
- Response rate > 80%
- Actionable qualitative feedback
- Clear quantitative trends
- Segmented data for targeted improvements

## Survey Structure

### Core eNPS Question
**"On a scale of 0-10, how likely are you to recommend [Company/Team] as a place to work to a friend or colleague?"**

0 = Not at all likely
10 = Extremely likely

### Follow-Up Questions

**For Promoters (9-10):**
- "What three things make [Company/Team] a great place to work?"
- "What would make it even better?"
- "What keeps you engaged and motivated?"

**For Passives (7-8):**
- "What would need to change for you to become a promoter?"
- "What holds you back from recommending [Company/Team]?"
- "What would increase your satisfaction?"

**For Detractors (0-6):**
- "What would need to change for you to recommend [Company/Team]?"
- "What are the biggest barriers to your success?"
- "What support do you need that you're not getting?"

## Additional Question Categories

### Culture & Values
- [ ] Alignment with company values (1-10)
- [ ] Feeling valued and recognized (1-10)
- [ ] Opportunities for growth (1-10)
- [ ] Work-life balance (1-10)

### Management & Leadership
- [ ] Quality of feedback from manager (1-10)
- [ ] Clarity of goals and expectations (1-10)
- [ ] Support from leadership (1-10)
- [ ] Career development support (1-10)

### Work Environment
- [ ] Tools and resources (1-10)
- [ ] Communication and transparency (1-10)
- [ ] Collaboration and teamwork (1-10)
- [ ] Innovation and autonomy (1-10)

### Compensation & Benefits
- [ ] Fair compensation (1-10)
- [ ] Benefits package (1-10)
- [ ] Recognition and rewards (1-10)

## Survey Design Best Practices

### Question Design
- Keep questions simple and clear
- Use consistent scales (stick to 0-10 or 1-10)
- Limit to 10-15 questions max
- Mix quantitative and qualitative
- Avoid leading questions

### Survey Timing
- **Frequency**: Quarterly or semi-annually
- **Timing**: Avoid busy periods (end of quarter, holidays)
- **Duration**: Open for 1-2 weeks
- **Reminders**: Send 2-3 reminders during window

### Anonymity & Privacy
- [ ] Anonymous or confidential?
- [ ] Enable optional identification for follow-up?
- [ ] Guarantee data privacy
- [ ] Explain how results will be used

### Response Rate Optimization
- **Pre-announcement**: Send email 1 week before
- **Clear value proposition**: Explain why it matters
- **Multiple channels**: Email, Slack, internal tools
- **Manager support**: Have managers encourage participation
- **Progress updates**: Show response rate progress
- **Thank you**: Acknowledge participation

## Survey Distribution

### Channels
- [ ] Email survey link
- [ ] Slack announcement
- [ ] Internal tool integration
- [ ] Manager reminders

### Segmentation
- [ ] Survey all employees
- [ ] Include contractors (optional)
- [ ] Segment by department/team
- [ ] Track response rates by segment

## Data Collection & Analysis

### Response Tracking
- Set up dashboard to track:
  - Response rate by team/department
  - Response rate trend over time
  - Completion rate (did they answer all questions?)

### Analysis Plan
- Calculate overall eNPS
- Segment by team, role, tenure
- Identify themes in qualitative feedback
- Compare to previous surveys
- Generate action items

## Communication Plan

### Before Survey
- Announce survey purpose and timing
- Explain how results will be used
- Set expectations for follow-up

### During Survey
- Send reminders
- Share progress updates
- Answer questions

### After Survey
- Share results (within 2 weeks)
- Present action plan
- Follow up on progress

## Example Survey Questions

### Quantitative (1-10 scale)
1. How likely are you to recommend [Company] as a place to work? (0-10)
2. How satisfied are you with your current role? (1-10)
3. How clear are your goals and expectations? (1-10)
4. How supported do you feel in your career growth? (1-10)
5. How effective is communication at [Company]? (1-10)

### Qualitative (Open-ended)
1. What's working well at [Company]?
2. What would make [Company] an even better place to work?
3. What's the biggest barrier to your success?
4. What support do you need that you're not getting?
5. If you could change one thing, what would it be?

## Survey Platform Options

### Recommended Tools
- Culture Amp
- Glint
- 15Five
- SurveyMonkey
- Google Forms
- Custom internal tool

### Key Features Needed
- Anonymous responses
- Segmentation options
- Export capabilities
- Dashboard/visualization
- Response tracking

## Success Metrics

Track these to measure survey effectiveness:
- **Response Rate**: Target >80%
- **Completion Rate**: Target >95%
- **Action Item Completion**: [X]% of action items completed
- **eNPS Improvement**: Target [X] point increase
- **Follow-up Survey Participation**: Target >75% of previous participants`,
  },
  {
    title: 'Building Engineering Culture That Drives eNPS',
    description: 'Create and maintain an engineering culture that increases employee satisfaction, engagement, and advocacy. Focuses on technical excellence, growth opportunities, and team autonomy.',
    category: 'culture',
    role: 'engineering-director',
    tags: ['enps', 'engineering-culture', 'team-health', 'retention', 'leadership', 'culture'],
    content: `# Building Engineering Culture That Drives eNPS

You are an Engineering Director or VP of Engineering tasked with building a culture that drives high eNPS scores through technical excellence, growth opportunities, and team autonomy.

## Current State Assessment

### Culture Strengths
[List what's working well]
1. [Strength 1]
2. [Strength 2]
3. [Strength 3]

### Culture Gaps
[List areas needing improvement]
1. [Gap 1]
2. [Gap 2]
3. [Gap 3]

### eNPS Context
- **Current eNPS**: [Score]
- **Key Detractor Themes**: [What's driving low scores]
- **Key Promoter Themes**: [What's driving high scores]

## Core Culture Pillars

### 1. Technical Excellence
**What it means:**
- High code quality standards
- Thoughtful architecture decisions
- Continuous learning and improvement
- Technical debt management

**How to build it:**
- [ ] Establish clear code review standards
- [ ] Invest in technical training and conferences
- [ ] Create architecture review processes
- [ ] Balance shipping with quality
- [ ] Celebrate technical achievements

**Metrics:**
- Code review quality scores
- Technical debt tracking
- Architecture decision documentation
- Learning & development participation

### 2. Growth & Development
**What it means:**
- Clear career paths
- Continuous learning opportunities
- Mentorship and coaching
- Internal mobility

**How to build it:**
- [ ] Define clear career ladders (IC and Manager tracks)
- [ ] Create mentorship programs
- [ ] Provide learning budgets
- [ ] Enable internal transfers
- [ ] Regular career conversations

**Metrics:**
- Promotion rates
- Internal mobility rates
- Learning participation
- Career development plan completion

### 3. Autonomy & Ownership
**What it means:**
- Teams own their domains
- Engineers influence technical decisions
- Minimal micromanagement
- Trust-based culture

**How to build it:**
- [ ] Give teams clear ownership boundaries
- [ ] Involve engineers in architecture decisions
- [ ] Limit approvals and bureaucracy
- [ ] Trust teams to make good decisions
- [ ] Learn from mistakes, don't punish

**Metrics:**
- Decision velocity
- Team autonomy scores
- Employee satisfaction with autonomy
- Micromanagement complaints

### 4. Psychological Safety
**What it means:**
- Safe to ask questions
- Safe to fail and learn
- Open feedback culture
- Inclusive environment

**How to build it:**
- [ ] Model vulnerability as a leader
- [ ] Celebrate learning from failures
- [ ] Create safe feedback channels
- [ ] Address exclusionary behavior quickly
- [ ] Regular psychological safety check-ins

**Metrics:**
- Psychological safety survey scores
- Blame culture incidents
- Feedback frequency
- Inclusion metrics

### 5. Work-Life Balance
**What it means:**
- Sustainable pace
- Respect for boundaries
- Flexible work arrangements
- Mental health support

**How to build it:**
- [ ] Set clear expectations about hours
- [ ] Discourage after-hours work
- [ ] Support flexible schedules
- [ ] Provide mental health resources
- [ ] Lead by example (take time off)

**Metrics:**
- Average hours worked
- Burnout survey scores
- Time off utilization
- After-hours communication frequency

## Culture-Building Action Plan

### Quick Wins (30-60 days)
1. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Success Metric**: [How to measure]
   - **Impact**: [Expected eNPS impact]

2. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Success Metric**: [How to measure]

### Strategic Initiatives (90-180 days)
1. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Success Metric**: [How to measure]
   - **Resource Needs**: [Budget, people, etc.]

2. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Success Metric**: [How to measure]

## Communication Strategy

### Culture Messages
- **Vision**: [What culture we're building]
- **Values**: [Core values we live by]
- **Behaviors**: [How we demonstrate values]

### Communication Channels
- [ ] Team meetings
- [ ] All-hands presentations
- [ ] Engineering blog posts
- [ ] Slack announcements
- [ ] 1-on-1 conversations

### Storytelling
- [ ] Share examples of culture in action
- [ ] Celebrate people living the values
- [ ] Highlight improvements over time

## Measurement & Iteration

### Culture Metrics
- **eNPS Score**: Target [X] by [Date]
- **Culture Survey**: Quarterly assessment
- **Retention Rate**: Target [X]%
- **Promoter Themes**: [What drives promoters]

### Regular Review
- **Frequency**: Quarterly culture review
- **Format**: Team discussion + survey
- **Actions**: Update action plan based on findings

## Engineering-Specific Culture Elements

### Developer Experience (DX)
- [ ] Improve tooling and automation
- [ ] Reduce friction in development
- [ ] Fast feedback loops (CI/CD)
- [ ] Good documentation

### Technical Practices
- [ ] Code review culture
- [ ] Testing standards
- [ ] Architecture patterns
- [ ] Knowledge sharing

### Team Structure
- [ ] Clear team boundaries
- [ ] Balanced team sizes
- [ ] Cross-team collaboration
- [ ] Minimal context switching

## Success Criteria

A strong engineering culture should show:
- **High eNPS**: Score >50
- **Low Turnover**: <10% annual turnover
- **High Engagement**: >80% favorable on engagement surveys
- **Growth**: People are growing in their careers
- **Innovation**: Teams are shipping impactful work

## Notes
- Culture takes time to build - be patient
- Lead by example - actions speak louder than words
- Continuously measure and iterate
- Involve the team in building culture
- Celebrate wins along the way`,
  },
  {
    title: 'Creating Clear Career Ladders That Increase Retention',
    description: 'Design transparent career progression frameworks for IC and Manager tracks that help engineers understand growth opportunities and reduce turnover.',
    category: 'management',
    role: 'engineering-director',
    tags: ['enps', 'career-development', 'retention', 'career-ladders', 'leadership', 'people-management'],
    content: `# Creating Clear Career Ladders That Increase Retention

You are an Engineering Director or VP creating a career ladder framework that drives high eNPS by giving engineers clear growth paths and reducing turnover.

## Current State

### Existing Career Framework
- [ ] Do we have a career ladder? (Yes/No/Partial)
- [ ] Is it documented? (Yes/No)
- [ ] Is it transparent? (Yes/No)
- [ ] How is it used? (Promotions, Reviews, Hiring)

### Pain Points
[List common issues]
1. [Issue 1] - e.g., "Engineers don't know how to get promoted"
2. [Issue 2] - e.g., "Unclear expectations between levels"
3. [Issue 3] - e.g., "High turnover due to lack of growth"

### Retention Context
- **Current Turnover Rate**: [X]%
- **Average Tenure**: [X] years/months
- **Promotion Rate**: [X]% per year
- **Top Turnover Reasons**: [From exit interviews]

## Career Ladder Design Principles

### 1. Transparency
- Publicly available documentation
- Clear expectations at each level
- Understandable progression criteria
- Regular updates and communication

### 2. Fairness
- Objective, measurable criteria
- Consistent application across teams
- No favoritism
- Clear appeals process

### 3. Flexibility
- Multiple paths (IC vs Manager)
- Individual contributor growth
- Technical specialization tracks
- Lateral moves encouraged

### 4. Growth-Oriented
- Focus on capability, not just output
- Continuous development
- Learning opportunities
- Stretch assignments

## Career Ladder Structure

### IC Track (Individual Contributor)

#### L1: Junior Engineer
**Expectations:**
- [ ] Learns from senior engineers
- [ ] Completes well-defined tasks
- [ ] Follows coding standards
- [ ] Asks questions proactively

**Key Behaviors:**
- [ ] Receptive to feedback
- [ ] Self-directed learning
- [ ] Basic technical skills
- [ ] Good communication

**Promotion Criteria:**
- [ ] Can work independently on standard tasks
- [ ] Demonstrates growth in technical skills
- [ ] Consistently delivers quality work
- [ ] [Other criteria]

#### L2: Mid-Level Engineer
**Expectations:**
- [ ] Works independently on complex tasks
- [ ] Contributes to technical decisions
- [ ] Mentors junior engineers
- [ ] Improves team processes

**Key Behaviors:**
- [ ] Takes ownership of features
- [ ] Proactive problem-solving
- [ ] Collaborative with team
- [ ] Technical depth in one area

**Promotion Criteria:**
- [ ] Can lead small features end-to-end
- [ ] Mentors junior engineers effectively
- [ ] Contributes to architecture decisions
- [ ] [Other criteria]

#### L3: Senior Engineer
**Expectations:**
- [ ] Leads technical initiatives
- [ ] Designs scalable systems
- [ ] Mentors multiple engineers
- [ ] Influences team direction

**Key Behaviors:**
- [ ] Strong technical leadership
- [ ] Cross-functional collaboration
- [ ] Long-term thinking
- [ ] Raises team's technical bar

**Promotion Criteria:**
- [ ] Consistently delivers high-impact work
- [ ] Strong technical judgment
- [ ] Effective mentorship
- [ ] [Other criteria]

#### L4: Staff Engineer
**Expectations:**
- [ ] Drives technical strategy
- [ ] Works across multiple teams
- [ ] Influences organization-wide initiatives
- [ ] Mentors across teams

**Key Behaviors:**
- [ ] Systems thinking
- [ ] Strategic technical vision
- [ ] Strong influence skills
- [ ] Technical expertise recognized widely

**Promotion Criteria:**
- [ ] Leads organization-wide initiatives
- [ ] Strong technical impact across teams
- [ ] Recognized technical leader
- [ ] [Other criteria]

#### L5: Principal Engineer
**Expectations:**
- [ ] Sets technical direction for organization
- [ ] Drives major technical decisions
- [ ] Mentors senior engineers
- [ ] Represents company externally

**Key Behaviors:**
- [ ] Visionary technical leadership
- [ ] Industry recognition
- [ ] Thought leadership
- [ ] Strategic impact

### Manager Track

#### M1: Engineering Manager
**Expectations:**
- [ ] Manages 3-8 engineers
- [ ] People management and development
- [ ] Technical oversight
- [ ] Team process improvement

**Key Behaviors:**
- [ ] Effective 1-on-1s
- [ ] Career development support
- [ ] Technical judgment
- [ ] Team building

**Promotion Criteria:**
- [ ] Strong team performance
- [ ] Effective people management
- [ ] Team retention and growth
- [ ] [Other criteria]

#### M2: Senior Engineering Manager
**Expectations:**
- [ ] Manages multiple teams
- [ ] Cross-team coordination
- [ ] Strategic planning
- [ ] Developing other managers

**Key Behaviors:**
- [ ] Multi-team leadership
- [ ] Strategic thinking
- [ ] Manager development
- [ ] Organizational impact

#### M3: Director of Engineering
**Expectations:**
- [ ] Manages organization of teams
- [ ] Sets technical strategy
- [ ] Builds scalable organizations
- [ ] Executive communication

**Key Behaviors:**
- [ ] Organizational leadership
- [ ] Strategic vision
- [ ] People development at scale
- [ ] Business alignment

## Career Ladder Implementation

### Documentation
- [ ] Create public career ladder document
- [ ] Define expectations for each level
- [ ] Include examples and behaviors
- [ ] Make it searchable and accessible

### Communication
- [ ] Announce career ladder launch
- [ ] Train managers on usage
- [ ] Share in onboarding
- [ ] Regular refreshers

### Integration
- [ ] Link to performance reviews
- [ ] Use in promotion processes
- [ ] Incorporate into hiring
- [ ] Guide career conversations

## Supporting Initiatives

### Career Development
- [ ] Career development plans
- [ ] Regular career conversations
- [ ] Growth opportunities
- [ ] Stretch assignments

### Mentorship
- [ ] Mentorship programs
- [ ] Cross-team mentoring
- [ ] Manager mentorship
- [ ] External mentors

### Learning & Development
- [ ] Learning budgets
- [ ] Conference attendance
- [ ] Internal training
- [ ] Technical talks

### Internal Mobility
- [ ] Transfer processes
- [ ] Internal job postings
- [ ] Cross-functional opportunities
- [ ] Rotation programs

## Measurement & Success

### Metrics
- **Retention Rate**: Target [X]%
- **Promotion Rate**: Target [X]% per year
- **Time to Promotion**: Average [X] months
- **Career Ladder Clarity**: Survey score >4/5

### Regular Review
- **Frequency**: Annual review of ladder
- **Updates**: Based on feedback and market
- **Communication**: Share changes transparently

## Success Criteria

A successful career ladder should result in:
- **Higher Retention**: Lower turnover rates
- **Clearer Growth Paths**: Engineers understand how to advance
- **Fair Promotions**: Consistent, objective promotion process
- **Higher eNPS**: Engineers see growth opportunities
- **Better Hiring**: Clear level expectations help hiring

## Notes
- Start simple, iterate based on feedback
- Involve the team in creating the ladder
- Keep it practical, not theoretical
- Update regularly based on market and company needs
- Make it accessible and easy to understand`,
  },
  {
    title: 'Improving Developer Experience (DX) to Boost eNPS',
    description: 'Identify and fix developer experience pain points that negatively impact engineer satisfaction and eNPS. Focuses on tooling, processes, and workflow improvements.',
    category: 'culture',
    role: 'engineering-director',
    tags: ['enps', 'developer-experience', 'dx', 'tooling', 'process-improvement', 'engineering-culture'],
    content: `# Improving Developer Experience (DX) to Boost eNPS

You are an Engineering Director or VP improving developer experience to increase engineer satisfaction and eNPS scores.

## Current State Assessment

### Developer Experience Survey
- **When**: [Date]
- **Response Rate**: [X]%
- **Overall DX Score**: [X]/10
- **Key Pain Points**: [List top 3-5]

### Common Pain Points
[List pain points from surveys, interviews, observation]
1. [Pain Point 1] - e.g., "Slow CI/CD pipelines"
2. [Pain Point 2] - e.g., "Complex local setup"
3. [Pain Point 3] - e.g., "Poor documentation"
4. [Pain Point 4] - e.g., "Too many tools"
5. [Pain Point 5] - e.g., "Unclear processes"

### Impact on eNPS
- **How DX affects satisfaction**: [Description]
- **Turnover correlation**: [Any data]
- **Productivity impact**: [Any metrics]

## DX Improvement Framework

### 1. Development Environment

#### Local Setup
**Current State:**
- [ ] Setup time: [X] hours/days
- [ ] Prerequisites: [List]
- [ ] Documentation: [Quality rating]
- [ ] Common issues: [List]

**Improvements:**
- [ ] Reduce setup time to <1 hour
- [ ] Create one-command setup script
- [ ] Improve setup documentation
- [ ] Add troubleshooting guides
- [ ] Containerize development environment

**Metrics:**
- Setup time reduction
- First PR time
- Setup success rate

#### Development Tools
**Current State:**
- [ ] IDE/Editor: [What's used]
- [ ] Debugging tools: [What's available]
- [ ] Testing tools: [What's available]
- [ ] Code quality tools: [What's available]

**Improvements:**
- [ ] Standardize on recommended tools
- [ ] Provide tooling support
- [ ] Create tooling guides
- [ ] Improve IDE integrations
- [ ] Better debugging experience

### 2. CI/CD Pipeline

#### Current State
- **Build Time**: [X] minutes
- **Test Time**: [X] minutes
- **Deploy Time**: [X] minutes
- **Success Rate**: [X]%
- **Feedback Time**: [X] minutes

#### Improvements
- [ ] Optimize build times (target <10 min)
- [ ] Parallelize test execution
- [ ] Improve test reliability
- [ ] Faster feedback loops
- [ ] Better error messages
- [ ] Visual CI/CD dashboards

#### Metrics
- Build time reduction
- Test flakiness rate
- CI/CD satisfaction score

### 3. Documentation

#### Current State
- **Documentation Quality**: [Rating]
- **Coverage**: [X]% of systems documented
- **Up-to-date**: [X]% current
- **Findability**: [Rating]

#### Improvements
- [ ] Improve architecture documentation
- [ ] Better API documentation
- [ ] Onboarding guides
- [ ] Runbook documentation
- [ ] Document tribal knowledge
- [ ] Make docs searchable

#### Metrics
- Documentation coverage
- Documentation freshness
- Developer satisfaction with docs

### 4. Code Review Process

#### Current State
- **Review Time**: Average [X] hours/days
- **Review Quality**: [Rating]
- **Reviewer Availability**: [Rating]
- **Review Process**: [Description]

#### Improvements
- [ ] Reduce review time (target <24h)
- [ ] Improve review guidelines
- [ ] Automate code quality checks
- [ ] Better review tooling
- [ ] Review quality metrics

#### Metrics
- Review time
- Review quality scores
- Reviewer satisfaction

### 5. Testing & Quality

#### Current State
- **Test Coverage**: [X]%
- **Test Reliability**: [X]% pass rate
- **Test Speed**: [X] minutes
- **Testing Tools**: [List]

#### Improvements
- [ ] Improve test reliability
- [ ] Faster test execution
- [ ] Better test frameworks
- [ ] Test coverage goals
- [ ] Testing best practices

#### Metrics
- Test reliability
- Test execution time
- Test coverage

### 6. Deployment & Operations

#### Current State
- **Deploy Frequency**: [X] times per week
- **Deploy Time**: [X] minutes
- **Rollback Time**: [X] minutes
- **Deploy Confidence**: [Rating]

#### Improvements
- [ ] Faster deployments
- [ ] Easier rollbacks
- [ ] Better observability
- [ ] Pre-deployment checks
- [ ] Deployment dashboards

#### Metrics
- Deployment time
- Deployment success rate
- Rollback frequency

## DX Improvement Action Plan

### Quick Wins (30 days)
1. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Impact**: [Expected improvement]
   - **Cost**: [Effort/resources]

2. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Impact**: [Expected improvement]

### Medium-Term (90 days)
1. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Impact**: [Expected improvement]
   - **Resource Needs**: [Budget, people]

### Long-Term (180+ days)
1. **[Action Item]**
   - **Description**: [What to do]
   - **Owner**: [Who]
   - **Impact**: [Expected improvement]

## Measurement & Success

### DX Metrics
- **Developer Satisfaction**: Target >4/5
- **Setup Time**: Target <1 hour
- **CI/CD Time**: Target <15 min
- **Review Time**: Target <24 hours
- **Documentation Quality**: Target >4/5

### Regular Assessment
- **Frequency**: Quarterly DX survey
- **Format**: Survey + interviews
- **Actions**: Update action plan based on findings

## Success Criteria

Improved DX should result in:
- **Higher eNPS**: Engineers happier with tooling
- **Higher Productivity**: Less time on friction
- **Lower Turnover**: Better work experience
- **Faster Onboarding**: New engineers productive faster
- **Better Code Quality**: Easier to maintain quality

## Notes
- Involve engineers in identifying pain points
- Prioritize high-impact, low-effort improvements
- Measure before and after
- Communicate improvements
- Continuously iterate`,
  },
];

async function main() {
  const { getMongoDb } = await import('@/lib/db/mongodb');
  const db = await getMongoDb();
  
  console.log('✅ Connected to MongoDB');

  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;

  for (const promptData of ENPS_PROMPTS) {
    // Check if prompt already exists
    const existing = await promptsCollection.findOne({
      title: promptData.title,
    });

    if (existing) {
      console.log(`⏭️  Skipping: ${promptData.title} (already exists)`);
      skipped++;
      continue;
    }

    // Generate slug
    const allPrompts = await promptsCollection.find({}).toArray();
    const allSlugs = new Set(allPrompts.map((p: any) => p.slug).filter(Boolean));
    const slug = generateUniqueSlug(promptData.title, allSlugs);

    const prompt = {
      id: generateId('enps'),
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
      currentRevision: 1,
      source: 'seed',
      active: true,
    };

    await promptsCollection.insertOne(prompt);
    console.log(`✅ Created: ${promptData.title}`);
    created++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${ENPS_PROMPTS.length}`);
}

main();

