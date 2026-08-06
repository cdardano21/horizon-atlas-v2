import Image from "next/image";
import Link from "next/link";

const galleryImages = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/1/13/Valencia_skyline_sunset_%284262234180%29.jpg",
    caption: "Valencia skyline at sunset, Spain",
    href: "/destinations/valencia-spain",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rovinj%2C_Croatia.jpg",
    caption: "Rovinj old town, Croatia",
    href: "/destinations/rovinj-croatia",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Tivat_Sv._Marko_Gospa_od_Milosti.jpg",
    caption: "Tivat Bay, Montenegro",
    href: "/destinations/tivat-montenegro",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Lake_Bled_from_the_Mountain.jpg/3840px-Lake_Bled_from_the_Mountain.jpg",
    caption: "Lake Bled mountain panorama, Slovenia",
    href: "/destinations/lake-bled-slovenia",
  },
];

export default function HomepageGallery() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28 sm:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(145deg,rgba(255,251,242,0.96),rgba(247,236,216,0.88))] p-10 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
          <p className="atlas-kicker">Find your new home</p>
          <h2 className="mt-6 text-5xl leading-tight text-[var(--atlas-ink)]">See the places you could be living next.</h2>
          <p className="mt-6 text-lg leading-8 text-[var(--atlas-muted)]">
            Every destination preview includes lifestyle, climate, and cost context so you can feel the possibilities before you decide.
          </p>
          <div className="mt-8 rounded-3xl border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.58)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--atlas-accent)]">Lens</p>
            <p className="mt-2 text-sm leading-7 text-[var(--atlas-muted)]">
              Compare mood, pace, and practical routines, not just pretty photos.
            </p>
          </div>
        </div>

        <div className="grid gap-6 rounded-[2.25rem] border border-[var(--atlas-border)] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.28)_0px,rgba(255,255,255,0.28)_2px,transparent_2px,transparent_18px)] p-3 sm:grid-cols-2 sm:grid-rows-2">
          {galleryImages.map((image, index) => (
            <Link
              key={image.src}
              href={image.href}
              className={`group block overflow-hidden rounded-[2rem] border border-[rgba(57,52,42,0.14)] bg-[rgba(255,252,246,0.9)] shadow-xl shadow-[rgba(54,43,22,0.2)] transition hover:-translate-y-1 hover:shadow-2xl ${index === 0 ? "sm:row-span-2" : ""}`}
              aria-label={image.caption}
            >
              <div className={`relative w-full ${index === 0 ? "h-[32rem]" : "h-64"}`}>
                <Image
                  src={image.src}
                  alt={image.caption}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#19282a]/55 via-transparent to-transparent" />
              </div>
              <div className="bg-[rgba(255,251,243,0.95)] px-5 py-4 text-sm font-medium tracking-[0.06em] text-[var(--atlas-ink)]">{image.caption}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
