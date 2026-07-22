export default function LaunchBanner() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="rounded-[2rem] border border-cyan-400/20 bg-slate-950/80 p-10 shadow-[0_32px_64px_-32px_rgba(14,165,233,0.75)] backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-cyan-400">Launch Ready</p>
            <h2 className="mt-4 text-5xl font-black">
              Search our best 500 destination matches with one simple charge.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Horizon Atlas analyzes your priorities and finds the best cities, towns, and regions across 500 curated destinations.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-400">Launch catalog</div>
            <div className="mt-6 flex flex-col gap-4 text-slate-100">
              <p className="text-3xl font-black text-cyan-400">500+</p>
              <p>Destinations evaluated to match your retirement and relocation needs.</p>
              <p>One-time search fee, not a monthly subscription.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
