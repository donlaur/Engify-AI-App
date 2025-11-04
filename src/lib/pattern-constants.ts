/**
 * Pattern Constants
 * Single source of truth for all prompt engineering patterns
 */

export const PATTERN_CATEGORIES = {
  FOUNDATIONAL: 'Foundational',
  STRUCTURAL: 'Structural',
  COGNITIVE: 'Cognitive',
  ITERATIVE: 'Iterative',
} as const;

export interface Pattern {
  id: string;
  name: string;
  category: keyof typeof PATTERN_CATEGORIES;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  icon?: string;
}

export const PATTERNS: Pattern[] = [
  // Foundational Patterns
  {
    id: 'persona',
    name: 'Persona',
    category: 'FOUNDATIONAL',
    description: 'Instructs the AI to adopt a specific role or expert persona',
    level: 'beginner',
  },
  {
    id: 'audience-persona',
    name: 'Audience Persona',
    category: 'FOUNDATIONAL',
    description: 'Tailors the response for a specific audience level',
    level: 'beginner',
  },
  {
    id: 'few-shot',
    name: 'Few-Shot',
    category: 'FOUNDATIONAL',
    description: 'Provides examples to guide the AI response format',
    level: 'beginner',
  },
  {
    id: 'zero-shot',
    name: 'Zero-Shot',
    category: 'FOUNDATIONAL',
    description: 'Direct instruction without examples',
    level: 'beginner',
  },

  // Structural Patterns
  {
    id: 'template',
    name: 'Template',
    category: 'STRUCTURAL',
    description: 'Provides a structured format for the AI to fill in',
    level: 'beginner',
  },
  {
    id: 'structured-output',
    name: 'Structured Output Generation',
    category: 'STRUCTURAL',
    description: 'Forces the AI to output in machine-readable formats (JSON, XML, YAML) for system integration',
    level: 'intermediate',
  },
  {
    id: 'kernel',
    name: 'KERNEL Framework',
    category: 'STRUCTURAL',
    description: 'Six principles for enterprise-grade prompts',
    level: 'advanced',
  },
  {
    id: 'visual-separators',
    name: 'Visual Separators',
    category: 'STRUCTURAL',
    description: 'Uses delimiters to organize prompt sections',
    level: 'intermediate',
  },
  {
    id: 'recipe',
    name: 'Recipe',
    category: 'STRUCTURAL',
    description: 'Step-by-step instructions for complex tasks',
    level: 'intermediate',
  },

  // Cognitive Patterns
  {
    id: 'chain-of-thought',
    name: 'Chain-of-Thought',
    category: 'COGNITIVE',
    description: 'Breaks down reasoning into explicit steps',
    level: 'intermediate',
  },
  {
    id: 'cognitive-verifier',
    name: 'Cognitive Verifier',
    category: 'COGNITIVE',
    description: 'Asks AI to verify its own reasoning',
    level: 'intermediate',
  },
  {
    id: 'hypothesis-testing',
    name: 'Hypothesis Testing',
    category: 'COGNITIVE',
    description: 'Generates multiple plausible explanations',
    level: 'advanced',
  },
  {
    id: 'reverse-engineering',
    name: 'Reverse Engineering',
    category: 'COGNITIVE',
    description: 'Deconstructs conclusions to explain reasoning',
    level: 'advanced',
  },
  {
    id: 'rag',
    name: 'RAG (Retrieval Augmented Generation)',
    category: 'COGNITIVE',
    description: 'Retrieves information from external knowledge base',
    level: 'advanced',
  },

  // Iterative Patterns
  {
    id: 'critique-improve',
    name: 'Critique & Improve',
    category: 'ITERATIVE',
    description: 'AI critiques and refines its own output',
    level: 'intermediate',
  },
  {
    id: 'self-reflection',
    name: 'Self-Reflection / Internalized Critique',
    category: 'ITERATIVE',
    description: 'Single-prompt technique where AI generates, reviews, and improves its own response before presenting',
    level: 'advanced',
  },
  {
    id: 'question-refinement',
    name: 'Question Refinement',
    category: 'ITERATIVE',
    description: 'AI asks clarifying questions before responding',
    level: 'intermediate',
  },
  {
    id: 'flipped-interaction',
    name: 'Flipped Interaction',
    category: 'ITERATIVE',
    description: 'AI takes control of conversation, asking questions to gather sufficient context for complex tasks',
    level: 'intermediate',
  },
];

/**
 * Get pattern by ID
 */
export function getPatternById(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
  category: keyof typeof PATTERN_CATEGORIES
): Pattern[] {
  return PATTERNS.filter((p) => p.category === category);
}

/**
 * Get pattern names for validation
 */
export function getPatternNames(): string[] {
  return PATTERNS.map((p) => p.name);
}

/**
 * Validate if a pattern exists
 */
export function isValidPattern(patternId: string): boolean {
  return PATTERNS.some((p) => p.id === patternId);
}
