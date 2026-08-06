import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { rankDestinationsForSearch } from "./destination-search-ranking";

const makeDestination = (overrides: Partial<Destination> = {}): Destination => ({
  slug: "example-city",
  city: "Example City",
  country: "Example Country",
  emoji: "🌍",
  match: 0,
  description: "",
  overview: "",
  climate: "",
  lifestyle: "",
  transportation: "",
  images: [],
  ...overrides,
});

describe("rankDestinationsForSearch", () => {
  it("puts an exact city match at the top of the list", () => {
    const destinations = [
      makeDestination({ slug: "new-town", city: "New Town", country: "USA", match: 20 }),
      makeDestination({ slug: "san-francisco-ca-usa", city: "San Francisco", country: "USA", match: 10 }),
    ];

    const ranked = rankDestinationsForSearch(destinations, "san francisco", []);

    expect(ranked[0]?.slug).toBe("san-francisco-ca-usa");
    expect(ranked[0]?.matchKind).toBe("exact-city");
  });
});
