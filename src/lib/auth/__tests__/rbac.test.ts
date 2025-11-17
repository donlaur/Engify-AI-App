/**
 * RBAC (Role-Based Access Control) Tests
 *
 * Comprehensive test coverage for role-based access control including:
 * - Permission checks for all roles
 * - Resource access validation
 * - Role hierarchy
 * - Feature flags
 * - Security validations
 */

import { describe, it, expect } from 'vitest';
import {
  RBACService,
  requirePermission,
  requireResourceAccess,
  FEATURE_FLAGS,
  ROLE_PERMISSIONS,
  type UserRole,
  type Permission,
} from '../rbac';

describe('RBAC System', () => {
  describe('ROLE_PERMISSIONS matrix', () => {
    it('should define permissions for all roles', () => {
      const roles: UserRole[] = [
        'super_admin',
        'org_admin',
        'org_manager',
        'org_member',
        'user',
        'free',
        'pro',
        'enterprise',
      ];

      roles.forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
      });
    });

    it('super_admin should have all permissions', () => {
      const permissions = ROLE_PERMISSIONS.super_admin;

      // Should have system admin permissions
      expect(permissions).toContain('system:admin');
      expect(permissions).toContain('system:logs');
      expect(permissions).toContain('system:maintenance');
      expect(permissions).toContain('system:backup');

      // Should have all user permissions
      expect(permissions).toContain('users:read');
      expect(permissions).toContain('users:write');
      expect(permissions).toContain('users:delete');
      expect(permissions).toContain('users:manage_roles');

      // Should have org permissions
      expect(permissions).toContain('org:delete');
      expect(permissions).toContain('org:manage_settings');

      // Should have billing manage
      expect(permissions).toContain('billing:manage');
    });

    it('org_admin should not have system permissions', () => {
      const permissions = ROLE_PERMISSIONS.org_admin;

      expect(permissions).not.toContain('system:admin');
      expect(permissions).not.toContain('system:logs');
      expect(permissions).not.toContain('system:maintenance');
      expect(permissions).not.toContain('system:backup');
    });

    it('free tier should have minimal permissions', () => {
      const permissions = ROLE_PERMISSIONS.free;

      expect(permissions).toContain('prompts:read');
      expect(permissions).toContain('workbench:basic');
      expect(permissions).not.toContain('prompts:write');
      expect(permissions).not.toContain('workbench:advanced');
      expect(permissions).not.toContain('workbench:ai_execution');
    });

    it('pro tier should have more permissions than free', () => {
      const freePermissions = ROLE_PERMISSIONS.free;
      const proPermissions = ROLE_PERMISSIONS.pro;

      expect(proPermissions.length).toBeGreaterThan(freePermissions.length);
      expect(proPermissions).toContain('prompts:write');
      expect(proPermissions).toContain('workbench:advanced');
      expect(proPermissions).toContain('workbench:ai_execution');
    });

    it('user role should have basic access', () => {
      const permissions = ROLE_PERMISSIONS.user;

      expect(permissions).toContain('prompts:read');
      expect(permissions).toContain('prompts:write');
      expect(permissions).toContain('workbench:basic');
      expect(permissions).not.toContain('workbench:advanced');
    });
  });

  describe('RBACService.hasPermission', () => {
    it('should return true when role has permission', () => {
      expect(RBACService.hasPermission('super_admin', 'system:admin')).toBe(
        true
      );
      expect(RBACService.hasPermission('org_admin', 'users:read')).toBe(true);
      expect(RBACService.hasPermission('pro', 'workbench:ai_execution')).toBe(
        true
      );
    });

    it('should return false when role lacks permission', () => {
      expect(RBACService.hasPermission('free', 'prompts:write')).toBe(false);
      expect(RBACService.hasPermission('user', 'workbench:advanced')).toBe(
        false
      );
      expect(RBACService.hasPermission('org_admin', 'system:admin')).toBe(
        false
      );
    });

    it('should handle invalid roles gracefully', () => {
      expect(
        RBACService.hasPermission('invalid_role' as UserRole, 'users:read')
      ).toBe(false);
    });

    it('should be case-sensitive for permissions', () => {
      expect(RBACService.hasPermission('super_admin', 'users:read')).toBe(
        true
      );
      // TypeScript would prevent this, but testing runtime behavior
      expect(
        RBACService.hasPermission('super_admin', 'USERS:READ' as Permission)
      ).toBe(false);
    });
  });

  describe('RBACService.hasAnyPermission', () => {
    it('should return true if role has any permission', () => {
      expect(
        RBACService.hasAnyPermission('org_admin', [
          'system:admin',
          'users:read',
        ])
      ).toBe(true);

      expect(
        RBACService.hasAnyPermission('pro', [
          'prompts:write',
          'system:admin',
        ])
      ).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(
        RBACService.hasAnyPermission('free', [
          'prompts:write',
          'workbench:advanced',
        ])
      ).toBe(false);

      expect(
        RBACService.hasAnyPermission('user', [
          'system:admin',
          'billing:manage',
        ])
      ).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(RBACService.hasAnyPermission('super_admin', [])).toBe(false);
    });
  });

  describe('RBACService.hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      expect(
        RBACService.hasAllPermissions('super_admin', [
          'users:read',
          'users:write',
          'system:admin',
        ])
      ).toBe(true);

      expect(
        RBACService.hasAllPermissions('pro', [
          'prompts:read',
          'prompts:write',
          'workbench:basic',
        ])
      ).toBe(true);
    });

    it('should return false if role lacks any permission', () => {
      expect(
        RBACService.hasAllPermissions('org_admin', [
          'users:read',
          'system:admin',
        ])
      ).toBe(false);

      expect(
        RBACService.hasAllPermissions('free', [
          'prompts:read',
          'prompts:write',
        ])
      ).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(RBACService.hasAllPermissions('free', [])).toBe(true);
    });
  });

  describe('RBACService.getRolePermissions', () => {
    it('should return all permissions for a role', () => {
      const superAdminPerms = RBACService.getRolePermissions('super_admin');
      const freePerms = RBACService.getRolePermissions('free');

      expect(Array.isArray(superAdminPerms)).toBe(true);
      expect(superAdminPerms.length).toBeGreaterThan(0);
      expect(freePerms.length).toBeLessThan(superAdminPerms.length);
    });

    it('should return empty array for invalid role', () => {
      const permissions = RBACService.getRolePermissions(
        'invalid_role' as UserRole
      );
      expect(permissions).toEqual([]);
    });

    it('should return exact permissions defined in ROLE_PERMISSIONS', () => {
      const permissions = RBACService.getRolePermissions('pro');
      expect(permissions).toEqual(ROLE_PERMISSIONS.pro);
    });
  });

  describe('RBACService.canAccess', () => {
    it('should check resource access correctly', () => {
      // super_admin can delete users
      expect(RBACService.canAccess('super_admin', 'users', 'delete')).toBe(
        true
      );

      // org_admin can manage organizations
      expect(RBACService.canAccess('org_admin', 'organizations', 'manage')).toBe(
        false // org:manage_members exists but not org:manage
      );

      // free tier can read prompts
      expect(RBACService.canAccess('free', 'prompts', 'read')).toBe(true);

      // free tier cannot create prompts (no prompts:create)
      expect(RBACService.canAccess('free', 'prompts', 'create')).toBe(false);
    });

    it('should compose permission from resource and action', () => {
      // This tests the internal logic: `${resource}:${action}`
      expect(RBACService.canAccess('super_admin', 'users', 'read')).toBe(true);
      expect(RBACService.canAccess('org_admin', 'billing', 'write')).toBe(
        true
      );
    });

    it('should return false for non-existent resource:action combinations', () => {
      expect(RBACService.canAccess('super_admin', 'users', 'fly')).toBe(false);
      expect(RBACService.canAccess('free', 'system', 'admin')).toBe(false);
    });
  });

  describe('Specific permission methods', () => {
    describe('canManageUsers', () => {
      it('should return true for roles with users:manage_roles', () => {
        expect(RBACService.canManageUsers('super_admin')).toBe(true);
        expect(RBACService.canManageUsers('org_admin')).toBe(true);
      });

      it('should return false for roles without users:manage_roles', () => {
        expect(RBACService.canManageUsers('org_manager')).toBe(false);
        expect(RBACService.canManageUsers('org_member')).toBe(false);
        expect(RBACService.canManageUsers('free')).toBe(false);
        expect(RBACService.canManageUsers('pro')).toBe(false);
      });
    });

    describe('canManageOrganization', () => {
      it('should return true for roles with org:manage_settings', () => {
        expect(RBACService.canManageOrganization('super_admin')).toBe(true);
        expect(RBACService.canManageOrganization('org_admin')).toBe(true);
      });

      it('should return false for roles without org:manage_settings', () => {
        expect(RBACService.canManageOrganization('org_manager')).toBe(false);
        expect(RBACService.canManageOrganization('org_member')).toBe(false);
        expect(RBACService.canManageOrganization('enterprise')).toBe(false);
      });
    });

    describe('canExecuteAI', () => {
      it('should return true for roles with workbench:ai_execution', () => {
        expect(RBACService.canExecuteAI('super_admin')).toBe(true);
        expect(RBACService.canExecuteAI('org_admin')).toBe(true);
        expect(RBACService.canExecuteAI('pro')).toBe(true);
        expect(RBACService.canExecuteAI('enterprise')).toBe(true);
      });

      it('should return false for roles without workbench:ai_execution', () => {
        expect(RBACService.canExecuteAI('free')).toBe(false);
        expect(RBACService.canExecuteAI('user')).toBe(false);
      });
    });

    describe('canAccessAdvancedWorkbench', () => {
      it('should return true for roles with workbench:advanced', () => {
        expect(RBACService.canAccessAdvancedWorkbench('super_admin')).toBe(
          true
        );
        expect(RBACService.canAccessAdvancedWorkbench('org_admin')).toBe(true);
        expect(RBACService.canAccessAdvancedWorkbench('pro')).toBe(true);
        expect(RBACService.canAccessAdvancedWorkbench('enterprise')).toBe(
          true
        );
      });

      it('should return false for roles without workbench:advanced', () => {
        expect(RBACService.canAccessAdvancedWorkbench('free')).toBe(false);
        expect(RBACService.canAccessAdvancedWorkbench('user')).toBe(false);
      });
    });

    describe('canAccessTeamFeatures', () => {
      it('should return true for roles with workbench:team_sharing', () => {
        expect(RBACService.canAccessTeamFeatures('super_admin')).toBe(true);
        expect(RBACService.canAccessTeamFeatures('org_admin')).toBe(true);
        expect(RBACService.canAccessTeamFeatures('org_manager')).toBe(true);
        expect(RBACService.canAccessTeamFeatures('enterprise')).toBe(true);
      });

      it('should return false for roles without workbench:team_sharing', () => {
        expect(RBACService.canAccessTeamFeatures('free')).toBe(false);
        expect(RBACService.canAccessTeamFeatures('user')).toBe(false);
        expect(RBACService.canAccessTeamFeatures('pro')).toBe(false);
        expect(RBACService.canAccessTeamFeatures('org_member')).toBe(false);
      });
    });

    describe('canAccessAnalytics', () => {
      it('should return true for roles with analytics:read', () => {
        expect(RBACService.canAccessAnalytics('super_admin')).toBe(true);
        expect(RBACService.canAccessAnalytics('org_admin')).toBe(true);
        expect(RBACService.canAccessAnalytics('org_manager')).toBe(true);
        expect(RBACService.canAccessAnalytics('org_member')).toBe(true);
        expect(RBACService.canAccessAnalytics('pro')).toBe(true);
        expect(RBACService.canAccessAnalytics('enterprise')).toBe(true);
      });

      it('should return false for roles without analytics:read', () => {
        expect(RBACService.canAccessAnalytics('free')).toBe(false);
        expect(RBACService.canAccessAnalytics('user')).toBe(false);
      });
    });

    describe('canManageBilling', () => {
      it('should return true for roles with billing:manage', () => {
        expect(RBACService.canManageBilling('super_admin')).toBe(true);
      });

      it('should return false for roles without billing:manage', () => {
        expect(RBACService.canManageBilling('org_admin')).toBe(false);
        expect(RBACService.canManageBilling('org_manager')).toBe(false);
        expect(RBACService.canManageBilling('enterprise')).toBe(false);
        expect(RBACService.canManageBilling('pro')).toBe(false);
      });
    });
  });

  describe('Role hierarchy', () => {
    describe('getRoleLevel', () => {
      it('should return correct levels for all roles', () => {
        expect(RBACService.getRoleLevel('super_admin')).toBe(100);
        expect(RBACService.getRoleLevel('org_admin')).toBe(80);
        expect(RBACService.getRoleLevel('org_manager')).toBe(60);
        expect(RBACService.getRoleLevel('org_member')).toBe(40);
        expect(RBACService.getRoleLevel('enterprise')).toBe(35);
        expect(RBACService.getRoleLevel('pro')).toBe(30);
        expect(RBACService.getRoleLevel('user')).toBe(20);
        expect(RBACService.getRoleLevel('free')).toBe(10);
      });

      it('should return 0 for invalid role', () => {
        expect(RBACService.getRoleLevel('invalid_role' as UserRole)).toBe(0);
      });

      it('should have hierarchical ordering', () => {
        const superAdminLevel = RBACService.getRoleLevel('super_admin');
        const orgAdminLevel = RBACService.getRoleLevel('org_admin');
        const freeLevel = RBACService.getRoleLevel('free');

        expect(superAdminLevel).toBeGreaterThan(orgAdminLevel);
        expect(orgAdminLevel).toBeGreaterThan(freeLevel);
      });
    });

    describe('isHigherRole', () => {
      it('should return true when first role is higher', () => {
        expect(RBACService.isHigherRole('super_admin', 'org_admin')).toBe(
          true
        );
        expect(RBACService.isHigherRole('org_admin', 'org_manager')).toBe(
          true
        );
        expect(RBACService.isHigherRole('pro', 'free')).toBe(true);
      });

      it('should return false when first role is lower', () => {
        expect(RBACService.isHigherRole('free', 'pro')).toBe(false);
        expect(RBACService.isHigherRole('org_manager', 'org_admin')).toBe(
          false
        );
        expect(RBACService.isHigherRole('user', 'enterprise')).toBe(false);
      });

      it('should return false when roles are equal', () => {
        expect(RBACService.isHigherRole('org_admin', 'org_admin')).toBe(false);
        expect(RBACService.isHigherRole('free', 'free')).toBe(false);
      });
    });

    describe('canManageUserRole', () => {
      it('super_admin can manage anyone', () => {
        expect(
          RBACService.canManageUserRole('super_admin', 'org_admin')
        ).toBe(true);
        expect(RBACService.canManageUserRole('super_admin', 'free')).toBe(
          true
        );
        expect(
          RBACService.canManageUserRole('super_admin', 'super_admin')
        ).toBe(true);
      });

      it('org_admin can manage org_manager and org_member', () => {
        expect(RBACService.canManageUserRole('org_admin', 'org_manager')).toBe(
          true
        );
        expect(RBACService.canManageUserRole('org_admin', 'org_member')).toBe(
          true
        );
      });

      it('org_admin cannot manage super_admin or org_admin', () => {
        expect(
          RBACService.canManageUserRole('org_admin', 'super_admin')
        ).toBe(false);
        expect(RBACService.canManageUserRole('org_admin', 'org_admin')).toBe(
          false
        );
      });

      it('org_admin cannot manage tier roles', () => {
        expect(RBACService.canManageUserRole('org_admin', 'free')).toBe(false);
        expect(RBACService.canManageUserRole('org_admin', 'pro')).toBe(false);
        expect(RBACService.canManageUserRole('org_admin', 'enterprise')).toBe(
          false
        );
      });

      it('org_manager can only manage org_member', () => {
        expect(
          RBACService.canManageUserRole('org_manager', 'org_member')
        ).toBe(true);
        expect(
          RBACService.canManageUserRole('org_manager', 'org_manager')
        ).toBe(false);
        expect(RBACService.canManageUserRole('org_manager', 'org_admin')).toBe(
          false
        );
      });

      it('other roles cannot manage anyone', () => {
        expect(RBACService.canManageUserRole('org_member', 'org_member')).toBe(
          false
        );
        expect(RBACService.canManageUserRole('free', 'free')).toBe(false);
        expect(RBACService.canManageUserRole('pro', 'user')).toBe(false);
        expect(RBACService.canManageUserRole('enterprise', 'free')).toBe(
          false
        );
      });
    });
  });

  describe('Middleware helpers', () => {
    describe('requirePermission', () => {
      it('should create a permission checker function', () => {
        const checker = requirePermission('users:write');

        expect(typeof checker).toBe('function');
        expect(checker('super_admin')).toBe(true);
        expect(checker('org_admin')).toBe(true);
        expect(checker('free')).toBe(false);
      });

      it('should work with different permissions', () => {
        const systemAdminChecker = requirePermission('system:admin');
        const promptsReadChecker = requirePermission('prompts:read');

        expect(systemAdminChecker('super_admin')).toBe(true);
        expect(systemAdminChecker('org_admin')).toBe(false);

        expect(promptsReadChecker('free')).toBe(true);
        expect(promptsReadChecker('pro')).toBe(true);
      });
    });

    describe('requireResourceAccess', () => {
      it('should create a resource access checker function', () => {
        const checker = requireResourceAccess('users', 'delete');

        expect(typeof checker).toBe('function');
        expect(checker('super_admin')).toBe(true);
        expect(checker('free')).toBe(false);
      });

      it('should work with different resources and actions', () => {
        const userReadChecker = requireResourceAccess('users', 'read');
        const promptWriteChecker = requireResourceAccess('prompts', 'create');

        expect(userReadChecker('org_admin')).toBe(true);
        expect(userReadChecker('free')).toBe(false);

        expect(promptWriteChecker('pro')).toBe(false); // No prompts:create, only prompts:write
      });
    });
  });

  describe('Feature flags', () => {
    it('should have all feature flag functions defined', () => {
      expect(typeof FEATURE_FLAGS.canUseAdvancedWorkbench).toBe('function');
      expect(typeof FEATURE_FLAGS.canExecuteAI).toBe('function');
      expect(typeof FEATURE_FLAGS.canAccessTeamFeatures).toBe('function');
      expect(typeof FEATURE_FLAGS.canAccessAnalytics).toBe('function');
      expect(typeof FEATURE_FLAGS.canManageUsers).toBe('function');
      expect(typeof FEATURE_FLAGS.canManageOrganization).toBe('function');
      expect(typeof FEATURE_FLAGS.canManageBilling).toBe('function');
    });

    it('canUseAdvancedWorkbench should work correctly', () => {
      expect(FEATURE_FLAGS.canUseAdvancedWorkbench('pro')).toBe(true);
      expect(FEATURE_FLAGS.canUseAdvancedWorkbench('free')).toBe(false);
      expect(FEATURE_FLAGS.canUseAdvancedWorkbench('super_admin')).toBe(true);
    });

    it('canExecuteAI should work correctly', () => {
      expect(FEATURE_FLAGS.canExecuteAI('pro')).toBe(true);
      expect(FEATURE_FLAGS.canExecuteAI('enterprise')).toBe(true);
      expect(FEATURE_FLAGS.canExecuteAI('free')).toBe(false);
      expect(FEATURE_FLAGS.canExecuteAI('user')).toBe(false);
    });

    it('canAccessTeamFeatures should work correctly', () => {
      expect(FEATURE_FLAGS.canAccessTeamFeatures('org_manager')).toBe(true);
      expect(FEATURE_FLAGS.canAccessTeamFeatures('enterprise')).toBe(true);
      expect(FEATURE_FLAGS.canAccessTeamFeatures('pro')).toBe(false);
      expect(FEATURE_FLAGS.canAccessTeamFeatures('free')).toBe(false);
    });

    it('canAccessAnalytics should work correctly', () => {
      expect(FEATURE_FLAGS.canAccessAnalytics('pro')).toBe(true);
      expect(FEATURE_FLAGS.canAccessAnalytics('org_member')).toBe(true);
      expect(FEATURE_FLAGS.canAccessAnalytics('free')).toBe(false);
      expect(FEATURE_FLAGS.canAccessAnalytics('user')).toBe(false);
    });

    it('canManageUsers should work correctly', () => {
      expect(FEATURE_FLAGS.canManageUsers('super_admin')).toBe(true);
      expect(FEATURE_FLAGS.canManageUsers('org_admin')).toBe(true);
      expect(FEATURE_FLAGS.canManageUsers('org_manager')).toBe(false);
      expect(FEATURE_FLAGS.canManageUsers('free')).toBe(false);
    });

    it('canManageOrganization should work correctly', () => {
      expect(FEATURE_FLAGS.canManageOrganization('super_admin')).toBe(true);
      expect(FEATURE_FLAGS.canManageOrganization('org_admin')).toBe(true);
      expect(FEATURE_FLAGS.canManageOrganization('org_manager')).toBe(false);
      expect(FEATURE_FLAGS.canManageOrganization('enterprise')).toBe(false);
    });

    it('canManageBilling should work correctly', () => {
      expect(FEATURE_FLAGS.canManageBilling('super_admin')).toBe(true);
      expect(FEATURE_FLAGS.canManageBilling('org_admin')).toBe(false);
      expect(FEATURE_FLAGS.canManageBilling('enterprise')).toBe(false);
    });
  });

  describe('Security edge cases', () => {
    it('should not allow permission escalation', () => {
      // free user trying to get admin permissions
      expect(RBACService.hasPermission('free', 'users:delete')).toBe(false);
      expect(RBACService.hasPermission('free', 'system:admin')).toBe(false);

      // org_member trying to get manager permissions
      expect(RBACService.hasPermission('org_member', 'users:invite')).toBe(
        false
      );
      expect(
        RBACService.hasPermission('org_member', 'org:manage_members')
      ).toBe(false);
    });

    it('should maintain separation between org and tier roles', () => {
      // Tier roles shouldn't have org permissions
      expect(RBACService.hasPermission('pro', 'org:manage_settings')).toBe(
        false
      );
      expect(RBACService.hasPermission('enterprise', 'org:write')).toBe(false);

      // Enterprise tier has some org permissions
      expect(RBACService.hasPermission('enterprise', 'org:manage_members')).toBe(
        true
      );
    });

    it('should ensure free tier has no paid features', () => {
      const freePermissions = ROLE_PERMISSIONS.free;

      // Should not have advanced features
      expect(freePermissions).not.toContain('workbench:advanced');
      expect(freePermissions).not.toContain('workbench:ai_execution');
      expect(freePermissions).not.toContain('analytics:read');
      expect(freePermissions).not.toContain('prompts:write');
    });

    it('should ensure super_admin is most powerful', () => {
      const superAdminLevel = RBACService.getRoleLevel('super_admin');
      const allRoles: UserRole[] = [
        'org_admin',
        'org_manager',
        'org_member',
        'user',
        'free',
        'pro',
        'enterprise',
      ];

      allRoles.forEach((role) => {
        expect(superAdminLevel).toBeGreaterThan(RBACService.getRoleLevel(role));
        expect(RBACService.isHigherRole('super_admin', role)).toBe(true);
      });
    });
  });
});
