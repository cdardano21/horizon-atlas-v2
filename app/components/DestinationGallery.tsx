"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Destination } from "../lib/destinations";

export default function DestinationGallery({ destination }: { destination: Destination }) {
  const images = destination.images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const featuredImage = images[activeIndex] ?? images[0];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [images.length]);

  const goToIndex = (index: number) => {
    const nextIndex = index < 0 ? images.length - 1 : index >= images.length ? 0 : index;
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

  const resources = [
    { label: "YouTube tours", href: `https://www.youtube.com/results?search_query=${encodeURIComponent(destination.city + " travel guide")}` },
    { label: "TikTok clips", href: `https://www.tiktok.com/search?q=${encodeURIComponent(destination.city + " travel")}` },
    { label: "Google Maps", href: `https://www.google.com/maps/search/${encodeURIComponent(destination.city)}` },
    { label: "Official tourism", href: `https://www.google.com/search?q=${encodeURIComponent(destination.city + " tourism")}` },
  ];

  return (
    <section className="mx-auto max-w-7xl px-8 py-20">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <div
            className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 shadow-xl shadow-slate-950/30"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={featuredImage.src}
              src={featuredImage.src}
              alt={featuredImage.alt}
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
                className="pointer-events-auto rounded-full bg-slate-950/70 px-4 py-3 text-white transition hover:bg-slate-900"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goToIndex(activeIndex + 1)}
                className="pointer-events-auto rounded-full bg-slate-950/70 px-4 py-3 text-white transition hover:bg-slate-900"
              >
                ›
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => goToIndex(index)}
                className={`overflow-hidden rounded-3xl border p-1 transition duration-300 ${
                  index === activeIndex
                    ? "border-cyan-400 shadow-[0_0_0_2px_rgba(34,211,238,0.25)]"
                    : "border-white/10"
                }`}
              >
                <img src={image.src} alt={image.alt} className="h-28 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/30">
          <p className="uppercase tracking-[0.35em] text-cyan-400">Media & resources</p>
          <h2 className="mt-4 text-3xl font-black text-white">Explore local media, tours, and relocation resources.</h2>
          <p className="mt-4 text-slate-400 leading-7">
            Find curated links for YouTube, TikTok, maps, and destination guides to help you dive deeper into the city before you visit.
          </p>

          <div className="mt-8 space-y-4">
            {resources.map((resource) => (
              <Link
                key={resource.label}
                href={resource.href}
                target="_blank"
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
