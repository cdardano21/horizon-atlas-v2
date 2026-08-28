import { describe, expect, it } from "vitest";
import { loadFrozenWorkbookV31DeterministicImport } from "./workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "./persistence/v31/map-canonical-destination-to-stored-state";
import { buildSparseTestWorkbook } from "./__tests__/sparse-ooxml-fixture-builder";

/**
 * Focused proof, for LIFESTYLE_FEATURES (v3.3, additive) specifically, of the three
 * safety properties required before this sheet can be trusted in production: rows
 * for an unknown destination_key are flagged as orphans (never silently attached to
 * a real destination), a duplicate record_key within one destination is preserved
 * (never dropped) and deterministically de-duplicated at the persistence-mapping
 * layer, and rows never leak from one destination's canonical result into another's.
 */
describe("LIFESTYLE_FEATURES parsing safety: orphan rows, duplicate records, cross-destination isolation", () => {
  const fixturePath = buildSparseTestWorkbook({
    DESTINATIONS: [
      { rowNumber: 1, cells: [{ col: "A", value: "destination_key" }, { col: "B", value: "destination_name" }, { col: "C", value: "country" }] },
      { rowNumber: 2, cells: [{ col: "A", value: "lifestyle-fixture-dest-a-zz" }, { col: "B", value: "Lifestyle Fixture Destination A" }, { col: "C", value: "Testland" }] },
      { rowNumber: 3, cells: [{ col: "A", value: "lifestyle-fixture-dest-b-zz" }, { col: "B", value: "Lifestyle Fixture Destination B" }, { col: "C", value: "Testland" }] },
    ],
    LIFESTYLE_FEATURES: [
      {
        rowNumber: 1,
        cells: [
          { col: "A", value: "destination_key" }, { col: "B", value: "record_key" }, { col: "C", value: "feature_group" },
          { col: "D", value: "feature_key" }, { col: "E", value: "feature_value" }, { col: "F", value: "availability_level" },
          { col: "G", value: "proximity_band" }, { col: "H", value: "display_label" }, { col: "I", value: "evidence_summary" },
          { col: "J", value: "source_name" }, { col: "K", value: "source_url" }, { col: "L", value: "source_as_of_date" },
          { col: "M", value: "confidence" }, { col: "N", value: "matching_enabled" }, { col: "O", value: "display_enabled" },
          { col: "P", value: "notes" },
        ],
      },
      {
        // Destination A, record 1 of a duplicate pair (same record_key as row 3 below).
        rowNumber: 2,
        cells: [
          { col: "A", value: "lifestyle-fixture-dest-a-zz" }, { col: "B", value: "walkable_downtown" }, { col: "C", value: "community_form" },
          { col: "D", value: "walkable_downtown_core" }, { col: "E", value: "YES" }, { col: "F", value: "STRONG" },
          { col: "G", value: "ON_SITE" }, { col: "H", value: "Walkable Downtown" }, { col: "I", value: "Downtown core is fully walkable with mixed-use blocks." },
          { col: "J", value: "Workbook editorial research" }, { col: "K", value: "" }, { col: "L", value: "" },
          { col: "M", value: "HIGH" }, { col: "N", value: "YES" }, { col: "O", value: "YES" }, { col: "P", value: "" },
        ],
      },
      {
        // Destination A, record 2 - deliberately reuses the same record_key "walkable_downtown".
        rowNumber: 3,
        cells: [
          { col: "A", value: "lifestyle-fixture-dest-a-zz" }, { col: "B", value: "walkable_downtown" }, { col: "C", value: "community_form" },
          { col: "D", value: "bikeable_streets" }, { col: "E", value: "YES" }, { col: "F", value: "MODERATE" },
          { col: "G", value: "ON_SITE" }, { col: "H", value: "Bikeable Streets" }, { col: "I", value: "Protected bike lanes connect most residential areas." },
          { col: "J", value: "Workbook editorial research" }, { col: "K", value: "" }, { col: "L", value: "" },
          { col: "M", value: "MODERATE" }, { col: "N", value: "YES" }, { col: "O", value: "YES" }, { col: "P", value: "" },
        ],
      },
      {
        // Destination B, single record - must never appear in destination A's result and vice versa.
        rowNumber: 4,
        cells: [
          { col: "A", value: "lifestyle-fixture-dest-b-zz" }, { col: "B", value: "marina_access" }, { col: "C", value: "water_and_boating" },
          { col: "D", value: "marina_access" }, { col: "E", value: "YES" }, { col: "F", value: "STRONG" },
          { col: "G", value: "ON_SITE" }, { col: "H", value: "Marina Access" }, { col: "I", value: "Full-service marina with slip rentals." },
          { col: "J", value: "Workbook editorial research" }, { col: "K", value: "" }, { col: "L", value: "" },
          { col: "M", value: "HIGH" }, { col: "N", value: "YES" }, { col: "O", value: "YES" }, { col: "P", value: "" },
        ],
      },
      {
        // Orphan - destination_key does not match any row in DESTINATIONS.
        rowNumber: 5,
        cells: [
          { col: "A", value: "lifestyle-fixture-ghost-city-zz" }, { col: "B", value: "orphan_feature" }, { col: "C", value: "outdoor_recreation" },
          { col: "D", value: "orphan_feature" }, { col: "E", value: "YES" }, { col: "F", value: "STRONG" },
          { col: "G", value: "ON_SITE" }, { col: "H", value: "Orphan Feature" }, { col: "I", value: "This row references a destination_key absent from DESTINATIONS." },
          { col: "J", value: "Workbook editorial research" }, { col: "K", value: "" }, { col: "L", value: "" },
          { col: "M", value: "HIGH" }, { col: "N", value: "YES" }, { col: "O", value: "YES" }, { col: "P", value: "" },
        ],
      },
    ],
  });

  it("flags the LIFESTYLE_FEATURES row for an unknown destination_key as an orphaned child row, without fabricating a match", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(fixturePath);

    expect(importResult.validationErrors.some((error) => error === "Orphaned child rows detected for 1 record(s).")).toBe(true);

    const ghostDestination = importResult.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lifestyle-fixture-ghost-city-zz");
    expect(ghostDestination).toBeUndefined();
  });

  it("never leaks LIFESTYLE_FEATURES rows across destinations - each destination sees only its own rows", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(fixturePath);

    const destinationA = importResult.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lifestyle-fixture-dest-a-zz");
    const destinationB = importResult.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lifestyle-fixture-dest-b-zz");

    expect(destinationA).toBeDefined();
    expect(destinationB).toBeDefined();

    expect(destinationA?.lifestyleFeatures).toHaveLength(2);
    expect(destinationA?.lifestyleFeatures.every((row) => row.destination_key === "lifestyle-fixture-dest-a-zz")).toBe(true);
    expect(destinationA?.lifestyleFeatures.some((row) => row.feature_key === "marina_access")).toBe(false);
    expect(destinationA?.lifestyleFeatures.some((row) => row.feature_key === "orphan_feature")).toBe(false);

    expect(destinationB?.lifestyleFeatures).toHaveLength(1);
    expect(destinationB?.lifestyleFeatures.every((row) => row.destination_key === "lifestyle-fixture-dest-b-zz")).toBe(true);
    expect(destinationB?.lifestyleFeatures[0]?.feature_key).toBe("marina_access");
    expect(destinationB?.lifestyleFeatures.some((row) => row.feature_key === "walkable_downtown_core" || row.feature_key === "bikeable_streets")).toBe(false);
  });

  it("preserves both rows of a duplicate record_key at parse time, then deterministically de-duplicates the key at the persistence-mapping layer without dropping either row's data", async () => {
    const importResult = await loadFrozenWorkbookV31DeterministicImport(fixturePath);
    const destinationA = importResult.canonicalDestinations?.find((destination) => destination.identity.destinationKey === "lifestyle-fixture-dest-a-zz");
    expect(destinationA).toBeDefined();

    // Raw parse layer: both rows are preserved verbatim, including the duplicate record_key - never silently dropped.
    expect(destinationA?.lifestyleFeatures.map((row) => row.record_key)).toEqual(["walkable_downtown", "walkable_downtown"]);
    expect(destinationA?.lifestyleFeatures.map((row) => row.feature_key)).toEqual(["walkable_downtown_core", "bikeable_streets"]);

    // Persistence-mapping layer: record_key collisions are resolved deterministically (same pattern as every
    // other keyed child module), the second occurrence gets a "-2" suffix, and neither row's data is lost.
    const storedState = mapCanonicalDestinationToStoredState(destinationA!);
    expect(storedState.lifestyleFeatures.map((row) => row.recordKey)).toEqual(["walkable_downtown", "walkable_downtown-2"]);
    expect(storedState.lifestyleFeatures.map((row) => row.featureKey)).toEqual(["walkable_downtown_core", "bikeable_streets"]);
    expect(storedState.lifestyleFeatures.map((row) => row.displayLabel)).toEqual(["Walkable Downtown", "Bikeable Streets"]);
  });
});
