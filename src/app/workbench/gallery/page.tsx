import { getDb } from '@/lib/db/client';
import { Collections } from '@/lib/db/schema';

// Ensure this page never runs at build time; always render on demand
export const dynamic = 'force-dynamic';

export default async function WorkbenchGalleryPage() {
  // Fail-safe: avoid hard-failing the build/SSR if Mongo is unreachable
  let artifacts: Artifact[] = [];
  try {
    const db = await getDb();
    artifacts = (await db
      .collection(Collections.WEB_CONTENT)
      .find({ source: { $in: ['agents_sandbox'] } })
      .sort({ createdAt: -1 })
      .limit(12)
      .project({ title: 1, createdAt: 1, description: 1 })
      .toArray()) as Artifact[];
  } catch {
    // Intentionally swallow errors here to keep preview builds green
    artifacts = [];
  }
  type Artifact = {
    _id: unknown;
    title?: string;
    description?: string;
    source?: string;
    createdAt?: Date;
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-semibold">Workbench Gallery (WIP)</h1>
      <p className="mb-6 text-slate-600">
        A curated showcase of in‑progress tools and experiments. Items here are
        under development and may change frequently.
      </p>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Agent Sandbox</h2>
          <p className="text-sm text-slate-600">
            Feature‑flagged mock orchestration (Planner, Researcher, Critic,
            Writer) with placeholder artifact save.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Strategy Demos</h2>
          <p className="text-sm text-slate-600">
            Execution strategies (streaming/batch/cache/hybrid) — live metrics
            and selection logic. Coming soon.
          </p>
        </div>
      </div>

      <h2 className="mb-3 text-xl font-semibold">Recent Agent Artifacts</h2>
      {artifacts.length === 0 ? (
        <p className="text-slate-600">
          No artifacts yet. Enable the Agent Sandbox and run a topic.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {artifacts.map((a) => (
            <div key={String(a._id)} className="rounded-lg border bg-white p-4">
              <div className="text-sm text-slate-500">
                {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
              </div>
              <div className="mt-1 text-lg font-semibold">
                {a.title || 'Untitled Artifact'}
              </div>
              {a.description && (
                <p className="mt-1 line-clamp-3 text-sm text-slate-700">
                  {a.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
