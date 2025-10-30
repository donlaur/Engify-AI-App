export default function WorkbenchGalleryPage() {
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-2 text-3xl font-semibold">Workbench Gallery (WIP)</h1>
      <p className="mb-6 text-slate-600">
        A curated showcase of in‑progress tools and experiments. Items here are
        under development and may change frequently.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
