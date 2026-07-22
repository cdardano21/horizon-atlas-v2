import Link from "next/link";

const links = [
  { label: "Life Match", href: "/life-match" },
  { label: "Explore", href: "#destinations" },
  { label: "Destinations", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-8 py-16 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Horizon Atlas</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
            Find the right retirement destination with data-driven guidance and AI-powered preference matching.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm transition hover:text-cyan-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Horizon Atlas. All rights reserved.
      </div>
    </footer>
  );
}
