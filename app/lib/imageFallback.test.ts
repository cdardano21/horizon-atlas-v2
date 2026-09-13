import { curatedCityImagesBySlug } from "./curatedCityImages";
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


describe("complete authored media precedence", () => {
  const authored = ["hero", "gallery-01", "gallery-02", "gallery-03"].map((role) => `/images/curated-mixed-batch-10-01/ghent-belgium-${role}.jpg`);
  const destination = (urls: string[]) => ({
    slug: "ghent-belgium", city: "Ghent", country: "Belgium", emoji: "", match: 0,
    description: "Ghent", overview: "Ghent", climate: "Temperate", lifestyle: "Urban",
    transportation: "Transit", tags: [], images: urls.map((src) => ({ src, alt: "Ghent" })),
  } satisfies Destination);

  it("keeps the hero-first authored set without appending Ghent Wikimedia fallbacks", () => {
    const result = getDestinationImageSet(destination(authored), 5);
    expect(result).toEqual(authored);
    expect(result.filter((url) => /^https?:/.test(url))).toEqual([]);
  });

  it("deduplicates repeated authored projections without changing order", () => {
    expect(getDestinationImageSet(destination([...authored, ...authored]), 5)).toEqual(authored);
  });

  it.each([
    ["missing gallery", authored.slice(0, 3)],
    ["missing hero", authored.slice(1)],
    ["duplicates do not establish completeness", [authored[0], authored[0], authored[1], authored[2]]],
    ["invalid image does not establish completeness", [...authored.slice(0, 3), "/images/default-image.jpg"]],
  ])("retains existing fallback policy for %s", (_label, urls) => {
    const result = getDestinationImageSet(destination(urls), 5);
    expect(result).toContain(curatedCityImagesBySlug["ghent-belgium"]);
    expect(result[0]).toBe(urls[0]);
    expect(new Set(result).size).toBe(result.length);
  });

  it("preserves fallback-only destinations", () => {
    expect(getDestinationImageSet(destination([]), 5)).toContain(curatedCityImagesBySlug["ghent-belgium"]);
  });
});
