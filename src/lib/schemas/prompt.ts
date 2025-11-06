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

export const userRoles = [
  'c-level',
  'engineering-manager',
  'engineer',
  'product-manager',
  'designer',
  'qa',
  'architect',
  'devops-sre',
  'scrum-master',
  'product-owner',
  'engineering-director',
  'product-director',
  'vp-engineering',
  'vp-product',
  'cto',
] as const;

export type UserRole = (typeof userRoles)[number];

export const experienceLevels = [
  'junior',
  'mid-level',
  'senior',
  'lead',
  'principal',
  'director',
  'vp',
] as const;

export const UserRoleSchema = z.enum(userRoles);
export const ExperienceLevelSchema = z.enum(experienceLevels);

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

/**
 * Quality Score Rubric (1-10 scale):
 * - Clarity (1-10): How clear and understandable is the prompt?
 * - Usefulness (1-10): How practical and applicable is it?
 * - Specificity (1-10): How well-targeted to role/skill level?
 * - Completeness (1-10): Does it provide all necessary context?
 * - Examples (1-10): Are examples helpful and relevant?
 *
 * Overall Score: Average of all rubric scores
 */
export const QualityRubricSchema = z.object({
  clarity: z.number().min(1).max(10),
  usefulness: z.number().min(1).max(10),
  specificity: z.number().min(1).max(10),
  completeness: z.number().min(1).max(10),
  examples: z.number().min(1).max(10),
  overall: z.number().min(1).max(10), // Computed average
  reviewedBy: z.string().optional(), // Admin who scored it
  reviewedAt: z.date().optional(),
  notes: z.string().optional(), // Review notes
  organizationId: z.string().optional(), // Multi-tenant support
});

export const PromptSchema = z.object({
  id: z.string(),
  slug: z.string().optional(), // URL-friendly slug for SEO
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: z.string().min(1),
  category: PromptCategorySchema,
  role: UserRoleSchema.optional(),
  experienceLevel: ExperienceLevelSchema.optional(),
  pattern: PromptPatternSchema.optional(), // AI prompt engineering pattern (e.g., 'chain-of-thought', 'few-shot')
  designPattern: z.string().optional(), // Software engineering design pattern (e.g., 'singleton', 'factory-pattern')
  tags: z.array(z.string()).default([]),
  views: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  authorId: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  // New fields for quality management
  active: z.boolean().default(true), // Toggle to show/hide on site
  qualityScore: QualityRubricSchema.optional(), // Admin quality review
  source: z.enum(['seed', 'ai-generated', 'user-submitted']).optional(), // Track origin
  organizationId: z.string().optional(), // Multi-tenant support
  
  // Freemium fields
  isPremium: z.boolean().default(false), // Premium content behind firewall
  isPublic: z.boolean().default(true), // Public or private
  requiresAuth: z.boolean().default(false), // Requires authentication to view
  
  // Revision tracking
  currentRevision: z.number().int().min(1).default(1), // Current revision number
  lastRevisedBy: z.string().optional(), // User who last revised
  lastRevisedAt: z.date().optional(), // When last revised
  
  // SEO & Educational Content
  whatIs: z.string().optional(), // Explanation of what the concept is
  whyUse: z.array(z.string()).optional(), // Array of reasons why someone would use this
  metaDescription: z.string().max(165).optional(), // SEO meta description (150-160 chars optimal)
  seoKeywords: z.array(z.string()).optional(), // SEO keywords array
  
  // Enrichment Fields - Content for user education and SEO
  caseStudies: z.array(z.object({
    title: z.string(),
    scenario: z.string().optional(),
    context: z.string().optional(),
    challenge: z.string().optional(),
    solution: z.string().optional(),
    process: z.string().optional(),
    outcome: z.string().optional(),
    keyLearning: z.string().optional(),
    metrics: z.string().optional(),
  })).optional(), // Real-world examples showing how prompts are used
  
  examples: z.array(z.object({
    title: z.string().optional(),
    input: z.string().optional(),
    output: z.string().optional(),
    expectedOutput: z.string().optional(),
    description: z.string().optional(),
  })).optional(), // Input/output examples
  
  useCases: z.array(z.string()).optional(), // Specific scenarios where prompts excel
  
  bestPractices: z.array(z.string()).optional(), // Tips for getting the best results
  
  bestTimeToUse: z.union([
    z.array(z.string()),
    z.string()
  ]).optional(), // Guidance on when to use each prompt
  
  recommendedModel: z.array(z.object({
    model: z.string(), // e.g., "gpt-4o", "claude-3-5-sonnet-20241022"
    provider: z.enum(['openai', 'anthropic', 'google', 'groq', 'replicate']).optional(),
    reason: z.string().optional(), // Why this model is recommended
    useCase: z.string().optional(), // Specific use case for this model
  })).optional(), // AI model suggestions with reasoning
  
  whenNotToUse: z.array(z.string()).optional(), // Guidance on when to avoid using a prompt
  
  difficulty: z.union([
    z.enum(['beginner', 'intermediate', 'advanced']),
    z.number().min(1).max(5), // 1-5 scale
  ]).optional(), // Difficulty level
  
  estimatedTime: z.union([
    z.string(), // e.g., "15-30 minutes"
    z.number(), // minutes
  ]).optional(), // Estimated time to complete
  
  verified: z.boolean().default(false).optional(), // Verified by admin/team
  
  // Interactive Parameters - Leading questions to collect inputs before using prompt
  parameters: z.array(z.object({
    id: z.string(), // Unique identifier (e.g., "programming_language", "security_focus")
    label: z.string(), // Display label (e.g., "Programming Language")
    type: z.enum(['text', 'select', 'textarea', 'checkbox', 'multiselect']), // Input type
    placeholder: z.string().optional(), // Placeholder text
    required: z.boolean().default(false), // Is this parameter required?
    options: z.array(z.string()).optional(), // Options for select/checkbox/multiselect
    description: z.string().optional(), // Help text explaining what's needed
    example: z.string().optional(), // Example value to guide users
    defaultValue: z.string().optional(), // Default value if any
  })).optional(), // Questions/parameters users need to provide before using prompt
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
export type ExperienceLevel = z.infer<typeof ExperienceLevelSchema>;
export type PromptPattern = z.infer<typeof PromptPatternSchema>;
export type CreatePrompt = z.infer<typeof CreatePromptSchema>;
export type UpdatePrompt = z.infer<typeof UpdatePromptSchema>;
export type QualityRubric = z.infer<typeof QualityRubricSchema>;

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
  architect: 'Architect',
  'devops-sre': 'DevOps/SRE',
  'scrum-master': 'Scrum Master',
  'product-owner': 'Product Owner',
  'engineering-director': 'Engineering Director',
  'product-director': 'Product Director',
  'vp-engineering': 'VP of Engineering',
  'vp-product': 'VP of Product',
  cto: 'CTO',
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
