"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState, type CSSProperties } from "react";
import type { Destination } from "../lib/destinations";
import { isPlaceholderCopy, NO_VERIFIED_INFO, toConsumerCopy } from "../lib/consumer-copy";
import { getDestinationIntelligence, type DestinationIntelligence } from "../lib/destination-intelligence";
import { getDestinationMemberDetails } from "../lib/member-details";
import CompareDestinationImage from "./CompareDestinationImage";
import { useFavorites } from "./favorites";

type CompareClientProps = {
  destinations: Destination[];
  initialSlugs: string[];
};

type CompareEntry = {
  destination: Destination;
  intelligence: DestinationIntelligence;
};

type MetricRow = {
  label: string;
  scoreCategory?: string;
  value?: (entry: CompareEntry) => string;
};

type MetricGroup = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  rows: MetricRow[];
};

const UNAVAILABLE = "Not yet verified";

const metricValue = (entry: CompareEntry, sectionTitle: string, itemLabelIncludes: string) => {
  const section = entry.intelligence.comprehensiveSections.find((item) => item.title === sectionTitle);
  const rawValue = section?.items.find((item) => item.label.toLowerCase().includes(itemLabelIncludes.toLowerCase()))?.value;
  const consumerValue = toConsumerCopy(rawValue, NO_VERIFIED_INFO);
  return consumerValue === NO_VERIFIED_INFO || isPlaceholderCopy(consumerValue) ? UNAVAILABLE : consumerValue;
};

const scoreValue = (entry: CompareEntry, category: string) =>
  entry.intelligence.livingHereScorecard.find((item) => item.category.toLowerCase() === category.toLowerCase())?.score ?? null;

const headlineValue = (value: string | null | undefined) =>
  !value || isPlaceholderCopy(value) ? UNAVAILABLE : value;

const compareGroups: MetricGroup[] = [
  {
    id: "at-a-glance",
    eyebrow: "01",
    title: "At a glance",
    description: "The clearest high-level signals in the current destination evidence.",
    rows: [
      { label: "Overall relocation fit", scoreCategory: "Overall Match" },
      { label: "Retirement fit", scoreCategory: "Retirement Friendly" },
      { label: "Best suited to", value: (entry) => headlineValue(entry.destination.tags?.slice(0, 3).map((tag) => tag.replace(/-/g, " ")).join(" · ")) },
    ],
  },
  {
    id: "money",
    eyebrow: "02",
    title: "Money",
    description: "Budget signals should start the conversation, not replace local verification.",
    rows: [
      { label: "Cost-of-living score", scoreCategory: "Cost of Living" },
      { label: "Estimated monthly budget", value: (entry) => metricValue(entry, "Cost of Living", "estimated monthly budget") },
      { label: "Couple budget", value: (entry) => metricValue(entry, "Cost of Living", "couple budget") },
    ],
  },
  {
    id: "housing",
    eyebrow: "03",
    title: "Housing",
    description: "A city-level view of rental context and neighborhood fit.",
    rows: [
      { label: "1BR rent", value: (entry) => metricValue(entry, "Cost of Living", "1br rent") },
      { label: "Rental market", value: (entry) => metricValue(entry, "Real Estate", "rental market") },
      { label: "Neighborhood starting point", value: (entry) => metricValue(entry, "Housing", "best neighborhoods for retirees") },
    ],
  },
  {
    id: "health-safety",
    eyebrow: "04",
    title: "Health & safety",
    description: "Decision-critical care access and current safety signals.",
    rows: [
      { label: "Healthcare score", scoreCategory: "Healthcare" },
      { label: "Safety score", scoreCategory: "Safety" },
      { label: "Hospital depth", value: (entry) => metricValue(entry, "Healthcare", "hospital depth") },
    ],
  },
  {
    id: "climate",
    eyebrow: "05",
    title: "Climate",
    description: "Comfort, seasonality, and the months most worth experiencing in person.",
    rows: [
      { label: "Weather score", scoreCategory: "Weather" },
      { label: "Best months", value: (entry) => metricValue(entry, "Weather", "best months") },
      { label: "Climate reality", value: (entry) => headlineValue(entry.destination.climate) },
    ],
  },
  {
    id: "getting-around",
    eyebrow: "06",
    title: "Getting around",
    description: "Daily mobility and the travel friction that shapes real life.",
    rows: [
      { label: "Walkability score", scoreCategory: "Walkability" },
      { label: "Nearest airport", value: (entry) => metricValue(entry, "Transportation", "nearest international airport") },
      { label: "Airport distance", value: (entry) => metricValue(entry, "Transportation", "airport distance") },
      { label: "Transportation", value: (entry) => headlineValue(entry.destination.transportation) },
    ],
  },
  {
    id: "lifestyle",
    eyebrow: "07",
    title: "Lifestyle",
    description: "How each place supports the routines that make a move worthwhile.",
    rows: [
      { label: "Food score", scoreCategory: "Food" },
      { label: "Beach access score", scoreCategory: "Beaches" },
      { label: "Golf score", scoreCategory: "Golf" },
      { label: "Golf courses documented", value: (entry) => {
        const details = getDestinationMemberDetails(entry.destination);
        const count = (details.golf?.publicCourses ?? 0) + (details.golf?.privateCourses ?? 0);
        return count > 0 ? String(count) : UNAVAILABLE;
      } },
      { label: "Nightlife", value: (entry) => metricValue(entry, "Lifestyle", "nightlife") },
      { label: "Culture", value: (entry) => headlineValue(entry.intelligence.cultureHeadline) },
    ],
  },
  {
    id: "residency",
    eyebrow: "08",
    title: "Residency & taxes",
    description: "Orientation only. Verify pathways and personal tax treatment before acting.",
    rows: [
      { label: "Visa / residency", value: (entry) => metricValue(entry, "Retirement", "residency options") },
      { label: "Tax orientation", value: (entry) => metricValue(entry, "Retirement", "tax information") },
      { label: "Healthcare eligibility", value: (entry) => metricValue(entry, "Retirement", "healthcare eligibility") },
    ],
  },
  {
    id: "community",
    eyebrow: "09",
    title: "Community",
    description: "Signals for family life, remote work, language, and social integration.",
    rows: [
      { label: "Family fit", scoreCategory: "Family Friendly" },
      { label: "Internet fit", scoreCategory: "Internet" },
      { label: "Remote-work readiness", value: (entry) => metricValue(entry, "Families, Work, and Internet", "internet and coworking") },
      { label: "Language / integration", value: (entry) => metricValue(entry, "Demographics", "english spoken") },
      { label: "LGBTQ+ inclusivity", value: () => UNAVAILABLE },
    ],
  },
];

function MetricValue({ entry, row, strongestScore, leadingCount }: { entry: CompareEntry; row: MetricRow; strongestScore: number | null; leadingCount: number }) {
  if (row.scoreCategory) {
    const score = scoreValue(entry, row.scoreCategory);
    if (score === null) return <span className="text-[#758a9d]">{UNAVAILABLE}</span>;
    const isStrongest = strongestScore !== null && score === strongestScore;
    const isSoleLeader = isStrongest && leadingCount === 1;
    return (
      <div className={isSoleLeader ? "rounded-sm border border-[#e5b654]/40 bg-[#e5b654]/12 p-3" : isStrongest ? "rounded-sm border border-white/10 bg-white/[0.035] p-3" : "p-3"}>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-lg font-semibold text-white">{score}</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8296a8]">/ 100</span>
        </div>
        <div className="mt-2 h-1.5 bg-white/10">
          <div className={isSoleLeader ? "h-full bg-[#e5b654]" : isStrongest ? "h-full bg-[#7fb9b6]" : "h-full bg-[#4bb8b4]"} style={{ width: `${score}%` }} />
        </div>
        {isSoleLeader ? <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#e5c77d]">Leading score</p> : null}
        {isStrongest && !isSoleLeader ? <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#8fb7b6]">Shared lead</p> : null}
      </div>
    );
  }

  const value = row.value?.(entry) ?? UNAVAILABLE;
  return <p className={value === UNAVAILABLE ? "text-sm leading-6 text-[#758a9d]" : "text-sm leading-6 text-[#d5e0e9]"}>{value}</p>;
}

export default function CompareClient({ destinations, initialSlugs }: CompareClientProps) {
  const { favoriteSlugs } = useFavorites();
  const defaultSlugs = useMemo(() => destinations.slice(0, 3).map((destination) => destination.slug), [destinations]);
  const shouldAutoUseFavorites = initialSlugs.length === 0 || initialSlugs.join(",") === defaultSlugs.join(",");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs.length ? initialSlugs : defaultSlugs);
  const [hasManualSelection, setHasManualSelection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase());

  const effectiveSlugs = !hasManualSelection && shouldAutoUseFavorites && favoriteSlugs.length > 0
    ? favoriteSlugs.slice(0, 4)
    : selectedSlugs;

  const selected = useMemo(() => effectiveSlugs
    .map((slug) => destinations.find((destination) => destination.slug === slug))
    .filter((destination): destination is Destination => Boolean(destination))
    .slice(0, 4), [destinations, effectiveSlugs]);

  const entries = useMemo(() => selected.map((destination) => ({
    destination,
    intelligence: getDestinationIntelligence(destination),
  })), [selected]);

  const availableDestinations = useMemo(() => destinations
    .filter((destination) => !effectiveSlugs.includes(destination.slug))
    .filter((destination) => !deferredSearchQuery || `${destination.city} ${destination.country}`.toLowerCase().includes(deferredSearchQuery))
    .slice(0, 8), [deferredSearchQuery, destinations, effectiveSlugs]);

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

  const gridStyle = {
    "--compare-count": Math.max(entries.length, 1),
    minWidth: `calc(130px + ${Math.max(entries.length, 1)} * 218px)`,
    width: "100%",
  } as CSSProperties;
  const sectionHeaderSpan = entries.length === 1 ? "col-span-1" : entries.length === 2 ? "col-span-2" : entries.length === 3 ? "col-span-3" : "col-span-4";

  return (
    <div className="space-y-8">
      <section className="relative border border-white/10 bg-[#071b31] shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,#e5b654,rgba(88,199,196,0.7),transparent_72%)]" />
        <div className="grid gap-6 border-b border-white/10 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#58c7c4]">Your comparison set</p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h2 className="text-3xl text-white sm:text-4xl">Decision board</h2>
              <p className="text-sm text-[#8fa4b6]">{entries.length} of 4 destinations selected</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Destinations currently compared">
              {entries.map(({ destination }, index) => (
                <span key={destination.slug} className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-[#d4dee7]">
                  <span className="font-semibold text-[#e5b654]">0{index + 1}</span>{destination.city}
                </span>
              ))}
              {entries.length === 0 ? <span className="text-sm text-[#73899c]">No destinations selected</span> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadFavorites} className="min-h-11 border border-[#58c7c4]/35 px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#7ed4d1] transition hover:bg-[#58c7c4]/10">
              Use favorites
            </button>
            <button type="button" onClick={clearSelection} className="min-h-11 border border-white/15 px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#aebdca] transition hover:border-white/35 hover:text-white">
              Clear comparison
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-[minmax(240px,0.7fr)_minmax(0,1.3fr)] lg:items-start">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea3b5]">Add a destination</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search city or country"
              className="mt-2 min-h-12 w-full border border-white/15 bg-[#04162b] px-4 text-sm text-white outline-none placeholder:text-[#647b8f] focus:border-[#58c7c4]"
            />
          </label>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea3b5]">Available destinations</p>
            <div className="mt-2 flex min-h-12 flex-wrap gap-2">
              {availableDestinations.map((destination) => (
                <button
                  key={destination.slug}
                  type="button"
                  onClick={() => toggleSelected(destination.slug)}
                  disabled={entries.length >= 4}
                  aria-label={`Add ${destination.city}`}
                  className="min-h-10 border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-[#c4d0da] transition hover:border-[#58c7c4]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <span className="mr-2 text-[#58c7c4]">+</span>{destination.city}
                </button>
              ))}
              {availableDestinations.length === 0 ? <p className="py-3 text-sm text-[#73899c]">No matching destinations available.</p> : null}
            </div>
          </div>
        </div>
      </section>

      {entries.length === 0 ? (
        <section className="relative overflow-hidden border border-white/10 bg-[#071b31] px-6 py-16 text-center sm:px-10 sm:py-20">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#58c7c4,transparent)]" />
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#58c7c4]">Start a decision board</p>
          <h2 className="mt-4 text-4xl text-white sm:text-5xl">Compare destinations</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#9fb1c0]">Add up to four places to see the practical differences that matter before a move, from cost and healthcare to climate and daily life.</p>
        </section>
      ) : (
        <>
          <nav aria-label="Comparison sections" className="sticky top-0 z-40 overflow-x-auto border-y border-white/10 bg-[#04162b]/95 backdrop-blur-md">
            <div className="flex min-w-max px-2 sm:px-4">
              {compareGroups.map((group) => (
                <a key={group.id} href={`#${group.id}`} className="px-3 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8fa4b6] transition hover:text-[#58c7c4] sm:px-4">{group.title}</a>
              ))}
              <a href="#pros-tradeoffs" className="px-3 py-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8fa4b6] transition hover:text-[#58c7c4] sm:px-4">Pros & tradeoffs</a>
            </div>
          </nav>

          <div
            className="overflow-x-auto overscroll-x-contain border-x border-white/10 bg-[#05182d]"
            data-testid="comparison-scroll-region"
            role="region"
            aria-label="Destination comparison board. Scroll horizontally to view every destination."
          >
            <div style={gridStyle}>
              <div className="sticky top-[43px] z-30 grid grid-cols-[130px_repeat(var(--compare-count),minmax(218px,1fr))] border-b border-white/10 bg-[#061a30]/95 backdrop-blur-md sm:grid-cols-[190px_repeat(var(--compare-count),minmax(240px,1fr))] lg:grid-cols-[210px_repeat(var(--compare-count),minmax(0,1fr))]">
                <div className="sticky left-0 z-40 flex items-end border-r border-white/10 bg-[#061a30] p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#58c7c4]">Destination</p>
                    <p className="mt-2 text-xs leading-5 text-[#7f94a7]">Swipe the board on smaller screens.</p>
                  </div>
                </div>
                {entries.map(({ destination, intelligence }) => (
                  <article key={destination.slug} data-testid="compare-destination-header" className="min-w-0 border-r border-white/10 bg-[#061a30]">
                    <div className="relative h-32 overflow-hidden">
                      <CompareDestinationImage destination={destination} />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,18,37,0.9))]" />
                    </div>
                    <div className="p-4 sm:px-5 sm:pb-5 sm:pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-[#7ed4d1]">{destination.country}</p>
                          <h3 className="mt-1 truncate text-2xl leading-none text-white">{destination.city}</h3>
                        </div>
                        <button type="button" onClick={() => toggleSelected(destination.slug)} aria-label={`Remove ${destination.city}`} title={`Remove ${destination.city}`} className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/15 text-lg text-[#91a6b8] transition hover:border-[#e5b654]/60 hover:text-[#e5b654]">×</button>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-[#8296a8]">Overall fit</span>
                        <span className="font-semibold text-[#e5b654]">{scoreValue({ destination, intelligence }, "Overall Match") ?? "—"}</span>
                      </div>
                      <Link href={`/destinations/${destination.slug}`} className="mt-3 inline-flex text-xs font-semibold text-[#7ed4d1] transition hover:text-white" aria-label={`Open ${destination.city} guide`}>Open guide <span aria-hidden="true" className="ml-2">→</span></Link>
                    </div>
                  </article>
                ))}
              </div>

              {compareGroups.map((group) => (
                <section key={group.id} id={group.id} className="scroll-mt-44 border-b border-[#58c7c4]/20 pt-2 first:pt-0">
                  <div className="grid grid-cols-[130px_repeat(var(--compare-count),minmax(218px,1fr))] sm:grid-cols-[190px_repeat(var(--compare-count),minmax(240px,1fr))] lg:grid-cols-[210px_repeat(var(--compare-count),minmax(0,1fr))]">
                    <div className="sticky left-0 z-20 border-r border-white/10 bg-[#082039] p-4 shadow-[inset_0_1px_0_rgba(88,199,196,0.18)] sm:p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e5b654]">{group.eyebrow}</p>
                      <h3 className="mt-2 text-xl text-white">{group.title}</h3>
                      <p className="mt-3 text-xs leading-5 text-[#8095a8]">{group.description}</p>
                    </div>
                    <div className={`${sectionHeaderSpan} border-b border-white/5 bg-white/[0.015]`} />
                  </div>
                  {group.rows.map((row) => {
                    const scores = row.scoreCategory ? entries.map((entry) => scoreValue(entry, row.scoreCategory!)).filter((score): score is number => score !== null) : [];
                    const strongestScore = scores.length > 1 ? Math.max(...scores) : null;
                    const leadingCount = strongestScore === null ? 0 : scores.filter((score) => score === strongestScore).length;
                    return (
                      <div key={row.label} className="grid grid-cols-[130px_repeat(var(--compare-count),minmax(218px,1fr))] border-t border-white/[0.06] sm:grid-cols-[190px_repeat(var(--compare-count),minmax(240px,1fr))] lg:grid-cols-[210px_repeat(var(--compare-count),minmax(0,1fr))]">
                        <div className="sticky left-0 z-20 flex items-center border-r border-white/10 bg-[#061a30] px-4 py-5 text-xs font-semibold leading-5 text-[#aebdca] sm:px-5">{row.label}</div>
                        {entries.map((entry) => (
                          <div key={entry.destination.slug} className="min-w-0 border-r border-white/[0.07] px-4 py-4 sm:px-5">
                            <MetricValue entry={entry} row={row} strongestScore={strongestScore} leadingCount={leadingCount} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              ))}

              <section id="pros-tradeoffs" className="scroll-mt-44">
                <div className="grid grid-cols-[130px_repeat(var(--compare-count),minmax(218px,1fr))] sm:grid-cols-[190px_repeat(var(--compare-count),minmax(240px,1fr))] lg:grid-cols-[210px_repeat(var(--compare-count),minmax(0,1fr))]">
                  <div className="sticky left-0 z-20 border-r border-white/10 bg-[#071b31] p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e5b654]">10</p>
                    <h3 className="mt-2 text-xl text-white">Pros & tradeoffs</h3>
                    <p className="mt-3 text-xs leading-5 text-[#8095a8]">The strongest evidence-led reasons to keep or question each place.</p>
                  </div>
                  {entries.map(({ destination, intelligence }) => (
                    <article key={destination.slug} className="border-r border-white/10 p-4 sm:p-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#58c7c4]">Major pros</p>
                        <ul className="mt-3 space-y-3">
                          {(intelligence.retirementAdvantages ?? []).slice(0, 3).map((item) => <li key={item} className="border-l border-[#58c7c4]/45 pl-3 text-xs leading-5 text-[#cbd7e1]">{item}</li>)}
                        </ul>
                      </div>
                      <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#e5b654]">Tradeoffs</p>
                        <ul className="mt-3 space-y-3">
                          {(intelligence.retirementTradeoffs ?? []).slice(0, 3).map((item) => <li key={item} className="border-l border-[#e5b654]/45 pl-3 text-xs leading-5 text-[#b9c7d2]">{item}</li>)}
                        </ul>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}