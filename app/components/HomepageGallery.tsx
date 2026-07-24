import Image from "next/image";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    caption: "Costa del Sol sunset coastline",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    caption: "Historic Mediterranean village",
  },
  {
    src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    caption: "Golden beaches and waterfront living",
  },
  {
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
    caption: "Elegant coastal hilltop views",
  },
];

export default function HomepageGallery() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Find your new home</p>
          <h2 className="mt-6 text-5xl font-black text-white">See the places you could be living next.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Every destination preview includes lifestyle, climate, and cost context so you can feel the possibilities before you decide.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 sm:grid-rows-2">
          {galleryImages.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/20">
              <div className="relative h-72 w-full">
                <Image
                  src={image.src}
                  alt={image.caption}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
              <div className="bg-slate-950/80 px-5 py-4 text-sm text-slate-200">{image.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
