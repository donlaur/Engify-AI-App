/**
 * Pattern Validation Utilities
 * Validates prompt patterns and ensures quality standards
 */

import { getPatternById } from '@/lib/pattern-constants';

export interface PatternValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

/**
 * Validate if patterns exist and are correctly formatted
 */
export function validatePatterns(patterns?: string[]): PatternValidationResult {
  const result: PatternValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    score: 100,
  };

  if (!patterns || patterns.length === 0) {
    result.warnings.push(
      'No patterns specified. Consider adding pattern tags for better organization.'
    );
    result.score -= 10;
    return result;
  }

  // Check for invalid patterns
  const invalidPatterns = patterns.filter((p) => !getPatternById(p));
  if (invalidPatterns.length > 0) {
    result.isValid = false;
    result.errors.push(`Invalid patterns: ${invalidPatterns.join(', ')}`);
    result.score -= 30;
  }

  // Check for duplicate patterns
  const uniquePatterns = new Set(patterns);
  if (uniquePatterns.size < patterns.length) {
    result.warnings.push('Duplicate patterns detected');
    result.score -= 5;
  }

  // Recommend pattern combinations
  if (patterns.length === 1 && patterns[0] === 'persona') {
    result.warnings.push(
      'Consider combining Persona with other patterns for better results'
    );
    result.score -= 5;
  }

  return result;
}

/**
 * Suggest complementary patterns
 */
export function suggestComplementaryPatterns(
  currentPatterns: string[]
): string[] {
  const suggestions: string[] = [];

  // If using Persona, suggest Few-Shot or Template
  if (currentPatterns.includes('persona')) {
    if (!currentPatterns.includes('few-shot')) {
      suggestions.push('few-shot');
    }
    if (!currentPatterns.includes('template')) {
      suggestions.push('template');
    }
  }

  // If using Chain-of-Thought, suggest Cognitive Verifier
  if (currentPatterns.includes('chain-of-thought')) {
    if (!currentPatterns.includes('cognitive-verifier')) {
      suggestions.push('cognitive-verifier');
    }
  }

  // If using Template, suggest KERNEL
  if (currentPatterns.includes('template')) {
    if (!currentPatterns.includes('kernel')) {
      suggestions.push('kernel');
    }
  }

  return suggestions;
}

/**
 * Calculate pattern diversity score
 */
export function calculatePatternDiversity(patterns: string[]): number {
  if (!patterns || patterns.length === 0) return 0;

  const categories = new Set(
    patterns
      .map((p) => getPatternById(p))
      .filter((p) => p !== undefined)
      .map((p) => p?.category)
      .filter((c): c is string => c !== undefined)
  );

  // Score based on category diversity
  const categoryCount = categories.size;
  const maxCategories = 4; // FOUNDATIONAL, STRUCTURAL, COGNITIVE, ITERATIVE

  return Math.round((categoryCount / maxCategories) * 100);
}

/**
 * Get pattern complexity level
 */
export function getPatternComplexity(
  patterns: string[]
): 'beginner' | 'intermediate' | 'advanced' {
  if (!patterns || patterns.length === 0) return 'beginner';

  const levels = patterns
    .map((p) => getPatternById(p))
    .filter((p) => p !== undefined)
    .map((p) => p?.level)
    .filter(
      (l): l is 'beginner' | 'intermediate' | 'advanced' => l !== undefined
    );

  if (levels.includes('advanced')) return 'advanced';
  if (levels.includes('intermediate')) return 'intermediate';
  return 'beginner';
}
