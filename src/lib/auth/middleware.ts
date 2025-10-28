/**
 * Authentication and Authorization Middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Permission, Role } from '@/types/auth';
import { hasPermission } from './rbac';

export async function requireAuth(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }
  
  return null;
}

export async function requirePermission(
  req: NextRequest,
  permission: Permission
) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }
  
  const userRole = session.user.role as Role;
  
  if (!hasPermission(userRole, permission)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }
  
  return null;
}

export async function requireRole(req: NextRequest, allowedRoles: Role[]) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }
  
  const userRole = session.user.role as Role;
  
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient role' },
      { status: 403 }
    );
  }
  
  return null;
}

export async function requireOrganization(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized - Please sign in' },
      { status: 401 }
    );
  }
  
  if (!session.user.organizationId) {
    return NextResponse.json(
      { error: 'Forbidden - Organization membership required' },
      { status: 403 }
    );
  }
  
  return null;
}
