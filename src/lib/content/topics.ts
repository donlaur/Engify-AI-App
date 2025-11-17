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
    topic: 'The C.R.A.F.T.E.D. Prompt Framework for Software Engineers',
    category: 'engineering',
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
