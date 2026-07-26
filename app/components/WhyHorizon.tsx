const reasons = [
  {
    title: "Personalized AI guidance",
    description:
      "Horizon Atlas matches your lifestyle priorities with destinations, not just cost metrics.",
  },
  {
    title: "Data you can trust",
    description:
      "Every recommendation is backed by lifestyle, healthcare, climate, and community insights.",
  },
  {
    title: "Move beyond generic rankings",
    description:
      "We help you answer the real question: could I actually build a life here?",
  },
];

export default function WhyHorizon() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-28">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <p className="atlas-kicker">Why Horizon Atlas</p>
          <h2 className="mt-4 text-5xl leading-tight text-[var(--atlas-ink)]">
            Designed to help you find the right place for the next chapter.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--atlas-muted)]">
            Our platform combines AI scoring, destination intelligence, and real-world lifestyle factors so you can explore retirement and relocation options with confidence.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {reasons.map((reason) => (
            <article
              key={reason.title}
              className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.85)] p-8 shadow-[0_20px_42px_-30px_rgba(31,95,99,0.78)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.4)]"
            >
              <h3 className="text-3xl font-semibold text-[var(--atlas-ink)]">{reason.title}</h3>
              <p className="mt-4 leading-7 text-[var(--atlas-muted)]">{reason.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
