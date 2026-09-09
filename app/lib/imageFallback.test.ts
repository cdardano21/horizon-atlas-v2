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

  it("accepts direct image URLs from imported media when they are real image assets", () => {
    const destination: Destination = {
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      emoji: "🌊",
      match: 0,
      description: "A river town with strong daily-life texture.",
      overview: "A river town with strong daily-life texture.",
      climate: "Humid subtropical",
      lifestyle: "Relaxed",
      transportation: "Practical",
      images: [{ src: "https://example.com/images/new-braunfels-hero.jpg", alt: "New Braunfels hero" }],
      tags: ["river", "small-city"],
    };

    const imageSet = getDestinationImageSet(destination, 1);

    expect(imageSet).toContain("https://example.com/images/new-braunfels-hero.jpg");
    expect(getDestinationImageUrl({ src: "https://example.com/images/new-braunfels-hero.jpg", alt: "hero" }, destination)).toBe("https://example.com/images/new-braunfels-hero.jpg");
  });

  it("rejects generic or mismatched image URLs that do not clearly belong to the destination", () => {
    const destination: Destination = {
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      emoji: "🌊",
      match: 0,
      description: "A river town with strong daily-life texture.",
      overview: "A river town with strong daily-life texture.",
      climate: "Humid subtropical",
      lifestyle: "Relaxed",
      transportation: "Practical",
      images: [{ src: "https://images.unsplash.com/photo-12345", alt: "Generic stock photo" }],
      tags: ["river", "small-city"],
    };

    expect(getDestinationImageSet(destination, 1)).toEqual([]);
    expect(getDestinationImageUrl({ src: "https://images.unsplash.com/photo-12345", alt: "Generic stock photo" }, destination)).toContain("data:image/svg+xml");
  });

  it.each([
    "https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=Coimbra",
    "https://commons.wikimedia.org/wiki/Special:Search?search=Coimbra&ns6=1",
  ])("rejects HTML discovery URLs instead of treating a trusted host as an image asset", (src) => {
    const destination = {
      slug: "coimbra-portugal",
      city: "Coimbra",
      country: "Portugal",
      emoji: "",
      match: 0,
      description: "Coimbra",
      overview: "Coimbra",
      climate: "Mediterranean",
      lifestyle: "Historic",
      transportation: "Available",
      images: [{ src, alt: "Coimbra discovery page" }],
      tags: [],
    } satisfies Destination;

    expect(getDestinationImageSet(destination, 1)).not.toContain(src);
    expect(getDestinationImageUrl({ src, alt: "Coimbra discovery page" }, destination)).not.toBe(src);
  });

  it("accepts a generic-host image when the metadata clearly matches the destination", () => {
    const destination: Destination = {
      slug: "new-braunfels-texas-united-states",
      city: "New Braunfels",
      country: "United States",
      emoji: "🌊",
      match: 0,
      description: "A river town with strong daily-life texture.",
      overview: "A river town with strong daily-life texture.",
      climate: "Humid subtropical",
      lifestyle: "Relaxed",
      transportation: "Practical",
      images: [{ src: "https://images.unsplash.com/photo-12345?new-braunfels", alt: "New Braunfels river corridor and historic district" }],
      tags: ["river", "small-city"],
    };

    const imageSet = getDestinationImageSet(destination, 1);

    expect(imageSet).toContain("https://images.unsplash.com/photo-12345?new-braunfels");
    expect(getDestinationImageUrl({ src: "https://images.unsplash.com/photo-12345?new-braunfels", alt: "New Braunfels river corridor and historic district" }, destination)).toBe("https://images.unsplash.com/photo-12345?new-braunfels");
  });

});
