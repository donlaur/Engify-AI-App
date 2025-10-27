/**
 * Audit Logging Middleware for tRPC
 * 
 * Red Hat Review - Critical Fix: Audit Logging
 * Automatically logs all security-relevant operations
 */

import { auditLogService } from '@/lib/services/AuditLogService';
import { AuditEventTypeEnum } from '@/lib/db/schemas/auditLog';

/**
 * Helper to extract IP address from request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getIpAddress(req: any): string {
  return (
    req.headers?.['x-forwarded-for']?.split(',')[0] ||
    req.headers?.['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Helper to extract user agent from request
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUserAgent(req: any): string | null {
  return req.headers?.['user-agent'] || null;
}

/**
 * Log an audit event
 * Use this helper in your tRPC procedures
 */
export async function logAuditEvent(params: {
  eventType: AuditEventTypeEnum;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  organizationId?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  requestId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string | null;
}): Promise<void> {
  try {
    await auditLogService.log(params);
  } catch (error) {
    // Never let audit logging break the main operation
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Audit logging decorator for tRPC procedures
 * Usage: Wrap your procedure logic with this
 */
export function withAudit<T>(
  eventType: AuditEventTypeEnum,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAction: (input: any) => string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getMetadata?: (input: any, result?: T) => Record<string, unknown>
) {
  return async (
    fn: () => Promise<T>,
    ctx: {
      session?: { user?: { id: string; email: string; role: string; organizationId?: string } };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req?: any;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: any
  ): Promise<T> => {
    const ipAddress = ctx.req ? getIpAddress(ctx.req) : 'unknown';
    const userAgent = ctx.req ? getUserAgent(ctx.req) : null;
    
    try {
      const result = await fn();
      
      // Log successful operation
      await logAuditEvent({
        eventType,
        userId: ctx.session?.user?.id || null,
        userEmail: ctx.session?.user?.email || null,
        userRole: ctx.session?.user?.role || null,
        organizationId: ctx.session?.user?.organizationId || null,
        ipAddress,
        userAgent,
        action: getAction(input),
        metadata: getMetadata ? getMetadata(input, result) : undefined,
        success: true,
      });
      
      return result;
    } catch (error) {
      // Log failed operation
      await logAuditEvent({
        eventType,
        userId: ctx.session?.user?.id || null,
        userEmail: ctx.session?.user?.email || null,
        userRole: ctx.session?.user?.role || null,
        organizationId: ctx.session?.user?.organizationId || null,
        ipAddress,
        userAgent,
        action: getAction(input),
        metadata: getMetadata ? getMetadata(input) : undefined,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  };
}
