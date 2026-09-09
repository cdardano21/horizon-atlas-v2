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

  const qualityMatrix = [
    makeDestination({ slug: "aomori-japan", city: "Aomori", country: "Japan" }),
    makeDestination({ slug: "morioka-japan", city: "Morioka", country: "Japan", transportation: "Rail connects Morioka with Tokyo, Sendai, Aomori and Akita." }),
    makeDestination({ slug: "porto-portugal", city: "Porto", country: "Portugal" }),
    makeDestination({ slug: "athens-greece", city: "Athens", country: "Greece" }),
    makeDestination({ slug: "sapporo-japan", city: "Sapporo", country: "Japan" }),
    makeDestination({ slug: "fairhope-alabama", city: "Fairhope", country: "United States" }),
  ];

  it.each([
    ["Aomori", "aomori-japan"],
    ["Morioka", "morioka-japan"],
    ["Porto", "porto-portugal"],
    ["Athens", "athens-greece"],
    ["Sapporo", "sapporo-japan"],
    ["Fairhope", "fairhope-alabama"],
  ])("puts exact city query %s first", (query, expectedSlug) => {
    const ranked = rankDestinationsForSearch(qualityMatrix, query, []);

    expect(ranked[0]?.slug).toBe(expectedSlug);
    expect(ranked[0]?.matchKind).toBe("exact-city");
  });

  it("suppresses broad content matches when an exact city exists", () => {
    expect(rankDestinationsForSearch(qualityMatrix, "Aomori", []).map((item) => item.slug)).toEqual(["aomori-japan"]);
    expect(rankDestinationsForSearch(qualityMatrix, "Morioka", [])[0]?.slug).toBe("morioka-japan");
  });

  it.each([
    ["Sapp", "sapporo-japan"],
    ["Port", "porto-portugal"],
  ])("keeps prefix query %s useful", (query, expectedSlug) => {
    expect(rankDestinationsForSearch(qualityMatrix, query, [])[0]?.slug).toBe(expectedSlug);
  });

  it.each([
    ["Aomri", "aomori-japan"],
    ["Saporo", "sapporo-japan"],
    ["Athnes", "athens-greece"],
    ["Fairhpo", "fairhope-alabama"],
  ])("keeps typo query %s useful", (query, expectedSlug) => {
    const ranked = rankDestinationsForSearch(qualityMatrix, query, []);

    expect(ranked[0]?.slug).toBe(expectedSlug);
    expect(ranked[0]?.matchKind).toBe("fuzzy");
  });

  it("preserves broader content search when no exact identity exists", () => {
    expect(rankDestinationsForSearch(qualityMatrix, "rail connects", []).map((item) => item.slug)).toEqual(["morioka-japan"]);
  });
});
