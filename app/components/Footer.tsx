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
    <footer className="border-t border-[#f4d08b26] bg-[linear-gradient(180deg,rgba(6,20,40,0.86),rgba(5,16,31,0.94))] px-8 py-16 text-[#cad8ea]">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start">
          <HorizonAtlasLogo layout="horizontal" tone="light" className="text-white" />
          <p className="mt-3 max-w-md text-sm leading-6 text-[#cad8ea]">
            Find the right retirement destination with data-driven guidance and AI-powered preference matching.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-[0.14em] text-[#d8e3f2] transition hover:text-[#f4d08b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d08b66] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06172e]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-[#f4d08b26] pt-6 text-sm text-[#a9bdd8]">
        © {new Date().getFullYear()} DestinationFinderAI. All rights reserved.
      </div>
    </footer>
  );
}
