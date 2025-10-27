/**
 * Prompt Testing & Grading Schemas
 * 
 * Test prompts with real AI and grade responses
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const ObjectIdSchema = z.instanceof(ObjectId);

/**
 * Prompt Test Case Schema
 * Define test scenarios for each prompt
 */
export const PromptTestCaseSchema = z.object({
  _id: ObjectIdSchema,
  promptId: ObjectIdSchema,
  
  // Test details
  name: z.string().min(1).max(200),
  description: z.string().max(500),
  
  // Test input (variables to inject into prompt)
  testInput: z.record(z.string()),
  
  // Expected output criteria
  expectedCriteria: z.object({
    minLength: z.number().int().positive().optional(),
    maxLength: z.number().int().positive().optional(),
    mustContain: z.array(z.string()).optional(),
    mustNotContain: z.array(z.string()).optional(),
    tone: z.enum(['professional', 'casual', 'technical', 'friendly']).optional(),
    format: z.enum(['markdown', 'json', 'plain', 'code']).optional(),
  }),
  
  // Test configuration
  providers: z.array(z.enum(['openai', 'anthropic', 'google'])),
  temperature: z.number().min(0).max(2).default(0.7),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PromptTestCase = z.infer<typeof PromptTestCaseSchema>;

/**
 * Test Result Schema
 * Store results from running tests
 */
export const TestResultSchema = z.object({
  _id: ObjectIdSchema,
  testCaseId: ObjectIdSchema,
  promptId: ObjectIdSchema,
  
  // Test execution
  provider: z.enum(['openai', 'anthropic', 'google']),
  model: z.string(),
  executedAt: z.date(),
  
  // Input/Output
  actualInput: z.record(z.string()),
  actualOutput: z.string(),
  
  // Metrics
  latencyMs: z.number().int().nonnegative(),
  tokensUsed: z.number().int().nonnegative(),
  costCents: z.number().nonnegative(),
  
  // Grading (automated)
  autoGrade: z.object({
    score: z.number().min(0).max(100), // 0-100
    passed: z.boolean(),
    criteriaResults: z.array(z.object({
      criterion: z.string(),
      passed: z.boolean(),
      message: z.string(),
    })),
  }),
  
  // Human grading (optional)
  humanGrade: z.object({
    score: z.number().min(0).max(100).nullable(),
    feedback: z.string().nullable(),
    gradedBy: ObjectIdSchema.nullable(),
    gradedAt: z.date().nullable(),
  }).optional(),
  
  // Status
  status: z.enum(['passed', 'failed', 'needs_review']),
  
  createdAt: z.date(),
});

export type TestResult = z.infer<typeof TestResultSchema>;

/**
 * Prompt Quality Score Schema
 * Aggregate quality metrics for each prompt
 */
export const PromptQualityScoreSchema = z.object({
  _id: ObjectIdSchema,
  promptId: ObjectIdSchema,
  
  // Test statistics
  totalTests: z.number().int().nonnegative(),
  passedTests: z.number().int().nonnegative(),
  failedTests: z.number().int().nonnegative(),
  passRate: z.number().min(0).max(100),
  
  // Quality scores (0-100)
  averageAutoScore: z.number().min(0).max(100),
  averageHumanScore: z.number().min(0).max(100).nullable(),
  
  // Performance metrics
  averageLatencyMs: z.number().nonnegative(),
  averageTokens: z.number().nonnegative(),
  averageCostCents: z.number().nonnegative(),
  
  // Provider comparison
  providerScores: z.record(z.object({
    averageScore: z.number().min(0).max(100),
    testCount: z.number().int().nonnegative(),
    passRate: z.number().min(0).max(100),
  })),
  
  // Overall grade
  overallGrade: z.enum(['A', 'B', 'C', 'D', 'F']),
  
  // Status
  isVerified: z.boolean().default(false),
  lastTestedAt: z.date(),
  
  updatedAt: z.date(),
});

export type PromptQualityScore = z.infer<typeof PromptQualityScoreSchema>;

/**
 * Grading criteria weights
 */
export const GRADING_WEIGHTS = {
  lengthMatch: 15,      // Does output meet length requirements?
  contentMatch: 30,     // Contains required content?
  noForbidden: 20,      // Doesn't contain forbidden content?
  formatMatch: 15,      // Correct format?
  toneMatch: 10,        // Correct tone?
  coherence: 10,        // Is it coherent?
} as const;

/**
 * Grade thresholds
 */
export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  F: 0,
} as const;
