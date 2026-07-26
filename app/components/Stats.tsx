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
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8">
      <div className="rounded-[2.2rem] border border-[var(--atlas-border)] bg-[linear-gradient(120deg,rgba(255,250,242,0.95),rgba(248,240,227,0.88))] p-8 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="atlas-kicker">Trusted by people planning their next chapter</p>
          <p className="mt-4 text-4xl font-semibold text-[var(--atlas-ink)] sm:text-5xl">
            Travel-magazine wonder, relocation-grade clarity.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,253,247,0.88)] p-6 text-left shadow-[0_20px_45px_-35px_rgba(35,95,99,0.9)] transition hover:-translate-y-0.5 hover:border-[rgba(31,95,99,0.35)]">
              <div className="mb-4 h-1 w-16 rounded-full bg-[linear-gradient(90deg,#235f63,#c59b5f)]" />
              <p className="text-4xl font-black text-[var(--atlas-accent)]">{stat.value}</p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--atlas-ink)]">{stat.label}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--atlas-muted)]">{stat.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.62)] px-6 py-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">Why people stay with the process</p>
          <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">
            The platform combines emotional fit, practical constraints, and destination-specific evidence in one flow, so decisions feel grounded and personal.
          </p>
        </div>
      </div>
    </section>
  );
}
