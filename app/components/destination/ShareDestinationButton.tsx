"use client";

import { useState } from "react";

export default function ShareDestinationButton({ city }: { city: string }) {
  const [label, setLabel] = useState("Share");

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${city} relocation intelligence`,
          text: `Explore ${city} on Horizon Atlas`,
          url,
        });
        setLabel("Shared");
        return;
      }

      await navigator.clipboard.writeText(url);
      setLabel("Link copied");
    } catch {
      setLabel("Share");
    }

    window.setTimeout(() => setLabel("Share"), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-100"
    >
      {label}
    </button>
  );
}
