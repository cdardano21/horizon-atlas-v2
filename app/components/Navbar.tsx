"use client";

import Link from "next/link";
import { useState } from "react";
import AuthStatus from "./AuthStatus";
import HorizonAtlasLogo from "./HorizonAtlasLogo";

const links = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Destinations", href: "/destinations" },
  { label: "Life Match", href: "/life-match" },
  { label: "Compare", href: "/compare" },
  { label: "Resources", href: "/about" },
];

const toTestIdToken = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e4b85230] bg-[#03142ae8] shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center pr-3">
          <HorizonAtlasLogo layout="horizontal" tone="light" className="text-white" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              data-testid={`navbar-link-${toTestIdToken(link.label)}`}
              className="text-xs font-semibold text-[#d9e4ee] transition hover:text-[#f3c666] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b66]"
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#f4d08b55] bg-[#08213c] text-[#f9deb0] transition hover:border-[#f4d08b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b66] lg:hidden"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex h-5 w-5 flex-col justify-between">
              <span className="block h-0.5 w-full rounded-full bg-[#f9deb0]" />
              <span className="block h-0.5 w-full rounded-full bg-[#f9deb0]" />
              <span className="block h-0.5 w-full rounded-full bg-[#f9deb0]" />
            </div>
          </button>
        </div>
      </div>

      {isOpen ? (
        <div data-testid="navbar-mobile-menu" className="absolute inset-x-0 top-full z-40 border-t border-[#f4d08b1f] bg-[rgba(5,16,33,0.95)] py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  data-testid={`navbar-mobile-link-${toTestIdToken(link.label)}`}
                  className="rounded-3xl border border-[#f4d08b2b] bg-[rgba(8,24,48,0.76)] px-4 py-3 text-sm font-semibold text-[#d5deef] transition hover:border-[#f4d08b66] hover:text-[#f9deb0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b66] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08152a]"
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
