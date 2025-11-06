/**
 * Leadership Role Prompts Generator
 * Creates prompts for Engineering Directors, Product Directors, VPs, and CTOs
 * Focuses on job duties: skip-level 1:1s, people management, eNPS improvement,
 * career ladders, OKRs/SMART goals, professional development plans
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
  role: 'engineering-director' | 'product-director' | 'vp-engineering' | 'vp-product' | 'cto' | 'engineer' | 'engineering-manager' | 'product-manager';
  tags: string[];
  content: string;
}

const LEADERSHIP_PROMPTS: PromptToCreate[] = [
  {
    title: 'Conducting Effective Skip-Level 1-on-1s as a Director or VP',
    description: 'Guide for Directors and VPs conducting skip-level 1-on-1s with individual contributors. Focuses on building trust, gathering feedback, identifying issues early, and developing future leaders.',
    category: 'leadership',
    role: 'engineering-director',
    tags: ['skip-level-1-on-1s', 'leadership', '1-on-1s', 'people-management', 'feedback', 'director', 'vp'],
    content: `# Conducting Effective Skip-Level 1-on-1s as a Director or VP

You are an Engineering Director or VP conducting skip-level 1-on-1s with individual contributors who report to your managers. Your goal is to build trust, gather honest feedback, identify issues early, and develop future leaders.

## Context
- **Your Role**: [Engineering Director / VP of Engineering / Product Director / VP of Product]
- **IC Name**: [Name]
- **IC Level**: [Junior / Mid / Senior / Staff / Principal]
- **Their Manager**: [Manager Name]
- **Their Team**: [Team Name]
- **Tenure**: [Time at company]
- **Frequency**: [Monthly / Quarterly / As needed]

## Pre-Meeting Preparation

### Review Context
- [ ] Read their last performance review
- [ ] Check their recent work (PRs, projects, contributions)
- [ ] Review notes from their manager's 1-on-1s (if shared)
- [ ] Note any concerning signals (missed deadlines, quiet in meetings, etc.)
- [ ] Check their career goals and development progress

### Set Objectives
- [ ] Build trust and connection
- [ ] Understand their experience working here
- [ ] Gather feedback on manager, team, organization
- [ ] Identify blockers or concerns
- [ ] Assess their growth and career trajectory
- [ ] Share organizational context

## Meeting Structure (30-45 mins)

### Opening (3-5 mins)

**Set the Tone:**
- "Thanks for taking time to meet with me. I value these conversations with people in the organization."
- "This is a safe space. I want honest feedback, and I'll keep confidentiality unless we agree otherwise."
- "My goal is to understand your experience and help you succeed here."

**Clarify Purpose:**
- "These skip-levels help me stay connected to what's happening on the ground"
- "I'm also here to support your growth and career development"
- "Feel free to bring up anything - work, career, team, or concerns"

### Their Topics (20-25 mins)

**1. How Are You Doing?**
- "How are things going overall?"
- "What's energizing you about your work?"
- "What's frustrating or challenging?"
- [Really listen - pause and let them answer fully]

**2. Work & Projects**
- "What are you working on that you're excited about?"
- "What's blocking you or slowing you down?"
- "Do you have the resources and support you need?"
- "Are your priorities clear?"

**3. Team & Collaboration**
- "How's the team dynamic?"
- "Are you getting the collaboration you need?"
- "Who do you enjoy working with?"
- "Any friction or concerns?"

**4. Manager Feedback**
- "How's [Manager Name] doing as your manager?"
- "What do they do well?"
- "What would make your relationship even better?"
- "Are you getting the feedback and support you need?"
- "Do you feel comfortable bringing concerns to them?"

**5. Growth & Career**
- "How are you growing in your role?"
- "What skills do you want to develop?"
- "What's your career trajectory looking like?"
- "What opportunities interest you?"
- "Are you getting stretch assignments?"

**6. Organization & Culture**
- "How's the engineering culture?"
- "What's working well?"
- "What would you change if you could?"
- "Do you feel heard and valued?"

**7. Concerns & Issues**
- "Any concerns you want to share?"
- "Anything keeping you up at night?"
- "Is there anything I should know about?"
- "Any suggestions for improvement?"

### Your Topics (10-15 mins)

**1. Context Sharing**
- Organizational updates that affect them
- Strategic direction and priorities
- Team changes or initiatives
- Recognition from leadership

**2. Feedback (If Appropriate)**
- Positive feedback: "I wanted to recognize [specific contribution]"
- Growth feedback: "I've noticed [strength/opportunity]"
- Career guidance: "Have you considered [opportunity]?"

**3. Career Development**
- "What's your ideal next role?"
- "What would help you get there?"
- "How can I support your growth?"
- "Let's create a development plan"

### Closing (3-5 mins)

**Summary:**
- "Let me recap what I heard..."
- "Action items: [list them]"
- "Anything else before we wrap?"

**Follow-Up:**
- "I'll follow up on [specific item]"
- "Let's schedule another conversation in [timeframe]"
- "Feel free to reach out anytime"

**End on Positive Note:**
- "Thanks for your honesty and openness"
- "I appreciate your contributions to [specific thing]"
- "I'm here to support you"

## Post-Meeting Actions

### Document Notes
- [ ] Key discussion topics
- [ ] Feedback about manager, team, culture
- [ ] Action items (yours and theirs)
- [ ] Concerns or issues to address
- [ ] Career development notes
- [ ] Positive feedback to share with manager

### Follow-Through
- [ ] Complete your action items promptly
- [ ] Share relevant feedback with their manager (respecting confidentiality)
- [ ] Address concerns or issues raised
- [ ] Support their career development
- [ ] Schedule follow-up if needed

### Manager Feedback Loop

**What to Share:**
- High-level themes (not specifics)
- Career development opportunities
- Positive feedback
- Organizational context

**What NOT to Share:**
- Direct criticism of manager
- Confidential concerns
- Personal issues
- Anything they asked to keep private

**Example:**
"I had a good skip-level with [Name]. They're doing great work on [project]. They're interested in [career area] - you might want to give them opportunities in that space. Overall they're happy and growing well."

## Skip-Level Best Practices

### Build Trust
- Be consistent (don't cancel frequently)
- Respect confidentiality
- Follow through on commitments
- Be authentic and human

### Listen More Than Talk
- Aim for 80% listening, 20% talking
- Ask open-ended questions
- Avoid interrupting
- Show you're paying attention

### Stay Neutral
- Don't triangulate (don't be messenger between IC and manager)
- Don't undermine manager's authority
- Support manager while hearing concerns
- Focus on solutions, not blame

### Be Action-Oriented
- Don't just listen - take action
- Address concerns promptly
- Follow up on commitments
- Show you value their feedback

### Respect Boundaries
- Don't micromanage through skip-levels
- Don't bypass manager except when necessary
- Support manager's decisions
- Escalate appropriately

## Common Scenarios

### Scenario: IC Complains About Manager
**Don't:**
- Take sides immediately
- Undermine manager
- Become messenger

**Do:**
- Listen fully
- Understand the issue
- Ask: "Have you talked to them directly?"
- Assess if it's a manager development issue
- Coach manager if needed
- Consider moving IC if relationship is irreparable

### Scenario: IC Shares Organizational Concern
**Do:**
- Acknowledge their concern
- Investigate if it's a real issue
- Share context if helpful
- Take action if needed
- Follow up on what you did

### Scenario: IC Wants Career Growth
**Do:**
- Understand their goals
- Assess readiness
- Create development plan
- Provide opportunities
- Support their growth
- Communicate with manager

### Scenario: IC Provides Valuable Feedback
**Do:**
- Thank them for feedback
- Share anonymized feedback with leadership
- Implement changes when appropriate
- Follow up to show impact
- Recognize their contribution

## Red Flags to Watch For

### Manager Issues
- Multiple ICs complaining about same manager
- Patterns of micromanagement
- Lack of feedback or development
- Trust issues

**Action**: Assess manager's capabilities, provide coaching, consider manager change

### Organizational Issues
- Common themes across skip-levels
- Culture problems
- Process friction
- Resource constraints

**Action**: Address systemic issues, share with leadership, create action plan

### Retention Risks
- IC mentioning other opportunities
- Low engagement
- Burnout signals
- Growth frustration

**Action**: Discuss concerns, create retention plan, address root causes

## Frequency Recommendations

### Monthly Skip-Levels
**For:**
- High-potential ICs
- New hires (first 6 months)
- ICs in critical roles
- ICs showing concerning signals

### Quarterly Skip-Levels
**For:**
- Stable high performers
- ICs in roles >6 months
- Standard check-ins

### As-Needed Skip-Levels
**For:**
- Specific concerns raised
- Before major decisions (promotions, moves)
- Manager changes
- Organizational changes

## Success Metrics

Track:
- Frequency of skip-levels conducted
- Themes identified across skip-levels
- Action items completed
- Retention rate of skip-level participants
- Manager feedback on skip-level value

## Notes
- Skip-levels are not a replacement for good manager-IC relationships
- They're a complement to catch issues early and build organizational trust
- Use them to develop future leaders and understand ground truth
- Always respect confidentiality and manager relationships`,
  },
  {
    title: 'How to Have a Skip-Level 1-on-1 with a Director or VP (For ICs)',
    description: 'Guide for individual contributors on how to prepare for and make the most of skip-level 1-on-1s with Directors or VPs. Helps ICs advocate for themselves and share feedback effectively.',
    category: 'leadership',
    role: 'engineer',
    tags: ['skip-level-1-on-1s', 'career-development', 'leadership', 'feedback', '1-on-1s', 'ic-guide'],
    content: `# How to Have a Skip-Level 1-on-1 with a Director or VP (For ICs)

You are an individual contributor preparing for a skip-level 1-on-1 with your Director or VP (your manager's manager). This is your opportunity to share feedback, discuss career growth, and build relationship with senior leadership.

## Context
- **Your Role**: [Engineer / Product Manager / Designer / etc.]
- **Your Level**: [Junior / Mid / Senior / Staff / Principal]
- **Director/VP**: [Name, Title]
- **Your Manager**: [Manager Name]
- **How You Got This Meeting**: [They scheduled it / You requested it / Regular cadence]
- **Purpose**: [Career discussion / Feedback session / Regular check-in / Specific concern]

## Pre-Meeting Preparation

### Understand Why Skip-Levels Exist
- Directors/VPs want to stay connected to the organization
- They want honest feedback about what's working and what's not
- They want to identify and develop future leaders
- They want to catch issues early before they become problems

### Know What's Appropriate
**Good Topics:**
- Career development and growth
- Feedback about organization, culture, processes
- Ideas for improvement
- Your experience working here
- Concerns about team or organization (not personal drama)
- Questions about strategy or direction

**Not Appropriate:**
- Complaining solely about your manager (unless serious issue)
- Personal disputes with colleagues
- Gossip or rumors
- Criticizing individuals unfairly
- Asking for raises or promotions directly

### Prepare Your Talking Points

**1. Career Development**
- [ ] What skills do you want to develop?
- [ ] What roles or opportunities interest you?
- [ ] What would help you grow?
- [ ] What's your career trajectory?

**2. Feedback About Organization**
- [ ] What's working well?
- [ ] What would you change?
- [ ] Process improvements?
- [ ] Culture observations?

**3. Your Experience**
- [ ] What's energizing you?
- [ ] What's challenging?
- [ ] What support do you need?
- [ ] Are you getting what you need?

**4. Ideas & Suggestions**
- [ ] Process improvements
- [ ] Tool or workflow ideas
- [ ] Team structure suggestions
- [ ] Strategic ideas

**5. Questions**
- [ ] Questions about strategy
- [ ] Questions about organization
- [ ] Questions about career paths
- [ ] Questions about growth opportunities

## During the Meeting

### Opening (Let Them Lead)

**They'll Usually:**
- Thank you for meeting
- Set tone (safe space, honest feedback)
- Ask how you're doing

**Your Response:**
- Be authentic and honest
- Thank them for the opportunity
- Share how you're doing overall

### Share Your Topics

**Be Specific:**
- Use concrete examples
- Avoid vague complaints
- Focus on solutions, not just problems
- Be constructive, not just critical

**Example - Good:**
"I've noticed our code review process is slow. When we have 5+ reviewers on every PR, it takes 3-4 days to merge. I think we could streamline by having primary reviewers and optional reviewers. This would help us ship faster."

**Example - Not Good:**
"Our code review process sucks. It's too slow and I hate it."

### Career Discussion

**If They Ask About Career:**
- Share your goals authentically
- Be specific about what you want
- Ask for their advice
- Express interest in opportunities

**Example:**
"I'm interested in moving toward a Staff Engineer role. I've been working on [specific skills], and I'd love to get more opportunities to [lead initiatives / mentor others / architectural work]. What advice do you have for getting there?"

### Feedback About Manager

**Be Constructive:**
- Focus on behaviors, not personality
- Share what would help you
- Be fair and balanced
- Don't just complain

**If Manager is Great:**
- Share positive feedback
- "I really appreciate [specific thing]"
- "They've helped me grow by [example]"

**If Manager Has Issues:**
- Be specific and constructive
- "I'd love more feedback on [specific area]"
- "It would help if [specific behavior change]"
- Avoid personal attacks

**If You Have Serious Concerns:**
- Share factual concerns
- Focus on impact
- Express what you need
- Be open to solutions

### Organizational Feedback

**Share Observations:**
- What's working well (celebrate wins)
- What could be improved (constructive suggestions)
- Process friction you're experiencing
- Culture observations

**Be Balanced:**
- Don't just complain
- Share positive feedback too
- Offer solutions when possible
- Focus on improvement

### Ask Questions

**Strategic Questions:**
- "What's the strategy for [area]?"
- "How do you see [initiative] evolving?"
- "What are the biggest challenges facing [organization]?"

**Career Questions:**
- "What does success look like at [next level]?"
- "What opportunities are coming up?"
- "How do you see [career path]?"

**Growth Questions:**
- "What should I focus on to grow?"
- "Who should I learn from?"
- "What experiences would help me develop?"

### Closing

**If They Ask "Anything Else?":**
- Share anything important you haven't mentioned
- Ask for follow-up if needed
- Express appreciation

**End Professionally:**
- "Thanks for your time and insights"
- "I appreciate the opportunity to share feedback"
- "I'm excited about [something discussed]"

## Post-Meeting

### Follow-Up Actions
- [ ] Complete any action items you committed to
- [ ] Send thank you email (brief)
- [ ] Share relevant updates with your manager (don't triangulate)
- [ ] Follow up on opportunities discussed

### Thank You Email Template

**Subject**: Thank you - Skip-Level 1-on-1

Hi [Director/VP Name],

Thanks for taking time to meet with me today. I really appreciated:

- [Specific thing they shared]
- [Specific insight or feedback]
- [Specific opportunity discussed]

I'm excited about [something discussed] and will follow up on [action item].

Thanks again,
[Your Name]

### Maintain Relationship
- Don't just disappear after the meeting
- Follow up periodically if appropriate
- Share updates on discussed topics
- Don't over-communicate (respect their time)

## Common Mistakes to Avoid

### ❌ Don't:
- **Complain about your manager unfairly** - Be constructive
- **Gossip or share rumors** - Stay factual
- **Ask for raise/promotion directly** - Focus on growth first
- **Be overly negative** - Balance feedback with positives
- **Overstay your welcome** - Respect time limits
- **Ignore your manager** - Keep them in the loop appropriately

### ✅ Do:
- **Be honest and authentic** - Share real feedback
- **Be constructive** - Offer solutions, not just problems
- **Focus on growth** - Show you're invested in your development
- **Be prepared** - Come with specific topics and questions
- **Follow through** - Complete action items
- **Respect boundaries** - Understand their role and time

## When to Request a Skip-Level

**Request One If:**
- You have organizational feedback to share
- You want career guidance
- You've tried resolving issues with manager
- You have strategic questions
- You want to build relationship with leadership

**Don't Request Just To:**
- Bypass your manager unnecessarily
- Complain about minor issues
- Show off or network excessively
- Avoid conflict with manager

## Sample Closing Statement

"I'm really grateful for this opportunity. I value the direct connection with leadership and I'm excited about [your growth / the organization's direction / discussed opportunities]. I'll follow up on [action items] and look forward to continuing to contribute to [organization/team]."

## Remember
- Skip-levels are a privilege, not a right
- Use them wisely and constructively
- Build trust through honest, thoughtful feedback
- Follow through on commitments
- Respect your manager's role`,
  },
  {
    title: 'Creating OKRs and SMART Goals That Engineers Actually Understand',
    description: 'Guide for managers and directors on creating OKRs (Objectives and Key Results) and SMART goals that engineers can understand and execute. Focuses on translating business objectives into technical, actionable goals.',
    category: 'management',
    role: 'engineering-director',
    tags: ['okrs', 'smart-goals', 'goal-setting', 'management', 'leadership', 'career-development'],
    content: `# Creating OKRs and SMART Goals That Engineers Actually Understand

You are an Engineering Director or Manager creating OKRs (Objectives and Key Results) and SMART goals that engineers can understand and execute. The challenge is translating business objectives into technical, actionable goals that resonate with ICs.

## The Problem

### Why Engineers Struggle with OKRs/SMART Goals

**Too Abstract:**
- "Improve developer experience" - What does that mean?
- "Increase team velocity" - How exactly?
- "Reduce technical debt" - Which debt? How much?

**Too Business-Focused:**
- "Increase revenue by 20%" - Engineers don't control revenue
- "Improve customer satisfaction" - Too removed from daily work
- "Reduce churn" - How do I contribute?

**Unclear How to Execute:**
- Goals don't connect to actual work
- No clear definition of success
- Vague metrics

**Lack of Context:**
- Why does this matter?
- How does this connect to my work?
- What's the business impact?

## The Solution: Engineer-Friendly OKRs

### Structure for Engineer OKRs

**Objective (The "Why"):**
- Clear, inspiring statement
- Shows impact (business or technical)
- Resonates with engineering values

**Key Results (The "What"):**
- Concrete, measurable outcomes
- Technical metrics engineers understand
- Observable and verifiable

**Initiatives (The "How"):**
- Specific projects or work
- Clear ownership
- Actionable tasks

## OKR Framework for Engineers

### Level 1: Organizational OKRs (Director/VP Level)

**Example:**

**Objective:** Improve developer experience to increase engineering productivity and retention

**Key Results:**
- Reduce average CI/CD pipeline time from 25min to 10min
- Increase developer satisfaction score from 6.5/10 to 8/10
- Reduce onboarding time from 2 weeks to 3 days

**Initiatives:**
- Optimize CI/CD pipeline
- Create developer onboarding program
- Improve documentation

### Level 2: Team OKRs (Manager Level)

**Example:**

**Objective:** Build reliable, scalable infrastructure to support 10x growth

**Key Results:**
- Achieve 99.9% uptime (from current 99.5%)
- Reduce p95 latency from 500ms to 200ms
- Complete infrastructure migration to new platform

**Initiatives:**
- Implement monitoring and alerting
- Optimize database queries
- Migrate to new infrastructure

### Level 3: Individual OKRs (IC Level)

**Example:**

**Objective:** Improve code quality and reduce bugs in production

**Key Results:**
- Increase test coverage from 60% to 80%
- Reduce production bugs by 40%
- Complete 5 code reviews per week with actionable feedback

**Initiatives:**
- Write unit tests for new features
- Implement integration tests
- Improve code review process

## SMART Goals Framework for Engineers

### S - Specific (Technical, Not Vague)

**Bad:**
- "Improve code quality"
- "Write better tests"
- "Reduce bugs"

**Good:**
- "Increase test coverage for payment module from 65% to 85%"
- "Reduce production bugs in authentication service by 50%"
- "Complete code review for all PRs within 24 hours"

### M - Measurable (Engineering Metrics)

**Metrics Engineers Understand:**
- Test coverage percentage
- Mean time to recovery (MTTR)
- Code review time
- Build/deploy time
- Error rates
- Performance metrics (latency, throughput)
- Documentation coverage

**Bad:**
- "Be more productive"
- "Improve quality"

**Good:**
- "Reduce average PR review time from 48h to 24h"
- "Increase test coverage from 70% to 85%"
- "Reduce p95 latency from 300ms to 150ms"

### A - Achievable (Realistic for Engineering Work)

**Consider:**
- Current workload
- Technical constraints
- Dependencies
- Team capacity
- Technical feasibility

**Bad:**
- "Reduce all bugs to zero" (unrealistic)
- "Complete migration in 2 weeks" (too aggressive)

**Good:**
- "Reduce high-severity bugs by 30%"
- "Complete phase 1 of migration in Q1"

### R - Relevant (Technical Impact)

**Connect to:**
- Technical improvements
- Team goals
- Product reliability
- Developer experience
- System performance

**Bad:**
- "Increase revenue" (not directly relevant to IC work)

**Good:**
- "Improve API response time to enable new feature launch"
- "Reduce infrastructure costs by optimizing queries"

### T - Time-Bound (Clear Timeline)

**Use:**
- Sprint timelines
- Quarter boundaries
- Release dates
- Project milestones

**Bad:**
- "Someday"
- "This year"

**Good:**
- "By end of Q1"
- "Within 2 sprints"
- "By next release"

## Creating Engineer-Friendly OKRs: Step-by-Step

### Step 1: Start with Business Context

**For Engineers:**
- "We need to scale to 10x traffic"
- "We're losing customers due to reliability"
- "We need to ship faster to compete"

**Then Translate:**
- "We need infrastructure that scales"
- "We need to improve reliability"
- "We need to reduce deployment friction"

### Step 2: Define Technical Objectives

**Make Them:**
- Clear and inspiring
- Technically meaningful
- Connected to business impact

**Example:**
- "Build a scalable, reliable platform that supports 10x growth" (business + technical)

### Step 3: Create Measurable Key Results

**Use Technical Metrics:**
- Performance: latency, throughput, uptime
- Quality: test coverage, bug rates, code review metrics
- Velocity: deployment frequency, lead time
- Developer Experience: setup time, build time, satisfaction

**Example:**
- KR1: Achieve 99.9% uptime (from 99.5%)
- KR2: Reduce p95 latency from 500ms to 200ms
- KR3: Enable deployments 5x per day (from 1x)

### Step 4: Identify Specific Initiatives

**Break Down Into:**
- Projects engineers can work on
- Specific technical tasks
- Clear ownership

**Example:**
- Initiative 1: Implement caching layer
- Initiative 2: Optimize database queries
- Initiative 3: Set up monitoring and alerting

### Step 5: Connect to Individual Work

**Show How:**
- Your work contributes to team OKRs
- Team OKRs contribute to org OKRs
- It all connects to impact

**Example:**
- "Your work on API optimization directly contributes to our KR of reducing latency"

## Examples: Engineering OKRs

### Example 1: Reliability

**Objective:** Build a highly reliable platform that customers can depend on

**Key Results:**
- Achieve 99.9% uptime (from 99.5%)
- Reduce mean time to recovery (MTTR) from 2 hours to 30 minutes
- Reduce high-severity incidents by 50%

**Initiatives:**
- Implement comprehensive monitoring
- Create runbooks for common issues
- Improve incident response process

### Example 2: Developer Experience

**Objective:** Make development fast, enjoyable, and productive

**Key Results:**
- Reduce local setup time from 4 hours to 30 minutes
- Reduce CI/CD pipeline time from 25min to 10min
- Increase developer satisfaction score from 6.5/10 to 8/10

**Initiatives:**
- Containerize development environment
- Optimize CI/CD pipeline
- Improve documentation

### Example 3: Performance

**Objective:** Build a fast, responsive product that delights users

**Key Results:**
- Reduce p95 API latency from 500ms to 200ms
- Reduce page load time from 3s to 1s
- Achieve Lighthouse score of 90+ (from 70)

**Initiatives:**
- Implement caching strategy
- Optimize database queries
- Improve frontend performance

### Example 4: Code Quality

**Objective:** Write maintainable, high-quality code that teams can build on

**Key Results:**
- Increase test coverage from 60% to 80%
- Reduce production bugs by 40%
- Complete all code reviews within 24 hours

**Initiatives:**
- Write tests for new features
- Improve code review process
- Establish coding standards

## Creating SMART Goals for Individual Engineers

### Template

**Goal:** [Specific, measurable outcome]

**Context:** [Why this matters]

**Success Criteria:**
- [Measurable metric 1]
- [Measurable metric 2]
- [Observable behavior]

**Timeline:** [Clear deadline]

**Support Needed:**
- [Resources, tools, help required]

### Example 1: Junior Engineer

**Goal:** Improve code quality by writing comprehensive tests

**Context:** We need better test coverage to reduce bugs and increase confidence in changes

**Success Criteria:**
- Write unit tests for all new features
- Achieve 80% test coverage on assigned modules
- All tests pass before submitting PRs

**Timeline:** End of Q1

**Support Needed:**
- Pairing with senior engineer on test writing
- Access to testing resources and documentation

### Example 2: Senior Engineer

**Goal:** Lead technical initiative to improve system performance

**Context:** Our API latency is causing customer complaints. We need to optimize to support growth.

**Success Criteria:**
- Reduce p95 latency from 500ms to 200ms
- Document optimization approach for team
- Mentor 2 engineers on performance optimization

**Timeline:** End of Q2

**Support Needed:**
- Access to performance monitoring tools
- Time allocation (50% of sprint capacity)

### Example 3: Staff Engineer

**Goal:** Design and implement scalable architecture for new feature

**Context:** We're launching a new product that needs to scale to 10x current traffic

**Success Criteria:**
- Complete architecture design document
- Implement core infrastructure
- System handles 10x load in staging
- Documentation and runbooks created

**Timeline:** End of Q1

**Support Needed:**
- Collaboration with product and design
- Infrastructure resources
- Review from principal engineers

## Tips for Managers

### Make OKRs Real
- Connect to actual work engineers do
- Show impact of their contributions
- Make metrics relatable

### Provide Context
- Explain why goals matter
- Connect to business outcomes
- Share customer impact

### Track Progress
- Review OKRs regularly (weekly/monthly)
- Celebrate progress
- Adjust if needed

### Support Execution
- Remove blockers
- Provide resources
- Give feedback and coaching

### Make It Collaborative
- Involve engineers in creating OKRs
- Get their input on metrics
- Co-create goals together

## Common Pitfalls to Avoid

### ❌ Don't:
- Use only business metrics engineers can't control
- Make goals too abstract
- Ignore technical constraints
- Set unrealistic expectations
- Change goals mid-quarter

### ✅ Do:
- Translate business goals to technical goals
- Use metrics engineers understand
- Provide context and support
- Set realistic expectations
- Review and adjust regularly

## Success Metrics

Track:
- Goal completion rate
- Engineer understanding (survey)
- Engagement with goals
- Impact on team performance
- Career development outcomes

## Remember
- OKRs should inspire, not constrain
- Goals should connect to daily work
- Metrics should be meaningful
- Provide support and context
- Make it collaborative`,
  },
  {
    title: 'Creating Professional Development Plans for Engineers',
    description: 'Guide for Engineering Directors and Managers on creating comprehensive professional development plans that help engineers grow their careers. Includes skill development, career paths, and actionable goals.',
    category: 'management',
    role: 'engineering-director',
    tags: ['professional-development', 'career-development', 'people-management', 'leadership', '1-on-1s'],
    content: `# Creating Professional Development Plans for Engineers

You are an Engineering Director or Manager creating a professional development plan for an engineer. Your goal is to help them grow their skills, advance their career, and achieve their professional goals.

## Context
- **Engineer Name**: [Name]
- **Current Level**: [Junior / Mid / Senior / Staff / Principal]
- **Tenure**: [Time at company]
- **Performance**: [Top performer / Solid / Needs improvement]
- **Career Goals**: [What they want]
- **Timeline**: [Quarterly / Annual / Custom]

## Pre-Planning Preparation

### Gather Information

**1. Performance Review Data**
- [ ] Recent performance review
- [ ] Strengths identified
- [ ] Areas for development
- [ ] Feedback from peers and stakeholders

**2. Career Conversations**
- [ ] What's their ideal next role?
- [ ] What skills do they want to develop?
- [ ] What motivates them?
- [ ] What are their long-term goals?

**3. Technical Assessment**
- [ ] Current technical skills
- [ ] Skills needed for next level
- [ ] Skills needed for desired role
- [ ] Gaps identified

**4. Organizational Context**
- [ ] Career ladder expectations
- [ ] Upcoming opportunities
- [ ] Team and org needs
- [ ] Market considerations

## Development Plan Structure

### 1. Current State Assessment

**Current Role & Performance:**
- Role: [Current role]
- Level: [Current level]
- Performance: [Summary]
- Strengths: [Top 3-5 strengths]
- Development Areas: [Top 3-5 areas]

**Career Aspirations:**
- Short-term goal (6-12 months): [Goal]
- Long-term goal (2-3 years): [Goal]
- Desired role: [Target role]
- Desired level: [Target level]

### 2. Gap Analysis

**Skills Needed for Next Level:**

**Technical Skills:**
- [ ] [Skill 1] - Current: [Level] / Needed: [Level]
- [ ] [Skill 2] - Current: [Level] / Needed: [Level]
- [ ] [Skill 3] - Current: [Level] / Needed: [Level]

**Leadership Skills:**
- [ ] [Skill 1] - Current: [Level] / Needed: [Level]
- [ ] [Skill 2] - Current: [Level] / Needed: [Level]

**Communication Skills:**
- [ ] [Skill 1] - Current: [Level] / Needed: [Level]

**Experience & Impact:**
- [ ] [Experience type] - Current: [Status] / Needed: [Status]
- [ ] [Experience type] - Current: [Status] / Needed: [Status]

### 3. Development Goals

**Goal 1: [Specific Skill Development]**
- **Current State**: [Where they are]
- **Target State**: [Where they need to be]
- **Why It Matters**: [Why this skill is important]
- **Success Criteria**: [How to measure progress]
- **Timeline**: [Deadline]

**Goal 2: [Another Development Area]**
- [Same structure]

**Goal 3: [Experience/Impact Goal]**
- [Same structure]

### 4. Development Activities

**For Each Goal, Identify:**

**Learning Activities:**
- [ ] [Specific activity] - Examples: courses, reading, workshops
- [ ] [Specific activity]

**Practice Activities:**
- [ ] [Specific project or task] - Examples: stretch assignments, side projects
- [ ] [Specific activity]

**Experiences:**
- [ ] [Specific opportunity] - Examples: leading project, mentoring, presenting
- [ ] [Specific activity]

**Support & Resources:**
- [ ] [Mentor or coach] - Who can help
- [ ] [Resources] - Tools, books, courses
- [ ] [Time allocation] - How much time to dedicate

### 5. Growth Opportunities

**Immediate (Next 3 Months):**
- [ ] [Opportunity 1] - Description and timing
- [ ] [Opportunity 2]

**Short-term (Next 6-12 Months):**
- [ ] [Opportunity 1]
- [ ] [Opportunity 2]

**Long-term (12+ Months):**
- [ ] [Opportunity 1]
- [ ] [Opportunity 2]

### 6. Action Plan

**Quarter 1:**
- [ ] [Specific action] - Owner: [Engineer/Manager/Both] - Due: [Date]
- [ ] [Specific action]

**Quarter 2:**
- [ ] [Specific action]
- [ ] [Specific action]

**Quarter 3:**
- [ ] [Specific action]
- [ ] [Specific action]

**Quarter 4:**
- [ ] [Specific action]
- [ ] [Specific action]

### 7. Success Metrics

**How We'll Measure Progress:**
- [ ] [Metric 1] - Target: [Value] - Current: [Value]
- [ ] [Metric 2] - Target: [Value] - Current: [Value]
- [ ] [Metric 3] - Target: [Value] - Current: [Value]

**Review Cadence:**
- Monthly check-ins
- Quarterly progress reviews
- Annual plan update

## Example Development Plans

### Example 1: Mid-Level → Senior Engineer

**Current State:**
- Role: Mid-Level Engineer
- Strengths: Strong technical skills, good at execution
- Development Areas: Leadership, architecture, cross-team collaboration

**Career Goal:**
- Become Senior Engineer within 12 months

**Gap Analysis:**
- Need: Lead technical initiatives
- Need: Mentor junior engineers
- Need: Make architecture decisions
- Need: Collaborate cross-functionally

**Development Goals:**

**Goal 1: Lead Technical Initiatives**
- **Activities**: Lead a migration project, own technical design doc
- **Timeline**: Q1-Q2
- **Success**: Successfully lead initiative with measurable impact

**Goal 2: Mentor Junior Engineers**
- **Activities**: Pair with junior engineers, conduct code reviews, provide feedback
- **Timeline**: Q1-Q4
- **Success**: Actively mentor 2+ junior engineers

**Goal 3: Improve Architecture Skills**
- **Activities**: Take architecture course, participate in design reviews, write RFCs
- **Timeline**: Q1-Q3
- **Success**: Design and document architecture for new feature

**Action Plan:**
- Q1: Start mentoring, begin architecture course
- Q2: Lead technical initiative
- Q3: Complete architecture course, write RFC
- Q4: Review progress, prepare for promotion

### Example 2: Senior → Staff Engineer

**Current State:**
- Role: Senior Engineer
- Strengths: Strong technical leadership, effective mentor
- Development Areas: Cross-team impact, strategic thinking, influence

**Career Goal:**
- Become Staff Engineer within 18 months

**Gap Analysis:**
- Need: Impact across multiple teams
- Need: Strategic thinking
- Need: Influence without authority
- Need: Technical vision

**Development Goals:**

**Goal 1: Impact Across Teams**
- **Activities**: Lead cross-team initiative, collaborate with other teams
- **Timeline**: Q1-Q4
- **Success**: Initiative impacts 3+ teams

**Goal 2: Develop Strategic Thinking**
- **Activities**: Read strategic content, participate in planning, mentor on strategy
- **Timeline**: Q1-Q4
- **Success**: Contribute to technical strategy

**Goal 3: Build Influence**
- **Activities**: Present at tech talks, write technical blog posts, mentor other seniors
- **Timeline**: Q1-Q4
- **Success**: Recognized as technical leader externally

**Action Plan:**
- Q1-Q2: Start cross-team initiative
- Q2-Q3: Begin strategic work
- Q3-Q4: Build external presence
- Q4: Review and prepare for promotion

## Development Activities by Category

### Technical Skills

**Learning:**
- Online courses (Pluralsight, Coursera, etc.)
- Technical books
- Workshops and conferences
- Internal tech talks

**Practice:**
- Side projects
- Open source contributions
- Technical challenges
- Code katas

**Experience:**
- Lead technical projects
- Write technical design docs
- Make architecture decisions
- Optimize systems

### Leadership Skills

**Learning:**
- Leadership books
- Management courses
- Leadership workshops
- Mentorship programs

**Practice:**
- Mentor junior engineers
- Lead initiatives
- Facilitate meetings
- Give presentations

**Experience:**
- Manage projects
- Lead teams (temporarily)
- Present to leadership
- Influence decisions

### Communication Skills

**Learning:**
- Communication courses
- Writing workshops
- Presentation training

**Practice:**
- Write technical docs
- Give presentations
- Conduct code reviews
- Participate in design reviews

**Experience:**
- Present at all-hands
- Write blog posts
- Speak at conferences
- Mentor others

## Supporting Development

### Manager's Role

**Provide:**
- Stretch assignments
- Opportunities to lead
- Feedback and coaching
- Resources and support
- Visibility and recognition

**Regular Check-ins:**
- Review progress monthly
- Adjust plan as needed
- Remove blockers
- Celebrate wins

### Engineer's Role

**Own:**
- Execution of plan
- Seeking opportunities
- Asking for feedback
- Learning and growth
- Communicating needs

**Accountability:**
- Track progress
- Report on activities
- Ask for help when needed
- Follow through on commitments

## Common Development Areas

### For Junior Engineers
- Technical fundamentals
- Writing clean code
- Testing
- Code review
- Debugging
- Learning from seniors

### For Mid-Level Engineers
- Technical leadership
- Architecture
- Mentoring
- Cross-team collaboration
- Problem-solving
- System design

### For Senior Engineers
- Strategic thinking
- Cross-team impact
- Influence
- Technical vision
- Mentoring seniors
- External presence

### For Staff+ Engineers
- Organizational impact
- Technical strategy
- Thought leadership
- Developing other leaders
- Industry presence
- Executive communication

## Tips for Success

### Make It Specific
- Avoid vague goals
- Use concrete activities
- Set clear timelines
- Define success criteria

### Make It Realistic
- Consider current workload
- Account for capacity
- Set achievable goals
- Adjust as needed

### Make It Collaborative
- Involve engineer in planning
- Get their input
- Co-create goals
- Ensure buy-in

### Track Progress
- Regular check-ins
- Update plan quarterly
- Celebrate progress
- Adjust if needed

### Provide Support
- Remove blockers
- Provide resources
- Give feedback
- Connect with opportunities

## Success Metrics

Track:
- Goal completion rate
- Skill development progress
- Career advancement
- Engagement and satisfaction
- Retention

## Review and Update

**Monthly:**
- Check progress on activities
- Adjust if needed
- Remove blockers

**Quarterly:**
- Review progress on goals
- Update development plan
- Identify new opportunities

**Annually:**
- Comprehensive review
- Reset plan for next year
- Assess career progress

## Notes
- Development plans should be living documents
- Adjust based on progress and new opportunities
- Focus on growth, not just promotion
- Support the engineer's journey
- Make it personal and meaningful`,
  },
  {
    title: 'Analyzing eNPS Results to Create Improvement Plans',
    description: 'Guide for Directors and VPs on analyzing eNPS (Employee Net Promoter Score) survey results for their department and creating actionable improvement plans based on feedback.',
    category: 'management',
    role: 'engineering-director',
    tags: ['enps', 'employee-engagement', 'survey-analysis', 'action-planning', 'leadership', 'culture'],
    content: `# Analyzing eNPS Results to Create Improvement Plans

You are an Engineering Director or VP analyzing eNPS results for your department and creating an actionable improvement plan based on feedback.

## Context
- **Your Role**: [Engineering Director / VP of Engineering / Product Director / VP of Product]
- **Department**: [Engineering / Product]
- **Team Size**: [Number of people]
- **Survey Period**: [Date Range]
- **Response Rate**: [X%]
- **Overall eNPS**: [Score]
- **Historical Trend**: [Improving / Declining / Stable]

## Understanding eNPS Data

### eNPS Calculation
- **Promoters (9-10)**: [X%] - [Count] people
- **Passives (7-8)**: [X%] - [Count] people
- **Detractors (0-6)**: [X%] - [Count] people
- **eNPS Score**: Promoters% - Detractors% = [Score]

### Segment Analysis

**By Team:**
- Team A: eNPS [Score] - [Promoters/Passives/Detractors]
- Team B: eNPS [Score] - [Promoters/Passives/Detractors]
- Team C: eNPS [Score] - [Promoters/Passives/Detractors]

**By Level:**
- ICs: eNPS [Score]
- Managers: eNPS [Score]
- Directors: eNPS [Score]

**By Tenure:**
- 0-6 months: eNPS [Score]
- 6-12 months: eNPS [Score]
- 1-2 years: eNPS [Score]
- 2+ years: eNPS [Score]

**By Location:**
- Remote: eNPS [Score]
- Hybrid: eNPS [Score]
- On-site: eNPS [Score]

## Analyzing Qualitative Feedback

### Promoter Themes

**What's Working Well:**
1. **[Theme 1]** - [Example quotes]
   - Frequency: Mentioned by [X] promoters
   - Impact: [Why this matters]

2. **[Theme 2]** - [Example quotes]
   - Frequency: Mentioned by [X] promoters
   - Impact: [Why this matters]

3. **[Theme 3]** - [Example quotes]
   - Frequency: Mentioned by [X] promoters
   - Impact: [Why this matters]

**Key Strengths to Preserve:**
- [Strength 1]
- [Strength 2]
- [Strength 3]

### Detractor Themes

**What Needs Improvement:**
1. **[Theme 1]** - [Example quotes]
   - Frequency: Mentioned by [X] detractors
   - Severity: [High/Medium/Low]
   - Impact: [How this affects people/work]

2. **[Theme 2]** - [Example quotes]
   - Frequency: Mentioned by [X] detractors
   - Severity: [High/Medium/Low]
   - Impact: [How this affects people/work]

3. **[Theme 3]** - [Example quotes]
   - Frequency: Mentioned by [X] detractors
   - Severity: [High/Medium/Low]
   - Impact: [How this affects people/work]

**Most Critical Issues:**
- [Issue 1] - Affects [X] people, [High/Medium/Low] impact
- [Issue 2] - Affects [X] people, [High/Medium/Low] impact
- [Issue 3] - Affects [X] people, [High/Medium/Low] impact

## Root Cause Analysis

### For Each Major Detractor Theme

**Theme: [Theme Name]**

**What is the problem?**
- [Clear description]

**Why is this happening?**
- Root cause 1: [Description]
- Root cause 2: [Description]
- Root cause 3: [Description]

**Who is affected?**
- [Teams/Groups]
- [Impact level: High/Medium/Low]

**What would fix this?**
- Solution idea 1: [Description]
- Solution idea 2: [Description]
- Solution idea 3: [Description]

**Priority Assessment:**
- Priority: [High/Medium/Low]
- Effort: [Low/Medium/High]
- Impact: [Low/Medium/High]
- Timeline: [Estimated time to fix]

## Improvement Plan

### High Priority (Quick Wins, High Impact)

**Action 1: [Action Name]**
- **Problem**: [What this addresses]
- **Solution**: [What we'll do]
- **Owner**: [Who]
- **Timeline**: [Date]
- **Success Metric**: [How to measure]
- **Cost/Effort**: [Low/Medium/High]
- **Expected Impact**: [Expected improvement]

**Action 2: [Action Name]**
- [Same structure]

**Action 3: [Action Name]**
- [Same structure]

### Medium Priority (Strategic Improvements)

**Action 1: [Action Name]**
- **Problem**: [What this addresses]
- **Solution**: [What we'll do]
- **Owner**: [Who]
- **Timeline**: [Date]
- **Success Metric**: [How to measure]
- **Cost/Effort**: [Low/Medium/High]
- **Expected Impact**: [Expected improvement]

**Action 2: [Action Name]**
- [Same structure]

### Low Priority (Nice to Have)

**Action 1: [Action Name]**
- **Problem**: [What this addresses]
- **Solution**: [What we'll do]
- **Owner**: [Who]
- **Timeline**: [Date]
- **Success Metric**: [How to measure]

## Common eNPS Improvement Areas

### For Engineering Directors/VPs

**1. Developer Experience**
- **Common Issues**: Slow CI/CD, complex setup, poor tooling
- **Solutions**: Optimize pipelines, improve tooling, streamline processes
- **Impact**: High - directly affects daily work

**2. Career Growth**
- **Common Issues**: Unclear career paths, lack of opportunities, limited growth
- **Solutions**: Career ladders, development plans, growth opportunities
- **Impact**: High - major retention driver

**3. Manager Quality**
- **Common Issues**: Poor managers, lack of feedback, micromanagement
- **Solutions**: Manager training, coaching, feedback processes
- **Impact**: High - managers directly impact experience

**4. Technical Debt**
- **Common Issues**: Too much tech debt, affecting productivity
- **Solutions**: Allocate time, prioritize debt, make it visible
- **Impact**: Medium-High - affects morale and productivity

**5. Work-Life Balance**
- **Common Issues**: Long hours, burnout, unsustainable pace
- **Solutions**: Set boundaries, reduce workload, support balance
- **Impact**: High - retention and well-being

**6. Communication**
- **Common Issues**: Lack of transparency, unclear direction, poor communication
- **Solutions**: Better communication, more transparency, clear direction
- **Impact**: Medium-High - affects engagement

**7. Recognition**
- **Common Issues**: Not feeling valued, lack of recognition
- **Solutions**: Recognition programs, celebrate wins, appreciation
- **Impact**: Medium - affects morale

**8. Compensation**
- **Common Issues**: Underpaid, unfair compensation
- **Solutions**: Market review, pay equity, competitive compensation
- **Impact**: High - major retention factor

### For Product Directors/VPs

**1. Product Impact**
- **Common Issues**: Work doesn't feel meaningful, unclear impact
- **Solutions**: Connect work to impact, share customer stories, celebrate wins
- **Impact**: High - motivation driver

**2. Strategic Clarity**
- **Common Issues**: Unclear strategy, changing priorities
- **Solutions**: Clear strategy, consistent priorities, better communication
- **Impact**: High - affects direction and focus

**3. Customer Connection**
- **Common Issues**: Not talking to customers, removed from users
- **Solutions**: Customer visits, user research, direct feedback
- **Impact**: Medium-High - affects motivation

**4. Career Growth**
- **Common Issues**: Unclear paths, limited opportunities
- **Solutions**: Career ladders, development plans, growth paths
- **Impact**: High - retention driver

**5. Process Friction**
- **Common Issues**: Too much process, bureaucracy, slow decisions
- **Solutions**: Streamline processes, reduce approvals, faster decisions
- **Impact**: Medium-High - affects velocity

## Communication Plan

### Sharing Results

**All-Hands Presentation:**
- **When**: [Date]
- **Format**: [Presentation / Discussion]
- **Key Messages**:
  - Overall eNPS score and trend
  - Top strengths (what's working)
  - Top priorities (what we'll fix)
  - Action plan overview
  - How to get involved

**Team Updates:**
- **When**: [Frequency]
- **Format**: [Email / Slack / Meeting]
- **Content**: Progress updates, wins, upcoming actions

**Leadership Updates:**
- **When**: [Frequency]
- **Format**: [Report / Presentation]
- **Content**: Results, action plan, progress, support needed

### Follow-Up Survey

**Timeline**: [When to resurvey]
- Quarterly recommended for tracking
- Annual comprehensive survey

**Focus Areas**: [What to measure next time]
- [Area 1]
- [Area 2]
- [Area 3]

**Questions to Add**: [Any new questions based on findings]
- [Question 1]
- [Question 2]

## Success Metrics

### Track Progress

**Quantitative:**
- eNPS Score: Target [X] by [Date] (current: [Y])
- Detractor Reduction: Target [X]% reduction
- Promoter Increase: Target [X]% increase
- Action Item Completion: Target [X]% completion

**Qualitative:**
- Follow-up feedback on improvements
- Engagement in action planning
- Trust in leadership
- Perception of progress

### Regular Review

**Monthly:**
- Check progress on actions
- Update team on progress
- Remove blockers

**Quarterly:**
- Review eNPS trends
- Assess action plan effectiveness
- Adjust plan if needed

**Annually:**
- Comprehensive review
- Reset action plan
- Celebrate improvements

## Example Improvement Plan

### Problem: Low eNPS Due to Slow CI/CD

**Root Cause Analysis:**
- Problem: CI/CD pipeline takes 25+ minutes
- Why: Not optimized, sequential tests, no caching
- Who's Affected: All engineers
- Impact: High - slows development, frustrates team

**Action Plan:**

**Action 1: Optimize CI/CD Pipeline**
- Solution: Parallelize tests, add caching, optimize build
- Owner: Platform Team Lead
- Timeline: 4 weeks
- Success Metric: Reduce to <10 minutes
- Expected Impact: High satisfaction improvement

**Action 2: Improve Local Development**
- Solution: Containerize dev environment, improve docs
- Owner: Developer Experience Lead
- Timeline: 6 weeks
- Success Metric: Setup time <30 minutes
- Expected Impact: Medium-High satisfaction

**Action 3: Regular DX Improvements**
- Solution: Monthly DX survey, quarterly improvements
- Owner: Engineering Director
- Timeline: Ongoing
- Success Metric: DX score >8/10
- Expected Impact: Sustained improvement

## Tips for Success

### Focus on Root Causes
- Don't just treat symptoms
- Address underlying issues
- Make lasting changes

### Prioritize Wisely
- Focus on high-impact, achievable actions
- Balance quick wins with strategic improvements
- Consider effort vs. impact

### Communicate Progress
- Share results transparently
- Update on progress regularly
- Celebrate wins

### Involve the Team
- Get input on solutions
- Involve in implementation
- Share ownership

### Follow Through
- Complete action items
- Track progress
- Adjust if needed

## Notes
- eNPS improvement takes time - be patient
- Focus on real improvements, not just numbers
- Involve the team in solutions
- Communicate progress regularly
- Celebrate wins along the way`,
  },
];

async function main() {
  const { getMongoDb } = await import('@/lib/db/mongodb');
  const db = await getMongoDb();
  
  console.log('✅ Connected to MongoDB');

  const promptsCollection = db.collection('prompts');

  let created = 0;
  let skipped = 0;

  for (const promptData of LEADERSHIP_PROMPTS) {
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
      id: generateId('leadership'),
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
  console.log(`   Total: ${LEADERSHIP_PROMPTS.length}`);
}

main();

