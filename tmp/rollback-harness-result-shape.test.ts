import { describe, expect, it } from "vitest";
import type { NormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/materialize-stored-destination-state";
import type { PersistedDestinationReadResult } from "../app/lib/persistence/v31/types";
import { summarizePersistedBundleResult } from "./rollback-harness-result-shape";

function createBundle(overrides: Partial<NormalizedPersistedDestinationBundle> = {}): NormalizedPersistedDestinationBundle {
  return {
    destinationKey: "dest-a" as never,
    identity: {
      slug: "dest-a",
      name: "Destination A",
      city: "City A",
      country: "Country A",
    },
    editorial: {
      shortDescription: null,
      longDescription: null,
      currency: null,
      primaryLanguage: null,
      timeZone: null,
    },
    facts: [{ factKey: "fact-1", factGroup: null, valueText: null, displayLabel: null, sourceName: null }],
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
    ...overrides,
  } as NormalizedPersistedDestinationBundle;
}

describe("summarizePersistedBundleResult", () => {
  it("summarizes a success result with the real normalized bundle shape", () => {
    const result: PersistedDestinationReadResult = {
      outcome: "SUCCESS",
      bundle: createBundle({
        scores: [{ scoreKey: "score-1", scoreValue: "5", scoreLabel: "Great", methodologyVersion: "v1" }],
      }),
    };

    const summary = summarizePersistedBundleResult("Pilot A", result);

    expect(summary.outcome).toBe("SUCCESS");
    expect(summary.root).toEqual({
      slug: "dest-a",
      name: "Destination A",
      city: "City A",
      country: "Country A",
    });
    expect(summary.profile).toEqual({
      shortDescription: null,
      longDescription: null,
      currency: null,
      primaryLanguage: null,
      timeZone: null,
    });
    expect(summary.presenceModules).toEqual(["facts", "scores"]);
    expect(summary.failureReason).toBeNull();
  });

  it("preserves failure details for failed results", () => {
    const result: PersistedDestinationReadResult = {
      outcome: "FAILED",
      failure: {
        reason: "DB_READ_FAILED",
        destinationIdentity: {
          destinationId: "dest-1",
          destinationKey: "dest-a",
        },
        module: "facts",
      },
    };

    const summary = summarizePersistedBundleResult("Pilot B", result);

    expect(summary.outcome).toBe("FAILED");
    expect(summary.root).toBeNull();
    expect(summary.profile).toBeNull();
    expect(summary.presenceModules).toBeNull();
    expect(summary.failureReason).toBe("DB_READ_FAILED");
    expect(summary.failureModule).toBe("facts");
  });

  it("handles optional module arrays without crashing", () => {
    const result: PersistedDestinationReadResult = {
      outcome: "SUCCESS",
      bundle: createBundle({
        facts: undefined as unknown as readonly { factKey: string; factGroup: string | null; valueText: string | null; displayLabel: string | null; sourceName: string | null }[],
        scores: undefined as unknown as readonly { scoreKey: string; scoreValue: string | null; scoreLabel: string | null; methodologyVersion: string | null }[],
      }),
    };

    const summary = summarizePersistedBundleResult("Pilot C", result);

    expect(summary.outcome).toBe("SUCCESS");
    expect(summary.presenceModules).toEqual([]);
  });
});
