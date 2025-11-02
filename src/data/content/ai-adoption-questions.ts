/**
 * AI Adoption: Critical Questions for Engineering Leaders
 * Content for /for-ctos and decision-making pages
 */

export interface AdoptionQuestion {
  id: string;
  category: string;
  question: string;
  why: string;
  howToAnswer: string[];
  redFlags: string[];
  successIndicators: string[];
  relatedFrameworks?: string[];
}

export const aiAdoptionQuestions: AdoptionQuestion[] = [
  // Strategic Questions
  {
    id: 'problem-statement',
    category: 'Strategic',
    question: 'What specific engineering problem are we solving with AI?',
    why: 'AI adoption without a clear problem statement leads to expensive experiments that deliver no business value. The best AI implementations solve real, measurable pain points.',
    howToAnswer: [
      'Identify bottlenecks in your SDLC (code reviews taking 3+ days, documentation debt, repetitive bug triage)',
      'Quantify the pain (hours/week wasted, SLA breaches, developer burnout metrics)',
      'Validate with your team (survey engineers: "What would save you 5+ hours/week?")',
      'Prioritize high-value, low-risk areas (start with developer productivity, not production systems)',
    ],
    redFlags: [
      '"Everyone is doing AI, so should we" (FOMO-driven adoption)',
      '"We\'ll figure out the use case after we buy the tools" (solution in search of a problem)',
      '"AI will solve all our tech debt" (unrealistic expectations)',
      'No measurable success criteria defined upfront',
    ],
    successIndicators: [
      'Team unanimously agrees on top 3 pain points',
      'Clear before/after metrics (e.g., "Reduce PR review time from 2 days to 4 hours")',
      'Problem affects 70%+ of engineering team',
      'Current workarounds are expensive or unsustainable',
    ],
    relatedFrameworks: ['Value vs. Effort Matrix', 'RICE Prioritization'],
  },
  {
    id: 'team-readiness',
    category: 'Strategic',
    question:
      'Is our engineering team ready for AI, or do we need to build AI literacy first?',
    why: 'AI tools are only as effective as the people using them. Teams without basic AI literacy will struggle with prompting, hallucination detection, and workflow integration.',
    howToAnswer: [
      'Assess current AI usage (survey: how many engineers use GitHub Copilot, ChatGPT daily?)',
      'Identify skill gaps (can engineers write effective prompts? understand model limitations?)',
      'Evaluate cultural readiness (is AI seen as a threat or a tool?)',
      'Start with a pilot program (select 5-10 early adopters, measure productivity gains)',
    ],
    redFlags: [
      'Team has "AI will take our jobs" sentiment',
      'No one on the team has used AI tools in production',
      'Leadership expects immediate ROI without training period',
      'No budget allocated for AI literacy training',
    ],
    successIndicators: [
      '50%+ of team actively experiments with AI tools',
      'Early adopters share success stories internally',
      'Team asks "how can AI help?" instead of "why do we need AI?"',
      'Clear learning path exists (beginner → intermediate → advanced)',
    ],
    relatedFrameworks: ['Augmented Engineer Framework', 'Learning Pathways'],
  },
  {
    id: 'cost-viability',
    category: 'Financial',
    question: "What's the true cost of AI adoption, and how do we measure ROI?",
    why: 'AI tools can be expensive at scale. Without clear ROI metrics, you risk spending $50K/year on tools that save $10K in productivity.',
    howToAnswer: [
      'Calculate current cost of the problem (hours wasted × hourly rate × team size)',
      'Estimate AI tool costs (licenses + API usage + infrastructure + training)',
      'Define ROI metrics (time saved, quality improvements, faster shipping)',
      'Build a 3-year TCO model (Year 1: high training cost, Year 2-3: plateau)',
    ],
    redFlags: [
      'No budget for AI tools ("we\'ll use free tiers")',
      'Unlimited API usage without monitoring',
      'No tracking of time saved or productivity gains',
      'Expecting 10x productivity gains in month 1',
    ],
    successIndicators: [
      'ROI model shows break-even within 6-12 months',
      'Clear cost-per-user or cost-per-task metrics',
      'Budget includes training, tooling, and experimentation',
      'Monthly cost review process established',
    ],
    relatedFrameworks: ['Build vs. Buy Framework', 'Cost-Benefit Analysis'],
  },

  // Operational Questions
  {
    id: 'workflow-integration',
    category: 'Operational',
    question: 'How will AI integrate into our existing engineering workflows?',
    why: 'AI tools that disrupt workflows get abandoned. Successful AI adoption enhances existing processes rather than replacing them.',
    howToAnswer: [
      'Map your SDLC (design → code → review → test → deploy)',
      'Identify integration points (code review assistant, test generation, documentation)',
      'Pilot with one workflow first (e.g., PR reviews before full adoption)',
      'Measure adoption rate (are engineers actually using it daily?)',
    ],
    redFlags: [
      'AI tool requires engineers to switch between 5 different tools',
      'No clear owner for AI workflow integration',
      'Expecting engineers to change their workflow completely',
      '"Just use AI" without specific guidance on when/how',
    ],
    successIndicators: [
      'AI tool fits into existing IDE/Git workflow',
      'Engineers use AI for 2-3 specific tasks consistently',
      'Adoption rate increases week-over-week',
      'Team shares workflow improvements organically',
    ],
    relatedFrameworks: ['Workbench Tools', 'Prompt Templates'],
  },
  {
    id: 'quality-control',
    category: 'Operational',
    question:
      'How do we maintain code quality and prevent AI hallucinations in production?',
    why: 'AI-generated code can introduce subtle bugs, security vulnerabilities, or technical debt if not properly reviewed.',
    howToAnswer: [
      'Establish guardrails (human review for all AI-generated code)',
      'Implement output validation (automated tests, linters, security scans)',
      'Train team on hallucination detection (how to spot AI overconfidence)',
      'Use AI for low-risk tasks first (tests, docs) before core logic',
    ],
    redFlags: [
      'Blindly trusting AI-generated code without review',
      'No testing strategy for AI-assisted features',
      'Skipping code reviews because "AI wrote it"',
      'No rollback plan if AI-generated code causes issues',
    ],
    successIndicators: [
      'All AI-generated code goes through standard review process',
      'Test coverage remains high (no drop from AI usage)',
      'Team catches and documents AI hallucinations',
      'Clear escalation path for AI-related incidents',
    ],
    relatedFrameworks: ['Production Guardrails', 'AI Safety Checklist'],
  },
  {
    id: 'vendor-strategy',
    category: 'Operational',
    question:
      'Single vendor or multi-provider strategy? How do we avoid lock-in?',
    why: 'AI providers change pricing, deprecate models, and evolve rapidly. Vendor lock-in can lead to unexpected costs or forced migrations.',
    howToAnswer: [
      'Evaluate top 3 providers for your use case (OpenAI, Anthropic, Google)',
      'Test model performance on real tasks (GPT-4 vs Claude vs Gemini)',
      "Design for provider abstraction (don't hardcode OpenAI APIs everywhere)",
      'Start with BYOK (Bring Your Own Keys) to maintain flexibility',
    ],
    redFlags: [
      "Entire codebase depends on one provider's API",
      'No abstraction layer for AI providers',
      'Committing to 3-year contract without testing alternatives',
      'Using proprietary features that prevent migration',
    ],
    successIndicators: [
      'AI provider interface abstraction exists',
      'Can switch providers with <1 week of work',
      "Team tests new models as they're released",
      'Cost monitoring across all providers',
    ],
    relatedFrameworks: ['AI Provider Strategy', 'Build vs. Buy Framework'],
  },

  // Risk & Compliance Questions
  {
    id: 'security-compliance',
    category: 'Risk & Compliance',
    question: 'What are our security and compliance requirements for AI usage?',
    why: 'Sending proprietary code or user data to AI providers can violate compliance requirements (SOC2, HIPAA, GDPR) or leak intellectual property.',
    howToAnswer: [
      'Identify sensitive data types (PII, proprietary code, customer data)',
      'Define what can/cannot be sent to AI providers',
      'Implement data sanitization (remove secrets, PII before AI prompts)',
      'Use self-hosted models for high-sensitivity use cases',
    ],
    redFlags: [
      'Engineers pasting production code into ChatGPT',
      'No policy on what data can be shared with AI',
      'Using AI providers that train on your data',
      'No audit trail for AI usage in production systems',
    ],
    successIndicators: [
      'Clear AI usage policy documented and enforced',
      'Automated scanning for secrets in AI prompts',
      'Audit logging for all AI interactions',
      'Compliance team has reviewed and approved AI strategy',
    ],
    relatedFrameworks: [
      'Security Architecture',
      'Audit Logging',
      'IP Protection',
    ],
  },
  {
    id: 'error-handling',
    category: 'Risk & Compliance',
    question:
      "What's our fallback plan when AI fails or produces incorrect output?",
    why: 'AI systems are probabilistic and will fail. Without a fallback strategy, a single AI outage can block your entire team.',
    howToAnswer: [
      'Identify critical AI-dependent workflows',
      'Define fallback procedures (manual review, cached responses, alternative models)',
      'Implement circuit breakers (auto-disable AI if error rate spikes)',
      "Train team on manual alternatives (don't lose skills)",
    ],
    redFlags: [
      'No monitoring for AI API availability',
      "Team can't work when AI provider has an outage",
      'No error handling for AI API failures',
      'Critical path depends on AI with no alternative',
    ],
    successIndicators: [
      'Graceful degradation when AI is unavailable',
      'Clear SLAs for AI-dependent features',
      'Team can still ship code during AI outages',
      'Post-mortem process for AI-related incidents',
    ],
    relatedFrameworks: ['Incident Response', 'Resilience Patterns'],
  },

  // Cultural & Organizational Questions
  {
    id: 'skill-development',
    category: 'Cultural',
    question:
      'How do we upskill our team without making AI feel mandatory or threatening?',
    why: 'Forced AI adoption creates resistance. Successful teams make AI opt-in initially, showcase wins, then scale adoption organically.',
    howToAnswer: [
      'Start with volunteers (identify 3-5 AI enthusiasts)',
      'Share success stories internally (Slack channel for AI wins)',
      'Provide structured learning (workshops, not mandates)',
      'Reward AI experimentation (hackathons, innovation time)',
    ],
    redFlags: [
      'Mandatory AI tool usage from day 1',
      'No training or support provided',
      'Leadership uses AI success as performance metric',
      'Engineers feel pressured to use AI to keep their jobs',
    ],
    successIndicators: [
      'AI adoption grows organically (week-over-week increase)',
      'Engineers share AI tips with each other',
      'Team asks for more AI training/tools',
      'Positive sentiment in retros ("AI helped me ship faster")',
    ],
    relatedFrameworks: ['Learning Pathways', 'Change Management'],
  },
  {
    id: 'measurement',
    category: 'Cultural',
    question: "How do we measure AI's impact without micromanaging engineers?",
    why: 'Over-tracking AI usage feels like surveillance. The goal is to measure outcomes (velocity, quality), not keystrokes.',
    howToAnswer: [
      'Track team-level metrics (cycle time, PR size, bug rate)',
      'Before/after comparison (velocity pre-AI vs post-AI)',
      'Survey team quarterly (NPS for AI tools)',
      'Avoid individual tracking (focus on team/org trends)',
    ],
    redFlags: [
      'Tracking every AI prompt an engineer writes',
      'Comparing individual engineer AI usage',
      'Using AI metrics in performance reviews',
      'No baseline metrics before AI adoption',
    ],
    successIndicators: [
      'Team velocity improves 10-30% after 6 months',
      'Engineer satisfaction increases (less toil)',
      'Quality metrics stable or improved (no drop from AI)',
      'Engineers feel empowered, not surveilled',
    ],
    relatedFrameworks: ['OKR Framework', 'Team Health Check'],
  },
  {
    id: 'long-term-strategy',
    category: 'Strategic',
    question:
      "What's our 2-year AI strategy? Are we building, buying, or partnering?",
    why: 'AI is evolving rapidly. A clear long-term strategy helps you invest wisely and avoid costly pivots.',
    howToAnswer: [
      'Phase 1: Buy/partner (use existing tools, learn)',
      'Phase 2: Integrate (build internal workflows on top of AI)',
      'Phase 3: Build (custom models/RAG for competitive advantage)',
      'Reassess every 6 months (AI landscape changes fast)',
    ],
    redFlags: [
      'No roadmap beyond "let\'s try AI"',
      'Building custom LLMs before validating use cases',
      'Committing to vendors without exit strategy',
      'Leadership expects AI to be "done" in 3 months',
    ],
    successIndicators: [
      'Clear phase-based adoption plan',
      'Quarterly reviews of AI strategy',
      'Budget allocated for 2-year horizon',
      'Team alignment on long-term vision',
    ],
    relatedFrameworks: ['Product Strategy', 'Build vs. Buy Framework'],
  },

  // Technical Debt & Architecture Questions
  {
    id: 'tech-debt-impact',
    category: 'Technical',
    question:
      'Will AI help us reduce technical debt, or create new forms of debt?',
    why: 'AI can rapidly generate code, but without proper review and architecture, it can accelerate technical debt accumulation rather than reduce it.',
    howToAnswer: [
      'Audit AI-generated code after 30 days (is it maintainable?)',
      'Measure test coverage of AI code (is it tested properly?)',
      'Track "AI debt" separately (code that works but is hard to understand)',
      'Establish "AI-generated code must be refactored within 1 sprint" policy',
    ],
    redFlags: [
      'Accepting all AI suggestions without review',
      'Shipping AI-generated code with no tests',
      "Team can't explain how AI-generated code works",
      '"We\'ll clean it up later" becomes the norm',
    ],
    successIndicators: [
      'AI code meets same quality bar as human code',
      'Tech debt trends stable or decreasing',
      'Engineers refactor AI code as part of workflow',
      'AI helps document/refactor existing tech debt',
    ],
    relatedFrameworks: ['Tech Debt Strategist', 'Code Review Standards'],
  },
  {
    id: 'architecture-evolution',
    category: 'Technical',
    question: 'How does AI change our architecture decisions and patterns?',
    why: 'AI introduces new failure modes, latency considerations, and data flow patterns. Your architecture must evolve to support AI-native workflows.',
    howToAnswer: [
      'Identify new integration points (AI services, embeddings, vector DBs)',
      'Plan for AI-specific infrastructure (rate limiting, caching, fallbacks)',
      'Design for observability (log AI requests, track costs, monitor quality)',
      'Consider edge cases (offline mode, AI unavailable, budget exhausted)',
    ],
    redFlags: [
      'Adding AI as an afterthought (tight coupling)',
      'No monitoring or cost tracking for AI usage',
      'Production system depends on external AI with no SLA',
      "Architecture diagrams don't include AI components",
    ],
    successIndicators: [
      'AI abstraction layer allows provider swapping',
      'Clear data flow from user → AI → user',
      'Monitoring dashboards include AI metrics',
      'Architecture review includes AI failure scenarios',
    ],
    relatedFrameworks: ['ADR Generator', 'Architecture Decision Records'],
  },
  {
    id: 'testing-strategy',
    category: 'Technical',
    question:
      "How do we test AI-integrated features? Traditional tests aren't enough.",
    why: 'AI outputs are probabilistic, not deterministic. Testing "AI returns the right answer" is fundamentally different from testing "function returns 42".',
    howToAnswer: [
      'Define acceptable output ranges (not exact matches)',
      'Use evaluation frameworks (ROUGE, semantic similarity)',
      'Implement guardrail tests (catch harmful/incorrect outputs)',
      'Build regression test suites (golden datasets)',
    ],
    redFlags: [
      'No tests for AI-integrated features',
      'Expecting deterministic outputs from probabilistic models',
      'Manual testing only ("I checked and it looks good")',
      'No way to detect AI quality degradation over time',
    ],
    successIndicators: [
      'Automated test suite for AI features',
      'Quality thresholds defined (e.g., "95% semantic match")',
      'Regression tests prevent quality degradation',
      'Team can detect model degradation automatically',
    ],
    relatedFrameworks: ['Testing Strategy', 'Quality Metrics'],
  },

  // Team Dynamics & Collaboration Questions
  {
    id: 'collaboration-patterns',
    category: 'Team Dynamics',
    question: 'How does AI change how our team collaborates and communicates?',
    why: 'AI can accelerate individual work but create silos if not integrated into team workflows. The goal is to enhance collaboration, not replace it.',
    howToAnswer: [
      'Establish AI collaboration norms (share prompts, review AI outputs together)',
      'Create shared prompt libraries (team-specific, battle-tested)',
      'Use AI for team activities (retrospectives, incident response)',
      'Maintain human touchpoints (pair programming, design reviews)',
    ],
    redFlags: [
      'Engineers work in isolation with AI, no knowledge sharing',
      'AI replaces code reviews instead of enhancing them',
      'Team stops asking each other questions (just asks AI)',
      'Loss of mentorship opportunities (junior devs only learn from AI)',
    ],
    successIndicators: [
      'Team shares AI wins in standups/Slack',
      'Prompt library grows with team contributions',
      'AI enhances pairing sessions (co-pilot during pair programming)',
      'Mentorship remains strong (seniors teach prompting skills)',
    ],
    relatedFrameworks: ['Team Health Check', 'Collaboration Patterns'],
  },
  {
    id: 'skill-evolution',
    category: 'Team Dynamics',
    question:
      'What new skills do engineers need, and which skills become less critical?',
    why: 'AI shifts the skill landscape. Engineers need stronger system design, prompt engineering, and AI literacy. Some low-level skills become less critical.',
    howToAnswer: [
      'Identify new must-have skills (prompt engineering, AI debugging, model selection)',
      'Define skills that remain critical (system design, testing, security)',
      'Acknowledge skills that matter less (boilerplate code, syntax memorization)',
      'Build learning paths for skill development',
    ],
    redFlags: [
      "Assuming engineers don't need to learn anything new",
      'Over-relying on AI for architecture decisions',
      "Junior engineers can't code without AI assistance",
      'No investment in upskilling team',
    ],
    successIndicators: [
      'Clear skill matrix for AI-era engineering',
      'Training budget for prompt engineering',
      'Engineers can work effectively with/without AI',
      'Junior engineers develop strong fundamentals',
    ],
    relatedFrameworks: ['Learning Pathways', 'Career Development'],
  },
  {
    id: 'hiring-strategy',
    category: 'Team Dynamics',
    question: 'How does AI change our hiring criteria and onboarding process?',
    why: 'AI-native teams need engineers who can leverage AI effectively, but also maintain strong fundamentals. Your hiring bar should evolve, not lower.',
    howToAnswer: [
      'Add AI literacy to job descriptions (optional but preferred)',
      'Test for AI skills in interviews (can they write effective prompts?)',
      'Update onboarding (include AI tools, policies, best practices)',
      "Maintain high bar for fundamentals (AI amplifies skills, doesn't replace them)",
    ],
    redFlags: [
      'Lowering hiring bar because "AI will help them"',
      'Not assessing AI literacy at all',
      'Expecting new hires to figure out AI on their own',
      'No AI section in onboarding documentation',
    ],
    successIndicators: [
      'Job descriptions mention AI tools',
      'Interview process includes AI skills assessment',
      'Onboarding includes AI training',
      'New hires productive faster with AI support',
    ],
    relatedFrameworks: ['Hiring Decision Framework', 'Onboarding Checklist'],
  },

  // Business Value & Product Questions
  {
    id: 'customer-value',
    category: 'Product',
    question: 'Are we using AI to ship faster, or to ship better features?',
    why: 'Speed without direction is wasted motion. The best AI adoption strategies use AI to deliver more customer value, not just more code.',
    howToAnswer: [
      'Define "better" for your product (quality, UX, performance, features)',
      'Measure customer impact (NPS, retention, engagement)',
      'Use AI for customer research (analyze feedback, identify patterns)',
      'Ship AI-powered features that differentiate your product',
    ],
    redFlags: [
      'Shipping features faster but customer satisfaction drops',
      'Using AI internally only (no customer-facing value)',
      'Velocity up but quality down',
      'AI becomes a cost center with no product differentiation',
    ],
    successIndicators: [
      'Customers notice quality improvements',
      'Time-to-market improves AND customer satisfaction increases',
      "AI enables features you couldn't build before",
      'Product roadmap includes AI-powered differentiation',
    ],
    relatedFrameworks: ['RICE Prioritization', 'Value vs. Effort Matrix'],
  },
  {
    id: 'competitive-advantage',
    category: 'Product',
    question:
      'Does our AI strategy create competitive advantage, or just keep us even?',
    why: "If everyone has access to the same AI tools, using ChatGPT for code reviews isn't a differentiator—it's table stakes.",
    howToAnswer: [
      'Identify commodity AI use cases (everyone will do this)',
      'Find unique AI opportunities (your data, your domain, your workflows)',
      'Build proprietary AI assets (custom models, RAG systems, fine-tuned models)',
      'Focus on AI + human expertise (AI amplifies your unique skills)',
    ],
    redFlags: [
      'Only using generic AI tools everyone has access to',
      'No investment in proprietary AI capabilities',
      'Competitors shipping AI features faster',
      'AI strategy is "do what everyone else is doing"',
    ],
    successIndicators: [
      "Custom AI capabilities competitors can't easily replicate",
      'AI + domain expertise = unique value',
      'Customers choose you because of AI features',
      'AI roadmap focuses on differentiation, not parity',
    ],
    relatedFrameworks: ['Strategic Alignment', 'Build vs. Buy Framework'],
  },
  {
    id: 'experimentation-culture',
    category: 'Cultural',
    question:
      'How do we foster safe AI experimentation without slowing down shipping?',
    why: 'AI requires experimentation, but production systems require stability. The best teams create safe spaces for AI exploration.',
    howToAnswer: [
      'Dedicate time for AI experimentation (10% time, hack weeks)',
      'Create safe sandboxes (non-prod environments for AI testing)',
      'Establish approval gates (low-risk: ship freely, high-risk: review)',
      'Share learnings (weekly demos, internal blog posts)',
    ],
    redFlags: [
      'No time allocated for AI experimentation',
      'Engineers experiment in production',
      'Failed AI experiments are seen as failures (not learning)',
      'No mechanism to share learnings across team',
    ],
    successIndicators: [
      'Regular AI demos/show-and-tells',
      'Safe environments for AI testing',
      'Team feels empowered to experiment',
      'Failed experiments documented as learnings',
    ],
    relatedFrameworks: ['Innovation Framework', 'Retrospective Patterns'],
  },
];

/**
 * Group questions by category for rendering
 */
export const questionsByCategory = aiAdoptionQuestions.reduce(
  (acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  },
  {} as Record<string, AdoptionQuestion[]>
);

export const categoryOrder = [
  'Strategic',
  'Financial',
  'Operational',
  'Technical',
  'Team Dynamics',
  'Product',
  'Risk & Compliance',
  'Cultural',
];
