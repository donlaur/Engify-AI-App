/**
 * Facilitator Guide Prompt Templates
 * 90% complete guides for common facilitation scenarios
 */

import { PromptTemplate } from '@/lib/schemas/prompt';

export const facilitatorGuides: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '1-on-1 Meeting Facilitator Guide',
    description: 'Complete guide for running effective 1-on-1s with direct reports, including prep, agenda, and follow-up.',
    category: 'management',
    role: 'engineering-manager',
    pattern: 'craft',
    tags: ['1-on-1s', 'facilitation', 'management', 'feedback', 'coaching', 'career-development'],
    content: `You are preparing for a 1-on-1 meeting with a direct report. Generate a complete facilitation guide:

**Context:**
- Direct Report: [Name/Role/Level]
- Your Relationship: [New report / Long-term report / Struggling / High-performer]
- Last 1-on-1: [Date - how long ago?]
- Current Projects: [What they're working on]
- Recent Events: [Any significant events: launch, incident, feedback, etc.]

**Generate a comprehensive 1-on-1 guide:**

## 1. Pre-Meeting Preparation (15 mins before)

**Review:**
- [ ] Notes from last 1-on-1 (action items completed?)
- [ ] Recent work: PRs, project updates, team feedback
- [ ] Any concerning signals: missed deadlines, quiet in meetings, team feedback
- [ ] Career development goals and progress
- [ ] Feedback you need to give (positive or constructive)

**Your Mindset:**
- This is THEIR meeting, not yours
- Listen 80%, talk 20%
- Be present (close Slack, turn off notifications)
- Curious, not interrogating

**Prepare Questions:**
- [ ] Open-ended questions about their work and well-being
- [ ] Follow-ups on previous conversations
- [ ] Career development check-in

## 2. Meeting Structure (30-45 mins)

### Opening (2-3 mins)

**Check-In:**
- "How are you doing?" [Pause. Really listen]
- "What's on your mind today?"
- "What would be most helpful to talk about?"

**If They Say "Nothing Much":**
- "That's great! Let me share what I wanted to cover, and we can also use this as open time"

### Their Topics (20-25 mins)

**Let Them Lead:**
- "What's top of mind for you this week?"
- [Listen actively, take notes]
- [Ask follow-up questions]

**Common Topics They Might Raise:**

**If They Discuss Project Progress:**
- "What's going well?"
- "What's blocking you?"
- "How can I help remove blockers?"
- "Do you have what you need to be successful?"

**If They Discuss Team Dynamics:**
- "Tell me more about that"
- "How is that affecting you?"
- "What would you like to see change?"
- "Have you talked to [person] directly?"

**If They Discuss Career/Growth:**
- "What skills do you want to develop?"
- "What opportunities interest you?"
- "What would make you feel challenged and engaged?"
- "Let's map out next steps"

**If They Seem Stressed/Burnt Out:**
- "What's contributing to that feeling?"
- "What would help you feel more balanced?"
- "Is the workload sustainable?"
- "What can I take off your plate?"

**Red Flags to Probe Deeper:**
- Vague answers ("everything's fine")
- Lack of engagement or energy
- Mentions of wanting to learn X (might be job hunting signal)
- Conflicts with teammates mentioned casually

### Your Topics (10-15 mins)

**Feedback (Always Include):**

**Positive Feedback:**
- "I wanted to call out [specific thing they did well]"
- "I appreciated how you [specific behavior]"
- "[Person] mentioned [specific positive feedback]"
- Impact: "This helped the team by [specific impact]"

**Constructive Feedback:**
- "I wanted to discuss [specific situation]"
- Describe behavior, not judgment: "In the meeting, I noticed [specific behavior]"
- Impact: "This affected [team/project/person] by [specific impact]"
- Ask: "What's your perspective on this?"
- Collaborate: "How can we make this better?"
- Support: "What do you need from me?"

**Updates/Context Sharing:**
- Company news that affects them
- Team changes or priorities
- Appreciation from leadership or other teams

**Action Items from Last Meeting:**
- "Let's review what we committed to last time"
- [Check status of each item]
- [Update or close out completed items]

### Closing (3-5 mins)

**Summary:**
- "Let's recap what we discussed"
- "Action items: [list them]"
- "Anything else before we wrap?"

**Schedule Next One:**
- "Same time next week?"
- [If something urgent: "Want to sync sooner?"]

**End on Positive Note:**
- "Thanks for sharing [something they opened up about]"
- "I'm excited about [something they're working on]"
- "I'm here if anything comes up before our next 1-on-1"

## 3. Post-Meeting Actions (5 mins after)

**Document Notes:**
- [ ] Key discussion topics
- [ ] Action items (yours and theirs)
- [ ] Follow-ups needed
- [ ] Career development progress
- [ ] Any concerns or patterns
- [ ] Positive feedback to remember for reviews

**Follow Through:**
- [ ] Send summary of action items (if commitments made)
- [ ] Complete your action items promptly
- [ ] Flag any urgent issues to your manager or HR

## 4. Question Bank by Topic

**Project/Work:**
- "What are you most excited about working on?"
- "What's frustrating you?"
- "Is anything blocking you that I can help with?"
- "Are you clear on priorities?"
- "Do you have the right scope? Too much? Too little?"

**Team/Collaboration:**
- "How are things going with the team?"
- "Who have you enjoyed working with recently?"
- "Any friction I should know about?"
- "Are you getting the support you need from teammates?"

**Career/Growth:**
- "What have you learned recently?"
- "What skills do you want to develop?"
- "What's the next role you're interested in?"
- "What would a great next 6 months look like for you?"
- "Am I giving you opportunities to grow?"

**Well-being/Balance:**
- "How's your workload?"
- "Are you able to take time off and disconnect?"
- "What's your energy level like?"
- "Is there anything making work harder than it needs to be?"

**Manager Feedback (Ask Regularly):**
- "What can I do better as your manager?"
- "Am I giving you the right level of support?"
- "Is there anything I'm doing that's not helpful?"
- "What would make our 1-on-1s more valuable?"

## 5. Common Scenarios & How to Handle

**Scenario: They Have Nothing to Talk About**
- Use your prepared questions
- Share context on team/company
- Make it career development focused
- Shorter meeting is OK sometimes

**Scenario: They're Venting**
- Let them vent (they need to be heard)
- Empathize: "That sounds frustrating"
- Then shift to problem-solving: "What would help?"
- Take action on fixable things

**Scenario: You Need to Give Hard Feedback**
- Don't save it all for review time
- Be direct but empathetic
- Specific examples, not generalities
- Focus on behavior, not character
- Collaborate on improvement plan

**Scenario: They're Thinking of Leaving**
- Don't panic or get defensive
- Understand why: "What's making you consider other options?"
- Ask: "What would make you want to stay?"
- Be honest: Can you address their concerns?
- Support their decision either way

**Scenario: They Want a Promotion**
- Be honest about timeline and requirements
- "Here's what the next level looks like: [specifics]"
- "Here's the gap I see: [specific skills/scope]"
- Create plan to close the gap
- Set expectations on timing

**Scenario: Conflict with Teammate**
- Hear their side completely
- Ask: "Have you talked to them directly?"
- Offer to mediate if needed
- Don't take sides without full picture
- Follow up in future 1-on-1s

## 6. Red Flags to Watch For

**Signs of Disengagement:**
- Consistently short answers
- Lack of enthusiasm about work
- Not proactively bringing up topics
- Missed 1-on-1s or wanting to skip

**Signs of Burnout:**
- Talk of being tired/overwhelmed
- Working long hours regularly
- Not taking time off
- Decreased quality of work

**Signs of Job Searching:**
- Asking about career development suddenly
- Mentions of wanting to learn [skill outside current role]
- Less engaged in long-term planning
- Asking about reference policy

**Action:** Don't ignore red flags. Address directly with care.

## 7. 1-on-1 Anti-Patterns (Avoid These)

**❌ Making it a status update:**
- Use async updates for project status
- 1-on-1s are for coaching, career, relationships

**❌ Talking more than listening:**
- You should listen 80%
- Ask questions, don't lecture

**❌ Only discussing work:**
- Check in on how they're doing as a person
- Career goals matter too

**❌ Canceling frequently:**
- Shows they're not a priority
- Reschedule, don't cancel

**❌ Not taking notes:**
- You'll forget commitments
- Shows you're not really listening

**❌ Saving all feedback for reviews:**
- Feedback should be continuous
- No surprises in reviews

## 8. Frequency & Format

**Weekly 1-on-1s (Recommended):**
- 30 mins minimum
- Consistent day/time
- In-person or video (not Slack)
- Private space

**Exceptions:**
- New reports: Maybe twice weekly for first month
- Senior/autonomous reports: Bi-weekly OK if they prefer
- During intense project: Daily check-ins instead

**Never:**
- Monthly or less (too infrequent)
- Via email/Slack (not real conversation)
- In public spaces (not safe for honest conversation)

## 9. Sample 1-on-1 Note Template

**Date:** [Date]
**Attendees:** [Your name] + [Report name]

**Their Topics:**
- [Topic 1]: [Key points and discussion]
- [Topic 2]: [Key points]

**My Topics:**
- Feedback: [What I shared]
- Context: [Company/team updates shared]

**Action Items:**
- [ ] [Their name]: [Action item] - Due: [Date]
- [ ] [Your name]: [Action item] - Due: [Date]

**Career Development:**
- Skills to develop: [Current focus]
- Opportunities: [What's coming up]

**Notes for Next Time:**
- Follow up on: [Topic to revisit]
- Watch for: [Any concerns]

**Mood/Engagement:** [1-5 scale and notes]

## 10. Making 1-on-1s Great

**Your Commitment:**
- Show up prepared and present
- Protect this time (don't cancel or reschedule unless emergency)
- Listen more than you talk
- Follow through on commitments
- Care about them as people, not just workers

**Encourage Them:**
- "This is YOUR time. Come with topics"
- "I'm here to support you. Tell me what you need"
- Share your notes template so they can prepare

**Continuous Improvement:**
- Ask for feedback on 1-on-1s quarterly
- Adjust format based on their needs
- Celebrate when something from 1-on-1 leads to positive change

**Remember:** Great 1-on-1s build trust, catch problems early, and help people grow. They're the most important hour of your week.`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },

  {
    title: 'Sprint Retrospective Facilitator Guide',
    description: 'Complete retro facilitation guide with agenda, activities, and follow-through plan.',
    category: 'management',
    role: 'engineering-manager',
    pattern: 'craft',
    tags: ['retros', 'facilitation', 'agile', 'team-building', 'process-improvement'],
    content: `You are facilitating a sprint retrospective. Generate a complete facilitation guide:

**Context:**
- Team: [Team name]
- Sprint: [Sprint number/name]
- Sprint Dates: [Start - End]
- Team Size: [Number of people]
- Recent Context: [Major launches, incidents, changes, etc.]
- Last Retro: [Key outcomes from previous retro]

**Generate a comprehensive retro facilitation guide:**

## 1. Pre-Retro Preparation (30 mins before)

**Setup:**
- [ ] Book 60-90 minute meeting
- [ ] All team members invited (engineering, PM, design)
- [ ] Retro board ready (Miro/FigJam/Retrium or physical board)
- [ ] Previous action items ready to review
- [ ] Sprint metrics ready (velocity, bugs, incidents)

**Choose Retro Format:**
(Rotate formats to keep engagement high)

**Format Options:**
- **Start/Stop/Continue** (Classic, good for new teams)
- **Mad/Sad/Glad** (Good for emotional check-in)
- **What Went Well / What Didn't / What to Try** (Balanced)
- **Sailboat** (Wind=helps us, Anchors=slows us, Rocks=risks)
- **4Ls** (Liked, Learned, Lacked, Longed For)
- **Timeline** (Map events of sprint chronologically)

**Recommended:** Rotate between 2-3 formats. Use timeline format after major incidents or complex sprints.

**Your Mindset:**
- Facilitate, don't dominate
- Everyone's voice matters
- Focus on what team can control
- Safe space for honesty
- Action-oriented, not just venting

## 2. Retro Structure (60-90 mins)

### Part 1: Set the Stage (5 mins)

**Welcome:**
"Thanks everyone for being here. This is our time to reflect on the sprint and improve as a team."

**Prime Directive (Read Aloud):**
"Regardless of what we discover, we understand and truly believe that everyone did the best job they could, given what they knew at the time, their skills and abilities, the resources available, and the situation at hand."

**Retro Rules:**
- What's said here stays here (confidentiality)
- No blame, focus on systems and processes
- Specific examples, not vague complaints
- Everyone participates
- Focus on what we can control

**Today's Format:**
"We're using [format]. Here's how it works: [explain briefly]"

### Part 2: Review Previous Action Items (5 mins)

**Check Status:**
"Let's quickly review action items from last retro"

For each item:
- ✅ Done - Celebrate! What impact did it have?
- 🔄 In Progress - Keep going? Adjust?
- ❌ Didn't Happen - Why not? Still needed?

**Key Point:**
- If we keep not doing action items, we need smaller/simpler actions
- Or we're picking the wrong things to improve

### Part 3: Gather Data (15-20 mins)

**Silent Brainstorming:**
"Take 10 minutes to add your thoughts to the board. Be specific - use examples."

**Prompts for [Format = Start/Stop/Continue]:**
- **Start:** What should we start doing?
- **Stop:** What should we stop doing?
- **Continue:** What's working well that we should keep?

**While Team is Adding Items:**
- Add your own items too
- Group similar items together
- Notice patterns or themes

**After Brainstorming:**
"Let's quick read through everything. Speak up if your item needs clarification."

### Part 4: Generate Insights (20-25 mins)

**Dot Voting (5 mins):**
"Everyone gets 3 votes. Vote for items most important to discuss."
[Use retro tool's voting feature or have people add dots]

**Discuss Top Items (15-20 mins):**

**For Each High-Vote Item:**
1. **Clarify:** "Who added this? Can you explain?"
2. **Explore:** "Who else has experienced this?"
3. **Dig Deeper:** "Why is this happening?"
4. **Impact:** "How does this affect us/users?"
5. **Ideas:** "What could we try?"

**Facilitation Tips:**

**If Discussion is Vague:**
- "Can you give a specific example?"
- "When did this happen?"

**If Blaming Individual:**
- "Let's focus on the process/system that allowed this"
- "What could prevent this in future?"

**If Going Off Track:**
- "That's important. Let's add it to parking lot and come back if time"

**If Someone is Silent:**
- "Alex, you worked on that feature. What was your experience?"

**If Discussion is Stuck:**
- "Let's timebox this. 3 more minutes then move on"

### Part 5: Decide What to Do (10-15 mins)

**Generate Action Items:**
"What are the top 2-3 things we'll commit to trying?"

**Good Action Items:**
- ✅ Specific (not "communicate better")
- ✅ Actionable (clear owner)
- ✅ Timebound (complete by when)
- ✅ Measurable (how we'll know it's done)

**Example Good Action Items:**
- ✅ "PM will send requirements 2 days before sprint planning (Owner: Sarah, Start: Next sprint)"
- ✅ "Add tech debt ticket for [X] and prioritize in next sprint (Owner: Team lead, Due: This week)"
- ✅ "Weekly 30-min spike time for investigating [Y] (Owner: Mike + Jane, Start: Next week)"

**Example Bad Action Items:**
- ❌ "Improve code quality" (too vague)
- ❌ "Stop having bugs" (not actionable)
- ❌ "Be better at planning" (no owner or timeline)

**Limit to 2-3 Action Items:**
- More than 3 = nothing gets done
- If everything is important, nothing is important

**Get Commitment:**
- "Can [owner] commit to doing this?"
- "Does everyone agree this is a priority?"

### Part 6: Close (5 mins)

**Summary:**
"We discussed [key themes]. We're going to try [action items]. Thanks for your honesty and energy."

**Retro Feedback (Quick):**
- "Thumbs up/down: Was this retro valuable?"
- [If lots of thumbs down, ask: "What would make next one better?"]

**Appreciations (If Time):**
"Let's do quick appreciations. Shout out someone who helped you this sprint."

**End Positively:**
"Great sprint. Excited for next one!"

## 3. Post-Retro Actions (15 mins after)

**Document:**
- [ ] Create action items in tracking system (Jira/Linear/etc)
- [ ] Assign owners and due dates
- [ ] Share retro summary in Slack/email

**Follow Through:**
- [ ] Check action item progress in standups
- [ ] Review at next retro
- [ ] Celebrate when things improve!

**Share with Stakeholders:**
- [ ] High-level summary to leadership (if requested)
- [ ] Keep team discussions confidential

## 4. Common Retro Challenges & Solutions

**Challenge: Same Issues Every Retro**
- **Why:** Action items not being completed or not addressing root cause
- **Solution:** Go deeper on root cause. Smaller, simpler action items. Hold team accountable.

**Challenge: One Person Dominates**
- **Why:** Loud voices, hierarchy, personality
- **Solution:** Silent brainstorming first. "Let's hear from people who haven't spoken yet." Use async retro tool.

**Challenge: Retro Feels Like Waste of Time**
- **Why:** No action items followed through, or only surface-level discussion
- **Solution:** Review and actually complete action items. Go deeper on important issues. Keep retros crisp (60 mins max).

**Challenge: People Don't Participate**
- **Why:** Don't feel safe, checked out, too tired, don't see value
- **Solution:** Build psychological safety (read Prime Directive!). Vary formats. Make it engaging. Actually act on feedback.

**Challenge: Retro Becomes Complaining Session**
- **Why:** Legitimate frustration needs venting, but then stuck there
- **Solution:** Validate feelings, then redirect: "What can WE do about this?" Focus on what team controls.

**Challenge: Manager/Lead in Room Makes People Cautious**
- **Why:** Power dynamics, fear of repercussions
- **Solution:** Manager speaks last or not at all. Create safe space explicitly. Sometimes do retro without manager.

## 5. Retro Formats Explained

**Format 1: Start/Stop/Continue (Simple & Effective)**
- Start: What should we start doing?
- Stop: What should we stop doing?
- Continue: What's working well?

**When to Use:** New teams, straightforward sprints

**Format 2: Mad/Sad/Glad (Emotion-Focused)**
- Mad: What frustrated you?
- Sad: What disappointed you?
- Glad: What made you happy?

**When to Use:** After tough sprint, need emotional check-in

**Format 3: Sailboat (Visual & Fun)**
- Wind: What's pushing us forward?
- Anchors: What's slowing us down?
- Rocks: What risks are ahead?
- Island: Our goal

**When to Use:** Mid-project, planning next quarter

**Format 4: Timeline (Detailed)**
- Map out sprint chronologically
- Mark events: 🟢 Good, 🔴 Bad, 🟡 Interesting
- Discuss patterns

**When to Use:** After incidents, complex sprints

**Format 5: 4Ls**
- Liked: What did you enjoy?
- Learned: What did you learn?
- Lacked: What was missing?
- Longed For: What do you wish we had?

**When to Use:** Growth-focused teams, after learning spike

## 6. Metrics to Review (Optional)

**Sprint Metrics:**
- Velocity (completed points)
- Sprint goal achieved? Y/N
- Carryover stories
- Bugs found/fixed
- Production incidents

**Team Health:**
- Mood check (1-5 scale)
- Workload (sustainable? burning out?)
- Collaboration quality

**Don't Obsess Over Metrics:**
- Use to prompt discussion, not judge team
- Trends matter more than single sprint
- Metrics don't tell full story

## 7. Remote Retro Best Practices

**Tools:**
- Miro, FigJam, Retrium, EasyRetro, Google Jam board

**Tips:**
- Turn on cameras (more engagement)
- Use timer (keeps moving)
- Use retro tool's voting feature
- Take breaks (90 mins is long on video)
- Async component: Pre-add items before meeting

**Engagement:**
- Use polls, reactions, emojis
- Breakout rooms for larger teams
- Virtual backgrounds with theme (fun!)

## 8. Retro Anti-Patterns (Avoid)

**❌ Skipping retros:**
- "We're too busy" = We're too busy to improve (recipe for disaster)

**❌ Same format every time:**
- Gets stale, disengages team

**❌ No action items:**
- Retro becomes complaint session with no outcome

**❌ Action items not followed through:**
- Team stops trusting the process

**❌ Only focusing on negatives:**
- Demoralizing. Celebrate wins too!

**❌ Manager dominates:**
- Team doesn't feel safe sharing

**❌ Too long:**
- Attention drops after 90 mins

## 9. Sample Retro Summary Email

**Subject:** Sprint [X] Retro Summary

**Team,**

Thanks for a great retro today! Here's our summary:

**What Went Well:**
- [Highlight 2-3 positive things]
- [Team win to celebrate]

**Areas to Improve:**
- [2-3 key themes from discussion]

**Action Items:**
1. [Action item 1] - Owner: [Name] - Due: [Date]
2. [Action item 2] - Owner: [Name] - Due: [Date]
3. [Action item 3] - Owner: [Name] - Due: [Date]

We'll review progress in standup and at next retro.

**Next Retro:** [Date/Time]

Let me know if you have questions!

[Your Name]

## 10. Making Retros Great

**Your Role as Facilitator:**
- Create psychological safety
- Keep discussion focused and moving
- Draw out quiet voices
- Redirect blame to systems thinking
- Ensure action items are committed to

**Team's Responsibility:**
- Come prepared (think about sprint beforehand)
- Participate honestly
- Focus on improvement, not blame
- Complete action items

**Measure Success:**
- Team looks forward to retros (not dreads them)
- Action items get completed
- Same issues don't repeat every sprint
- Team grows and improves over time

**Remember:** A great retro is the foundation of a learning, improving team. Protect this time and make it valuable!`,
    isFeatured: true,
    views: 0,
    rating: 0,
    ratingCount: 0,
  },
];

