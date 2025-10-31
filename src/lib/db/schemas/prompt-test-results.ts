/**
 * Prompt Test Results Schema
 * Stores multi-model testing results for prompt quality evaluation
 */

import { z } from 'zod';

/**
 * Result from testing a single prompt with a single AI model
 */
export const PromptTestResultSchema = z.object({
  promptId: z.string().describe('MongoDB ObjectId of the prompt tested'),
  promptTitle: z.string().describe('Title of the prompt for easy reference'),
  model: z.string().describe('Model identifier (e.g., gpt-3.5-turbo, gemini-1.5-flash)'),
  provider: z.enum(['openai', 'google', 'anthropic', 'replicate']),
  response: z.string().describe('AI model response to the prompt'),
  qualityScore: z.number().min(1).max(5).describe('Quality rating 1-5'),
  tokensUsed: z.number().int().positive().describe('Total tokens consumed'),
  costUSD: z.number().positive().describe('Cost in USD for this test'),
  latencyMs: z.number().int().positive().describe('Response time in milliseconds'),
  testedAt: z.date().describe('Timestamp of test execution'),
  metadata: z
    .object({
      temperature: z.number().optional(),
      maxTokens: z.number().optional(),
      promptLength: z.number().optional(),
      responseLength: z.number().optional(),
    })
    .optional(),
});

export type PromptTestResult = z.infer<typeof PromptTestResultSchema>;

/**
 * Quality scorecard for a prompt across multiple models
 */
export const PromptQualityScoreSchema = z.object({
  promptId: z.string(),
  promptTitle: z.string(),
  averageScore: z.number().min(1).max(5),
  modelScores: z.array(
    z.object({
      model: z.string(),
      provider: z.string(),
      score: z.number().min(1).max(5),
      latencyMs: z.number(),
      costUSD: z.number(),
    })
  ),
  totalCost: z.number(),
  totalTests: z.number(),
  lastTested: z.date(),
  needsImprovement: z.boolean(),
});

export type PromptQualityScore = z.infer<typeof PromptQualityScoreSchema>;

/**
 * Testing summary for reporting
 */
export const TestingSummarySchema = z.object({
  totalPrompts: z.number(),
  totalTests: z.number(),
  totalCostUSD: z.number(),
  averageCostPerPrompt: z.number(),
  modelsUsed: z.array(z.string()),
  dateRangeStart: z.date(),
  dateRangeEnd: z.date(),
  qualityDistribution: z.object({
    score1: z.number(),
    score2: z.number(),
    score3: z.number(),
    score4: z.number(),
    score5: z.number(),
  }),
});

export type TestingSummary = z.infer<typeof TestingSummarySchema>;

/**
 * MongoDB collection names
 */
export const COLLECTIONS = {
  PROMPT_TEST_RESULTS: 'prompt_test_results',
  PROMPTS: 'prompts',
  PROMPT_TEMPLATES: 'prompt_templates',
} as const;

/**
 * MongoDB indexes for optimal query performance
 */
export const RECOMMENDED_INDEXES = [
  // Prompt test results indexes
  { collection: COLLECTIONS.PROMPT_TEST_RESULTS, index: { promptId: 1 } },
  { collection: COLLECTIONS.PROMPT_TEST_RESULTS, index: { model: 1 } },
  { collection: COLLECTIONS.PROMPT_TEST_RESULTS, index: { provider: 1 } },
  { collection: COLLECTIONS.PROMPT_TEST_RESULTS, index: { testedAt: -1 } },
  { collection: COLLECTIONS.PROMPT_TEST_RESULTS, index: { qualityScore: 1 } },
  {
    collection: COLLECTIONS.PROMPT_TEST_RESULTS,
    index: { promptId: 1, testedAt: -1 },
    name: 'promptId_testedAt',
  },
  
  // Prompt templates indexes (from Phase 1)
  { collection: COLLECTIONS.PROMPT_TEMPLATES, index: { tags: 1 } },
  { collection: COLLECTIONS.PROMPT_TEMPLATES, index: { category: 1 } },
  { collection: COLLECTIONS.PROMPT_TEMPLATES, index: { slug: 1 }, unique: true },
  { collection: COLLECTIONS.PROMPT_TEMPLATES, index: { 'metadata.role': 1 } },
] as const;

