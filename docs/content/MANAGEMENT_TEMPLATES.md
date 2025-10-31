<!--
AI Summary: High-value management prompt templates - PIPs, conflict resolution, facilitator guides.
Each template starts at 80-90% complete, user just customizes specifics.
-->

# Management Content Templates

This work is part of Day 5 Part 2: [Day 5 Part 2 Plan](../planning/DAY_5_PART_2_CONTENT_QUALITY.md).

## Overview

Create immediately useful, production-ready templates for common management scenarios. Philosophy: **Don't start at 0%, start at 80-90%**. Users customize details, not structure.

## Template Categories

### 1. Performance Improvement Plans (PIPs)

**For Engineering Managers - Writing a Fair PIP (Start at 85%)**

```
Category: leadership
Tags: [engineering-manager, pips, performance, 1-on-1s, communication]
Difficulty: advanced

Prompt:
You are an experienced engineering manager helping draft a fair and constructive Performance Improvement Plan (PIP). Create a 30/60/90 day PIP that is:
- Specific and actionable (clear measurable goals)
- Fair and supportive (focuses on improvement, not punishment)
- Legally sound (documents issues objectively)
- Empathetic (acknowledges strengths while addressing gaps)

Context to customize:
- Employee name: [NAME]
- Role/level: [e.g., Senior Engineer]
- Performance gaps: [e.g., missed deadlines, code quality issues, communication breakdowns]
- Strengths to acknowledge: [e.g., strong technical skills, good team player]

Generate a complete PIP with:
1. Executive Summary
2. Performance Gaps (with specific examples)
3. 30-Day Goals (3-4 specific, measurable objectives)
4. 60-Day Goals (build on 30-day progress)
5. 90-Day Goals (return to expected performance level)
6. Support Resources (training, mentorship, tools)
7. Check-in Schedule (weekly 1-on-1s)
8. Success Criteria
```

**For Individual Contributors - Responding to Your PIP (Start at 90%)**

```
Category: leadership
Tags: [senior-engineer, staff-engineer, pips, performance, career-development]
Difficulty: intermediate

Prompt:
You are a career coach helping an engineer respond professionally and effectively to a Performance Improvement Plan (PIP). Create a response strategy that:
- Acknowledges the feedback professionally
- Demonstrates commitment to improvement
- Proposes concrete action plan
- Maintains dignity and professionalism

Your situation:
- PIP focus areas: [e.g., code quality, meeting deadlines, communication]
- Your perspective: [e.g., workload was unclear, need better tooling, personal issues now resolved]
- Strengths you bring: [e.g., deep technical expertise, system knowledge]

Generate:
1. Initial Response Email (to manager, professional and constructive)
2. 30-Day Action Plan (specific steps you'll take)
3. Weekly Check-in Talking Points
4. Progress Tracking System
5. Documentation Strategy (keep records of improvements)
6. Parallel Job Search Plan (practical backup plan)
7. Mental Health Resources (this is stressful, take care of yourself)

Tone: Professional, solution-oriented, honest
```

### 2. Conflict Resolution Templates

**For Engineers - Resolving Technical Disagreements (Start at 85%)**

```
Category: engineering
Tags: [senior-engineer, staff-engineer, conflict-resolution, communication, team]
Difficulty: intermediate

Prompt:
Help resolve a technical disagreement between engineers. Create a structured approach that:
- Focuses on data and outcomes, not personalities
- Explores trade-offs objectively
- Finds win-win solutions or clear decision criteria
- Maintains team cohesion

The conflict:
- Issue: [e.g., React vs Vue, microservices vs monolith, TypeScript strict mode]
- Your position: [your technical preference and rationale]
- Their position: [colleague's preference and rationale]
- Business constraints: [timeline, team skills, existing tech stack]

Generate:
1. Pre-Discussion Preparation (gather data, use cases, benchmarks)
2. Discussion Framework (how to present your case objectively)
3. Trade-off Analysis Template (pros/cons for each approach)
4. Decision Criteria (what factors should drive the decision?)
5. Escalation Path (when to involve EM/architect)
6. Post-Decision Actions (how to commit regardless of outcome)

Output: Structured discussion guide that leads to data-driven decision
```

**For Managers - Mediating Team Conflicts (Start at 80%)**

```
Category: leadership
Tags: [engineering-manager, conflict-resolution, team, 1-on-1s, mediation]
Difficulty: advanced

Prompt:
You are an engineering manager mediating a conflict between two team members. Create a mediation plan that:
- Remains neutral and fair to both parties
- Focuses on behaviors and impact, not personalities
- Establishes clear expectations going forward
- Rebuilds trust and team cohesion

The situation:
- Team member A: [role, their perspective]
- Team member B: [role, their perspective]
- Impact on team: [missed deadlines, tense meetings, others taking sides]
- Your relationship with each: [any relevant context]

Generate:
1. Pre-Mediation Meeting (1-on-1 with each person separately)
2. Mediation Meeting Structure (agenda, ground rules, facilitation script)
3. Active Listening Prompts (questions to uncover root causes)
4. Conflict Resolution Framework (options for resolution)
5. Agreement Documentation (what both parties commit to)
6. Follow-Up Plan (check-ins, monitoring, support)

Outcome: Actionable mediation plan with scripts for each conversation
```

**For Directors - Cross-Team Conflict Resolution (Start at 75%)**

```
Category: leadership
Tags: [director, vp-engineering, conflict-resolution, cross-team, strategy]
Difficulty: expert

Prompt:
You are a director resolving a conflict between two engineering teams. Create a resolution strategy that:
- Addresses systemic issues, not just symptoms
- Balances team autonomy with company goals
- Establishes clear boundaries and interfaces
- Prevents future conflicts through process/structure

The conflict:
- Team A: [team focus, their complaint]
- Team B: [team focus, their complaint]
- Root cause: [e.g., unclear ownership, competing priorities, resource conflicts]
- Business impact: [delayed features, duplicated work, morale issues]

Generate:
1. Situation Analysis (map dependencies, identify systemic issues)
2. Stakeholder Alignment (EM/PM discussions before team meeting)
3. Joint Meeting Structure (both teams, focus on collaboration)
4. Process Improvements (RACI, RFC process, shared roadmap)
5. Organizational Changes (if needed - team structure, reporting)
6. Success Metrics (how to measure if conflict is resolved)

Output: Strategic intervention plan with organizational improvements
```

### 3. Facilitator Guides (Start at 90% Done)

**1-on-1 Facilitation Guide**

```
Category: leadership
Tags: [engineering-manager, director, 1-on-1s, facilitation, career-development]
Difficulty: beginner

Prompt:
Generate a structured 1-on-1 meeting guide for engineering managers. Create a template that is 90% complete - manager just fills in employee-specific details.

Employee context:
- Name: [NAME]
- Role: [e.g., Senior Engineer]
- Tenure: [e.g., 2 years]
- Recent wins: [optional context]
- Areas to discuss: [optional focus]

Generate:
**Pre-Meeting Prep (5 min)**:
- [ ] Review last 1-on-1 notes and action items
- [ ] Check recent PRs, tickets, project updates
- [ ] Prepare 2-3 talking points
- [ ] Block calendar for 30 min

**Meeting Agenda (30 min)**:
1. Personal Check-in (5 min)
   - How are you doing? (really)
   - Any blockers I should know about?

2. Project Updates (10 min)
   - What are you working on?
   - Any challenges or concerns?
   - Celebration: wins from last week

3. Career Development (10 min)
   - What are you learning?
   - Where do you want to grow?
   - How can I support your goals?

4. Manager Questions (5 min)
   - Feedback for me as your manager?
   - Anything I should start/stop/continue?

**Post-Meeting Actions**:
- [ ] Document key points and action items
- [ ] Follow up on commitments within 24 hours
- [ ] Schedule next 1-on-1
- [ ] Share notes with employee

**Sample Questions by Topic**:
[Generates 20+ questions across career, feedback, technical, team dynamics]
```

**Retrospective Facilitation Guide**

```
Category: leadership
Tags: [engineering-manager, scrum-masters, retros, facilitation, team]
Difficulty: intermediate

Prompt:
Create a comprehensive sprint retrospective facilitation guide that is 90% ready to use.

Sprint context:
- Sprint number: [e.g., Sprint 23]
- Duration: [e.g., 2 weeks]
- Team size: [e.g., 6 people]
- Major events: [e.g., production incident, new hire onboarded]

Generate:
**Pre-Retro Prep (15 min before)**:
- [ ] Book room with whiteboard/Miro board
- [ ] Review sprint metrics (velocity, bugs, deployment frequency)
- [ ] Identify 1-2 positive highlights
- [ ] Prepare ice-breaker question

**Retro Structure (60 min)**:
1. Set the Stage (5 min)
   - Retrospective prime directive
   - Confidentiality reminder
   - Parking lot for off-topic items

2. Gather Data (15 min)
   - What went well? (green stickies)
   - What needs improvement? (red stickies)
   - Appreciations (yellow stickies)

3. Generate Insights (20 min)
   - Group similar themes
   - Identify root causes (5 whys)
   - Vote on top 3 items to address

4. Decide What to Do (15 min)
   - For each top item: concrete action
   - Owner assigned
   - Success criteria defined

5. Close (5 min)
   - Recap action items
   - Feedback on retro format
   - Appreciation moment

**Post-Retro Actions**:
- [ ] Document action items in Jira
- [ ] Share retro summary with team (within 24 hours)
- [ ] Follow up on action items next week
- [ ] Improve retro format based on feedback

**Ice-Breaker Ideas**: [10+ options]
**Activity Variations**: [5 different retro formats]
```

**Incident Post-Mortem Facilitation**

```
Category: operations
Tags: [engineering-manager, director, devops, incident-response, facilitation]
Difficulty: advanced

Prompt:
Create a blameless post-mortem facilitation guide for production incidents.

Incident context:
- Incident ID: [INC-123]
- Severity: [P0/P1/P2]
- Duration: [e.g., 2 hours]
- Impact: [e.g., 50% of users affected, payment processing down]
- Teams involved: [e.g., Backend, DevOps, Frontend]

Generate:
**Pre-Mortem Prep (30 min)**:
- [ ] Gather timeline data (alerts, deploys, actions taken)
- [ ] Collect metrics (error rates, latency, user impact)
- [ ] Identify key participants (IC who responded, EM, on-call)
- [ ] Review incident chat logs

**Post-Mortem Meeting (90 min)**:
1. Set Blameless Culture Tone (5 min)
2. Timeline Review (20 min) - what happened, when
3. Impact Analysis (10 min) - user/business impact
4. Root Cause Analysis (30 min) - 5 whys, fishbone diagram
5. Action Items (20 min) - prevent, detect, mitigate
6. Process Improvements (5 min) - runbooks, alerts, training

**Post-Mortem Document Template**:
[Generates complete markdown template with all sections]

**Follow-Up Actions**:
- [ ] Publish post-mortem doc within 48 hours
- [ ] Create Jira tickets for action items
- [ ] Update runbooks and alerts
- [ ] Share learnings with broader org
- [ ] Schedule 30-day review of action items
```

## Implementation Plan

1. Create these templates as new prompts in MongoDB
2. Add to special "Management Tools" category in library
3. Test each with AI to ensure 80-90% completion
4. Add to `/library/management` browse page
5. Feature in "For CTOs" and "For Engineering Managers" landing pages

## Success Criteria

- Each template produces usable output in <5 min
- Minimal customization needed (just fill in names/context)
- Professional, legally sound language
- Empathetic and constructive tone
- Tested with real scenarios
