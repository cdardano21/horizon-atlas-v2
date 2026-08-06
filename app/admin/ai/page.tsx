import Link from "next/link";
import RouteFrame from "../../components/RouteFrame";
import { sampleJobs, sampleScoringCategories } from "../../lib/canonical-destination-admin";

export default function AdminAiPage() {
  return (
    <RouteFrame
      eyebrow="AI Operations"
      title="Enrichment queue, scoring, and provider orchestration"
      description="This scaffolding introduces the new AI management layer for queued imports, scoring recalculation, and enrichment status without touching the existing destination data."
      primaryAction={{ href: "/admin", label: "Back to admin" }}
      secondaryAction={{ href: "/destinations", label: "Review destinations" }}
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Enrichment queue</h2>
            <div className="mt-6 space-y-3">
              {sampleJobs.map((job) => (
                <div key={job.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{job.destinationSlug}</p>
                    <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">{job.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Progress {job.progress}% • ETA {job.estimatedTimeRemainingSeconds}s</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <h2 className="text-2xl font-semibold text-white">Scoring engine</h2>
            <div className="mt-6 space-y-3">
              {sampleScoringCategories.map((category) => (
                <div key={category.name} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{category.name}</p>
                    <p className="text-sm text-slate-400">Weight {category.weight}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/admin" className="mt-6 inline-flex rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100 transition hover:border-cyan-200 hover:text-white">
              Recalculate all scores
            </Link>
          </div>
        </div>
      </div>
    </RouteFrame>
  );
}
