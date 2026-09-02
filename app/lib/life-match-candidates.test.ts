import { describe, expect, it } from "vitest";
import type { Destination } from "./destinations";
import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import { getLifeMatchCandidateDestinations, getRegisteredWorkbookDestinationKeys } from "./life-match-candidates";

const makeDestination = (slug: string, city = slug): Destination => ({
  slug,
  city,
  country: "Testland",
  emoji: "🌴",
  match: 80,
  description: "A destination",
  overview: "An overview",
  climate: "Warm",
  lifestyle: "Relaxed",
  transportation: "Easy",
  images: [],
  tags: [],
});

describe("life-match candidate filtering", () => {
  it("keeps registered workbook-backed destinations and excludes unregistered legacy destinations", () => {
    const publicDestinations = [
      makeDestination("the-villages-fl-us", "The Villages"),
      makeDestination("sofia-bg", "Sofia"),
      makeDestination("legacy-city-1", "Legacy City 1"),
      makeDestination("legacy-city-2", "Legacy City 2"),
    ];

    const candidateDestinations = getLifeMatchCandidateDestinations(publicDestinations);

    expect(candidateDestinations.map((destination) => destination.slug)).toEqual(["the-villages-fl-us", "sofia-bg"]);
  });

  it("removes accidental duplicates while preserving original order", () => {
    const publicDestinations = [
      makeDestination("ajijic-mexico", "Ajijic"),
      makeDestination("ajijic-mexico", "Ajijic Duplicate"),
      makeDestination("merida-mexico", "Merida"),
    ];

    const candidateDestinations = getLifeMatchCandidateDestinations(publicDestinations);

    expect(candidateDestinations.map((destination) => destination.slug)).toEqual(["ajijic-mexico", "merida-mexico"]);
  });

  it("skips registered keys with no public destination record without failing", () => {
    const publicDestinations = [makeDestination("fairhope-al-us", "Fairhope")];
    const registry = [
      ...EXPANSION_WORKBOOK_REGISTRY,
      { registryId: "future-batch", workbookPath: "data/future.xlsx", environment: "preview", expectedDestinationKeys: ["future-city-zz"] },
    ];

    const candidateDestinations = getLifeMatchCandidateDestinations(publicDestinations, registry);

    expect(candidateDestinations.map((destination) => destination.slug)).toEqual(["fairhope-al-us"]);
  });

  it("derives current registry keys dynamically from the registry and keeps future registered batches eligible automatically", () => {
    const registry = [
      { registryId: "batch-a", environment: "preview", expectedDestinationKeys: ["alpha-city", "beta-city"] },
      { registryId: "batch-b", environment: "preview", expectedDestinationKeys: ["beta-city", "gamma-city"] },
      { registryId: "batch-c", environment: "production", expectedDestinationKeys: ["prod-city"] },
    ];

    expect(getRegisteredWorkbookDestinationKeys(registry)).toEqual(["alpha-city", "beta-city", "gamma-city"]);

    const publicDestinations = [makeDestination("gamma-city", "Gamma City"), makeDestination("legacy-city", "Legacy City")];
    expect(getLifeMatchCandidateDestinations(publicDestinations, registry).map((destination) => destination.slug)).toEqual(["gamma-city"]);
  });

  it("does not change the public destination loader contract or produce fallback values for unregistered entries", () => {
    const publicDestinations = [
      makeDestination("some-public-legacy-city", "Some Public Legacy City"),
      makeDestination("the-villages-fl-us", "The Villages"),
    ];

    const candidateDestinations = getLifeMatchCandidateDestinations(publicDestinations);

    expect(candidateDestinations).toHaveLength(1);
    expect(candidateDestinations[0].slug).toBe("the-villages-fl-us");
    expect(candidateDestinations.some((destination) => destination.slug === "some-public-legacy-city")).toBe(false);
  });
});
