import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { isAdminMFAEnforced } from '@/lib/env';
import { ContentReviewQueue } from '@/components/admin/ContentReviewQueue';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
// import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { ContentQualityPanel } from '@/components/admin/ContentQualityPanel';
// import { AffiliateLinkManagement } from '@/components/admin/AffiliateLinkManagement';

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

  const db = await getDb();
  const usersCount = await db.collection('users').countDocuments();
  const contentCount = await db.collection('web_content').countDocuments();
  const auditCount = await db.collection('audit_logs').countDocuments();

  const recentUsers = (await db
    .collection('users')
    .find({}, { projection: { email: 1, name: 1, role: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray()) as Array<{
    _id: unknown;
    email?: string;
    name?: string;
    role?: string;
    createdAt?: Date;
  }>;

  const recentContent = (await db
    .collection('web_content')
    .find({}, { projection: { title: 1, source: 1, createdAt: 1 } })
    .sort({ createdAt: -1 })
    .limit(8)
    .toArray()) as Array<{
    _id: unknown;
    title?: string;
    source?: string;
    createdAt?: Date;
  }>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-4 text-3xl font-semibold">Admin Dashboard</h1>
      <p className="mb-6 text-slate-600">
        Welcome, {session?.user?.name || 'Admin'}.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-slate-500">Users</div>
          <div className="text-2xl font-bold">{usersCount}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-slate-500">Ingested Content</div>
          <div className="text-2xl font-bold">{contentCount}</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm text-slate-500">Audit Logs</div>
          <div className="text-2xl font-bold">{auditCount}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6">
        {/* Temporarily disabled for debugging
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold mb-3">User Management</h2>
          <UserManagement />
        </section>
        */}

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Recent Users</h2>
          <div className="divide-y text-sm">
            {recentUsers.map(
              (u: {
                _id: unknown;
                email?: string;
                name?: string;
                role?: string;
              }) => (
                <div
                  key={String(u._id)}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium">{u.name || 'Unknown'}</div>
                    <div className="text-slate-600">{u.email}</div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {u.role || 'user'}
                  </span>
                </div>
              )
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Recent Content</h2>
          <div className="divide-y text-sm">
            {recentContent.map(
              (c: {
                _id: unknown;
                title?: string;
                source?: string;
                createdAt?: Date;
              }) => (
                <div
                  key={String(c._id)}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="font-medium">{c.title || 'Untitled'}</div>
                    <div className="text-slate-600">
                      {c.source || 'unknown'}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString()
                      : ''}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Content Quality</h2>
          <ContentQualityPanel />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Content Review Queue</h2>
          <ContentReviewQueue />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">User Management</h2>
          <UserManagement />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Audit Logs</h2>
          <AuditLogViewer />
        </section>

        {/* Testing ContentQualityPanel only - SettingsPanel and AffiliateLinkManagement disabled
        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">System Settings</h2>
          <SettingsPanel />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Affiliate Links</h2>
          <AffiliateLinkManagement />
        </section>
        */}
      </div>
    </div>
  );
}
