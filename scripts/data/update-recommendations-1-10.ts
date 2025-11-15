#!/usr/bin/env tsx
/**
 * Update Recommendations 1-10 with revisions and improvements
 * 
 * Updates existing recommendations with improved content
 */

import * as fs from 'fs';
import * as path from 'path';
import { Recommendation, RecommendationsJsonData } from '../../src/lib/workflows/recommendation-schema';

const RECOMMENDATIONS_PATH = path.join(process.cwd(), 'public', 'data', 'recommendations.json');
const BACKUP_RECOMMENDATIONS_PATH = path.join(process.cwd(), 'public', 'data', 'recommendations-backup.json');

// Updated recommendations 1-10 data
const updatedRecommendations: Partial<Recommendation>[] = [
  {
    slug: 'start-with-few-shot-learning',
    title: 'Start with Few-Shot Learning for Beginners',
    description: 'For teams new to AI, zero-shot (no examples) prompts are unreliable for complex tasks. Few-shot learning, where you provide 2-5 examples in the prompt, is a simple, highly-effective technique to guide the AI, improve accuracy, and make powerful AI tools more accessible to all developers.',
    recommendationStatement: 'Teams new to AI-assisted development should prioritize few-shot prompting patterns over zero-shot requests for any non-trivial task. Providing a few examples of the desired output (the "shots") trains the model on your specific context in real-time, dramatically improving its performance.',
    whyThisMatters: 'While large language models show remarkable zero-shot capabilities, they often fall short on complex tasks where a specific output format is needed. This leads directly to pain-point-03-hallucinated-capabilities (where the AI invents its own format) and pain-point-05-missing-context. Few-shot prompting is a form of in-context learning that steers the model to better performance by providing 2-5 demonstrations directly in the prompt. This technique is a crucial "on-ramp" for developers. It is highly efficient and flexible, offering substantial performance improvements without the high cost and complexity of fine-tuning an entire model. For teams working in established codebases, this is the most effective way to solve the pain-point-06-brownfield-penalty. You can "teach" the AI your team\'s specific coding patterns, API formats, or legacy structures by showing it examples, which enhances its adaptability and makes it a far more useful partner.',
    whenToApply: 'This recommendation should be applied whenever a zero-shot prompt provides inconsistent, incorrect, or poorly formatted results. It is the default approach for any task that requires a specific structure, style, or tone. This is especially true when asking the AI to perform tasks like: Refactoring code to a new pattern. Writing unit tests that must follow a specific team format. Generating code that interacts with a legacy or custom-built internal API.',
    implementationGuidance: 'Implementation is straightforward. Instead of just asking the AI to perform a task (zero-shot), structure your prompt to include examples. Start with a clear instruction. Provide 2-5 examples of the "input" and the corresponding "desired output." Provide your new "input" and ask the AI to generate the output. For example, instead of "Refactor this function to be a class," you would provide: Translate the following functions into the "WidgetService" class pattern. `` [My Output:] This guides the model to the exact structure you need, saving significant time.',
    relatedWorkflows: ['ai-behavior/trust-but-verify-triage', 'ai-behavior/capability-grounding-manifest'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-03-hallucinated-capabilities', 'pain-point-05-missing-context', 'pain-point-06-brownfield-penalty'],
    relatedPrompts: [],
    relatedPatterns: ['few-shot'],
    researchCitations: [],
    primaryKeywords: ['Few-shot learning', 'Prompt engineering', 'AI best practices'],
    recommendationKeywords: ['In-context learning', 'Zero-shot prompting', 'AI for beginners', 'Prompt examples'],
    solutionKeywords: ['Improve AI accuracy', 'Reduce hallucinations', 'AI for legacy code', 'Brownfield development'],
    keywords: ['ai', 'prompting', 'best-practices', 'context', 'development'],
    category: 'best-practices',
    audience: ['engineers', 'engineering-managers'],
    priority: 'high',
  },
  {
    slug: 'implement-guardrails-for-critical-code-paths',
    title: 'Implement Guardrails for Critical Code Paths',
    description: 'AI code generation accelerates development, but this speed introduces significant risk. AI-generated code can routinely contain hardcoded secrets, insecure configurations, or subtle flaws. Automated guardrails are a non-negotiable security control to catch these issues before they reach production.',
    recommendationStatement: 'You should implement automated, technical guardrails within your CI/CD pipeline and IDE to validate all code, especially AI-generated code, before it can be merged. These guardrails are the primary defense for critical paths like authentication, payments, data migrations, and API endpoints.',
    whyThisMatters: 'The mantra for modern development must be "velocity with guardrails". This is especially true with AI, which creates a new class of tradeoffs. AI-generated code is notorious for introducing pain-point-01-almost-correct-code and pain-point-19-insecure-code. In most organizations, security engineers are vastly outnumbered by developers (e.g., 100-to-1), making manual review a completely scalable bottleneck. Automated guardrails are the only solution that scales. By embedding static analysis tools directly into the CI/CD pipeline and IDE, you create an automated, non-negotiable checkpoint. These tools can be configured to specifically flag AI-generated code that violates security rules, such as input validation omissions on a data-layer guardrail. This prevents pain-point-20-schema-drift in migrations and stops insecure code from ever being deployed, ensuring security can keep pace with AI-driven development.',
    whenToApply: 'This is a foundational, Day 1 requirement before scaling AI tool adoption. It is absolutely mandatory for any codebase that handles: User authentication or authorization. Payment processing or financial data. Database migrations or direct data access. Any public-facing API that accepts user input.',
    implementationGuidance: 'Embed in the IDE: Use static code analysis tools with AI-aware rule sets directly in the developer\'s IDE. This provides real-time feedback and catches issues at the source. Enforce in CI/CD: Integrate AI-augmented Static Application Security Testing (SAST) tools (like SonarQube, Semgrep, etc.) into your CI/CD pipeline. Configure Critical Rules: Configure these tools as a required check to block merges. They must scan for high-risk issues like: SQL Injection and other injection vulnerabilities. Hardcoded secrets (API keys, passwords). Missing input validation and sanitization. Insecure data handling or PII exposure. Risky dependency usage (see Rec 23).',
    relatedWorkflows: ['process/release-readiness-runbook', 'security/security-guardrails'],
    relatedGuardrails: ['guardrails/data-integrity/prevent-data-corruption-in-ai-generated-migrations', 'guardrails/security/prevent-sql-injection-vulnerability', 'guardrails/security/prevent-hardcoded-secrets-in-ai-generated-code'],
    relatedPainPoints: ['pain-point-01-almost-correct-code', 'pain-point-19-insecure-code', 'pain-point-20-schema-drift'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['AI guardrails', 'Risk mitigation', 'AI security'],
    recommendationKeywords: ['Automated guardrails', 'Critical code paths', 'CI/CD security', 'Static Analysis (SAST)'],
    solutionKeywords: ['Prevent insecure code', 'Automated governance', 'Velocity with guardrails', 'Application security'],
    keywords: ['ai', 'security', 'guardrails', 'risk', 'cicd', 'automation'],
    category: 'risk-mitigation',
    audience: ['security', 'devops-sre', 'engineering-managers', 'cto'],
    priority: 'high',
  },
  {
    slug: 'choose-ai-model-based-on-task-requirements',
    title: 'Choose AI Model Based on Task Requirements',
    description: 'Not all AI models are created equal. A high-cost, high-reasoning model is expensive overkill for simple tasks, while a low-cost, high-speed model will fail at complex architectural problems. Using a "one size fits all" model strategy leads to uncontrolled costs and poor results.',
    recommendationStatement: 'You should select AI models based on a cost-benefit analysis of their specific capabilities. Match task complexity with the appropriate model tier (e.g., speed/cost vs. complex reasoning) to prevent unnecessary expense and solve pain-point-08-toolchain-sprawl.',
    whyThisMatters: 'The LLM landscape is fiercely competitive, with a wide array of models offering different trade-offs in performance, pricing, and capabilities. For example, a top-tier model like Anthropic\'s Claude-4 Opus is extremely powerful but costs $75 per million output tokens. A "pro" level model like Google\'s Gemini 2.5 Pro costs $10 per million output tokens, while a high-speed model like Anthropic\'s Claude-4 Sonnet costs $15. Using the most expensive model for every task is financially irresponsible. Conversely, using a cheap, fast model (like Gemini 1.5 Flash) for a complex, multi-step reasoning task will result in failure and frustrate developers. A "one size fits all" procurement strategy leads directly to pain-point-08-toolchain-sprawl as teams seek out other tools to fill the gaps, or it simply racks up an enormous, inefficient bill. A deliberate strategy that matches the model to the task is essential for cost control and performance.',
    whenToApply: 'This recommendation is critical during two phases: Tool Selection: When evaluating and procuring enterprise-wide AI coding assistants. Internal Development: When engineering teams are building internal applications or workflows that call LLM APIs.',
    implementationGuidance: 'Create a simple "Model TCO (Total Cost of Ownership)" matrix that guides selection. This should be owned by the AI Community of Practice (Rec 12) or the architecture team. Task Category | Task Example | Recommended Model Tier | Example Models Simple / Repetitive | Code formatting, syntax conversion | Lightweight / Low-Cost | Gemini 1.5 Flash Code-Specific | Generating new functions, TDD | Code-Optimized | Code Llama General Purpose | PR summaries, documentation | Balanced Speed & Cost | Claude 3.7 Sonnet, GPT-5 Complex Reasoning | System design, architecture | High-Performance | Gemini 2.5 Pro, Claude-4 Opus This matrix provides a clear framework, helping teams to default to the most cost-effective model that can still accomplish the task, while reserving high-cost models for the high-value problems that require them.',
    relatedWorkflows: ['process/platform-consolidation-playbook'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-08-toolchain-sprawl'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['AI tool selection', 'AI model comparison', 'LLM cost-benefit'],
    recommendationKeywords: ['Cost-benefit analysis', 'Task complexity', 'Model performance', 'FinOps for AI'],
    solutionKeywords: ['Prevent toolchain sprawl', 'Optimize AI costs', 'Platform consolidation', 'AI governance'],
    keywords: ['ai', 'tools', 'llm', 'models', 'cost', 'selection'],
    category: 'tool-selection',
    audience: ['cto', 'vp-engineering', 'engineering-managers', 'architects'],
    priority: 'medium',
  },
  {
    slug: 'enforce-small-prs-for-ai-code',
    title: 'Enforce Small PRs for AI-Generated Code',
    description: 'AI tools make it easy to generate thousands of lines of code in seconds. This often leads to "AI-slop" PRs that are so large they are impossible to review, hiding bugs and security flaws. This practice destroys team velocity and code quality by creating massive review bottlenecks.',
    recommendationStatement: 'You should maintain and enforce strict pull request (PR) size limits (e.g., ≤250-400 lines) for all code, especially AI-generated code.1 The ease of generation must not be allowed to bypass the human requirement for thorough, manageable review.',
    whyThisMatters: 'The adoption of AI coding tools is directly correlated with a massive increase in PR size. One 2025 report found that a 90% increase in AI adoption was associated with a 154% increase in pull request size. Another analysis found AI-assisted PRs are, on average, 18% larger. This directly causes pain-point-10-oversized-prs. Large PRs are the enemy of quality. They are cognitively overwhelming, difficult to review, and create "review fatigue".3 This fatigue is dangerous, as it\'s the primary reason that subtle pain-point-01-almost-correct-code bugs and security flaws are missed by human reviewers.2 Small, focused PRs are reviewed more quickly, are less error-prone, and are merged faster.1 Enforcing this policy is a non-negotiable guardrail to maintain human accountability and ensure the quality of your codebase.',
    whenToApply: 'This rule must be enforced for all developers on all teams as a core part of the team\'s standard development workflow. It is a critical counterpart to the adoption of any AI code-generation tool.',
    implementationGuidance: 'Set a Clear Standard: Agree on a reasonable line limit for PRs (e.g., 250-400 lines of meaningful change) and document it in your PR template.1 Automate Enforcement: Use automated tooling in your CI pipeline or code host (like GitHub/GitLab) to flag or block PRs that exceed this limit. Train Developers: Coach your team to break down large, AI-generated features. Instead of one giant PR for a new feature, they should submit a series of small, focused PRs (e.g., "1. Add data models," "2. Create service layer," "3. Build API endpoint"). Use AI for Summaries: For the small PRs you do have, use AI in the CI pipeline to automatically summarize the changes, reducing the reviewer\'s cognitive load even further (see Rec 19).4',
    relatedWorkflows: ['code-quality/keep-prs-under-control', 'process/daily-merge-discipline'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-10-oversized-prs', 'pain-point-01-almost-correct-code'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [
      {
        source: 'Creating a comprehensive code review checklist for your team - Graphite.com',
        summary: 'Code review best practices including PR size limits.',
        url: 'https://graphite.com/guides/code-review-checklist-guide',
        verified: true,
      },
      {
        source: 'Empirically supported code review best practices : r/programming - Reddit',
        summary: 'Research on code review practices and PR size.',
        url: 'https://www.reddit.com/r/programming/comments/18mghkp/empirically_supported_code_review_best_practices/',
        verified: true,
      },
      {
        source: 'A smarter code review checklist: What to track, fix, and improve - Appfire',
        summary: 'Code review checklist and PR size management.',
        url: 'https://appfire.com/resources/blog/code-review-checklist',
        verified: true,
      },
      {
        source: 'Boost your Continuous Delivery pipeline with Generative AI | Google ...',
        summary: 'Using AI for PR summaries and automated documentation.',
        url: 'https://cloud.google.com/blog/topics/developers-practitioners/boost-your-continuous-delivery-pipeline-with-generative-ai',
        verified: true,
      },
    ],
    primaryKeywords: ['Small pull requests', 'AI code review', 'Code quality'],
    recommendationKeywords: ['PR size limits', 'AI-generated code', 'Review fatigue', 'Code review best practices'],
    solutionKeywords: ['Improve code quality', 'Reduce bugs', 'Increase velocity', 'Developer productivity'],
    keywords: ['ai', 'pr', 'code review', 'best-practices', 'quality'],
    category: 'best-practices',
    audience: ['engineers', 'engineering-managers', 'qa'],
    priority: 'high',
  },
  {
    slug: 'structure-reusable-prompt-library',
    title: 'Structure Your AI Prompt Library for Reusability',
    description: 'Individual developers and teams will inevitably waste hours "reinventing the wheel" by creating and refining prompts for common tasks. This duplicate work is inefficient, expensive, and leads to inconsistent AI usage and outputs across the organization.',
    recommendationStatement: 'You should create a shared, searchable, and version-controlled prompt library to scale best practices and eliminate duplicate work. This library should decouple prompts from code by storing them in a central registry, allowing for easier iteration, collaboration, and governance.',
    whyThisMatters: 'A shared prompt library is a high-leverage tool for scaling AI adoption effectively. Without one, every developer must discover effective prompts on their own, leading to massive inefficiencies and inconsistent results. This creates pain-point-21-duplicate-tooling (in the form of prompts) and contributes to pain-point-08-toolchain-sprawl as teams hack together their own solutions. A central library turns individual "secret weapon" prompts into reusable, team-wide assets. The most scalable best practice is to decouple these prompts from the application code by storing them in a dedicated "Prompt CMS" or registry. This allows non-technical subject-matter experts to collaborate on prompts, enables version control and access controls, and lets you update a prompt in one place and have it propagate to all applications, without needing a code deployment.',
    whenToApply: 'A prompt library should be started as soon as an organization moves from individual experimentation to team-based pilots. It is a foundational step for scaling AI adoption efficiently and is a key responsibility for a Community of Practice (Rec 12).',
    implementationGuidance: 'Start Small: Identify 3-5 high-value, repetitive tasks (e.g., "Generate a unit test for this service," "Summarize this code for a PR," "Check this code for security flaws"). Collect "Secret Weapons": Ask your existing power users for their best, most effective prompts for these tasks. Centralize and Decouple: Store these prompts in a central, accessible location—not in the git repository. Use a tool as simple as a shared Notion or Confluence page or a dedicated prompt management platform. Organize and Tag: Make the library searchable. Use a simple tagging system to start: Department: #engineering, #marketing, #support Task: #code-review, #tdd, #documentation Model: #gpt-5, #claude-sonnet Establish Governance: Implement a lightweight quality control process, such as peer review before a new prompt is added, and use version control to track changes.',
    relatedWorkflows: ['process/platform-consolidation-playbook'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-08-toolchain-sprawl', 'pain-point-21-duplicate-tooling'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['Prompt library', 'Prompt management', 'Prompt engineering'],
    recommendationKeywords: ['Reusable prompts', 'Decouple prompts from code', 'Prompt version control', 'Shared best practices'],
    solutionKeywords: ['Eliminate duplicate work', 'Process optimization', 'Scale AI adoption', 'Knowledge sharing'],
    keywords: ['ai', 'prompting', 'library', 'process', 'collaboration', 'governance'],
    category: 'process-optimization',
    audience: ['engineers', 'engineering-managers', 'cto', 'vp-engineering'],
    priority: 'medium',
  },
  {
    slug: 'always-validate-ai-suggestions',
    title: 'Always Validate AI Suggestions Before Merging',
    description: 'AI-generated code often looks plausible but contains subtle logic errors, security vulnerabilities, or performance bottlenecks.5 Blindly trusting and merging this code is dangerous, erodes quality, and creates massive, hidden technical debt.',
    recommendationStatement: 'You must treat all AI-generated code as untrusted until proven otherwise. Adopt a "trust but verify" mindset and implement a formal validation workflow for all AI-assisted code before it is merged into the main branch.',
    whyThisMatters: 'This is the most critical human-in-the-loop guardrail. AI models are optimized to satisfy the prompt, not to adhere to your team\'s unstated risk model or business context.5 This core misalignment is the source of: pain-point-01-almost-correct-code: Subtle logic errors that look correct, like using == "admin" instead of checking a roles array, leading to an authorization bypass.5 pain-point-19-insecure-code: Critical "omissions of necessary security controls," where the AI forgets to add input validation, sanitization, or error handling because it wasn\'t explicitly asked to.5 Thinking of the AI as a "brilliant but potentially drunk/high on adderall coworker" is the correct mental model. The developer who hits "merge" is 100% accountable for the code, regardless of its origin. A "trust but verify" process, where the developer rigorously audits and tests the code, is the only way to prevent security and quality failures and solve the long-term pain-point-02-trust-deficit.',
    whenToApply: 'This is a universal, mandatory practice for every developer using any AI coding assistant, on every piece of generated code, no matter how small.',
    implementationGuidance: 'The "verify" step must be a structured process, not just a quick glance. Use a formal verification checklist for all AI-generated code: Validate Functional Correctness: Does it actually work? Write and run tests to prove it. The TDD workflow (Rec 7) is the best way to do this. Review for Code Quality: Is it readable, maintainable, and does it follow your team\'s style guides? Check Security: Explicitly look for what\'s missing. Is input validated? Are errors handled? Are there any hardcoded secrets? Inspect Performance: Does this introduce a bottleneck? Is it using resources efficiently? Apply Static Analysis: Run linters and static analysis tools on the code to catch what the human eye missed. The human developer\'s role is to provide the context, domain expertise, and ethical judgment that the AI lacks.',
    relatedWorkflows: ['ai-behavior/trust-but-verify-triage', 'code-quality/tdd-with-ai-pair', 'process/release-readiness-runbook'],
    relatedGuardrails: ['guardrails/security/prevent-sql-injection-vulnerability'],
    relatedPainPoints: ['pain-point-01-almost-correct-code', 'pain-point-02-trust-deficit', 'pain-point-19-insecure-code'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [
      {
        source: 'Understanding Security Risks in AI-Generated Code | CSA',
        summary: 'AI models are optimized to satisfy the prompt, not to adhere to your team\'s unstated risk model or business context.',
        url: 'https://cloudsecurityalliance.org/blog/2025/07/09/understanding-security-risks-in-ai-generated-code',
        verified: true,
      },
    ],
    primaryKeywords: ['Trust but verify', 'AI code validation', 'Code review best practices'],
    recommendationKeywords: ['AI code review', 'Validate AI suggestions', 'Human-in-the-loop', 'Developer accountability'],
    solutionKeywords: ['Prevent insecure code', 'Bug prevention', 'Quality assurance', 'Secure development'],
    keywords: ['ai', 'code review', 'validation', 'trust', 'security', 'best-practices'],
    category: 'best-practices',
    audience: ['engineers', 'engineering-managers', 'security', 'qa'],
    priority: 'high',
  },
  {
    slug: 'use-tdd-with-ai-generated-code',
    title: 'Use Test-Driven Development with AI-Generated Code',
    description: 'Relying on AI to generate code and tests at the same time is risky. The AI can misinterpret requirements and produce code with subtle bugs. Manually reviewing large blocks of AI-generated code is slow and error-prone. Test-Driven Development (TDD) provides the perfect framework to solve this.',
    recommendationStatement: 'You should adopt a Test-Driven Development (TDD) workflow for AI-assisted development. The human developer must write the tests first to define the requirements, and then use the AI to generate the code that passes those tests.',
    whyThisMatters: 'TDD is more critical in the age of AI, not less. It provides the essential framework to evaluate and refine AI-generated code, solving the pain-point-01-almost-correct-code problem. The test cases act as a protocol or specification, ensuring that every piece of AI-generated code aligns with the project\'s requirements before it\'s even written. This workflow transforms the developer\'s role from a passive code-paster into an "active, understanding architect". The developer focuses on the high-level business logic (by writing tests), and the AI does the "grunt work" of implementation. This human-led process ensures design integrity and catches the subtle security and logic errors that AI often creates when left unguided. It\'s the most effective way to "tame the AI" and ensure its output is deterministic and correct.',
    whenToApply: 'This workflow is the ideal best practice for generating any new, testable unit of code, such as a new function, class, service, or API endpoint. It is the most robust method for ensuring functional correctness from the very beginning.',
    implementationGuidance: 'Adopt a modified "Red-Green-Refactor" TDD cycle: Red: The developer writes a new unit test that defines the desired functionality. The test fails (as it should) because the code doesn\'t exist yet. Green: The developer prompts the AI, providing the test code and the error message as context. (e.g., "Write the code that makes this test pass: [paste test code and failure output]"). Iterate: The AI generates the code. The developer saves it and runs the unit tests. If the tests fail, the developer feeds the new failure output back to the AI (e.g., "That was close, but it failed with this error: [paste error]. Please fix it."). Refactor: Once the test passes ("Green"), the developer (or the AI) can refactor the code for readability and maintainability, knowing the tests will protect against regressions. This loop makes the developer faster by automating the undifferentiated heavy lifting, while keeping them in full control of the business logic and quality.',
    relatedWorkflows: ['code-quality/tdd-with-ai-pair', 'ai-behavior/trust-but-verify-triage'],
    relatedGuardrails: ['guardrails/testing/prevent-missing-edge-case-tests'],
    relatedPainPoints: ['pain-point-01-almost-correct-code'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['Test-Driven Development (TDD)', 'AI-assisted development', 'Code quality'],
    recommendationKeywords: ['TDD with AI', 'AI-generated code', 'Unit testing', 'Red-Green-Refactor'],
    solutionKeywords: ['Ensure code quality', 'Bug prevention', 'Validate AI code', 'Developer productivity'],
    keywords: ['ai', 'tdd', 'testing', 'best-practices', 'quality', 'automation'],
    category: 'best-practices',
    audience: ['engineers', 'qa', 'engineering-managers'],
    priority: 'high',
  },
  {
    slug: 'establish-ai-governance-before-scaling',
    title: 'Establish AI Governance Before Scaling',
    description: 'Without a formal governance plan, AI adoption descends into "vibe coding"—a chaotic, inconsistent, and insecure free-for-all. This leads to fragmented tools, duplicate efforts, and unmitigated security risks, ultimately preventing any real ROI.',
    recommendationStatement: 'You must establish a formal, cross-functional AI governance framework before scaling AI tools across the organization. This framework defines the policies, roles, and accountability mechanisms needed to balance innovation with legal, ethical, and regulatory risks.',
    whyThisMatters: '"Vibe coding"—prompting and hoping for the best—is a "governance crisis". It\'s the root cause of pain-point-08-toolchain-sprawl (as teams adopt unvetted tools), pain-point-12-vibe-coding (bypassing standards), and pain-point-16-guardrail-evasion. A formal governance framework is the "operating system" for your AI strategy. This framework is not just a set of rules; it\'s a guide for achieving business goals. It brings together a cross-functional team (Legal, Engineering, Security, Business) to create a unified approach. Its job is to answer critical questions: Accountability: Who is responsible if an AI makes a harmful decision? Tooling: Which AI tools are approved? Which are banned? Data: What data (e.g., PII, proprietary code) is forbidden from being used in prompts? (See Rec 22) Security: What are the minimum security standards for AI-generated code? (See Rec 2) Establishing this before a full-scale rollout is the only way to manage risk, ensure compliance, and align AI-driven development with business objectives.',
    whenToApply: 'This is a prerequisite for scaling. It should be established the moment an organization decides to move from individual, ad-hoc experimentation to team-wide pilots or enterprise-wide procurement.',
    implementationGuidance: 'Form a Cross-Functional Team: This is the most critical step. The "AI governance" body must include leads from Legal, IT/Security, Engineering, and business units. Define the Policy Framework: Start with the basics. Your policy must define: The Purpose of AI use (aligned with business goals). Approved Tools and procurement process. Data Governance Rules (e.g., "No PII in public prompts"). Security & Quality Standards (e.g., "All AI code must pass SAST scans"). Use a Scorecard: Document these policies in a living governance/ai-governance-scorecard. This document serves as the "source of truth" for all teams. Implement Technical Controls: Governance is useless without enforcement. Use technical guardrails (Rec 2) and DLP/firewalls (Rec 21) to enforce the policies automatically.',
    relatedWorkflows: ['governance/ai-governance-scorecard', 'security/security-guardrails', 'process/platform-consolidation-playbook'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-08-toolchain-sprawl', 'pain-point-12-vibe-coding', 'pain-point-16-guardrail-evasion'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['AI governance', 'AI policy', 'Strategic guidance'],
    recommendationKeywords: ['AI governance framework', 'Cross-functional AI', 'AI risk management', 'Accountability'],
    solutionKeywords: ['Prevent vibe coding', 'Balance innovation and risk', 'AI scaling', 'Regulatory compliance'],
    keywords: ['ai', 'governance', 'strategy', 'policy', 'security', 'risk'],
    category: 'strategic-guidance',
    audience: ['cto', 'vp-engineering', 'security', 'legal', 'engineering-managers'],
    priority: 'high',
  },
  {
    slug: 'focus-ai-on-strategic-tasks',
    title: 'Focus AI on Strategic Tasks, Not Just Code Generation',
    description: 'Focusing generative AI only on code completion and unit tests is a "tactical trap." This approach misses the enormous value AI can provide by augmenting high-level, complex engineering work that is typically a bottleneck.',
    recommendationStatement: 'You should leverage generative AI for high-leverage, strategic tasks beyond simple code generation. Focus its capabilities on complex work such as software architecture validation, automated compliance documentation, and incident root cause analysis (RCA).',
    whyThisMatters: 'Focusing AI exclusively on tactical, line-level coding falls into the pain-point-23-tactical-trap. The true, transformative value of AI is unlocked when it assists with strategic, high-cognition tasks that are traditionally "human-only." Incident Analysis: After a critical incident, the "summary challenge" (RCA, post-mortems) can take weeks. GenAI can analyze logs and incident data to provide automated detection, correlation, and summarization, drastically reducing troubleshooting time. Architecture: While AI is not yet ready to replace architects, it is already being used for AI-assisted architectural decision-making and to provide automated governance on architectural rules. Compliance & Validation: In safety-critical or regulated industries, AI can be used to analyze data readouts and create "proofs" that processes are working correctly, then generate the associated compliance documentation and populate the templates, saving thousands of engineering hours. This shifts the developer\'s focus from "how do I write this function" to "how do I validate this system," which is a far more valuable use of their time.',
    whenToApply: 'This is a "next-level" recommendation for teams that have already mastered basic AI code generation. It is ideal for: Senior engineers, staff engineers, and architects. Site Reliability Engineering (SRE) and operations teams. Teams in regulated industries (finance, healthcare, rail) that face a heavy compliance documentation burden.',
    implementationGuidance: 'Pilot in SRE: Start with your SRE team. After your next incident, feed the anonymized incident logs, alert data, and chat transcripts into a large-context model. Prompt it: "Summarize the timeline of this incident, identify the key systems impacted, and suggest three potential root causes". Pilot in Architecture: Have an architect prompt an AI with a proposed system design. Prompt it: "Critique this software architecture for a high-traffic e-commerce site. Identify potential bottlenecks, security risks, and single points of failure". Pilot in Compliance: Give the AI a test log and a compliance matrix template. Prompt it: "Populate this compliance matrix using the results from the attached test log".',
    relatedWorkflows: ['ai-behavior/capability-grounding-manifest', 'governance/architecture-intent-validation'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-23-tactical-trap'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['Strategic AI', 'AI for architecture', 'AI for SRE'],
    recommendationKeywords: ['Root Cause Analysis (RCA)', 'Incident analysis', 'Compliance documentation', 'Architecture validation'],
    solutionKeywords: ['Beyond code generation', 'High-leverage tasks', 'Augment senior engineers', 'Tactical trap'],
    keywords: ['ai', 'strategy', 'architecture', 'sre', 'incident', 'compliance'],
    category: 'strategic-guidance',
    audience: ['cto', 'vp-engineering', 'architects', 'engineering-managers'],
    priority: 'medium',
  },
  {
    slug: 'monitor-ai-costs-and-usage',
    title: 'Monitor AI Costs and Usage from Day One',
    description: 'AI API calls (especially to high-performance models) are not free and can become expensive very quickly. Without a monitoring strategy, costs will spiral out of control, you will have no way to attribute them to the correct teams or products, and you will have no data to justify the ROI.',
    recommendationStatement: 'You should implement granular cost and usage monitoring for all third-party AI services from the first day of use. Assign unique API keys or cloud-provider tags to each team, project, or feature to enable detailed cost attribution and prevent budget overruns.',
    whyThisMatters: 'Failing to monitor AI costs is a direct path to budget shock and an inability to prove value. It also contributes to pain-point-08-toolchain-sprawl by obscuring which tools are actually being used and which are providing value. A robust monitoring strategy is a core component of "FinOps for AI" and is essential for running a responsible, data-driven AI program. When an API call is made, the service (like OpenAI) returns the number of tokens used. This data must be captured. You cannot manage what you do not measure. By logging this usage data, you can build dashboards to track spend, identify high-cost users or features, and set alerts to prevent overages.',
    whenToApply: 'This is a foundational, non-negotiable practice. It must be implemented before giving teams access to any paid, consumption-based AI APIs.',
    implementationGuidance: 'There are several levels of maturity for AI cost tracking, all of which are effective: Good (API-Key-Level): The simplest method. Create a separate API key for each team, project, or feature. Most AI provider dashboards, including OpenAI\'s, allow you to view usage and costs per API key. This gives you basic project-level attribution. Better (Cloud-Provider-Level): If using AI services through a major cloud (e.g., Azure, Google Cloud), use their built-in cost management tools. Azure: Use Cost Analysis and "Group by" the Meter to see costs broken down by model series (e.g., GPT-4 vs. GPT-3.5). Google Cloud: Use the Metrics page for the Vertex AI API to view project-level usage, traffic, and errors. For all clouds: Apply tags (e.g., team: "payments", project: "doc-summarizer") to your resources. This allows you to filter cost reports by team or project. Best (Observability-Platform-Level): Integrate AI cost data into your existing observability platform (like Datadog). This allows you to create a unified dashboard that combines cost data with performance and health metrics. You can add tags, set up granular alerts for budgetary overages, and give engineers direct visibility into the cost of their services.',
    relatedWorkflows: ['process/platform-consolidation-playbook'],
    relatedGuardrails: [],
    relatedPainPoints: ['pain-point-08-toolchain-sprawl'],
    relatedPrompts: [],
    relatedPatterns: [],
    researchCitations: [],
    primaryKeywords: ['AI cost monitoring', 'FinOps for AI', 'AI usage tracking'],
    recommendationKeywords: ['Monitor API costs', 'Cost attribution', 'Budget alerts', 'Token usage'],
    solutionKeywords: ['Prevent cost overruns', 'Track AI ROI', 'Cost management', 'Observability'],
    keywords: ['ai', 'cost', 'finops', 'monitoring', 'process', 'usage'],
    category: 'process-optimization',
    audience: ['cto', 'vp-engineering', 'devops-sre', 'engineering-managers'],
    priority: 'medium',
  },
];

async function main() {
  // Read existing recommendations
  const existingData: RecommendationsJsonData = JSON.parse(
    fs.readFileSync(RECOMMENDATIONS_PATH, 'utf-8')
  );

  // Create backup
  fs.writeFileSync(BACKUP_RECOMMENDATIONS_PATH, JSON.stringify(existingData, null, 2));

  // Update recommendations 1-10 by index
  const updatedRecommendationsList = existingData.recommendations.map((rec, index) => {
    if (index < 10) {
      // Get the updated recommendation by index
      const updatedRec = updatedRecommendations[index];
      if (updatedRec) {
        // If slug changed, update ID to match new slug
        const newSlug = updatedRec.slug || rec.slug;
        const idNumber = String(index + 1).padStart(2, '0');
        const newId = `recommendation-${idNumber}-${newSlug}`;
        
        // Merge updated fields
        return {
          ...rec,
          ...updatedRec,
          id: newId, // Update ID to match new slug
          status: rec.status, // Preserve existing status
        } as Recommendation;
      }
    }
    return rec;
  });

  // Update the JSON data
  const updatedData: RecommendationsJsonData = {
    ...existingData,
    recommendations: updatedRecommendationsList,
    generatedAt: new Date().toISOString(),
  };

  // Write updated recommendations
  fs.writeFileSync(RECOMMENDATIONS_PATH, JSON.stringify(updatedData, null, 2));

  console.log(`✅ Updated recommendations 1-10 with revisions`);
  console.log(`   Total recommendations: ${updatedData.totalRecommendations}`);
  console.log(`   Backup created: ${BACKUP_RECOMMENDATIONS_PATH}`);
}

main().catch(console.error);

