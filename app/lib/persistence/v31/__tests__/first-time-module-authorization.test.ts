import { describe, expect, it } from "vitest";
import { buildFirstTimeModuleAuthorizationManifest } from "../first-time-module-authorization";
import type { CanonicalDestinationKey, StoredDestinationState } from "../types";
import type { DeterministicV31CanonicalDestination } from "../../../workbook-v31-deterministic-core";

const DEST_KEY = "v31-first-time-test" as CanonicalDestinationKey;

function emptyStoredState(overrides: Partial<StoredDestinationState> = {}): StoredDestinationState {
  return {
    identity: { destinationKey: DEST_KEY, slug: "v31-first-time-test", name: "First Time Test", city: "Testland City", country: "Testland" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
    costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
    visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
    remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
    accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
    realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
    eventsSeasonality: [], sources: [],
    ...overrides,
  };
}

function canonicalWithModules(overrides: Record<string, readonly unknown[]>): DeterministicV31CanonicalDestination {
  return {
    identity: { destinationKey: DEST_KEY, slug: "v31-first-time-test", name: "First Time Test", city: "Testland City", country: "Testland" },
    editorial: { shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null },
    facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [],
    costOfLiving: [], climateMonthly: [], housing: [], propertyResources: [], healthcare: [],
    visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [], transportation: [],
    remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [],
    accessibility: [], bureaucracySetup: [], workBusiness: [], retirementAging: [], lifestyleLaws: [],
    realityCheck: [], moveChecklist: [], environmentQuality: null, dailyLifePracticality: null,
    eventsSeasonality: [], sources: [],
    ...overrides,
  } as unknown as DeterministicV31CanonicalDestination;
}

describe("buildFirstTimeModuleAuthorizationManifest", () => {
  it("authorizes REPLACE_MODULE for a non-keyed module that is empty in storage but non-empty in the workbook", () => {
    const canonical = canonicalWithModules({ costOfLiving: [{ category: "housing", monthlyLow: "1000", monthlyHigh: "1500", currency: "USD" }] });
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonical, emptyStoredState());
    expect(manifest.entries).toEqual([
      expect.objectContaining({ destinationKey: DEST_KEY, operation: "REPLACE_MODULE", targetModule: "costOfLiving" }),
    ]);
  });

  it("does NOT authorize a module that already has any persisted data, even if the workbook has different content", () => {
    const canonical = canonicalWithModules({ healthcare: [{ summary: "new incoming summary" }] });
    const stored = emptyStoredState({ healthcare: [{ summary: "existing persisted summary", publicAccessSummary: null, insuranceSummary: null }] });
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonical, stored);
    expect(manifest.entries).toEqual([]);
  });

  it("does not authorize a module with no incoming workbook content", () => {
    const canonical = canonicalWithModules({ pets: [] });
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonical, emptyStoredState());
    expect(manifest.entries).toEqual([]);
  });

  it("authorizes multiple eligible modules independently, across both the record_key and position groups", () => {
    const canonical = canonicalWithModules({
      costOfLiving: [{ category: "housing" }],
      climateMonthly: [{ monthKey: "1" }],
      pets: [{ summary: "pet friendly" }],
      lgbtqInclusivity: [{ summary: "inclusive" }],
    });
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonical, emptyStoredState());
    const targetModules = manifest.entries.map((entry) => (entry as { targetModule: string }).targetModule).sort();
    expect(targetModules).toEqual(["climateMonthly", "costOfLiving", "lgbtqInclusivity", "pets"].sort());
  });

  it("never generates CLEAR_FIELD or DELETE_CHILD entries", () => {
    const canonical = canonicalWithModules({
      costOfLiving: [{ category: "housing" }],
      healthcare: [{ summary: "x" }],
      neighborhoods: [{ neighborhood_name: "Should not matter - keyed modules are out of scope here" }],
    });
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonical, emptyStoredState());
    expect(manifest.entries.every((entry) => entry.operation === "REPLACE_MODULE")).toBe(true);
  });

  it("produces no entries at all for a destination with no workbook content in any eligible module", () => {
    const manifest = buildFirstTimeModuleAuthorizationManifest(DEST_KEY, canonicalWithModules({}), emptyStoredState());
    expect(manifest.entries).toEqual([]);
  });
});
