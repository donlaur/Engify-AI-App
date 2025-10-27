/**
 * Prompt Security Validator
 * 
 * Detect and block malicious prompts, injection attempts, and abuse
 */

import crypto from 'crypto';

/**
 * Dangerous patterns that indicate prompt injection or jailbreak attempts
 */
const DANGEROUS_PATTERNS = [
  // Prompt injection attempts
  /ignore\s+(previous|above|all)\s+instructions?/i,
  /disregard\s+(previous|above|all)\s+(instructions?|prompts?)/i,
  /forget\s+(everything|all|previous)/i,
  /new\s+instructions?:/i,
  /system\s*:\s*you\s+are/i,
  
  // Jailbreak attempts
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /evil\s+mode/i,
  
  // Role manipulation
  /you\s+are\s+now\s+(a|an)/i,
  /pretend\s+you\s+are/i,
  /act\s+as\s+(if|a|an)/i,
  
  // System manipulation
  /\[SYSTEM\]/i,
  /\[ADMIN\]/i,
  /sudo\s+/i,
  
  // Excessive token attempts
  /(.{1,10})\1{50,}/, // Repeated patterns
];

/**
 * Suspicious keywords that warrant flagging
 */
const SUSPICIOUS_KEYWORDS = [
  'bypass',
  'override',
  'hack',
  'exploit',
  'vulnerability',
  'injection',
  'malicious',
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  confidence: number;
  detectionMethod: string;
  contentHash: string;
}

/**
 * Validate prompt for security issues
 */
export function validatePrompt(prompt: string): ValidationResult {
  const contentHash = crypto
    .createHash('sha256')
    .update(prompt)
    .digest('hex');

  // Check length limits
  if (prompt.length > 10000) {
    return {
      isValid: false,
      reason: 'excessive_tokens',
      confidence: 1.0,
      detectionMethod: 'length_check',
      contentHash,
    };
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(prompt)) {
      return {
        isValid: false,
        reason: 'prompt_injection',
        confidence: 0.9,
        detectionMethod: 'pattern_match',
        contentHash,
      };
    }
  }

  // Check for suspicious keywords (flag but don't block)
  const suspiciousCount = SUSPICIOUS_KEYWORDS.filter((keyword) =>
    prompt.toLowerCase().includes(keyword)
  ).length;

  if (suspiciousCount >= 3) {
    return {
      isValid: false,
      reason: 'malicious_pattern',
      confidence: 0.7,
      detectionMethod: 'keyword_analysis',
      contentHash,
    };
  }

  // Check for excessive special characters (possible obfuscation)
  const specialCharRatio =
    (prompt.match(/[^a-zA-Z0-9\s]/g) || []).length / prompt.length;
  if (specialCharRatio > 0.3) {
    return {
      isValid: false,
      reason: 'malicious_pattern',
      confidence: 0.6,
      detectionMethod: 'character_analysis',
      contentHash,
    };
  }

  return {
    isValid: true,
    confidence: 1.0,
    detectionMethod: 'passed_all_checks',
    contentHash,
  };
}

/**
 * Sanitize prompt by removing potentially dangerous content
 */
export function sanitizePrompt(prompt: string): string {
  // Remove excessive whitespace
  let sanitized = prompt.replace(/\s+/g, ' ').trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  return sanitized;
}

/**
 * Calculate estimated token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}
