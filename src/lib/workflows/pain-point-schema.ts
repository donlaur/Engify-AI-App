/**
 * Pain Point Schema
 * 
 * Defines the structure for pain points that workflows address.
 * Each pain point can have its own page for SEO and detailed explanation.
 */

import { z } from 'zod';

export const PainPointSchema = z.object({
  id: z.string().min(1, 'Pain point ID is required'),
  slug: z
    .string()
    .min(1, 'Pain point slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase, numbers, hyphen)'),
  title: z.string().min(1, 'Pain point title is required'),
  description: z.string().min(1, 'Pain point description is required'),
  // Enhanced content fields
  coreProblem: z.string().optional(), // The Core Problem - brief summary
  problemStatement: z.string().min(1, 'Problem statement is required'),
  impact: z.string().optional(), // Impact on Teams & Business
  // Expanded examples with titles and descriptions
  examples: z.array(z.string()).default([]), // Simple examples (backwards compatible)
  expandedExamples: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
  ).default([]), // Expanded real-world examples
  // Solution workflows with explanations
  solutionWorkflows: z.array(
    z.object({
      workflowId: z.string().min(1), // Format: category/slug
      title: z.string().min(1),
      painPointItSolves: z.string().min(1),
      whyItWorks: z.string().min(1),
    })
  ).default([]),
  // Related resources
  relatedWorkflows: z.array(z.string()).default([]), // Workflow slugs that address this (for backwards compatibility)
  relatedPrompts: z.array(z.string()).default([]), // Prompt slugs
  relatedPatterns: z.array(z.string()).default([]), // Pattern IDs
  researchCitations: z.array(
    z.object({
      source: z.string().min(1),
      summary: z.string().min(1),
      url: z.string().url().optional(),
      verified: z.boolean().default(false),
    })
  ).default([]),
  // SEO keywords (categorized)
  primaryKeywords: z.array(z.string()).default([]), // Primary SEO keywords
  painPointKeywords: z.array(z.string()).default([]), // Pain point specific keywords
  solutionKeywords: z.array(z.string()).default([]), // Solution keywords
  keywords: z.array(z.string()).default([]), // General keywords (for backwards compatibility)
  status: z.enum(['draft', 'published']).default('draft'),
  // Metadata dates for SEO
  datePublished: z.string().optional(),
  dateModified: z.string().optional(),
});

export type PainPoint = z.infer<typeof PainPointSchema>;

export const PainPointsJsonSchema = z.object({
  version: z.string().min(1),
  generatedAt: z.string().min(1),
  totalPainPoints: z.number().int().nonnegative(),
  painPoints: z.array(PainPointSchema),
});

export type PainPointsJsonData = z.infer<typeof PainPointsJsonSchema>;

export function validatePainPointsJson(data: unknown): PainPointsJsonData {
  return PainPointsJsonSchema.parse(data);
}

