"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { getDestinationImageSet } from "../lib/imageFallback";

export default function CompareDestinationImage({ destination }: { destination: Destination }) {
  const candidates = useMemo(() => getDestinationImageSet(destination, 2), [destination]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imageUrl = candidates[candidateIndex];

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 flex items-end bg-[linear-gradient(145deg,#0b3550,#09243d)] p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#72cbc8]">Imagery pending verification</p>
      </div>
    );
  }

  return (
    <Image
      key={imageUrl}
      src={imageUrl}
      alt={`${destination.city}, ${destination.country}`}
      fill
      sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 70vw"
      onError={() => setCandidateIndex((current) => current + 1)}
      className="object-cover"
    />
  );
}