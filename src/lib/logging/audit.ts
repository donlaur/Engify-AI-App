/**
 * Audit Logging System
 * 
 * Comprehensive audit trail for security and compliance
 * 7-year retention for SOC 2 / FedRAMP compliance
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

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
  | 'api_key_created'
  | 'api_key_revoked'
  | 'prompt_executed'
  | 'rate_limit_exceeded'
  | 'validation_failed'
  | 'validation_error'
  | 'unauthorized_access'
  | 'permission_denied'
  | 'data_export'
  | 'data_import'
  | 'admin_action'
  | 'security_alert';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  resource?: string;
  details?: Record<string, any>;
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
  };
  
  // Determine log level
  const level = logEntry.severity === 'critical' || logEntry.severity === 'error' 
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
    // TODO: Implement MongoDB logging for critical events
    // This allows real-time monitoring and alerting
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
  details?: Record<string, any>
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
  details: Record<string, any>,
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

export async function queryAuditLogs(query: AuditQuery): Promise<any[]> {
  // TODO: Implement audit log querying
  // This is required for compliance reporting and investigations
  return [];
}

export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<any> {
  // TODO: Implement compliance reporting
  // Required for SOC 2 / FedRAMP audits
  return {};
}
