import Image from "next/image";
import DestinationSearch from "../components/DestinationSearch";
import { publicDestinations } from "../lib/public-destinations";
import { COSTA_DEL_SOL_HERO_IMAGE } from "../lib/imageFallback";

type DestinationsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const params = await searchParams;
  const featuredCountries = Array.from(new Set(publicDestinations.map((destination) => destination.country))).slice(0, 5);

  return (
    <main className="atlas-shell min-h-screen">
      <section className="relative isolate overflow-hidden border-b border-[rgba(57,52,42,0.14)]">
        <Image
          src={COSTA_DEL_SOL_HERO_IMAGE}
          alt="Costa del Sol coastline"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1d20]/82 via-[#10292d]/62 to-[#3e3120]/34" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d20]/88 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-8 py-20 sm:py-24 lg:py-28">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#f8dfb4]">Relocation atlas</p>
              <h1 className="mt-4 max-w-4xl text-4xl leading-tight text-[#fff8ef] sm:text-5xl lg:text-6xl">
                Explore destinations the way people actually choose a future, not a weekend trip.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#f4ecde] sm:text-lg">
                Browse the DestinationFinderAI catalog like an interactive magazine: climate, neighborhood feel, healthcare, daily rhythm, and relocation practicality in one cinematic search experience.
              </p>

              <div className="mt-6 rounded-[1.5rem] border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#f8dfb4]">Search posture</p>
                <p className="mt-2 text-sm leading-7 text-[#f4ecde]">
                  Start broad, then tighten by lifestyle tags until the shortlist feels emotionally right and logistically realistic.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {featuredCountries.map((country) => (
                  <span key={country} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#fef7ec] backdrop-blur-sm">
                    {country}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/20 bg-[rgba(253,247,235,0.18)] p-6 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.32em] text-[#f8dfb4]">What this catalog is for</p>
              <p className="mt-4 text-2xl font-semibold leading-10 text-[#fff9ef]">
                “Could I actually imagine my next chapter here?”
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">{publicDestinations.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Cities in catalog</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">5</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Life scenarios</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/10 p-4">
                  <p className="text-2xl font-black text-[#f8dfb4]">Real</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-[#f4e8d3]">Relocation lens</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <DestinationSearch destinations={publicDestinations} initialQuery={params.q ?? ""} />
    </main>
  );
}
