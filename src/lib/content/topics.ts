/**
 * AI Summary: Curated list of topics for automated content generation.
 * Environment-gated for safety and relevance. Part of Day 5 Phase 2.5.
 */

export interface ContentTopic {
  topic: string;
  category: 'engineering' | 'product' | 'design' | 'marketing' | 'sales' | 'support' | 'general';
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
    topic: "Building Scalable APIs with Next.js and MongoDB",
    category: "engineering",
    targetWordCount: 800,
    tags: ["api", "nextjs", "mongodb", "backend", "scalability"],
    priority: 10,
    enabled: true
  },
  {
    topic: "Implementing Role-Based Access Control in React Applications",
    category: "engineering",
    targetWordCount: 700,
    tags: ["rbac", "react", "security", "authentication"],
    priority: 9,
    enabled: true
  },
  {
    topic: "Optimizing React Performance with Memoization and Code Splitting",
    category: "engineering",
    targetWordCount: 600,
    tags: ["react", "performance", "optimization", "frontend"],
    priority: 8,
    enabled: true
  },

  // Product Management Topics
  {
    topic: "The Complete Guide to Product-Market Fit Validation",
    category: "product",
    targetWordCount: 900,
    tags: ["product-market-fit", "validation", "startup", "metrics"],
    priority: 8,
    enabled: true
  },
  {
    topic: "Building Effective Product Roadmaps That Drive Results",
    category: "product",
    targetWordCount: 750,
    tags: ["roadmap", "planning", "strategy", "execution"],
    priority: 7,
    enabled: true
  },

  // Design Topics
  {
    topic: "Creating Inclusive User Interfaces: A Practical Guide",
    category: "design",
    targetWordCount: 650,
    tags: ["ux", "accessibility", "inclusive-design", "ui"],
    priority: 7,
    enabled: true
  },
  {
    topic: "The Psychology of Color in Digital Product Design",
    category: "design",
    targetWordCount: 550,
    tags: ["color-theory", "psychology", "design", "visual"],
    priority: 6,
    enabled: true
  },

  // Marketing Topics
  {
    topic: "Content Marketing Strategies That Actually Work in 2024",
    category: "marketing",
    targetWordCount: 700,
    tags: ["content-marketing", "strategy", "seo", "engagement"],
    priority: 7,
    enabled: true
  },

  // General Business Topics
  {
    topic: "The Future of Remote Work: Trends and Best Practices",
    category: "general",
    targetWordCount: 600,
    tags: ["remote-work", "future", "productivity", "culture"],
    priority: 6,
    enabled: true
  },
  {
    topic: "Building High-Performing Engineering Teams",
    category: "general",
    targetWordCount: 650,
    tags: ["team-building", "engineering", "leadership", "culture"],
    priority: 6,
    enabled: true
  },

  // Lower Priority Topics (can be enabled as needed)
  {
    topic: "Introduction to Machine Learning for Product Managers",
    category: "product",
    targetWordCount: 500,
    tags: ["ml", "ai", "product-management", "basics"],
    priority: 4,
    enabled: false // Disabled by default, can be enabled per environment
  },
  {
    topic: "Effective Code Review Practices for Modern Teams",
    category: "engineering",
    targetWordCount: 550,
    tags: ["code-review", "best-practices", "teamwork", "quality"],
    priority: 5,
    enabled: false
  }
];

// Get enabled topics only
export function getEnabledTopics(): ContentTopic[] {
  return CONTENT_TOPICS.filter(topic => topic.enabled !== false);
}

// Get topics by category
export function getTopicsByCategory(category: ContentTopic['category']): ContentTopic[] {
  return getEnabledTopics().filter(topic => topic.category === category);
}

// Get high priority topics (priority >= 7)
export function getHighPriorityTopics(): ContentTopic[] {
  return getEnabledTopics().filter(topic => (topic.priority || 0) >= 7);
}

// Validate topic exists and is enabled
export function isValidTopic(topic: string): boolean {
  return getEnabledTopics().some(t => t.topic === topic);
}

// Get topic by name
export function getTopicByName(topicName: string): ContentTopic | undefined {
  return getEnabledTopics().find(t => t.topic === topicName);
}

