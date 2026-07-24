import Image from "next/image";
import DestinationSearch from "../components/DestinationSearch";
import { destinations } from "../lib/destinations";
import { COSTA_DEL_SOL_HERO_IMAGE } from "../lib/imageFallback";

type DestinationsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DestinationsPage({ searchParams }: DestinationsPageProps) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <Image
          src={COSTA_DEL_SOL_HERO_IMAGE}
          alt="Costa del Sol coastline"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-900/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-8 py-20 sm:py-24 lg:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">Costa del Sol Spotlight</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Sunlit coastlines, Mediterranean culture, and a soft-landing lifestyle in southern Spain.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Use Horizon Atlas to compare Costa del Sol against your top relocation options by climate, budget, pace, and long-term fit.
          </p>
        </div>
      </section>

      <DestinationSearch destinations={destinations} initialQuery={params.q ?? ""} />
    </main>
  );
}
