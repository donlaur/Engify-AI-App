export enum AuditAction {
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_REGISTER = 'user.register',
  PROMPT_CREATE = 'prompt.create',
  PROMPT_UPDATE = 'prompt.update',
  PROMPT_DELETE = 'prompt.delete',
  AI_EXECUTE = 'ai.execute',
  ORG_CREATE = 'org.create',
  ORG_UPDATE = 'org.update',
  USER_INVITE = 'user.invite',
  SETTINGS_CHANGE = 'settings.change',
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  organizationId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}
