/**
 * Audit Log Schema
 * 
 * Red Hat Review - Critical Fix: Audit Logging
 * SOC2 Requirement: Track all security-relevant events
 */

import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Audit event types
 */
export const AuditEventType = z.enum([
  // Authentication events
  'auth.login.success',
  'auth.login.failed',
  'auth.logout',
  'auth.signup',
  'auth.password_reset.requested',
  'auth.password_reset.completed',
  'auth.session.expired',
  
  // Data operations
  'prompt.created',
  'prompt.updated',
  'prompt.deleted',
  'prompt.viewed',
  'prompt.executed',
  
  // User operations
  'user.created',
  'user.updated',
  'user.deleted',
  'user.role.changed',
  
  // Organization operations
  'organization.created',
  'organization.updated',
  'organization.member.added',
  'organization.member.removed',
  
  // Security events
  'security.rate_limit.exceeded',
  'security.xss.detected',
  'security.unauthorized_access',
  'security.permission.denied',
  
  // Admin operations
  'admin.user.suspended',
  'admin.user.activated',
  'admin.settings.changed',
]);

export type AuditEventTypeEnum = z.infer<typeof AuditEventType>;

/**
 * Audit log entry schema
 */
export const AuditLogSchema = z.object({
  _id: z.instanceof(ObjectId),
  
  // Event information
  eventType: AuditEventType,
  eventCategory: z.enum(['auth', 'data', 'security', 'admin']),
  
  // Actor (who performed the action)
  userId: z.instanceof(ObjectId).nullable(),
  userEmail: z.string().email().nullable(),
  userRole: z.string().nullable(),
  
  // Target (what was affected)
  resourceType: z.string().nullable(), // 'prompt', 'user', 'organization'
  resourceId: z.instanceof(ObjectId).nullable(),
  
  // Organization context (for multi-tenancy)
  organizationId: z.instanceof(ObjectId).nullable(),
  
  // Request context
  ipAddress: z.string(),
  userAgent: z.string().nullable(),
  requestId: z.string().nullable(),
  
  // Event details
  action: z.string(), // Human-readable action description
  metadata: z.record(z.unknown()).optional(), // Additional context
  
  // Result
  success: z.boolean(),
  errorMessage: z.string().nullable(),
  
  // Timestamps
  timestamp: z.date(),
  
  // Retention
  expiresAt: z.date().optional(), // For automatic cleanup
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * Audit log query filters
 */
export const AuditLogFiltersSchema = z.object({
  userId: z.instanceof(ObjectId).optional(),
  organizationId: z.instanceof(ObjectId).optional(),
  eventType: AuditEventType.optional(),
  eventCategory: z.enum(['auth', 'data', 'security', 'admin']).optional(),
  resourceType: z.string().optional(),
  resourceId: z.instanceof(ObjectId).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  success: z.boolean().optional(),
});

export type AuditLogFilters = z.infer<typeof AuditLogFiltersSchema>;
