import Link from "next/link";
import RouteFrame from "../components/RouteFrame";

export default function AboutPage() {
  return (
    <RouteFrame
      eyebrow="About"
      title="Why Horizon Atlas exists"
      description="Horizon Atlas helps people find places that fit a real next chapter, not just a vacation fantasy. The product focuses on long-stay livability, cost realism, and the tradeoffs that matter in retirement and lifestyle relocation."
      primaryAction={{ href: "/life-match", label: "Take Life Match" }}
      secondaryAction={{ href: "/destinations", label: "Browse the catalog" }}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Built for real decisions",
            text: "Every city is scored for long-term fit so users can compare options with less noise and more context.",
          },
          {
            title: "Designed for depth",
            text: "Questionnaires, rankings, destination pages, and comparison views are all meant to connect into one workflow.",
          },
          {
            title: "Premium by default",
            text: "The visual language stays polished and calm so the product feels like a serious planning tool, not a toy.",
          },
        ].map((item) => (
          <article key={item.title} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
            <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 leading-7 text-slate-400">{item.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 text-slate-300">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">Next step</p>
        <p className="mt-3 leading-7">The next build slice should connect questionnaires, results, saved favorites, and compare flows into shared data models.</p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Need the homepage? <Link href="/" className="text-cyan-300 hover:text-cyan-200">Go back to the landing page</Link>.
      </p>
    </RouteFrame>
  );
}