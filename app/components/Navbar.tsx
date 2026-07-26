"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "./AuthStatus";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Destinations", href: "/destinations" },
  { label: "Life Match", href: "/life-match" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(57,52,42,0.12)] bg-[rgba(248,244,236,0.78)] backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-[0.02em] text-[var(--atlas-ink)] sm:text-2xl">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#235f63,#7ca084)] text-xl font-bold text-[#f8f4ec] shadow-[0_16px_30px_-20px_rgba(35,95,99,0.9)]">
            A
          </span>
          <span className="font-[var(--font-display)] text-3xl leading-none">Horizon Atlas</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold tracking-[0.08em] text-[var(--atlas-muted)] transition hover:text-[var(--atlas-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(248,244,236,0.78)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthStatus variant="desktop" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(57,52,42,0.16)] bg-[rgba(255,252,246,0.75)] text-[var(--atlas-accent)] transition hover:border-[rgba(31,95,99,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.38)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(248,244,236,0.78)] lg:hidden"
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
        <div className="absolute inset-x-0 top-full z-40 border-t border-[rgba(57,52,42,0.12)] bg-[rgba(248,244,236,0.95)] py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
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
