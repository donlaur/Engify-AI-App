/**
 * Role-Based Access Control (RBAC) Helper Functions
 */

import { Role, Permission, ROLE_PERMISSIONS } from '@/types/auth';

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function canAccessResource(
  userRole: Role,
  requiredPermission: Permission
): boolean {
  return hasPermission(userRole, requiredPermission);
}
