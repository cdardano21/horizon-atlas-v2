const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    caption: "Coastal sunsets and Mediterranean living",
  },
  {
    src: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=1200&q=80",
    caption: "Historic neighborhoods and city culture",
  },
  {
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
    caption: "Mountain escapes and riverside retreats",
  },
  {
    src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    caption: "Vibrant city life and coastal charm",
  },
];

export default function HomepageGallery() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-24">
      <div className="mb-10 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            <p className="uppercase tracking-[0.35em] text-cyan-400">Explore with imagery</p>
            <h2 className="text-5xl font-black text-white">A visual destination gallery for your next great move.</h2>
            <p className="text-lg leading-8 text-slate-400">
              Beautiful photography helps you feel the possibilities. Swipe through launch destinations and imagine the life waiting for you.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 sm:grid-rows-2">
            {galleryImages.map((image) => (
              <div key={image.src} className="overflow-hidden rounded-4xl border border-white/10 bg-slate-900/90 shadow-xl shadow-slate-950/30">
                <img
                  src={image.src}
                  alt={image.caption}
                  className="h-56 w-full object-cover transition duration-500 hover:scale-105"
                />
                <div className="bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
                  {image.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
