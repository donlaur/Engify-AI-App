

export interface PlaybookRecipe {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export interface PlaybookCategory {
  id: string;
  title: string;
  recipes: PlaybookRecipe[];
}

export const playbookCategories: PlaybookCategory[] = [
  {
    id: 'planning',
    title: 'Developer: Planning & Design',
    recipes: [
      {
        id: 'ticket-breakdown',
        title: 'Jira Ticket Breakdown',
        description: 'Breaks down a feature request or bug report into actionable steps, questions, and potential edge cases.',
        prompt: `Act as a senior software engineer. I'm about to start work on the following ticket. Your task is to help me plan my approach.

Analyze the ticket description below and provide the following:
1.  **Clarifying Questions:** A list of questions I should ask the Product Manager or designer to resolve ambiguities.
2.  **Implementation Steps:** A high-level, step-by-step plan to implement the feature.
3.  **Potential Edge Cases:** A list of edge cases I need to consider and test for.
4.  **Key Files to Investigate:** Suggest files or modules in a typical web application codebase that I might need to modify.

--- TICKET DESCRIPTION ---
[Paste your Jira ticket description here]`,
      },
      {
        id: 'solution-brainstorm',
        title: 'Brainstorm Technical Solutions',
        description: 'Generates multiple technical approaches for a given problem, listing the pros and cons of each.',
        prompt: `Act as a staff engineer. I need to solve the following problem. Please brainstorm 3 different technical solutions. For each solution, provide a brief description, a list of pros, and a list of cons.

--- PROBLEM STATEMENT ---
[Describe the technical problem you need to solve, e.g., "We need to implement a real-time notification system for our users."]"`,
      },
      {
        id: 'crafted-prompt-design',
        title: 'Design a C.R.A.F.T.E.D. Prompt',
        description: 'Guides you through the C.R.A.F.T.E.D. framework to create a high-quality, comprehensive prompt for any task.',
        prompt: `Act as a prompt engineering expert. I need to create a detailed prompt for a specific task. Guide me through the C.R.A.F.T.E.D. framework by asking me questions for each section. After I provide my answers, synthesize them into a final, well-structured prompt.

**C.R.A.F.T.E.D. Framework:**
*   **C (Context):** What is the background information the AI needs?
*   **R (Role):** What persona should the AI adopt?
*   **A (Action):** What is the specific task the AI should perform?
*   **F (Format):** How should the output be structured (e.g., JSON, Markdown, list)?
*   **T (Tone):** What style of communication should the AI use (e.g., professional, empathetic, critical)?
*   **E (Examples):** What are some examples of the desired output?
*   **D (Definition of Done):** What criteria must the response meet to be considered complete?

Start by asking me for the **Context**.`,
      },
    ],
  },
  {
    id: 'coding',
    title: 'Developer: Coding & Refactoring',
    recipes: [
      {
        id: 'test-generator',
        title: 'Generate Unit Tests',
        description: 'Creates a suite of unit tests for a given function or code snippet, covering happy paths and edge cases.',
        prompt: `Act as a software engineer with a focus on Test-Driven Development (TDD). Write a suite of unit tests for the following code snippet using the [Jest/Pytest/Go testing/etc.] framework. Cover happy paths, edge cases, and error conditions.

--- CODE SNIPPET ---
[Paste your function or code snippet here]`,
      },
      {
        id: 'code-explainer',
        title: 'Explain Complex Code',
        description: 'Explains a piece of complex or legacy code in plain English, line by line.',
        prompt: `Act as a senior software engineer mentoring a junior developer. Explain the following code snippet to me. Go through it line by line and explain what it does, why it might be written this way, and any potential pitfalls or improvements.

--- CODE SNIPPET ---
[Paste the complex code snippet here]`,
      },
    ],
  },
    {
    id: 'leadership',
    title: 'Engineering Leaders & PMs',
    recipes: [
      {
        id: 'project-kickoff',
        title: 'Draft Project Kickoff Doc',
        description: 'Generates a structured project kickoff document (RFC/design doc) from a brief description.',
        prompt: `Act as an experienced Principal Engineer and Project Manager. I am kicking off a new project. Based on the initial details below, generate a draft for a project kickoff document. The document should include the following sections:
1. **Background:** Why are we doing this?
2. **Problem Statement:** What specific problem are we solving?
3. **Goals & Non-Goals:** What is in scope and what is explicitly out of scope?
4. **Proposed Solution:** A high-level overview of the technical approach.
5. **Initial Risk Assessment:** What are the potential risks (technical, product, timeline)?
6. **Key Stakeholders:** Who needs to be involved or informed?

--- INITIAL DETAILS ---
[Provide a 2-3 sentence description of the project, its goal, and key stakeholders.]`
      },
      {
        id: '1-on-1-prep',
        title: 'Prepare for a 1:1 Meeting',
        description: 'Creates a structured agenda with talking points for an upcoming 1:1 meeting with a direct report.',
        prompt: `Act as a thoughtful Engineering Manager. I have an upcoming 1:1 meeting with one of my direct reports. Help me prepare an agenda. Based on the context below, suggest 3-4 key talking points and open-ended questions to facilitate a productive conversation about their career growth, current projects, and well-being.

--- CONTEXT ---
- **Report's Name:** [Name]
- **Their recent accomplishments:** [e.g., "Successfully launched the new billing feature"]
- **Their recent challenges:** [e.g., "Struggling with a legacy part of the codebase"]
- **Their stated career goals:** [e.g., "Wants to move into a tech lead role"]`
      },
       {
        id: 'pr-description-comm',
        title: 'Write a PR Description',
        description: 'Generates a clear and concise Pull Request description based on a summary of changes.',
        prompt: `Act as a senior software engineer who writes excellent, clear Pull Request descriptions. Based on the summary of my changes below, write a comprehensive PR description. The description should include:
1.  **What does this PR do?** (A high-level summary)
2.  **Why is this change needed?** (The problem it solves, link to Jira ticket)
3.  **How was this implemented?** (Brief technical overview)
4.  **How can this be tested?** (Step-by-step instructions for the reviewer)

--- SUMMARY OF CHANGES ---
[Briefly describe your changes, e.g., "Added a new button to the user profile page that allows them to export their data as a CSV. This involved creating a new API endpoint and a front-end component."]"`,
      },
      {
        id: 'technical-summary-comm',
        title: 'Summarize for Non-Technical Audience',
        description: 'Translates a technical update into a simple summary for stakeholders like Product Managers or executives.',
        prompt: `Act as an engineering manager communicating with non-technical stakeholders. Translate the following technical update into a clear, concise summary that focuses on user impact and business value. Avoid jargon.

--- TECHNICAL UPDATE ---
[Paste the technical update here, e.g., "We have successfully migrated the user authentication service from a monolithic architecture to a microservice. This involved refactoring the database schema and deploying a new service on Kubernetes."]"`,
      },
      {
        id: 'strategic-project-analysis',
        title: 'Strategic Project Analysis',
        description: 'Uses deep context from Jira, team structure, and business constraints to generate strategic recommendations for project planning.',
        prompt: `<role>
You are a senior project manager and resource planning specialist at a software company with access to current project data, team information, and resource allocation details. Your expertise includes analyzing project status, resource optimization, risk assessment, and timeline management. You should demonstrate deep knowledge of agile methodologies, team dynamics, and strategic business planning.
</role>

<context>
You are working at a company that is managing multiple concurrent projects and is operating under specific constraints (e.g., hiring freezes, budget allocations, critical business deadlines).

**Instructions:** Replace the bracketed content below with your actual data.

## Current Team Structure
\`\`\`json
[Paste your team structure JSON here. Example:
{
  "teams": {
    "frontend": { "lead": "Sarah Chen", "members": [...] },
    "backend": { "lead": "David Park", "members": [...] }
  }
}
]
\`\`\`

## Current Sprint Backlog (JIRA Data)
\`\`\`json
[Paste your current sprint backlog JSON here. Example:
{
  "sprint": { "name": "Q3 Feature Sprint", "status": "active" },
  "tickets": [
    { "key": "PROJ-1234", "summary": "Implement user auth", "priority": "High", "status": "In Progress", "storyPoints": 13 },
    { "key": "PROJ-1235", "summary": "Redesign dashboard", "priority": "Medium", "status": "To Do", "storyPoints": 8 }
  ]
}
]
\`\`\`

## Resource Allocation Matrix
\`\`\`json
[Paste your resource allocation matrix here.]
\`\`\`

## Historical Performance Metrics
\`\`\`json
[Paste your historical velocity and performance metrics here.]
\`\`\`

## Constraints and Business Context
[List your key constraints, e.g., budget, deadlines, compliance requirements.]

## Recent Stakeholder Feedback
[List recent feedback from key stakeholders, e.g., "The mobile app project seems to be falling behind." - Robert Johnson, Engineering Director]

</context>

<action>
Given the current project status, team availability, resource constraints, and business priorities, analyze the provided data and provide strategic recommendations including:

1. **Immediate Action Items**: Identify the top 3 actions that need to be taken this week to address the most critical issues.
2. **Resource Reallocation Recommendations**: Propose how to redistribute team members across projects to optimize delivery timelines while maintaining quality.
3. **Risk Mitigation Strategy**: Develop specific steps to address high-risk projects and blocked tickets.
4. **Timeline Adjustments**: Recommend realistic timeline adjustments for each project based on current velocity trends and constraints.
5. **Communication Plan**: Define key messages for stakeholders and present trade-offs involved in your recommendations.
</action>

<format>
Structure your response with clear headings for each of the 5 required sections. Use bullet points for action items and recommendations. Present resource allocation recommendations in a clear, tabular format when possible. Provide reasoning for each major recommendation. Keep the response comprehensive but concise, focusing on actionable insights rather than restating the provided data.
</format>

<tone>
Communicate with the authority and expertise of a senior project manager. Use professional, analytical language appropriate for executive-level stakeholders. Be direct about challenges and realistic about constraints while maintaining a solutions-focused approach. Balance optimism with a pragmatic assessment of risks and trade-offs.
</tone>`
      },
      {
        id: 'identify-bottlenecks',
        title: 'Identify Productivity Bottlenecks',
        description: 'Analyzes a description of a team\'s workflow to identify potential bottlenecks and suggests AI-powered improvements.',
        prompt: `Act as a senior engineering manager and process improvement expert. I'm going to describe my team's current software development lifecycle. Your task is to analyze this process, identify the top 3 potential bottlenecks that are likely slowing the team down, and for each bottleneck, suggest a practical way that AI could be used to alleviate it.

--- TEAM WORKFLOW DESCRIPTION ---
[Describe your team's process here. e.g., "We follow 2-week sprints. Planning is often slow because we struggle to break down large epics. Code reviews sometimes take several days because senior engineers are busy. Documentation is often an afterthought and written at the end of the sprint, which delays handoffs."]`,
      },
      {
        id: 'draft-job-description',
        title: 'Draft an Effective Job Description',
        description: 'Guides a hiring manager to create a compelling and inclusive job description for an open engineering role.',
        prompt: `Act as an expert technical recruiter and hiring manager. I need to draft a job description for a new role on my team. Guide me through the process by asking for the following information one by one:
1.  **Job Title:** (e.g., Senior Frontend Engineer)
2.  **Team Mission:** (What is the purpose of this team?)
3.  **Key Responsibilities:** (What will this person do day-to-day?)
4.  **Core Technologies:** (What is the tech stack?)
5.  **Qualifications:** (What are the must-have skills and experience?)
6.  **Company Culture Highlights:** (What makes this a great place to work?)

Once I've provided all the information, synthesize it into a clear, compelling, and inclusive job description that will attract top talent.`,
      },
      {
        id: 'team-retro-topics',
        title: 'Generate Team Health Retrospective Topics',
        description: 'Generates a set of thoughtful, open-ended questions to facilitate a productive team health retrospective.',
        prompt: `Act as an experienced Agile coach and team facilitator. My engineering team is holding its monthly team health retrospective. Our goal is to move beyond just talking about the last sprint and have a deeper conversation about our teamwork, communication, and overall well-being.

Please generate a list of 5-7 thoughtful, open-ended questions designed to spark conversation in the following areas:
- Communication & Collaboration
- Work-Life Balance & Morale
- Processes & Tools
- Learning & Growth

The questions should be constructive and assume a high-trust environment.`,
      },
    ],
  },
  {
    id: 'governance',
    title: 'AI Trust & Governance',
    recipes: [
      {
        id: 'prompt-risk-assessment',
        title: 'Prompt Risk Assessment',
        description: 'Guides you through a checklist to identify potential security, privacy, and bias risks in your prompt.',
        prompt: `Act as an AI security and ethics specialist. I am about to use the following prompt with a large language model. Please help me assess the potential risks. For each category below, ask me a clarifying question to help me think through the implications.

**1. Data Privacy (PII):** Does my prompt contain any personally identifiable information (names, emails, addresses, etc.) or confidential company data?
**2. Bias & Fairness:** Could the prompt lead to a response that is biased against any group? Is the language inclusive?
**3. Security (Prompt Injection):** Is any part of this prompt constructed from untrusted user input, which could lead to prompt injection attacks?
**4. Factual Reliability:** Is this prompt asking for factual information that should be independently verified? What is my plan to verify the output?
**5. Over-reliance:** Am I using this AI for a critical decision where human oversight is essential?

--- MY PROMPT ---
[Paste the prompt you want to assess here]`
      },
      {
        id: 'output-quality-checklist',
        title: 'AI Output Quality Checklist',
        description: 'Uses a structured checklist to evaluate the quality and reliability of an AI-generated response.',
        prompt: `Act as a meticulous quality assurance analyst for AI systems. I have received the following output from an LLM. Please help me evaluate its quality by walking me through the 8-Point Evaluation Check. For each point, ask me a question to guide my assessment.

**1. Redundancy:** Does the output contain repetitive phrases or looped sentences?
**2. Compression:** Could the same information be conveyed more concisely without losing meaning?
**3. Factual Drift:** How does this output compare to the original source data? Are there any subtle inaccuracies?
**4. Ordering Logic:** If this is a ranked list, is the ordering logical and consistent, or does it seem random?
**5. Tone Alignment:** Is the tone of this output appropriate for its intended audience (e.g., professional, casual, empathetic)?
**6. Structural Consistency:** Is the formatting (e.g., Markdown, JSON) correct and consistent?
**7. Cost-to-Value:** Was the quality of this answer worth the tokens/cost to generate it?
**8. Latency vs. Utility:** Did this response arrive quickly enough to be useful in my workflow?

--- AI-GENERATED OUTPUT ---
[Paste the AI output you want to evaluate here]`
      },
    ],
  },
];
