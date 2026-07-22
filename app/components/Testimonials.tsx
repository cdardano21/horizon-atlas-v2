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
        <p className="uppercase tracking-[0.35em] text-cyan-400">
          Trusted by retirees worldwide
        </p>
        <h2 className="mt-4 text-5xl font-black">Real stories from people who found their place</h2>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={item.name}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.07]"
          >
            <p className="text-xl leading-8 text-slate-200">“{item.quote}”</p>
            <div className="mt-8 border-t border-white/10 pt-6 text-slate-300">
              <p className="font-semibold text-white">{item.name}</p>
              <p className="text-sm text-slate-400">{item.role}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
