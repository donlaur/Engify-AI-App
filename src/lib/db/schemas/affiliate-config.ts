/**
 * Affiliate Configuration Schema
 * Management of affiliate and referral links
 */

import { z } from 'zod';

export const AffiliateLinkSchema = z.object({
  _id: z.string().optional(),
  tool: z.string(),
  baseUrl: z.string().url(),
  referralUrl: z.string().url().optional(),
  affiliateCode: z.string().optional(),
  commission: z.string().optional(),
  status: z.enum(['active', 'pending', 'requested']),
  notes: z.string().optional(),
  // Metadata
  organizationId: z.string().optional(), // Multi-tenant support
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Analytics
  clickCount: z.number().default(0),
  conversionCount: z.number().default(0),
  lastClickAt: z.date().optional(),
});

export type AffiliateLink = z.infer<typeof AffiliateLinkSchema>;

export const PartnershipOutreachSchema = z.object({
  _id: z.string().optional(),
  company: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  contact: z.string().email(),
  rating: z.number().optional(),
  traffic: z.string().optional(),
  status: z.enum(['pending', 'contacted', 'responded', 'partnership']),
  notes: z.string().optional(),
  organizationId: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type PartnershipOutreach = z.infer<typeof PartnershipOutreachSchema>;
