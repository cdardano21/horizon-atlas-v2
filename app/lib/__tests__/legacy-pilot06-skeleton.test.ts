import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";

/**
 * Phase 5A/5B proof (still valid): the real, production deterministic parser accepts the complete
 * 48-sheet legacy-migration-pilot-06 identity skeleton cleanly - 6 destinations resolved, zero
 * validation errors, zero orphans.
 *
 * Phase 5C proof (new in this file): the two Wave 1 destinations (The Hague, Kyoto) now carry
 * evidence-backed DESTINATIONS identity/geography fields and 12 CLIMATE_MONTHLY rows each, all
 * cited in data/legacy-migration-pilot-06/research-ledger/*.json. Every other module remains
 * empty for ALL SIX destinations, and CLIMATE_MONTHLY/SOURCES contain rows ONLY for the two Wave 1
 * destination_keys - proving no cross-destination leakage in either direction (The Hague content
 * did not leak into Kyoto or the other 4, and vice versa).
 *
 * This workbook is NOT registered anywhere (no registry entry, no preview activation) - this test
 * loads it directly by explicit path only.
 */
const PILOT_WORKBOOK_PATH = path.resolve(
  process.cwd(),
  "data/legacy-migration-pilot-06/DestinationFinderAI_LegacyMigrationPilot06_v3.3_SKELETON.xlsx",
);

const EXPECTED_DESTINATION_KEYS = [
  "the-hague-netherlands",
  "kyoto-japan",
  "santa-fe-new-mexico-united-states",
  "st-cloud-minnesota-united-states",
  "san-ramon-costa-rica",
  "st-john-s-canada",
];

const WAVE1_DESTINATION_KEYS = ["the-hague-netherlands", "kyoto-japan"];
const NON_WAVE1_DESTINATION_KEYS = EXPECTED_DESTINATION_KEYS.filter((k) => !WAVE1_DESTINATION_KEYS.includes(k));

describe("legacy-migration-pilot-06 identity skeleton - real deterministic parser acceptance", () => {
  it("resolves exactly the 6 pilot destinations with zero validation errors", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);

    expect(importResult.contractVersion).toBe("3.3");
    expect(importResult.validationErrors).toEqual([]);
    expect(importResult.destinations.map((d) => d.destinationKey).sort()).toEqual([...EXPECTED_DESTINATION_KEYS].sort());
  });

  it("every pilot destination's non-climate, non-sources modules are empty for all 6 destinations - proves no fabricated research exists yet", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    expect(canonicalDestinations.map((d) => d.identity.destinationKey).sort()).toEqual([...EXPECTED_DESTINATION_KEYS].sort());

    for (const destination of canonicalDestinations) {
      expect(destination.facts, destination.identity.destinationKey).toEqual([]);
      expect(destination.scores, destination.identity.destinationKey).toEqual([]);
      expect(destination.neighborhoods, destination.identity.destinationKey).toEqual([]);
      expect(destination.places, destination.identity.destinationKey).toEqual([]);
      expect(destination.resources, destination.identity.destinationKey).toEqual([]);
      expect(destination.media, destination.identity.destinationKey).toEqual([]);
      expect(destination.lifestyleFeatures, destination.identity.destinationKey).toEqual([]);
    }
  });

  it("Phase 5C: CLIMATE_MONTHLY and SOURCES are populated ONLY for the two Wave 1 destinations - exactly 12 climate rows each, zero for the other 4", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];

    for (const destination of canonicalDestinations) {
      const key = destination.identity.destinationKey;
      if (WAVE1_DESTINATION_KEYS.includes(key)) {
        expect(destination.climateMonthly.length, key).toBe(12);
        expect(destination.sources.length, key).toBeGreaterThan(0);
      } else {
        expect(destination.climateMonthly, key).toEqual([]);
        expect(destination.sources, key).toEqual([]);
      }
    }
  });

  it("no destination's rows ever appear under a different destination_key (cross-destination isolation, including CLIMATE_MONTHLY and SOURCES)", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const destination of canonicalDestinations) {
      const allChildRows = [
        ...destination.neighborhoods,
        ...destination.places,
        ...destination.resources,
        ...destination.media,
        ...destination.climateMonthly,
        ...destination.sources,
      ];
      for (const row of allChildRows) {
        expect((row as { destination_key?: string }).destination_key).toBe(destination.identity.destinationKey);
      }
    }
  });

  it("The Hague: identity/geography fields match the research ledger exactly, editorial narrative fields remain genuinely blank", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const theHague = canonicalDestinations.find((d) => d.identity.destinationKey === "the-hague-netherlands");

    expect(theHague?.identity.slug).toBe("the-hague-netherlands");
    expect(theHague?.identity.name).toBe("The Hague");
    expect(theHague?.identity.country).toBe("Netherlands");
    expect(theHague?.identity.population).toBe("549163");
    expect(theHague?.identity.latitude).toBe("52.08");
    expect(theHague?.identity.longitude).toBe("4.31");
    expect(theHague?.identity.elevationMeters).toBe("1");
    expect(theHague?.editorial.currency).toBe("EUR");
    expect(theHague?.editorial.primaryLanguage).toBe("Dutch");
    expect(theHague?.editorial.timeZone).toBe("Europe/Amsterdam");
    // Narrative/editorial description fields were NOT researched this pass - must remain blank.
    expect(theHague?.editorial.shortDescription).toBeNull();
    expect(theHague?.editorial.longDescription).toBeNull();
  });

  it("Kyoto: identity/geography fields match the research ledger exactly, editorial narrative fields remain genuinely blank", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const kyoto = canonicalDestinations.find((d) => d.identity.destinationKey === "kyoto-japan");

    expect(kyoto?.identity.slug).toBe("kyoto-japan");
    expect(kyoto?.identity.name).toBe("Kyoto");
    expect(kyoto?.identity.country).toBe("Japan");
    expect(kyoto?.identity.population).toBe("1431419");
    expect(kyoto?.identity.latitude).toBe("35.01");
    expect(kyoto?.identity.longitude).toBe("135.77");
    // Elevation was deliberately left blank - the source only gave a highest/lowest range, not a
    // single representative city-center figure, and picking one would have been a fabrication.
    expect(kyoto?.identity.elevationMeters).toBeNull();
    expect(kyoto?.editorial.currency).toBe("JPY");
    expect(kyoto?.editorial.primaryLanguage).toBe("Japanese");
    expect(kyoto?.editorial.timeZone).toBe("Asia/Tokyo");
    expect(kyoto?.editorial.shortDescription).toBeNull();
    expect(kyoto?.editorial.longDescription).toBeNull();
  });

  it("the 4 non-Wave-1 destinations are completely untouched by Phase 5C - identity-only fields, no geography/climate/sources", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const key of NON_WAVE1_DESTINATION_KEYS) {
      const destination = canonicalDestinations.find((d) => d.identity.destinationKey === key);
      expect(destination?.identity.population, key).toBeNull();
      expect(destination?.identity.latitude, key).toBeNull();
      expect(destination?.identity.longitude, key).toBeNull();
      expect(destination?.identity.elevationMeters, key).toBeNull();
      expect(destination?.editorial.currency, key).toBeNull();
      expect(destination?.editorial.shortDescription, key).toBeNull();
    }
  });
});

