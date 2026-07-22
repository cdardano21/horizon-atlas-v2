const steps = [
  {
    title: "Discover your Life Match",
    description:
      "Answer a short personal profile that maps your lifestyle priorities, climate preferences, healthcare needs, and financial goals.",
  },
  {
    title: "Get curated destination matches",
    description:
      "Our AI compares hundreds of global locations to present a shortlist of places that fit your ideal retirement lifestyle.",
  },
  {
    title: "Plan your move with confidence",
    description:
      "Receive data-backed insights, cost comparisons, and timeline guidance so you can make the right choice faster.",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-12 max-w-3xl">
        <p className="uppercase tracking-[0.35em] text-cyan-400">
          How it works
        </p>
        <h2 className="mt-4 text-5xl font-black">
          Personalized retirement planning in three steps
        </h2>
        <p className="mt-6 text-lg leading-8 text-slate-400">
          Horizon Atlas uses intelligent lifestyle profiling and destination scoring to bring you the places that match your priorities, not the places that look good on paper.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.07]"
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500/10 text-2xl font-black text-cyan-300">
              {index + 1}
            </div>
            <h3 className="text-2xl font-bold text-white">{step.title}</h3>
            <p className="mt-4 text-slate-400 leading-7">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
