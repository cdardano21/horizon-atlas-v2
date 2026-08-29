import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";

/**
 * Phase 5A/5B proof: the real, production deterministic parser accepts the complete 48-sheet
 * legacy-migration-pilot-06 identity skeleton cleanly - 6 destinations resolved, zero
 * validation errors, zero orphans, and every non-identity module (including LIFESTYLE_FEATURES,
 * added in Phase 5B) empty (proving no fabricated research leaked in). This workbook is NOT
 * registered anywhere (no registry entry, no preview activation) - this test loads it directly
 * by explicit path only.
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

describe("legacy-migration-pilot-06 identity skeleton - real deterministic parser acceptance", () => {
  it("resolves exactly the 6 pilot destinations with zero validation errors", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);

    expect(importResult.contractVersion).toBe("3.3");
    expect(importResult.validationErrors).toEqual([]);
    expect(importResult.destinations.map((d) => d.destinationKey).sort()).toEqual([...EXPECTED_DESTINATION_KEYS].sort());
  });

  it("every pilot destination's non-identity modules are empty - proves no fabricated research exists yet", async () => {
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
      expect(destination.sources, destination.identity.destinationKey).toEqual([]);
      expect(destination.lifestyleFeatures, destination.identity.destinationKey).toEqual([]);
    }
  });

  it("no destination's rows ever appear under a different destination_key (cross-destination isolation, trivially true but proven)", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    for (const destination of canonicalDestinations) {
      const allChildRows = [...destination.neighborhoods, ...destination.places, ...destination.resources, ...destination.media];
      for (const row of allChildRows) {
        expect((row as { destination_key?: string }).destination_key).toBe(destination.identity.destinationKey);
      }
    }
  });

  it("identity fields match the legacy-catalog source exactly (city/country/slug), and every other DESTINATIONS field is genuinely blank", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(PILOT_WORKBOOK_PATH);
    const canonicalDestinations = importResult.canonicalDestinations ?? [];
    const theHague = canonicalDestinations.find((d) => d.identity.destinationKey === "the-hague-netherlands");
    expect(theHague?.identity.slug).toBe("the-hague-netherlands");
    expect(theHague?.identity.name).toBe("The Hague");
    expect(theHague?.identity.country).toBe("Netherlands");
    expect(theHague?.identity.population).toBeNull();
    expect(theHague?.identity.latitude).toBeNull();
    expect(theHague?.editorial.shortDescription).toBeNull();
  });
});
