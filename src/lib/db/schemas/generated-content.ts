/**
 * Generated Content Schema
 * Stores AI-generated content for review before publishing
 */

import { z } from 'zod';

export const GeneratedContentSchema = z.object({
  id: z.string(),
  queueItemId: z.string().optional(), // Link back to queue item
  
  // Content details
  title: z.string(),
  content: z.string(), // Markdown content
  contentType: z.enum([
    'pillar-page',
    'hub-spoke',
    'tutorial',
    'guide',
    'news',
    'case-study',
    'comparison',
    'best-practices',
  ]),
  
  // Metadata
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  slug: z.string().optional(),
  category: z.string().optional(),
  
  // Quality metrics
  wordCount: z.number(),
  readingTime: z.number().optional(), // minutes
  seoScore: z.number().optional(), // 0-100
  
  // Generation details
  model: z.string().optional(), // AI model used
  costUSD: z.number().optional(),
  generationTimeMs: z.number().optional(),
  
  // Review status
  status: z.enum(['pending', 'approved', 'rejected', 'published']).default('pending'),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
  
  // Publishing
  publishedUrl: z.string().optional(),
  publishedAt: z.date().optional(),
  
  // Metadata
  createdBy: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;
