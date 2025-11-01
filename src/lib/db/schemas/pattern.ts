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
  example: z.string().optional(),
  useCases: z.array(z.string()).optional(),
  relatedPatterns: z.array(z.string()).optional(),
  icon: z.string().optional(),
  organizationId: z.string().optional(), // Multi-tenant support
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Pattern = z.infer<typeof PatternSchema>;
