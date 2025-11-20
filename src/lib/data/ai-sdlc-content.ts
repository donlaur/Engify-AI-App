/**
 * AI-SDLC 2.0 Content
 * Content for AI-SDLC and AI-Enabled Agile landing pages
 */

export const AI_SDLC_CONTENT = {
  hero: {
    headline: 'AI-SDLC 2.0 — The Next Generation Software Development Lifecycle',
    subheadline: 'The structured, governed, memory-driven workflow for AI-native engineering. Not "AI writes code"—structured AI-assisted engineering.',
    cta: {
      primary: { text: 'Explore PBVR Workflow', href: '/pbvr' },
      secondary: { text: 'View Patterns Library', href: '/patterns' }
    }
  },
  components: [
    {
      id: 'pbvr',
      name: 'PBVR (Plan → Build → Verify → Refactor)',
      description: 'Your core micro-cycle. Every AI-assisted task—feature, bug fix, refactor—runs through PBVR.',
      href: '/pbvr'
    },
    {
      id: 'memory',
      name: 'Memory Layer',
      description: 'Shared, persistent context. AI needs state. PBVR needs continuity. Teams need shared background.',
      href: '/memory'
    },
    {
      id: 'guardrails',
      name: 'Guardrails',
      description: 'Prevent hallucinated APIs, invented architecture, fake estimates, security oversights, and regressions.',
      href: '/guardrails'
    },
    {
      id: 'patterns',
      name: 'Patterns',
      description: 'Reusable, structured prompts. Replace ad-hoc prompting with determinism.',
      href: '/patterns'
    },
    {
      id: 'workflows',
      name: 'Workflows',
      description: 'Connected patterns. Orchestration across planning, coding, PR review, testing, deployment.',
      href: '/workflows'
    },
    {
      id: 'estimation',
      name: 'Time Estimation Reality Check',
      description: 'Focused engineering time is 5-10% of naive AI estimates. MCP grounded estimates vs. AI confidence theater.',
      href: '/pain-points/ai-time-estimation-inaccuracy'
    },
    {
      id: 'governance',
      name: 'Governance & Safety',
      description: 'Auditable, explainable, reproducible, attributable, safe for production.',
      href: '/workflows/ai-governance-scorecard'
    }
  ],
  faqs: [
    {
      question: "What's the difference between AI-SDLC and traditional SDLC?",
      answer: "Traditional SDLC assumes human-only workflows with linear phases. AI-SDLC assumes continuous AI collaboration with memory, guardrails, and structured patterns."
    },
    {
      question: "Is this just 'Agile with AI'?",
      answer: "No. AI-SDLC is the category. AI-Enabled Agile is one practice inside it. AI-SDLC covers the full lifecycle: planning, building, verifying, refactoring, governance, memory, and orchestration."
    },
    {
      question: "How accurate are AI time estimates?",
      answer: "Naive AI estimates are 10-20x too high. Focused engineering time is typically 5-10% of what AI predicts. Engify's MCP time estimator uses historical velocity for 10-20x more accurate estimates."
    },
    {
      question: "What's PBVR?",
      answer: "Plan → Build → Verify → Refactor. It's the core micro-cycle for AI-assisted development. Every task runs through PBVR with guardrails and memory."
    }
  ]
};

export const AI_ENABLED_AGILE_CONTENT = {
  hero: {
    headline: 'AI-Enabled Agile — How to Run Sprints, Ceremonies, and Backlogs Using AI',
    subheadline: 'Agile practice modernized for environments where AI is a real participant. Structured, governed AI participation in your sprint rituals.',
    cta: {
      primary: { text: 'View Agile Patterns', href: '/patterns?tag=agile' },
      secondary: { text: 'Try Sprint Planning Template', href: '/prompts/wsjf-prioritization-agile' }
    }
  },
  ceremonies: [
    {
      id: 'sprint-planning',
      name: 'Sprint Planning',
      description: 'PBVR used to shape tickets into buildable units. WSJF scoring with business-value guardrails. Estimation reality check (5-10% rule).',
      practices: [
        'Clarify → Decompose → Estimate → Prioritize → PBVR → Commit',
        'Use WSJF for economic prioritization',
        'Apply 5-10% reality check to AI estimates',
        'Break epics into PBVR-ready tasks'
      ],
      relatedPrompts: ['wsjf-prioritization-agile'] as string[],
      relatedWorkflows: ['task-decomposition-prompt-flow'] as string[]
    },
    {
      id: 'backlog-grooming',
      name: 'Backlog Grooming',
      description: 'AI de-duplicates, clusters, merges, and refines backlog items. Guardrails forbid AI from inventing requirements.',
      practices: [
        'Clean → Merge → Rewrite → Score → Tag → Ready-for-PBVR',
        'De-duplicate similar stories',
        'Clarify acceptance criteria',
        'Sanity check job size estimates'
      ],
      relatedPrompts: [] as string[],
      relatedWorkflows: [] as string[]
    },
    {
      id: 'daily-standup',
      name: 'Daily Standups',
      description: 'AI generates async updates from Git commits, PRs, Slack. Memory layer maintains context across days.',
      practices: [
        'AI → async summary → cross-team alignment → memory update',
        'Generate summaries from Git/Slack/Jira',
        'EM gets rollup summaries',
        'Reduce sync meeting time'
      ],
      relatedPrompts: [] as string[],
      relatedWorkflows: ['daily-merge-discipline'] as string[]
    },
    {
      id: 'sprint-review',
      name: 'Sprint Review',
      description: 'AI generates demo scripts and summarizes what changed with commit-level attribution.',
      practices: [
        'Demo script → change summary → acceptance → next PBVR seeds',
        'Auto-generate demo scripts',
        'Commit-level attribution',
        'Seed next sprint backlog'
      ],
      relatedPrompts: [] as string[],
      relatedWorkflows: [] as string[]
    },
    {
      id: 'retrospective',
      name: 'Retrospectives',
      description: 'AI clusters issues, highlights systemic patterns, suggests experiments. Guardrails prevent blame-language.',
      practices: [
        'Patterns → failures → experiments → guardrail updates',
        'Cluster issues by theme',
        'Identify systemic patterns',
        'Suggest actionable experiments'
      ],
      relatedPrompts: [] as string[],
      relatedWorkflows: [] as string[]
    }
  ],
  faqs: [
    {
      question: 'Do I need to abandon Scrum/Kanban?',
      answer: 'No. AI-Enabled Agile works with your existing framework. It adds AI participation with structure and guardrails.'
    },
    {
      question: 'How do I prevent AI from inventing requirements?',
      answer: "Use guardrails. Engify's guardrails forbid AI from hallucinating features, APIs, or business logic."
    },
    {
      question: "What's the difference between AI-Enabled Agile and AI-SDLC?",
      answer: 'AI-SDLC is the category (full lifecycle). AI-Enabled Agile is the practice (how to run Agile with AI).'
    },
    {
      question: 'How accurate are AI sprint estimates?',
      answer: "Naive AI estimates are 10-20x too high. Use Engify's MCP time estimator for grounded estimates based on historical velocity."
    }
  ]
};
