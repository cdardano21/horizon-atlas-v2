const testimonials = [
  {
    quote:
      "Horizon Atlas helped us narrow down the perfect retirement neighborhood in Portugal, and the move felt so much less overwhelming.",
    name: "Evelyn R.",
    role: "Retired Architect",
  },
  {
    quote:
      "The AI matched me with a city that ticked every box: weather, healthcare, culture, and affordability.",
    name: "James L.",
    role: "Early Retiree",
  },
  {
    quote:
      "I finally feel confident about my next chapter because the platform explained why each destination suits my lifestyle.",
    name: "Aisha M.",
    role: "Consultant",
  },
];

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-12 text-center">
        <p className="atlas-kicker">
          Trusted by retirees worldwide
        </p>
        <h2 className="mt-4 text-5xl text-[var(--atlas-ink)]">Real stories from people who found their place</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="rounded-3xl border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,247,0.94),rgba(248,240,227,0.84))] p-8 shadow-[0_22px_46px_-32px_rgba(46,38,24,0.76)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)]"
          >
            <p className="text-xl leading-8 text-[var(--atlas-ink)]">“{item.quote}”</p>
            <div className="mt-8 border-t border-[var(--atlas-border)] pt-6 text-[var(--atlas-muted)]">
              <p className="font-semibold text-[var(--atlas-ink)]">{item.name}</p>
              <p className="text-sm text-[var(--atlas-muted)]">{item.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
