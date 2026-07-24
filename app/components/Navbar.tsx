"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "./AuthStatus";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Destinations", href: "#destinations" },
  { label: "Life Match", href: "/life-match" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-wide text-white sm:text-2xl">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-xl font-bold text-slate-950">
            A
          </span>
          <span>Horizon Atlas</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-200 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthStatus variant="desktop" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-slate-200 transition hover:border-cyan-400 lg:hidden"
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
        <div className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-slate-950/95 py-4 backdrop-blur-md lg:hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-3">
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
