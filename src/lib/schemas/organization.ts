/**
 * Organization Schemas - Zod validation
 */

import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
  plan: z.enum(['free', 'pro', 'team', 'enterprise']).default('free'),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  plan: z.enum(['free', 'pro', 'team', 'enterprise']).optional(),
  maxUsers: z.number().int().positive().optional(),
  maxAIExecutions: z.number().int().positive().optional(),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'user', 'viewer']),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
