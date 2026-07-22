"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Destination } from "../lib/destinations";

const matchOptions = [
  { key: "beach", label: "Beach access" },
  { key: "culture", label: "Culture & nightlife" },
  { key: "walkability", label: "Walkable neighborhoods" },
  { key: "healthcare", label: "Healthcare quality" },
  { key: "safety", label: "Safety & security" },
  { key: "nature", label: "Nature & outdoor life" },
  { key: "digital nomad", label: "Digital nomad friendly" },
  { key: "cost of living", label: "Lower cost of living" },
];

const computeScore = (destination: Destination, selected: string[]) => {
  const tagMatchBonus = selected.reduce(
    (total, tag) => total + (destination.tags?.includes(tag) ? 12 : 0),
    0,
  );
  return destination.match + tagMatchBonus;
};

export default function LifeMatchApp({ destinations }: { destinations: Destination[] }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const hasSelection = selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const results = useMemo(() => {
    return [...destinations]
      .map((destination) => ({
        destination,
        score: computeScore(destination, selectedTags),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => item.destination);
  }, [destinations, selectedTags]);

  return (
    <section id="life-match" className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:py-24">
      <div className="mb-12 rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="uppercase tracking-[0.35em] text-cyan-400">Life Match</p>
            <h1 className="mt-4 text-4xl font-black text-white sm:text-5xl">
              One-time $19.99 search across 500 destinations.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-400">
              Select the lifestyle factors that matter most, then receive a ranked shortlist of the 10 best places for your next chapter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-200">500 destinations</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-slate-300">10 custom matches</span>
              <span className="rounded-full bg-white/5 px-4 py-2 text-slate-300">One-time fee</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 text-slate-300">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">How this works</p>
            <div className="mt-6 space-y-4 text-sm leading-7">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">1. Pick your priorities</p>
                <p className="mt-2 text-slate-400">Choose the lifestyle factors that matter most to you.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">2. Search the full catalog</p>
                <p className="mt-2 text-slate-400">Horizon Atlas compares all 500 destinations against your selected values.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">3. Review your top 10</p>
                <p className="mt-2 text-slate-400">Get an ordered shortlist of the best destinations for your profile.</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">One-time access</p>
              <p className="mt-3">Pay $19.99 once for the full search and recommendation set. No subscriptions, no recurring fees.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Choose your top priorities</p>
              <h2 className="mt-4 text-3xl font-bold text-white">Build a personal retirement match profile.</h2>
              <p className="mt-3 text-slate-400">Tap the strengths you want in your next destination and Horizon Atlas will rank the best fits.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {matchOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleTag(option.key)}
                  className={`rounded-3xl border px-5 py-4 text-left transition ${
                    selectedTags.includes(option.key)
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-100"
                      : "border-white/10 bg-slate-950/80 text-slate-200 hover:border-cyan-400/60"
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="mt-2 text-sm text-slate-400">Tap to include this priority in your search.</div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">
                {hasSelection
                  ? `${selectedTags.length} priorities selected` 
                  : "Pick at least one priority to unlock your matched shortlist."}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(true)}
                  disabled={!hasSelection}
                  className={`rounded-full px-6 py-4 text-sm font-semibold transition ${
                    hasSelection
                      ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      : "cursor-not-allowed bg-white/5 text-slate-500"
                  }`}
                >
                  Get my 10 recommendations
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTags([]);
                    setSubmitted(false);
                  }}
                  className="rounded-full border border-white/10 bg-slate-950/80 px-6 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400"
                >
                  Reset choices
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-slate-300">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Selected priorities</p>
          <div className="mt-6 space-y-4">
            {selectedTags.length === 0 ? (
              <p className="text-slate-400">No priorities selected yet. Pick a few and get matched.</p>
            ) : (
              selectedTags.map((tag) => (
                <div key={tag} className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-white">
                  {tag}
                </div>
              ))
            )}
          </div>
          <div className="mt-10 rounded-3xl bg-slate-900/80 p-5 text-sm text-slate-400">
            <p className="font-semibold text-white">Why this matters</p>
            <p className="mt-3">
              The Life Match engine uses your priorities to score every destination in the catalog and surface the best 10 matches for your profile.
            </p>
          </div>
        </aside>
      </div>

      {submitted && (
        <div className="mt-14 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-cyan-500/10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
            <div>
              <p className="uppercase tracking-[0.35em] text-cyan-400">Your top 10 matches</p>
              <h2 className="mt-3 text-3xl font-black text-white">Ranked destinations for your Life Match profile</h2>
            </div>
            <Link href="/destinations" className="rounded-full border border-cyan-400 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-950">
              Explore full catalog
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((destination, index) => (
              <article key={destination.slug} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-cyan-400/50">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-300">#{index + 1}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{destination.match}% match</span>
                </div>
                <div className="mt-5">
                  <h3 className="text-2xl font-semibold text-white">{destination.city}, {destination.country}</h3>
                  <p className="mt-4 text-slate-400 leading-7">{destination.description}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {destination.tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/destinations/${destination.slug}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-cyan-400 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10"
                >
                  View details
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
