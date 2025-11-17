/**
 * Example Prompts (Minimal)
 *
 * ⚠️ IMPORTANT: This file contains ONLY minimal examples for documentation.
 * Production prompts are stored in MongoDB and managed via admin UI.
 *
 * These examples demonstrate prompt patterns - they are NOT production content.
 */

import type { Prompt } from '@/lib/schemas/prompt';

/**
 * Minimal example prompts for documentation only
 *
 * DO NOT add production prompts here - use MongoDB instead!
 */
export const examplePrompts: Omit<Prompt, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'example-001',
    title: 'Example: Code Review',
    description: 'Example prompt demonstrating the Persona pattern',
    content: `You are an expert code reviewer. Review the following code and provide feedback:

{code}

Focus on:
- Security issues
- Performance concerns
- Best practices`,
    category: 'code-generation',
    role: 'engineer',
    pattern: 'persona',
    tags: ['example', 'code-review'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
  {
    id: 'example-002',
    title: 'Example: Few-Shot Learning',
    description: 'Example prompt demonstrating the Few-Shot pattern',
    content: `Convert these examples:

Input: "happy" → Output: "joyful"
Input: "sad" → Output: "melancholy"
Input: "angry" → Output: "furious"

Now convert: {input}`,
    category: 'general',
    role: 'engineer',
    pattern: 'few-shot',
    tags: ['example', 'few-shot'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
  {
    id: 'example-003',
    title: 'Example: Chain of Thought',
    description: 'Example prompt demonstrating the Chain of Thought pattern',
    content: `Solve this step by step:

Problem: {problem}

Step 1: Analyze the problem
Step 2: Identify key variables
Step 3: Apply relevant formulas
Step 4: Calculate the answer
Step 5: Verify your solution`,
    category: 'general',
    role: 'engineer',
    pattern: 'chain-of-thought',
    tags: ['example', 'chain-of-thought'],
    views: 0,
    rating: 0,
    ratingCount: 0,
    isPublic: true,
    isFeatured: false,
    active: true,
    currentRevision: 1,
    requiresAuth: false,
    isPremium: false,
  },
];

/**
 * Get example prompts with timestamps
 *
 * Use this for development/testing only.
 * Production should fetch from MongoDB.
 */
export function getExamplePromptsWithTimestamps(): Prompt[] {
  const now = new Date();
  return examplePrompts.map((prompt) => ({
    ...prompt,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * @deprecated Use MongoDB API instead
 *
 * This function is kept for backward compatibility during migration.
 * Production code should fetch prompts from MongoDB.
 */
export function getSeedPromptsWithTimestamps(): Prompt[] {
  console.warn(
    '⚠️  getSeedPromptsWithTimestamps() is deprecated. Fetch prompts from MongoDB instead.'
  );
  return getExamplePromptsWithTimestamps();
}

/**
 * @deprecated Use MongoDB API instead
 */
export const seedPrompts = examplePrompts;

/**
 * @deprecated Use MongoDB API instead
 */
export const curatedPrompts = examplePrompts;
