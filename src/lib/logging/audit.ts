/**
 * Audit Logging System
 *
 * Comprehensive audit trail for security and compliance
 * 7-year retention for SOC 2 / FedRAMP compliance
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { sanitizeMeta, sanitizeValue } from '@/lib/logging/sanitizer';
import { getDb } from '@/lib/mongodb';

// ============================================================================
// AUDIT EVENT TYPES
// ============================================================================

export type AuditAction =
  | 'user_login'
  | 'user_logout'
  | 'user_signup'
  | 'user_update'
  | 'user_delete'
  | 'password_change'
  | 'password_reset'
  | 'MFA_CODE_SENT'
  | 'MFA_CODE_VERIFIED'
  | 'MFA_VERIFICATION_FAILED'
  | 'MFA_VERIFICATION_FAILED_MAX_ATTEMPTS'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'api_key_rotated'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'api_key_rotate_failed'
  | 'api_key_revoke_failed'
  | 'usage_alert_created'
  | 'usage_alert_triggered'
  | 'usage_alert_deleted'
  | 'prompt_executed'
  | 'rate_limit_exceeded'
  | 'validation_failed'
  | 'validation_error'
  | 'unauthorized_access'
  | 'permission_denied'
  | 'data_export'
  | 'data_import'
  | 'admin_action'
  | 'security_alert'
  | 'beta_access_requested'
  | 'beta_access_request_failed'
  | 'jira_connected'
  | 'jira_connect_failed'
  | 'jira_disconnected'
  | 'message_received'
  | 'message_processed'
  | 'message_failed'
  | 'message_processing_error'
  | 'message_callback_received'
  | 'callback_processing_error'
  | 'INBOUND_EMAIL_RECEIVED'
  | 'WEBHOOK_ERROR'
  | 'TWILIO_WEBHOOK_SIGNATURE_FAILED'
  | 'TWILIO_WEBHOOK_ERROR'
  | 'TWILIO_WEBHOOK_RECEIVED'
  | 'sendgrid_event_received'
  | 'sendgrid_event_failed'
  | 'SMS_STATUS_UPDATE'
  | 'CALL_STATUS_UPDATE'
  | 'content_review_decision'
  | 'prompt_media_regenerated'
  | 'prompt_media_viewed'
  | 'content_creation_triggered'
  | 'content_creation_failed'
  | 'content_creation_error'
  | 'admin_settings_viewed'
  | 'admin_settings_access_error';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  resource?: string;
  details?: Record<string, unknown>;
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

// ============================================================================
// WINSTON LOGGER CONFIGURATION
// ============================================================================

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'engify-audit' },
  transports: [
    // Daily rotating file for audit logs
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '2555d', // 7 years retention
      level: 'info',
    }),

    // Separate file for security alerts
    new DailyRotateFile({
      filename: 'logs/security-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '2555d',
      level: 'warning',
    }),
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// ============================================================================
// AUDIT LOG FUNCTIONS
// ============================================================================

export async function auditLog(entry: AuditLogEntry): Promise<void> {
  const logEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date(),
    severity: entry.severity || 'info',
    details: entry.details ? sanitizeMeta(entry.details) : undefined,
    userId: sanitizeValue(entry.userId) as string | undefined,
    resource: sanitizeValue(entry.resource) as string | undefined,
    ipAddress: sanitizeValue(entry.ipAddress) as string | undefined,
    userAgent: sanitizeValue(entry.userAgent) as string | undefined,
  };

  // Determine log level
  const level =
    logEntry.severity === 'critical' || logEntry.severity === 'error'
      ? 'error'
      : logEntry.severity === 'warning'
        ? 'warn'
        : 'info';

  auditLogger.log(level, 'Audit Event', logEntry);

  // For critical events, also log to MongoDB for real-time alerting
  if (logEntry.severity === 'critical') {
    await logCriticalEvent(logEntry);
  }
}

async function logCriticalEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // MongoDB logging for critical events (allows real-time monitoring and alerting)
    const db = await getDb();
    await db.collection('critical_audit_logs').insertOne({
      ...entry,
      timestamp: entry.timestamp || new Date(),
      loggedAt: new Date(),
    });
    console.error('CRITICAL SECURITY EVENT:', entry);
  } catch (error) {
    console.error('Failed to log critical event:', error);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function logUserAction(
  action: AuditAction,
  userId: string,
  details?: Record<string, unknown>
): Promise<void> {
  await auditLog({
    action,
    userId,
    details,
    severity: 'info',
  });
}

export async function logSecurityEvent(
  action: AuditAction,
  details: Record<string, unknown>,
  severity: AuditSeverity = 'warning'
): Promise<void> {
  await auditLog({
    action,
    details,
    severity,
  });
}

export async function logUnauthorizedAccess(
  resource: string,
  userId?: string,
  ipAddress?: string
): Promise<void> {
  await auditLog({
    action: 'unauthorized_access',
    userId,
    resource,
    ipAddress,
    severity: 'warning',
    details: {
      message: 'Unauthorized access attempt',
    },
  });
}

export async function logRateLimitExceeded(
  userId: string,
  resource: string,
  ipAddress?: string
): Promise<void> {
  await auditLog({
    action: 'rate_limit_exceeded',
    userId,
    resource,
    ipAddress,
    severity: 'warning',
    details: {
      message: 'Rate limit exceeded',
    },
  });
}

// ============================================================================
// QUERY FUNCTIONS (for compliance reporting)
// ============================================================================

export interface AuditQuery {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  severity?: AuditSeverity;
}

export async function queryAuditLogs(query: AuditQuery): Promise<unknown[]> {
  try {
    const db = await getDb();

    // Build MongoDB query from filters
    const mongoQuery: Record<string, unknown> = {};
    if (query.startDate || query.endDate) {
      mongoQuery.timestamp = {};
      if (query.startDate) {
        mongoQuery.timestamp = {
          ...(mongoQuery.timestamp as Record<string, unknown>),
          $gte: query.startDate,
        };
      }
      if (query.endDate) {
        mongoQuery.timestamp = {
          ...(mongoQuery.timestamp as Record<string, unknown>),
          $lte: query.endDate,
        };
      }
    }
    if (query.userId) {
      mongoQuery.userId = query.userId;
    }
    if (query.action) {
      mongoQuery.action = query.action;
    }
    if (query.severity) {
      mongoQuery.severity = query.severity;
    }

    // Query critical audit logs
    const logs = await db
      .collection('critical_audit_logs')
      .find(mongoQuery)
      .toArray();
    return logs;
  } catch (error) {
    console.error('Failed to query audit logs:', error);
    return [];
  }
}

export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<unknown> {
  try {
    const db = await getDb();

    // Aggregate compliance metrics
    const report = await db
      .collection('critical_audit_logs')
      .aggregate([
        {
          $match: {
            timestamp: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            criticalEvents: {
              $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] },
            },
            errorEvents: {
              $sum: { $cond: [{ $eq: ['$severity', 'error'] }, 1, 0] },
            },
            warningEvents: {
              $sum: { $cond: [{ $eq: ['$severity', 'warning'] }, 1, 0] },
            },
            uniqueUsers: { $addToSet: '$userId' },
          },
        },
        {
          $project: {
            _id: 0,
            totalEvents: 1,
            criticalEvents: 1,
            errorEvents: 1,
            warningEvents: 1,
            uniqueUsersCount: { $size: '$uniqueUsers' },
          },
        },
      ])
      .toArray();

    if (report && report.length > 0) {
      return report[0];
    }

    return {
      totalEvents: 0,
      criticalEvents: 0,
      errorEvents: 0,
      warningEvents: 0,
      uniqueUsersCount: 0,
    };
  } catch (error) {
    console.error('Failed to generate compliance report:', error);
    return {};
  }
}
