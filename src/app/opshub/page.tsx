import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/mongodb';
import { Collections } from '@/lib/db/schema';
import { ContentReviewQueue } from '@/components/admin/ContentReviewQueue';
import { UserManagement } from '@/components/admin/UserManagement';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { SettingsPanel } from '@/components/admin/SettingsPanel';
import { ContentQualityPanel } from '@/components/admin/ContentQualityPanel';
import { AffiliateLinkManagement } from '@/components/admin/AffiliateLinkManagement';
import { isAdminMFAEnforced } from '@/lib/env';

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
  const usersCount = await db.collection(Collections.USERS).countDocuments();
  const contentCount = await db
    .collection(Collections.WEB_CONTENT)
    .countDocuments();
  const auditCount = await db
    .collection(Collections.AUDIT_LOGS)
    .countDocuments();

  const recentUsers = (await db
    .collection(Collections.USERS)
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
    .collection(Collections.WEB_CONTENT)
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
        <section className="rounded-lg border bg-white p-4">
          <UserManagement />
        </section>

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
          <ContentQualityPanel />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <ContentReviewQueue />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <AuditLogViewer />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <SettingsPanel />
        </section>

        <section className="rounded-lg border bg-white p-4">
          <AffiliateLinkManagement />
        </section>
      </div>
    </div>
  );
}
