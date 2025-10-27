/**
 * Soft Skills Prompt Library
 * Ready-to-use prompts for improving soft skills
 */

import { SoftSkill } from '@/lib/constants/soft-skills';

export interface SoftSkillPrompt {
  id: string;
  skill: SoftSkill;
  title: string;
  description: string;
  prompt: string;
  example?: string;
  useCase: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const SOFT_SKILL_PROMPTS: SoftSkillPrompt[] = [
  // Email Writing
  {
    id: 'email-status-update',
    skill: 'email-writing',
    title: 'Professional Status Update Email',
    description: 'Write clear, concise status updates',
    prompt: `Write a professional status update email about [PROJECT/TASK].

Context:
- Current status: [PROGRESS]
- Blockers: [ISSUES]
- Next steps: [ACTIONS]
- Timeline: [DATES]

Make it:
- Clear and scannable
- Action-oriented
- Professional tone
- Include next steps`,
    useCase: 'Weekly updates, project status, manager 1:1s',
    difficulty: 'beginner',
  },
  {
    id: 'email-difficult-conversation',
    skill: 'email-writing',
    title: 'Difficult Conversation Email',
    description: 'Address sensitive topics professionally',
    prompt: `Help me write an email about [DIFFICULT TOPIC].

Situation: [CONTEXT]
Goal: [DESIRED OUTCOME]
Relationship: [WHO YOU'RE WRITING TO]

Make it:
- Empathetic and professional
- Clear about the issue
- Solution-focused
- Non-confrontational
- Actionable`,
    useCase: 'Missed deadlines, disagreements, feedback',
    difficulty: 'advanced',
  },
  {
    id: 'email-executive-summary',
    skill: 'email-writing',
    title: 'Executive Summary Email',
    description: 'Communicate complex topics to leadership',
    prompt: `Write an executive summary email about [TOPIC] for [EXECUTIVE/LEADERSHIP].

Key points:
- Problem: [ISSUE]
- Impact: [BUSINESS IMPACT]
- Recommendation: [SOLUTION]
- Ask: [WHAT YOU NEED]

Format:
- TL;DR at top (2-3 sentences)
- 3 bullet points max
- Clear ask/decision needed
- Timeline
- Keep under 200 words`,
    useCase: 'Leadership updates, proposals, escalations',
    difficulty: 'advanced',
  },

  // Feedback
  {
    id: 'feedback-constructive',
    skill: 'feedback-giving',
    title: 'Give Constructive Feedback',
    description: 'Deliver feedback that helps people grow',
    prompt: `Help me give constructive feedback about [SITUATION].

Context:
- What happened: [BEHAVIOR/ACTION]
- Impact: [EFFECT ON TEAM/PROJECT]
- Relationship: [YOUR RELATIONSHIP TO PERSON]

Use SBI framework (Situation-Behavior-Impact):
1. Describe the situation objectively
2. Describe the specific behavior
3. Explain the impact
4. Suggest improvement
5. Offer support

Make it:
- Specific, not general
- About behavior, not person
- Actionable
- Supportive`,
    useCase: 'Code reviews, performance discussions, mentoring',
    difficulty: 'intermediate',
  },
  {
    id: 'feedback-request',
    skill: 'feedback-receiving',
    title: 'Request Specific Feedback',
    description: 'Ask for feedback that helps you grow',
    prompt: `Help me request feedback from [PERSON] about [TOPIC].

Context:
- What I'm working on: [PROJECT/SKILL]
- What I want to improve: [SPECIFIC AREA]
- Why their feedback matters: [THEIR EXPERTISE]

Make the request:
- Specific (not "any feedback?")
- Time-bound
- Easy to respond to
- Show you value their input`,
    useCase: '1:1s, after presentations, career development',
    difficulty: 'beginner',
  },

  // Presentation
  {
    id: 'presentation-technical',
    skill: 'presentation',
    title: 'Technical Presentation Structure',
    description: 'Present technical topics to non-technical audience',
    prompt: `Help me structure a presentation about [TECHNICAL TOPIC] for [AUDIENCE].

Content:
- Technical details: [WHAT YOU KNOW]
- Audience level: [TECHNICAL KNOWLEDGE]
- Time: [DURATION]
- Goal: [WHAT THEY SHOULD UNDERSTAND]

Structure:
1. Hook (why they should care)
2. Problem (business context)
3. Solution (high-level, no jargon)
4. Impact (metrics, benefits)
5. Next steps (clear actions)

Make it:
- Jargon-free
- Story-driven
- Visual-friendly
- Action-oriented`,
    useCase: 'Architecture reviews, demos, stakeholder updates',
    difficulty: 'advanced',
  },

  // Conflict Resolution
  {
    id: 'conflict-mediate',
    skill: 'conflict-resolution',
    title: 'Mediate Team Conflict',
    description: 'Navigate disagreements constructively',
    prompt: `Help me mediate a conflict about [ISSUE].

Situation:
- Parties involved: [WHO]
- Disagreement: [WHAT]
- Impact: [EFFECT ON TEAM]
- Your role: [YOUR POSITION]

Approach:
1. Acknowledge both perspectives
2. Find common ground
3. Focus on shared goals
4. Propose path forward
5. Get commitment

Make it:
- Neutral and fair
- Solution-focused
- Respectful
- Clear on next steps`,
    useCase: 'Technical disagreements, priority conflicts, team dynamics',
    difficulty: 'advanced',
  },

  // Negotiation
  {
    id: 'negotiation-salary',
    skill: 'negotiation',
    title: 'Salary Negotiation',
    description: 'Negotiate compensation professionally',
    prompt: `Help me negotiate [SALARY/RAISE/PROMOTION].

Context:
- Current: [CURRENT SITUATION]
- Market rate: [RESEARCH]
- Your value: [ACCOMPLISHMENTS]
- Ask: [WHAT YOU WANT]

Structure:
1. Express enthusiasm
2. Present market data
3. Highlight your impact
4. Make specific ask
5. Be open to discussion

Make it:
- Confident, not arrogant
- Data-driven
- Value-focused
- Professional`,
    useCase: 'Offers, raises, promotions, title changes',
    difficulty: 'advanced',
  },
  {
    id: 'negotiation-deadline',
    skill: 'negotiation',
    title: 'Negotiate Realistic Deadlines',
    description: 'Push back on unrealistic timelines',
    prompt: `Help me negotiate a more realistic deadline for [PROJECT].

Situation:
- Current deadline: [DATE]
- Realistic timeline: [YOUR ESTIMATE]
- Constraints: [BLOCKERS/DEPENDENCIES]
- Stakeholder: [WHO SET DEADLINE]

Approach:
1. Acknowledge their need
2. Explain constraints objectively
3. Propose alternatives
4. Show trade-offs
5. Get agreement

Make it:
- Solution-oriented
- Data-backed
- Collaborative
- Professional`,
    useCase: 'Project planning, sprint planning, urgent requests',
    difficulty: 'intermediate',
  },

  // Leadership
  {
    id: 'leadership-delegation',
    skill: 'delegation',
    title: 'Delegate Effectively',
    description: 'Assign work that empowers others',
    prompt: `Help me delegate [TASK/PROJECT] to [PERSON].

Context:
- Task: [WHAT NEEDS DONE]
- Person's level: [THEIR EXPERIENCE]
- Goal: [OUTCOME + THEIR GROWTH]
- Support available: [YOUR AVAILABILITY]

Include:
1. Clear outcome (not just task)
2. Context (why it matters)
3. Authority level (what they can decide)
4. Resources available
5. Check-in points
6. Success criteria

Make it:
- Empowering, not micromanaging
- Clear on expectations
- Growth-oriented
- Supportive`,
    useCase: 'Project assignments, skill development, scaling yourself',
    difficulty: 'advanced',
  },

  // Stakeholder Management
  {
    id: 'stakeholder-alignment',
    skill: 'stakeholder-management',
    title: 'Align Stakeholders',
    description: 'Get buy-in from multiple parties',
    prompt: `Help me align stakeholders on [DECISION/PROJECT].

Stakeholders:
- [NAME]: Cares about [PRIORITY]
- [NAME]: Cares about [PRIORITY]
- [NAME]: Cares about [PRIORITY]

Proposal: [YOUR RECOMMENDATION]

For each stakeholder:
1. What they care about
2. How this helps them
3. Their concerns
4. How you'll address concerns

Make it:
- Tailored to each person
- Win-win framing
- Risk-aware
- Action-oriented`,
    useCase: 'Project kickoffs, architecture decisions, priority changes',
    difficulty: 'advanced',
  },

  // Time Management
  {
    id: 'time-prioritization',
    skill: 'prioritization',
    title: 'Prioritize Competing Tasks',
    description: 'Focus on what matters most',
    prompt: `Help me prioritize these tasks:

Tasks:
- [TASK 1]: [DETAILS]
- [TASK 2]: [DETAILS]
- [TASK 3]: [DETAILS]

For each, evaluate:
1. Impact (high/medium/low)
2. Urgency (deadline)
3. Effort (hours)
4. Dependencies

Recommend:
- Priority order (with reasoning)
- What to do now
- What to schedule
- What to delegate/defer
- What to drop

Use Eisenhower Matrix (Urgent/Important)`,
    useCase: 'Sprint planning, daily planning, overwhelm',
    difficulty: 'intermediate',
  },

  // Mentoring
  {
    id: 'mentoring-career-advice',
    skill: 'mentoring',
    title: 'Give Career Advice',
    description: 'Guide someone\'s career development',
    prompt: `Help me mentor [PERSON] on [CAREER TOPIC].

Context:
- Their situation: [CURRENT STATE]
- Their goal: [WHERE THEY WANT TO GO]
- Timeline: [WHEN]
- Your experience: [RELEVANT BACKGROUND]

Provide:
1. Validate their goal
2. Share your experience
3. Identify skill gaps
4. Suggest concrete actions
5. Offer ongoing support

Make it:
- Empowering, not prescriptive
- Story-driven
- Actionable
- Encouraging`,
    useCase: '1:1s, career discussions, junior engineers',
    difficulty: 'advanced',
  },
];

/**
 * Get prompts for a specific soft skill
 */
export function getPromptsForSkill(skill: SoftSkill): SoftSkillPrompt[] {
  return SOFT_SKILL_PROMPTS.filter(p => p.skill === skill);
}

/**
 * Get prompts by difficulty
 */
export function getPromptsByDifficulty(difficulty: string): SoftSkillPrompt[] {
  return SOFT_SKILL_PROMPTS.filter(p => p.difficulty === difficulty);
}

/**
 * Search prompts by use case
 */
export function searchPromptsByUseCase(query: string): SoftSkillPrompt[] {
  const lowerQuery = query.toLowerCase();
  return SOFT_SKILL_PROMPTS.filter(p => 
    p.useCase.toLowerCase().includes(lowerQuery) ||
    p.title.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
}
