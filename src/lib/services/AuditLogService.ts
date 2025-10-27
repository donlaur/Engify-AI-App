/**
 * Audit Log Service
 * 
 * Red Hat Review - Critical Fix: Audit Logging
 * Tracks all security-relevant events for SOC2 compliance
 */

import { ObjectId } from 'mongodb';
import { BaseService } from './BaseService';
import { AuditLog, AuditLogSchema, AuditEventTypeEnum, AuditLogFilters } from '@/lib/db/schemas/auditLog';

export class AuditLogService extends BaseService<AuditLog> {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super('audit_logs', AuditLogSchema as any);
  }

  /**
   * Log an audit event
   * This is the primary method for creating audit logs
   */
  async log(params: {
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
  }): Promise<AuditLog> {
    // Determine event category from event type
    const eventCategory = this.getEventCategory(params.eventType);
    
    // Calculate expiration (1 year retention for SOC2)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    const auditLog: Omit<AuditLog, '_id'> = {
      eventType: params.eventType,
      eventCategory,
      userId: params.userId ? new ObjectId(params.userId) : null,
      userEmail: params.userEmail || null,
      userRole: params.userRole || null,
      resourceType: params.resourceType || null,
      resourceId: params.resourceId ? new ObjectId(params.resourceId) : null,
      organizationId: params.organizationId ? new ObjectId(params.organizationId) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent || null,
      requestId: params.requestId || null,
      action: params.action,
      metadata: params.metadata,
      success: params.success,
      errorMessage: params.errorMessage || null,
      timestamp: new Date(),
      expiresAt,
    };
    
    return await this.insertOne(auditLog as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  /**
   * Query audit logs with filters
   */
  async query(filters: AuditLogFilters, page: number = 1, limit: number = 50) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    
    if (filters.userId) {
      query.userId = filters.userId;
    }
    
    if (filters.organizationId) {
      query.organizationId = filters.organizationId;
    }
    
    if (filters.eventType) {
      query.eventType = filters.eventType;
    }
    
    if (filters.eventCategory) {
      query.eventCategory = filters.eventCategory;
    }
    
    if (filters.resourceType) {
      query.resourceType = filters.resourceType;
    }
    
    if (filters.resourceId) {
      query.resourceId = filters.resourceId;
    }
    
    if (filters.success !== undefined) {
      query.success = filters.success;
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        query.timestamp.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.timestamp.$lte = filters.endDate;
      }
    }
    
    return await this.findPaginated(query, page, limit);
  }

  /**
   * Get audit logs for a specific user
   */
  async getByUser(userId: string, page: number = 1, limit: number = 50) {
    return await this.query({ userId: new ObjectId(userId) }, page, limit);
  }

  /**
   * Get audit logs for a specific organization
   */
  async getByOrganization(organizationId: string, page: number = 1, limit: number = 50) {
    return await this.query({ organizationId: new ObjectId(organizationId) }, page, limit);
  }

  /**
   * Get security events (failed logins, rate limits, etc.)
   */
  async getSecurityEvents(page: number = 1, limit: number = 50) {
    return await this.query({ eventCategory: 'security' }, page, limit);
  }

  /**
   * Get failed authentication attempts
   */
  async getFailedLogins(page: number = 1, limit: number = 50) {
    return await this.query({ 
      eventType: 'auth.login.failed',
      success: false,
    }, page, limit);
  }

  /**
   * Clean up expired audit logs
   * Should be run periodically (e.g., daily cron job)
   */
  async cleanupExpired(): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({
      expiresAt: { $lte: new Date() },
    });
    return result.deletedCount;
  }

  /**
   * Get event category from event type
   */
  private getEventCategory(eventType: AuditEventTypeEnum): 'auth' | 'data' | 'security' | 'admin' {
    if (eventType.startsWith('auth.')) return 'auth';
    if (eventType.startsWith('security.')) return 'security';
    if (eventType.startsWith('admin.')) return 'admin';
    return 'data';
  }
}

export const auditLogService = new AuditLogService();
