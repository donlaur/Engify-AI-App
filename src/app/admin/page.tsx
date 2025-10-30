import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role || 'user';
  const isAdmin =
    role === 'admin' || role === 'super_admin' || role === 'org_admin';
  if (!isAdmin) {
    redirect('/');
  }

  const db = await getDb();
  const usersCount = await db.collection(Collections.USERS).countDocuments();
  const contentCount = await db
    .collection(Collections.WEB_CONTENT)
    .countDocuments();
  const auditCount = await db
    .collection(Collections.AUDIT_LOGS)
    .countDocuments();

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
          <h2 className="mb-2 text-lg font-semibold">Users (read-only)</h2>
          <p className="text-sm text-slate-600">
            Basic overview; actions to be added later.
          </p>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Content Ingestion</h2>
          <p className="text-sm text-slate-600">
            Monitor pending/approved content. Review workflow coming soon.
          </p>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold">Audit Log (latest)</h2>
          <p className="text-sm text-slate-600">
            Search and export planned. Showing counts only for now.
          </p>
        </section>
      </div>
    </div>
  );
}
