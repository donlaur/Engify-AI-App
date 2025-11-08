/**
 * MongoDB Schema for Article Research Data
 * Stores research, quotes, pricing, and generation status
 */

import { z } from 'zod';

export const ArticleSectionSchema = z.object({
  title: z.string(),
  purpose: z.string(), // E-E-A-T focus
  targetWords: z.number(),
  context: z.string(), // Research data for this section
});

export const ArticleResearchSchema = z.object({
  _id: z.string().optional(),
  
  // Working title (before editor optimization)
  workingTitle: z.string(),
  
  // Generation status
  status: z.enum([
    'draft',           // Research being collected
    'ready',           // Ready for generation
    'generating',      // Currently generating
    'review',          // Generated, needs review
    'approved',        // Approved for publishing
    'published',       // Published to site
    'archived'         // Old/deprecated
  ]),
  
  // Target keywords
  keywords: z.array(z.string()),
  
  // User quotes and community feedback
  userQuotes: z.object({
    proCursor: z.array(z.string()).optional(),
    proWindsurf: z.array(z.string()).optional(),
    general: z.array(z.string()).optional(),
  }).optional(),
  
  // Pricing data (markdown table or structured data)
  pricing: z.string().optional(),
  
  // Core philosophy/comparison data
  corePhilosophy: z.object({
    cursor: z.string().optional(),
    windsurf: z.string().optional(),
  }).optional(),
  
  // Article structure (sections to generate)
  sections: z.array(ArticleSectionSchema),
  
  // Additional context
  additionalContext: z.string().optional(),
  
  // Generated content
  generated: z.object({
    finalTitle: z.string().optional(),      // Editor-optimized title
    slug: z.string().optional(),
    content: z.string().optional(),
    seoMetadata: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }).optional(),
    slopScore: z.number().optional(),
    wordCount: z.number().optional(),
    generatedAt: z.date().optional(),
  }).optional(),
  
  // Metadata
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().optional(),
});

export type ArticleResearch = z.infer<typeof ArticleResearchSchema>;
export type ArticleSection = z.infer<typeof ArticleSectionSchema>;

// MongoDB collection name
export const ARTICLE_RESEARCH_COLLECTION = 'article_research';
