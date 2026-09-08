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

  it("does not let empty fields turn exact searches into unrelated matches", () => {
    const destinations = [
      makeDestination({ slug: "verona-italy", city: "Verona", country: "Italy" }),
      makeDestination({ slug: "boquete-panama", city: "Boquete", country: "Panama" }),
    ];

    expect(rankDestinationsForSearch(destinations, "Verona", []).map((item) => item.slug)).toEqual(["verona-italy"]);
  });

  it.each([
    ["Sarande", "Sarandë"],
    ["Merida", "Mérida"],
    ["Cefalu", "Cefalù"],
    ["Sibenik", "Šibenik"],
    ["St Johns", "St. John’s"],
  ])("matches plain-text query %s to accented or punctuated city %s", (query, city) => {
    const destination = makeDestination({ slug: "matching-city", city });

    expect(rankDestinationsForSearch([destination], query, [])).toHaveLength(1);
  });

  it("applies canonical filter aliases with AND semantics", () => {
    const destinations = [
      makeDestination({ slug: "value-coast", tags: ["value", "coastal"] }),
      makeDestination({ slug: "coast-only", tags: ["coast"] }),
    ];

    expect(rankDestinationsForSearch(destinations, "", ["affordable", "beach"]).map((item) => item.slug)).toEqual(["value-coast"]);
  });

  it("uses the slug as a deterministic final tie-breaker", () => {
    const alpha = makeDestination({ slug: "alpha-city", city: "Alpha" });
    const beta = makeDestination({ slug: "beta-city", city: "Beta" });

    expect(rankDestinationsForSearch([beta, alpha], "", []).map((item) => item.slug)).toEqual(["alpha-city", "beta-city"]);
  });

  it("keeps short partial searches focused on destination identity", () => {
    const destinations = [
      makeDestination({ slug: "verona-italy", city: "Verona", description: "Historic center" }),
      makeDestination({ slug: "other-city", city: "Other", description: "An everyday destination" }),
    ];

    expect(rankDestinationsForSearch(destinations, "ver", []).map((item) => item.slug)).toEqual(["verona-italy"]);
  });
});
