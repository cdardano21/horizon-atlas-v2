import { describe, expect, it } from "vitest";

import { normalizePersistedDestinationRows } from "../normalize-persisted-destination-rows";
import type { CanonicalDestinationKey, DestinationId, ResolvedDestinationIdentity } from "../types";

// Proves Option B (destructure-and-omit) actually carries every approved field through
// normalizePersistedDestinationRows() rather than a stale, hand-maintained field list silently
// dropping newly-approved parity fields - the exact defect class already found and fixed twice
// elsewhere in this pipeline (plan-destination.ts's payload normalizer, write-port.ts's keyed-child
// fallback config).

const IDENTITY: ResolvedDestinationIdentity = {
  destinationKey: "test-dest" as CanonicalDestinationKey,
  destinationId: "test-dest-id" as DestinationId,
};

const BASE_ROOT = { destinationId: "test-dest-id", destinationKey: "test-dest", slug: "test-slug", name: "Test Name", city: "Test City", country: "Test Country" };
const BASE_PROFILE = { destinationId: "test-dest-id", destinationKey: "test-dest", profileStorageVersion: 1, identityName: "Test Name", shortDescription: null, longDescription: null, currency: null, primaryLanguage: null, timeZone: null };

const EMPTY_KEYED_CHILDREN = { facts: [], scores: [], neighborhoods: [], places: [], resources: [], media: [], propertyResources: [], moveChecklist: [], eventsSeasonality: [], sources: [] };
const EMPTY_REPLACE_MODULES = {
  costOfLiving: [], climateMonthly: [], housing: [], healthcare: [], visaResidency: [], taxesFinance: [], lgbtqInclusivity: [], safetyRisks: [],
  transportation: [], remoteWork: [], languageIntegration: [], pets: [], familyEducation: [], communitySocial: [], accessibility: [], bureaucracySetup: [],
  workBusiness: [], retirementAging: [], lifestyleLaws: [], realityCheck: [],
};
const EMPTY_SINGLETONS = { environmentQuality: [], dailyLifePracticality: [] };

function baseInput(overrides: Record<string, unknown> = {}) {
  return {
    identity: IDENTITY,
    root: BASE_ROOT,
    profile: BASE_PROFILE,
    presence: [],
    keyedChildren: EMPTY_KEYED_CHILDREN,
    replaceModules: EMPTY_REPLACE_MODULES,
    singletons: EMPTY_SINGLETONS,
    ...overrides,
  } as Parameters<typeof normalizePersistedDestinationRows>[0];
}

// One fully-populated fixture per module, keyed by the module's bundle-array field name, with the
// exact PersistedXRow shape (including destinationId/destinationKey/position where applicable) and
// a distinct sentinel per field so cross-module or cross-field contamination is unambiguous.
const REPLACE_MODULE_FIXTURES: Record<string, { path: "keyedChildren" | "replaceModules"; row: Record<string, unknown>; positioned?: boolean }> = {
  scores: {
    path: "keyedChildren",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", scoreKey: "s1", scoreValue: "scores:scoreValue", scoreLabel: "scores:scoreLabel", methodologyVersion: "scores:methodologyVersion", verified: "true", verifiedAt: "scores:verifiedAt" },
  },
  costOfLiving: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", itemKey: "row-1", category: "costOfLiving:category", monthlyLow: "costOfLiving:monthlyLow", monthlyHigh: "costOfLiving:monthlyHigh", currency: "costOfLiving:currency", stayModeKey: "costOfLiving:stayModeKey", verified: "true", verifiedAt: "costOfLiving:verifiedAt" },
  },
  visaResidency: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "visaResidency:summary", residencyPath: "visaResidency:residencyPath", citizenshipPath: "visaResidency:citizenshipPath", stayModeKey: "visaResidency:stayModeKey", travelerNationality: "visaResidency:travelerNationality", verified: "true", verifiedAt: "visaResidency:verifiedAt" },
  },
  housing: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "housing:summary", buyingSummary: "housing:buyingSummary", rentalSummary: "housing:rentalSummary", stayModeKey: "housing:stayModeKey", canForeignersBuy: "housing:canForeignersBuy", residencyRequiredToBuy: "housing:residencyRequiredToBuy", verified: "true", verifiedAt: "housing:verifiedAt" },
  },
  healthcare: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "healthcare:summary", publicAccessSummary: "healthcare:publicAccessSummary", insuranceSummary: "healthcare:insuranceSummary", topic: "healthcare:topic", englishSpeakingCare: "healthcare:englishSpeakingCare", typicalGpVisitCost: "healthcare:typicalGpVisitCost", typicalSpecialistCost: "healthcare:typicalSpecialistCost", verified: "true", verifiedAt: "healthcare:verifiedAt" },
  },
  safetyRisks: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", itemKey: "row-1", topic: "safetyRisks:topic", severity: "safetyRisks:severity", summary: "safetyRisks:summary", verified: "true", verifiedAt: "safetyRisks:verifiedAt" },
  },
  lgbtqInclusivity: {
    path: "replaceModules",
    positioned: true,
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", position: 1, summary: "lgbtqInclusivity:summary", culturalNotes: "lgbtqInclusivity:culturalNotes", overallRating: "lgbtqInclusivity:overallRating", legalProtections: "lgbtqInclusivity:legalProtections", socialAcceptance: "lgbtqInclusivity:socialAcceptance", prideEvents: "lgbtqInclusivity:prideEvents", nightlifeSocial: "lgbtqInclusivity:nightlifeSocial", healthcareAccess: "lgbtqInclusivity:healthcareAccess", areasResources: "lgbtqInclusivity:areasResources", safetyConsiderations: "lgbtqInclusivity:safetyConsiderations", verified: "true", verifiedAt: "lgbtqInclusivity:verifiedAt" },
  },
  taxesFinance: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "taxesFinance:summary", notes: "taxesFinance:notes", verified: "true", verifiedAt: "taxesFinance:verifiedAt" },
  },
  remoteWork: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "remoteWork:summary", internetSummary: "remoteWork:internetSummary", timezoneSummary: "remoteWork:timezoneSummary", fiberAvailable: "remoteWork:fiberAvailable", mobile5g: "remoteWork:mobile5g", utilityReliability: "remoteWork:utilityReliability", coworkingSummary: "remoteWork:coworkingSummary", verified: "true", verifiedAt: "remoteWork:verifiedAt" },
  },
  languageIntegration: {
    path: "replaceModules",
    positioned: true,
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", position: 1, summary: "languageIntegration:summary", englishSupport: "languageIntegration:englishSupport", primaryLanguage: "languageIntegration:primaryLanguage", englishProficiency: "languageIntegration:englishProficiency", governmentEnglishAccess: "languageIntegration:governmentEnglishAccess", medicalEnglishAccess: "languageIntegration:medicalEnglishAccess", languageResources: "languageIntegration:languageResources", verified: "true", verifiedAt: "languageIntegration:verifiedAt" },
  },
  communitySocial: {
    path: "replaceModules",
    positioned: true,
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", position: 1, summary: "communitySocial:summary", socialNotes: "communitySocial:socialNotes", expatPresence: "communitySocial:expatPresence", volunteering: "communitySocial:volunteering", easeMeetingPeople: "communitySocial:easeMeetingPeople", ageMix: "communitySocial:ageMix", transientVsRooted: "communitySocial:transientVsRooted", verified: "true", verifiedAt: "communitySocial:verifiedAt" },
  },
  transportation: {
    path: "replaceModules",
    row: { destinationId: "test-dest-id", destinationKey: "test-dest", summary: "transportation:summary", airportSummary: "transportation:airportSummary", transitSummary: "true", topic: "transportation:topic", distanceKm: "transportation:distanceKm", typicalDriveMinutes: "transportation:typicalDriveMinutes", nonstopUsService: "false", carNeededRating: "transportation:carNeededRating", parkingNotes: "transportation:parkingNotes", rideshareNotes: "transportation:rideshareNotes", verified: "true", verifiedAt: "transportation:verifiedAt" },
  },
};

describe("REQUIRED TEST 1 - full field round-trip per scoped module", () => {
  for (const [moduleKey, fixture] of Object.entries(REPLACE_MODULE_FIXTURES)) {
    it(`carries every approved field through normalizePersistedDestinationRows for ${moduleKey}`, () => {
      const input = baseInput({
        [fixture.path]: {
          ...(fixture.path === "keyedChildren" ? EMPTY_KEYED_CHILDREN : EMPTY_REPLACE_MODULES),
          [moduleKey]: [fixture.row],
        },
      });

      const bundle = normalizePersistedDestinationRows(input) as unknown as Record<string, ReadonlyArray<Record<string, unknown>>>;
      const outputRow = bundle[moduleKey][0];

      const { destinationId, destinationKey, position, ...expectedFields } = fixture.row;
      for (const [field, expectedValue] of Object.entries(expectedFields)) {
        expect(outputRow[field]).toBe(expectedValue);
      }

      // Persistence-only metadata must NOT leak into the runtime bundle.
      expect(outputRow).not.toHaveProperty("destinationId");
      expect(outputRow).not.toHaveProperty("destinationKey");
      if (fixture.positioned) {
        expect(outputRow).not.toHaveProperty("position");
      }
    });
  }
});

describe("REQUIRED TEST 2 - structural exhaustiveness guardrail", () => {
  for (const [moduleKey, fixture] of Object.entries(REPLACE_MODULE_FIXTURES)) {
    it(`output keys are a superset of source keys minus persistence-only fields for ${moduleKey}`, () => {
      const input = baseInput({
        [fixture.path]: {
          ...(fixture.path === "keyedChildren" ? EMPTY_KEYED_CHILDREN : EMPTY_REPLACE_MODULES),
          [moduleKey]: [fixture.row],
        },
      });

      const bundle = normalizePersistedDestinationRows(input) as unknown as Record<string, ReadonlyArray<Record<string, unknown>>>;
      const outputRow = bundle[moduleKey][0];
      const omitted = new Set(["destinationId", "destinationKey", ...(fixture.positioned ? ["position"] : [])]);
      const expectedKeys = Object.keys(fixture.row).filter((key) => !omitted.has(key));

      for (const key of expectedKeys) {
        expect(outputRow).toHaveProperty(key);
      }
    });
  }
});

describe("REQUIRED TEST 3 - null preservation", () => {
  it("keeps genuinely null source fields null with no fallback content", () => {
    const input = baseInput({
      replaceModules: {
        ...EMPTY_REPLACE_MODULES,
        visaResidency: [{
          destinationId: "test-dest-id", destinationKey: "test-dest",
          summary: "visa summary", residencyPath: null, citizenshipPath: null,
          stayModeKey: null, travelerNationality: null, verified: null, verifiedAt: null,
        }],
      },
    });

    const bundle = normalizePersistedDestinationRows(input);
    const row = bundle.visaResidency[0] as unknown as Record<string, unknown>;
    expect(row.residencyPath).toBeNull();
    expect(row.citizenshipPath).toBeNull();
    expect(row.stayModeKey).toBeNull();
    expect(row.travelerNationality).toBeNull();
    expect(row.verified).toBeNull();
    expect(row.verifiedAt).toBeNull();
  });
});

describe("REQUIRED TEST 4 - boolean preservation (no re-coercion at this layer)", () => {
  it("passes through already-coerced boolean-shaped string values unchanged", () => {
    const input = baseInput({
      replaceModules: {
        ...EMPTY_REPLACE_MODULES,
        transportation: [{
          destinationId: "test-dest-id", destinationKey: "test-dest",
          summary: null, airportSummary: null, transitSummary: "true", topic: null,
          distanceKm: null, typicalDriveMinutes: null, nonstopUsService: "false",
          carNeededRating: null, parkingNotes: null, rideshareNotes: null,
          verified: "true", verifiedAt: null,
        }],
      },
    });

    const bundle = normalizePersistedDestinationRows(input);
    const row = bundle.transportation[0] as unknown as Record<string, unknown>;
    expect(row.transitSummary).toBe("true");
    expect(row.nonstopUsService).toBe("false");
    expect(row.verified).toBe("true");
  });
});

describe("REQUIRED TEST 5 - positioned row ordering", () => {
  it("sorts positioned modules deterministically by position while keeping data intact", () => {
    const input = baseInput({
      replaceModules: {
        ...EMPTY_REPLACE_MODULES,
        communitySocial: [
          { destinationId: "test-dest-id", destinationKey: "test-dest", position: 3, summary: "third", socialNotes: null, expatPresence: null, volunteering: null, easeMeetingPeople: null, ageMix: null, transientVsRooted: null, verified: null, verifiedAt: null },
          { destinationId: "test-dest-id", destinationKey: "test-dest", position: 1, summary: "first", socialNotes: null, expatPresence: null, volunteering: null, easeMeetingPeople: null, ageMix: null, transientVsRooted: null, verified: null, verifiedAt: null },
          { destinationId: "test-dest-id", destinationKey: "test-dest", position: 2, summary: "second", socialNotes: null, expatPresence: null, volunteering: null, easeMeetingPeople: null, ageMix: null, transientVsRooted: null, verified: null, verifiedAt: null },
        ],
      },
    });

    const bundle = normalizePersistedDestinationRows(input);
    expect(bundle.communitySocial.map((row) => row.summary)).toEqual(["first", "second", "third"]);
  });
});

describe("REQUIRED TEST 6 - no cross-module contamination", () => {
  it("keeps each module's fields isolated from every other module's output", () => {
    const input = baseInput({
      replaceModules: {
        ...EMPTY_REPLACE_MODULES,
        visaResidency: [REPLACE_MODULE_FIXTURES.visaResidency.row],
        housing: [REPLACE_MODULE_FIXTURES.housing.row],
      },
      keyedChildren: {
        ...EMPTY_KEYED_CHILDREN,
        scores: [REPLACE_MODULE_FIXTURES.scores.row],
      },
    });

    const bundle = normalizePersistedDestinationRows(input) as unknown as Record<string, ReadonlyArray<Record<string, unknown>>>;

    expect(bundle.visaResidency[0].travelerNationality).toBe("visaResidency:travelerNationality");
    expect(bundle.visaResidency[0]).not.toHaveProperty("canForeignersBuy");
    expect(bundle.housing[0].canForeignersBuy).toBe("housing:canForeignersBuy");
    expect(bundle.housing[0]).not.toHaveProperty("travelerNationality");
    expect(bundle.scores[0].scoreValue).toBe("scores:scoreValue");
    expect(bundle.scores[0]).not.toHaveProperty("travelerNationality");
    expect(bundle.scores[0]).not.toHaveProperty("canForeignersBuy");
  });
});

describe("preserved semantic behaviors (not pass-through, must remain exact)", () => {
  it("still merges identity.name from root, falling back to profile.identityName", () => {
    const input = baseInput({ root: { ...BASE_ROOT, name: null }, profile: { ...BASE_PROFILE, identityName: "Fallback Name" } });
    expect(normalizePersistedDestinationRows(input).identity.name).toBe("Fallback Name");
  });

  it("still collapses an empty singleton array to null", () => {
    const input = baseInput();
    expect(normalizePersistedDestinationRows(input).environmentQuality).toBeNull();
    expect(normalizePersistedDestinationRows(input).dailyLifePracticality).toBeNull();
  });

  it("still surfaces a populated singleton row with persistence identity omitted", () => {
    const input = baseInput({
      singletons: {
        environmentQuality: [{ destinationId: "test-dest-id", destinationKey: "test-dest", summary: "Good air", qualityNotes: "Clean" }],
        dailyLifePracticality: [],
      },
    });
    expect(normalizePersistedDestinationRows(input).environmentQuality).toEqual({ summary: "Good air", qualityNotes: "Clean" });
  });

  it("does not alter scoreKey identity semantics", () => {
    const input = baseInput({ keyedChildren: { ...EMPTY_KEYED_CHILDREN, scores: [REPLACE_MODULE_FIXTURES.scores.row] } });
    expect(normalizePersistedDestinationRows(input).scores[0].scoreKey).toBe("s1");
  });
});
