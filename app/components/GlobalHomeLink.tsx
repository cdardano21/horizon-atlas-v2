"use client";

import Link from "next/link";

export default function GlobalHomeLink() {
  return (
    <Link
      href="/"
      className="fixed bottom-6 right-4 z-[70] inline-flex items-center gap-2 rounded-full border border-[rgba(31,95,99,0.36)] bg-[rgba(255,252,246,0.94)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--atlas-accent)] shadow-[0_18px_30px_-20px_rgba(31,95,99,0.5)] backdrop-blur-md transition hover:border-[rgba(31,95,99,0.55)] hover:bg-[rgba(255,252,246,0.98)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,95,99,0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--atlas-canvas)] sm:bottom-8 sm:right-6"
      aria-label="Return to landing page"
    >
      Home
    </Link>
  );
}