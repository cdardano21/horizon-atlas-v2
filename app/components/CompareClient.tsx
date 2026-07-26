"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { NO_VERIFIED_INFO, toConsumerCopy } from "../lib/consumer-copy";
import { getDestinationIntelligence } from "../lib/destination-intelligence";
import { getDestinationImageUrl, hasVerifiedDestinationImage } from "../lib/imageFallback";
import { getDestinationMemberDetails } from "../lib/member-details";
import { useFavorites } from "./favorites";

type CompareClientProps = {
  destinations: Destination[];
  initialSlugs: string[];
};

const metricValue = (destination: Destination, sectionTitle: string, itemLabelIncludes: string) => {
  const intelligence = getDestinationIntelligence(destination);
  const section = intelligence.comprehensiveSections.find((item) => item.title === sectionTitle);
  return toConsumerCopy(section?.items.find((item) => item.label.toLowerCase().includes(itemLabelIncludes.toLowerCase()))?.value, NO_VERIFIED_INFO);
};

const scoreValue = (destination: Destination, category: string) => {
  const intelligence = getDestinationIntelligence(destination);
  return intelligence.livingHereScorecard.find((item) => item.category.toLowerCase() === category.toLowerCase())?.score ?? "-";
};

const scoreText = (value: number | string) => (typeof value === "number" ? `${value}/100` : `${value}`);

const compareRows: Array<{ label: string; formatter: (destination: Destination) => string }> = [
  { label: "Estimated monthly budget", formatter: (destination) => metricValue(destination, "Cost of Living", "estimated monthly budget") },
  { label: "Couple budget", formatter: (destination) => metricValue(destination, "Cost of Living", "couple budget") },
  { label: "Safety score", formatter: (destination) => `${scoreValue(destination, "Safety")}/100` },
  { label: "Healthcare score", formatter: (destination) => `${scoreValue(destination, "Healthcare")}/100` },
  { label: "Hospital depth", formatter: (destination) => metricValue(destination, "Healthcare", "hospital depth") },
  { label: "Nearest airport", formatter: (destination) => metricValue(destination, "Transportation", "nearest international airport") },
  { label: "Airport distance", formatter: (destination) => metricValue(destination, "Transportation", "airport distance") },
  { label: "Best months", formatter: (destination) => metricValue(destination, "Weather", "best months") },
  { label: "Internet and coworking", formatter: (destination) => metricValue(destination, "Families, Work, and Internet", "internet and coworking") },
  {
    label: "Golf courses documented",
    formatter: (destination) => {
      const details = getDestinationMemberDetails(destination);
      const count = (details.golf?.publicCourses ?? 0) + (details.golf?.privateCourses ?? 0);
      return count > 0 ? String(count) : NO_VERIFIED_INFO;
    },
  },
  {
    label: "Hospitals documented",
    formatter: (destination) => {
      const details = getDestinationMemberDetails(destination);
      return details.hospitals?.length ? String(details.hospitals.length) : NO_VERIFIED_INFO;
    },
  },
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

  const selectedOverview = selected.map((destination) => {
    const intelligence = getDestinationIntelligence(destination);
    return {
      destination,
      intelligence,
      safety: scoreValue(destination, "Safety"),
      healthcare: scoreValue(destination, "Healthcare"),
      climate: metricValue(destination, "Weather", "best months"),
      airport: metricValue(destination, "Transportation", "nearest international airport"),
    };
  });

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-5 shadow-[0_24px_48px_-34px_rgba(41,34,23,0.4)] sm:p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Visual moodboard</p>
        <p className="mt-3 text-sm leading-7 text-[var(--atlas-ink)]">
          Compare more than numbers: street texture, density, waterfront energy, and neighborhood character should support the lifestyle you are moving for.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {selected.slice(0, 3).map((destination) => (
            <article key={`mood-${destination.slug}`} className="overflow-hidden rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.76)]">
              {hasVerifiedDestinationImage(destination) ? (
                <div className="relative h-44">
                  <Image
                    src={getDestinationImageUrl(destination.images?.[0] ?? { src: "", alt: destination.city }, destination)}
                    alt={destination.images?.[0]?.alt ?? destination.city}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#132022]/66 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[#f6e4c4]">{destination.country}</p>
                    <p className="mt-1 text-lg font-semibold text-[#fff7e7]">{destination.city}</p>
                  </div>
                </div>
              ) : (
                <div className="flex h-44 flex-col justify-end bg-[linear-gradient(135deg,#173336,#2b4748)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#f6e4c4]">Imagery pending verification</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#f6e4c4]">{destination.country}</p>
                  <p className="mt-1 text-lg font-semibold text-[#fff7e7]">{destination.city}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.96),rgba(246,236,215,0.86))] p-5 shadow-[var(--atlas-shadow)] sm:p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">How to use this</p>
          <h2 className="mt-4 text-3xl font-semibold text-[var(--atlas-ink)] sm:text-4xl">Build a shortlist, then pressure-test the story each city is telling you.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--atlas-ink)]">
            Start with instinct, then compare the practical details that decide whether the move still works on an ordinary Tuesday. This page is for narrowing conviction, not just collecting numbers.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { title: "Emotional fit", note: "Climate, pace, atmosphere" },
              { title: "Operational fit", note: "Healthcare, airport, internet" },
              { title: "Long-stay fit", note: "Budget, housing, tradeoffs" },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.58)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.86)] p-5 shadow-xl shadow-[rgba(43,35,24,0.18)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-[var(--atlas-accent)]">Selected cities</p>
            <p className="mt-2 text-[var(--atlas-muted)]">Choose up to 4 cities to compare side by side, or load your saved favorites.</p>
            <p className="mt-2 text-sm text-[var(--atlas-muted)]">
              <span className="font-semibold text-[var(--atlas-ink)]">{selected.length}</span> city{selected.length === 1 ? "" : "ies"} currently in your comparison board.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={loadFavorites} className="rounded-full border border-[rgba(31,95,99,0.4)] px-4 py-2 text-sm font-semibold text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.08)]">
              Use favorites
            </button>
            <button type="button" onClick={clearSelection} className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.7)] px-4 py-2 text-sm font-semibold text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.4)] hover:text-[var(--atlas-accent)]">
              Clear selection
            </button>
          </div>
        </div>

        <div className="mt-4 h-2 rounded-full bg-[rgba(31,95,99,0.12)]">
          <div
            className="h-2 rounded-full bg-[linear-gradient(90deg,#235f63,#3f8a86)] transition-all"
            style={{ width: `${Math.max(1, Math.min(100, (selected.length / 4) * 100))}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {destinations.slice(0, 12).map((destination) => {
            const active = effectiveSlugs.includes(destination.slug);
            return (
              <button
                key={destination.slug}
                type="button"
                onClick={() => toggleSelected(destination.slug)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-[rgba(31,95,99,0.5)] bg-[rgba(31,95,99,0.12)] text-[var(--atlas-accent)]" : "border-[var(--atlas-border)] bg-[rgba(255,255,255,0.6)] text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent)]"}`}
              >
                {destination.city}
              </button>
            );
          })}
        </div>
      </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {selectedOverview.map(({ destination, intelligence, safety, healthcare, climate, airport }) => (
          <article key={destination.slug} className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-6 shadow-xl shadow-[rgba(41,34,23,0.16)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--atlas-accent)]">{destination.country}</p>
                <h3 className="mt-2 text-3xl font-semibold text-[var(--atlas-ink)]">{destination.city}</h3>
              </div>
              <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-muted)]">
                {(destination.tags?.[0] ?? "curated").replace(/-/g, " ")}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">{intelligence.aiSummary}</p>
            <div className="mt-5 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-[rgba(245,237,224,0.8)] px-3 py-2">
                <span className="text-[var(--atlas-muted)]">Safety</span>
                <span className="font-semibold text-[var(--atlas-accent)]">{scoreText(safety)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[rgba(245,237,224,0.8)] px-3 py-2">
                <span className="text-[var(--atlas-muted)]">Healthcare</span>
                <span className="font-semibold text-[var(--atlas-accent)]">{scoreText(healthcare)}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[rgba(245,237,224,0.8)] px-3 py-2">
                <span className="text-[var(--atlas-muted)]">Best months</span>
                <span className="font-semibold text-[var(--atlas-accent)]">{climate}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[rgba(245,237,224,0.8)] px-3 py-2">
                <span className="text-[var(--atlas-muted)]">Airport</span>
                <span className="font-semibold text-[var(--atlas-accent)]">{airport}</span>
              </div>
            </div>
            <Link
              href={`/destinations/${destination.slug}`}
              className="atlas-button-primary mt-6 px-4 py-2"
            >
              Open destination
            </Link>
          </article>
        ))}
      </div>

      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-5 shadow-xl shadow-[rgba(41,34,23,0.16)] sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Side-by-side matrix</p>
            <h3 className="mt-2 text-3xl font-semibold text-[var(--atlas-ink)]">Compare the details that decide whether the move survives real life.</h3>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[var(--atlas-muted)]">
            The table below is not the whole story, but it is where romantic preferences meet logistics, healthcare depth, climate timing, and travel reality.
          </p>
        </div>

        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--atlas-muted)] sm:hidden">
          Swipe horizontally to view all comparison columns.
        </p>

        <div className="-mx-2 overflow-x-auto px-2">
        <table className="min-w-[720px] border-separate border-spacing-y-3 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.25em] text-[var(--atlas-muted)]">
            <tr>
              <th className="whitespace-nowrap px-4 py-3">Metric</th>
              {selected.map((destination) => (
                <th key={destination.slug} className="whitespace-nowrap px-4 py-3">{destination.city}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map(({ label, formatter }) => (
              <tr key={label} className="rounded-3xl bg-[rgba(245,237,223,0.8)] text-[var(--atlas-ink)]">
                <td className="whitespace-nowrap rounded-l-3xl px-4 py-4 font-medium text-[var(--atlas-ink)]">{label}</td>
                {selected.map((destination) => (
                  <td key={destination.slug} className="whitespace-nowrap px-4 py-4 text-[var(--atlas-muted)]">{formatter(destination)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,251,242,0.98),rgba(247,236,214,0.88))] p-6 shadow-xl shadow-[rgba(41,34,23,0.16)]">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Next action</p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--atlas-muted)]">
          Once one or two cities start winning on both feel and practicality, open the full destination page and use the relocation guide, weather experience, and neighborhood sections to decide whether the story still holds up.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
        {selected.map((destination) => (
          <Link
            key={destination.slug}
            href={`/destinations/${destination.slug}`}
            className="atlas-button-secondary px-4 py-2"
          >
            Open {destination.city}
          </Link>
        ))}
        </div>
      </div>
    </div>
  );
}