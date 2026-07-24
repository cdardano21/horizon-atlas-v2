"use client";

import Image from "next/image";
import Link from "next/link";
import { COSTA_DEL_SOL_HERO_IMAGE } from "../lib/imageFallback";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";

export default function Hero() {
  return (
    <section className="relative min-h-[82vh] overflow-hidden bg-slate-950 text-white">
      <Image
        src={COSTA_DEL_SOL_HERO_IMAGE}
        alt="Costa del Sol coastline"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center opacity-85"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/45 via-slate-950/30 to-slate-950/35" />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-amber-400/20 via-transparent to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_0.9fr] lg:items-center">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.35em] text-cyan-300 shadow-sm shadow-cyan-500/10">
              Freedom · Happiness · Hope
            </span>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/90">
              Costa del Sol, Spain
            </p>

            <h1 className="mt-8 text-5xl font-black tracking-tight text-white sm:text-6xl">
              The world is full of incredible places.
            </h1>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-amber-300 sm:text-5xl">
              One of them may be waiting for you.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
              Horizon Atlas matches your lifestyle, budget, and priorities with curated destinations so you can move with confidence and clarity.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/life-match"
                className="inline-flex items-center justify-center rounded-full bg-amber-400 px-8 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-amber-400/25 transition hover:bg-amber-300"
              >
                Start your journey
              </Link>
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-300"
              >
                Explore destinations
              </Link>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
                <p className="text-3xl font-black text-cyan-400">{LAUNCH_CATALOG_SIZE}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">destinations</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
                <p className="text-3xl font-black text-cyan-400">10</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">top matches</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm">
                <p className="text-3xl font-black text-cyan-400">$19.99</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-slate-400">one-time fee</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-500 text-2xl text-slate-950">
                A
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.35em] text-cyan-400">Step into your next chapter</p>
              <h3 className="mt-4 text-3xl font-bold text-white">A guided journey that takes about four minutes.</h3>
              <p className="mt-4 text-slate-300 leading-7">
                Refine your preferences, explore destination tradeoffs, and get a shortlist of the best cities for your lifestyle.
              </p>

              <div className="mt-8 grid gap-3 rounded-3xl bg-slate-950/80 p-5 text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Fast guidance</span>
                  <span className="text-sm font-semibold text-white">4 minutes</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Private & secure</span>
                  <span className="text-sm font-semibold text-white">Answers stay private</span>
                </div>
              </div>

              <Link
                href="/life-match"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-cyan-500 px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Start Life Match
              </Link>

              <p className="mt-4 text-xs text-slate-400">
                Planning tool only; not legal, visa, medical, or financial advice.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Personalized Match",
              description: "Recommendations shaped around what matters to you.",
            },
            {
              title: "Real Tradeoffs",
              description: "Understand the strengths and compromises of each destination.",
            },
            {
              title: "Your Priorities",
              description: "From healthcare to lifestyle, your rules guide the results.",
            },
            {
              title: "Built to Expand",
              description: "300+ destinations with thousands of data points.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm shadow-sm shadow-slate-950/10">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">{item.title}</p>
              <p className="mt-4 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
