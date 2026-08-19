"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Destination } from "../lib/destinations";
import { getDestinationImageSet } from "../lib/imageFallback";

export default function LifeMatchResultImage({
  destination,
  priority = false,
}: {
  destination: Destination;
  priority?: boolean;
}) {
  const candidates = useMemo(() => getDestinationImageSet(destination, 1), [destination]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const imageUrl = candidates[candidateIndex];

  return (
    <div className="absolute inset-0 bg-[linear-gradient(145deg,#0a2948,#06182f)]">
      {!imageUrl ? (
        <div className="absolute inset-0 flex flex-col justify-center p-7 sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#61c7c4]">Destination view</p>
          <p className="mt-3 max-w-[80%] text-4xl leading-none text-white sm:text-5xl">{destination.city}</p>
          <p className="mt-3 text-sm text-[#9eb2c5]">{destination.country}</p>
        </div>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-[linear-gradient(180deg,transparent,rgba(3,18,37,0.88))] p-5 pt-16">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d5b66f]">
          {imageUrl ? "Verified destination view" : "Imagery pending verification"}
        </p>
      </div>
      {imageUrl ? (
        <Image
          key={imageUrl}
          src={imageUrl}
          alt={`${destination.city}, ${destination.country}`}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 50vw, (min-width: 768px) 66vw, 100vw"
          onError={() => setCandidateIndex((current) => current + 1)}
          className="object-cover"
        />
      ) : null}
    </div>
  );
}