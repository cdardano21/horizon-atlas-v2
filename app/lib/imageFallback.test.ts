import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { getDestinationImageSet, getDestinationImageUrl } from "./imageFallback";

describe("imageFallback", () => {
  it("uses a destination-specific placeholder when no verified destination image exists", () => {
    const destination: Destination = {
      slug: "brand-new-island-city",
      city: "Brand New Island",
      country: "Atlantis",
      emoji: "🌊",
      match: 0,
      description: "A vibrant coastal city",
      overview: "A vibrant coastal city with strong culture and walkability",
      climate: "Mediterranean",
      lifestyle: "Active",
      transportation: "Excellent",
      images: [],
      tags: ["coastal", "urban"],
    };

    const fallbackImage = getDestinationImageUrl({ src: "/images/costa-del-sol-hero.jpg", alt: "fallback" }, destination);

    expect(fallbackImage).toContain("data:image/svg+xml");
    expect(fallbackImage).toContain("Brand%20New%20Island");
    expect(fallbackImage).toContain("Atlantis");
    expect(fallbackImage).not.toBe("/images/costa-del-sol-hero.jpg");
    expect(getDestinationImageSet(destination, 1)).toEqual([]);
  });
});
