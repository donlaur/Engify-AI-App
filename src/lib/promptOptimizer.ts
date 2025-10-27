/**
 * Prompt Optimizer
 * Rule-based prompt optimization (no backend needed)
 */

export interface OptimizationResult {
  original: string;
  optimized: string;
  improvements: string[];
  tokensAdded: number;
  pattern?: string;
}

export interface OptimizationRule {
  name: string;
  check: (prompt: string) => boolean;
  apply: (prompt: string) => string;
  description: string;
}

// Optimization rules
const OPTIMIZATION_RULES: OptimizationRule[] = [
  {
    name: 'Add Role Definition',
    check: (prompt) => !prompt.toLowerCase().includes('you are') && !prompt.toLowerCase().includes('act as'),
    apply: (prompt) => `You are an expert assistant with deep knowledge in the subject matter.\n\n${prompt}`,
    description: 'Defines the AI\'s role for better context',
  },
  {
    name: 'Add Structure',
    check: (prompt) => !prompt.includes('###') && !prompt.includes('##') && prompt.length > 100,
    apply: (prompt) => {
      return `### Task\n${prompt}\n\n### Output Format\nProvide a clear, well-structured response with:\n- Main points\n- Supporting details\n- Actionable insights`;
    },
    description: 'Adds clear structure for better organization',
  },
  {
    name: 'Add Constraints',
    check: (prompt) => {
      const hasConstraints = prompt.toLowerCase().includes('constraint') || 
                           prompt.toLowerCase().includes('limit') ||
                           prompt.toLowerCase().includes('must') ||
                           prompt.toLowerCase().includes('should');
      return !hasConstraints && prompt.length > 50;
    },
    apply: (prompt) => {
      return `${prompt}\n\n### Constraints\n- Be concise and specific\n- Use examples where helpful\n- Cite sources when applicable`;
    },
    description: 'Adds helpful constraints for focused responses',
  },
  {
    name: 'Add Examples',
    check: (prompt) => {
      const hasExamples = prompt.toLowerCase().includes('example') || 
                         prompt.toLowerCase().includes('for instance') ||
                         prompt.toLowerCase().includes('such as');
      return !hasExamples && prompt.length > 80;
    },
    apply: (prompt) => {
      return `${prompt}\n\n### Examples\nProvide 2-3 concrete examples to illustrate your points.`;
    },
    description: 'Requests examples for better understanding',
  },
  {
    name: 'Add Reasoning Steps',
    check: (prompt) => {
      const hasReasoning = prompt.toLowerCase().includes('step') || 
                          prompt.toLowerCase().includes('explain') ||
                          prompt.toLowerCase().includes('reasoning');
      return !hasReasoning && prompt.length > 100;
    },
    apply: (prompt) => {
      return `${prompt}\n\n### Approach\nThink through this step-by-step:\n1. Analyze the question\n2. Consider key factors\n3. Provide your conclusion`;
    },
    description: 'Adds chain-of-thought reasoning',
  },
  {
    name: 'Improve Clarity',
    check: (prompt) => {
      // Check for vague words
      const vagueWords = ['thing', 'stuff', 'something', 'anything', 'maybe', 'kind of'];
      return vagueWords.some(word => prompt.toLowerCase().includes(word));
    },
    apply: (prompt) => {
      let improved = prompt;
      // Replace vague words with more specific language
      improved = improved.replace(/\bthing\b/gi, 'item');
      improved = improved.replace(/\bstuff\b/gi, 'material');
      improved = improved.replace(/\bmaybe\b/gi, 'possibly');
      improved = improved.replace(/\bkind of\b/gi, 'somewhat');
      return improved;
    },
    description: 'Replaces vague language with specific terms',
  },
];

/**
 * Optimize a prompt using rule-based improvements
 */
export function optimizePrompt(
  original: string,
  targetPattern?: string
): OptimizationResult {
  let optimized = original.trim();
  const improvements: string[] = [];
  let tokensAdded = 0;

  // Apply each rule that matches
  for (const rule of OPTIMIZATION_RULES) {
    if (rule.check(optimized)) {
      const before = optimized;
      optimized = rule.apply(optimized);
      
      // Estimate tokens added (rough: ~4 chars per token)
      const charsAdded = optimized.length - before.length;
      tokensAdded += Math.ceil(charsAdded / 4);
      
      improvements.push(rule.description);
    }
  }

  // If no improvements, add a note
  if (improvements.length === 0) {
    improvements.push('Prompt is already well-structured!');
  }

  return {
    original,
    optimized,
    improvements,
    tokensAdded,
    pattern: targetPattern,
  };
}

/**
 * Get optimization suggestions without applying them
 */
export function getOptimizationSuggestions(prompt: string): string[] {
  const suggestions: string[] = [];

  for (const rule of OPTIMIZATION_RULES) {
    if (rule.check(prompt)) {
      suggestions.push(`✓ ${rule.name}: ${rule.description}`);
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('✓ Your prompt looks good! No major improvements needed.');
  }

  return suggestions;
}

/**
 * Calculate improvement score (0-100)
 */
export function calculateImprovementScore(original: string, optimized: string): number {
  const improvements = optimized.length - original.length;
  const originalScore = Math.min(original.length / 200, 1) * 50; // Base score
  const improvementBonus = Math.min(improvements / 100, 1) * 50; // Improvement bonus
  
  return Math.round(originalScore + improvementBonus);
}
