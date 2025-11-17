import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { isAdminMFAEnforced } from '@/lib/env';
import { OpsHubTabs } from '@/components/admin/OpsHubTabs';

export default async function OpsHubPage() {
  const session = await auth();

  const role = (session?.user as { role?: string } | null)?.role || 'user';

  const isAdmin =
    role === 'admin' || role === 'super_admin' || role === 'org_admin';

  if (!isAdmin) {
    redirect('/');
  }

  const mfaVerified = Boolean(
    (session?.user as { mfaVerified?: boolean } | null)?.mfaVerified
  );

  // Super admin bypass for emergency access
  // In production, consider enforcing MFA for super_admin via env var
  // Only enforce MFA for non-super_admin roles
  if (isAdminMFAEnforced && role !== 'super_admin' && !mfaVerified) {
    redirect('/login?error=MFA_REQUIRED');
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <OpsHubTabs />
    </div>
  );
}
