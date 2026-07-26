"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { sanitizeSummary, toConsumerCopy } from "../lib/consumer-copy";
import type { Destination } from "../lib/destinations";
import { getDestinationImageUrl, hasVerifiedDestinationImage } from "../lib/imageFallback";
import { getDestinationMemberDetails, getMemberDetailHighlights } from "../lib/member-details";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";
import ExternalLinkIcon from "./ExternalLinkIcon";
import FavoriteButton from "./FavoriteButton";
import { getDestinationCardFacts, getFactSourceDomain, getFactSourcePublisherUrl } from "./destinationCardFacts";

const normalize = (value: string) => value.toLowerCase().trim();

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

const getSearchScore = (destination: Destination, query: string, tags: string[]) => {
  const normalizedTags = (destination.tags ?? []).map((tag) => normalize(tag));
  const tagsMatch = tags.length === 0 || tags.every((selected) => normalizedTags.includes(normalize(selected)));
  if (!tagsMatch) return null;

  const content = [
    destination.city,
    destination.country,
    destination.description,
    destination.overview,
    destination.climate,
    destination.lifestyle,
    destination.transportation,
    ...(destination.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return Math.max(0, destination.match);
  }

  const city = normalize(destination.city);
  const country = normalize(destination.country);

  let matchedTokenCount = 0;
  let score = Math.max(0, destination.match);

  for (const token of tokens) {
    let tokenScore = 0;

    if (city === token) tokenScore += 30;
    else if (city.includes(token)) tokenScore += 20;

    if (country === token) tokenScore += 24;
    else if (country.includes(token)) tokenScore += 14;

    if (normalizedTags.some((tag) => tag === token)) {
      tokenScore += 22;
    } else if (normalizedTags.some((tag) => tag.includes(token) || token.includes(tag))) {
      tokenScore += 12;
    }

    if (content.includes(token)) {
      tokenScore += 8;
    }

    const aliases = queryAliasMap[token] ?? [];
    if (aliases.some((alias) => normalizedTags.includes(alias))) {
      tokenScore += 10;
    }

    if (tokenScore > 0) {
      matchedTokenCount += 1;
      score += tokenScore;
    }
  }

  const requiredMatches = Math.max(1, Math.ceil(tokens.length * 0.6));
  if (matchedTokenCount < requiredMatches) {
    return null;
  }

  score += tags.length * 6;
  return score;
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    destinations.forEach((destination) => {
      destination.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [destinations]);

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
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const featuredResults = filteredDestinations.slice(0, 3);

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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. beach, golf, low cost of living"
              data-testid="destination-search-input"
              className="mt-4 w-full rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.9)] px-4 py-4 text-sm text-[var(--atlas-ink)] outline-none transition focus:border-[rgba(31,95,99,0.5)] sm:text-base"
            />
          </div>
          <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.8)] p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-[var(--atlas-ink)]">Filters</p>
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
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
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
                  <div className="flex h-48 flex-col justify-end bg-[linear-gradient(135deg,#173336,#294648)] p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[#f5e4c3]">Imagery pending verification</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#f5e4c3]">{destination.country}</p>
                    <p className="mt-1 text-lg font-semibold text-[#fff7e8]">{destination.city}</p>
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
            Horizon Atlas should feel more like an exploration engine than a results list. Use the filters to narrow the emotional tone of the next chapter you are trying to build.
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
                No destinations match the current filter set.
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

      {filteredDestinations.length === 0 ? (
        <div className="mb-8 rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] p-8 text-center shadow-lg shadow-[rgba(39,31,19,0.14)]">
          <p className="text-xs uppercase tracking-[0.26em] text-[var(--atlas-accent)]">No matches yet</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--atlas-ink)]">No destinations match this exact combination.</h3>
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
        {filteredDestinations.map((destination) => (
          <article
            key={destination.slug}
            data-testid={`destination-card-${destination.slug}`}
            className="overflow-hidden rounded-[2rem] border border-[var(--atlas-border)] bg-[rgba(255,252,246,0.92)] shadow-xl shadow-[rgba(42,34,24,0.2)] transition duration-300 hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)]"
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
            <div className="p-6">
              {(() => {
                const detailHighlights = getMemberDetailHighlights(destination);
                const details = getDestinationMemberDetails(destination);
                const cardFacts = getDestinationCardFacts(destination);

                return (
                  <>
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
                            <a href={sourceHref} target="_blank" rel="noopener noreferrer" aria-label={`Open source evidence for ${fact.label}`} title={`Open source evidence for ${fact.label}`} className="inline-flex items-center gap-1 rounded-full border border-transparent px-1 py-0.5 text-[11px] uppercase tracking-[0.2em] leading-none text-[var(--atlas-accent)] transition hover:text-[var(--atlas-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                              <span className="inline-flex items-center gap-1">
                                {safeSourceUrl ? "Source" : "Source search"}
                                <ExternalLinkIcon className="h-2.5 w-2.5" />
                              </span>
                            </a>
                            {publisherUrl ? (
                              <a href={publisherUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open publisher site ${sourceDomain}`} title={`Open publisher site ${sourceDomain}`} className="rounded-full border border-[rgba(31,95,99,0.28)] bg-[rgba(31,95,99,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] leading-none text-[var(--atlas-accent)] transition hover:border-[rgba(31,95,99,0.45)] hover:text-[var(--atlas-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
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
              <Link
                href={`/destinations/${destination.slug}`}
                data-testid={`destination-open-${destination.slug}`}
                className="atlas-button-primary mt-8 px-5 py-2"
              >
                Explore →
              </Link>
                  </>
                );
              })()}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
