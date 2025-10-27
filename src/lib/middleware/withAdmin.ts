/**
 * Admin Middleware
 * 
 * Requires user to be authenticated AND have admin/owner role
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthContext } from './withAuth';
import { forbidden } from '@/lib/api/response';

type AdminHandler = (
  req: NextRequest,
  context: AuthContext
) => Promise<NextResponse>;

/**
 * Middleware to require admin role
 * 
 * @example
 * export const DELETE = withAdmin(async (req, { user }) => {
 *   // user is guaranteed to be admin or owner
 *   await deleteResource();
 *   return success({ message: 'Deleted' });
 * });
 */
export function withAdmin(handler: AdminHandler) {
  return withAuth(async (req: NextRequest, context: AuthContext) => {
    const { user } = context;

    // Check if user has admin or owner role
    if (user.role !== 'admin' && user.role !== 'owner') {
      return forbidden('Admin access required');
    }

    return handler(req, context);
  });
}
