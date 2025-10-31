/**
 * RBAC Route Protection Middleware
 *
 * Protects API routes and pages based on user roles and permissions
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  RBACService,
  type Permission,
  type Resource,
  type Action,
} from '@/lib/auth/rbac';
import { type UserRole } from '@/lib/auth/rbac';
import { isAdminMFAEnforced } from '@/lib/env';

export interface RBACOptions {
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  roles?: UserRole[];
  requireAny?: boolean; // If true, user needs ANY of the specified roles/permissions
  requireMFA?: boolean;
}

/**
 * Create RBAC middleware for API routes
 */
export function withRBAC(options: RBACOptions = {}) {
  return async (_request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Get session
      const session = await auth();

      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }

      const user = session.user as
        | (typeof session.user & { role?: UserRole; mfaVerified?: boolean })
        | undefined;
      const userRole = (user?.role as UserRole) || 'user';

      if (
        options.requireMFA &&
        isAdminMFAEnforced &&
        userRole === 'super_admin' &&
        user?.mfaVerified !== true
      ) {
        return NextResponse.json(
          { error: 'MFA required for admin access' },
          { status: 403 }
        );
      }

      // Check role-based access
      if (options.roles && options.roles.length > 0) {
        const hasRole = options.requireAny
          ? options.roles.includes(userRole)
          : options.roles.includes(userRole);

        if (!hasRole) {
          return NextResponse.json(
            {
              error: 'Forbidden - Insufficient role',
              required: options.roles,
              current: userRole,
            },
            { status: 403 }
          );
        }
      }

      // Check permission-based access
      if (options.permission) {
        const hasPermission = RBACService.hasPermission(
          userRole,
          options.permission
        );
        if (!hasPermission) {
          return NextResponse.json(
            {
              error: 'Forbidden - Insufficient permissions',
              required: options.permission,
              currentRole: userRole,
            },
            { status: 403 }
          );
        }
      }

      // Check resource-action access
      if (options.resource && options.action) {
        const canAccess = RBACService.canAccess(
          userRole,
          options.resource,
          options.action
        );
        if (!canAccess) {
          return NextResponse.json(
            {
              error: 'Forbidden - Cannot perform action on resource',
              resource: options.resource,
              action: options.action,
              currentRole: userRole,
            },
            { status: 403 }
          );
        }
      }

      // All checks passed - continue
      return null;
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error during authorization check' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to wrap API route handlers with RBAC
 */
export function protectRoute(
  handler: (_request: NextRequest) => Promise<NextResponse>,
  options: RBACOptions = {}
) {
  return async (_request: NextRequest): Promise<NextResponse> => {
    const rbacCheck = await withRBAC(options)(_request);
    if (rbacCheck) {
      return rbacCheck; // Return error response
    }

    // RBAC passed, execute handler
    return handler(_request);
  };
}

/**
 * Common RBAC configurations
 */
export const RBACPresets = {
  // User management
  requireUserManagement: () => withRBAC({ permission: 'users:manage_roles' }),
  requireUserRead: () => withRBAC({ permission: 'users:read' }),
  requireUserWrite: () => withRBAC({ permission: 'users:write' }),

  // Organization management
  requireOrgAdmin: () => withRBAC({ roles: ['org_admin', 'super_admin'] }),
  requireOrgManager: () =>
    withRBAC({
      roles: ['org_admin', 'org_manager', 'super_admin'],
      requireAny: true,
    }),

  // Workbench access
  requireWorkbenchAccess: () => withRBAC({ permission: 'workbench:basic' }),
  requireAdvancedWorkbench: () =>
    withRBAC({ permission: 'workbench:advanced' }),
  requireAIExecution: () => withRBAC({ permission: 'workbench:ai_execution' }),

  // Prompt management
  requirePromptWrite: () => withRBAC({ permission: 'prompts:write' }),
  requirePromptShare: () => withRBAC({ permission: 'prompts:share' }),

  // Analytics
  requireAnalyticsAccess: () => withRBAC({ permission: 'analytics:read' }),

  // Billing
  requireBillingAccess: () => withRBAC({ permission: 'billing:read' }),
  requireBillingManage: () => withRBAC({ permission: 'billing:manage' }),

  // System admin
  requireSuperAdmin: () =>
    withRBAC({ roles: ['super_admin'], requireMFA: true }),
};
