"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Life Match", href: "/life-match" },
  { label: "Destinations", href: "/destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">
        <Link href="/" className="text-2xl font-black tracking-wide">
          Horizon
          <span className="text-cyan-400"> Atlas</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-cyan-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="#contact"
            className="hidden rounded-full bg-cyan-500 px-5 py-2 font-semibold text-slate-900 transition hover:bg-cyan-400 md:inline-flex"
          >
            Get Started
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-cyan-400 md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex h-5 w-5 flex-col justify-between">
              <span className="block h-0.5 w-full rounded-full bg-white" />
              <span className="block h-0.5 w-full rounded-full bg-white" />
              <span className="block h-0.5 w-full rounded-full bg-white" />
            </div>
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-slate-950/95 py-4 backdrop-blur-md md:hidden">
          <div className="mx-auto max-w-7xl px-8">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-900/100 hover:text-cyan-300"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="#contact"
                className="rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 text-center transition hover:bg-cyan-400"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
