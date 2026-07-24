import Image from "next/image";
import Link from "next/link";
import { destinations } from "../lib/destinations";
import { getDestinationImageUrl } from "../lib/imageFallback";
import FavoriteButton from "./FavoriteButton";

export default function FeaturedDestinations() {
  const featured = [...destinations].sort((a, b) => b.match - a.match).slice(0, 4);

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="uppercase tracking-[0.35em] text-cyan-400">Find places that fit your life</p>
          <h2 className="mt-4 text-5xl font-black text-white">Curated destinations. Real data. Personalized for you.</h2>
        </div>
        <Link
          href="/destinations"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-slate-900 hover:text-white"
        >
          Explore all destinations
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {featured.map((place) => (
          <article key={place.slug} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 shadow-xl shadow-slate-950/40 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">
            <div className="relative h-64 overflow-hidden bg-slate-900/10">
              <Image
                src={getDestinationImageUrl(place.images[0] ?? { src: "", alt: place.city }, place)}
                alt={place.images[0]?.alt || place.city}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{place.city}</p>
                    <p className="text-sm text-slate-200">{place.country}</p>
                  </div>
                  <span className="rounded-full bg-cyan-500/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
                    {Math.round(place.match)}% match
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">{place.tags?.slice(0, 2).join(" • ")}</p>
              <p className="mt-4 text-xl font-semibold text-white">{place.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-white/5 px-3 py-2">Climate</span>
                <span className="rounded-full bg-white/5 px-3 py-2">Healthcare</span>
                <span className="rounded-full bg-white/5 px-3 py-2">Cost of living</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <FavoriteButton slug={place.slug} label="Save city" />
              </div>
              <Link
                href={`/destinations/${place.slug}`}
                className="mt-8 inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 hover:text-white"
              >
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
