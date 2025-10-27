/**
 * AI Firewall
 * Prevents abuse, misuse, and attacks on AI API keys
 */

export interface FirewallRule {
  id: string;
  name: string;
  description: string;
  check: (prompt: string, metadata?: any) => Promise<FirewallResult>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface FirewallResult {
  allowed: boolean;
  rule?: string;
  reason?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  suggestions?: string[];
}

/**
 * Prohibited topics that indicate misuse
 */
const PROHIBITED_TOPICS = [
  // Personal advice
  'dating', 'relationship', 'romance', 'love advice', 'breakup',
  
  // Gambling
  'betting', 'gambling', 'casino', 'poker strategy', 'sports betting',
  
  // Medical/Legal (liability)
  'medical diagnosis', 'legal advice', 'lawsuit', 'prescription',
  
  // Harmful content
  'hack', 'exploit', 'vulnerability', 'jailbreak', 'bypass security',
  'malware', 'virus', 'ddos', 'phishing',
  
  // Off-topic entertainment
  'write a novel', 'write a screenplay', 'creative writing',
  'song lyrics', 'poem about love',
  
  // Spam/Abuse
  'generate spam', 'mass email', 'seo spam',
];

/**
 * Required topics for valid use (must match at least one)
 */
const REQUIRED_TOPICS = [
  'code', 'programming', 'software', 'development', 'engineering',
  'api', 'database', 'architecture', 'design pattern', 'algorithm',
  'testing', 'debugging', 'review', 'documentation', 'technical',
  'product', 'feature', 'requirement', 'user story', 'specification',
  'prompt engineering', 'ai', 'machine learning', 'llm',
];

/**
 * Prompt injection patterns
 */
const INJECTION_PATTERNS = [
  /ignore (previous|all|above) (instructions|prompts)/i,
  /disregard (previous|all|above)/i,
  /forget (everything|all|previous)/i,
  /new instructions:/i,
  /system prompt:/i,
  /you are now/i,
  /pretend (you are|to be)/i,
  /roleplay as/i,
  /act as if/i,
];

/**
 * Firewall Rules
 */
export const FIREWALL_RULES: FirewallRule[] = [
  {
    id: 'prompt-injection',
    name: 'Prompt Injection Detection',
    description: 'Detects attempts to manipulate the AI system prompt',
    severity: 'critical',
    check: async (prompt: string) => {
      for (const pattern of INJECTION_PATTERNS) {
        if (pattern.test(prompt)) {
          return {
            allowed: false,
            rule: 'prompt-injection',
            reason: 'Prompt injection attempt detected',
            severity: 'critical',
            suggestions: [
              'Remove instructions that try to override the system',
              'Focus on your actual technical question',
            ],
          };
        }
      }
      return { allowed: true };
    },
  },

  {
    id: 'prohibited-topics',
    name: 'Prohibited Topic Detection',
    description: 'Blocks prompts about prohibited topics',
    severity: 'high',
    check: async (prompt: string) => {
      const lowerPrompt = prompt.toLowerCase();
      
      for (const topic of PROHIBITED_TOPICS) {
        if (lowerPrompt.includes(topic)) {
          return {
            allowed: false,
            rule: 'prohibited-topics',
            reason: `This topic (${topic}) is not supported`,
            severity: 'high',
            suggestions: [
              'Focus on software engineering or product management topics',
              'Check our documentation for supported use cases',
            ],
          };
        }
      }
      return { allowed: true };
    },
  },

  {
    id: 'topic-relevance',
    name: 'Topic Relevance Check',
    description: 'Ensures prompts are relevant to platform purpose',
    severity: 'medium',
    check: async (prompt: string) => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Check if prompt contains any required topics
      const hasRelevantTopic = REQUIRED_TOPICS.some(topic => 
        lowerPrompt.includes(topic)
      );
      
      if (!hasRelevantTopic) {
        return {
          allowed: false,
          rule: 'topic-relevance',
          reason: 'Prompt does not appear to be related to software engineering or product management',
          severity: 'medium',
          suggestions: [
            'Include technical terms like "code", "API", "feature", etc.',
            'Focus on engineering or product management tasks',
            'See our prompt library for examples',
          ],
        };
      }
      return { allowed: true };
    },
  },

  {
    id: 'excessive-length',
    name: 'Excessive Length Check',
    description: 'Prevents extremely long prompts that waste tokens',
    severity: 'low',
    check: async (prompt: string) => {
      const wordCount = prompt.split(/\s+/).length;
      const charCount = prompt.length;
      
      if (wordCount > 2000) {
        return {
          allowed: false,
          rule: 'excessive-length',
          reason: `Prompt is too long (${wordCount} words, max 2000)`,
          severity: 'low',
          suggestions: [
            'Break your prompt into smaller, focused questions',
            'Use our prompt patterns for better structure',
          ],
        };
      }
      
      if (charCount > 15000) {
        return {
          allowed: false,
          rule: 'excessive-length',
          reason: `Prompt is too long (${charCount} characters, max 15000)`,
          severity: 'low',
          suggestions: [
            'Shorten your prompt',
            'Focus on the most important aspects',
          ],
        };
      }
      
      return { allowed: true };
    },
  },

  {
    id: 'repetitive-content',
    name: 'Repetitive Content Detection',
    description: 'Detects spam or repetitive content',
    severity: 'medium',
    check: async (prompt: string) => {
      // Check for repeated words/phrases
      const words = prompt.toLowerCase().split(/\s+/);
      const wordCounts: Record<string, number> = {};
      
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
      
      // If any word appears more than 20% of the time, it's suspicious
      const maxCount = Math.max(...Object.values(wordCounts));
      if (maxCount > words.length * 0.2) {
        return {
          allowed: false,
          rule: 'repetitive-content',
          reason: 'Prompt contains excessive repetition',
          severity: 'medium',
          suggestions: [
            'Remove repeated words or phrases',
            'Write a clear, concise prompt',
          ],
        };
      }
      
      return { allowed: true };
    },
  },

  {
    id: 'suspicious-patterns',
    name: 'Suspicious Pattern Detection',
    description: 'Detects patterns that indicate abuse',
    severity: 'high',
    check: async (prompt: string, metadata?: any) => {
      const lowerPrompt = prompt.toLowerCase();
      
      // Check for mass generation requests
      if (/generate \d+ (emails|messages|posts|articles)/i.test(prompt)) {
        return {
          allowed: false,
          rule: 'suspicious-patterns',
          reason: 'Mass content generation is not allowed',
          severity: 'high',
          suggestions: [
            'Focus on learning prompt engineering, not mass generation',
          ],
        };
      }
      
      // Check for attempts to extract training data
      if (lowerPrompt.includes('training data') || 
          lowerPrompt.includes('memorized') ||
          lowerPrompt.includes('repeat back')) {
        return {
          allowed: false,
          rule: 'suspicious-patterns',
          reason: 'Attempts to extract training data are not allowed',
          severity: 'high',
        };
      }
      
      return { allowed: true };
    },
  },
];

/**
 * Run all firewall checks
 */
export async function checkFirewall(
  prompt: string,
  metadata?: any
): Promise<FirewallResult> {
  // Run all rules
  for (const rule of FIREWALL_RULES) {
    const result = await rule.check(prompt, metadata);
    
    if (!result.allowed) {
      // Log the violation
      console.warn(`Firewall violation: ${rule.id}`, {
        prompt: prompt.substring(0, 100),
        reason: result.reason,
        severity: result.severity,
      });
      
      return result;
    }
  }
  
  return { allowed: true };
}

/**
 * Check if prompt is safe (convenience function)
 */
export async function isPromptSafe(prompt: string): Promise<boolean> {
  const result = await checkFirewall(prompt);
  return result.allowed;
}

/**
 * Get firewall statistics
 */
export async function getFirewallStats(userId?: string) {
  // TODO: Implement stats from MongoDB
  return {
    totalChecks: 0,
    blocked: 0,
    allowed: 0,
    byRule: {},
    bySeverity: {},
  };
}
