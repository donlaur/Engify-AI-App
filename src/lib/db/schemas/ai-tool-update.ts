/**
 * AI Tool Update Schema
 * 
 * Stores news, updates, and changelog entries from RSS feeds
 * for AI tools and models
 */

import { z } from 'zod';

export const AIToolUpdateSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // Unique identifier (GUID from RSS feed or generated)
  toolId: z.string().optional(), // ID of the AI tool this update relates to (e.g., 'cursor', 'windsurf')
  modelId: z.string().optional(), // ID of the primary AI model this update relates to (e.g., 'gpt-5', 'gemini-3')
  relatedTools: z.array(z.string()).default([]), // Additional tool IDs mentioned (with lower confidence)
  relatedModels: z.array(z.string()).default([]), // Additional model IDs mentioned (with lower confidence)
  matchConfidence: z.number().min(0).max(1).optional(), // Confidence score of the primary match
  type: z.enum([
    'tool-update', // Tool feature update (e.g., Warp's /plan feature)
    'model-release', // New model release (e.g., GPT-5.1, Gemini 3)
    'status-incident', // Status page incident
    'changelog', // Changelog entry
    'blog-post', // Blog post about the tool/model
    'announcement', // General announcement
  ]).default('tool-update'),
  title: z.string(),
  description: z.string().optional(), // HTML or plain text description
  content: z.string().optional(), // Full content if available
  link: z.string().url(), // Original source URL
  author: z.string().optional(),
  publishedAt: z.date(), // Publication date from feed
  updatedAt: z.date().optional(), // Last update date
  feedUrl: z.string().url(), // RSS/Atom feed URL this came from
  guid: z.string().optional(), // GUID from RSS feed (for deduplication)
  categories: z.array(z.string()).default([]), // Tags/categories from feed
  imageUrl: z.string().url().optional(), // Featured image if available
  status: z.enum(['active', 'archived']).default('active'),
  
  // Metadata
  source: z.enum([
    'cursor-blog',
    'cursor-status',
    'windsurf-changelog',
    'codeium-status',
    'openrouter-status',
    'huggingface-blog',
    'openai-blog',
    'anthropic-blog',
    'google-ai-blog',
    'warp-blog',
    'other',
  ]).default('other'),
  
  // Feature extraction (for tool updates)
  features: z.array(z.string()).default([]), // Extracted feature names (e.g., ['Full Terminal Use', '/plan'])
  
  // Organization ID for multi-tenant (null = system-wide/public)
  organizationId: z.string().optional(),
  
  createdAt: z.date().optional(),
  syncedAt: z.date().optional(), // When this was synced from feed
});

export type AIToolUpdate = z.infer<typeof AIToolUpdateSchema>;

