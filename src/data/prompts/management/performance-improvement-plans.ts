/**
 * Performance Improvement Plan (PIP) Prompt Templates
 * 80-90% complete templates for managers to create PIPs
 */

import { PromptTemplate } from '@/lib/schemas/prompt';

export const performanceImprovementPlans: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Performance Improvement Plan for Individual Contributor',
    description: 'Structured PIP template for ICs with clear expectations, support plan, and success metrics. Starts at 85% complete.',
    category: 'management',
    role: 'engineering-manager',
    pattern: 'craft',
    tags: ['pips', 'performance', 'management', 'feedback', '1-on-1s', 'documentation'],
    content: `You are an experienced engineering manager creating a Performance Improvement Plan (PIP). Create a professional, supportive PIP document for:

**Employee Context:**
- Name: [Employee Name]
- Role: [Title/Level]
- Tenure: [Time at company]
- Manager: [Your name]

**Performance Concerns:**
[Describe specific performance gaps. Be objective and cite examples:]
1. [Concern #1 with specific examples and dates]
2. [Concern #2 with specific examples and dates]
3. [Concern #3 with specific examples and dates]

**Expected Performance Standards:**
[What does success look like? Reference job level expectations:]
1. [Standard #1 with measurable criteria]
2. [Standard #2 with measurable criteria]
3. [Standard #3 with measurable criteria]

**Generate a comprehensive PIP document with these sections:**

## 1. Executive Summary
- Current performance level vs. expected
- Purpose of this PIP (improvement, not punishment)
- Timeline and review schedule

## 2. Specific Performance Issues
For each issue identified above:
- Objective description of the gap
- Business impact
- Examples with dates/context
- Expected behavior/output

## 3. Improvement Goals (30/60/90 day)
**30 Days:**
- [Specific, measurable goal #1]
- [Specific, measurable goal #2]

**60 Days:**
- [Building on 30-day progress]

**90 Days:**
- [Full expected performance level]

## 4. Support & Resources
What the company/manager will provide:
- Weekly 1-on-1 check-ins
- [Specific training/courses]
- [Mentorship/pairing opportunities]
- [Tools/resources]
- Clear feedback and coaching

## 5. Success Metrics
How we'll measure improvement:
- [Quantitative metric #1]
- [Quantitative metric #2]
- [Qualitative feedback from peers/stakeholders]

## 6. Review Schedule
- Weekly: [Brief check-in format]
- Bi-weekly: [Detailed progress review]
- 30/60/90 day: [Formal assessment meetings]

## 7. Expectations & Consequences
- Clear statement of what happens if goals are met
- Honest explanation of consequences if insufficient progress
- Reassurance of support throughout process

## 8. Next Steps
- Schedule initial PIP meeting
- Review and sign document
- Begin 30-day plan immediately

**Tone Guidelines:**
- Professional and respectful
- Specific, not vague
- Supportive while maintaining accountability
- Focus on improvement, not blame
- Clear about stakes while offering help

**Legal Compliance:**
- Ensure alignment with company HR policies
- Document everything
- Avoid discriminatory language
- Focus on job performance only`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },

  {
    title: 'Performance Improvement Plan for Engineering Manager',
    description: 'PIP template for managers with focus on leadership, team health, and organizational impact.',
    category: 'leadership',
    role: 'director',
    pattern: 'craft',
    tags: ['pips', 'leadership', 'management', 'performance', 'team-building', 'documentation'],
    content: `You are a Director or VP creating a Performance Improvement Plan for an Engineering Manager. Create a thoughtful, comprehensive PIP that addresses leadership and management competencies:

**Manager Context:**
- Name: [Manager Name]
- Role: Engineering Manager
- Team Size: [Number of reports]
- Tenure: [Time in role/company]
- Reporting to: [Your name/title]

**Performance Concerns:**
[Identify specific leadership/management gaps:]
1. [Leadership concern with examples]
2. [Team health/delivery concern with data]
3. [Organizational impact concern with context]

**Expected Manager Competencies:**
[Reference your engineering manager competency framework:]
1. [Core competency #1 and expected level]
2. [Core competency #2 and expected level]
3. [Core competency #3 and expected level]

**Generate a manager-specific PIP with these sections:**

## 1. Executive Summary
- Current performance vs. expectations for manager level
- Impact on team and organization
- Goals of this improvement plan
- Timeline (typically 60-90 days for managers)

## 2. Specific Leadership/Management Gaps

**People Management:**
- [Issue with 1-on-1s, feedback, coaching]
- [Examples with dates and impact on reports]

**Delivery & Execution:**
- [Issue with project delivery, planning, priorities]
- [Examples with metrics or stakeholder feedback]

**Team Health & Culture:**
- [Issue with team morale, retention, culture]
- [Examples with data: surveys, attrition, feedback]

**Cross-Functional Partnership:**
- [Issue with collaboration, communication, influence]
- [Examples from Product, Design, other teams]

**Technical Leadership:**
- [Issue with technical decisions, architecture, quality]
- [Examples with business impact]

## 3. Improvement Goals

**First 30 Days:**
- [Immediate behavior change #1]
- [Quick win to demonstrate commitment]
- [Relationship repair if needed]

**Days 31-60:**
- [Sustained improvements in people management]
- [Measurable team health improvements]
- [Better cross-functional partnership]

**Days 61-90:**
- [Full manager competency level achieved]
- [Positive team feedback]
- [Consistent delivery and execution]

## 4. Support & Development Plan

**Your Commitment as Manager:**
- Weekly 1-on-1 coaching sessions
- [Executive coach or mentor assignment]
- [Specific leadership training/courses]
- [360 feedback at 30 and 60 days]
- [Books/resources to study]

**Team Support:**
- [Staff engineer to help with technical decisions]
- [TPM/PM to help with project management]
- [HR partner for people management coaching]

## 5. Success Metrics

**Quantitative:**
- Team velocity/delivery metrics
- 1-on-1 completion rate (100%)
- Sprint predictability
- Incident reduction
- Code review turnaround time

**Qualitative:**
- 360 feedback from team (anonymous)
- Stakeholder feedback from Product/Design
- Skip-level feedback from reports
- Peer manager feedback

**Leading Indicators (Weekly):**
- 1-on-1s held on time
- Team retro action items addressed
- Clear sprint goals communicated
- Technical decisions documented

## 6. Review & Feedback Cadence

**Weekly:**
- 1-hour coaching session with you
- Review of leading indicators
- Adjust support as needed

**Bi-Weekly:**
- 360 feedback pulse (3-4 questions)
- Team delivery review
- Stakeholder check-ins

**30/60/90 Days:**
- Formal performance review
- Comprehensive 360 feedback
- Decision point at each milestone

## 7. Team Communication

**What the team knows:**
- [Manager is working on specific improvements]
- [Additional support is in place]
- [Team feedback is valued and acted upon]

**What stays confidential:**
- PIP details and timeline
- Specific examples in this document
- Potential consequences

## 8. Consequences & Outcomes

**If Goals Are Met:**
- Continue as Engineering Manager
- [Possible transition to different team if better fit]
- Ongoing coaching and development

**If Insufficient Progress:**
- 30 days: Adjust support, continue plan
- 60 days: Consider role change (IC, PM, or exit)
- 90 days: Final decision point

**Throughout:**
- Honest, frequent communication
- No surprises at review points
- Focus on sustainable improvement

## 9. Action Items

**Immediate (This Week):**
- [ ] Schedule PIP kickoff meeting
- [ ] Assign executive coach
- [ ] Set up weekly 1-on-1s
- [ ] Communicate support plan to team (high-level)

**First 30 Days:**
- [ ] Complete leadership assessment
- [ ] Read [specific book/resource]
- [ ] Implement [specific process improvement]
- [ ] Collect first 360 feedback

**Tone Guidelines:**
- Respectful of manager's expertise and effort
- Clear about the seriousness of concerns
- Supportive while maintaining accountability
- Acknowledge systemic/organizational factors
- Focus on specific behaviors, not character

**Manager-Specific Considerations:**
- Impact on team morale (handle sensitively)
- Possible role change vs. exit (both are options)
- Longer timeline than IC PIPs (60-90 days typical)
- More coaching and support resources
- 360 feedback is critical`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },

  {
    title: 'PIP Progress Review Template',
    description: '30/60/90 day PIP checkpoint meeting template with structured assessment and feedback.',
    category: 'management',
    role: 'engineering-manager',
    pattern: 'craft',
    tags: ['pips', 'feedback', '1-on-1s', 'performance', 'management', 'documentation'],
    content: `You are conducting a PIP progress review meeting. Generate a structured review document for a checkpoint meeting (30, 60, or 90 day review).

**Context:**
- Employee: [Name]
- PIP Start Date: [Date]
- Review Checkpoint: [30 / 60 / 90 day]
- Original PIP Goals: [Summary of key goals]

**Generate a comprehensive progress review:**

## 1. Progress Summary

**Overall Assessment:**
- [ ] Exceeding expectations
- [ ] Meeting expectations
- [ ] Making progress but concerns remain
- [ ] Insufficient progress

**One Paragraph Summary:**
[Objective assessment of progress against goals]

## 2. Goal-by-Goal Review

**Goal #1: [Original goal stated]**
- Expected: [What was expected by this checkpoint]
- Actual: [What was achieved]
- Evidence: [Specific examples, metrics, feedback]
- Status: ✅ Met / ⚠️ Partial / ❌ Not Met

**Goal #2: [Original goal stated]**
- Expected: [What was expected]
- Actual: [What was achieved]
- Evidence: [Specific examples]
- Status: ✅ Met / ⚠️ Partial / ❌ Not Met

**Goal #3: [Original goal stated]**
- Expected: [What was expected]
- Actual: [What was achieved]
- Evidence: [Specific examples]
- Status: ✅ Met / ⚠️ Partial / ❌ Not Met

## 3. Positive Observations

**What's Working Well:**
1. [Specific improvement #1 with example]
2. [Specific improvement #2 with example]
3. [Positive feedback from team/stakeholders]

**Strengths to Build On:**
- [Area where showing progress]
- [Skill or behavior to leverage]

## 4. Remaining Concerns

**Areas Still Needing Improvement:**
1. [Concern #1 with specific example]
   - Impact: [How this affects team/work]
   - Needed: [What needs to change]

2. [Concern #2 with specific example]
   - Impact: [How this affects team/work]
   - Needed: [What needs to change]

## 5. Support Effectiveness Review

**What's Helping:**
- [Resource/support that's working]
- [Coaching/training that's effective]

**What to Adjust:**
- [Support to add or change]
- [Barrier to remove]

## 6. Next Phase Goals

**For Next [30/60/90] Days:**
1. [Specific, measurable goal #1]
2. [Specific, measurable goal #2]
3. [Specific, measurable goal #3]

**Success Looks Like:**
- [Clear picture of expected performance]

## 7. Decision & Next Steps

**Decision:**
- [ ] Continue PIP to next checkpoint
- [ ] Extend PIP timeline ([reason])
- [ ] Successfully complete PIP (90-day review)
- [ ] Transition to different role
- [ ] Initiate separation process

**Immediate Action Items:**
- [ ] [Action for employee]
- [ ] [Action for manager]
- [ ] [Action for HR/team]

**Next Review Date:** [Date]

## 8. Meeting Notes

**Employee Feedback:**
- [Employee's perspective on progress]
- [Any concerns or requests for support]
- [Agreement or disagreement with assessment]

**Manager Commitments:**
- [What you'll do to support next phase]

**Signatures:**
- Employee: _________________ Date: _______
- Manager: _________________ Date: _______
- HR Partner: _________________ Date: _______

**Documentation:**
- Attach: Performance examples, metrics, 360 feedback
- Next review scheduled: [Date & time]

**Tone for Meeting:**
- Start with positive observations
- Be specific with both praise and concerns
- Listen to employee perspective
- Collaborative problem-solving tone
- Clear about current status and path forward
- End with encouragement and clear next steps`,
    isFeatured: false,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
];
