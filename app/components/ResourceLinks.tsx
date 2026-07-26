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
      <div className="rounded-[2rem] border border-[var(--atlas-border)] bg-[linear-gradient(125deg,rgba(255,252,245,0.95),rgba(248,241,230,0.85))] p-10 shadow-[var(--atlas-shadow)] backdrop-blur-xl">
        <div className="mb-10 text-center">
          <p className="atlas-kicker">Research links</p>
          <h2 className="mt-4 text-5xl text-[var(--atlas-ink)]">Explore destination media before you commit.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--atlas-muted)]">
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
              className="group rounded-[1.75rem] border border-[var(--atlas-border)] bg-[rgba(255,253,247,0.86)] p-6 transition hover:-translate-y-1 hover:border-[rgba(31,95,99,0.42)]"
            >
              <div className="text-sm uppercase tracking-[0.35em] text-[var(--atlas-accent)]">{link.label}</div>
              <p className="mt-4 text-lg font-semibold text-[var(--atlas-ink)]">{link.description}</p>
              <span className="mt-6 inline-flex text-sm font-semibold text-[var(--atlas-accent)] transition group-hover:text-[var(--atlas-accent-soft)]">
                Open link →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
