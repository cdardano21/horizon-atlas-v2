"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const onSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    router.push(`/destinations${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  };

  return (
    <section id="retirement-dna" className="relative overflow-hidden bg-slate-950 pt-24 lg:pt-28">
      <div className="absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[320px] w-[320px] -translate-y-1/3 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center px-6 pb-24 pt-10 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-2xl text-center lg:text-left">
          <p className="uppercase tracking-[0.45em] text-cyan-400">Life Match</p>
          <h1 className="mt-6 text-5xl font-black leading-tight text-white sm:text-6xl">
            One search of 500 destinations.
            <br />
            Ten custom matches for your next chapter.
          </h1>
          <p className="mt-8 text-lg leading-8 text-slate-300">
            Complete your Life Match profile, unlock the full destination catalog, and get a ranked shortlist tailored to your lifestyle priorities.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
            <Link
              href="/life-match"
              className="rounded-full bg-cyan-500 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
            >
              Start your $19.99 search
            </Link>
            <Link
              href="/destinations"
              className="rounded-full border border-white/15 px-8 py-4 text-lg text-white transition hover:border-cyan-400 hover:text-cyan-300"
            >
              Browse destinations
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-3xl font-black text-cyan-400">500+</p>
              <p className="mt-2 text-sm text-slate-300">Destinations in the catalog</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-3xl font-black text-cyan-400">10</p>
              <p className="mt-2 text-sm text-slate-300">Personalized recommendations</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-3xl font-black text-cyan-400">$19.99</p>
              <p className="mt-2 text-sm text-slate-300">One-time search fee</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid w-full max-w-xl gap-5 lg:mt-0">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-cyan-500/10">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Why it works</p>
            <h2 className="mt-4 text-3xl font-bold text-white">A smarter one-time destination search.</h2>
            <p className="mt-4 text-slate-300 leading-7">
              Horizon Atlas compares every destination in the catalog against your priorities, then ranks the top matches for your next move.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Full catalog search</p>
                <p className="mt-2 text-slate-400">No manual filtering, just a complete match engine across 500 cities.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">One-time payment</p>
                <p className="mt-2 text-slate-400">A single $19.99 charge gives you the full shortlist and analysis.</p>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Personalized results</p>
                <p className="mt-2 text-slate-400">Your priorities shape every destination ranking and recommendation.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Quick catalog search</p>
            <form onSubmit={onSearch} className="mt-6 flex flex-col gap-4">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search destinations by beach, climate, culture..."
                className="w-full rounded-full border border-white/10 bg-slate-950/90 px-5 py-4 text-white outline-none transition focus:border-cyan-400"
              />
              <button
                type="submit"
                className="rounded-full bg-cyan-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Search catalog
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}