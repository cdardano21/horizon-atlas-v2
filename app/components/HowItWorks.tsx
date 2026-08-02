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
    <section id="how-it-works" className="mx-auto max-w-7xl px-8 py-32">
      <div className="mb-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="atlas-kicker">
            How it works
          </p>
          <h2 className="mt-4 text-5xl leading-tight text-[var(--atlas-ink)] sm:text-6xl">
            A guided path from curiosity to confident relocation.
          </h2>
          <p className="mt-6 text-lg leading-8 text-[var(--atlas-muted)]">
            DestinationFinderAI uses intelligent lifestyle profiling and destination scoring to bring you the places that match your priorities, not the places that look good on paper.
          </p>
        </div>

        <div className="rounded-[1.8rem] border border-[var(--atlas-border)] bg-[rgba(255,251,243,0.88)] p-6 shadow-[0_24px_46px_-34px_rgba(31,95,99,0.85)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Outcome</p>
          <p className="mt-3 text-2xl font-semibold leading-10 text-[var(--atlas-ink)]">
            You move from vague inspiration to a shortlist you can actually act on.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <article
            key={step.title}
            className="rounded-[1.9rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,245,0.95),rgba(252,244,231,0.86))] p-8 shadow-[0_24px_50px_-36px_rgba(31,95,99,0.9)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)]"
          >
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[linear-gradient(145deg,#235f63,#3f8a86)] text-2xl font-black text-[#f7f2e8]">
              {index + 1}
            </div>
            <h3 className="text-3xl font-semibold text-[var(--atlas-ink)]">{step.title}</h3>
            <p className="mt-4 leading-7 text-[var(--atlas-muted)]">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
