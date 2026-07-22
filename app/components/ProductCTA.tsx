import Link from "next/link";

export default function ProductCTA() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/80 p-10 shadow-[0_32px_64px_-32px_rgba(14,165,233,0.75)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-cyan-400">One-time search</p>
            <h2 className="mt-4 text-5xl font-black text-white">Search 500 destinations once and get your top 10 destination matches.</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Horizon Atlas evaluates every destination in the catalog against your Life Match priorities, then delivers the best 10 that fit your lifestyle, budget, climate, and safety preferences.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 text-slate-300">
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-400">Single purchase</div>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-5xl font-black text-cyan-400">$19.99</span>
              <span className="text-sm text-slate-400">One-time fee</span>
            </div>
            <p className="mt-6 leading-7 text-slate-400">
              Unlock your personalized shortlist and explore the cities that fit you best without recurring payments.
            </p>
            <Link href="/life-match" className="mt-8 inline-flex rounded-full bg-cyan-500 px-7 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Start your $19.99 search
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
