/**
 * Feed Configuration Schema
 * 
 * Stores RSS/Atom/API feed configurations for the news aggregator
 */

import { z } from 'zod';

export const FeedConfigSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  source: z.enum([
    'cursor-blog', 'cursor-status', 'windsurf-changelog', 'codeium-status',
    'openrouter-status', 'huggingface-blog', 'warp-blog', 'openai-blog',
    'anthropic-blog', 'google-ai-blog', 'other'
  ]),
  toolId: z.string().optional(), // ID of the AI tool this feed is for
  modelId: z.string().optional(), // ID of the AI model this feed is for
  type: z.enum(['tool-update', 'model-release', 'status-incident', 'changelog', 'blog-post', 'announcement']),
  feedType: z.enum(['rss', 'atom', 'api']).default('rss'),
  name: z.string().optional(), // Human-readable name for the feed
  description: z.string().optional(), // Description of what this feed contains
  enabled: z.boolean().default(true), // Whether this feed is active
  organizationId: z.string().optional(), // For multi-tenant support
  apiConfig: z.object({
    endpoint: z.string().url(),
    headers: z.record(z.string()).optional(),
    transform: z.string().optional(), // Function name or reference for transformation
  }).optional(),
  syncInterval: z.number().optional(), // Minutes between syncs (default: 60)
  lastSyncedAt: z.date().optional(),
  lastError: z.string().optional(),
  errorCount: z.number().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type FeedConfig = z.infer<typeof FeedConfigSchema>;

