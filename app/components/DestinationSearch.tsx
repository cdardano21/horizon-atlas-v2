"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from "react";
import { sanitizeSummary, toConsumerCopy } from "../lib/consumer-copy";
import type { Destination } from "../lib/destinations";
import { COSTA_DEL_SOL_HERO_IMAGE, getDestinationImageUrl, hasVerifiedDestinationImage } from "../lib/imageFallback";
import { getDestinationMemberDetails, getMemberDetailHighlights } from "../lib/member-details";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";
import ExternalLinkIcon from "./ExternalLinkIcon";
import FavoriteButton from "./FavoriteButton";
import { getDestinationCardFacts, getFactSourceDomain, getFactSourcePublisherUrl } from "./destinationCardFacts";

const normalize = (value: string) => value.toLowerCase().trim();

const filterTagAliasMap: Record<string, string[]> = {
  beach: ["beach", "beaches", "beach city", "beach town", "coast", "coastal", "coastline"],
  "airport access": ["airport access", "airport", "airports"],
  affordable: ["affordable", "budget", "cheap", "low cost", "value"],
  "family friendly": ["family", "family friendly", "families"],
  golf: ["golf"],
  healthcare: ["healthcare", "hospital", "hospitals", "medical"],
  walkability: ["walkability", "walkable", "pedestrian"],
  "expat-friendly": ["expat", "expat-friendly", "international"],
  remote: ["remote", "digital nomad", "workability"],
  safety: ["safe", "safety"],
};

const getFilterTagVariants = (value: string) => {
  const normalized = normalize(value);
  const variants = new Set<string>([normalized]);

  Object.entries(filterTagAliasMap).forEach(([canonical, aliases]) => {
    if (canonical === normalized) {
      aliases.forEach((alias) => variants.add(normalize(alias)));
      return;
    }

    if (aliases.some((alias) => normalize(alias) === normalized)) {
      variants.add(canonical);
      aliases.forEach((alias) => variants.add(normalize(alias)));
    }
  });

  return Array.from(variants);
};

const matchesSelectedTag = (destinationTags: string[], selectedTag: string) => {
  const variants = getFilterTagVariants(selectedTag);

  return destinationTags.some((tag) => {
    const normalizedTag = normalize(tag);
    return variants.some((variant) => normalizedTag === variant || normalizedTag.includes(variant) || variant.includes(normalizedTag));
  });
};

const queryAliasMap: Record<string, string[]> = {
  affordable: ["value"],
  cheap: ["value"],
  budget: ["value"],
  safe: ["safety"],
  hospital: ["healthcare"],
  hospitals: ["healthcare"],
  walkable: ["walkability"],
  walking: ["walkability"],
  beach: ["beach", "coast"],
  coast: ["coast", "beach"],
  airport: ["airport access"],
  airports: ["airport access"],
  expat: ["expat-friendly"],
  family: ["family"],
  remote: ["digital nomad"],
};

const tokenizeQuery = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const toTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSearchableFields = (destination: Destination) => [
  destination.city,
  destination.country,
  destination.slug,
  destination.description,
  destination.overview,
  destination.climate,
  destination.lifestyle,
  destination.transportation,
  ...(destination.tags ?? []),
];

const matchesSelectedTags = (destination: Destination, selectedTags: string[]) => {
  if (selectedTags.length === 0) {
    return true;
  }

  const normalizedTags = (destination.tags ?? []).map((tag) => normalize(tag));

  return selectedTags.every((selectedTag) => {
    const variants = getFilterTagVariants(selectedTag);

    return normalizedTags.some((tag) => variants.some((variant) => tag === variant || tag.includes(variant) || variant.includes(tag)));
  });
};

const getSearchScore = (destination: Destination, query: string, tags: string[]) => {
  const normalizedTags = (destination.tags ?? []).map((tag) => normalize(tag));
  const tagsMatch = matchesSelectedTags(destination, tags);
  if (!tagsMatch) return null;

  const searchableFields = getSearchableFields(destination).map((field) => normalize(field));
  const tokens = tokenizeQuery(query);

  if (tokens.length === 0) {
    return Math.max(0, destination.match);
  }

  const matchedTokenCount = tokens.filter((token) => {
    const tokenMatchesField = searchableFields.some((field) => field === token || field.includes(token) || token.includes(field));
    if (tokenMatchesField) {
      return true;
    }

    const aliases = queryAliasMap[token] ?? [];
    return aliases.some((alias) => normalizedTags.includes(alias));
  }).length;

  if (matchedTokenCount < tokens.length) {
    return null;
  }

  return Math.max(0, destination.match) + tags.length * 6;
};

export default function DestinationSearch({
  destinations,
  initialQuery = "",
}: {
  destinations: Destination[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    destinations.forEach((destination) => {
      destination.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [destinations]);

  const featuredTags = useMemo(() => {
    const counts = new Map<string, number>();
    destinations.forEach((destination) => {
      destination.tags?.forEach((tag) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [destinations]);

  const derivedFilterTags = useMemo(() => {
    const tags = new Set<string>();

    destinations.forEach((destination) => {
      destination.tags?.forEach((tag) => {
        const normalizedTag = normalize(tag);
        Object.entries(filterTagAliasMap).forEach(([canonical, aliases]) => {
          const variants = [canonical, ...aliases].map((entry) => normalize(entry));
          if (variants.some((variant) => normalizedTag === variant || normalizedTag.includes(variant) || variant.includes(normalizedTag))) {
            tags.add(canonical);
          }
        });
      });
    });

    return Array.from(tags).sort();
  }, [destinations]);

  const visibleTags = useMemo(() => Array.from(new Set([...featuredTags, ...derivedFilterTags, ...activeTags])), [activeTags, derivedFilterTags, featuredTags]);

  const filteredDestinations = useMemo(() => {
    return destinations
      .map((destination) => ({
        destination,
        score: getSearchScore(destination, normalize(query), activeTags),
      }))
      .filter((item): item is { destination: Destination; score: number } => typeof item.score === "number")
      .sort((left, right) => right.score - left.score)
      .map((item) => item.destination);
  }, [destinations, query, activeTags]);

  const visualResults = filteredDestinations.slice(0, 3);

  const toggleTag = (tag: string) => {
    setActiveTags((current) => {
      const next = current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag];
      return next;
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleTagClick = (event: MouseEvent<HTMLButtonElement>, tag: string) => {
    event.preventDefault();
    event.stopPropagation();
    toggleTag(tag);
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const openDestination = (slug: string) => {
    const target = `/destinations/${slug}`;

    try {
      router.push(target);
    } catch {
      if (typeof window !== "undefined") {
        window.location.assign(target);
      }
    }
  };

  const featuredResults = filteredDestinations.slice(0, 3);

  console.log("DestinationSearch render", { activeTags, query, filteredDestinationsCount: filteredDestinations.length });

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24">
      <div className="mb-12 grid gap-6 rounded-[2.25rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,252,246,0.95),rgba(247,238,224,0.86))] p-8 shadow-[var(--atlas-shadow)] backdrop-blur-xl md:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div>
            <p className="atlas-kicker">Search and scenario filters</p>
            <h2 className="mt-4 text-3xl text-[var(--atlas-ink)] sm:text-4xl">Find destinations by the life you want to build there.</h2>
            <p className="mt-4 leading-8 text-[var(--atlas-muted)]">
              Search the catalog through emotional fit and practical fit at the same time: coastlines, culture, walkability, healthcare, family ease, golf, workability, and everyday rhythm.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Retiring here", note: "Healthcare, climate, pace, taxes" },
              { title: "Working remotely", note: "Internet, neighborhoods, airports" },
              { title: "Living like a local", note: "Cafes, routines, character" },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.62)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-muted)]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.8)] p-6">
            <label className="block text-sm font-semibold text-[var(--atlas-ink)]">Search destinations</label>
            <input
              value={query}
              onChange={handleSearchChange}
              placeholder="e.g. beach, golf, low cost of living"
              data-testid="destination-search-input"
              className="mt-4 w-full rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.9)] px-4 py-4 text-sm text-[var(--atlas-ink)] outline-none transition focus:border-[rgba(31,95,99,0.5)] sm:text-base"
            />
          </div>
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.8)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--atlas-ink)]">Suggested filters</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--atlas-muted)]">A concise set of the most useful options</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                data-testid="destination-filters-clear"
                className="text-sm text-[var(--atlas-accent)] transition hover:text-[var(--atlas-accent-soft)]"
              >
                Clear all
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(event) => handleTagClick(event, tag)}
                  aria-pressed={activeTags.includes(tag)}
                  data-testid={`destination-filter-${toTestIdToken(tag)}`}
                  className={`rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(255,252,246,0.9)] ${activeTags.includes(tag)
                    ? "border-[rgba(31,95,99,0.5)] bg-[rgba(31,95,99,0.12)] text-[var(--atlas-accent)]"
                    : "border-[var(--atlas-border)] text-[var(--atlas-muted)] hover:border-[rgba(31,95,99,0.5)] hover:text-[var(--atlas-accent)]"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 rounded-[2.25rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.9)] p-6 shadow-[0_22px_48px_-34px_rgba(39,31,19,0.42)]">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Scouting gallery</p>
        <p className="mt-3 text-sm leading-7 text-[var(--atlas-ink)]">
          Before comparing details, scan the visual mood: streets, light, density, and atmosphere often decide whether a city feels right.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {visualResults.length === 0 ? (
            <div className="md:col-span-3 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.72)] p-5 text-sm text-[var(--atlas-muted)]">
              No destinations match the current filters yet. Adjust search terms to reveal fresh scouting imagery.
            </div>
          ) : (
            visualResults.map((destination) => (
              <article key={`visual-${destination.slug}`} className="overflow-hidden rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)]">
                {hasVerifiedDestinationImage(destination) ? (
                  <div className="relative h-48">
                    <Image
                      src={getDestinationImageUrl(destination.images?.[0] ?? { src: "", alt: destination.city }, destination)}
                      alt={destination.images?.[0]?.alt ?? destination.city}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#132022]/64 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#f5e4c3]">{destination.country}</p>
                      <p className="mt-1 text-lg font-semibold text-[#fff7e8]">{destination.city}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-48">
                    <Image
                      src={getDestinationImageUrl({ src: COSTA_DEL_SOL_HERO_IMAGE, alt: `${destination.city} editorial fallback` }, destination)}
                      alt={`${destination.city} editorial fallback view`}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#132022]/72 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#f5e4c3]">Imagery pending verification</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#f5e4c3]">{destination.country}</p>
                    <p className="mt-1 text-lg font-semibold text-[#fff7e8]">{destination.city}</p>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,251,243,0.95),rgba(248,236,216,0.84))] p-6 shadow-lg shadow-[rgba(39,31,19,0.18)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--atlas-accent)]">Catalog snapshot</p>
          <p className="mt-4 text-2xl font-semibold leading-10 text-[var(--atlas-ink)]">
            Browse until a place starts feeling possible, then click through and pressure-test it.
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--atlas-muted)]">
            DestinationFinderAI should feel more like an exploration engine than a results list. Use the filters to narrow the emotional tone of the next chapter you are trying to build.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.75)] p-6 shadow-lg shadow-[rgba(39,31,19,0.14)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--atlas-muted)]" data-testid="destination-results-count">
              Showing <span className="font-semibold text-[var(--atlas-ink)]">{filteredDestinations.length}</span> destinations matching your search.
            </p>
            <p className="text-sm text-[var(--atlas-muted)]" data-testid="destination-active-filters">
              {activeTags.length > 0 ? `Active filters: ${activeTags.join(", ")}` : "No active filters"}
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {featuredResults.length === 0 ? (
              <div className="md:col-span-3 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.5)] p-4 text-sm text-[var(--atlas-muted)]">
                No destinations found.
              </div>
            ) : (
              featuredResults.map((destination) => (
                <div key={destination.slug} className="rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.5)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">Featured result</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--atlas-ink)]">{destination.city}</p>
                  <p className="mt-1 text-sm text-[var(--atlas-muted)]">{destination.country}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mb-10 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.95)] p-6 shadow-lg shadow-[rgba(39,31,19,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Freshly surfaced destinations</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--atlas-ink)]">Newly added places that now get their own visible catalog cards.</h3>
          </div>
          <p className="text-sm text-[var(--atlas-muted)]">The catalog now promotes destinations with stronger content and a clearer path into their guide.</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {destinations
            .map((destination) => {
              const summaryLength = [destination.description, destination.overview, destination.climate, destination.lifestyle, destination.transportation]
                .join(" ")
                .trim().length;
              const score = Number(summaryLength >= 220) + Number((destination.tags?.length ?? 0) >= 3) + Number((destination.images?.length ?? 0) > 0);
              return { destination, score };
            })
            .sort((left, right) => right.score - left.score || right.destination.match - left.destination.match)
            .slice(0, 6)
            .map(({ destination }) => (
              <Link
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
                data-testid={`destination-open-guide-${destination.slug}`}
                aria-label={`Open guide for ${destination.city}`}
                className="relative block rounded-[1.5rem] border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.88)] p-5 transition hover:-translate-y-1 hover:border-[rgba(31,95,99,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2"
              >
                <div className="relative z-20">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--atlas-accent)]">New destination card</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--atlas-ink)]">{destination.city}</p>
                  <p className="mt-1 text-sm text-[var(--atlas-muted)]">{destination.country}</p>
                  <p className="mt-4 text-sm leading-6 text-[var(--atlas-muted)]">{sanitizeSummary(destination.description)}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--atlas-accent)]">
                    <span>Open guide</span>
                    <span aria-hidden="true">→</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {filteredDestinations.length === 0 ? (
        <div className="mb-8 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-8 text-center shadow-lg shadow-[rgba(39,31,19,0.14)]">
          <p className="text-xs uppercase tracking-[0.26em] text-[var(--atlas-accent)]">No matches yet</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--atlas-ink)]">No destinations found.</h3>
          <p className="mt-3 text-sm leading-7 text-[var(--atlas-muted)]">
            Try removing one filter or broadening your search terms to discover nearby lifestyle fits.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            data-testid="destination-search-reset"
            className="atlas-button-secondary mt-5 px-5 py-2"
          >
            Reset search
          </button>
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {filteredDestinations.map((destination, index) => (
          <Link
            key={`${destination.slug}-${index}`}
            href={`/destinations/${destination.slug}`}
            data-testid={`destination-card-${destination.slug}`}
            aria-label={`Open guide for ${destination.city}`}
            className="group relative block overflow-hidden rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] shadow-xl shadow-[rgba(42,34,24,0.2)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2"
          >
            {hasVerifiedDestinationImage(destination) ? (
              <div className="relative h-56 overflow-hidden bg-slate-900/10">
                <Image
                  src={getDestinationImageUrl(destination.images?.[0] ?? { src: "", alt: destination.city }, destination)}
                  alt={destination.images?.[0]?.alt ?? destination.city}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#172426]/70 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="flex h-56 flex-col justify-end border-b border-[var(--atlas-border)] bg-[linear-gradient(130deg,#173336,#2a4447)] p-4">
                <p className="text-[10px] uppercase tracking-[0.23em] text-[#f5e4c3]">Imagery pending verification</p>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#fff7e8]">{destination.city}</p>
              </div>
            )}
            <div className="relative z-20 p-6">
              {(() => {
                const detailHighlights = getMemberDetailHighlights(destination);
                const details = getDestinationMemberDetails(destination);
                const cardFacts = getDestinationCardFacts(destination);

                return (
                  <>
                    <div className="rounded-[1.5rem] border border-transparent p-1 transition hover:border-[rgba(31,95,99,0.2)] hover:bg-[rgba(255,255,255,0.75)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--atlas-accent)]">{destination.country}</p>
                          <h2 className="mt-4 text-2xl font-semibold text-[var(--atlas-ink)]">{destination.city}</h2>
                        </div>
                        <span className="rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.8)] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-muted)]">
                          {(destination.tags?.[0] ?? "curated").replace(/-/g, " ")}
                        </span>
                      </div>
                      <p className="mt-4 leading-7 text-[var(--atlas-muted)]">{sanitizeSummary(cardFacts.summary)}</p>
                    </div>
                    <div className="mt-5 rounded-3xl border border-[rgba(31,95,99,0.24)] bg-[rgba(31,95,99,0.08)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Living Here Scorecard</p>
                        <span className="rounded-full bg-[rgba(31,95,99,0.15)] px-3 py-1 text-xs font-semibold text-[var(--atlas-accent)]">{cardFacts.overallScore} overall</span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {cardFacts.scoreSignals.map((item) => (
                          <div key={item.category} className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.78)] px-3 py-2 text-xs">
                            <span className="text-[var(--atlas-muted)]">{item.category}</span>
                            <span className="font-semibold text-[var(--atlas-accent)]">{item.score}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.74)] p-4">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Relocation facts</p>
                      <div className="mt-3 grid gap-2 text-xs text-[var(--atlas-muted)]">
                        {cardFacts.facts.map((fact, index) => {
                          const safeSourceUrl = sanitizeExternalSourceUrl(fact.sourceUrl);
                          const sourceHref = resolveSourceHref(fact.sourceUrl, [fact.label, destination.city, destination.country]);
                          const publisherUrl = safeSourceUrl ? getFactSourcePublisherUrl(safeSourceUrl) : null;
                          const sourceDomain = safeSourceUrl ? getFactSourceDomain(safeSourceUrl) : "web search";

                          return (
                            <div key={`${fact.label}-${fact.value}-${index}`} className="rounded-xl bg-[rgba(255,255,255,0.82)] px-3 py-2">
                              <p>{fact.label}: {toConsumerCopy(fact.value)}</p>
                              {fact.sourceUrl ? (
                                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                  <a href={sourceHref} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`Open source evidence for ${fact.label}`} title={`Open source evidence for ${fact.label}`} className="inline-flex items-center gap-1 rounded-full border border-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.2em] leading-none text-[var(--atlas-accent)] transition hover:text-[var(--atlas-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                                    <span className="inline-flex items-center gap-1">
                                      {safeSourceUrl ? "Source" : "Source search"}
                                      <ExternalLinkIcon className="h-2.5 w-2.5" />
                                    </span>
                                  </a>
                                  {publisherUrl ? (
                                    <a href={publisherUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} aria-label={`Open publisher site ${sourceDomain}`} title={`Open publisher site ${sourceDomain}`} className="rounded-full border border-[rgba(31,95,99,0.28)] bg-[rgba(31,95,99,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] leading-none text-[var(--atlas-accent)] transition hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                                      <span className="inline-flex items-center gap-1">
                                        {sourceDomain}
                                        <ExternalLinkIcon className="h-2.5 w-2.5" />
                                      </span>
                                    </a>
                                  ) : (
                                    <span className="rounded-full border border-[rgba(31,95,99,0.28)] bg-[rgba(31,95,99,0.08)] px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-[var(--atlas-accent)]">
                                      {sourceDomain}
                                    </span>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-5 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.55)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--atlas-accent)]">Member details</p>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-muted)]">
                          {details.researchStatus === "structured" ? "Structured" : "Research links ready"}
                        </span>
                      </div>
                      {detailHighlights.length > 0 ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {detailHighlights.map((item) => (
                            <div key={item.label} className="rounded-2xl bg-[rgba(255,255,255,0.8)] p-3">
                              <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--atlas-muted)]">{item.label}</p>
                              <p className="mt-2 text-sm font-semibold text-[var(--atlas-ink)]">{toConsumerCopy(item.value)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm leading-6 text-[var(--atlas-muted)]">
                          Full member research categories are wired for this city: monthly weather, golf, hospitals, airports, restaurants, pickleball, and schools.
                        </p>
                      )}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {destination.tags?.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-[rgba(255,255,255,0.7)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--atlas-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <FavoriteButton slug={destination.slug} label="Save city" />
                    </div>
                    <div className="mt-8">
                      <Link
                        href={`/destinations/${destination.slug}`}
                        onClick={(event) => event.stopPropagation()}
                        data-testid={`destination-open-${destination.slug}`}
                        className="atlas-button-primary inline-flex items-center justify-center px-5 py-2"
                      >
                        View full guide
                      </Link>
                    </div>
                  </>
                );
              })()}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
