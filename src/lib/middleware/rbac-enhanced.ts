/**
 * Enhanced RBAC Route Protection Middleware
 *
 * Enterprise-grade role-based access control with:
 * - MFA enforcement for privileged operations
 * - Session timeout verification
 * - Comprehensive audit logging
 * - Resource-level authorization
 * - Defense in depth
 *
 * @module rbac-enhanced
 * @security CRITICAL
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import {
  RBACService,
  type Permission,
  type Resource,
  type Action,
  type UserRole,
} from '@/lib/auth/rbac';
import { config } from '@/lib/config';
import { auditLog } from '@/lib/logging/audit';
import { logger } from '@/lib/logging/logger';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface RBACOptions {
  permission?: Permission;
  resource?: Resource;
  action?: Action;
  roles?: UserRole[];
  requireAny?: boolean; // If true, user needs ANY of the specified roles/permissions
  requireMFA?: boolean; // Enforce MFA verification
  requireSessionFresh?: boolean; // Require recent authentication
  allowBreakGlass?: boolean; // Allow break-glass bypass
}

export interface ResourceAuthzOptions {
  collection: string;
  idParam?: string; // Query/path param containing resource ID
  ownershipField?: string; // Field in resource indicating ownership (e.g., 'organizationId')
  allowSuperAdmin?: boolean; // Super admins can bypass ownership check
}

/**
 * Create enhanced RBAC middleware for API routes
 *
 * @param options - RBAC configuration options
 * @returns NextResponse error if unauthorized, null if authorized
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rbac = await withEnhancedRBAC({
 *     roles: ['super_admin'],
 *     requireMFA: true,
 *   })(request);
 *   if (rbac) return rbac;
 *
 *   // Your handler code...
 * }
 * ```
 */
export function withEnhancedRBAC(options: RBACOptions = {}) {
  return async (_request: NextRequest): Promise<NextResponse | null> => {
    const startTime = Date.now();

    try {
      // ============================================================
      // STEP 1: Check for break-glass token (emergency access)
      // ============================================================
      if (options.allowBreakGlass) {
        const breakGlassCheck = await verifyBreakGlass(_request);
        if (breakGlassCheck === null) {
          logger.warn('Break-glass access granted', {
            url: _request.url,
            method: _request.method,
          });
          return null; // Allow access via break-glass
        }
      }

      // ============================================================
      // STEP 2: Verify authentication
      // ============================================================
      const session = await auth();

      if (!session?.user) {
        await auditLog({
          action: 'unauthorized_access',
          resource: _request.url,
          severity: 'warning',
          ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: _request.headers.get('user-agent') || 'unknown',
          details: {
            reason: 'NO_SESSION',
            url: _request.url,
            method: _request.method,
          },
        });

        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const user = session.user as
        | (typeof session.user & {
            role?: UserRole;
            mfaVerified?: boolean;
            iat?: number;
            organizationId?: string;
          })
        | undefined;
      const userRole = (user?.role as UserRole) || 'user';
      const userId = user?.id as string;

      // ============================================================
      // STEP 3: Verify session freshness (timeout)
      // ============================================================
      const sessionMaxAge = config.helpers.getAdminSessionMaxAge();
      const sessionCreatedAt = (user?.iat || 0) * 1000; // Convert to ms
      const sessionAge = Date.now() - sessionCreatedAt;

      if (sessionAge > sessionMaxAge * 1000) {
        await auditLog({
          action: 'unauthorized_access',
          userId,
          resource: _request.url,
          severity: 'warning',
          ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: _request.headers.get('user-agent') || 'unknown',
          details: {
            reason: 'SESSION_EXPIRED',
            sessionAge: Math.floor(sessionAge / 1000),
            maxAge: sessionMaxAge,
            role: userRole,
          },
        });

        return NextResponse.json(
          { error: 'Session expired - please re-authenticate' },
          { status: 401 }
        );
      }

      // ============================================================
      // STEP 4: Verify MFA (if required)
      // ============================================================
      const isAdminMFAEnforced = config.helpers.isAdminMFARequired();
      const isMFAVerified = user?.mfaVerified === true;
      const isPrivilegedRole = ['super_admin', 'org_admin'].includes(userRole);

      // Enforce MFA if:
      // 1. Explicitly required by options.requireMFA, OR
      // 2. System-wide admin MFA is enforced AND user has privileged role
      const shouldEnforceMFA =
        options.requireMFA === true ||
        (isAdminMFAEnforced && isPrivilegedRole);

      if (shouldEnforceMFA && !isMFAVerified) {
        await auditLog({
          action: 'unauthorized_access',
          userId,
          resource: _request.url,
          severity: 'warning',
          ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: _request.headers.get('user-agent') || 'unknown',
          details: {
            reason: 'MFA_NOT_VERIFIED',
            role: userRole,
            url: _request.url,
            method: _request.method,
          },
        });

        return NextResponse.json(
          { error: 'MFA verification required for this operation' },
          { status: 403 }
        );
      }

      // ============================================================
      // STEP 5: Check role-based access
      // ============================================================
      if (options.roles && options.roles.length > 0) {
        const hasRole = options.requireAny
          ? options.roles.includes(userRole)
          : options.roles.every((role) => role === userRole);

        if (!hasRole) {
          await auditLog({
            action: 'unauthorized_access',
            userId,
            resource: _request.url,
            severity: 'warning',
            ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: _request.headers.get('user-agent') || 'unknown',
            details: {
              reason: 'INSUFFICIENT_ROLE',
              currentRole: userRole,
              requiredRoles: options.roles,
              url: _request.url,
              method: _request.method,
            },
          });

          // Generic error message (don't leak role requirements)
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // ============================================================
      // STEP 6: Check permission-based access
      // ============================================================
      if (options.permission) {
        const hasPermission = RBACService.hasPermission(
          userRole,
          options.permission
        );

        if (!hasPermission) {
          await auditLog({
            action: 'unauthorized_access',
            userId,
            resource: _request.url,
            severity: 'warning',
            ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: _request.headers.get('user-agent') || 'unknown',
            details: {
              reason: 'INSUFFICIENT_PERMISSION',
              currentRole: userRole,
              requiredPermission: options.permission,
              url: _request.url,
              method: _request.method,
            },
          });

          // Generic error message (don't leak permission requirements)
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // ============================================================
      // STEP 7: Check resource-action access
      // ============================================================
      if (options.resource && options.action) {
        const canAccess = RBACService.canAccess(
          userRole,
          options.resource,
          options.action
        );

        if (!canAccess) {
          await auditLog({
            action: 'unauthorized_access',
            userId,
            resource: _request.url,
            severity: 'warning',
            ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: _request.headers.get('user-agent') || 'unknown',
            details: {
              reason: 'INSUFFICIENT_RESOURCE_ACCESS',
              currentRole: userRole,
              requiredResource: options.resource,
              requiredAction: options.action,
              url: _request.url,
              method: _request.method,
            },
          });

          // Generic error message (don't leak resource/action requirements)
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // ============================================================
      // STEP 8: Log successful authorization (for audit trail)
      // ============================================================
      const duration = Date.now() - startTime;

      logger.debug('RBAC authorization successful', {
        userId,
        role: userRole,
        url: _request.url,
        method: _request.method,
        duration,
      });

      // All checks passed - allow access
      return null;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error('RBAC middleware error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        url: _request.url,
        method: _request.method,
        duration,
      });

      await auditLog({
        action: 'security_alert',
        resource: _request.url,
        severity: 'error',
        details: {
          reason: 'RBAC_MIDDLEWARE_ERROR',
          error: error instanceof Error ? error.message : String(error),
          url: _request.url,
          method: _request.method,
        },
      });

      return NextResponse.json(
        { error: 'Authorization check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Resource-level authorization middleware
 *
 * Verifies that the user has access to a specific resource (e.g., organization ownership)
 *
 * @param options - Resource authorization options
 * @returns NextResponse error if unauthorized, null if authorized
 *
 * @example
 * ```typescript
 * export async function PUT(request: NextRequest) {
 *   // First check RBAC permissions
 *   const rbac = await RBACPresets.requireAdminWrite()(request);
 *   if (rbac) return rbac;
 *
 *   // Then check resource ownership
 *   const resourceCheck = await withResourceAuthorization({
 *     collection: 'prompts',
 *     idParam: 'id',
 *     ownershipField: 'organizationId',
 *   })(request);
 *   if (resourceCheck) return resourceCheck;
 *
 *   // Your handler code...
 * }
 * ```
 */
export function withResourceAuthorization(options: ResourceAuthzOptions) {
  return async (_request: NextRequest): Promise<NextResponse | null> => {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = session.user as {
        role?: UserRole;
        organizationId?: string;
        id?: string;
      };
      const userRole = user.role || 'user';

      // Super admins bypass resource ownership checks (if allowed)
      if (options.allowSuperAdmin !== false && userRole === 'super_admin') {
        return null;
      }

      // Get resource ID from request
      const { searchParams } = new URL(_request.url);
      const resourceId = options.idParam
        ? searchParams.get(options.idParam)
        : null;

      if (!resourceId) {
        return NextResponse.json(
          { error: 'Resource ID required' },
          { status: 400 }
        );
      }

      // Fetch resource from database
      // Using static import
      const db = await getDb();
      const resource = await db
        .collection(options.collection)
        .findOne({ _id: new ObjectId(resourceId) });

      if (!resource) {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      // Check ownership (if ownership field is specified)
      if (options.ownershipField) {
        const resourceOwner = resource[options.ownershipField];
        const userOwner = user[options.ownershipField as keyof typeof user];

        if (resourceOwner?.toString() !== userOwner?.toString()) {
          // Audit unauthorized resource access
          await auditLog({
            action: 'unauthorized_access',
            userId: user.id as string,
            resource: `${options.collection}:${resourceId}`,
            severity: 'warning',
            ipAddress: _request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: _request.headers.get('user-agent') || 'unknown',
            details: {
              reason: 'RESOURCE_OWNERSHIP_MISMATCH',
              collection: options.collection,
              resourceId,
              resourceOwner,
              userOwner,
              role: userRole,
            },
          });

          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      return null; // Ownership verified
    } catch (error) {
      logger.error('Resource authorization error', {
        error: error instanceof Error ? error.message : String(error),
        collection: options.collection,
      });

      return NextResponse.json(
        { error: 'Authorization check failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Verify break-glass token for emergency access
 *
 * @param request - NextRequest
 * @returns NextResponse error if invalid, null if valid
 */
async function verifyBreakGlass(
  request: NextRequest
): Promise<NextResponse | null> {
  const breakGlassToken = request.headers.get('x-break-glass-token');

  if (!breakGlassToken) {
    return null; // No break-glass attempt
  }

  try {
    // Using static import
    const db = await getDb();

    const session = await db.collection('break_glass_sessions').findOne({
      token: breakGlassToken,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      await auditLog({
        action: 'security_alert',
        severity: 'critical',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: {
          operation: 'INVALID_BREAK_GLASS_ATTEMPT',
          token: breakGlassToken.substring(0, 8),
          url: request.url,
        },
      });

      return NextResponse.json(
        { error: 'Invalid or expired break-glass token' },
        { status: 403 }
      );
    }

    // Mark as used
    await db.collection('break_glass_sessions').updateOne(
      { token: breakGlassToken },
      { $set: { used: true, usedAt: new Date() } }
    );

    // Critical audit
    await auditLog({
      action: 'security_alert',
      userId: session.userId,
      severity: 'critical',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: {
        operation: 'BREAK_GLASS_USED',
        reason: session.reason,
        approver: session.approver,
        url: request.url,
      },
    });

    return null; // Valid break-glass token
  } catch (error) {
    logger.error('Break-glass verification error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'Break-glass verification failed' },
      { status: 500 }
    );
  }
}

/**
 * Enhanced RBAC Presets
 *
 * Pre-configured RBAC middleware for common use cases
 */
export const EnhancedRBACPresets = {
  // ============================================================
  // SUPER ADMIN (Highest privilege - requires MFA)
  // ============================================================

  /**
   * Require super_admin role with MFA
   * Use for: System-wide administrative operations
   */
  requireSuperAdmin: () =>
    withEnhancedRBAC({
      roles: ['super_admin'],
      requireMFA: true,
      requireSessionFresh: true,
    }),

  /**
   * Require super_admin role with MFA for destructive operations
   * Use for: Deletion, data purging, system maintenance
   */
  requireSuperAdminDestructive: () =>
    withEnhancedRBAC({
      roles: ['super_admin'],
      requireMFA: true,
      requireSessionFresh: true,
      allowBreakGlass: false, // Never allow break-glass for destructive ops
    }),

  // ============================================================
  // ORGANIZATION ADMIN (Organization-level administration)
  // ============================================================

  /**
   * Require org_admin or super_admin with MFA
   * Use for: Organization management, user management within org
   */
  requireOrgAdmin: () =>
    withEnhancedRBAC({
      roles: ['org_admin', 'super_admin'],
      requireMFA: true,
      requireAny: true,
    }),

  /**
   * Require org_manager, org_admin, or super_admin with MFA
   * Use for: Team management, member invitations
   */
  requireOrgManager: () =>
    withEnhancedRBAC({
      roles: ['org_manager', 'org_admin', 'super_admin'],
      requireMFA: true,
      requireAny: true,
    }),

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  /**
   * Require users:read permission
   * Use for: Viewing user lists
   */
  requireUserRead: () =>
    withEnhancedRBAC({
      permission: 'users:read',
    }),

  /**
   * Require users:write permission with MFA
   * Use for: Creating/updating users
   */
  requireUserWrite: () =>
    withEnhancedRBAC({
      permission: 'users:write',
      requireMFA: true,
    }),

  /**
   * Require users:manage_roles permission with MFA
   * Use for: Assigning/revoking roles
   */
  requireUserManagement: () =>
    withEnhancedRBAC({
      permission: 'users:manage_roles',
      requireMFA: true,
    }),

  // ============================================================
  // WORKBENCH & AI
  // ============================================================

  /**
   * Require workbench:basic permission
   * Use for: Basic workbench access
   */
  requireWorkbenchAccess: () =>
    withEnhancedRBAC({
      permission: 'workbench:basic',
    }),

  /**
   * Require workbench:advanced permission
   * Use for: Advanced workbench features
   */
  requireAdvancedWorkbench: () =>
    withEnhancedRBAC({
      permission: 'workbench:advanced',
    }),

  /**
   * Require workbench:ai_execution permission
   * Use for: AI prompt execution
   */
  requireAIExecution: () =>
    withEnhancedRBAC({
      permission: 'workbench:ai_execution',
    }),

  // ============================================================
  // CONTENT MANAGEMENT
  // ============================================================

  /**
   * Require prompts:write permission
   * Use for: Creating/updating prompts
   */
  requirePromptWrite: () =>
    withEnhancedRBAC({
      permission: 'prompts:write',
    }),

  /**
   * Require prompts:delete permission with MFA
   * Use for: Deleting prompts
   */
  requirePromptDelete: () =>
    withEnhancedRBAC({
      permission: 'prompts:delete',
      requireMFA: true,
    }),

  /**
   * Require prompts:featured permission with MFA
   * Use for: Marking prompts as featured
   */
  requirePromptFeatured: () =>
    withEnhancedRBAC({
      permission: 'prompts:featured',
      requireMFA: true,
    }),

  // ============================================================
  // ANALYTICS & REPORTING
  // ============================================================

  /**
   * Require analytics:read permission
   * Use for: Viewing analytics
   */
  requireAnalyticsAccess: () =>
    withEnhancedRBAC({
      permission: 'analytics:read',
    }),

  /**
   * Require analytics:export permission
   * Use for: Exporting analytics data
   */
  requireAnalyticsExport: () =>
    withEnhancedRBAC({
      permission: 'analytics:export',
    }),

  // ============================================================
  // BILLING
  // ============================================================

  /**
   * Require billing:read permission
   * Use for: Viewing billing information
   */
  requireBillingAccess: () =>
    withEnhancedRBAC({
      permission: 'billing:read',
    }),

  /**
   * Require billing:manage permission with MFA
   * Use for: Managing billing, subscriptions
   */
  requireBillingManage: () =>
    withEnhancedRBAC({
      permission: 'billing:manage',
      requireMFA: true,
    }),

  // ============================================================
  // SYSTEM ADMINISTRATION
  // ============================================================

  /**
   * Require system:admin permission with MFA
   * Use for: System administration tasks
   */
  requireSystemAdmin: () =>
    withEnhancedRBAC({
      permission: 'system:admin',
      requireMFA: true,
      requireSessionFresh: true,
    }),

  /**
   * Require system:logs permission with MFA
   * Use for: Viewing system logs, audit logs
   */
  requireSystemLogs: () =>
    withEnhancedRBAC({
      permission: 'system:logs',
      requireMFA: true,
    }),
};

/**
 * Compose multiple RBAC checks
 *
 * @param checks - Array of RBAC middleware functions
 * @returns Combined RBAC middleware
 *
 * @example
 * ```typescript
 * export async function PUT(request: NextRequest) {
 *   const rbac = await composeRBAC([
 *     EnhancedRBACPresets.requireAdminWrite(),
 *     withResourceAuthorization({
 *       collection: 'prompts',
 *       idParam: 'id',
 *       ownershipField: 'organizationId',
 *     }),
 *   ])(request);
 *   if (rbac) return rbac;
 *
 *   // Your handler code...
 * }
 * ```
 */
export function composeRBAC(
  checks: Array<(request: NextRequest) => Promise<NextResponse | null>>
) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    for (const check of checks) {
      const result = await check(request);
      if (result) return result; // First failure stops the chain
    }
    return null; // All checks passed
  };
}
