"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "./AuthStatus";
import HorizonAtlasLogo from "./HorizonAtlasLogo";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Destinations", href: "/destinations" },
  { label: "Life Match", href: "/life-match" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#contact" },
];

const toTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(57,52,42,0.08)] bg-[rgba(248,244,236,0.92)] shadow-[0_10px_30px_-20px_rgba(31,35,33,0.38)] backdrop-blur-2xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:h-28 sm:px-6 lg:h-32 lg:px-8">
        <Link href="/" className="flex h-full items-center self-center py-2 pr-2 sm:pr-3 lg:pr-4">
          <HorizonAtlasLogo layout="horizontal" tone="dark" className="text-[var(--atlas-ink)]" />
        </Link>

        <nav className="hidden items-center rounded-full border border-[rgba(57,52,42,0.1)] bg-[rgba(255,252,246,0.88)] px-2 py-2 shadow-[0_10px_35px_-22px_rgba(31,35,33,0.45)] lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-testid={`navbar-link-${toTestIdToken(link.label)}`}
              className="rounded-full px-4 py-2 text-sm font-semibold tracking-[0.08em] text-[var(--atlas-muted)] transition hover:bg-[rgba(31,95,99,0.06)] hover:text-[var(--atlas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(248,244,236,0.78)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex">
            <AuthStatus variant="desktop" />
          </div>
          <button
            type="button"
            data-testid="navbar-mobile-toggle"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(57,52,42,0.16)] bg-[rgba(255,252,246,0.9)] text-[var(--atlas-accent)] shadow-[0_10px_22px_-18px_rgba(31,35,33,0.4)] transition hover:border-[rgba(31,95,99,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.38)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(248,244,236,0.78)] lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex h-5 w-5 flex-col justify-between">
              <span className="block h-0.5 w-full rounded-full bg-[var(--atlas-accent)]" />
              <span className="block h-0.5 w-full rounded-full bg-[var(--atlas-accent)]" />
              <span className="block h-0.5 w-full rounded-full bg-[var(--atlas-accent)]" />
            </div>
          </button>
        </div>
      </div>

      {isOpen ? (
        <div data-testid="navbar-mobile-menu" className="absolute inset-x-0 top-full z-40 border-t border-[rgba(57,52,42,0.12)] bg-[rgba(248,244,236,0.95)] py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  data-testid={`navbar-mobile-link-${toTestIdToken(link.label)}`}
                  className="rounded-3xl border border-[rgba(57,52,42,0.14)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm font-semibold text-[var(--atlas-muted)] transition hover:border-[rgba(31,95,99,0.42)] hover:text-[var(--atlas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(248,244,236,0.95)]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div onClick={() => setIsOpen(false)}>
                <AuthStatus variant="mobile" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
