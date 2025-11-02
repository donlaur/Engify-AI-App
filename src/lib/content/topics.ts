/**
 * AI Summary: Curated list of topics for automated content generation.
 * Environment-gated for safety and relevance. Part of Day 5 Phase 2.5.
 */

export interface ContentTopic {
  topic: string;
  category:
    | 'engineering'
    | 'product'
    | 'design'
    | 'marketing'
    | 'sales'
    | 'support'
    | 'general';
  targetWordCount?: number;
  tags?: string[];
  priority?: number; // Higher = more important
  enabled?: boolean; // Can be disabled per environment
}

// Environment-gated topic allowlist
// Only enabled topics will be available for generation
export const CONTENT_TOPICS: ContentTopic[] = [
  // High Priority Engineering Topics
  {
    topic: 'Building Scalable APIs with Next.js and MongoDB',
    category: 'engineering',
    targetWordCount: 800,
    tags: ['api', 'nextjs', 'mongodb', 'backend', 'scalability'],
    priority: 10,
    enabled: true,
  },
  {
    topic: 'Implementing Role-Based Access Control in React Applications',
    category: 'engineering',
    targetWordCount: 700,
    tags: ['rbac', 'react', 'security', 'authentication'],
    priority: 9,
    enabled: true,
  },
  {
    topic: 'Optimizing React Performance with Memoization and Code Splitting',
    category: 'engineering',
    targetWordCount: 600,
    tags: ['react', 'performance', 'optimization', 'frontend'],
    priority: 8,
    enabled: true,
  },

  // Product Management Topics
  {
    topic: 'The Complete Guide to Product-Market Fit Validation',
    category: 'product',
    targetWordCount: 900,
    tags: ['product-market-fit', 'validation', 'startup', 'metrics'],
    priority: 8,
    enabled: true,
  },
  {
    topic: 'Building Effective Product Roadmaps That Drive Results',
    category: 'product',
    targetWordCount: 750,
    tags: ['roadmap', 'planning', 'strategy', 'execution'],
    priority: 7,
    enabled: true,
  },

  // Design Topics
  {
    topic: 'Creating Inclusive User Interfaces: A Practical Guide',
    category: 'design',
    targetWordCount: 650,
    tags: ['ux', 'accessibility', 'inclusive-design', 'ui'],
    priority: 7,
    enabled: true,
  },
  {
    topic: 'The Psychology of Color in Digital Product Design',
    category: 'design',
    targetWordCount: 550,
    tags: ['color-theory', 'psychology', 'design', 'visual'],
    priority: 6,
    enabled: true,
  },

  // Marketing Topics
  {
    topic: 'Content Marketing Strategies That Actually Work in 2024',
    category: 'marketing',
    targetWordCount: 700,
    tags: ['content-marketing', 'strategy', 'seo', 'engagement'],
    priority: 7,
    enabled: true,
  },

  // General Business Topics
  {
    topic: 'The Future of Remote Work: Trends and Best Practices',
    category: 'general',
    targetWordCount: 600,
    tags: ['remote-work', 'future', 'productivity', 'culture'],
    priority: 6,
    enabled: true,
  },
  {
    topic: 'Building High-Performing Engineering Teams',
    category: 'general',
    targetWordCount: 650,
    tags: ['team-building', 'engineering', 'leadership', 'culture'],
    priority: 6,
    enabled: true,
  },

  // Lower Priority Topics (can be enabled as needed)
  {
    topic: 'Introduction to Machine Learning for Product Managers',
    category: 'product',
    targetWordCount: 500,
    tags: ['ml', 'ai', 'product-management', 'basics'],
    priority: 4,
    enabled: false, // Disabled by default, can be enabled per environment
  },
  {
    topic: 'Effective Code Review Practices for Modern Teams',
    category: 'engineering',
    targetWordCount: 550,
    tags: ['code-review', 'best-practices', 'teamwork', 'quality'],
    priority: 5,
    enabled: false,
  },

  // AI Adoption & Change Management Topics
  // Inspired by industry research on AI transformation challenges
  {
    topic: `Why 95% of AI Projects Fail: From Pilot Purgatory to Production Success

Create an original article for engineering leaders about the common failure modes in AI adoption:
- Most teams get stuck in endless pilots that never reach production
- The core issue is treating AI as a technology problem instead of a change management problem
- 70% of challenges are people and process issues, not technical issues
- Include a practical framework for moving from experiment to scaled production
- Focus on engineering workflows: CI/CD automation, code review AI, infrastructure optimization
- Provide actionable steps for CTOs and VPs of Engineering`,
    category: 'engineering',
    targetWordCount: 1200,
    tags: [
      'ai-adoption',
      'change-management',
      'engineering-leadership',
      'scaling',
    ],
    priority: 9,
    enabled: false, // Enable when ready to generate AI adoption content
  },
  {
    topic: `Building an AI Experimentation Sandbox: How to Test Without Risking Production

Write an original technical guide for engineering teams on creating safe AI experimentation environments:
- How to set up isolated sandbox environments for AI testing
- Infrastructure architecture: Docker, test databases, API mocking
- Security considerations: data sanitization, access controls, audit logging
- Evaluation frameworks for promoting AI experiments to production
- Include a real-world inspired case study of a financial services team
- Provide a technical blueprint that senior engineers can implement`,
    category: 'engineering',
    targetWordCount: 1000,
    tags: ['ai-adoption', 'sandbox', 'infrastructure', 'testing', 'devops'],
    priority: 8,
    enabled: false,
  },
  {
    topic: `The Engineering Leader's AI Adoption Playbook: A Phase-by-Phase Framework

Create an original, comprehensive framework guide for engineering leaders on AI adoption:
- Phase 0: Pre-work (assess readiness, map workflows, define metrics)
- Phase 1: Foundation (cross-functional team, infrastructure, governance)
- Phase 2: Pilot (quick wins, time-boxed experiments, feedback loops)
- Phase 3: Scale (broader rollout, workflow integration, training)
- Phase 4: Sustain (continuous improvement, skill development, measurement)
- Include decision trees, technical considerations, and metrics for each phase
- Provide RACI matrices and common pitfalls to avoid
- Make it actionable: a checklist-driven playbook leaders can follow`,
    category: 'engineering',
    targetWordCount: 1500,
    tags: [
      'ai-adoption',
      'framework',
      'playbook',
      'engineering-leadership',
      'strategy',
    ],
    priority: 9,
    enabled: false,
  },
  {
    topic: 'crafted-prompt-framework',
    title: 'The C.R.A.F.T.E.D. Prompt Framework for Software Engineers',
    description:
      'A structured, repeatable method for constructing high-quality prompts to get the best results from AI models for software engineering tasks. Learn Context, Role, Action, Format, Tone, Examples, and Definition of Done.',
    prompt: `
You are a prompt engineering expert who teaches software engineers how to get better results from AI coding assistants.

Write a comprehensive guide titled "The C.R.A.F.T.E.D. Prompt Framework for Software Engineers"

The C.R.A.F.T.E.D. framework stands for:
- **C**ontext: Provide the background and the "what" - Prime the AI with all necessary information
- **R**ole: Define the persona the AI should adopt - Focus on specific domain knowledge
- **A**ction: State the primary, specific task - Use strong, direct action verbs
- **F**ormat: Specify the structure of the desired output - Markdown, JSON, code blocks, etc.
- **T**one: Define the communication style - Professional, casual, technical, etc.
- **E**xamples: Show, don't just tell - Provide 1-3 concrete examples
- **D**efinition of Done: Set the rules and boundaries - Constraints, requirements, must-haves

Structure your article as follows:

1. **Introduction** (150 words)
   - Why prompt engineering matters for developers
   - The difference between a mediocre and excellent prompt

2. **The Problem** (200 words)
   - Why most prompts produce generic results
   - Common mistakes engineers make

3. **The C.R.A.F.T.E.D. Framework Overview** (300 words)
   - Brief explanation of each component
   - Why order matters (Context first!)

4. **Component Deep Dives** (1200 words, ~170 words each)
   For each of C.R.A.F.T.E.D:
   - What it means with concrete examples
   - Why it's critical to quality output
   - Common mistakes to avoid
   - Working example with before/after
   
   Use real code examples in Python, JavaScript, or Ruby
   Show actual prompt structure with XML-style tags: <context>, <role>, <action>, <format>, <tone>, <examples>, <definition_of_done>

5. **Complete Example** (400 words)
   - A full C.R.A.F.T.E.D. prompt for refactoring Ruby code (matching the style of the source article)
   - Show the resulting AI output
   - Explain why each section contributes to quality

6. **When to Use What** (250 words)
   - Not every prompt needs all 7 components
   - Simple questions: C + R + A is enough
   - Complex tasks: Use full C.R.A.F.T.E.D.
   - When to add Examples vs. when to skip

7. **Practice Exercises** (200 words)
   - 3 scenarios for readers to try:
     1. Debug a performance issue (use Chain-of-Thought)
     2. Generate unit tests (use Few-Shot with Examples)
     3. Refactor legacy code (use full C.R.A.F.T.E.D.)

8. **Closing Thoughts** (150 words)
   - It's all context (XML tags are just structure)
   - Layer in sections when you get poor results
   - Becomes critical as codebases grow in complexity
   - How to level up: practice, iterate, share learnings

Important guidelines:
- Use real, runnable code examples (not pseudocode)
- Show actual AI outputs to demonstrate quality difference
- Be specific about what works and what doesn't
- Credit the source: Engineering Leadership newsletter by Gregor Ojstersek & Steven Levey
- Include a link: https://newsletter.eng-leadership.com/p/how-to-use-ai-to-help-with-software
- Mention that C.R.A.F.T.E.D. builds on CRAFT (our existing framework)
- Emphasize practicality over theory

Make this immediately applicable. Engineers should be able to use C.R.A.F.T.E.D. today.

Output as Markdown with clear headings (##, ###), code blocks (\`\`\`), and bullet points.
Total target: ~2850 words.`,
    category: 'prompt-engineering',
    targetWordCount: 2850,
    tags: [
      'prompt-engineering',
      'crafted-framework',
      'ai-coding-assistants',
      'software-development',
      'best-practices',
      'framework',
    ],
    priority: 10, // High priority - this is cutting-edge, practical content
    enabled: true, // Ready to generate
  },
];

// Get enabled topics only
export function getEnabledTopics(): ContentTopic[] {
  return CONTENT_TOPICS.filter((topic) => topic.enabled !== false);
}

// Get topics by category
export function getTopicsByCategory(
  category: ContentTopic['category']
): ContentTopic[] {
  return getEnabledTopics().filter((topic) => topic.category === category);
}

// Get high priority topics (priority >= 7)
export function getHighPriorityTopics(): ContentTopic[] {
  return getEnabledTopics().filter((topic) => (topic.priority || 0) >= 7);
}

// Validate topic exists and is enabled
export function isValidTopic(topic: string): boolean {
  return getEnabledTopics().some((t) => t.topic === topic);
}

// Get topic by name
export function getTopicByName(topicName: string): ContentTopic | undefined {
  return getEnabledTopics().find((t) => t.topic === topicName);
}
