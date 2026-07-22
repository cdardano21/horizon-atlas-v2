const plans = [
  {
    name: "Horizon Match",
    price: "$19.99",
    frequency: "one-time",
    description: "One-time destination search across 500 places with 10 recommended matches that fit your priorities.",
    features: [
      "Search the entire 500-destination catalog",
      "Top 10 custom destination matches",
      "AI-driven priority scoring",
      "No subscription or monthly fee",
    ],
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-12 text-center">
        <p className="uppercase tracking-[0.35em] text-cyan-400">
          Pricing
        </p>
        <h2 className="mt-4 text-5xl font-black">
          Plans built for every retirement journey
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          Choose the level of guidance that fits your needs, whether you want a quick match or a fully supported relocation plan.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-8 transition duration-300 ${
              plan.featured
                ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_32px_64px_-48px_rgba(14,165,233,0.9)]"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              <span className="rounded-full bg-slate-900/90 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                {plan.frequency}
              </span>
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-black text-cyan-400">{plan.price}</span>
              <span className="text-sm text-slate-400">{plan.frequency}</span>
            </div>
            <p className="mt-6 text-slate-400 leading-7">{plan.description}</p>
            <ul className="mt-8 space-y-3 text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 leading-7">
                  <span className="mt-1 text-cyan-400">•</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="mt-10 w-full rounded-full bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Choose {plan.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
