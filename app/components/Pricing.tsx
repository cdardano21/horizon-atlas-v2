import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";

const plans = [
  {
    name: "Life Match",
    price: "$19.99",
    frequency: "one-time",
    description: `A single Life Match search across ${LAUNCH_CATALOG_SIZE} destinations with 10 custom matches tailored to your priorities.`,
    features: [
      `Search the entire ${LAUNCH_CATALOG_SIZE}-destination catalog`,
      "Top 10 personalized destination matches",
      "Priority-based AI scoring",
      "No subscription, no recurring fee",
    ],
    featured: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-12 text-center">
        <p className="atlas-kicker">
          Pricing
        </p>
        <h2 className="mt-4 text-5xl text-[var(--atlas-ink)]">
          One-time Life Match access
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--atlas-muted)]">
          Purchase a single Life Match search to unlock the full catalog and receive a shortlist of the 10 best destinations for your lifestyle.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-8 transition duration-300 ${
              plan.featured
                ? "border-[rgba(31,95,99,0.34)] bg-[linear-gradient(145deg,rgba(255,251,241,0.98),rgba(246,236,216,0.9))] shadow-[0_28px_62px_-40px_rgba(31,95,99,0.9)]"
                : "border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)]"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-3xl font-semibold text-[var(--atlas-ink)]">{plan.name}</h3>
              <span className="rounded-full bg-[rgba(31,95,99,0.12)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--atlas-accent)]">
                {plan.frequency}
              </span>
            </div>
            <div className="mt-6 flex items-end gap-2">
              <span className="text-5xl font-black text-[var(--atlas-accent)]">{plan.price}</span>
              <span className="text-sm text-[var(--atlas-muted)]">{plan.frequency}</span>
            </div>
            <p className="mt-6 leading-7 text-[var(--atlas-muted)]">{plan.description}</p>
            <ul className="mt-8 space-y-3 text-[var(--atlas-ink)]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 leading-7">
                  <span className="mt-1 text-[var(--atlas-accent)]">•</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="atlas-button-primary mt-10 w-full">
              Choose {plan.name}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
