const stats = [
  {
    value: "500+",
    label: "Cities analyzed",
    description: "From coastal escapes to energetic global capitals.",
  },
  {
    value: "80",
    label: "Life Match questions",
    description: "Built to uncover how you truly want to live.",
  },
  {
    value: "100+",
    label: "Lifestyle factors",
    description: "Healthcare, weather, cost, safety, culture, and more.",
  },
  {
    value: "AI",
    label: "Personalized matching",
    description: "Recommendations shaped around your priorities.",
  },
];

export default function Stats() {
  return (
    <section className="relative mx-auto max-w-7xl px-8 py-24">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.07]"
          >
            <div className="text-5xl font-black tracking-tight text-cyan-400">
              {stat.value}
            </div>

            <h2 className="mt-4 text-lg font-bold text-white">
              {stat.label}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {stat.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}