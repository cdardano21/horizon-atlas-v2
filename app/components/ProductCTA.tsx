import Link from "next/link";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";

export default function ProductCTA() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(125deg,rgba(255,251,242,0.97),rgba(247,236,214,0.86))] p-10 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="atlas-kicker">One-time search</p>
            <h2 className="mt-4 text-5xl leading-tight text-[var(--atlas-ink)]">Search {LAUNCH_CATALOG_SIZE} destinations once and get your top 10 destination matches.</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--atlas-muted)]">
              Horizon Atlas evaluates every destination in the catalog against your Life Match priorities, then delivers the best 10 that fit your lifestyle, budget, climate, and safety preferences.
            </p>
          </div>
          <div className="rounded-3xl border border-[rgba(31,95,99,0.18)] bg-[rgba(255,253,247,0.86)] p-8 text-[var(--atlas-muted)] shadow-[0_22px_42px_-28px_rgba(31,95,99,0.8)]">
            <div className="text-sm uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Single purchase</div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-black text-[var(--atlas-accent)]">$19.99</span>
              <span className="text-sm text-[var(--atlas-muted)]">One-time fee</span>
            </div>
            <p className="mt-6 leading-7 text-[var(--atlas-muted)]">
              Unlock your personalized shortlist and explore the cities that fit you best without recurring payments.
            </p>
            <div className="mt-6 grid gap-2 rounded-2xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.65)] p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Full atlas scan</span>
                <span className="font-semibold text-[var(--atlas-accent)]">Included</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Top 10 personalized matches</span>
                <span className="font-semibold text-[var(--atlas-accent)]">Included</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Recurring fees</span>
                <span className="font-semibold text-[var(--atlas-accent)]">None</span>
              </div>
            </div>
            <Link href="/life-match" className="atlas-button-primary mt-8">
              Start your $19.99 search
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
