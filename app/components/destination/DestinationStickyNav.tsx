import Link from "next/link";

const navItems = [
  ["decision-fast", "Decision fast"],
  ["qa-core", "Core Q&A"],
  ["story", "Story"],
  ["day-here", "A day here"],
  ["scenarios", "Life scenarios"],
  ["snapshot", "Snapshot"],
  ["monthly-weather", "Climate"],
  ["homes", "Homes"],
  ["lifestyle", "Lifestyle"],
  ["practical", "Practical"],
  ["map-media", "Map and media"],
  ["resources", "Sources"],
] as const;

export default function DestinationStickyNav() {
  return (
    <nav
      aria-label="Destination sections"
      className="sticky top-16 z-30 border-y border-[var(--atlas-border)] bg-[rgba(248,244,236,0.9)] backdrop-blur-2xl"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-8">
        <ul className="flex min-w-max items-center gap-2 text-sm text-[var(--atlas-muted)]">
          <li>
            <Link
              href="/"
              className="inline-flex rounded-full border border-[rgba(31,95,99,0.4)] bg-[rgba(31,95,99,0.1)] px-3 py-1.5 font-semibold text-[var(--atlas-accent)] transition hover:bg-[rgba(31,95,99,0.18)]"
            >
              Home
            </Link>
          </li>
          {navItems.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex rounded-full border border-[var(--atlas-border)] bg-[rgba(255,255,255,0.78)] px-3 py-1.5 font-medium transition hover:border-[rgba(31,95,99,0.45)] hover:bg-[rgba(31,95,99,0.08)] hover:text-[var(--atlas-accent)]"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
