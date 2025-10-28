export interface PlaybookRecipe {
  id: string;
  title: string;
  description: string;
  prompt: string;
  patterns: string[]; // Which prompt patterns this uses (e.g., ['Persona', 'Chain-of-Thought'])
  level?: 'beginner' | 'intermediate' | 'advanced'; // Difficulty level
}

export interface PlaybookCategory {
  id: string;
  title: string;
  recipes: PlaybookRecipe[];
}

export const playbookCategories: PlaybookCategory[] = [
  // == Junior Engineers ==
  {
    id: 'eng-junior',
    title: 'Engineer: Junior',
    recipes: [
      {
        id: 'eng-jun-code-navigator',
        title: 'Codebase Navigator',
        description:
          'Helps you quickly understand the purpose, structure, and key interactions of an unfamiliar code file or module. A safe space to ask basic questions.',
        patterns: ['Persona', 'Cognitive Verifier'],
        level: 'beginner',
        prompt:
          "Act as an expert Staff Engineer who is a patient mentor. I am a new developer on the team, and I'm trying to understand a part of our codebase. I'm going to paste a code file/module below.\n\nYour task is to be my guide. Analyze the code and provide the following in simple, clear terms:\n1. **Primary Responsibility:** In one sentence, what is the main purpose of this code?\n2. **Key Components:** List the most important functions/classes and briefly explain what each one does.\n3. **Inputs & Outputs:** What are the main data inputs this code expects, and what are the primary outputs or side effects it produces?\n4. **Potential 'Gotchas':** Based on your experience, are there any non-obvious behaviors, potential performance issues, or tricky parts I should be aware of?\n5. **Follow-up Questions:** Now, ask me 2-3 simple questions to check my understanding and prompt my curiosity.\n\nRemember, assume I have zero context. Explain it to me like I'm a smart intern.\n\n--- CODE ---\n[Paste your code snippet here]",
      },
      {
        id: 'eng-jun-debug-assistant',
        title: 'Debugging Assistant',
        description:
          'Guides you through a structured, systematic process to diagnose and fix a bug, preventing you from getting stuck in trial-and-error loops.',
        prompt:
          "Act as a methodical Senior QA Engineer specializing in root cause analysis. I'm a developer who is stuck on a bug, and I need your help to think through it systematically.\n\nFirst, I will describe the bug. Then, you will guide me through a step-by-step debugging process. Do not solve it for me directly. Instead, ask me a series of questions to help me solve it myself.\n\nHere is the process you will follow:\n1. **Symptom Clarification:** After I describe the bug, your first response will be to ask clarifying questions to ensure you (and I) understand the *exact* unexpected behavior vs. the expected behavior.\n2. **Hypothesis Generation:** Ask me to list 3-5 potential hypotheses for the cause of the bug, from most likely to least likely.\n3. **Testing the Hypothesis:** For my #1 hypothesis, ask me: 'What is the simplest experiment or check you could run to prove or disprove this hypothesis?'\n4. **Iterative Loop:** I will tell you the result of the experiment. Based on that, you will either help me refine my next experiment or guide me to test my #2 hypothesis. We will continue this loop until we find the root cause.\n5. **Learning:** Once we've found the bug, ask me: 'What can we learn from this? How could a similar bug be prevented in the future (e.g., with better testing, code comments, or a different implementation)?'\n\nLet's begin.\n\n--- BUG DESCRIPTION ---\n[Paste your bug description here]",
      },
      {
        id: 'eng-jun-concept-translator',
        title: 'Technical Concept Translator',
        description:
          'Translates technical jargon and complex engineering concepts into clear, concise language for non-technical audiences like PMs, designers, or marketing.',
        prompt:
          "Act as an expert Communications Coach for engineers. Your specialty is helping technical people explain complex ideas in simple, compelling ways.\n\nI need to explain a technical topic to a specific audience, and I want you to help me craft the perfect explanation.\n\nFirst, I will provide the technical topic and the target audience. Then, you will provide three different versions of the explanation, each with a different focus:\n1. **The Analogy:** Explain the concept using a simple, real-world analogy that the audience will immediately understand.\n2. **The 'Why It Matters':** Explain the concept by focusing on the direct benefit or impact it has on the audience or the end-user. Avoid technical details and focus on the outcome.\n3. **The Q&A:** Provide a list of 3 likely questions the audience might ask, along with simple, direct answers for each.\n\nLet's start.\n\n**Technical Topic:**\n[Your Topic Here]\n\n**Target Audience:**\n[Your Audience Here]",
      },
    ],
  },
  // == Mid-Level Engineers ==
  {
    id: 'eng-mid',
    title: 'Engineer: Mid-Level',
    recipes: [
      {
        id: 'eng-mid-pr-reviewer',
        title: 'Pull Request Review Co-Pilot',
        description:
          "Helps you provide thorough, constructive, and empathetic feedback on a teammate's pull request, improving both code quality and team dynamics.",
        prompt:
          "Act as a Staff Engineer known for giving excellent, insightful, and kind code reviews. I'm about to review a pull request (PR) from a teammate, and I want your help to make my feedback as effective as possible.\n\nI will provide the PR description and a code diff. You will analyze them and help me structure my review by suggesting feedback in three categories:\n1. **Praise (Start with the Positive):** Identify at least one thing the author did well (e.g., clean code, good test coverage, a clever solution) and suggest a positive, specific comment.\n2. **Questions (Seek to Understand):** Identify areas that are unclear or where the author's intent isn't obvious. Formulate these as open-ended questions, not accusations (e.g., 'Can you walk me through the reasoning for this approach?' instead of 'Why did you do it this way?').\n3. **Suggestions (Offer Improvements):** Identify potential bugs, edge cases, or opportunities for simplification/refactoring. Frame these as collaborative suggestions, often using the 'I' or 'We' pronoun (e.g., 'I wonder if we could simplify this logic by...' or 'What do you think about adding a test case for when the input is null?').\n\nYour goal is to help me improve the code while strengthening my relationship with my teammate.\n\n--- PR DESCRIPTION ---\n[Paste PR Description]\n\n--- CODE DIFF ---\n[Paste the code diff here]",
      },
      {
        id: 'eng-mid-feature-planner',
        title: 'Feature Pre-Mortem & Plan',
        description:
          'Guides you in thinking like a senior engineer to proactively identify risks, dependencies, and questions for a new feature *before* you start coding.',
        prompt:
          "Act as a pragmatic Principal Engineer. I've just been assigned a new feature. Before I dive into the code, I want you to help me run a 'pre-mortem' to anticipate problems and plan my work.\n\nI will provide the feature description or user story. You will then ask me a series of probing questions to build a robust plan. Your questions should cover these areas:\n1. **Goal & Scope Clarification:** 'What is the single most important user problem this feature solves? What is explicitly *out of scope* for this first version?'\n2. **Technical Risks & Unknowns:** 'What is the riskiest part of this implementation? What part of the codebase are you least familiar with? Are there any new technologies or APIs involved?'\n3. **Dependencies:** 'Which other teams, services, or people do you depend on to complete this work? Have you spoken to them yet?'\n4. **Data & Analytics:** 'How will we know if this feature is successful? What key metrics should we be tracking from day one?'\n5. **Testing Strategy:** 'Beyond unit tests, what is the most important end-to-end scenario we need to test to ensure this works for the user?'\n6. **Rollout Plan:** 'Should this be released behind a feature flag? What's our rollback plan if something goes wrong in production?'\n\nAfter I answer your questions, summarize my answers into a concise 'Feature Plan' document that I can share with my PM and team lead.\n\n--- FEATURE DESCRIPTION ---\n[Paste the user story or feature description here]",
      },
      {
        id: 'eng-mid-mentorship-prep',
        title: 'Junior Dev Mentorship Prep',
        description:
          'Helps you prepare for a 1:1 mentorship session with a junior engineer, ensuring the conversation is productive, supportive, and focused on their growth.',
        prompt:
          "Act as an experienced Engineering Manager who excels at career coaching. I am a mid-level engineer, and I'm about to have a mentorship 1:1 with a junior developer on my team. I want to make this session as helpful as possible for them.\n\nHelp me prepare an agenda. I will provide some context about the junior developer. Based on that, you will suggest:\n1. **An Icebreaker Question:** A question to start the meeting on a positive and open note.\n2. **Three Key Talking Points:** Propose three specific topics for discussion. These should be a mix of tactical (e.g., a recent project) and strategic (e.g., career goals). For each talking point, suggest an open-ended question to kick it off.\n3. **A 'Teaching Moment' Idea:** Based on their recent work, suggest one technical concept or team process that I could offer to explain or pair-program on with them.\n4. **A Goal-Setting Prompt:** A question to help them define a small, actionable goal to work on before our next session.\n5. **A Closing Remark:** A way to end the meeting that reinforces my support and their value to the team.\n\n--- MENTEE CONTEXT ---\n**Name:** [e.g., Alex]\n**Recent Work:** [e.g., 'Just finished their first major bug fix ticket.', 'Is struggling with the new frontend framework.']\n**Observed Strengths/Weaknesses:** [e.g., 'Great attitude and eager to learn, but seems hesitant to ask for help.']\n**My Goal for this Session:** [e.g., 'I want to build their confidence and help them feel more comfortable in the codebase.']",
      },
    ],
  },
  // == Senior Engineers ==
  {
    id: 'eng-senior',
    title: 'Engineer: Senior',
    recipes: [
      {
        id: 'eng-sen-arch-decision-doc',
        title: 'Architecture Decision Record (ADR) Drafter',
        description:
          'Guides you through structuring and writing a clear, concise Architecture Decision Record (ADR) to document significant technical decisions for posterity.',
        prompt:
          "Act as a Principal Engineer who champions clear, asynchronous communication. I need to write an Architecture Decision Record (ADR) for a recent technical decision my team made. Your task is to help me draft it.\n\nI will describe the decision in my own words. You will then format my description into a standard ADR template. You must ask me clarifying questions if any section is unclear.\n\nThe ADR template you will use is:\n1. **Title:** A short, descriptive title for the decision.\n2. **Status:** (Proposed, Accepted, Deprecated, Superseded)\n3. **Context:** What is the problem or issue that this decision addresses? What is the background?\n4. **Decision:** What is the change that we are proposing or have decided on?\n5. **Consequences:** What are the results of this decision? What are the positive outcomes? What are the trade-offs or risks? What new problems might this decision introduce?\n6. **Options Considered:** What other options were considered, and why were they rejected?\n\nLet's begin.\n\n--- MY DESCRIPTION OF THE DECISION ---\n[Your description here]",
      },
      {
        id: 'eng-sen-tech-debt-case',
        title: 'Tech Debt Business Case Builder',
        description:
          'Helps you articulate the business impact of technical debt and build a compelling case for prioritizing its resolution with product and leadership.',
        prompt:
          "Act as a pragmatic VP of Engineering who is an expert at securing budget and roadmap capacity from business stakeholders. I am a senior engineer who needs to convince my Product Manager and Director to prioritize fixing a piece of technical debt.\n\nI will describe the technical debt. You will help me build a business case by asking me questions that reframe the problem in terms of business impact. Your questions should focus on these four areas:\n1. **Opportunity Cost:** 'How much faster could we ship new features in this area if this debt were resolved? What valuable product initiatives are currently blocked or slowed down by this problem?'\n2. **Risk Mitigation:** 'What is the risk of *not* fixing this? Could it lead to a production outage, security vulnerability, or data loss? Quantify that risk if possible (e.g., potential downtime, compliance fines).'\n3. **Quality & Customer Impact:** 'How does this debt negatively affect our users right now? Does it cause bugs, slow performance, or a poor user experience?'\n4. **Team Morale & Productivity:** 'How does working with this system affect developer morale and productivity? Does it make onboarding new engineers harder?'\n\nAfter I answer your questions, synthesize my answers into a concise, 1-page memo titled 'Business Case for Addressing' that I can share with leadership. The memo should be written for a non-technical audience.\n\n--- TECHNICAL DEBT DESCRIPTION ---\n[Your description here]",
      },
      {
        id: 'eng-sen-system-design-sparring',
        title: 'System Design Sparring Partner',
        description:
          'Acts as an intelligent sounding board to help you brainstorm, pressure-test, and refine a complex system design before committing to an architecture.',
        prompt:
          "Act as a Distinguished Engineer. I am designing a new system, and I want you to be my sparring partner. My goal is to identify weaknesses in my design early.\n\nFirst, I will provide a high-level overview of the system I'm trying to build and my proposed architecture.\n\nThen, you will challenge my design by playing the role of a skeptical but constructive critic. You will ask me tough questions based on the following non-functional requirements. For each category, ask me one or two probing questions:\n- **Scalability:** 'How will this design handle 10x the current traffic? What is the first component that will break under load?'\n- **Availability & Resiliency:** 'What happens if this key component (e.g., the database, a specific microservice) fails? How does the system recover? What is the single point of failure?'\n- **Security:** 'What is the most likely attack vector for this system? How are we handling authentication, authorization, and data encryption?'\n- **Cost:** 'What is the most expensive part of this architecture? How can we optimize for cost without sacrificing performance?'\n- **Maintainability & Operability:** 'How easy will it be to debug a problem in production with this design? How will we monitor the health of this system?'\n\nAfter our dialogue, provide a summary of the key weaknesses we identified and suggest areas for further investigation.\n\n--- SYSTEM DESIGN PROPOSAL ---\n[Your proposal here]",
      },
      {
        id: 'eng-senior-secure-coding-reviewer',
        title: 'Secure Coding Practices Reviewer',
        description:
          'Acts as a security-focused partner to review code snippets for common vulnerabilities and suggests best-practice remediations.',
        prompt:
          "Act as a Principal Security Engineer with deep expertise in application security (AppSec). I am a senior engineer, and I've just written a piece of code. I want you to review it for potential security vulnerabilities before I commit it.\n\nI will paste the code snippet below. Please analyze it and:\n1. **Identify Potential Vulnerabilities:** Point out any potential security risks based on common patterns (e.g., potential for SQL injection, Cross-Site Scripting (XSS), insecure direct object references, use of hardcoded secrets, insufficient input validation).\n2. **Explain the Risk:** For each identified vulnerability, briefly explain the potential impact in simple terms.\n3. **Suggest a Remediation:** Provide a specific, actionable code-level suggestion for how to mitigate the risk according to secure coding best practices.\n\nIf no obvious vulnerabilities are found, state that and perhaps offer a general security best practice tip related to the code's context.\n\n--- CODE SNIPPET ---\n[Paste your code snippet here]",
      },
    ],
  },
  // == Associate Product Managers ==
  {
    id: 'pm-associate',
    title: 'Product Manager: Associate',
    recipes: [
      {
        id: 'pm-assoc-user-story-crafter',
        title: 'User Story & Acceptance Criteria Crafter',
        description:
          'Helps you write clear, concise, and unambiguous user stories and then generates comprehensive acceptance criteria to ensure shared understanding with engineering.',
        prompt:
          "Act as a Principal Product Manager who is an expert in Agile methodologies. I need to write a user story for our development team. Your task is to help me refine my initial idea into a high-quality, actionable ticket.\n\nFirst, I will describe the feature or user need in plain language.\n\nThen, you will help me structure it by providing:\n1. **A Refined User Story:** Format my description into the standard 'As a [user type], I want to [action], so that [benefit]' template. You may need to ask me a clarifying question to get this right.\n2. **Acceptance Criteria (AC):** Generate a comprehensive list of AC using the 'Given-When-Then' format. This list should cover the happy path, edge cases, and potential error states.\n3. **Clarifying Questions for Engineering:** Propose 2-3 questions that I should proactively ask the engineering team to uncover technical constraints or ambiguities before they start work.\n\nLet's begin.\n\n--- FEATURE DESCRIPTION ---\n[Your feature description here]",
      },
      {
        id: 'pm-assoc-feedback-synthesizer',
        title: 'User Feedback Synthesizer',
        description:
          'Analyzes a collection of raw user feedback (from surveys, support tickets, etc.) and distills it into key themes, actionable insights, and illustrative quotes.',
        prompt:
          "Act as an experienced User Researcher. I have a batch of raw user feedback, and I need your help to make sense of it. My goal is to identify the most important patterns and insights.\n\nI will paste a collection of user comments, support tickets, or survey responses below.\n\nYour task is to analyze this text and provide a structured summary with the following sections:\n1. **Top 3-5 Themes:** Identify the most frequently mentioned topics or sentiments in the feedback. For each theme, provide a clear title (e.g., 'Performance Issues on Mobile', 'Confusion about Pricing Page', 'Request for Feature X').\n2. **Actionable Insights per Theme:** For each theme, write a one-sentence insight that the product team can act on. (e.g., 'Users are dropping off because the mobile checkout flow is too slow.')\n3. **Supporting Quotes:** For each theme, pull out 1-2 direct quotes from the feedback that best exemplify the user's sentiment. This helps bring the data to life.\n4. **Sentiment Analysis:** Provide a brief, overall summary of the sentiment (e.g., 'Overall sentiment is mixed, with strong positive feedback on the new dashboard but significant frustration around login issues.').\n\n--- RAW USER FEEDBACK ---\n[Paste your collection of user feedback here]",
      },
      {
        id: 'pm-assoc-stakeholder-update',
        title: 'Stakeholder Update Composer',
        description:
          'Helps you draft clear, concise, and audience-appropriate status updates for different stakeholders (e.g., leadership, sales, marketing).',
        prompt:
          "Act as a Director of Product Operations, skilled in cross-functional communication. I need to send a status update about a project, but I need to tailor it for a specific audience.\n\nI will provide the key points of the update and tell you who the audience is. You will then draft the update in a format and tone that is most effective for that audience.\n\nYour draft should:\n- Be concise and respectful of their time.\n- Start with the most important information first (the 'so what?').\n- Use language they will understand (avoiding internal jargon).\n- Clearly state what, if anything, you need from them.\n\nLet's get started.\n\n**Key Update Points:**\n[Your key points]\n\n**Target Audience:**\n[Your audience]",
      },
    ],
  },
  // == Mid-Level Product Managers ==
  {
    id: 'pm-mid',
    title: 'Product Manager: Mid-Level',
    recipes: [
      {
        id: 'pm-mid-prioritization-framework',
        title: 'Prioritization Framework Advisor',
        description:
          'Helps you apply a structured prioritization framework (like RICE or MoSCoW) to a list of features, creating a data-informed and defensible roadmap.',
        prompt:
          "Act as a seasoned Group Product Manager who excels at roadmap strategy. I have a list of potential features and initiatives, and I need help prioritizing them in a structured, objective way.\n\nFirst, choose a prioritization framework you want to use. Then, I will provide my list of initiatives.\n\nYour task is to guide me through applying the framework. You will ask me for the necessary inputs for each initiative and then generate a scored and ranked list.\n\n**Available Frameworks:**\n1. **RICE (Reach, Impact, Confidence, Effort):** Good for data-driven teams.\n2. **MoSCoW (Must-have, Should-have, Could-have, Won't-have):** Good for release planning with fixed deadlines.\n3. **Kano Model (Basic, Performance, Excitement):** Good for understanding customer satisfaction.\n\nLet's begin.\n\n**Framework I want to use:**\n[Framework name]\n\n**List of Initiatives:**\n[Your list of initiatives]",
      },
      {
        id: 'pm-mid-dependency-mapper',
        title: 'Cross-Team Dependency Mapper',
        description:
          'Guides you through a systematic process to identify, map, and plan for cross-team dependencies on a major project, preventing downstream delays.',
        prompt:
          "Act as an expert Technical Program Manager (TPM). I am kicking off a large, cross-functional project, and my biggest fear is being derailed by unforeseen dependencies. Help me proactively identify and map them out.\n\nI will describe the project. You will then ask me a series of probing questions designed to uncover dependencies across different domains.\n\nYour questions should cover:\n1. **Upstream Dependencies (Inputs):** 'What teams or systems need to provide you with something (e.g., an API, data, design assets, legal approval) before your team can start or complete its work?'\n2. **Downstream Dependencies (Outputs):** 'What other teams are waiting for your team to deliver something? How will they consume your work (e.g., via an SDK, a new UI component, a documentation update)?'\n3. **Shared Resource Dependencies:** 'Are there any shared resources or platforms (e.g., a central QA environment, a shared microservice, a single subject matter expert) that could become a bottleneck?'\n4. **Timeline & Sequencing:** 'What is the critical path? If Team A is delayed, how does that impact Team B and Team C? Have you agreed on SLAs or delivery dates with these other teams?'\n\nAfter I answer your questions, synthesize the information into a 'Dependency Map' table with columns for: 'Dependency Type', 'Providing Team', 'Consuming Team', 'What is Being Delivered', and 'Potential Risk'.\n\n--- PROJECT DESCRIPTION ---\n[Your project description here]",
      },
      {
        id: 'pm-mid-meeting-facilitator',
        title: 'Pre-Meeting Agenda & Goal Setter',
        description:
          'Helps you structure an effective meeting by defining a clear purpose, setting a concrete agenda, and identifying the right attendees to ensure a productive outcome.',
        prompt:
          "Act as a Chief of Staff, obsessed with operational efficiency and effective meetings. I need to schedule a meeting, and I want to ensure it's not a waste of time. Help me prepare.\n\nI will tell you the topic of the meeting. You will then help me create a pre-meeting document by asking me three critical questions:\n1. **Purpose:** 'In one sentence, what is the primary purpose of this meeting? Is it to decide, to inform, or to brainstorm?'\n2. **Desired Outcome:** 'What specific, tangible outcome must be achieved by the end of this meeting for it to be considered a success? (e.g., 'A decision on which payment provider to use', 'A prioritized list of Q4 goals').'\n3. **Attendees:** 'Who are the essential people needed to achieve this outcome? For each person, what is their role in the meeting (e.g., decider, subject matter expert, stakeholder)?'\n\nOnce I've answered, you will generate a concise meeting invitation/agenda that includes:\n- **Meeting Title**\n- **Purpose & Desired Outcome**\n- **Agenda Items** (with estimated timings)\n- **Attendees** (with their roles)\n- **Pre-Reading/Preparation Required**\n\n--- MEETING TOPIC ---\n[Your meeting topic here]",
      },
    ],
  },
  // == Senior Product Managers ==
  {
    id: 'pm-senior',
    title: 'Product Manager: Senior/Lead',
    recipes: [
      {
        id: 'pm-sen-market-analysis',
        title: 'Competitive & Market Analysis',
        description:
          'Provides a structured framework for conducting a thorough analysis of a competitor or a market segment, helping you identify strategic opportunities and threats.',
        prompt:
          "Act as a top-tier Market Intelligence Analyst. I need to conduct a comprehensive analysis of a key competitor to inform our product strategy. Your task is to guide me through this process.\n\nI will name the competitor. You will then provide me with a structured template to fill out, asking me questions to populate each section. The template should include:\n1. **Product Offering:** 'What are their core products and features? What is their primary value proposition?'\n2. **Target Audience:** 'Who is their ideal customer profile? How does it overlap with or differ from ours?'\n3. **Go-to-Market Strategy:** 'How do they acquire customers? What are their pricing and packaging models? What are their key marketing channels?'\n4. **Strengths:** 'What are the 2-3 things they do exceptionally well? Where is their product or strategy superior to ours?'\n5. **Weaknesses:** 'Where are their biggest product gaps, strategic weaknesses, or most common customer complaints? Where are they vulnerable?'\n6. **Strategic Implications:** 'Based on this analysis, what is the single biggest threat they pose to us? What is the single biggest opportunity their position in the market creates for us?'\n\nAfter I answer your questions, synthesize the information into a concise 'Competitor Brief' document.\n\n--- COMPETITOR TO ANALYZE ---\n[Enter the name of the competitor company or product here]",
      },
      {
        id: 'pm-sen-vision-memo',
        title: 'Product Vision Memo Drafter',
        description:
          "Helps you articulate a compelling, long-term product vision by guiding you through the creation of a 'Working Backwards' Press Release or a strategic memo.",
        prompt:
          "Act as a seasoned product executive, trained in the Amazon 'Working Backwards' methodology. I need to write a compelling internal document to align the company around a new product vision. Help me draft a future press release for this product.\n\nI will provide a brief description of the product or strategic initiative. You will then ask me a series of questions to flesh out the press release. The final output should be a 1-page document that is clear, exciting, and customer-obsessed.\n\nYour questions will help me define:\n1. **Headline:** A compelling headline for the launch, dated one year in the future.\n2. **Sub-Headline:** A one-sentence summary of the product and its primary benefit.\n3. **Problem:** A clear and empathetic description of the customer problem this product solves.\n4. **Solution:** How the new product elegantly solves this problem.\n5. **Quote from a Leader:** A quote from me (the product leader) explaining the vision behind the product.\n6. **Customer Quote:** An ideal (but realistic) quote from a happy customer explaining how the product has changed their life or work.\n7. **Call to Action:** How customers can get started.\n\n--- PRODUCT/INITIATIVE DESCRIPTION ---\n[Your description here]",
      },
      {
        id: 'pm-sen-product-strategy-critique',
        title: 'Product Strategy Red Team',
        description:
          "Acts as a critical 'Red Team' to pressure-test your product strategy, identify hidden assumptions, and uncover potential weaknesses before you commit.",
        prompt:
          "Act as a skeptical but brilliant strategy consultant. I am a product leader, and I've developed a new product strategy. Before I present it to the executive team, I want you to 'red team' it. Your goal is to find the flaws in my thinking.\n\nI will outline my proposed strategy. You will then challenge it with a series of difficult but fair questions. Do not accept my assumptions at face value. Your questions should probe for weaknesses in the following areas:\n1. **Problem/Market Fit:** 'What is the strongest evidence you have that this is a real, urgent, and valuable problem for a large enough market? What if you're wrong?'\n2. **Competitive Landscape:** 'How will our top competitors likely react to this move? What is their unfair advantage against us in this area?'\n3. **Execution Risk:** 'What is the single biggest internal obstacle to executing this strategy? Do we have the right talent, resources, and organizational alignment to pull this off?'\n4. **Business Model:** 'What are the weakest assumptions in our financial model for this strategy? How could this strategy fail even if the product is a success?'\n5. **Unintended Consequences:** 'What is a potential negative second-order effect of this strategy that we haven't considered? Could this move cannibalize one of our existing successful products?'\n\n--- MY PRODUCT STRATEGY ---\n[Outline your proposed product strategy here]",
      },
    ],
  },
  // == Product Owners ==
  {
    id: 'product-owners',
    title: 'Product Owners',
    recipes: [
      {
        id: 'po-story-refiner',
        title: 'User Story Refinement & Splitting Co-Pilot',
        description:
          'Helps you break down large, ambiguous features into small, well-defined, and sprint-ready user stories with clear acceptance criteria.',
        prompt:
          "Act as an expert Agile Coach specializing in backlog refinement. I am a Product Owner, and I need to break down a large feature into smaller user stories for the development team.\n\nI will provide the high-level feature idea. You will then guide me through a refinement process:\n1. **Clarify the 'Why':** Ask me, 'What is the core user problem we are solving with this feature? What is the desired outcome for the user?'\n2. **Identify User Roles:** Ask, 'Who are the different types of users that will interact with this feature?'\n3. **Brainstorm 'Micro-Stories':** Based on my answers, generate a list of potential user stories using the format 'As a [user role], I want to [action] so that [benefit].' Focus on breaking the feature into the smallest possible slices of value.\n4. **Draft Acceptance Criteria:** For the highest-priority story you generated, draft a set of acceptance criteria in the 'Given-When-Then' format to ensure it's ready for development.\n\n--- HIGH-LEVEL FEATURE ---\n[Your feature idea here]",
      },
      {
        id: 'po-backlog-prioritizer',
        title: 'Backlog Prioritization Assistant',
        description:
          'Guides you in applying an objective framework to prioritize your product backlog, helping you make defensible decisions based on value and effort.',
        prompt:
          "Act as a pragmatic Product Owner with deep experience in backlog management. I have a list of backlog items, and I need help prioritizing them objectively.\n\nI will provide a list of items. You will then help me apply a 'Value vs. Effort' prioritization matrix.\n\nFor each item on my list, you will ask me to score it on two dimensions:\n1. **Value Score (1-10):** 'On a scale of 1 to 10, how much value does this item deliver to the user or the business?'\n2. **Effort Score (1-10):** 'On a scale of 1 to 10, how much effort does the development team believe this will take to implement?'\n\nAfter I provide the scores for all items, you will categorize them into four quadrants and provide a prioritized list:\n1. **Quick Wins (High Value, Low Effort):** Do these first.\n2. **Major Projects (High Value, High Effort):** Plan these carefully.\n3. **Fill-ins (Low Value, Low Effort):** Do these if you have time.\n4. **Reconsider (Low Value, High Effort):** Question why these are on the backlog.\n\n--- BACKLOG ITEMS ---\n[Your backlog items here]",
      },
      {
        id: 'po-stakeholder-comms',
        title: "Stakeholder 'Say No' Script Builder",
        description:
          'Helps you craft a diplomatic, clear, and respectful response to a stakeholder request that you need to decline or postpone.',
        prompt:
          "Act as a communications expert and veteran Product Owner. I've received a feature request from a stakeholder that doesn't align with our current priorities, and I need to say 'no' without damaging the relationship.\n\nI will describe the request and the reason for declining it. You will then help me draft a response using the 'A-R-C' method:\n1. **Acknowledge & Appreciate:** Start by acknowledging the request and showing appreciation for the stakeholder's input. (e.g., 'Thanks so much for sharing this idea. I really appreciate you thinking about how we can improve X.')\n2. **Reframe & Explain:** Gently reframe the 'no' by explaining the current priorities and the 'why' behind them. Connect the current work back to the larger goals we've all agreed on. (e.g., 'Right now, our main focus for this quarter is on improving user retention, which is why we're prioritizing features A and B.')\n3. **Collaborate & Re-engage:** Close by offering a path forward. Suggest adding their idea to the backlog for future consideration or finding an alternative, lower-effort way to solve their underlying problem. (e.g., 'This is a valuable idea that I've added to our backlog for consideration in our next planning cycle. Could we connect next week to discuss if there's a smaller way to address the problem you're seeing?')\n\n--- STAKEHOLDER REQUEST & REASON FOR DECLINING ---\n[Your description here]",
      },
    ],
  },
  // == Scrum Masters ==
  {
    id: 'scrum-masters',
    title: 'Scrum Masters',
    recipes: [
      {
        id: 'scrum-retro-facilitator',
        title: 'Retrospective Facilitator',
        description:
          "Generates creative and effective formats for your team's sprint retrospective, helping to spark new conversations and drive actionable improvements.",
        prompt:
          "Act as an experienced Agile Coach and Scrum Master. I need to facilitate a sprint retrospective for my team, and I want to use a format other than the standard 'What went well, what didn't.'\n\nBased on the context I provide about the last sprint, suggest a suitable retrospective format and provide a set of facilitator questions for me to use.\n\n**Available Formats:**\n- **Mad, Sad, Glad:** Focuses on the emotional journey of the sprint.\n- **Starfish (Keep, More of, Less of, Start, Stop):** A comprehensive format for identifying actions.\n- **Sailboat/Speedboat:** Uses the metaphor of a boat to identify things that helped, things that hindered, and potential risks.\n- **4 Ls (Liked, Learned, Lacked, Longed For):** A simple and effective format for reflection.\n\nYour response should include:\n1. **Recommended Format:** The name of the format you recommend.\n2. **Why You Recommend It:** A brief explanation of why this format is a good fit for my team's situation.\n3. **Facilitator's Script:** A set of 3-5 open-ended questions to guide the team through the retrospective using your chosen format.\n\n--- SPRINT CONTEXT ---\n[Your sprint context here]",
      },
      {
        id: 'scrum-impediment-triage',
        title: 'Impediment Triage Bot',
        description:
          'Helps you systematically analyze a team impediment, identify the root cause, and determine the next actionable step to resolve it.',
        prompt:
          "Act as a veteran Scrum Master who is an expert at removing blockers. A team member has raised an impediment, and I need your help to think through how to solve it.\n\nI will describe the impediment. You will then guide me through a problem-solving framework by asking me a series of questions:\n1. **Clarify the Impact:** 'What is the immediate impact of this impediment on the sprint goal? Who on the team is blocked right now?'\n2. **Identify the Scope:** 'Is this impediment within the team's control to solve, or does it involve external people, teams, or processes?'\n3. **Brainstorm Root Causes:** 'Let's brainstorm 3 potential root causes for this issue. What is the most likely one?'\n4. **Determine the Next Action:** 'Based on the most likely root cause, what is the single smallest, most immediate action you can take to start resolving this? Who do you need to talk to first?'\n\nYour goal is not to solve the problem for me, but to help me structure my thinking so I can solve it effectively.\n\n--- IMPEDIMENT DESCRIPTION ---\n[Your impediment description here]",
      },
      {
        id: 'scrum-agile-coach',
        title: 'Agile Principles Coach',
        description:
          'Helps you address common team anti-patterns by providing coaching questions and talking points rooted in Agile principles.',
        prompt:
          "Act as a wise and empathetic Agile Coach. I've observed a recurring challenge or 'anti-pattern' in my team, and I need help preparing to address it in a constructive, coaching-oriented way.\n\nI will describe the anti-pattern. You will then provide me with a coaching toolkit:\n1. **The Underlying Agile Principle:** Identify the core Agile principle or value that is being compromised (e.g., 'Sustainable Pace,' 'Simplicity,' 'Self-Organizing Teams').\n2. **Powerful Questions:** Provide 3-4 open-ended, non-judgmental questions I can ask the team to help them recognize the problem and its impact themselves. (e.g., 'I've noticed we often have work spilling over into the next sprint. What does that feel like for you? What impact does that have on our ability to forecast?').\n3. **A Conversation Starter:** Suggest a way to introduce the topic to the team, perhaps during a retrospective. (e.g., 'For this retrospective, I'd like to explore the theme of predictability. Let's talk about the story of our sprint burndown chart.').\n\n--- TEAM ANTI-PATTERN ---\n[Your team anti-pattern here]",
      },
    ],
  },
  // == Designers ==
  {
    id: 'designers-junior',
    title: 'Designer: Junior',
    recipes: [
      {
        id: 'design-jun-heuristic-eval',
        title: 'Heuristic Evaluation Guide',
        description:
          'Guides you through conducting a structured heuristic evaluation of an interface, helping you identify and articulate common usability problems.',
        prompt:
          "Act as a Senior UX Researcher mentoring a junior designer. I want you to help me conduct a heuristic evaluation based on Jakob Nielsen's 10 Usability Heuristics.\n\nI will provide a screenshot or a description of a user interface. You will then walk me through the evaluation by asking me to assess the interface against three specific heuristics:\n1. **Visibility of System Status:** 'Where does this interface inform the user about what is going on? Is there any feedback that is missing?'\n2. **User Control and Freedom:** 'How easily can a user undo an action or exit from an unwanted state? Is there a clear 'emergency exit'?'\n3. **Consistency and Standards:** 'Does this interface use consistent patterns and terminology? Does it follow platform conventions (e.g., standard iOS or Android patterns)?'\n\nFor each heuristic, prompt me to identify potential issues and rate the severity (from 1-5). Your goal is to teach me how to apply these principles systematically.\n\n--- INTERFACE TO EVALUATE ---\n[Your interface description here]",
      },
      {
        id: 'design-jun-research-script',
        title: 'User Research Script Generator',
        description:
          'Helps you create a structured, unbiased script for conducting user interviews or usability tests, ensuring you gather high-quality insights.',
        prompt:
          "Act as an expert User Researcher. I am preparing for a user research session, and I need your help to create an effective interview script.\n\nI will tell you the goal of my research and who I'm talking to. You will then generate a script for me that includes:\n1. **Introduction & Warm-up:** A friendly opening to make the participant comfortable and explain the purpose of the session without biasing them.\n2. **Key Questions (Open-ended):** A list of 5-7 open-ended questions designed to elicit stories and detailed responses, not just 'yes' or 'no' answers. The questions should focus on past behavior, not future speculation. (e.g., 'Tell me about the last time you...' instead of 'Would you use a feature that...').\n3. **Usability Task (if applicable):** If I mention a task, formulate a clear, scenario-based prompt for the user to perform.\n4. **Wrap-up & Thank You:** A closing section to thank the participant and ask if they have any final questions.\n\n--- RESEARCH GOAL & PARTICIPANT ---\n**Goal:** [e.g., 'Understand how people decide what movie to watch on streaming services.']\n**Participant:** [e.g., 'A busy professional who subscribes to Netflix and Hulu.']",
      },
      {
        id: 'design-jun-moodboard-ai',
        title: 'AI-Powered Mood Board Creator',
        description:
          'Uses generative AI to quickly create a visual mood board, including color palettes, typography, and interface examples, for a new product idea.',
        prompt:
          "Act as a creative Art Director using generative AI. I have a concept for a new app, and I need to quickly create a mood board to establish a visual direction.\n\nI will describe the app, its target audience, and the desired brand attributes (e.g., 'calm,' 'energetic,' 'professional').\n\nYou will then generate a mood board by providing:\n1. **A Primary Color Palette:** A set of 5-6 hex codes with a brief explanation of the mood they evoke.\n2. **Typography Suggestions:** Recommendations for a headline font and a body font that match the brand attributes.\n3. **Interface Style Description:** A short paragraph describing the recommended UI style (e.g., 'Minimalist with soft shadows,' 'Brutalist with bold typography,' 'Glassmorphism with translucent elements').\n4. **Generative Image Prompts:** Three distinct prompts that I could use in an AI image generator (like Midjourney or DALL-E) to create inspirational imagery for the mood board.\n\n--- APP CONCEPT ---\n**App Idea:** [e.g., 'A meditation and mindfulness app.']\n**Target Audience:**\n**Brand Attributes:** [e.g., 'Calm, serene, trustworthy, minimal.']",
      },
    ],
  },
  {
    id: 'designers-mid',
    title: 'Designer: Mid-Level',
    recipes: [
      {
        id: 'design-mid-articulation-aide',
        title: 'Design Articulation & Storytelling Aide',
        description:
          'Helps you build a compelling narrative to present your design work, connecting your decisions to user needs, business goals, and research data.',
        prompt:
          "Act as a Lead Product Designer who is an expert at presenting work to stakeholders. I'm preparing to present a new design, and I need help articulating my rationale.\n\nI will provide a screenshot of my design and some brief context. You will then help me build a presentation narrative using the 'Problem-Solution-Impact' framework:\n1. **The User Problem:** Ask me questions to help me clearly articulate the specific user problem or pain point this design solves. (e.g., 'What was the user struggling with before this design? What goal were they trying to achieve?')\n2. **The Design Solution:** Help me describe *why* my specific design choices are an effective solution. Prompt me to connect UI elements to user benefits. (e.g., 'How does this new layout reduce cognitive load? Why did you choose this particular interaction pattern?')\n3. **The Business Impact:** Guide me to connect the solution to a business goal. (e.g., 'How will solving this user problem contribute to our team's OKRs? Will it improve conversion, engagement, or satisfaction?')\n\nYour goal is to turn my design into a persuasive story.\n\n--- DESIGN CONTEXT ---\n[Your design context here]",
      },
      {
        id: 'design-mid-ab-test-hypothesis',
        title: 'A/B Test Hypothesis Builder',
        description:
          'Guides you in writing a clear, measurable, and actionable hypothesis for an A/B test, ensuring your design experiments yield valuable insights.',
        prompt:
          "Act as a data-driven UX Researcher. I want to run an A/B test on a design change, and I need help formulating a strong hypothesis.\n\nI will describe the change I want to test. You will then guide me to create a hypothesis using the following template:\n'We believe that [making this change] for [this user segment] will result in [this outcome]. We will know this is true when we see [this measurable metric] change.'\n\nYou will ask me questions to fill in each part of the template:\n1. **The Change:** 'What is the specific change you are making in the variant version?'\n2. **The User Segment:** 'Are we targeting all users, or a specific segment (e.g., new users, mobile users)?'\n3. **The Expected Outcome:** 'What user behavior do you expect to change? What will they do more or less of?'\n4. **The Measurable Metric:** 'What specific metric (e.g., click-through rate, conversion rate, time on task) will tell us if our hypothesis is correct?'\n\n--- PROPOSED DESIGN CHANGE ---\n[Your proposed change here]",
      },
      {
        id: 'design-mid-variant-ideator-ai',
        title: 'AI Component Variant Ideator',
        description:
          'Uses AI to brainstorm and describe different structural and stylistic variations for a common UI component, helping you break out of familiar patterns.',
        prompt:
          "Act as an innovative UI Designer leveraging AI for creative exploration. I'm working on a UI component and want to explore different design approaches beyond my initial idea.\n\nI will tell you the component I'm designing. You will then generate three distinct variations for that component, each with a description covering:\n- **Layout & Structure:** How the elements are arranged.\n- **Visual Style:** The aesthetic feel (e.g., minimalist, playful, data-dense).\n- **Key Interaction:** A unique interactive element or behavior.\n\nYour goal is to provide concrete, diverse ideas that I can then go and visualize.\n\n--- UI COMPONENT ---\n[e.g., 'A product card for an e-commerce site,' 'A dashboard widget for displaying key metrics,' 'A user profile screen.']",
      },
    ],
  },
  {
    id: 'designers-senior',
    title: 'Designer: Senior/Lead',
    recipes: [
      {
        id: 'design-lead-strategy-doc',
        title: 'Design Strategy Document Drafter',
        description:
          'Helps you structure and write a high-level design strategy document, articulating the vision, principles, and priorities for your product area.',
        prompt:
          "Act as a Head of Design. I need to create a design strategy document to align my team and stakeholders on a long-term vision.\n\nI will provide the product area and our key business goals. You will then generate an outline for my strategy document and help me flesh out each section by asking probing questions.\n\nThe document outline should include:\n1. **Product Vision:** A brief, aspirational statement about the future state of the user experience.\n2. **Design Principles:** A set of 3-5 memorable principles that will guide our design decisions (e.g., 'Effortless over comprehensive,' 'Clarity over cleverness').\n3. **Strategic Pillars:** 2-3 key themes or focus areas for our design work over the next year (e.g., 'Improve Onboarding,' 'Streamline Core Workflow').\n4. **Success Metrics:** How we will measure the impact of our design efforts (e.g., 'Increase in user satisfaction score,' 'Reduction in time-on-task').\n\nFor each section, you will ask me a question to help me generate the content.\n\n--- PRODUCT AREA & GOALS ---\n[Your product area and goals here]",
      },
      {
        id: 'design-lead-workshop-planner',
        title: 'Cross-Functional Alignment Workshop Planner',
        description:
          'Helps you plan and structure a collaborative workshop (like a design sprint or kickoff) to ensure alignment between product, engineering, and design.',
        prompt:
          "Act as an expert workshop facilitator. I need to plan a workshop to kick off a new project and get my cross-functional partners in engineering and product aligned.\n\nI will tell you the goal of the workshop and who will be attending. You will then generate a detailed agenda for a 3-hour workshop, including:\n- **Workshop Title & Goal**\n- **Attendees & Roles**\n- **Agenda with Timings:** A step-by-step schedule of activities.\n- **Activity Descriptions:** For each key activity (e.g., 'How Might We' brainstorming, 'User Journey Mapping'), provide a brief description and the desired outcome.\n- **Materials Needed:** A list of required materials (e.g., 'Miro board, sticky notes, markers').\n\n--- WORKSHOP CONTEXT ---\n**Goal:**\n**Attendees:**",
      },
      {
        id: 'design-lead-persona-stress-test-ai',
        title: 'AI Persona Stress-Tester',
        description:
          'Uses an AI to role-play a specific user persona, providing feedback on a proposed user flow to uncover potential friction or confusion.',
        prompt:
          "Act as an advanced AI research assistant. I want you to simulate a user test for me. I will provide you with a detailed user persona and a proposed user flow. \n\nYour task is to adopt the persona and 'walk through' the user flow step-by-step. For each step, you will provide feedback from the persona's point of view, focusing on:\n- **Clarity & Understanding:** 'What am I seeing here? Do I understand what I'm supposed to do next?'\n- **Motivation & Goals:** 'Does this step help me achieve my goal? Is this what I expected to happen?'\n- **Potential Friction:** 'What might confuse or frustrate me at this step? What questions do I have?'\n\nThis simulation will help me identify potential usability issues before I build a prototype.\n\n--- USER PERSONA ---\n[Paste a detailed user persona, including goals, motivations, and pain points.]\n\n--- USER FLOW ---\n[Describe the user flow step-by-step]",
      },
    ],
  },
  // == Leaders ==
  {
    id: 'leaders-team',
    title: 'Leader: Team Lead/Manager',
    recipes: [
      {
        id: 'lead-mgr-growth-convo-prep',
        title: 'Career Growth Conversation Planner',
        description:
          'Helps you structure a meaningful career development 1:1 with a direct report, moving beyond status updates to focus on their long-term goals and aspirations.',
        prompt:
          "Act as an experienced VP of Engineering who is a certified career coach. I am an Engineering Manager preparing for a career growth conversation with one of my direct reports. I want this to be a highly effective and motivating session.\n\nI will provide context about my team member. You will then generate a structured agenda and a set of powerful, open-ended questions for me to use.\n\nThe agenda should have three parts:\n1. **Looking Back (Reflection):** Questions to help them reflect on their accomplishments and learnings over the last 6-12 months.\n2. **Looking Forward (Aspiration):** Questions to help them articulate their long-term career goals, interests, and what kind of work energizes them.\n3. **Closing the Gap (Action Plan):** Questions to brainstorm concrete actions, projects, or skills they can develop in the next quarter to move toward their goals.\n\nFor each part, provide 2-3 thoughtful questions.\n\n--- DIRECT REPORT CONTEXT ---\n**Name:**\n**Role & Level:**\n**Strengths:** [e.g., 'Excellent at debugging complex issues, very reliable.']\n**Areas for Growth:** [e.g., 'Could be more proactive in design discussions, wants to develop leadership skills.']\n**Recent Accomplishments:** [e.g., 'Led the successful launch of the new reporting feature.']",
      },
      {
        id: 'lead-mgr-delegation-planner',
        title: 'Effective Delegation Planner',
        description:
          "Guides you to delegate tasks in a way that develops your team members' skills and empowers them, rather than simply offloading your own work.",
        prompt:
          "Act as a senior engineering director, mentoring a new manager on the art of effective delegation. I have a task I need to delegate to someone on my team, and I want to do it thoughtfully.\n\nI will describe the task and the potential team member I'm considering. You will then walk me through a 5-step delegation checklist by asking me a series of questions:\n1. **Define the 'What' and 'Why':** 'What is the specific, desired outcome of this task? Why is this task important for the team or the business?'\n2. **Select the Right Person:** 'Why is this person the right choice for this task? What specific skill or experience do you hope they will gain from it?'\n3. **Set Clear Expectations:** 'How will you define and communicate 'success' for this task? What is the deadline? What level of autonomy will they have (e.g., 'Follow these steps exactly' vs. 'Achieve this outcome, the approach is up to you')?'\n4. **Provide Resources & Support:** 'What information, tools, or introductions do they need to be successful? How and when will you check in on their progress?'\n5. **Plan for Feedback:** 'How will you provide constructive feedback on their work once it's complete, regardless of the outcome?'\n\n--- DELEGATION CONTEXT ---\n**Task to Delegate:** [e.g., 'Investigate and choose a new logging library for our services.']\n**Team Member:**",
      },
      {
        id: 'lead-mgr-unblocker-bot',
        title: "Daily Stand-up 'Unblocker' Bot",
        description:
          "Analyzes a transcript of your team's daily stand-up notes to proactively identify potential blockers, risks, and dependencies that require your attention.",
        prompt:
          "Act as a highly observant and proactive Agile Coach. I'm an Engineering Manager, and I want to get more signal out of my team's daily stand-up. I will paste the notes or a transcript from today's meeting below.\n\nYour task is to analyze the text and highlight potential issues for me to follow up on. Provide your output in three sections:\n1. **Potential Blockers:** Identify any statements where a team member mentions they are 'stuck,' 'waiting on,' 'blocked by,' or having trouble with something. List the person and the issue.\n2. **Cross-Team Dependencies:** Pinpoint any mentions of other teams, services, or individuals outside our immediate team. These are potential communication or coordination points.\n3. **Emerging Risks:** Detect subtle hints of risk, such as mentions of 'unexpected complexity,' 'taking longer than I thought,' or uncertainty about requirements. These are issues that might become blockers tomorrow.\n\nFor each item you identify, suggest a simple follow-up question I could ask the relevant team member.\n\n--- STAND-UP NOTES/TRANSCRIPT ---\n[Your stand-up notes here]",
      },
      {
        id: 'lead-mgr-onboarding-plan',
        title: 'New Hire 30-60-90 Day Plan',
        description:
          'Helps you create a structured, comprehensive onboarding plan for a new engineer, setting them up for success from day one.',
        prompt:
          "Act as an experienced Engineering Manager who is a master at onboarding new hires. I need to create a 30-60-90 day plan for a new engineer joining my team.\n\nI will provide the new hire's role, level, and the team's primary focus. Based on this, you will generate a structured onboarding plan broken down into three phases:\n\n**First 30 Days: Learning & Immersion**\n*   **Goal:** The primary goal for this phase.\n*   **Key Activities:** A list of specific tasks (e.g., 'Set up development environment,' 'Complete HR onboarding,' 'Pair program with a senior engineer on a small bug fix').\n*   **Key Introductions:** A list of people they should meet.\n*   **Success Metric:** How we will know they are on track.\n\n**Days 31-60: Contribution & Integration**\n*   **Goal:** The primary goal for this phase.\n*   **Key Activities:** A list of tasks with increasing ownership (e.g., 'Take on their first medium-sized feature ticket,' 'Lead a code review for a peer').\n*   **Success Metric:** How we will know they are integrating well.\n\n**Days 61-90: Ownership & Initiative**\n*   **Goal:** The primary goal for this phase.\n*   **Key Activities:** A list of tasks demonstrating autonomy (e.g., 'Propose and lead a small technical improvement project,' 'Become the point person for a specific component').\n*   **Success Metric:** How we will know they are becoming a fully independent contributor.\n\n--- NEW HIRE CONTEXT ---\n**Role & Level:** [e.g., Mid-Level Frontend Engineer]\n**Team Focus:** [e.g., 'Building out the new user dashboard in React and TypeScript.']",
      },
    ],
  },
  {
    id: 'leaders-director',
    title: 'Leader: Director/VP',
    recipes: [
      {
        id: 'lead-dir-eng-business-align',
        title: 'Engineering Initiative to Business Value Translator',
        description:
          'Helps you translate a major technical initiative into a compelling narrative focused on business outcomes (e.g., revenue, cost, risk) for an executive audience.',
        prompt:
          "Act as a strategic CFO who is a former engineer. I am an engineering leader who needs to pitch a significant technical initiative to our CEO and the rest of the executive team. I need your help to frame it in the language of business value, not technical details.\n\nI will describe the engineering initiative. You will then help me build the business case byasking me questions that connect the technical work to one of the four key business drivers: \n1. **Increasing Revenue:** 'How will this initiative directly or indirectly lead to more revenue? (e.g., enabling a new product line, increasing conversion rates, improving customer retention).'\n2. **Decreasing Costs:** 'How will this initiative reduce operational costs? (e.g., lowering infrastructure spend, reducing manual support tickets, improving developer efficiency).'\n3. **Mitigating Risk:** 'What specific business risk does this initiative mitigate? (e.g., avoiding security breaches and fines, preventing costly outages, ensuring regulatory compliance).'\n4. **Improving Optionality:** 'How does this initiative give the business more strategic options in the future? (e.g., enabling faster entry into new markets, making it easier to experiment with new features).'\n\nAfter our dialogue, synthesize my answers into a 1-page executive summary titled 'The Business Case for [Initiative Name]'.\n\n--- ENGINEERING INITIATIVE ---\n[Your initiative description here]",
      },
      {
        id: 'lead-dir-bottleneck-analysis',
        title: 'Org-Wide Bottleneck Analysis',
        description:
          'Guides you to analyze common engineering metrics (like cycle time, deployment frequency) to diagnose systemic process bottlenecks across your organization.',
        prompt:
          "Act as a data scientist specializing in engineering operations (like the DORA metrics). I am an engineering leader, and I have a feeling my organization's processes are inefficient, but I don't know where the bottleneck is. I will provide you with some high-level observations or metrics.\n\nYour task is to act as a diagnostic expert. Based on the symptoms I describe, you will:\n1. **Formulate a Primary Hypothesis:** State the most likely systemic bottleneck (e.g., 'The data suggests a bottleneck in the code review process.').\n2. **Suggest Key Metrics to Investigate:** List 2-3 specific, measurable metrics that would help prove or disprove your hypothesis (e.g., 'Pull Request Time-to-Merge', 'Number of comments per PR').\n3. **Propose Potential Root Causes:** List several common root causes for this type of bottleneck (e.g., 'Lack of clear ownership for services,' 'Insufficient number of senior reviewers,' 'No automated testing to build confidence.').\n4. **Recommend a Next Step:** Suggest a concrete, low-effort next step I could take to validate the root cause (e.g., 'Interview three senior engineers about their experience with the code review process.').\n\n--- SYMPTOMS / OBSERVATIONS ---\n[Your observations here]",
      },
      {
        id: 'lead-dir-rd-capitalization-narrative',
        title: 'R&D Capitalization Narrative Builder',
        description:
          'Helps you construct a data-driven narrative to justify engineering headcount, budget, or R&D spending to your CFO and executive team.',
        prompt:
          "Act as a seasoned VP of Finance who partners closely with Engineering. I am an engineering leader preparing for our annual budget planning, and I need to justify my request for additional headcount and resources. Help me build a narrative that the CFO will understand and approve.\n\nI will state my 'ask' (e.g., 'I need to hire 5 more senior engineers'). You will then guide me to build the justification by asking me a series of questions structured around a financial narrative:\n1. **The Investment:** 'What is the total cost of your request (fully loaded)?'\n2. **The Strategic Alignment:** 'Which specific company-level strategic goal for the upcoming year does this investment support?'\n3. **The Expected Return (ROI):** 'What is the measurable business outcome this investment will produce? Frame it in terms of revenue generated, costs saved, or risk averted. Be specific and quantify where possible (e.g., 'This team will build Feature X, which is projected to increase customer retention by 2%, saving $500k annually').'\n4. **The Cost of Inaction:** 'What is the business consequence if we *don't* make this investment? What opportunity will we miss? What risk will we be exposed to?'\n\nAfter I provide the answers, synthesize them into a concise, one-page memo titled 'Investment Proposal:' that I can use as the basis for my budget presentation.\n\n--- MY BUDGET 'ASK' ---\n[Your budget ask here]",
      },
    ],
  },
  {
    id: 'qa-engineers',
    title: 'QA Engineers',
    recipes: [
      {
        id: 'qa-test-case-generator',
        title: 'Comprehensive Test Case Generator',
        description:
          'Generates a full suite of test cases (functional, edge case, negative, exploratory) from a user story or feature spec.',
        prompt:
          "Act as a meticulous QA Lead with a decade of experience in both manual and automated testing. I am going to provide a user story or technical specification for a new feature. Your task is to generate a comprehensive test plan in Markdown format.\n\nThe plan should include the following sections:\n1.  **Positive Test Cases (Happy Path):** A list of test cases that verify the primary functionality works as expected.\n2.  **Negative Test Cases:** A list of test cases that verify the system gracefully handles invalid input or error states.\n3.  **Edge Case Tests:** A list of test cases that probe the boundaries and limits of the system (e.g., empty inputs, maximum values, unusual character sets).\n4.  **Exploratory Testing Charter:** A mission statement for an exploratory testing session, including what areas to focus on and what types of bugs to look for (e.g., 'Mission: Explore the user profile page to find any UI inconsistencies or confusing workflows. Look for issues related to data formatting and user permissions.').\n\nFor each test case, provide a 'Test Description' and 'Expected Result'.\n\n--- FEATURE SPECIFICATION ---\n[Paste your user story or feature spec here]",
      },
      {
        id: 'qa-failure-diagnoser',
        title: 'Test Failure Diagnoser',
        description:
          'Analyzes a failed test log or description to suggest potential root causes and debugging paths for the development team.',
        prompt:
          'Act as a Senior QA Automation Engineer with deep expertise in root cause analysis. A test has failed in our CI/CD pipeline, and I need your help to diagnose the likely cause before I hand it over to a developer. I will provide the failed test log and a description of the test.\n\nYour task is to analyze the information and provide:\n1.  **A Summary of the Failure:** In one sentence, what failed and what was the expected outcome?\n2.  **Top 3 Potential Root Causes:** List the three most likely causes for this failure, ordered from most to least probable. For each cause, provide a brief explanation. (e.g., 1. Backend API Change: The API contract may have changed, causing the frontend test to fail. 2. Environment Issue: A dependency in the test environment might be down or misconfigured. 3. Frontend Race Condition: The test might be flaky due to a timing issue in the UI code.)\n4.  **A Recommended First Action:** Suggest the single most effective first step a developer should take to confirm the root cause.\n\n--- FAILED TEST LOG & DESCRIPTION ---\n[Paste the logs and a brief description of what the test was supposed to do here]',
      },
      {
        id: 'qa-testability-reviewer',
        title: 'Testability Review Assistant',
        description:
          'Reviews a technical spec or feature plan to proactively identify potential testing challenges and suggest design improvements for better testability.',
        prompt:
          "Act as a Principal Software Development Engineer in Test (SDET) who is a champion for building testable software. I am a QA engineer reviewing a technical specification for a new feature *before* development begins. I want to identify any potential testability issues early.\n\nI will provide the technical spec below. Please review it and provide:\n1.  **Clarifying Questions for the Team:** A list of questions that will help uncover hidden assumptions or ambiguities that could make testing difficult.\n2.  **Potential Testability Blind Spots:** Identify any parts of the design that seem hard to test with automation (e.g., dependencies on third-party systems, complex UI interactions, lack of clear API contracts).\n3.  **Suggestions for Improved Testability:** Propose concrete changes to the design that would make the feature easier to test. (e.g., 'Consider adding a health check endpoint to this new service,' 'Ensure this feature is controlled by a feature flag to allow for safe testing in production,' 'Can we use dependency injection to mock this external service in our integration tests?').\n\n--- TECHNICAL SPECIFICATION ---\n[Paste the technical spec or feature plan here]",
      },
      {
        id: 'qa-dependency-vulnerability-scanner',
        title: 'Dependency Vulnerability Scanner',
        description:
          'Analyzes a dependency file (like package.json) to identify potential security vulnerabilities and suggest mitigation strategies.',
        prompt:
          "Act as a proactive Security Engineer specializing in software supply chain security. I'm a QA engineer preparing for a new release, and I need to perform a basic security audit of our project's dependencies.\n\nI will paste the contents of our dependency file (e.g., package.json, requirements.txt) below. Your task is to:\n1. **Identify High-Risk Dependencies:** List any known outdated packages or libraries with publicly disclosed vulnerabilities (CVEs). You may need to use your training data to approximate this, but be clear that it's an estimation.\n2. **Categorize the Risks:** For each identified risk, categorize its severity (e.g., Critical, High, Medium, Low) and the type of vulnerability (e.g., Remote Code Execution, Cross-Site Scripting).\n3. **Propose an Action Plan:** For the highest-risk items, suggest a clear action plan. This should include the recommended version to upgrade to and any potential breaking changes to be aware of.\n4. **Provide a General Best Practice:** Offer one general best practice for maintaining a secure software supply chain.\n\n--- DEPENDENCY FILE CONTENT ---\n[Paste file content here]",
      },
      {
        id: 'qa-security-test-case-generator',
        title: 'Security Test Case Generator (OWASP Top 10)',
        description:
          'Generates a set of security-focused test cases for a new feature, based on the OWASP Top 10 vulnerabilities.',
        prompt:
          "Act as a Penetration Tester and a Senior QA Engineer. I am testing a new feature, and I need to ensure it's secure. I will describe the feature below.\n\nBased on my description, your task is to generate a list of security test cases inspired by the OWASP Top 10. For each test case, specify:\n- The **Vulnerability Category** you are testing for (e.g., A01: Broken Access Control, A03: Injection).\n- The **Test Case Description:** A clear, actionable step to perform.\n- The **Expected Result:** What a secure system should do.\n\nExample categories to consider:\n- Injection (SQL, Command)\n- Broken Authentication\n- Broken Access Control\n- Insecure Design\n- Security Misconfiguration\n\n--- FEATURE DESCRIPTION ---\n[e.g., 'A new user profile page where users can update their email address and view their order history. The page is protected and requires a user to be logged in.']",
      },
    ],
  },
  {
    id: 'architects',
    title: 'Architects',
    recipes: [
      {
        id: 'arch-tradeoff-analysis',
        title: 'Architectural Trade-Off Analysis',
        description:
          'Provides a structured framework to systematically evaluate and document complex architectural decisions and their trade-offs.',
        prompt:
          "Act as a Principal Engineer facilitating an architectural review. I need to decide between several architectural approaches for a new system. Your task is to guide me through a structured trade-off analysis.\n\nI will provide the proposed architectural options and the key non-functional requirements (NFRs) for the system.\n\nYour task is to generate a Markdown table that I can use to evaluate the options. The table should have:\n- **Rows:** Each architectural option.\n- **Columns:** Each key non-functional requirement (e.g., Scalability, Cost, Maintainability, Performance, Team Familiarity).\n\nAfter generating the empty table, provide a set of probing questions for each NFR to help me fill it out objectively.\n\nExample Question for Scalability: 'How does this option handle a 10x increase in load? What is the first component that would break?'\n\n--- ARCHITECTURAL OPTIONS & NFRs ---\n**Options:** [e.g., 'A: Serverless functions with a NoSQL database', 'B: A containerized monolith on Kubernetes with a Postgres database']\n**NFRs:** [e.g., 'Must scale to 1M users', 'Must have low operational overhead', 'Must be developed by a team with strong Python skills']",
      },
      {
        id: 'arch-nfr-checklist',
        title: 'NFR Checklist Generator',
        description:
          'Generates a comprehensive checklist of non-functional requirements (NFRs) to consider for a new project, preventing common architectural blind spots.',
        prompt:
          "Act as a seasoned Solutions Architect. I am starting the design for a new project, and I want to ensure I don't forget any critical non-functional requirements (NFRs). I will provide a brief description of the project.\n\nBased on my description, your task is to generate a checklist of NFR categories and specific questions I should consider within each category. The checklist should cover areas like:\n- **Availability & Reliability:** (e.g., What is the target SLO/SLA? What is the disaster recovery plan?)\n- **Scalability & Performance:** (e.g., What is the expected load? What are the latency requirements?)\n- **Security:** (e.g., What are the data classification levels? What are the authentication and authorization requirements?)\n- **Maintainability & Operability:** (e.g., How will we monitor this system? How will we handle logging and tracing?)\n- **Cost:** (e.g., What is the target operational cost? How can we design for cost-efficiency?)\n\n--- PROJECT DESCRIPTION ---\n[e.g., 'A new public-facing API for our B2B customers to retrieve their data.']",
      },
      {
        id: 'arch-new-tech-eval',
        title: 'New Technology Evaluation Framework',
        description:
          'Provides a structured framework for evaluating and deciding whether to adopt a new technology, tool, or framework.',
        prompt:
          "Act as a pragmatic CTO. My team is proposing that we adopt a new technology (e.g., a new database, a new programming language, a new framework). I need to make a well-reasoned decision. Your task is to provide me with a structured evaluation framework.\n\nGenerate a list of key evaluation criteria as a series of questions that I should ask my team. The criteria should cover:\n1. **Business & Product Alignment:** (e.g., 'What specific, existing problem does this technology solve for us? How does it help us achieve our product or business goals?')\n2. **Technical & Architectural Fit:** (e.g., 'How does this technology fit into our existing architecture? What is the learning curve for our team?')\n3. **Operational Impact:** (e.g., 'What is the operational cost of running this in production? How do we monitor and support it?')\n4. **Ecosystem & Community:** (e.g., 'How mature is this technology? Is there a strong community and good documentation?')\n5. **Risks:** (e.g., 'What is the risk if we *don't* adopt this? What is the risk if we *do* and it's the wrong choice?')\n\nAfter the list of questions, provide a template for a simple 'Decision Scorecard' in a Markdown table to compare the new technology against the status quo.",
      },
    ],
  },
  {
    id: 'devops-sre',
    title: 'DevOps / SRE',
    recipes: [
      {
        id: 'devops-alert-triage',
        title: 'On-Call Alert Triage',
        description:
          'Analyzes an alert from a monitoring system to suggest potential root causes and initial diagnostic steps for the on-call engineer.',
        prompt:
          "Act as a Senior Site Reliability Engineer (SRE). I am the on-call engineer and I've just received a critical alert. I need your help to quickly understand the situation and decide on the next steps.\n\nI will paste the alert details below. Your task is to:\n1.  **Summarize the Alert:** In one sentence, what is the core problem being reported?\n2.  **Formulate 3 Hypotheses:** Based on the alert, list the three most likely root causes, from most to least probable.\n3.  **Suggest an Initial Action Plan:** Provide a short, ordered list of the first 2-3 commands or checks I should run to validate the most likely hypothesis and assess the blast radius.\n\n--- ALERT DETAILS ---\n[e.g., 'ALERT: High Latency on api-service. P99 latency is > 2000ms for the last 15 minutes. Source: Datadog.']",
      },
      {
        id: 'devops-golden-signals',
        title: 'Golden Signals Monitoring Plan',
        description:
          "Generates a monitoring and alerting plan for a new service based on Google's 'Four Golden Signals' of SRE.",
        prompt:
          "Act as a Staff Site Reliability Engineer (SRE) who is an expert in observability. I am launching a new microservice, and I need to set up a comprehensive monitoring dashboard and alerting strategy. I will provide a description of the service.\n\nBased on my description, please generate a monitoring plan based on Google's Four Golden Signals. For each signal, provide:\n1.  **The Signal:** (Latency, Traffic, Errors, Saturation)\n2.  **Key Metric to Track:** The specific metric that best represents this signal for my service.\n3.  **A Suggested SLI/SLO:** A reasonable Service Level Indicator and Objective to aim for.\n4.  **A Sample Alerting Rule:** A simple rule for when to trigger an alert.\n\n--- SERVICE DESCRIPTION ---\n[e.g., 'A stateless API service that handles user authentication. It receives about 1000 requests per minute and depends on a Postgres database.']",
      },
      {
        id: 'devops-cicd-generator',
        title: 'CI/CD Workflow Generator',
        description:
          'Generates a starter CI/CD pipeline configuration file (e.g., for GitHub Actions) for a new service, automating a common and repetitive task.',
        prompt:
          "Act as a DevOps Engineer. I need to create a basic CI/CD pipeline for a new service. I will specify the service type and language.\n\nYour task is to generate a starter workflow configuration file for GitHub Actions. The workflow should include the following stages:\n1.  **Trigger:** The pipeline should run on every push to the `main` branch and on every pull request.\n2.  **Build:** A step to check out the code and install dependencies.\n3.  **Test:** A step to run the unit tests.\n4.  **Lint:** A step to check for code style issues.\n\n(Note: Do not include a deployment step, as that is environment-specific.)\n\n--- SERVICE TYPE & LANGUAGE ---\n[e.g., 'A Node.js/TypeScript web server']",
      },
    ],
  },
  // == Additional High-Value Prompts ==
  {
    id: 'eng-advanced',
    title: 'Engineer: Advanced',
    recipes: [
      {
        id: 'eng-adv-performance-optimizer',
        title: 'Performance Optimization Analyzer',
        description:
          'Identifies performance bottlenecks and suggests optimizations for slow code',
        prompt:
          'You are a performance optimization expert. Analyze this code for performance issues:\n\n[CODE]\n\nProvide:\n1. Identified bottlenecks (with Big O analysis)\n2. Specific optimization recommendations\n3. Expected performance improvements\n4. Trade-offs to consider',
      },
      {
        id: 'eng-adv-security-audit',
        title: 'Security Vulnerability Scanner',
        description:
          'Reviews code for common security vulnerabilities and suggests fixes',
        prompt:
          'You are a security expert. Review this code for vulnerabilities:\n\n[CODE]\n\nCheck for:\n- SQL injection\n- XSS attacks\n- CSRF vulnerabilities\n- Authentication issues\n- Data exposure\n\nProvide severity ratings and fix recommendations.',
      },
      {
        id: 'eng-adv-refactor-guide',
        title: 'Refactoring Guide',
        description:
          'Suggests refactoring strategies to improve code quality and maintainability',
        prompt:
          'You are a clean code expert. Analyze this code and suggest refactorings:\n\n[CODE]\n\nProvide:\n1. Code smells identified\n2. Refactoring patterns to apply\n3. Step-by-step refactoring plan\n4. Expected benefits',
      },
      {
        id: 'eng-adv-test-generator',
        title: 'Test Case Generator',
        description: 'Generates comprehensive test cases including edge cases',
        prompt:
          'You are a testing expert. Generate test cases for this function:\n\n[CODE]\n\nProvide:\n1. Happy path tests\n2. Edge cases\n3. Error scenarios\n4. Integration test ideas\n5. Test data examples',
      },
      {
        id: 'eng-adv-api-designer',
        title: 'API Design Consultant',
        description: 'Designs RESTful APIs following best practices',
        prompt:
          'You are an API design expert. Design an API for:\n\n[REQUIREMENTS]\n\nProvide:\n1. Endpoint structure\n2. Request/response schemas\n3. Error handling strategy\n4. Versioning approach\n5. Authentication method',
      },
    ],
  },
  {
    id: 'pm-advanced',
    title: 'Product Manager: Advanced',
    recipes: [
      {
        id: 'pm-adv-roadmap-builder',
        title: 'Product Roadmap Builder',
        description:
          'Creates strategic product roadmaps aligned with business goals',
        prompt:
          'You are a product strategy expert. Help me build a roadmap for:\n\n[PRODUCT/FEATURE]\n\nProvide:\n1. Strategic themes (quarterly)\n2. Key initiatives\n3. Success metrics\n4. Dependencies and risks\n5. Resource requirements',
      },
      {
        id: 'pm-adv-user-story-writer',
        title: 'User Story Generator',
        description: 'Writes detailed user stories with acceptance criteria',
        prompt:
          'You are a product owner expert. Write user stories for:\n\n[FEATURE]\n\nFormat:\n- As a [user type]\n- I want [goal]\n- So that [benefit]\n\nInclude:\n- Acceptance criteria\n- Edge cases\n- Dependencies\n- Estimated complexity',
      },
      {
        id: 'pm-adv-metrics-framework',
        title: 'Metrics Framework Designer',
        description:
          'Designs comprehensive metrics frameworks for product success',
        prompt:
          'You are a product analytics expert. Design metrics for:\n\n[PRODUCT/FEATURE]\n\nProvide:\n1. North Star Metric\n2. Leading indicators\n3. Lagging indicators\n4. Counter-metrics\n5. Measurement plan',
      },
      {
        id: 'pm-adv-pricing-strategy',
        title: 'Pricing Strategy Consultant',
        description: 'Develops pricing models and strategies',
        prompt:
          'You are a pricing strategy expert. Design pricing for:\n\n[PRODUCT]\n\nAnalyze:\n1. Value-based pricing\n2. Competitive positioning\n3. Packaging tiers\n4. Pricing psychology\n5. Revenue projections',
      },
      {
        id: 'pm-adv-ab-test-designer',
        title: 'A/B Test Designer',
        description: 'Designs statistically valid A/B tests',
        prompt:
          'You are an experimentation expert. Design an A/B test for:\n\n[HYPOTHESIS]\n\nProvide:\n1. Test hypothesis\n2. Success metrics\n3. Sample size calculation\n4. Test duration\n5. Variants to test\n6. Analysis plan',
      },
    ],
  },
  {
    id: 'designer-advanced',
    title: 'Designer: Advanced',
    recipes: [
      {
        id: 'des-adv-design-system',
        title: 'Design System Architect',
        description: 'Creates comprehensive design system documentation',
        prompt:
          'You are a design systems expert. Create a design system for:\n\n[PRODUCT]\n\nInclude:\n1. Color palette (with accessibility)\n2. Typography scale\n3. Spacing system\n4. Component library structure\n5. Usage guidelines',
      },
      {
        id: 'des-adv-ux-audit',
        title: 'UX Audit Specialist',
        description:
          'Conducts thorough UX audits with actionable recommendations',
        prompt:
          'You are a UX audit expert. Audit this experience:\n\n[DESCRIPTION/SCREENSHOTS]\n\nAnalyze:\n1. Usability issues\n2. Accessibility problems\n3. Information architecture\n4. Visual hierarchy\n5. Interaction patterns\n\nProvide prioritized recommendations.',
      },
      {
        id: 'des-adv-user-flow',
        title: 'User Flow Designer',
        description: 'Maps detailed user flows and journey maps',
        prompt:
          'You are a user experience expert. Design user flows for:\n\n[TASK/GOAL]\n\nProvide:\n1. Entry points\n2. Decision points\n3. Happy path\n4. Error states\n5. Exit points\n6. Pain points to address',
      },
      {
        id: 'des-adv-accessibility',
        title: 'Accessibility Consultant',
        description: 'Ensures designs meet WCAG standards',
        prompt:
          'You are an accessibility expert. Review this design:\n\n[DESIGN/DESCRIPTION]\n\nCheck:\n1. WCAG 2.1 AA compliance\n2. Color contrast ratios\n3. Keyboard navigation\n4. Screen reader support\n5. ARIA labels\n\nProvide specific fixes.',
      },
      {
        id: 'des-adv-microcopy',
        title: 'Microcopy Writer',
        description: 'Crafts effective UI copy and error messages',
        prompt:
          'You are a UX writer. Write microcopy for:\n\n[CONTEXT]\n\nProvide:\n1. Button labels\n2. Error messages\n3. Empty states\n4. Success messages\n5. Helper text\n\nMake it clear, concise, and friendly.',
      },
    ],
  },
  {
    id: 'qa-advanced',
    title: 'QA Engineer: Advanced',
    recipes: [
      {
        id: 'qa-adv-test-strategy',
        title: 'Test Strategy Architect',
        description: 'Designs comprehensive test strategies',
        prompt:
          'You are a test strategy expert. Create a test strategy for:\n\n[FEATURE/PRODUCT]\n\nInclude:\n1. Test levels (unit, integration, e2e)\n2. Test types (functional, performance, security)\n3. Automation strategy\n4. Risk assessment\n5. Coverage goals',
      },
      {
        id: 'qa-adv-automation-framework',
        title: 'Test Automation Framework Designer',
        description: 'Designs scalable test automation frameworks',
        prompt:
          'You are a test automation expert. Design a framework for:\n\n[TECH STACK]\n\nProvide:\n1. Framework architecture\n2. Tool selection\n3. Page object model structure\n4. CI/CD integration\n5. Reporting strategy',
      },
      {
        id: 'qa-adv-performance-test',
        title: 'Performance Test Designer',
        description: 'Creates performance and load testing scenarios',
        prompt:
          'You are a performance testing expert. Design tests for:\n\n[SYSTEM]\n\nProvide:\n1. Load scenarios\n2. Performance metrics\n3. Baseline targets\n4. Stress test cases\n5. Monitoring strategy',
      },
      {
        id: 'qa-adv-security-test',
        title: 'Security Test Planner',
        description: 'Plans security testing and penetration tests',
        prompt:
          'You are a security testing expert. Plan security tests for:\n\n[APPLICATION]\n\nInclude:\n1. Threat modeling\n2. Vulnerability scanning\n3. Penetration test scenarios\n4. Security test cases\n5. Compliance checks',
      },
      {
        id: 'qa-adv-bug-report',
        title: 'Bug Report Generator',
        description: 'Creates detailed, reproducible bug reports',
        prompt:
          'You are a QA expert. Write a bug report for:\n\n[BUG DESCRIPTION]\n\nFormat:\n1. Title (clear, specific)\n2. Steps to reproduce\n3. Expected vs actual behavior\n4. Environment details\n5. Screenshots/logs\n6. Severity and priority\n7. Suggested fix (if known)',
      },
    ],
  },
  {
    id: 'devops-advanced',
    title: 'DevOps/SRE: Advanced',
    recipes: [
      {
        id: 'devops-adv-ci-cd',
        title: 'CI/CD Pipeline Designer',
        description: 'Designs robust CI/CD pipelines',
        prompt:
          'You are a DevOps expert. Design a CI/CD pipeline for:\n\n[PROJECT]\n\nInclude:\n1. Build stages\n2. Test automation\n3. Deployment strategy\n4. Rollback plan\n5. Security scanning\n6. Performance checks',
      },
      {
        id: 'devops-adv-monitoring',
        title: 'Monitoring Strategy Designer',
        description: 'Creates comprehensive monitoring and alerting strategies',
        prompt:
          'You are an SRE expert. Design monitoring for:\n\n[SYSTEM]\n\nProvide:\n1. Key metrics (RED/USE)\n2. Alert thresholds\n3. Dashboards\n4. Log aggregation\n5. Incident response\n6. SLO/SLA definitions',
      },
      {
        id: 'devops-adv-infrastructure',
        title: 'Infrastructure as Code Architect',
        description: 'Designs IaC solutions with best practices',
        prompt:
          'You are an infrastructure expert. Design IaC for:\n\n[REQUIREMENTS]\n\nProvide:\n1. Tool selection (Terraform/CloudFormation)\n2. Module structure\n3. State management\n4. Environment strategy\n5. Security best practices',
      },
      {
        id: 'devops-adv-incident',
        title: 'Incident Response Planner',
        description: 'Creates incident response procedures',
        prompt:
          'You are an incident management expert. Create a response plan for:\n\n[SYSTEM/SERVICE]\n\nInclude:\n1. Severity definitions\n2. Escalation paths\n3. Communication templates\n4. Runbooks\n5. Post-mortem process',
      },
    ],
  },
];
