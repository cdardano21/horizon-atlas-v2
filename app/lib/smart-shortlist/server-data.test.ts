import { describe, expect, it, vi } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY, type ExpansionWorkbookRegistryEntry } from "../expansion-workbook-registry";
import type { DeterministicV31CanonicalLifestyleFeature } from "../workbook-v31-deterministic-core";
import { evaluateShortlist } from "./evaluator";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";
import { coastalSettingFromLifestyleFeatures, loadSmartShortlistData } from "./server-data";
import { smartShortlistCandidates } from "./cohort";
import { hasRequiredSkiAccess } from "../intelligence-v2/ski-access";
import { hasRequiredOceanBeach } from "../intelligence-v2/beach-access";

vi.mock("../supabase", async (importOriginal) => ({
  ...await importOriginal<typeof import("../supabase")>(),
  isSupabaseConfigured: () => false,
}));

// The offline baseline has no publication evidence. Only seed candidates and
// ordinary preview entries can contribute keys; published-catalog entries cannot.
function expectedOfflineKeys(registry: readonly ExpansionWorkbookRegistryEntry[]) {
  return [...new Set([
    ...smartShortlistCandidates.map((candidate) => candidate.key),
    ...registry.filter((entry) => entry.environment === "preview"
      && entry.candidateDiscovery !== "published-catalog")
      .flatMap((entry) => entry.expectedDestinationKeys),
  ])].sort();
}

function coastalRow(overrides: Partial<DeterministicV31CanonicalLifestyleFeature> = {}): DeterministicV31CanonicalLifestyleFeature {
  return {
    destination_key: "fixture",
    record_key: "fixture-coastal",
    feature_group: "natural_setting",
    feature_key: "coastal_setting",
    feature_value: "NOT_APPLICABLE",
    availability_level: "UNKNOWN",
    proximity_band: "UNKNOWN",
    display_label: "Coastal setting",
    evidence_summary: null,
    source_name: null,
    source_url: null,
    source_as_of_date: null,
    confidence: null,
    matching_enabled: "YES",
    display_enabled: "YES",
    notes: null,
    ...overrides,
  };
}

describe("Smart Shortlist server facts", () => {
  it("normalizes only explicit structured coastal values", () => {
    expect(coastalSettingFromLifestyleFeatures([coastalRow({ feature_value: "COASTAL" })])).toBe("COASTAL");
    expect(coastalSettingFromLifestyleFeatures([coastalRow({ availability_level: "STRONG", proximity_band: "IN_DESTINATION" })])).toBe("COASTAL");
    expect(coastalSettingFromLifestyleFeatures([coastalRow({ availability_level: "NONE" })])).toBe("INLAND");
    expect(coastalSettingFromLifestyleFeatures([coastalRow({ availability_level: "STRONG", proximity_band: "UNKNOWN" })])).toBe("UNKNOWN");
    expect(coastalSettingFromLifestyleFeatures([coastalRow({ matching_enabled: "NO", availability_level: "STRONG", proximity_band: "IN_DESTINATION" })])).toBe("UNKNOWN");
    expect(coastalSettingFromLifestyleFeatures([])).toBe("UNKNOWN");
  });

  it("loads exactly the seed and eligible preview keys through the workbook and V2 adapters", async () => {
    const { candidates, intelligence } = await loadSmartShortlistData();
    const candidateKeys = candidates.map((candidate) => candidate.key);
    expect(candidateKeys.slice().sort()).toEqual(expectedOfflineKeys(EXPANSION_WORKBOOK_REGISTRY));
    expect(new Set(candidateKeys).size).toBe(candidateKeys.length);
    expect(intelligence.map((item) => item.key).sort()).toEqual(candidates.map((item) => item.key).sort());
    expect(intelligence.find((item) => item.key === "queenstown-nz")).toMatchObject({
      beachAccess: "DIRECT_ACCESS",
      mountainAccess: "SKI_RESORT_ACCESS",
      oceanAccess: "INLAND",
      healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
      safetyStandard: "MODERATE_OR_BETTER",
      lgbtqLegalProtectionStatus: "UNKNOWN",
      entryAndStay: {
        extendedStayOrLongStayVisaAvailable: expect.any(String),
        permanentResidencyPathAvailable: expect.any(String),
        retirementVisaProgramAvailable: expect.any(String),
        remoteWorkOrDigitalNomadVisaAvailable: expect.any(String),
      },
    });
    expect(intelligence.find((item) => item.key === "puerto-vallarta-mx")?.oceanAccess).toBe("COASTAL");
    expect(intelligence.every((item) => item.healthcareStandard && item.safetyStandard
      && item.lgbtqLegalProtectionStatus && item.entryAndStay)).toBe(true);
  }, 15_000);

  it("selects the canonical destination hero from media in the existing workbook pass", async () => {
    const { candidates, intelligence, destinationMedia } = await loadSmartShortlistData();
    const mediaByKey = new Map(destinationMedia.map((item) => [item.key, item.heroImage]));

    expect(intelligence.map((item) => item.key).sort()).toEqual(candidates.map((item) => item.key).sort());
    expect(destinationMedia.map((item) => item.key).sort()).toEqual(candidates.map((item) => item.key).sort());
    expect(destinationMedia.every((item) => item.heroImage?.src && item.heroImage.alt)).toBe(true);
    expect(mediaByKey.get("ajijic-mexico")?.src).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/Ajijic%20%28julio%20de%202025%29%202.jpg");
    expect(mediaByKey.get("fairhope-al-us")?.src).toBe("https://commons.wikimedia.org/wiki/Special:Redirect/file/Fairhope_Pier.JPG");
    expect(mediaByKey.get("hoi-an-vn")?.src).toBe("https://commons.wikimedia.org/wiki/Special:FilePath/Japanese_bridge_Hoi_An.jpg");
  }, 15_000);

  it("does not activate destinations from an unregistered workbook", async () => {
    const full = await loadSmartShortlistData();
    const registryWithoutNext20 = EXPANSION_WORKBOOK_REGISTRY.filter((entry) => entry.registryId !== "next-batch-20-private-import-authorized");
    const { candidates, affordabilityRecords } = await loadSmartShortlistData(registryWithoutNext20);

    const expectedFull = expectedOfflineKeys(EXPANSION_WORKBOOK_REGISTRY);
    const expectedReduced = expectedOfflineKeys(registryWithoutNext20);
    const removedKeys = expectedFull.filter((key) => !expectedReduced.includes(key));
    const next20 = EXPANSION_WORKBOOK_REGISTRY.find((entry) => entry.registryId === "next-batch-20-private-import-authorized")!;
    expect(removedKeys).toEqual([...next20.expectedDestinationKeys].sort());
    expect(full.candidates.map((candidate) => candidate.key).sort()).toEqual(expectedFull);
    expect(candidates.map((candidate) => candidate.key).sort()).toEqual(expectedReduced);
    expect(full.candidates.filter((candidate) => !candidates.some((item) => item.key === candidate.key))
      .map((candidate) => candidate.key).sort()).toEqual(removedKeys);
    expect(full.affordabilityRecords.filter((record) => removedKeys.includes(record.destinationKey))
      .map((record) => record.destinationKey).sort()).toEqual(removedKeys);
    expect(affordabilityRecords).toEqual(full.affordabilityRecords
      .filter((record) => !removedKeys.includes(record.destinationKey)));
    expect(candidates.some((candidate) => candidate.key === "tivat-montenegro")).toBe(false);
    expect(affordabilityRecords.some((record) => record.destinationKey === "tivat-montenegro")).toBe(false);
  }, 30_000);

  it("enforces the supported hard-requirement scenarios across the offline registry cohort", async () => {
    const { candidates, intelligence } = await loadSmartShortlistData();
    const byKey = new Map(intelligence.map((item) => [item.key, item]));
    const destinations = candidates.map((candidate) => ({ ...candidate, ...byKey.get(candidate.key) }));

    expect(destinations.map((destination) => destination.key).sort()).toEqual(expectedOfflineKeys(EXPANSION_WORKBOOK_REGISTRY));
    expect(destinations.filter((candidate) => EXPANSION_WORKBOOK_REGISTRY.find((entry) => entry.registryId === "next-batch-20-private-import-authorized")?.expectedDestinationKeys.includes(candidate.key))).toHaveLength(20);

    const usOnly = evaluateShortlist(destinations, { includedCountries: ["US"] });
    expect(usOnly.filter((result) => result.group !== "EXCLUDED").every((result) => result.destination.countryCode === "US")).toBe(true);
    expect(usOnly.filter((result) => result.destination.countryCode !== "US").every((result) => result.group === "EXCLUDED")).toBe(true);

    const outsideUs = evaluateShortlist(destinations, { excludedCountries: ["US"] });
    expect(outsideUs.filter((result) => result.group !== "EXCLUDED").every((result) => result.destination.countryCode !== "US")).toBe(true);
    expect(outsideUs.filter((result) => result.destination.countryCode === "US").every((result) => result.group === "EXCLUDED")).toBe(true);

    const ski = evaluateShortlist(destinations, { mountain: "SKI_RESORT_ACCESS", requireMountain: true });
    expect(ski.some((result) => hasRequiredSkiAccess(result.destination.skiAccess))).toBe(true);
    expect(ski.some((result) => !hasRequiredSkiAccess(result.destination.skiAccess))).toBe(true);
    for (const result of ski) {
      const qualifies = hasRequiredSkiAccess(result.destination.skiAccess);
      expect(result.reasons, result.destination.key).toContainEqual(expect.objectContaining({
        capability: "mountain",
        state: qualifies ? "PASS" : "FAIL",
      }));
      expect(result.group, result.destination.key).toBe(qualifies ? "MEETS_FILTERS" : "EXCLUDED");
    }

    const ocean = evaluateShortlist(destinations, { beach: "OCEAN_COASTAL", requireBeach: true });
    expect(ocean.find((result) => result.destination.key === "queenstown-nz")?.group).toBe("EXCLUDED");
    expect(ocean.some((result) => hasRequiredOceanBeach(result.destination.beachEvidence, false))).toBe(true);
    expect(ocean.some((result) => !hasRequiredOceanBeach(result.destination.beachEvidence, false))).toBe(true);
    for (const result of ocean) {
      const qualifies = hasRequiredOceanBeach(result.destination.beachEvidence, false);
      expect(result.reasons, result.destination.key).toContainEqual(expect.objectContaining({
        capability: "ocean",
        state: qualifies ? "PASS" : "FAIL",
      }));
      expect(result.group, result.destination.key).toBe(qualifies ? "MEETS_FILTERS" : "EXCLUDED");
    }

    const essential = evaluateShortlist(destinations, {
      healthcare: { mode: "MUST_HAVE", minimum: "GOOD_PRIVATE_AVAILABLE" },
      safety: { mode: "MUST_HAVE", minimum: "MODERATE_OR_BETTER" },
      lgbtqLegalSafety: { mode: "MUST_HAVE" },
      documentedLongStayPath: { mode: "MUST_HAVE" },
    });
    expect(essential.every((result) => result.group !== "MEETS_FILTERS"
      || result.reasons.filter((reason) => ["healthcare", "safety", "lgbtq", "legalPath"].includes(reason.capability))
        .every((reason) => reason.state === "PASS"))).toBe(true);
    expect(essential.some((result) => result.group === "NEEDS_VERIFICATION")).toBe(true);

    const budget = evaluateShortlistWithOwnedAffordability(destinations, {}, { amountUsd: 2_000, household: "single", require: true });
    expect(budget.filter((result) => result.affordabilityDecision?.state === "OVER_BUDGET").every((result) => result.group === "EXCLUDED")).toBe(true);

    const affordableInternationalCouple = evaluateShortlistWithOwnedAffordability(destinations, {
      excludedCountries: ["US"],
      healthcare: { mode: "IMPORTANT_PREFERENCE", minimum: "GOOD_PRIVATE_AVAILABLE" },
      safety: { mode: "IMPORTANT_PREFERENCE", minimum: "MODERATE_OR_BETTER" },
      documentedLongStayPath: { mode: "MUST_HAVE" },
    }, { amountUsd: 2_500, household: "couple", require: true });
    expect(affordableInternationalCouple.find((result) => result.destination.key === "cuenca-ecuador")).toMatchObject({
      group: "NEEDS_VERIFICATION",
      affordabilityDecision: { state: "CLOSE_TO_BUDGET", estimatedMonthlyUsd: 2_550 },
    });
    expect(affordableInternationalCouple.find((result) => result.destination.key === "hua-hin-thailand")).toMatchObject({
      group: "NEEDS_VERIFICATION",
      affordabilityDecision: { state: "CLOSE_TO_BUDGET", estimatedMonthlyUsd: 2_700 },
    });
    expect(affordableInternationalCouple.filter((result) => result.group === "EXCLUDED")
      .every((result) => result.reasons.some((reason) => reason.state === "FAIL"))).toBe(true);
  }, 15_000);
});
