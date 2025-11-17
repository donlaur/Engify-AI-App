/**
 * Conflict Resolution Prompt Templates
 * Role-specific guides for resolving team conflicts
 */

import type { Prompt } from '@/lib/schemas/prompt';

export const conflictResolutionPrompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'conflict-res-001',
    title: 'Resolve Engineer-to-Engineer Conflict',
    description: 'Mediation guide for resolving technical disagreements or interpersonal conflicts between engineers.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['conflict-resolution', 'management', 'facilitation', 'team-building', 'communication'],
    isPublic: true,
    content: `You are an Engineering Manager mediating a conflict between two engineers. Generate a structured mediation plan and talking points:

**Conflict Context:**
- Engineer A: [Name/Role]
- Engineer B: [Name/Role]
- Conflict Type: [Technical disagreement / Interpersonal / Communication style / Code review friction / Other]
- Duration: [How long has this been an issue?]
- Impact: [On team velocity, morale, code quality]

**What You Know:**
- Engineer A's perspective: [Brief summary]
- Engineer B's perspective: [Brief summary]
- Team impact: [How it affects others]
- Previous attempts to resolve: [What's been tried]

**Generate a comprehensive mediation guide:**

## 1. Pre-Mediation Preparation

**Individual 1-on-1s First (Before Joint Meeting):**

**With Engineer A:**
- "Tell me your perspective on what's happening"
- "What impact is this having on you and your work?"
- "What would a good resolution look like for you?"
- "Are you open to a facilitated conversation with [Engineer B]?"

**With Engineer B:**
- [Same questions to hear both sides]

**Your Assessment:**
- Root cause: [Technical? Ego? Miscommunication? Values mismatch?]
- Severity: [Low / Medium / High / Team-breaking]
- Path forward: [Mediation / Separation / Process change / Other]

## 2. Mediation Meeting Structure (60-90 mins)

**Opening (5 mins):**
"Thank you both for being here. My goal is to help you work together effectively. Ground rules:
- Speak for yourself ('I feel/think') not about the other person ('You always')
- Listen to understand, not to respond
- Assume positive intent
- Focus on solutions, not blame
- Everything said here stays confidential unless we all agree otherwise"

**Each Person Shares (15 mins each):**

**Engineer A's Turn:**
- "Describe the situation from your perspective"
- "How has this impacted you?"
- "What do you need from [Engineer B] going forward?"

**[Manager]: "Engineer B, what did you hear? Can you summarize?"**

**Engineer B's Turn:**
- [Same questions]

**[Manager]: "Engineer A, what did you hear?"**

**Identify Common Ground (10 mins):**
- "What do you both agree on?"
- "What shared goals do you have?"
- "What do you each appreciate about the other?"

**Explore Solutions Together (20 mins):**
- "What would make this better?"
- "What can each of you do differently?"
- "What support do you need from me or the team?"

**Action Plan & Agreement (10 mins):**
- Write down specific commitments from each person
- Set a follow-up check-in (2 weeks)
- Thank both for their maturity and professionalism

## 3. Common Conflict Patterns & Responses

**Technical Disagreement (Architecture, Code Review, etc.):**
- Separate the technical decision from the relationship
- "You can disagree on the approach and still respect each other"
- Solution: RFC process, tech lead decision, A/B test approach

**Communication Style Clash:**
- "You're both right from your perspectives"
- Solution: Discuss communication preferences explicitly
- Example: "I need direct feedback" vs "I need context first"

**Ego / Being Right:**
- Redirect to team outcomes: "How does this serve our users/team?"
- "Being right isn't as important as being effective together"

**Code Review Friction:**
- Review the team's code review guidelines
- Solution: Pair program more, async review less
- Separate nit-picks from blockers

**Personality Conflict:**
- "You don't have to be friends, but you do need to work together professionally"
- Solution: Minimize collaboration, clear interfaces

## 4. Post-Mediation Actions

**Immediate (Same Day):**
- [ ] Document agreements in writing
- [ ] Email summary to both engineers (they approve it first)
- [ ] Schedule 2-week check-in
- [ ] Inform skip-level manager if appropriate

**First Week:**
- [ ] Observe interactions in standups, PRs, Slack
- [ ] Check in individually with each engineer
- [ ] Adjust if needed

**Two Week Follow-Up:**
- [ ] "How are things going between you two?"
- [ ] "Have the agreements been kept?"
- [ ] "What's better? What still needs work?"

## 5. If Conflict Persists

**Escalation Steps:**
1. **Week 1-2**: Active mediation and coaching
2. **Week 3-4**: More structured interventions (separate projects, explicit agreements)
3. **Week 5+**: Consider team changes (one person moves teams)

**When to Separate:**
- Conflict impacts team velocity significantly
- Other team members are being affected
- Both engineers have tried and it's not improving
- Personal animosity that won't resolve

**How to Separate:**
- Frame as "better fit" not "failure"
- Give choice to both engineers if possible
- Make it about team health, not blame

## 6. Prevention for Future

**Process Improvements:**
- [ ] Update code review guidelines
- [ ] Add "communication preferences" to team docs
- [ ] Create RFC process for technical decisions
- [ ] Regular team retros to catch issues early

**Team Culture:**
- Model respectful disagreement yourself
- Praise collaborative problem-solving publicly
- Discuss conflict resolution skills in 1-on-1s

## 7. Sample Phrases for Mediation

**To Show You're Neutral:**
- "I'm here to help you both, not to take sides"
- "You're both valuable team members"

**To De-Escalate:**
- "Let's focus on the problem, not the person"
- "I hear frustration. Take a breath. Let's continue"

**To Find Solutions:**
- "What would 'good' look like for both of you?"
- "How can we make this work for everyone?"

**To Hold Accountable:**
- "We've agreed on these actions. I'll check in to make sure they happen"
- "If this doesn't improve, we'll need to make different changes"

**Tone Throughout:**
- Calm and neutral
- Empathetic but firm
- Solution-focused
- Clear about expectations`,
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
    id: 'conflict-res-002',
    title: 'Resolve Product-Engineering Tension',
    description: 'Framework for mediating conflicts between Product and Engineering teams over priorities, scope, or delivery.',
    category: 'general',
    role: 'engineering-manager',
    pattern: 'template',
    tags: ['conflict-resolution', 'product', 'planning', 'facilitation', 'communication', 'leadership'],
    isPublic: true,
    content: `You are mediating a conflict between Product and Engineering. Generate a structured resolution plan:

**Conflict Context:**
- Product Lead: [Name]
- Engineering Lead: [Name/You]
- Issue Type: [Scope creep / Missed deadlines / Quality vs Speed / Communication / Priorities / Other]
- Project: [What project is this about?]
- Stakeholder Impact: [Who's being affected?]

**Current Tension:**
- Product's complaint: [e.g., "Engineering is too slow and says no to everything"]
- Engineering's complaint: [e.g., "Product keeps changing requirements and doesn't understand technical complexity"]

**Generate a resolution framework:**

## 1. Diagnose the Root Cause

**Common Patterns:**

**Symptom: "Engineering is too slow"**
- Root cause: Unrealistic expectations? Tech debt? Poor estimation? Scope creep?

**Symptom: "Product keeps changing requirements"**
- Root cause: Unclear strategy? Customer feedback loop? Market pressure?

**Symptom: "We don't respect each other's expertise"**
- Root cause: Communication breakdown? Past conflicts? Lack of trust?

**Your Diagnosis:**
- Primary issue: [What's really going on?]
- Contributing factors: [What makes this worse?]
- Trigger events: [What sparked this tension now?]

## 2. Joint Problem-Solving Session (90 mins)

**Pre-Work (Send Before Meeting):**
- Each side prepares: "What we need from the other team to be successful"
- Focus on needs, not blame

**Opening (10 mins):**
"We're here to make Product + Engineering partnership stronger. We're on the same team - we both want to ship great products for users. Let's find a better way to work together."

**Ground Rules:**
- Assume positive intent
- We're solving a process problem, not assigning blame
- Focus on future, not rehashing past
- Both sides have valid constraints and concerns

**Each Side Presents (15 mins each):**

**Product Perspective:**
- Business constraints and pressures
- User needs and market timing
- What's hard about working with Engineering
- What would help

**Engineering Perspective:**
- Technical constraints and reality
- Quality and velocity tradeoffs
- What's hard about working with Product
- What would help

**Find Common Ground (15 mins):**
- "What do we agree on?"
- Shared goals: User value, business impact, sustainable pace, team health
- "We're both under pressure and doing our best"

**Root Cause Analysis (15 mins):**
- "Why does this keep happening?"
- Process gaps: Planning? Communication? Expectations?
- People gaps: Trust? Understanding? Respect?

**Co-Create Solutions (25 mins):**
- "What would great Product-Eng partnership look like?"
- Brainstorm concrete changes
- Prioritize top 3-5 improvements

**Action Plan (10 mins):**
- Write down specific agreements
- Assign owners and deadlines
- Schedule follow-up (2 weeks)

## 3. Common Solutions by Issue Type

**Issue: Scope Creep / Changing Requirements**

**Solutions:**
- Agree on "Requirements Freeze Date" before each sprint
- After freeze: New requests → next sprint (unless P0 incident)
- Product writes clear acceptance criteria up front
- Engineering reviews before committing to sprint

**Process:**
- [ ] Create template for requirements (GIVEN/WHEN/THEN, edge cases, scope)
- [ ] Set up weekly roadmap review (look ahead 3 sprints)
- [ ] PM attends sprint planning to answer questions

**Issue: Missed Deadlines / "Engineering is Slow"**

**Solutions:**
- Involve Engineering earlier in scoping (before committing dates)
- Break down epics into smaller, shippable increments
- Reserve 20% capacity for unknowns and tech debt
- Communicate blockers earlier

**Process:**
- [ ] Introduce RFC process for large projects (Engineering estimates complexity)
- [ ] Weekly PM-EM sync on project health (traffic lights: green/yellow/red)
- [ ] Retrospective after each major release (what slowed us down?)

**Issue: Quality vs Speed Tradeoffs**

**Solutions:**
- Define "quality bar" explicitly (when is it good enough to ship?)
- Agree on MVP vs. full-featured version up front
- Engineering proposes phased rollout if quality concerns

**Process:**
- [ ] Create quality checklist (security, performance, UX, edge cases)
- [ ] PM and EM jointly decide: MVP now or full-featured later?
- [ ] Track technical debt in backlog, pay it down 20% of sprints

**Issue: Communication Breakdown**

**Solutions:**
- Daily standup for project team (PM + Eng + Design)
- Shared Slack channel for project
- PM shadows Engineering for a day, Eng shadows PM meetings

**Process:**
- [ ] Weekly 30-min PM-EM sync (before sprint planning)
- [ ] Monthly PM All-Hands (Engineering invited to understand roadmap)
- [ ] Quarterly PM-Eng offsites (build relationships)

## 4. Explicit Working Agreements

**Create a "PM-Eng Partnership Charter":**

**What Product Commits To:**
- Requirements ready 2 days before sprint planning
- Attend sprint planning and daily standups
- Respond to Engineering questions within 4 hours
- Accept Engineering's complexity estimates
- Shield team from thrash during sprint

**What Engineering Commits To:**
- Involve PM in technical decisions that affect scope/timeline
- Communicate blockers immediately, not at sprint review
- Propose solutions, not just say "no"
- Meet commitments or communicate early if at risk
- Keep technical jargon to minimum in updates

**Shared Commitments:**
- No surprises - communicate bad news early
- Assume positive intent
- Disagree and commit once decision is made
- Celebrate wins together

## 5. Ongoing Maintenance

**Weekly (Every Sprint):**
- [ ] PM-EM 30-min sync (health check, look ahead)
- [ ] Project status update (Slack or doc)

**Monthly:**
- [ ] Review working agreements (still working?)
- [ ] Celebrate what went well
- [ ] Address small issues before they become big

**Quarterly:**
- [ ] PM-Eng retrospective (what's better? what's not?)
- [ ] Update partnership charter if needed
- [ ] Plan team-building activity

## 6. When to Escalate

**Escalate to Directors/VPs if:**
- Conflict persists after 4-6 weeks of trying
- Impacting multiple projects/teams
- People issues (personality conflicts) not process issues
- Need organizational change (headcount, priorities, structure)

**How to Escalate:**
- Present problem and what you've tried
- Recommend solution (team change, process change, etc.)
- Ask for specific help, not vague "fix this"

## 7. Sample Phrases for Mediation

**To Validate Both Sides:**
- "You're both right - Product needs speed and Engineering needs quality. Let's find the balance."
- "I understand Product's pressure from leadership, and Engineering's concern about tech debt."

**To Redirect from Blame:**
- "Let's focus on the process gap, not who's at fault"
- "We're all trying our best with the information we have"

**To Find Solutions:**
- "What would need to be true for this to work for both teams?"
- "If you could change one thing, what would most help?"

**To Hold Accountable:**
- "We've agreed on these changes. Let's try for 2 weeks and review"
- "If this isn't working, we'll adjust. But let's give it a real shot."

**Tone:**
- Neutral facilitator, not picking sides
- Optimistic about solutions
- Firm about accountability
- Collaborative, not authoritative`,
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
    id: 'conflict-res-003',
    title: 'Resolve Manager-Direct Report Conflict',
    description: 'Guide for Directors mediating conflicts between managers and their direct reports.',
    category: 'general',
    role: 'engineering-director',
    pattern: 'template',
    tags: ['conflict-resolution', 'leadership', 'management', '1-on-1s', 'feedback', 'coaching'],
    isPublic: true,
    content: `You are a Director mediating a conflict between a manager and their direct report. Generate a structured resolution approach:

**Conflict Context:**
- Manager: [Name/Role]
- Direct Report: [Name/Role]
- Issue Type: [Micromanagement / Lack of feedback / Communication style / Performance expectations / Career growth / Trust / Other]
- How you learned about it: [Direct report escalated / Manager asked for help / You observed / Other]
- Impact: [On report's performance, team morale, manager's effectiveness]

**What You Know:**
- Direct report's perspective: [Summary]
- Manager's perspective: [Summary]
- Your observations: [What you've seen]

**Generate a mediation plan:**

## 1. Initial Assessment (Skip-Level 1-on-1s)

**With Direct Report (Confidential):**

**Questions to Ask:**
- "Tell me what's been happening from your perspective"
- "How is this affecting your work and well-being?"
- "Have you discussed this directly with [Manager]?"
- "What have you tried to resolve it?"
- "What would you like to see change?"
- "Do you want to continue reporting to [Manager]?"

**Assess:**
- Severity: [Minor friction / Serious concern / Untenable situation]
- Report's contribution: [Are they also part of the problem?]
- Manager's awareness: [Do they know there's an issue?]
- Repairable: [Can this relationship be fixed?]

**With Manager (Confidential):**

**Questions to Ask:**
- "How do you think things are going with [Report]?"
- "What's working well? What's challenging?"
- "Have they shared any concerns with you?"
- "What's your assessment of their performance?"
- "What support do you need to manage them effectively?"

**Assess:**
- Manager's awareness: [Clueless / Aware but doesn't care / Trying but struggling]
- Management skills: [Lacking skills / Having bad day / Personality conflict]
- Willingness to change: [Defensive / Open / Eager to improve]

## 2. Decision Tree

**If Issue is Clear Mismanagement:**
- Coaching for manager (this is a development area)
- Monitor closely
- Consider moving report if manager doesn't improve

**If Issue is Communication Style Mismatch:**
- Facilitate conversation about preferences
- Both need to adapt
- Mediation meeting

**If Issue is Performance-Related:**
- Manager needs to document and address performance
- You support manager's decisions
- Report needs to hear feedback directly

**If Relationship is Irreparable:**
- Move report to different team
- Frame as "better fit" not "failure"
- No blame, just acknowledge mismatch

**Your Decision:**
- Path forward: [Mediation / Manager coaching / Move report / Other]
- Reason: [Why this approach]

## 3. Coaching the Manager (If Management Issue)

**Common Manager Mistakes:**

**Micromanagement:**
- Coach: "What outcome do you want? Focus on results, not methods"
- "You hired them for their expertise. Trust it"
- "Check-ins are good. Telling them exactly how is not"

**Lack of Feedback:**
- Coach: "Feedback is a gift. Give it early and often"
- "They can't read your mind. Be explicit"
- Role-play giving feedback with you

**Communication Style:**
- Coach: "Different people need different communication styles"
- "Ask them: 'How do you prefer to receive feedback?'"
- "Your way isn't the only way"

**Unclear Expectations:**
- Coach: "Have you told them exactly what success looks like?"
- "Write down expectations. Review together"
- "Check for understanding, not just agreement"

**Action Plan for Manager:**
- [ ] Specific behavior to change: [What to do differently]
- [ ] Timeline: [When to implement]
- [ ] You'll check in: [How you'll monitor]

## 4. Mediation Meeting (If Appropriate)

**Opening (5 mins):**
"I've spoken with both of you separately. My goal is to help you work together effectively. This is a confidential conversation to address some friction and find a better path forward."

**Ground Rules:**
- Listen to understand
- Speak about yourself, not assumptions about the other person
- Focus on behaviors and impact, not intent
- We're problem-solving, not blaming

**Manager Shares First (10 mins):**
- "What's your perspective on your working relationship?"
- "What are you trying to achieve as [Report]'s manager?"
- "What's been challenging?"

**Direct Report Shares (10 mins):**
- "What's been your experience working with [Manager]?"
- "What do you need from them to be successful?"
- "What would you like to be different?"

**Facilitate Understanding (15 mins):**
- "What did you hear from each other?"
- Point out common ground: Both want success, good work, etc.
- Name the core issue: "It sounds like the core issue is [X]"

**Co-Create Solutions (15 mins):**
- "What can each of you do differently?"
- Get specific commitments:
  - Manager: "I will [specific behavior change]"
  - Report: "I will [specific action]"
- Write it down and both agree

**Manager's Commitments (Examples):**
- "I'll give you more autonomy on [area]"
- "I'll provide feedback weekly, not save it all for 1-on-1"
- "I'll ask 'how can I help?' not 'why did you do it that way?'"

**Report's Commitments (Examples):**
- "I'll proactively update you on project status"
- "I'll ask questions earlier, not struggle in silence"
- "I'll give you feedback on what's working and what's not"

**Follow-Up (5 mins):**
- You'll check in with each in 2 weeks
- Monthly check-in for next quarter
- They should also talk directly if issues arise

## 5. Post-Mediation Monitoring

**Week 1-2:**
- Check in individually with each
- "How's it going? Are the agreements being kept?"
- Observe interactions if possible

**Month 1:**
- Skip-level 1-on-1 with report: "Better? Worse? Same?"
- 1-on-1 with manager: "What's improved? What's still hard?"
- Adjust plan if needed

**Month 2-3:**
- Spot-check: "Things still on track?"
- If not improving: Make a change

## 6. When to Move the Report

**Move Report to Different Manager If:**
- Tried mediation and coaching, still not working
- Report's performance suffering despite their efforts
- Manager isn't changing behavior
- Relationship has too much baggage to repair
- Both would be happier with change

**How to Handle the Move:**
- Frame as "better fit" with new team/manager
- No blame: "Sometimes personalities don't mesh. That's okay"
- New manager briefed on situation (context, not baggage)
- Original manager doesn't take it as failure (you coach them on this)

**Don't Move Report If:**
- Report is underperforming and would fail with any manager
- Moving them would set precedent ("escalate to Director to change managers")
- Manager is good and report is issue

## 7. When the Report is the Problem

**If Your Assessment is Report is Unreasonable:**
- Support your manager's decisions
- Coach manager on documenting and managing performance
- Don't undermine manager's authority
- Tell report: "I trust [Manager]'s judgment. Let's work on [specific behaviors]"

**Common Report Issues:**
- Wants promotion but not performing at level
- Doesn't accept feedback well
- Blames manager for their performance gaps
- Unrealistic expectations

**Your Role:**
- Support manager
- Coach report on accountability
- Don't rescue report from reasonable management

## 8. Sample Phrases

**To Validate Both:**
- "[Manager], I know you're trying to help the team succeed"
- "[Report], I hear that you want more autonomy and clearer feedback"

**To Redirect:**
- "Let's focus on specific behaviors we can change"
- "The past is past. What can we do differently going forward?"

**To Hold Accountable:**
- "We've agreed on these changes. I'll be checking in"
- "If this isn't better in a month, we'll make a different change"

**To Be Direct:**
- "This relationship isn't working. Let's find a solution"
- "You both have valid concerns. And you both need to change something"

**Tone:**
- Empathetic but firm
- No triangulation (don't be messenger between them)
- Clear about expectations
- Solution-focused`,
    isFeatured: false,
    views: 0,
    rating: 0,
    ratingCount: 0,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
];

