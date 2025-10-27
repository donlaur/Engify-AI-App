/**
 * Director of Engineering Insights
 * Common priorities from engineering leaders
 * 
 * Based on patterns observed across engineering leadership conversations
 */

export interface DirectorPriority {
  id: string;
  title: string;
  description: string;
  category: 'ai-adoption' | 'team-coaching' | 'product-collab' | 'technical-excellence';
  importance: 'critical' | 'high' | 'medium';
  relatedPrompts: string[];
  keyQuestions: string[];
}

export const directorPriorities: DirectorPriority[] = [
  {
    id: 'ai-workflow-adoption',
    title: 'AI Adoption in Engineering Workflows',
    description: 'Introducing generative AI into daily workflows with proper guardrails, linting, and testing patterns.',
    category: 'ai-adoption',
    importance: 'critical',
    relatedPrompts: ['cg-001', 'cg-008', 'cg-011'],
    keyQuestions: [
      'How do I introduce gen AI into my workflow?',
      'What guardrails should we have?',
      'How do we maintain code quality with AI assistance?',
    ],
  },
  {
    id: 'rag-implementation',
    title: 'RAG & AI Product Features',
    description: 'Building RAG systems with document chunking, embeddings, vector search, and tool integration (Langchain, Langgraph).',
    category: 'ai-adoption',
    importance: 'critical',
    relatedPrompts: ['dir-002'],
    keyQuestions: [
      'How do I build a RAG system?',
      'What tools should I use (Langchain, Langgraph)?',
      'How do I integrate vector search?',
    ],
  },
  {
    id: 'extensibility-maintainability',
    title: 'Extensible & Maintainable Systems',
    description: 'Building systems that are easy to extend and maintain. Lower barriers to change. Some software is disposable - know when to rebuild vs maintain.',
    category: 'technical-excellence',
    importance: 'high',
    relatedPrompts: ['dir-004'],
    keyQuestions: [
      'How important is extensibility today?',
      'When should we rebuild vs maintain?',
      'How do we balance maintainability with speed?',
    ],
  },
  {
    id: 'team-ai-transition',
    title: 'Coaching Teams Through AI Transition',
    description: 'Helping teams adopt AI, change success metrics, and evolve from senior to staff-level thinking with AI tools.',
    category: 'team-coaching',
    importance: 'critical',
    relatedPrompts: ['dir-003'],
    keyQuestions: [
      'How do I coach my team through AI adoption?',
      'What does success look like with AI?',
      'How do I re-orient the team to new patterns?',
    ],
  },
  {
    id: 'product-ai-collaboration',
    title: 'Product + AI Collaboration',
    description: 'Partnering with product to identify problems AI can solve. Understanding what\'s newly possible with AI.',
    category: 'product-collab',
    importance: 'high',
    relatedPrompts: ['dir-005'],
    keyQuestions: [
      'What problems should we solve with AI?',
      'How do we collaborate with product on AI features?',
      'What\'s newly possible with AI that wasn\'t before?',
    ],
  },
  {
    id: 'fast-powerful-interfaces',
    title: 'Building Fast with AI',
    description: 'Building new interfaces and frontends in ~1000 lines of code with AI. Speed and power of modern AI tools.',
    category: 'ai-adoption',
    importance: 'high',
    relatedPrompts: ['dir-002', 'dir-005'],
    keyQuestions: [
      'How can I build faster with AI?',
      'What tools enable rapid development?',
      'How do I maintain quality at speed?',
    ],
  },
  {
    id: 'well-designed-systems',
    title: 'Characteristics of Well-Designed Systems',
    description: 'Secure, stable, DRY, easy to develop on, usable. Focus on what matters for commercial success.',
    category: 'technical-excellence',
    importance: 'high',
    relatedPrompts: ['dir-004'],
    keyQuestions: [
      'What makes a system well-designed?',
      'How do I balance security, stability, and speed?',
      'What should I prioritize?',
    ],
  },
];

export const directorChallenges = [
  {
    challenge: 'Legacy systems (20+ years old) need modernization',
    aiSolution: 'Use AI to analyze legacy code, suggest refactoring, generate tests',
    prompts: ['cg-011', 'cg-008'],
  },
  {
    challenge: 'Limited team growth, need to do more with same resources',
    aiSolution: 'AI augmentation for productivity - code generation, reviews, documentation',
    prompts: ['cg-001', 'cg-002', 'cg-007'],
  },
  {
    challenge: 'Enterprise customers drive roadmap, need fast iteration',
    aiSolution: 'Rapid prototyping with AI, faster feedback cycles',
    prompts: ['cg-003', 'cg-002'],
  },
  {
    challenge: 'Lots of clicks and screens, UX shows age',
    aiSolution: 'AI-powered UX analysis and modern interface generation',
    prompts: ['cg-003'],
  },
];

export function getDirectorPrioritiesByCategory(category: DirectorPriority['category']) {
  return directorPriorities.filter((p) => p.category === category);
}

export function getCriticalPriorities() {
  return directorPriorities.filter((p) => p.importance === 'critical');
}
