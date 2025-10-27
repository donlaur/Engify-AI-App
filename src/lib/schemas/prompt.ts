/**
 * Prompt Schema
 *
 * Defines the structure for prompts in the library
 * Source of truth for prompt types
 */

import { z } from 'zod';

export const PromptCategorySchema = z.enum([
  'code-generation',
  'debugging',
  'documentation',
  'testing',
  'refactoring',
  'architecture',
  'learning',
  'general',
]);

export const UserRoleSchema = z.enum([
  'c-level',
  'engineering-manager',
  'engineer',
  'product-manager',
  'designer',
  'qa',
]);

export const PromptPatternSchema = z.enum([
  'persona',
  'format',
  'few-shot',
  'chain-of-thought',
  'template',
  'context',
  'constraint',
  'refinement',
  'meta-language',
  'recipe',
  'alternative-approaches',
  'cognitive-verifier',
  'audience-persona',
  'flipped-interaction',
  'game-play',
]);

export const PromptSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.string().min(1),
  category: PromptCategorySchema,
  role: UserRoleSchema.optional(),
  pattern: PromptPatternSchema.optional(),
  tags: z.array(z.string()).default([]),
  views: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const CreatePromptSchema = PromptSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
  rating: true,
  ratingCount: true,
});

export const UpdatePromptSchema = CreatePromptSchema.partial();

// Types
export type Prompt = z.infer<typeof PromptSchema>;
export type PromptCategory = z.infer<typeof PromptCategorySchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type PromptPattern = z.infer<typeof PromptPatternSchema>;
export type CreatePrompt = z.infer<typeof CreatePromptSchema>;
export type UpdatePrompt = z.infer<typeof UpdatePromptSchema>;

// Helper functions
export const categoryLabels: Record<PromptCategory, string> = {
  'code-generation': 'Code Generation',
  debugging: 'Debugging',
  documentation: 'Documentation',
  testing: 'Testing',
  refactoring: 'Refactoring',
  architecture: 'Architecture',
  learning: 'Learning',
  general: 'General',
};

export const roleLabels: Record<UserRole, string> = {
  'c-level': 'C-Level',
  'engineering-manager': 'Engineering Manager',
  engineer: 'Engineer',
  'product-manager': 'Product Manager',
  designer: 'Designer',
  qa: 'QA Engineer',
};

export const patternLabels: Record<PromptPattern, string> = {
  persona: 'Persona Pattern',
  format: 'Format Pattern',
  'few-shot': 'Few-Shot Pattern',
  'chain-of-thought': 'Chain of Thought',
  template: 'Template Pattern',
  context: 'Context Pattern',
  constraint: 'Constraint Pattern',
  refinement: 'Refinement Pattern',
  'meta-language': 'Meta Language',
  recipe: 'Recipe Pattern',
  'alternative-approaches': 'Alternative Approaches',
  'cognitive-verifier': 'Cognitive Verifier',
  'audience-persona': 'Audience Persona',
  'flipped-interaction': 'Flipped Interaction',
  'game-play': 'Game Play',
};
