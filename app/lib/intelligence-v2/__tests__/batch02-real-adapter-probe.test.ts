import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport, type IntelligenceV2DestinationFacts } from "../workbook-v32-adapter";
import { evaluateEligibility } from "../eligibility-evaluator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Batch #2 real adapter/parser probe — runs the REAL deterministic parser +
 * REAL workbook-v32 adapter (no mocks) against the real, repo-resident Batch
 * #2 workbook (R1) to prove destination isolation, permanent-key identity, no
 * fallback content, no cross-contamination, valid short/long-stay row
 * selection, conditional-property-purchase semantics, and preservation of
 * explicit UNKNOWN values, for all five Batch #2 destinations.
 *
 * This is validation, not tuning: every pinned assertion below reflects the
 * engine's actual observed output for the real workbook content.
 */

const BATCH02_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_02_5_Destinations_v3.2.xlsx");
const EXPECTED_SHA256 = "347afe628d5ceb3bbf0bc1b0b44a358b24bf575214946b40f4297fd3b6a80fe1";

const APPROVED_KEYS = ["ascoli-piceno-it", "sarande-al", "dumaguete-ph", "las-terrenas-do", "fairhope-al-us"] as const;
type ApprovedKey = (typeof APPROVED_KEYS)[number];

const FOREIGN_KEYS = [
  "lisbon-pt",
  "summerlin-nv-us",
  "new-braunfels-tx-us",
  "the-villages-fl-us",
  "sofia-bg",
  "puerto-vallarta-mx",
  "hoi-an-vn",
  "queenstown-nz",
];

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

const EXPECTED_NEIGHBORHOOD_COUNTS: Record<ApprovedKey, number> = {
  "ascoli-piceno-it": 7,
  "sarande-al": 6,
  "dumaguete-ph": 7,
  "las-terrenas-do": 7,
  "fairhope-al-us": 7,
};
const EXPECTED_PLACE_COUNTS: Record<ApprovedKey, number> = {
  "ascoli-piceno-it": 20,
  "sarande-al": 20,
  "dumaguete-ph": 20,
  "las-terrenas-do": 20,
  "fairhope-al-us": 24,
};
const EXPECTED_MEDIA_COUNTS: Record<ApprovedKey, number> = {
  "ascoli-piceno-it": 5,
  "sarande-al": 5,
  "dumaguete-ph": 5,
  "las-terrenas-do": 5,
  "fairhope-al-us": 5,
};
const EXPECTED_SOURCE_COUNTS: Record<ApprovedKey, number> = {
  "ascoli-piceno-it": 9,
  "sarande-al": 21,
  "dumaguete-ph": 16,
  "las-terrenas-do": 17,
  "fairhope-al-us": 17,
};

const EXPECTED_COUNTRY_CODES: Record<ApprovedKey, string> = {
  "ascoli-piceno-it": "IT",
  "sarande-al": "AL",
  "dumaguete-ph": "PH",
  "las-terrenas-do": "DO",
  "fairhope-al-us": "US",
};

const EXPECTED_COST_RANGES: Record<ApprovedKey, { low: number; high: number; currencyCode: string }> = {
  "ascoli-piceno-it": { low: 2200, high: 3000, currencyCode: "EUR" },
  "sarande-al": { low: 1850, high: 2650, currencyCode: "EUR" },
  "dumaguete-ph": { low: 85000, high: 130000, currencyCode: "PHP" },
  "las-terrenas-do": { low: 2250, high: 3400, currencyCode: "USD" },
  "fairhope-al-us": { low: 4500, high: 6500, currencyCode: "USD" },
};

const EXPECTED_ENTRY_AND_STAY: Record<ApprovedKey, IntelligenceV2DestinationFacts["entryAndStay"]> = {
  "ascoli-piceno-it": {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "YES",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "NO",
    propertyPurchaseConditionalPathAvailable: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  "sarande-al": {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "YES",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "NO",
    propertyPurchaseConditionalPathAvailable: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  "dumaguete-ph": {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 30,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "NO",
    propertyPurchaseConditionalPathAvailable: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  "las-terrenas-do": {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 30,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseConditionalPathAvailable: "UNKNOWN",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  "fairhope-al-us": {
    touristEntryAllowed: "UNKNOWN",
    touristStayLimitDays: null,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "NO",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "YES",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseConditionalPathAvailable: "UNKNOWN",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
};

const EXPECTED_HARD_GATES: Record<ApprovedKey, IntelligenceV2DestinationFacts["hardGates"]> = {
  "ascoli-piceno-it": { beachAccess: "NEARBY", mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY", healthcareStandard: "GOOD_PRIVATE_AVAILABLE", safetyStandard: "UNKNOWN", lgbtqLegalProtectionStatus: "UNKNOWN" },
  "sarande-al": { beachAccess: "DIRECT_ACCESS", mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY", healthcareStandard: "GOOD_PRIVATE_AVAILABLE", safetyStandard: "MODERATE_OR_BETTER", lgbtqLegalProtectionStatus: "UNKNOWN" },
  "dumaguete-ph": { beachAccess: "NEARBY", mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY", healthcareStandard: "GOOD_PRIVATE_AVAILABLE", safetyStandard: "UNKNOWN", lgbtqLegalProtectionStatus: "UNKNOWN" },
  "las-terrenas-do": { beachAccess: "DIRECT_ACCESS", mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY", healthcareStandard: "GOOD_PRIVATE_AVAILABLE", safetyStandard: "UNKNOWN", lgbtqLegalProtectionStatus: "UNKNOWN" },
  "fairhope-al-us": { beachAccess: "DIRECT_ACCESS", mountainOrSkiAccess: "NONE", healthcareStandard: "GOOD_PRIVATE_AVAILABLE", safetyStandard: "UNKNOWN", lgbtqLegalProtectionStatus: "UNKNOWN" },
};

const EXPECTED_FINANCIAL_TREATMENT: Record<ApprovedKey, { pensionTreatment: string; socialSecurityTreatment: string; iraTreatment: string; retirementAccount401kTreatment: string }> = {
  "ascoli-piceno-it": { pensionTreatment: "UNKNOWN", socialSecurityTreatment: "UNKNOWN", iraTreatment: "UNKNOWN", retirementAccount401kTreatment: "UNKNOWN" },
  "sarande-al": { pensionTreatment: "UNKNOWN", socialSecurityTreatment: "UNKNOWN", iraTreatment: "UNKNOWN", retirementAccount401kTreatment: "UNKNOWN" },
  "dumaguete-ph": { pensionTreatment: "UNKNOWN", socialSecurityTreatment: "UNKNOWN", iraTreatment: "UNKNOWN", retirementAccount401kTreatment: "UNKNOWN" },
  "las-terrenas-do": { pensionTreatment: "UNKNOWN", socialSecurityTreatment: "UNKNOWN", iraTreatment: "UNKNOWN", retirementAccount401kTreatment: "UNKNOWN" },
  "fairhope-al-us": { pensionTreatment: "UNKNOWN", socialSecurityTreatment: "EXEMPT", iraTreatment: "UNKNOWN", retirementAccount401kTreatment: "UNKNOWN" },
};

let workbookHashBefore: string;
let aliasResolution: Record<string, string> = {};
const canonicalByKey = new Map<ApprovedKey, DeterministicV31CanonicalDestination>();
const factsByKey = new Map<ApprovedKey, IntelligenceV2DestinationFacts>();
const mappingErrorsByKey = new Map<ApprovedKey, readonly unknown[]>();

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH02_PATH);
  expect(workbookHashBefore).toBe(EXPECTED_SHA256);

  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  expect(workbookImport.canonicalDestinations?.length).toBe(5);
  aliasResolution = (workbookImport.diagnostics?.aliasResolution ?? {}) as Record<string, string>;

  for (const key of APPROVED_KEYS) {
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === key);
    expect(canonical).toBeDefined();
    canonicalByKey.set(key, canonical!);

    const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, key);
    expect(adapted).not.toBeNull();
    factsByKey.set(key, adapted!.facts);
    mappingErrorsByKey.set(key, adapted!.mappingErrors);
  }
});

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "BUY",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

describe("Batch #2 real adapter/parser probe (R1) — isolation, identity, no-fallback, short/long-stay selection, conditional property, UNKNOWN preservation", () => {
  it("keeps the real Batch #2 workbook byte-for-byte unchanged after all probe runs", () => {
    expect(sha256(BATCH02_PATH)).toBe(workbookHashBefore);
    expect(sha256(BATCH02_PATH)).toBe(EXPECTED_SHA256);
  });

  it("parses with zero validation errors and exactly 5 canonical destinations", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH02_PATH);
    expect(workbookImport.validationErrors).toEqual([]);
    expect(workbookImport.contractVersion).toBe("3.2");
    expect(workbookImport.canonicalDestinations?.map((d) => d.identity.destinationKey).sort()).toEqual([...APPROVED_KEYS].sort());
  });

  describe("permanent-key identity", () => {
    for (const key of APPROVED_KEYS) {
      it(`${key}: canonical destinationKey identity is stable and exact`, () => {
        expect(canonicalByKey.get(key)!.identity.destinationKey).toBe(key);
      });
    }

    it("DESTINATION_ALIASES resolves routing aliases to their correct destination_key without ever changing identity", () => {
      expect(aliasResolution["sarande-albania"]).toBe("sarande-al");
      expect(aliasResolution["ascoli-piceno-italy"]).toBe("ascoli-piceno-it");
      expect(aliasResolution["dumaguete-philippines"]).toBe("dumaguete-ph");
      expect(aliasResolution["las-terrenas-dominican-republic"]).toBe("las-terrenas-do");
      expect(aliasResolution["fairhope-alabama"]).toBe("fairhope-al-us");
    });
  });

  describe("destination isolation / no cross-contamination", () => {
    for (const key of APPROVED_KEYS) {
      it(`${key}: every scoped child row (neighborhoods, places, media, sources, visa, housing, taxes) belongs only to this destination_key`, () => {
        const canonical = canonicalByKey.get(key)!;
        const arraysToCheck: Array<readonly { destination_key?: string | null }[]> = [
          canonical.neighborhoods,
          canonical.places,
          canonical.media,
          canonical.sources,
          canonical.visaResidency,
          canonical.housing,
          canonical.taxesFinance,
          canonical.costOfLiving,
          canonical.facts,
        ];
        for (const rows of arraysToCheck) {
          for (const row of rows) {
            expect(row.destination_key).toBe(key);
          }
        }
      });

      it(`${key}: no row anywhere references a Batch #1, Master/pilot, or legacy destination_key`, () => {
        const canonical = canonicalByKey.get(key)!;
        const arraysToCheck: Array<readonly { destination_key?: string | null }[]> = [
          canonical.neighborhoods,
          canonical.places,
          canonical.media,
          canonical.sources,
          canonical.visaResidency,
          canonical.housing,
          canonical.taxesFinance,
        ];
        for (const rows of arraysToCheck) {
          for (const row of rows) {
            expect(FOREIGN_KEYS).not.toContain(row.destination_key);
          }
        }
      });

      it(`${key}: neighborhood/place/media/source row counts exactly match the manifest (no leakage, no truncation)`, () => {
        const canonical = canonicalByKey.get(key)!;
        expect(canonical.neighborhoods.length).toBe(EXPECTED_NEIGHBORHOOD_COUNTS[key]);
        expect(canonical.places.length).toBe(EXPECTED_PLACE_COUNTS[key]);
        expect(canonical.media.length).toBe(EXPECTED_MEDIA_COUNTS[key]);
        expect(canonical.sources.length).toBe(EXPECTED_SOURCE_COUNTS[key]);
      });

      it(`${key}: every place's neighborhood_key (if present) resolves to a neighborhood owned by this same destination`, () => {
        const canonical = canonicalByKey.get(key)!;
        const ownNeighborhoodKeys = new Set(canonical.neighborhoods.map((n) => n.neighborhood_key));
        for (const place of canonical.places) {
          if (place.neighborhood_key) {
            expect(ownNeighborhoodKeys.has(place.neighborhood_key)).toBe(true);
          }
        }
      });
    }

    it("total child-row counts across the batch match the manifest totals (34 neighborhoods, 104 places, 25 media, 80 sources)", () => {
      let neighborhoods = 0, places = 0, media = 0, sources = 0;
      for (const key of APPROVED_KEYS) {
        const canonical = canonicalByKey.get(key)!;
        neighborhoods += canonical.neighborhoods.length;
        places += canonical.places.length;
        media += canonical.media.length;
        sources += canonical.sources.length;
      }
      expect(neighborhoods).toBe(34);
      expect(places).toBe(104);
      expect(media).toBe(25);
      expect(sources).toBe(80);
    });
  });

  describe("no fallback content", () => {
    for (const key of APPROVED_KEYS) {
      it(`${key}: DESTINATION_SCORES is intentionally blank -> dimensionValues is empty, never a fabricated/inherited score`, () => {
        expect(factsByKey.get(key)!.lifestyleDimensions.dimensionValues).toEqual({});
      });
    }
  });

  describe("valid short/long-stay VISA_RESIDENCY row selection (the R1 fix)", () => {
    for (const key of APPROVED_KEYS) {
      it(`${key}: real workbook facts match the exact expected entryAndStay values (no field silently collapsed to UNKNOWN)`, () => {
        expect(factsByKey.get(key)!.entryAndStay).toEqual(EXPECTED_ENTRY_AND_STAY[key]);
      });

      it(`${key}: zero mapping errors (VISA_RESIDENCY, DESTINATIONS enum, and TAXES_FINANCE enum fixes all hold)`, () => {
        expect(mappingErrorsByKey.get(key)!).toEqual([]);
      });
    }
  });

  describe("hard gates, financial treatment (UNKNOWN preservation), and cost", () => {
    for (const key of APPROVED_KEYS) {
      it(`${key}: hardGates resolve to their exact real values`, () => {
        expect(factsByKey.get(key)!.hardGates).toEqual(EXPECTED_HARD_GATES[key]);
      });

      it(`${key}: retirement-income treatment fields preserve explicit UNKNOWN rather than guessing a favorable/unfavorable classification`, () => {
        const financial = factsByKey.get(key)!.financial;
        expect(financial.pensionTreatment).toBe(EXPECTED_FINANCIAL_TREATMENT[key].pensionTreatment);
        expect(financial.socialSecurityTreatment).toBe(EXPECTED_FINANCIAL_TREATMENT[key].socialSecurityTreatment);
        expect(financial.iraTreatment).toBe(EXPECTED_FINANCIAL_TREATMENT[key].iraTreatment);
        expect(financial.retirementAccount401kTreatment).toBe(EXPECTED_FINANCIAL_TREATMENT[key].retirementAccount401kTreatment);
      });

      it(`${key}: cost range and household size resolve from the real COST_OF_LIVING row`, () => {
        const facts = factsByKey.get(key)!;
        expect(facts.cost.estimatedMonthlyCostRange).toEqual(EXPECTED_COST_RANGES[key]);
        expect(facts.cost.householdSizeAssumedForEstimate).toBe(2);
      });

      it(`${key}: countryCode matches the real DESTINATIONS row`, () => {
        expect(factsByKey.get(key)!.countryCode).toBe(EXPECTED_COUNTRY_CODES[key]);
      });
    }
  });

  describe("conditional foreign-property-purchase semantics (Checkpoint C decision table, real data)", () => {
    function permissiveProfile(): UserProfileV2 {
      return makeProfile({
        hardRequirements: {
          ...createHardRequirementSelectionsWithNoneActivated(),
          foreignPropertyPurchaseEssential: true,
          propertyOwnershipRequirement: "ANY_LEGAL_RESIDENTIAL_PROPERTY",
        },
      });
    }
    function strictProfile(): UserProfileV2 {
      return makeProfile({
        hardRequirements: {
          ...createHardRequirementSelectionsWithNoneActivated(),
          foreignPropertyPurchaseEssential: true,
          propertyOwnershipRequirement: "UNRESTRICTED_FREEHOLD",
        },
      });
    }

    it("ascoli-piceno-it: NO + conditional YES -> permissive PASS, strict FAIL (never fabricates unrestricted ownership)", () => {
      const facts = factsByKey.get("ascoli-piceno-it")!;
      expect(evaluateEligibility(permissiveProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "PASS",
        reasonCode: "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE",
      });
      expect(evaluateEligibility(strictProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "FAIL",
        reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP",
      });
    });

    it("sarande-al: NO + conditional YES -> permissive PASS, strict FAIL (never fabricates unrestricted ownership)", () => {
      const facts = factsByKey.get("sarande-al")!;
      expect(evaluateEligibility(permissiveProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "PASS",
        reasonCode: "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE",
      });
      expect(evaluateEligibility(strictProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "FAIL",
        reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP",
      });
    });

    it("dumaguete-ph: NO + conditional YES -> permissive PASS, strict FAIL (Wave 1 correction: land ownership is restricted, condo ownership is the qualifying path per RA 4726)", () => {
      const facts = factsByKey.get("dumaguete-ph")!;
      expect(evaluateEligibility(permissiveProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "PASS",
        reasonCode: "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE",
      });
      expect(evaluateEligibility(strictProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "FAIL",
        reasonCode: "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP",
      });
    });

    it("las-terrenas-do: YES + conditional UNKNOWN -> PASS for both permissive and strict (unrestricted ownership genuinely allowed)", () => {
      const facts = factsByKey.get("las-terrenas-do")!;
      expect(evaluateEligibility(permissiveProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({ status: "PASS" });
      expect(evaluateEligibility(strictProfile(), facts).criteria.foreignPropertyPurchaseRights).toMatchObject({
        status: "PASS",
        reasonCode: "FOREIGN_PROPERTY_PURCHASE_ALLOWED",
      });
    });

    it("fairhope-al-us: a US-citizen buyer relocating within the US is DOMESTIC -> the foreign-purchaser gate correctly does not apply (null, not fabricated PASS/FAIL)", () => {
      const facts = factsByKey.get("fairhope-al-us")!;
      expect(evaluateEligibility(permissiveProfile(), facts).criteria.foreignPropertyPurchaseRights).toBeNull();
      expect(evaluateEligibility(strictProfile(), facts).criteria.foreignPropertyPurchaseRights).toBeNull();
    });
  });
});
