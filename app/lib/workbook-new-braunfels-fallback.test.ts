import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSupabase = vi.hoisted(() => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabaseFetch: vi.fn(),
}));

vi.mock("./supabase", () => mockSupabase);

import { getCanonicalDestination } from "./canonical-destination-loader";
import { getDestinationImageSet } from "./imageFallback";
import { getWorkbookFallbackDestinationData } from "./workbook-new-braunfels-fallback";

describe("workbook New Braunfels fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.isSupabaseConfigured.mockReturnValue(false);
  });

  it("exposes workbook-backed New Braunfels content for the fallback canonical destination", () => {
    const fallback = getWorkbookFallbackDestinationData("new-braunfels-texas-united-states");

    expect(fallback).not.toBeNull();
    expect(fallback?.resources.map((resource) => resource.label)).toContain("City of New Braunfels");
    expect(fallback?.resources.map((resource) => resource.label)).toContain("Resolute Baptist Hospital");
    expect(fallback?.neighborhoodIntelligence?.[0]?.places?.some((place) => place.name === "The Gristmill Restaurant & Bar")).toBe(true);
  });

  it("uses the workbook-backed New Braunfels profile when Supabase is unavailable", async () => {
    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination).not.toBeNull();
    expect(destination?.resources.some((resource) => resource.label === "City of New Braunfels")).toBe(true);
    expect(destination?.resources.some((resource) => resource.label === "Resolute Baptist Hospital")).toBe(true);
    expect(destination?.neighborhoods).toContain("Gruene Historic District");
    expect(destination?.heroNarrative).toContain("Gruene");
  });

  it("surfaces workbook-backed editorial and neighborhood profiles on the canonical destination", async () => {
    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    expect(destination?.premiumEditorialContent?.heroIntroduction).toContain("river life");
    expect(destination?.premiumEditorialContent?.majorStrengths).toContain("River access");
    expect(destination?.neighborhoodProfiles?.[0]?.summary).toContain("Gruene");
    expect(destination?.neighborhoodProfiles?.[0]?.intelligence?.some((metric) => metric.key === "walkability")).toBe(true);
  });

  it("exposes a richer image set for the canonical New Braunfels destination", async () => {
    const destination = await getCanonicalDestination("new-braunfels-texas-united-states");

    const imageSet = getDestinationImageSet({
      slug: destination?.slug ?? "new-braunfels-texas-united-states",
      city: destination?.city ?? "New Braunfels",
      country: destination?.country ?? "United States",
      images: [
        ...(destination?.heroImages ?? []),
        ...(destination?.mediaGallery ?? []),
        ...(destination?.media ?? []),
      ].map((image) => ({ src: image.url, alt: image.altText })),
    } as never, 5);

    expect(imageSet.length).toBeGreaterThanOrEqual(3);
  });
});
