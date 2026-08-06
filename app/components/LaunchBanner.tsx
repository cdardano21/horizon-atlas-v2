import Link from "next/link";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";

export default function LaunchBanner() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(140deg,rgba(247,235,211,0.9),rgba(255,252,244,0.96))] p-10 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="atlas-kicker">Launch Ready</p>
            <h2 className="mt-4 text-5xl leading-tight text-[var(--atlas-ink)]">
              Search our best {LAUNCH_CATALOG_SIZE} verified destination matches with one simple charge.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--atlas-muted)]">
              Search the catalog with a practical shortlist in mind: compare everyday comfort, healthcare access, climate, and cost before you commit.
            </p>
          </div>
          <div className="rounded-3xl border border-[rgba(31,95,99,0.2)] bg-[rgba(255,251,241,0.86)] p-8">
            <div className="text-sm uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Launch catalog</div>
            <div className="mt-6 flex flex-col gap-4 text-[var(--atlas-ink)]">
              <p className="text-3xl font-black text-[var(--atlas-accent)]">{LAUNCH_CATALOG_SIZE}</p>
              <p>Destinations evaluated to match your retirement and relocation needs.</p>
              <p>One-time search fee, not a monthly subscription.</p>
            </div>
            <div className="mt-8">
              <Link
                href="/life-match"
                className="atlas-button-primary"
              >
                Start Life Match
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
