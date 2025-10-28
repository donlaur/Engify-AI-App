/**
 * Authentication and Authorization Types
 * Single source of truth for all auth-related types
 */

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
}

export enum Permission {
  // Prompt permissions
  READ_PROMPTS = 'read:prompts',
  WRITE_PROMPTS = 'write:prompts',
  DELETE_PROMPTS = 'delete:prompts',
  
  // AI execution permissions
  EXECUTE_AI = 'execute:ai',
  EXECUTE_AI_PREMIUM = 'execute:ai:premium',
  
  // Analytics permissions
  VIEW_ANALYTICS = 'view:analytics',
  VIEW_TEAM_ANALYTICS = 'view:analytics:team',
  
  // User management permissions
  MANAGE_USERS = 'manage:users',
  INVITE_USERS = 'invite:users',
  
  // Organization permissions
  MANAGE_ORG = 'manage:org',
  MANAGE_BILLING = 'manage:billing',
  
  // Content permissions
  PUBLISH_CONTENT = 'publish:content',
  MODERATE_CONTENT = 'moderate:content',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.DELETE_PROMPTS,
    Permission.EXECUTE_AI,
    Permission.EXECUTE_AI_PREMIUM,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TEAM_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.INVITE_USERS,
    Permission.MANAGE_ORG,
    Permission.MANAGE_BILLING,
    Permission.PUBLISH_CONTENT,
    Permission.MODERATE_CONTENT,
  ],
  [Role.MANAGER]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.EXECUTE_AI,
    Permission.EXECUTE_AI_PREMIUM,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TEAM_ANALYTICS,
    Permission.INVITE_USERS,
  ],
  [Role.USER]: [
    Permission.READ_PROMPTS,
    Permission.WRITE_PROMPTS,
    Permission.EXECUTE_AI,
    Permission.VIEW_ANALYTICS,
  ],
  [Role.VIEWER]: [
    Permission.READ_PROMPTS,
    Permission.VIEW_ANALYTICS,
  ],
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId?: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  maxUsers: number;
  maxAIExecutions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  userId: string;
  organizationId?: string;
  role: Role;
  permissions: Permission[];
  expiresAt: Date;
}
