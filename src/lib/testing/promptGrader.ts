/**
 * Prompt Response Grader
 * 
 * Automatically grade AI responses against test criteria
 */

import { GRADING_WEIGHTS, GRADE_THRESHOLDS } from '@/lib/db/schemas/testing';

export interface GradingCriteria {
  minLength?: number;
  maxLength?: number;
  mustContain?: string[];
  mustNotContain?: string[];
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  format?: 'markdown' | 'json' | 'plain' | 'code';
}

export interface GradeResult {
  score: number;
  passed: boolean;
  criteriaResults: Array<{
    criterion: string;
    passed: boolean;
    message: string;
  }>;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * Grade an AI response against criteria
 */
export function gradeResponse(
  response: string,
  criteria: GradingCriteria
): GradeResult {
  const results: GradeResult['criteriaResults'] = [];
  let totalScore = 0;
  let maxScore = 0;

  // Check length requirements
  if (criteria.minLength !== undefined || criteria.maxLength !== undefined) {
    maxScore += GRADING_WEIGHTS.lengthMatch;
    const length = response.length;
    
    if (criteria.minLength && length < criteria.minLength) {
      results.push({
        criterion: 'minLength',
        passed: false,
        message: `Response too short: ${length} < ${criteria.minLength}`,
      });
    } else if (criteria.maxLength && length > criteria.maxLength) {
      results.push({
        criterion: 'maxLength',
        passed: false,
        message: `Response too long: ${length} > ${criteria.maxLength}`,
      });
    } else {
      results.push({
        criterion: 'length',
        passed: true,
        message: 'Length within acceptable range',
      });
      totalScore += GRADING_WEIGHTS.lengthMatch;
    }
  }

  // Check required content
  if (criteria.mustContain && criteria.mustContain.length > 0) {
    maxScore += GRADING_WEIGHTS.contentMatch;
    const missing = criteria.mustContain.filter(
      (term) => !response.toLowerCase().includes(term.toLowerCase())
    );
    
    if (missing.length === 0) {
      results.push({
        criterion: 'mustContain',
        passed: true,
        message: 'All required content present',
      });
      totalScore += GRADING_WEIGHTS.contentMatch;
    } else {
      results.push({
        criterion: 'mustContain',
        passed: false,
        message: `Missing required content: ${missing.join(', ')}`,
      });
    }
  }

  // Check forbidden content
  if (criteria.mustNotContain && criteria.mustNotContain.length > 0) {
    maxScore += GRADING_WEIGHTS.noForbidden;
    const found = criteria.mustNotContain.filter(
      (term) => response.toLowerCase().includes(term.toLowerCase())
    );
    
    if (found.length === 0) {
      results.push({
        criterion: 'mustNotContain',
        passed: true,
        message: 'No forbidden content found',
      });
      totalScore += GRADING_WEIGHTS.noForbidden;
    } else {
      results.push({
        criterion: 'mustNotContain',
        passed: false,
        message: `Contains forbidden content: ${found.join(', ')}`,
      });
    }
  }

  // Check format
  if (criteria.format) {
    maxScore += GRADING_WEIGHTS.formatMatch;
    const formatPassed = checkFormat(response, criteria.format);
    
    results.push({
      criterion: 'format',
      passed: formatPassed,
      message: formatPassed
        ? `Correct format: ${criteria.format}`
        : `Incorrect format, expected: ${criteria.format}`,
    });
    
    if (formatPassed) {
      totalScore += GRADING_WEIGHTS.formatMatch;
    }
  }

  // Check tone (basic heuristic)
  if (criteria.tone) {
    maxScore += GRADING_WEIGHTS.toneMatch;
    const tonePassed = checkTone(response, criteria.tone);
    
    results.push({
      criterion: 'tone',
      passed: tonePassed,
      message: tonePassed
        ? `Correct tone: ${criteria.tone}`
        : `Tone doesn't match expected: ${criteria.tone}`,
    });
    
    if (tonePassed) {
      totalScore += GRADING_WEIGHTS.toneMatch;
    }
  }

  // Calculate final score (0-100)
  const finalScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= GRADE_THRESHOLDS.A) grade = 'A';
  else if (finalScore >= GRADE_THRESHOLDS.B) grade = 'B';
  else if (finalScore >= GRADE_THRESHOLDS.C) grade = 'C';
  else if (finalScore >= GRADE_THRESHOLDS.D) grade = 'D';

  return {
    score: finalScore,
    passed: finalScore >= GRADE_THRESHOLDS.C, // C or better = pass
    criteriaResults: results,
    grade,
  };
}

/**
 * Check if response matches expected format
 */
function checkFormat(response: string, format: string): boolean {
  switch (format) {
    case 'markdown':
      return /^#|\*\*|__|\[.*\]\(.*\)/.test(response);
    case 'json':
      try {
        JSON.parse(response);
        return true;
      } catch {
        return false;
      }
    case 'code':
      return /```|function|const|let|var|class|def|import/.test(response);
    case 'plain':
      return true; // Plain text always passes
    default:
      return true;
  }
}

/**
 * Check if response matches expected tone (basic heuristic)
 */
function checkTone(response: string, tone: string): boolean {
  const lower = response.toLowerCase();
  
  switch (tone) {
    case 'professional':
      // Check for professional language
      const professionalWords = ['please', 'thank you', 'regards', 'sincerely'];
      const casualWords = ['hey', 'yeah', 'gonna', 'wanna'];
      return (
        professionalWords.some((w) => lower.includes(w)) &&
        !casualWords.some((w) => lower.includes(w))
      );
    
    case 'casual':
      // Check for casual language
      const casualIndicators = ['hey', 'cool', 'awesome', 'yeah'];
      return casualIndicators.some((w) => lower.includes(w));
    
    case 'technical':
      // Check for technical terms
      const technicalWords = ['function', 'variable', 'parameter', 'algorithm', 'implementation'];
      return technicalWords.some((w) => lower.includes(w));
    
    case 'friendly':
      // Check for friendly language
      const friendlyWords = ['happy', 'glad', 'excited', 'great', '!'];
      return friendlyWords.some((w) => lower.includes(w));
    
    default:
      return true;
  }
}

/**
 * Calculate overall prompt quality score from multiple test results
 */
export function calculateQualityScore(
  testResults: Array<{ score: number; passed: boolean }>
): {
  averageScore: number;
  passRate: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
  if (testResults.length === 0) {
    return { averageScore: 0, passRate: 0, grade: 'F' };
  }

  const averageScore =
    testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length;
  
  const passRate =
    (testResults.filter((r) => r.passed).length / testResults.length) * 100;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (averageScore >= GRADE_THRESHOLDS.A) grade = 'A';
  else if (averageScore >= GRADE_THRESHOLDS.B) grade = 'B';
  else if (averageScore >= GRADE_THRESHOLDS.C) grade = 'C';
  else if (averageScore >= GRADE_THRESHOLDS.D) grade = 'D';

  return { averageScore, passRate, grade };
}
