import Image from "next/image";
import Link from "next/link";
import { publicDestinations } from "../lib/public-destinations";
import CompareClient from "../components/CompareClient";
import { COSTA_DEL_SOL_HERO_IMAGE } from "../lib/imageFallback";

type SearchParams = Record<string, string | string[] | undefined>;
type ComparePageProps = {
  searchParams?: Promise<SearchParams>;
};

const parseSlugs = (value: string | string[] | undefined) => {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
};

const selectDestinations = (searchParams?: SearchParams) => {
  const requested = parseSlugs(searchParams?.slugs);
  const selected = requested.length
    ? publicDestinations.filter((destination) => requested.includes(destination.slug))
    : publicDestinations.slice(0, 3);
  return (selected.length ? selected : publicDestinations.slice(0, 3)).slice(0, 4);
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const selected = selectDestinations(params);
  const initialSlugs = selected.map((destination) => destination.slug);

  return (
    <main className="atlas-shell min-h-screen">
      <section className="relative overflow-hidden border-b border-[rgba(57,52,42,0.14)]">
        <Image
          src={COSTA_DEL_SOL_HERO_IMAGE}
          alt="Comparison studio backdrop"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1d20]/88 via-[#13282d]/68 to-[#443421]/36" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d20]/92 via-[#102326]/38 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-8 py-20 sm:py-24 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#f8dfb4]">Comparison studio</p>
              <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-[#fff8ef] sm:text-5xl lg:text-6xl">
                Compare destinations the way a relocation decision actually gets made.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#f4ecdf] sm:text-lg">
                Line up the cities you are seriously considering and compare emotional fit, practical fit, travel friction, climate, healthcare, and housing logic in one place.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/destinations" className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  Browse all destinations
                </Link>
                <Link href="/life-match" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-[#fef8eb] transition hover:border-[#f8dfb4] hover:bg-white/20">
                  Run Life Match
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/20 bg-[rgba(253,248,237,0.18)] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#f8dfb4]">Decision framing</p>
              <p className="mt-4 text-2xl font-semibold leading-10 text-[#fff9ef]">
                Choose the city that still makes sense after the romance and the spreadsheet collide.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">4</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Cities at once</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">Real</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Tradeoff view</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">Fast</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Shortlist pressure test</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-14">
        <CompareClient destinations={publicDestinations} initialSlugs={initialSlugs} />
      </section>
    </main>
  );
}