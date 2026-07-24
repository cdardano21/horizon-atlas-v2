"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { getDestinationImageUrl } from "../lib/imageFallback";
import { getDestinationMemberDetails, getMemberDetailHighlights } from "../lib/member-details";
import FavoriteButton from "./FavoriteButton";

const normalize = (value: string) => value.toLowerCase().trim();

const isMatch = (destination: Destination, query: string, tag: string[]) => {
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

  const queryIsMatch = query.length === 0 || query.split(" ").every((term) => content.includes(term));
  const tagsMatch = tag.length === 0 || tag.every((selected) => destination.tags?.includes(selected));

  return queryIsMatch && tagsMatch;
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

  const filteredDestinations = useMemo(
    () =>
      destinations.filter((destination) =>
        isMatch(destination, normalize(query), activeTags),
      ),
    [destinations, query, activeTags],
  );

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-10 grid gap-6 rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-cyan-500/10 backdrop-blur-xl md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="uppercase tracking-[0.35em] text-cyan-400">Search & filter</p>
          <h2 className="mt-4 text-4xl font-black text-white">Find destinations by lifestyle, climate, and experience.</h2>
          <p className="mt-4 text-slate-400 leading-7">
            Search our launch catalog with keyword search and destination filters for beach life, culture, walkability, digital nomad support, and more.
          </p>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <label className="block text-sm font-semibold text-slate-200">Search destinations</label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. beach, golf, low cost of living"
              className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-4 text-white outline-none transition focus:border-cyan-400"
            />
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-200">Filters</p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-cyan-300 transition hover:text-cyan-100"
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
                  className={`rounded-full border px-4 py-2 text-sm transition ${activeTags.includes(tag)
                    ? "border-cyan-400 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 text-slate-300 hover:border-cyan-400 hover:text-cyan-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Showing <span className="font-semibold text-white">{filteredDestinations.length}</span> destinations matching your search.
        </p>
        <p className="text-sm text-slate-400">
          {activeTags.length > 0 ? `Active filters: ${activeTags.join(", ")}` : "No active filters"}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {filteredDestinations.map((destination) => (
          <article key={destination.slug} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50">
            <div className="relative h-56 overflow-hidden bg-slate-900/10">
              <Image
                src={getDestinationImageUrl(destination.images?.[0] ?? { src: "", alt: destination.city }, destination)}
                alt={destination.images?.[0]?.alt ?? destination.city}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            </div>
            <div className="p-6">
              {(() => {
                const detailHighlights = getMemberDetailHighlights(destination);
                const details = getDestinationMemberDetails(destination);

                return (
                  <>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">{destination.country}</p>
              <h2 className="mt-4 text-2xl font-bold text-white">{destination.city}</h2>
              <p className="mt-4 text-slate-400 leading-7">{destination.description}</p>
              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">Member details</p>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {details.researchStatus === "structured" ? "Structured" : "Research links ready"}
                  </span>
                </div>
                {detailHighlights.length > 0 ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {detailHighlights.map((item) => (
                      <div key={item.label} className="rounded-2xl bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    Full member research categories are wired for this city: monthly weather, golf, hospitals, airports, restaurants, pickleball, and schools.
                  </p>
                )}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {destination.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <FavoriteButton slug={destination.slug} label="Save city" />
              </div>
              <Link
                href={`/destinations/${destination.slug}`}
                className="mt-8 inline-flex rounded-full border border-cyan-400 px-5 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900"
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
