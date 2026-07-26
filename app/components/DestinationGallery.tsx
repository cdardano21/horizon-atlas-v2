"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Destination } from "../lib/destinations";
import type { ResourceRecord } from "../lib/destination-command-center";
import { resolveSourceHref, sanitizeExternalSourceUrl } from "../lib/source-links";

type GalleryResource = {
  label: string;
  href: string;
};

const resourceCategoryKeywords: Array<{ keywords: string[]; label: string }> = [
  { keywords: ["airport", "aviation", "flight"], label: "Airport" },
  { keywords: ["transit", "transport", "rail", "metro", "bus"], label: "Transit" },
  { keywords: ["health", "hospital", "clinic", "medical"], label: "Healthcare" },
  { keywords: ["rental", "rent", "housing", "real_estate", "property"], label: "Housing" },
  { keywords: ["tax"], label: "Tax" },
  { keywords: ["visa", "residen"], label: "Visa" },
  { keywords: ["tourism", "official", "local"], label: "Official Guide" },
  { keywords: ["youtube", "video"], label: "YouTube" },
  { keywords: ["tiktok"], label: "TikTok" },
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const toGalleryResources = (records: ResourceRecord[] = []): GalleryResource[] => {
  const selected: GalleryResource[] = [];
  const seenLabels = new Set<string>();
  const seenHrefs = new Set<string>();

  for (const mapping of resourceCategoryKeywords) {
    const match = records.find((record) => {
      const haystack = normalize(`${record.category} ${record.title} ${record.description ?? ""}`);
      return mapping.keywords.some((keyword) => haystack.includes(keyword));
    });

    if (!match) continue;
    const safeUrl = sanitizeExternalSourceUrl(match.url);
    const href = resolveSourceHref(safeUrl, [match.title, match.category, "official source"]);
    if (seenHrefs.has(href)) continue;
    if (seenLabels.has(mapping.label)) continue;

    seenLabels.add(mapping.label);
    seenHrefs.add(href);
    selected.push({
      label: mapping.label,
      href,
    });
  }

  return selected.slice(0, 8);
};

export default function DestinationGallery({ destination, resources: commandResources = [] }: { destination: Destination; resources?: ResourceRecord[] }) {
  const galleryImages = destination.images
    .filter((image) => Boolean(image.src && image.src.trim().length > 0))
    .map((image, index) => ({
      src: image.src,
      alt: image.alt || `${destination.city} local view ${index + 1}`,
      caption: image.caption || `${destination.city} local view ${index + 1}`,
    }))
    .slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const featuredImage = galleryImages[activeIndex] ?? galleryImages[0];

  useEffect(() => {
    if (galleryImages.length === 0) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % galleryImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [galleryImages.length]);

  const goToIndex = (index: number) => {
    const nextIndex = index < 0 ? galleryImages.length - 1 : index >= galleryImages.length ? 0 : index;
    setActiveIndex(nextIndex);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    setTouchDelta(event.touches[0].clientX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null) return;
    const threshold = 60;
    if (touchDelta > threshold) {
      goToIndex(activeIndex - 1);
    } else if (touchDelta < -threshold) {
      goToIndex(activeIndex + 1);
    }
    setTouchStartX(null);
    setTouchDelta(0);
  };

  const cityCountry = `${destination.city}, ${destination.country}`;
  const toTestIdToken = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const galleryResources = [
    { label: "Google Maps", href: `https://www.google.com/maps/search/${encodeURIComponent(cityCountry)}` },
    { label: "Google Earth", href: `https://earth.google.com/web/search/${encodeURIComponent(cityCountry)}` },
    ...toGalleryResources(commandResources),
  ];

  if (galleryImages.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-8 py-20">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82))] p-8 shadow-xl shadow-slate-950/30">
            <p className="uppercase tracking-[0.35em] text-cyan-400">Verified imagery pending</p>
            <h2 className="mt-4 text-3xl font-black text-white">{cityCountry}</h2>
            <p className="mt-4 max-w-2xl text-slate-300 leading-7">
              We are still sourcing destination-specific photography that meets the authenticity threshold for publication. Until then, the gallery remains hidden instead of showing generic stock imagery.
            </p>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30">
            <p className="uppercase tracking-[0.35em] text-cyan-400">Media & resources</p>
            <h2 className="mt-4 text-3xl font-black text-white">Explore local media, tours, and relocation resources.</h2>
            <div className="mt-8 space-y-4">
              {galleryResources.map((resource) => (
                <Link
                  key={resource.label}
                  href={resource.href}
                  target="_blank"
                  data-testid={`destination-resource-${toTestIdToken(resource.label)}`}
                  className="block rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:bg-slate-900"
                >
                  {resource.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div
            data-testid="destination-gallery-carousel"
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              key={featuredImage.src}
              src={featuredImage.src}
              alt={featuredImage.alt}
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 65vw, 100vw"
              className="h-[520px] w-full object-cover transition duration-500 ease-out hover:scale-105"
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 mb-28 px-4">
              <div className="mx-auto max-w-xl rounded-3xl bg-slate-950/80 px-5 py-4 text-sm text-slate-100 backdrop-blur-md sm:text-base">
                {featuredImage.caption}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-4 pb-5">
              <button
                type="button"
                onClick={() => goToIndex(activeIndex - 1)}
                data-testid="destination-gallery-prev"
                className="pointer-events-auto rounded-full bg-slate-950/70 px-4 py-3 text-white transition hover:bg-slate-900"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                data-testid="destination-gallery-next"
                className="pointer-events-auto rounded-full bg-slate-950/70 px-4 py-3 text-white transition hover:bg-slate-900"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => goToIndex(index)}
                className={`overflow-hidden rounded-3xl border p-1 transition duration-300 ${
                  index === activeIndex
                    ? "border-cyan-400 shadow-[0_0_0_2px_rgba(34,211,238,0.25)]"
                    : "border-white/10"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={480}
                  height={192}
                  sizes="(min-width: 640px) 20vw, 30vw"
                  className="h-28 w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Media & resources</p>
          <h2 className="mt-4 text-3xl font-black text-white">Explore local media, tours, and relocation resources.</h2>
          <p className="mt-4 text-slate-400 leading-7">
            Browse published, destination-specific links from the command center records, plus direct map tools for orientation.
          </p>

          <div className="mt-8 space-y-4">
            {galleryResources.map((resource) => (
              <Link
                key={resource.label}
                href={resource.href}
                target="_blank"
                data-testid={`destination-resource-${toTestIdToken(resource.label)}`}
                className="block rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:bg-slate-900"
              >
                {resource.label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
