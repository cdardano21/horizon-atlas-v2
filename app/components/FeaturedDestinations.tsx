import Link from "next/link";
import { destinations } from "../lib/destinations";

export default function FeaturedDestinations() {
  const featured = [...destinations].sort((a, b) => b.match - a.match).slice(0, 4);

  return (
    <section id="destinations" className="mx-auto max-w-7xl px-8 py-28">
      <div className="mb-14 text-center">
        <p className="uppercase tracking-[0.35em] text-cyan-400">
          Featured Destinations
        </p>

        <h2 className="mt-4 text-5xl font-black">
          Places People Fall In Love With
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
          Every destination is evaluated across hundreds of lifestyle factors,
          helping you discover places that truly fit the way you want to live.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {featured.map((place) => (
          <article
            key={place.slug}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition duration-300 hover:-translate-y-2 hover:border-cyan-400/50"
          >
            <div className="flex h-56 items-center justify-center bg-gradient-to-br from-cyan-500 via-sky-600 to-indigo-800 text-7xl">
              {place.emoji}
            </div>

            <div className="p-6">
              <h3 className="text-2xl font-bold">
                {place.city}
              </h3>

              <p className="mt-1 text-cyan-400">
                {place.country}
              </p>

              <p className="mt-4 leading-7 text-slate-400">
                {place.description}
              </p>

              <Link
                href={`/destinations/${place.slug}`}
                className="mt-8 inline-flex rounded-full border border-cyan-400 px-5 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400 hover:text-slate-900"
              >
                Explore →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}