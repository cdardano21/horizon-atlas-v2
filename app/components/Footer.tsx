import Link from "next/link";
import HorizonAtlasLogo from "./HorizonAtlasLogo";

const links = [
  { label: "Life Match", href: "/life-match" },
  { label: "Explore", href: "#destinations" },
  { label: "Destinations", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--atlas-border)] bg-[linear-gradient(180deg,rgba(247,239,227,0.8),rgba(241,232,216,0.9))] px-8 py-16 text-[var(--atlas-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start">
          <HorizonAtlasLogo layout="horizontal" tone="dark" className="text-[var(--atlas-ink)]" />
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--atlas-muted)]">
            Find the right retirement destination with data-driven guidance and AI-powered preference matching.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-[0.14em] transition hover:text-[var(--atlas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(244,235,219,0.9)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-[var(--atlas-border)] pt-6 text-sm text-[var(--atlas-muted)]">
        © {new Date().getFullYear()} DestinationFinderAI. All rights reserved.
      </div>
    </footer>
  );
}
