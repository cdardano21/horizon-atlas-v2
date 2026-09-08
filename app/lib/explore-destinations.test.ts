import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { buildExploreDestinationList } from "./explore-destinations";
import type { SmartShortlistData } from "./smart-shortlist/server-data";

const destination = (slug: string, city: string): Destination => ({
  slug,
  city,
  country: "Example Country",
  emoji: "",
  match: 0,
  description: `${city} description`,
  overview: `${city} overview`,
  climate: "",
  lifestyle: "",
  transportation: "",
  images: [],
  tags: ["walkable"],
});

const candidateData = {
  candidates: [
    { key: "legacy-key", slug: "canonical-slug", name: "Canonical City", country: "Canonical Country", summary: "Canonical summary" },
    { key: "second-key", slug: "second-slug", name: "Second City", country: "Second Country", summary: "Second summary" },
  ],
  destinationMedia: [
    { key: "legacy-key", heroImage: { src: "/legacy.jpg", alt: "Canonical City view" } },
    { key: "second-key", heroImage: { src: "/second.jpg", alt: "Second City view" } },
  ],
} as Pick<SmartShortlistData, "candidates" | "destinationMedia">;

describe("buildExploreDestinationList", () => {
  it("returns only verified candidates and maps legacy keys to canonical routes", () => {
    const list = buildExploreDestinationList([
      destination("legacy-key", "Legacy City"),
      destination("unowned-extra", "Extra City"),
    ], candidateData);

    expect(list.map((item) => item.slug)).toEqual(["canonical-slug", "second-slug"]);
    expect(list[0]).toMatchObject({
      city: "Canonical City",
      country: "Canonical Country",
      description: "Legacy City description",
      tags: ["walkable"],
    });
    expect(list[1]).toMatchObject({
      description: "Second summary",
      overview: "Second summary",
      images: [{ src: "/second.jpg", alt: "Second City view", caption: "Second City, Second Country" }],
    });
  });

  it("prefers exact canonical enrichment over a legacy-key record", () => {
    const list = buildExploreDestinationList([
      destination("legacy-key", "Legacy City"),
      destination("canonical-slug", "Canonical Enrichment"),
    ], candidateData);

    expect(list[0]?.description).toBe("Canonical Enrichment description");
  });
});