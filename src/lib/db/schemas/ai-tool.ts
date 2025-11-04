/**
 * AI Tool Schema
 * Validation for AI development tools stored in MongoDB
 */

import { z } from 'zod';

export const AIToolSchema = z.object({
  _id: z.string().optional(),
  id: z.string(), // Unique identifier: 'cursor', 'windsurf', etc.
  slug: z.string(), // URL-friendly slug for SEO
  name: z.string(), // Display name: 'Cursor'
  tagline: z.string().optional(), // Short description
  description: z.string(), // Full description
  category: z
    .enum(['ide', 'code-assistant', 'terminal', 'builder', 'other'])
    .default('other'),
  pricing: z
    .object({
      free: z.boolean().default(false),
      paid: z
        .object({
          monthly: z.number().optional(),
          annual: z.number().optional(),
          tier: z.string().optional(), // 'Pro', 'Enterprise', etc.
        })
        .optional(),
    })
    .default({ free: false }),
  features: z.array(z.string()).default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  affiliateLink: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).default(0),
  status: z.enum(['active', 'deprecated', 'sunset']).default('active'),
  lastUpdated: z.date().optional(),
  tags: z.array(z.string()).default([]),
  icon: z.string().optional(), // Icon name/key
  organizationId: z.string().optional(), // Multi-tenant support (null = system-wide)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type AITool = z.infer<typeof AIToolSchema>;
