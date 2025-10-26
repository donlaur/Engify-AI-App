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
    ],
  },
];