const resourceLinks = [
  {
    label: "YouTube destination tours",
    description: "Watch curated travel and relocation videos.",
    href: "https://www.youtube.com/results?search_query=best+relocation+destinations",
  },
  {
    label: "TikTok city clips",
    description: "Discover culture, food, and lifestyle snapshots.",
    href: "https://www.tiktok.com/search?q=best+relocation+destinations",
  },
  {
    label: "Google Maps inspirations",
    description: "Explore neighborhoods, transit, and local geography.",
    href: "https://www.google.com/maps/search/best+relocation+destinations",
  },
  {
    label: "Relocation guides",
    description: "Read expert destination planning and move advice.",
    href: "https://www.google.com/search?q=relocation+guide+top+destinations",
  },
];

export default function ResourceLinks() {
  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 shadow-xl shadow-cyan-500/10 backdrop-blur-xl">
        <div className="mb-10 text-center">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Research links</p>
          <h2 className="mt-4 text-4xl font-black text-white">Explore destination media before you commit.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-400">
            Use curated video tours, TikTok inspiration, maps, and relocation guides to better understand what each place feels like.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {resourceLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 transition hover:border-cyan-400/60 hover:bg-slate-900"
            >
              <div className="text-sm uppercase tracking-[0.35em] text-cyan-400">{link.label}</div>
              <p className="mt-4 text-lg font-semibold text-white">{link.description}</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-cyan-300 transition group-hover:text-cyan-200">
                Open link →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
