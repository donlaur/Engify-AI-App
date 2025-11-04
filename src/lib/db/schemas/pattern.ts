/**
 * Pattern Schema
 * Validation for prompt engineering patterns stored in MongoDB
 */

import { z } from 'zod';

export const PatternSchema = z.object({
  _id: z.string().optional(),
  id: z.string(),
  name: z.string(),
  category: z.enum(['FOUNDATIONAL', 'STRUCTURAL', 'COGNITIVE', 'ITERATIVE']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  description: z.string(),
  example: z.union([
    z.string(),
    z.object({
      before: z.string(),
      after: z.string(),
      explanation: z.string(),
    }),
  ]).optional(),
  useCases: z.array(z.string()).optional(),
  relatedPatterns: z.array(z.string()).optional(),
  icon: z.string().optional(),
  // Extended detail fields for PatternDetailDrawer
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  howItWorks: z.string().optional(),
  bestPractices: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  organizationId: z.string().optional(), // Multi-tenant support
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;

/**
 * PatternDetail interface for UI components
 * This is the expected format for the PatternDetailDrawer component
 */
export interface PatternDetail {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  shortDescription: string;
  fullDescription: string;
  howItWorks: string;
  whenToUse: string[];
  example: {
    before: string;
    after: string;
    explanation: string;
  };
  bestPractices: string[];
  commonMistakes: string[];
  relatedPatterns: string[];
}
