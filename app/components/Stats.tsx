import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";

const stats = [
  {
    value: "10,000+",
    label: "Journeys started",
    description: "People planning their next chapter.",
  },
  {
    value: `${LAUNCH_CATALOG_SIZE}`,
    label: "Destinations",
    description: "Curated cities, towns, and regions worldwide.",
  },
  {
    value: "25+",
    label: "Data categories",
    description: "Lifestyle, healthcare, climate, culture, and more.",
  },
  {
    value: "Private & Secure",
    label: "Data stays private",
    description: "Your preferences remain confidential.",
  },
];

export default function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/95 p-8 shadow-xl shadow-slate-950/10 backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Trusted by people planning their next chapter</p>
          <p className="mt-4 text-3xl font-semibold text-slate-200 sm:text-4xl">
            A premium destination search experience with proven results.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-center backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-400/30">
              <p className="text-4xl font-black text-cyan-400">{stat.value}</p>
              <p className="mt-4 text-sm font-semibold text-white">{stat.label}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
