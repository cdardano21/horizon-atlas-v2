import { describe, expect, it } from "vitest";
import type { DeterministicV31CanonicalLifestyleFeature } from "../workbook-v31-deterministic-core";
import { smartShortlistCandidates } from "./cohort";
import { evaluateShortlist } from "./evaluator";
import { evaluateShortlistWithOwnedAffordability } from "./owned-affordability-evaluator";
import { coastalSettingFromLifestyleFeatures, loadSmartShortlistIntelligence } from "./server-data";

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

  it("loads exactly the canonical 36 keys through the workbook and V2 adapters", async () => {
    const intelligence = await loadSmartShortlistIntelligence();
    expect(intelligence).toHaveLength(36);
    expect(intelligence.map((item) => item.key).sort()).toEqual(smartShortlistCandidates.map((item) => item.key).sort());
    expect(intelligence.find((item) => item.key === "queenstown-nz")).toMatchObject({
      beachAccess: "DIRECT_ACCESS",
      mountainAccess: "SKI_RESORT_ACCESS",
      oceanAccess: "INLAND",
    });
    expect(intelligence.find((item) => item.key === "puerto-vallarta-mx")?.oceanAccess).toBe("COASTAL");
  }, 15_000);

  it("enforces the supported hard-requirement scenarios across all 36", async () => {
    const intelligence = await loadSmartShortlistIntelligence();
    const byKey = new Map(intelligence.map((item) => [item.key, item]));
    const destinations = smartShortlistCandidates.map((candidate) => ({ ...candidate, ...byKey.get(candidate.key) }));

    const usOnly = evaluateShortlist(destinations, { includedCountries: ["US"] });
    expect(usOnly.filter((result) => result.group !== "EXCLUDED").every((result) => result.destination.countryCode === "US")).toBe(true);
    expect(usOnly.filter((result) => result.destination.countryCode !== "US").every((result) => result.group === "EXCLUDED")).toBe(true);

    const outsideUs = evaluateShortlist(destinations, { excludedCountries: ["US"] });
    expect(outsideUs.filter((result) => result.group !== "EXCLUDED").every((result) => result.destination.countryCode !== "US")).toBe(true);
    expect(outsideUs.filter((result) => result.destination.countryCode === "US").every((result) => result.group === "EXCLUDED")).toBe(true);

    const ski = evaluateShortlist(destinations, { mountain: "SKI_RESORT_ACCESS", requireMountain: true });
    expect(ski.filter((result) => result.group === "MEETS_FILTERS").every((result) => result.destination.mountainAccess === "SKI_RESORT_ACCESS")).toBe(true);
    expect(ski.filter((result) => result.destination.mountainAccess === "MOUNTAIN_ACCESS" || result.destination.mountainAccess === "NONE").every((result) => result.group === "EXCLUDED")).toBe(true);

    const ocean = evaluateShortlist(destinations, { beach: "OCEAN_COASTAL", requireBeach: true });
    expect(ocean.find((result) => result.destination.key === "queenstown-nz")?.group).toBe("EXCLUDED");
    expect(ocean.filter((result) => result.group === "MEETS_FILTERS").every((result) => result.destination.oceanAccess === "COASTAL" || result.destination.oceanAccess === "HYBRID")).toBe(true);

    const budget = evaluateShortlistWithOwnedAffordability(destinations, {}, { amountUsd: 2_000, household: "single", require: true });
    expect(budget.filter((result) => result.affordabilityDecision?.state === "OVER_BUDGET").every((result) => result.group === "EXCLUDED")).toBe(true);
  }, 15_000);
});
