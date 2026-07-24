"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { useFavorites } from "./favorites";

type CompareClientProps = {
  destinations: Destination[];
  initialSlugs: string[];
};

const compareRows: Array<{ label: string; formatter: (destination: Destination) => string }> = [
  { label: "Monthly budget", formatter: () => "See detail page" },
  { label: "Safety", formatter: (destination) => (destination.tags?.includes("safety") ? "Strong" : "Balanced") },
  { label: "Healthcare", formatter: (destination) => (destination.tags?.includes("healthcare") ? "Strong" : "Balanced") },
  { label: "Walkability", formatter: (destination) => (destination.tags?.includes("walkability") ? "High" : "Moderate") },
  { label: "Climate", formatter: (destination) => (destination.tags?.includes("summer escape") ? "Warm-weather fit" : "Mixed") },
  { label: "Taxes", formatter: (destination) => (destination.country === "Italy" ? "Review carefully" : "Standard review") },
  { label: "Internet", formatter: (destination) => (destination.tags?.includes("digital nomad") ? "Excellent" : "Good") },
];

export default function CompareClient({ destinations, initialSlugs }: CompareClientProps) {
  const { favoriteSlugs } = useFavorites();
  const defaultSlugs = useMemo(() => destinations.slice(0, 3).map((destination) => destination.slug), [destinations]);
  const shouldAutoUseFavorites = initialSlugs.length === 0 || initialSlugs.join(",") === defaultSlugs.join(",");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs.length ? initialSlugs : defaultSlugs);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  const effectiveSlugs = !hasManualSelection && shouldAutoUseFavorites && favoriteSlugs.length > 0
    ? favoriteSlugs.slice(0, 4)
    : selectedSlugs;

  const selected = useMemo(() => {
    const selectedDestinations = effectiveSlugs
      .map((slug) => destinations.find((destination) => destination.slug === slug))
      .filter((destination): destination is Destination => Boolean(destination));

    return (selectedDestinations.length ? selectedDestinations : destinations.slice(0, 3)).slice(0, 4);
  }, [destinations, effectiveSlugs]);

  const toggleSelected = (slug: string) => {
    setHasManualSelection(true);
    setSelectedSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug].slice(0, 4),
    );
  };

  const loadFavorites = () => {
    setHasManualSelection(true);
    setSelectedSlugs(favoriteSlugs.length > 0 ? favoriteSlugs.slice(0, 4) : destinations.slice(0, 4).map((destination) => destination.slug));
  };

  const clearSelection = () => {
    setHasManualSelection(true);
    setSelectedSlugs([]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Selected cities</p>
            <p className="mt-2 text-slate-400">Choose up to 4 cities to compare side by side, or load your saved favorites.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={loadFavorites} className="rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10">
              Use favorites
            </button>
            <button type="button" onClick={clearSelection} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200">
              Clear selection
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {destinations.slice(0, 10).map((destination) => {
            const active = effectiveSlugs.includes(destination.slug);
            return (
              <button
                key={destination.slug}
                type="button"
                onClick={() => toggleSelected(destination.slug)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-cyan-400 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400 hover:text-cyan-200"}`}
              >
                {destination.city}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-slate-950/80 p-4">
        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.25em] text-slate-400">
            <tr>
              <th className="px-4 py-3">Metric</th>
              {selected.map((destination) => (
                <th key={destination.slug} className="px-4 py-3">{destination.city}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map(({ label, formatter }) => (
              <tr key={label} className="rounded-3xl bg-white/5 text-slate-200">
                <td className="rounded-l-3xl px-4 py-4 font-medium text-white">{label}</td>
                {selected.map((destination) => (
                  <td key={destination.slug} className="px-4 py-4 text-slate-300">{formatter(destination)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        {selected.map((destination) => (
          <Link
            key={destination.slug}
            href={`/destinations/${destination.slug}`}
            className="rounded-full border border-cyan-400 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
          >
            Open {destination.city}
          </Link>
        ))}
      </div>
    </div>
  );
}