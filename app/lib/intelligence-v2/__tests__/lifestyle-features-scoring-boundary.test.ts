import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport } from "../workbook-v32-adapter";
import { evaluateDestinationForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Phase 4 scoring-boundary proof: LIFESTYLE_FEATURES (v3.3, additive, display-only) rows must
 * NEVER affect Intelligence v2 eligibility, affordability, lifestyle-fit scoring, or the final
 * recommendation/ranking order in this phase. This is not connected to matching yet - a real
 * destination's engine facts and every layer's evaluated result must be byte-for-byte identical
 * whether or not its lifestyleFeatures rows are present.
 *
 * Real workbook -> real parser -> real adapter -> real orchestrator, no mocks in the chain.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.3.xlsx");
const DESTINATION_KEY = "the-villages-fl-us";

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 5500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

describe("Scoring boundary: LIFESTYLE_FEATURES rows never affect Intelligence v2 (Phase 4, not yet connected to matching)", () => {
  it("the real v3.3 workbook actually has non-empty lifestyleFeatures for this destination (the test is meaningful, not vacuous)", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === DESTINATION_KEY);
    expect(canonical).toBeDefined();
    expect(canonical!.lifestyleFeatures.length).toBeGreaterThan(0);
  });

  it("adapted Intelligence v2 facts are byte-for-byte identical whether lifestyleFeatures rows are present or stripped to empty", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === DESTINATION_KEY)!;

    const withLifestyleFeatures = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [canonical] }, DESTINATION_KEY);
    const withoutLifestyleFeatures = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [{ ...canonical, lifestyleFeatures: [] }] }, DESTINATION_KEY);

    expect(withLifestyleFeatures).not.toBeNull();
    expect(withoutLifestyleFeatures).not.toBeNull();
    expect(withLifestyleFeatures!.mappingErrors).toEqual([]);
    expect(withoutLifestyleFeatures!.mappingErrors).toEqual([]);
    expect(withLifestyleFeatures!.facts).toEqual(withoutLifestyleFeatures!.facts);
  });

  it("eligibility, affordability, lifestyle-fit score, and the final recommendation/ranking value are all identical with vs. without lifestyleFeatures, across multiple representative profiles", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === DESTINATION_KEY)!;

    const factsWith = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [canonical] }, DESTINATION_KEY)!.facts;
    const factsWithout = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [{ ...canonical, lifestyleFeatures: [] }] }, DESTINATION_KEY)!.facts;

    const profiles = [
      makeProfile(),
      makeProfile({ budget: { monthlyTargetAmount: 2000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" } }),
      makeProfile({ activityMode: "DIGITAL_NOMAD", tenureIntent: "BUY" }),
      makeProfile({ household: { type: "COUPLE", dependentCount: 2, spouseOrPartnerAccompanying: true } }),
    ];

    for (const profile of profiles) {
      const resultWith = evaluateDestinationForProfile(profile, factsWith);
      const resultWithout = evaluateDestinationForProfile(profile, factsWithout);
      expect(resultWith).toEqual(resultWithout);
    }
  });

  it("this destination's recommendationStatus and sortRankingValue - the two fields that actually drive recommendation/ranking order - are unaffected by lifestyleFeatures", async () => {
    const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
    const canonical = (workbookImport.canonicalDestinations ?? []).find((d) => d.identity.destinationKey === DESTINATION_KEY)!;

    const factsWith = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [canonical] }, DESTINATION_KEY)!.facts;
    const factsWithout = buildIntelligenceV2FactsFromWorkbookImport({ canonicalDestinations: [{ ...canonical, lifestyleFeatures: [] }] }, DESTINATION_KEY)!.facts;

    const profile = makeProfile();
    const resultWith = evaluateDestinationForProfile(profile, factsWith);
    const resultWithout = evaluateDestinationForProfile(profile, factsWithout);

    expect(resultWith.recommendationStatus).toBe(resultWithout.recommendationStatus);
    expect(resultWith.sortRankingValue).toEqual(resultWithout.sortRankingValue);
  });
});
