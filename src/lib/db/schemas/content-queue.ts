/**
 * Content Queue Schema
 * Stores content ideas in a queue for batch generation
 */

import { z } from 'zod';

export const ContentQueueItemSchema = z.object({
  id: z.string(),
  title: z.string(),
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
  description: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  targetWordCount: z.number().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  status: z.enum(['queued', 'generating', 'completed', 'failed']).default('queued'),
  batch: z.string().optional(), // Group related items
  estimatedCost: z.number().optional(),
  estimatedTime: z.number().optional(),
  
  // Generation results
  generatedContentId: z.string().optional(),
  generationJobId: z.string().optional(),
  generationError: z.string().optional(),
  
  // Metadata
  createdBy: z.string(), // User ID
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  generatedAt: z.date().optional(),
  
  // Source tracking
  source: z.enum(['manual', 'ai-research', 'ai-suggestion', 'import']).default('manual'),
  sourceNotes: z.string().optional(),
});

export type ContentQueueItem = z.infer<typeof ContentQueueItemSchema>;

export const ContentQueueBatchSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  itemIds: z.array(z.string()),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending'),
  createdBy: z.string(),
  createdAt: z.date().default(() => new Date()),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type ContentQueueBatch = z.infer<typeof ContentQueueBatchSchema>;
