/**
 * OpsHub Authentication Utilities
 * 
 * Shared authentication and authorization patterns for all OpsHub admin pages.
 * All OpsHub pages must be password-protected and require admin roles.
 * 
 * @pattern OPSHUB_AUTH
 * @usage Use `requireOpsHubAuth()` in all opshub page.tsx files
 */

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isAdminMFAEnforced } from '@/lib/env';

export type AdminRole = 'admin' | 'super_admin' | 'org_admin';

export interface OpsHubAuthResult {
  session: Awaited<ReturnType<typeof auth>>;
  user: NonNullable<Awaited<ReturnType<typeof auth>>['user']>;
  role: AdminRole;
  mfaVerified: boolean;
}

/**
 * Require authentication and admin role for OpsHub pages
 * 
 * This function should be called at the top of every opshub page.tsx file.
 * It handles:
 * - Authentication check
 * - Admin role verification
 * - MFA enforcement (if enabled)
 * - Automatic redirects for unauthorized users
 * 
 * @returns Auth result with session, user, role, and MFA status
 * @throws Redirects to home if not authenticated or not admin
 * @throws Redirects to login with MFA_REQUIRED if MFA is required but not verified
 * 
 * @example
 * ```tsx
 * // src/app/opshub/my-feature/page.tsx
 * export default async function MyFeaturePage() {
 *   const { user, role } = await requireOpsHubAuth();
 *   
 *   // Page content here
 * }
 * ```
 */
export async function requireOpsHubAuth(): Promise<OpsHubAuthResult> {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?error=UNAUTHORIZED');
  }

  const role = (session.user as { role?: string } | null)?.role || 'user';

  const isAdmin: boolean =
    role === 'admin' || role === 'super_admin' || role === 'org_admin';

  if (!isAdmin) {
    redirect('/');
  }

  const mfaVerified = Boolean(
    (session.user as { mfaVerified?: boolean } | null)?.mfaVerified
  );

  // Enforce MFA for all admin roles (no super_admin bypass)
  // Super admin bypass removed per security audit
  if (isAdminMFAEnforced && !mfaVerified) {
    redirect('/login?error=MFA_REQUIRED');
  }

  return {
    session,
    user: session.user,
    role: role as AdminRole,
    mfaVerified,
  };
}

