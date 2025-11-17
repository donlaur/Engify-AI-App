/**
 * Recommendation Schema
 * 
 * Defines the structure for recommendations (best practices & strategic guidance).
 * Recommendations provide proactive "should do" advice that informs workflows and guardrails.
 */

import { z } from 'zod';

export const RecommendationSchema = z.object({
  id: z.string().min(1, 'Recommendation ID is required'),
  slug: z
    .string()
    .min(1, 'Recommendation slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase, numbers, hyphen)'),
  title: z.string().min(1, 'Recommendation title is required'),
  // Core recommendation content
  recommendationStatement: z.string().min(1, 'Recommendation statement is required'),
  description: z.string().min(1, 'Recommendation description is required'),
  whyThisMatters: z.string().min(1, 'Why this matters is required'), // Business/technical rationale
  whenToApply: z.string().min(1, 'When to apply is required'), // Context/scenarios
  implementationGuidance: z.string().optional(), // Optional implementation steps
  // Related content (can link to multiple workflows/guardrails/pain points)
  relatedWorkflows: z.array(z.string()).default([]), // Workflow slugs (format: category/slug)
  relatedGuardrails: z.array(z.string()).default([]), // Guardrail slugs (format: guardrails/subcategory/slug)
  relatedPainPoints: z.array(z.string()).default([]), // Pain point IDs
  relatedPrompts: z.array(z.string()).default([]), // Prompt slugs
  relatedPatterns: z.array(z.string()).default([]), // Pattern IDs
  // Research citations
  researchCitations: z.array(
    z.object({
      source: z.string().min(1),
      summary: z.string().min(1),
      url: z.string().url().optional(),
      verified: z.boolean().default(false),
    })
  ).default([]),
  // SEO keywords
  primaryKeywords: z.array(z.string()).default([]), // Primary SEO keywords
  recommendationKeywords: z.array(z.string()).default([]), // Recommendation-specific keywords
  solutionKeywords: z.array(z.string()).default([]), // Solution/guidance keywords
  keywords: z.array(z.string()).default([]), // General keywords (for backwards compatibility)
  // Metadata
  category: z.enum([
    'best-practices',
    'strategic-guidance',
    'tool-selection',
    'team-structure',
    'process-optimization',
    'risk-mitigation',
  ]).default('best-practices'),
  audience: z.array(z.enum([
    'engineers',
    'engineering-managers',
    'devops-sre',
    'security',
    'qa',
    'product-managers',
    'cto',
    'vp-engineering',
    'legal',
    'architects',
  ])).min(1, 'Specify at least one audience'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  status: z.enum(['draft', 'published']).default('draft'),
  // Metadata dates for SEO
  datePublished: z.string().optional(),
  dateModified: z.string().optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

export const RecommendationsJsonSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().min(1),
  totalRecommendations: z.number().int().nonnegative(),
  recommendations: z.array(RecommendationSchema),
});

export type RecommendationsJsonData = z.infer<typeof RecommendationsJsonSchema>;

export function validateRecommendationsJson(data: unknown): RecommendationsJsonData {
  return RecommendationsJsonSchema.parse(data);
}

