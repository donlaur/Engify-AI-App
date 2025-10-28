import { AuditService } from '@/lib/services/AuditService';

export class SecurityMonitor {
  private auditService: AuditService;
  
  constructor() {
    this.auditService = new AuditService();
  }
  
  async detectSuspiciousActivity(userId: string): Promise<boolean> {
    const logs = await this.auditService.getByUser(userId, 100);
    
    // Check for rapid failed logins
    const failedLogins = logs.filter(log => 
      log.action === 'user.login' && !log.success
    );
    
    if (failedLogins.length > 5) {
      return true;
    }
    
    return false;
  }
  
  async trackSecurityEvent(event: {
    userId: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    details: Record<string, unknown>;
  }) {
    // Log security event
    console.log('Security event:', event);
  }
}
