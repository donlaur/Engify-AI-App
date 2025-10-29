/**
 * RBAC (Role-Based Access Control) System
 * 
 * Comprehensive role and permission management for Engify.ai
 * Supports multi-tenancy, SSO integration, and enterprise features
 */

export type UserRole = 
  | 'super_admin'    // Full system access
  | 'org_admin'      // Organization admin
  | 'org_manager'    // Team manager
  | 'org_member'     // Regular organization member
  | 'user'           // Basic user
  | 'free'           // Free tier user
  | 'pro'            // Pro tier user
  | 'enterprise';    // Enterprise tier user

export type Permission = 
  // User Management
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:invite'
  | 'users:manage_roles'
  
  // Organization Management
  | 'org:read'
  | 'org:write'
  | 'org:delete'
  | 'org:manage_members'
  | 'org:manage_settings'
  
  // Prompt Management
  | 'prompts:read'
  | 'prompts:write'
  | 'prompts:delete'
  | 'prompts:share'
  | 'prompts:featured'
  
  // Workbench Access
  | 'workbench:basic'
  | 'workbench:advanced'
  | 'workbench:ai_execution'
  | 'workbench:team_sharing'
  
  // Analytics & Reporting
  | 'analytics:read'
  | 'analytics:export'
  | 'analytics:team'
  | 'analytics:org'
  
  // Billing & Subscriptions
  | 'billing:read'
  | 'billing:write'
  | 'billing:manage'
  
  // System Administration
  | 'system:admin'
  | 'system:logs'
  | 'system:maintenance'
  | 'system:backup';

export type Resource = 
  | 'users'
  | 'organizations'
  | 'prompts'
  | 'workbench'
  | 'analytics'
  | 'billing'
  | 'system';

export type Action = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'invite'
  | 'share'
  | 'export';

/**
 * Role-Permission Matrix
 * Defines what each role can do
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    // Full system access
    'users:read', 'users:write', 'users:delete', 'users:invite', 'users:manage_roles',
    'org:read', 'org:write', 'org:delete', 'org:manage_members', 'org:manage_settings',
    'prompts:read', 'prompts:write', 'prompts:delete', 'prompts:share', 'prompts:featured',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution', 'workbench:team_sharing',
    'analytics:read', 'analytics:export', 'analytics:team', 'analytics:org',
    'billing:read', 'billing:write', 'billing:manage',
    'system:admin', 'system:logs', 'system:maintenance', 'system:backup'
  ],
  
  org_admin: [
    // Organization admin permissions
    'users:read', 'users:write', 'users:invite', 'users:manage_roles',
    'org:read', 'org:write', 'org:manage_members', 'org:manage_settings',
    'prompts:read', 'prompts:write', 'prompts:delete', 'prompts:share',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution', 'workbench:team_sharing',
    'analytics:read', 'analytics:export', 'analytics:team', 'analytics:org',
    'billing:read', 'billing:write'
  ],
  
  org_manager: [
    // Team manager permissions
    'users:read', 'users:invite',
    'org:read', 'org:manage_members',
    'prompts:read', 'prompts:write', 'prompts:share',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution', 'workbench:team_sharing',
    'analytics:read', 'analytics:team'
  ],
  
  org_member: [
    // Organization member permissions
    'users:read',
    'org:read',
    'prompts:read', 'prompts:write', 'prompts:share',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution',
    'analytics:read'
  ],
  
  user: [
    // Basic user permissions
    'prompts:read', 'prompts:write',
    'workbench:basic'
  ],
  
  free: [
    // Free tier permissions
    'prompts:read',
    'workbench:basic'
  ],
  
  pro: [
    // Pro tier permissions
    'prompts:read', 'prompts:write', 'prompts:share',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution',
    'analytics:read'
  ],
  
  enterprise: [
    // Enterprise tier permissions
    'users:read', 'users:invite',
    'org:read', 'org:manage_members',
    'prompts:read', 'prompts:write', 'prompts:share',
    'workbench:basic', 'workbench:advanced', 'workbench:ai_execution', 'workbench:team_sharing',
    'analytics:read', 'analytics:export', 'analytics:team',
    'billing:read'
  ]
};

/**
 * Permission checker utility
 */
export class RBACService {
  /**
   * Check if user has specific permission
   */
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Check if user can access resource with action
   */
  static canAccess(userRole: UserRole, resource: Resource, action: Action): boolean {
    const permission = `${resource}:${action}` as Permission;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Check if user can manage other users
   */
  static canManageUsers(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'users:manage_roles');
  }

  /**
   * Check if user can manage organization
   */
  static canManageOrganization(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'org:manage_settings');
  }

  /**
   * Check if user can execute AI prompts
   */
  static canExecuteAI(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'workbench:ai_execution');
  }

  /**
   * Check if user can access advanced workbench features
   */
  static canAccessAdvancedWorkbench(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'workbench:advanced');
  }

  /**
   * Check if user can access team features
   */
  static canAccessTeamFeatures(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'workbench:team_sharing');
  }

  /**
   * Check if user can access analytics
   */
  static canAccessAnalytics(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'analytics:read');
  }

  /**
   * Check if user can manage billing
   */
  static canManageBilling(userRole: UserRole): boolean {
    return this.hasPermission(userRole, 'billing:manage');
  }

  /**
   * Get role hierarchy level (higher number = more permissions)
   */
  static getRoleLevel(userRole: UserRole): number {
    const levels: Record<UserRole, number> = {
      super_admin: 100,
      org_admin: 80,
      org_manager: 60,
      org_member: 40,
      enterprise: 35,
      pro: 30,
      user: 20,
      free: 10
    };
    return levels[userRole] || 0;
  }

  /**
   * Check if user role is higher than another role
   */
  static isHigherRole(userRole: UserRole, compareRole: UserRole): boolean {
    return this.getRoleLevel(userRole) > this.getRoleLevel(compareRole);
  }

  /**
   * Check if user can manage another user's role
   */
  static canManageUserRole(managerRole: UserRole, targetRole: UserRole): boolean {
    // Super admin can manage anyone
    if (managerRole === 'super_admin') return true;
    
    // Org admin can manage org members
    if (managerRole === 'org_admin') {
      return ['org_manager', 'org_member'].includes(targetRole);
    }
    
    // Org manager can manage org members
    if (managerRole === 'org_manager') {
      return targetRole === 'org_member';
    }
    
    return false;
  }
}

/**
 * Middleware helper for route protection
 */
export function requirePermission(permission: Permission) {
  return (userRole: UserRole): boolean => {
    return RBACService.hasPermission(userRole, permission);
  };
}

/**
 * Middleware helper for resource access
 */
export function requireResourceAccess(resource: Resource, action: Action) {
  return (userRole: UserRole): boolean => {
    return RBACService.canAccess(userRole, resource, action);
  };
}

/**
 * Role-based feature flags
 */
export const FEATURE_FLAGS = {
  canUseAdvancedWorkbench: (role: UserRole) => RBACService.canAccessAdvancedWorkbench(role),
  canExecuteAI: (role: UserRole) => RBACService.canExecuteAI(role),
  canAccessTeamFeatures: (role: UserRole) => RBACService.canAccessTeamFeatures(role),
  canAccessAnalytics: (role: UserRole) => RBACService.canAccessAnalytics(role),
  canManageUsers: (role: UserRole) => RBACService.canManageUsers(role),
  canManageOrganization: (role: UserRole) => RBACService.canManageOrganization(role),
  canManageBilling: (role: UserRole) => RBACService.canManageBilling(role),
};
