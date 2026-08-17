"use client";

import Image from "next/image";
import Link from "next/link";
import { COSTA_DEL_SOL_HERO_IMAGE } from "../lib/imageFallback";
import { LAUNCH_CATALOG_SIZE } from "../lib/destinations";
import DestinationFinderIcon from "./DestinationFinderIcon";

export default function Hero() {
  return (
    <section className="relative min-h-[96vh] overflow-hidden pt-20 text-[#faf8f2]">
      <Image
        src={COSTA_DEL_SOL_HERO_IMAGE}
        alt="Costa del Sol coastline"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,16,18,0.74)_0%,rgba(22,48,52,0.46)_42%,rgba(98,74,34,0.16)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[rgba(248,244,236,0.58)] via-transparent to-transparent blur-3xl" />
      <div className="absolute -left-16 bottom-8 h-56 w-56 rounded-full bg-[rgba(197,155,95,0.36)] blur-3xl" />
      <div className="absolute -right-20 top-36 h-64 w-64 rounded-full bg-[rgba(73,147,153,0.28)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-24 sm:pt-20 lg:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-3xl text-center lg:text-left">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[#fbe8be] shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#f7d7a4]" />
              Curated relocation stories
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#f7d7a4]">
              Costa del Sol, Spain
            </p>

            <h1 className="mt-8 text-4xl leading-[0.88] tracking-[-0.03em] text-[#fefbf5] sm:text-6xl lg:text-7xl">
              Find where your best life begins.
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[#f2ebe0] sm:text-lg">
              DestinationFinderAI helps you discover, compare, and confidently choose places that match your lifestyle, budget, climate preferences, career goals, and everyday happiness.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/life-match"
                data-testid="hero-cta-life-match"
                className="inline-flex items-center justify-center rounded-full bg-[#f2d9ad] px-8 py-4 text-base font-semibold text-[#172427] shadow-[0_24px_50px_-20px_rgba(242,217,173,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f7e4c0]"
              >
                Begin Life Match
              </Link>
              <Link
                href="/destinations"
                data-testid="hero-cta-explore-atlas"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-[#fefbf5] transition duration-300 hover:-translate-y-0.5 hover:border-[#f4dfbe] hover:bg-white/20"
              >
                Explore the catalog
              </Link>
            </div>

            <div className="mt-10 rounded-[1.75rem] border border-white/20 bg-[rgba(20,31,34,0.56)] px-5 py-4 shadow-[0_18px_45px_-24px_rgba(0,0,0,0.65)] backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#f7d7a4]">Relocation manifesto</p>
              <p className="mt-2 text-sm leading-7 text-[#efe7d8]">
                Choose a place where your routines feel easier, your support systems feel stronger, and your next chapter feels realistic.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-sm shadow-[0_16px_38px_-24px_rgba(0,0,0,0.75)]">
                <p className="text-3xl font-black text-[#f8e2bc]">{LAUNCH_CATALOG_SIZE}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#e8dece]">destinations</p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-sm shadow-[0_16px_38px_-24px_rgba(0,0,0,0.75)]">
                <p className="text-3xl font-black text-[#f8e2bc]">10</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#e8dece]">precision matches</p>
              </div>
              <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-left backdrop-blur-sm shadow-[0_16px_38px_-24px_rgba(0,0,0,0.75)]">
                <p className="text-3xl font-black text-[#f8e2bc]">$19.99</p>
                <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#e8dece]">one-time unlock</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:pl-2">
            <div className="rounded-[2rem] border border-white/25 bg-[rgba(255,251,243,0.17)] p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-[linear-gradient(145deg,#f2d9ad,#d6a96a)] p-2 text-[#253638] shadow-[0_10px_24px_-12px_rgba(242,217,173,0.8)]">
                <DestinationFinderIcon size={40} accent="#253638" base="#172427" />
              </div>
              <p className="mt-6 text-sm uppercase tracking-[0.35em] text-[#f4dfbe]">Your relocation studio</p>
              <h3 className="mt-4 text-3xl font-semibold text-[#fff8ee]">Discover places designed around your life.</h3>
              <p className="mt-4 leading-7 text-[#efe7d8]">
                Capture what matters most, reveal your personal fit, and turn ideas into a shortlist you can actually evaluate.
              </p>

              <div className="mt-8 rounded-3xl bg-[rgba(20,31,34,0.55)] p-5 text-[#efe7d8]">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-[#f9e7c8]">Fast guidance</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#f9e7c8]">Private & secure</p>
                    <p className="mt-1 text-sm text-[#efe7d8]">Answers stay private</p>
                  </div>
                </div>
              </div>

              <Link
                href="/life-match"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(145deg,#f2d9ad,#d6a96a)] px-7 py-4 text-base font-semibold text-[#263739] transition duration-300 hover:-translate-y-0.5 hover:brightness-105"
              >
                Start Life Match
              </Link>

              <p className="mt-4 text-xs text-[#e2d8c6]">
                Planning tool only; not legal, visa, medical, or financial advice.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/20 bg-[rgba(12,28,30,0.62)] p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#f6dfb7]">What happens next</p>
              <ol className="mt-3 grid gap-2 text-sm text-[#efe7d8]">
                <li>1. Share your lifestyle priorities.</li>
                <li>2. Review your top 10 destination matches.</li>
                <li>3. Pressure-test the cities that feel right.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <div key={item.title} className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-[0_16px_38px_-24px_rgba(0,0,0,0.75)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:bg-white/15">
              <p className="text-sm uppercase tracking-[0.35em] text-[#f9e7c8]">{item.title}</p>
              <p className="mt-4 text-sm leading-6 text-[#efe7d8]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
