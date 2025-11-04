/**
 * Prompt Engineering Patterns
 * 18 proven patterns for effective AI prompting (including production-ready patterns)
 */

export interface PromptPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  example: string;
}

export const promptPatterns: PromptPattern[] = [
  {
    id: 'persona',
    name: 'Persona Pattern',
    description: 'Assign a specific role or expertise to the AI',
    category: 'Foundation',
    difficulty: 'beginner',
    example: 'Act as a senior software engineer with 10 years of experience...',
  },
  {
    id: 'chain-of-thought',
    name: 'Chain of Thought',
    description: 'Ask the AI to show its reasoning step-by-step',
    category: 'Reasoning',
    difficulty: 'intermediate',
    example: "Let's think step by step...",
  },
  {
    id: 'few-shot',
    name: 'Few-Shot Learning',
    description: 'Provide examples to guide the AI response',
    category: 'Learning',
    difficulty: 'beginner',
    example: 'Here are 3 examples of good code reviews...',
  },
  {
    id: 'template',
    name: 'Template Pattern',
    description: 'Use structured templates for consistent outputs',
    category: 'Structure',
    difficulty: 'beginner',
    example: 'Format your response as: Problem | Solution | Impact',
  },
  {
    id: 'context-manager',
    name: 'Context Manager',
    description: 'Provide relevant context to improve accuracy',
    category: 'Context',
    difficulty: 'intermediate',
    example: 'Given this codebase structure and tech stack...',
  },
  {
    id: 'refinement',
    name: 'Refinement Pattern',
    description: 'Iteratively improve outputs through feedback',
    category: 'Iteration',
    difficulty: 'intermediate',
    example: 'Make this more concise while keeping technical accuracy...',
  },
  {
    id: 'constraint',
    name: 'Constraint Pattern',
    description: 'Set clear boundaries and limitations',
    category: 'Control',
    difficulty: 'beginner',
    example: 'Limit response to 3 bullet points, no more than 50 words each',
  },
  {
    id: 'audience',
    name: 'Audience Targeting',
    description: 'Tailor responses for specific audiences',
    category: 'Communication',
    difficulty: 'beginner',
    example: 'Explain this to a non-technical stakeholder...',
  },
  {
    id: 'meta-language',
    name: 'Meta-Language Creation',
    description: 'Define custom syntax for complex tasks',
    category: 'Advanced',
    difficulty: 'advanced',
    example: 'Use [ANALYZE] for code review, [SUGGEST] for improvements...',
  },
  {
    id: 'recipe',
    name: 'Recipe Pattern',
    description: 'Break complex tasks into sequential steps',
    category: 'Process',
    difficulty: 'intermediate',
    example:
      'First analyze the requirements, then design the solution, finally implement...',
  },
  {
    id: 'alternative',
    name: 'Alternative Approaches',
    description: 'Request multiple solutions to compare',
    category: 'Exploration',
    difficulty: 'intermediate',
    example: 'Provide 3 different approaches to solve this problem...',
  },
  {
    id: 'reflection',
    name: 'Reflection Pattern',
    description: 'Ask AI to critique its own output',
    category: 'Quality',
    difficulty: 'advanced',
    example:
      'Review your previous response and identify potential improvements...',
  },
  {
    id: 'self-reflection',
    name: 'Self-Reflection / Internalized Critique',
    description: 'Single-prompt technique where AI generates, reviews, and improves its own response before presenting',
    category: 'Quality',
    difficulty: 'advanced',
    example:
      'Generate the Python code. Then, perform a self-reflection, checking for bugs, style guide violations, and inefficiencies. Provide only the final, improved code.',
  },
  {
    id: 'structured-output',
    name: 'Structured Output Generation',
    description: 'Forces the AI to output in machine-readable formats (JSON, XML, YAML) for system integration',
    category: 'Structure',
    difficulty: 'intermediate',
    example:
      'Return a list of security vulnerabilities as a JSON array, adhering to this JSON Schema... Do not output any text before or after the JSON.',
  },
  {
    id: 'flipped-interaction',
    name: 'Flipped Interaction',
    description: 'AI takes control of conversation, asking questions to gather sufficient context for complex tasks',
    category: 'Collaboration',
    difficulty: 'intermediate',
    example:
      'Act as a senior SRE and ask me questions one by one (e.g., "kubectl describe pod", "kubectl logs") until you have enough info to diagnose the crash loop.',
  },
  {
    id: 'game-play',
    name: 'Game Play Pattern',
    description: 'Frame tasks as games or challenges',
    category: 'Engagement',
    difficulty: 'intermediate',
    example: 'You are a code detective. Find the bug in this code...',
  },
  {
    id: 'semantic-filter',
    name: 'Semantic Filter',
    description: 'Filter and focus on specific aspects',
    category: 'Focus',
    difficulty: 'intermediate',
    example: 'Only focus on security vulnerabilities, ignore style issues...',
  },
];
