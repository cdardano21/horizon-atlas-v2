import { describe, expect, it } from "vitest";
import type { CanonicalDestinationKey } from "../types";
import { materializeStoredDestinationStateFromNormalizedPersistedBundle } from "../materialize-stored-destination-state";

describe("v31 normalized persisted-bundle materializer", () => {
  it("materializes a complete normalized persisted bundle into StoredDestinationState", () => {
    const sourceBundle = {
      destinationKey: "dest-a" as CanonicalDestinationKey,
      identity: {
        slug: "alpha",
        name: "Alpha",
        city: "Alpha City",
        country: "Country A",
      },
      editorial: {
        shortDescription: "A lively retirement hub",
        longDescription: "A lively retirement hub with strong infrastructure",
        currency: "USD",
        primaryLanguage: "English",
        timeZone: "UTC",
      },
      facts: [
        {
          factKey: "fact-1",
          factGroup: "overview",
          valueText: "Popular with retirees",
          displayLabel: "Overview",
          sourceName: "Workbook",
        },
      ],
      scores: [
        {
          scoreKey: "score-1",
          scoreValue: "8.4",
          scoreLabel: "Overall",
          methodologyVersion: "v3.1",
        },
      ],
      neighborhoods: [
        {
          neighborhoodKey: "hood-1",
          name: "Historic",
          summary: "Walkable",
          areaType: "urban",
        },
      ],
      places: [],
      resources: [],
      media: [],
      costOfLiving: [],
      climateMonthly: [],
      housing: [],
      propertyResources: [],
      healthcare: [],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: {
        summary: "Clean air",
        qualityNotes: "Good water",
      },
      dailyLifePracticality: {
        summary: "Easy",
        practicalityNotes: "Need a car",
      },
      eventsSeasonality: [],
      sources: [
        {
          sourceKey: "source-1",
          name: "Workbook",
          url: "https://example.com",
          type: "workbook",
        },
      ],
    };

    const state = materializeStoredDestinationStateFromNormalizedPersistedBundle(sourceBundle);

    expect(state.identity).toMatchObject({ destinationKey: "dest-a", slug: "alpha", name: "Alpha" });
    expect(state.editorial.shortDescription).toBe("A lively retirement hub");
    expect(state.facts[0]).toMatchObject({ factKey: "fact-1", factGroup: "overview" });
    expect(state.scores[0]).toMatchObject({ scoreKey: "score-1", scoreValue: "8.4" });
    expect(state.environmentQuality).toEqual({ summary: "Clean air", qualityNotes: "Good water" });
    expect(state.dailyLifePracticality).toEqual({ summary: "Easy", practicalityNotes: "Need a car" });
    expect(state.sources[0]).toMatchObject({ sourceKey: "source-1", name: "Workbook" });
  });

  it("preserves explicit empty arrays and explicit null singleton modules for complete bundles", () => {
    const state = materializeStoredDestinationStateFromNormalizedPersistedBundle({
      destinationKey: "dest-b" as CanonicalDestinationKey,
      identity: {
        slug: null,
        name: null,
        city: null,
        country: null,
      },
      editorial: {
        shortDescription: null,
        longDescription: null,
        currency: null,
        primaryLanguage: null,
        timeZone: null,
      },
      facts: [],
      scores: [],
      neighborhoods: [],
      places: [],
      resources: [],
      media: [],
      costOfLiving: [],
      climateMonthly: [],
      housing: [],
      propertyResources: [],
      healthcare: [],
      visaResidency: [],
      taxesFinance: [],
      lgbtqInclusivity: [],
      safetyRisks: [],
      transportation: [],
      remoteWork: [],
      languageIntegration: [],
      pets: [],
      familyEducation: [],
      communitySocial: [],
      accessibility: [],
      bureaucracySetup: [],
      workBusiness: [],
      retirementAging: [],
      lifestyleLaws: [],
      realityCheck: [],
      moveChecklist: [],
      environmentQuality: null,
      dailyLifePracticality: null,
      eventsSeasonality: [],
      sources: [],
    });

    expect(state.facts).toEqual([]);
    expect(state.scores).toEqual([]);
    expect(state.sources).toEqual([]);
    expect(state.environmentQuality).toBeNull();
    expect(state.dailyLifePracticality).toBeNull();
    expect(state.identity).toEqual({
      destinationKey: "dest-b",
      slug: null,
      name: null,
      city: null,
      country: null,
    });
  });
});
