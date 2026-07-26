import Link from "next/link";
import RouteFrame from "../../components/RouteFrame";
import { buildDestinationVerificationReport } from "../../lib/destination-verification";

function statusPillClass(status: "verified" | "review_required" | "missing" | "healthy") {
  if (status === "verified" || status === "healthy") return "border-emerald-300/40 bg-emerald-500/15 text-emerald-200";
  if (status === "missing") return "border-rose-300/40 bg-rose-500/15 text-rose-200";
  return "border-amber-300/40 bg-amber-500/15 text-amber-200";
}

export default async function AdminVerificationPage() {
  const report = await buildDestinationVerificationReport();
  const reviewRows = report.destinations.filter((row) => row.manualReviewRequired);

  return (
    <RouteFrame
      eyebrow="QA Dashboard"
      title="Destination verification operations"
      description="Production verification metadata for every destination, with explicit flags for image review and external-link quality before commercial publication."
      primaryAction={{ href: "/admin", label: "Back to admin" }}
      secondaryAction={{ href: "/destinations", label: "Open catalog" }}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Destinations audited</p>
            <p className="mt-3 text-4xl font-black text-white">{report.totals.destinations}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Manual review required</p>
            <p className="mt-3 text-4xl font-black text-amber-200">{report.totals.manualReviewRequired}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Image review required</p>
            <p className="mt-3 text-4xl font-black text-rose-200">{report.totals.imageReviewRequired}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">External link review</p>
            <p className="mt-3 text-4xl font-black text-orange-200">{report.totals.externalLinkReviewRequired}</p>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Image Review Required report</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Destinations requiring manual image confirmation</h2>
              <p className="mt-2 text-sm text-slate-400">This list is intentionally conservative. If confidence is uncertain, the destination stays flagged.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/api/admin/image-review-required" className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200">
                JSON report
              </Link>
              <Link href="/api/admin/destination-verification" className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-200 transition hover:border-cyan-300/50 hover:text-cyan-200">
                Full metadata
              </Link>
            </div>
          </div>

          <div className="mt-6 max-h-[24rem] overflow-auto rounded-3xl border border-white/10">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Image status</th>
                  <th className="px-4 py-3">Reasons</th>
                </tr>
              </thead>
              <tbody>
                {report.imageReviewRequired.map((row) => (
                  <tr key={row.slug} className="border-t border-white/10 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{row.city}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{row.country}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusPillClass("review_required")}`}>
                        review required
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-slate-300">{row.reasons.join(" ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-400">Destination verification metadata</p>
          <h2 className="mt-3 text-2xl font-bold text-white">All destinations with confidence and publication risk signals</h2>

          <div className="mt-6 max-h-[34rem] overflow-auto rounded-3xl border border-white/10">
            <table className="min-w-full text-left text-sm text-slate-200">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Last verified</th>
                  <th className="px-4 py-3">Data confidence</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">External links</th>
                  <th className="px-4 py-3">Source quality</th>
                  <th className="px-4 py-3">Missing fields</th>
                </tr>
              </thead>
              <tbody>
                {report.destinations.map((row) => (
                  <tr key={row.slug} className="border-t border-white/10 align-top">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{row.city}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{row.country}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{row.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{row.lastVerifiedDate ?? "Not published"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${row.dataConfidence === "high" ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-200" : row.dataConfidence === "medium" ? "border-amber-300/40 bg-amber-500/15 text-amber-200" : "border-slate-300/30 bg-slate-500/15 text-slate-200"}`}>
                        {row.dataConfidence}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusPillClass(row.imageVerificationStatus)}`}>
                        {row.imageVerificationStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs ${statusPillClass(row.externalLinkStatus)}`}>
                        {row.externalLinkStatus.replace("_", " ")}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400">{row.externalLinks.valid}/{row.externalLinks.total} valid</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">
                      <p>{row.sourceQuality.level} ({row.sourceQuality.score}/100)</p>
                      <p className="text-slate-400">official: {row.sourceQuality.officialSources}</p>
                    </td>
                    <td className="px-4 py-3 text-xs leading-6 text-slate-300">{row.missingFields.length > 0 ? row.missingFields.join("; ") : "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-xs text-slate-400">Generated at {report.generatedAt}. Report rows requiring manual review: {reviewRows.length}.</p>
        </section>
      </div>
    </RouteFrame>
  );
}
