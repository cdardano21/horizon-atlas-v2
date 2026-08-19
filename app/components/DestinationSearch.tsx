"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import type { Destination } from "../lib/destinations";
import { rankDestinationsForSearch } from "../lib/destination-search-ranking";
import { getDestinationImageSet } from "../lib/imageFallback";
import FavoriteButton from "./FavoriteButton";
import { getDestinationCardFacts } from "./destinationCardFacts";

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

const toTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function DestinationCardImage({ destination }: { destination: Destination }) {
  const candidates = useMemo(
    () => Array.from(new Set(getDestinationImageSet(destination, 1))),
    [destination],
  );
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageUrl = candidates[candidateIndex];

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete || !image.currentSrc) return;
    if (image.naturalWidth > 0) image.style.opacity = "1";
    else setCandidateIndex((current) => Math.min(current + 1, candidates.length));
  }, [candidateIndex, candidates.length]);

  return (
    <>
      <div data-testid={`destination-image-fallback-${destination.slug}`} className="absolute inset-0 bg-[linear-gradient(145deg,#0a2948,#06182f)] p-3">
        <span className="bg-[#031a31d9] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#d9c59d]">Imagery pending verification</span>
      </div>
      {imageUrl ? (
        <Image
          ref={imageRef}
          key={imageUrl}
          src={imageUrl}
          alt={`${destination.city} destination view`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          data-testid={`destination-image-${destination.slug}`}
          onLoad={(event) => { event.currentTarget.style.opacity = "1"; }}
          onError={() => setCandidateIndex((current) => Math.min(current + 1, candidates.length))}
          className="object-cover opacity-0 transition duration-500 group-hover:scale-105"
        />
      ) : null}
    </>
  );
}

export default function DestinationSearch({
  destinations,
  initialQuery = "",
}: {
  destinations: Destination[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const featuredTags = useMemo(() => {
    const counts = new Map<string, number>();
    destinations.forEach((destination) => {
      destination.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
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

  const visibleTags = useMemo(
    () => Array.from(new Set([...featuredTags, ...derivedFilterTags, ...activeTags])),
    [activeTags, derivedFilterTags, featuredTags],
  );

  const filteredDestinations = useMemo(
    () => rankDestinationsForSearch(destinations, query, activeTags).map((destination) => destination as Destination),
    [destinations, query, activeTags],
  );

  const toggleTag = (tag: string) => {
    setActiveTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]);
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

  if (process.env.NEXT_PUBLIC_DEBUG_PUBLIC_CATALOG === "1") {
    console.info("[DestinationSearch] render", {
      activeTags,
      query,
      receivedDestinationsCount: destinations.length,
      filteredDestinationsCount: filteredDestinations.length,
      first10Slugs: destinations.slice(0, 10).map((destination) => destination.slug),
      hasDevon: destinations.some((destination) => destination.slug === "devon-pa-usa"),
    });
  }

  const hasActiveSearch = Boolean(query.trim() || activeTags.length > 0);

  return (
    <section className="relative z-10 -mt-24 pb-16 sm:-mt-28 sm:pb-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="border border-[#e4b85242] bg-[#061b34ed] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label htmlFor="destination-search" className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Search destinations</label>
              <div className="relative mt-2">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#62cbc9]">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m16 16 4 4" />
                </svg>
                <input
                  id="destination-search"
                  value={query}
                  onChange={handleSearchChange}
                  placeholder="City, country, or lifestyle"
                  data-testid="destination-search-input"
                  className="h-14 w-full border border-[#8eb3c64d] bg-[#031328d9] pl-12 pr-4 text-base text-white outline-none transition placeholder:text-[#8298ad] focus:border-[#e7ba5b] focus:ring-1 focus:ring-[#e7ba5b]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-5 border-l-0 border-[#ffffff1a] lg:border-l lg:pl-7">
              <div>
                <p className="text-2xl font-bold text-[#f0c05f]">{filteredDestinations.length}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#9eb2c6]">Destinations</p>
              </div>
              <button type="button" onClick={clearFilters} data-testid="destination-filters-clear" disabled={!hasActiveSearch} className="h-10 border border-[#f4d08b55] px-4 text-xs font-semibold text-[#f9deb0] transition hover:border-[#f4d08b] hover:bg-[#f4d08b12] disabled:cursor-default disabled:opacity-40">
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-5 border-t border-[#ffffff14] pt-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a9bdd0]">Filter by lifestyle</p>
              {activeTags.length > 0 ? <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5bd0ca]">{activeTags.length} active</span> : null}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              {visibleTags.map((tag) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={(event) => handleTagClick(event, tag)}
                    aria-pressed={isActive}
                    data-testid={`destination-filter-${toTestIdToken(tag)}`}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b] ${isActive
                      ? "border-[#52c7c4] bg-[#119ca533] text-[#73ddd6]"
                      : "border-[#ffffff2b] bg-[#ffffff08] text-[#c8d5e2] hover:border-[#e4b85280] hover:text-[#f9deb0]"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5 mt-10 flex flex-col gap-2 border-b border-[#ffffff17] pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">Explore the catalog</p>
            <h2 className="mt-1 font-serif text-3xl text-[#fff8ef] sm:text-4xl">{hasActiveSearch ? "Your destination matches" : "Places worth a closer look"}</h2>
          </div>
          <div className="text-xs text-[#a9bdd0]">
            <p data-testid="destination-results-count">Showing <span className="font-bold text-[#f0c05f]">{filteredDestinations.length}</span> destinations matching your search.</p>
            <p className="mt-1 sm:text-right" data-testid="destination-active-filters">{activeTags.length > 0 ? `Active filters: ${activeTags.join(", ")}` : "No active filters"}</p>
          </div>
        </div>

        {filteredDestinations.length === 0 ? (
          <div className="border border-[#e4b85242] bg-[linear-gradient(135deg,#08243f,#06182f)] px-6 py-14 text-center shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#55c7c9]">No matches yet</p>
            <h3 className="mt-3 font-serif text-3xl text-[#fff8ef]">Try a broader route.</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#a9bdd0]">Remove one filter or adjust your search terms to discover nearby lifestyle fits.</p>
            <button type="button" onClick={clearFilters} data-testid="destination-search-reset" className="mt-6 bg-[#e8b957] px-5 py-3 text-sm font-bold text-[#06162b] transition hover:bg-[#f3ca75]">Reset search</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDestinations.map((destination, index) => {
              const cardFacts = getDestinationCardFacts(destination);

              return (
                <article key={`${destination.slug}-${index}`} className="group overflow-hidden border border-[#d8ad5540] bg-[#071d36] shadow-[0_18px_40px_rgba(0,0,0,0.22)] [contain-intrinsic-size:auto_390px] [content-visibility:auto] transition duration-300 hover:-translate-y-1 hover:border-[#d8ad5580]">
                  <Link href={`/destinations/${destination.slug}`} data-testid={`destination-card-${destination.slug}`} aria-label={`Open guide for ${destination.city}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f0c05f]">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#0a2745]">
                      <DestinationCardImage destination={destination} />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#021326f5] via-[#031a3133] to-transparent" />
                      <span className="absolute right-3 top-3 rounded-full bg-[#05243de8] px-2.5 py-1 text-[10px] font-bold text-[#67d3c5] backdrop-blur">{cardFacts.overallScore} overall</span>
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f0c05f]">{destination.country}</p>
                        <h3 className="mt-1 font-serif text-2xl leading-tight text-white">{destination.city}</h3>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-1.5">
                      {cardFacts.scoreSignals.slice(0, 3).map((signal) => (
                        <div key={signal.category} className="bg-[#0a2948] px-2 py-2 text-center">
                          <strong className="block text-sm text-[#57d0c4]">{signal.score}</strong>
                          <span className="mt-0.5 block truncate text-[9px] uppercase tracking-[0.08em] text-[#9fb4c9]">{signal.category}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#ffffff12] pt-3">
                      <FavoriteButton slug={destination.slug} label="Save" className="h-9 px-3 text-xs" />
                      <Link href={`/destinations/${destination.slug}`} data-testid={`destination-open-${destination.slug}`} className="text-xs font-bold text-[#eabc5b] transition hover:text-[#f4d08b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b66]">Explore guide →</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}