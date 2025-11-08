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
  externalLinks: z.array(z.object({
    anchor: z.string(),
    url: z.string(),
    authority: z.string(), // e.g., "cursor.directory", "official docs"
  })).optional(),
  internalLinks: z.array(z.object({
    anchor: z.string(),
    url: z.string(),
    type: z.enum(['prompt', 'pattern', 'article', 'tool']),
  })).optional(),
  ragQuery: z.string().optional(), // Query our content for related resources
  
  // Generated content and quality (populated after generation)
  generated: z.object({
    content: z.string().optional(),
    wordCount: z.number().optional(),
    qualityScore: z.number().optional(), // 0-10
    flags: z.array(z.string()).optional(), // ['too-short', 'no-code', etc.]
    readability: z.object({
      fleschKincaid: z.number().optional(), // Grade level
      fleschReadingEase: z.number().optional(), // 0-100
      avgSentenceLength: z.number().optional(),
      avgWordLength: z.number().optional(),
    }).optional(),
    generatedAt: z.date().optional(),
  }).optional(),
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
    wordCount: z.number().optional(),
    generatedAt: z.date().optional(),
    
    // Quality scores
    qualityScore: z.object({
      overall: z.number().optional(), // 0-10
      aiSlop: z.number().optional(), // 0-10
      eeat: z.number().optional(), // 0-10
      seo: z.number().optional(), // 0-10
      technical: z.number().optional(), // 0-10
      readability: z.number().optional(), // 0-10
    }).optional(),
    
    // Readability metrics
    readability: z.object({
      fleschKincaid: z.number().optional(), // Grade level
      fleschReadingEase: z.number().optional(), // 0-100
      avgSentenceLength: z.number().optional(),
      avgWordLength: z.number().optional(),
      avgParagraphLength: z.number().optional(),
    }).optional(),
    
    // Schema markup validation
    schema: z.object({
      hasArticleSchema: z.boolean().optional(),
      hasBreadcrumbs: z.boolean().optional(),
      hasAuthor: z.boolean().optional(),
      hasPublishDate: z.boolean().optional(),
      hasModifiedDate: z.boolean().optional(),
      hasImages: z.boolean().optional(),
      validationErrors: z.array(z.string()).optional(),
    }).optional(),
    
    // Cohesion review
    cohesion: z.object({
      score: z.number().optional(), // 0-10
      feedback: z.string().optional(),
      improvements: z.array(z.string()).optional(),
    }).optional(),
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
