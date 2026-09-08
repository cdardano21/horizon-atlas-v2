import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import {
  loadFrozenWorkbookV31DeterministicImport,
  type DeterministicV31CanonicalDestination,
} from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";

const WORKBOOK_PATH = path.resolve(
  process.cwd(),
  "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Premium-Enriched-Final-v3.3.xlsx",
);
const EXPECTED_SHA256 = "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a";
const EXPECTED_KEYS = [
  "radovljica-slovenia", "osaka-japan", "sitges-spain", "estepona-spain", "lake-bled-slovenia",
  "olbia-italy", "hiroshima-japan", "kobe-japan", "alghero-italy", "hakodate-japan",
  "desenzano-del-garda-italy", "onomichi-japan", "cartagena-spain", "gijon-spain", "girona-spain",
  "ptuj-slovenia", "koper-slovenia", "murcia-spain", "takayama-japan", "dubrovnik-croatia",
] as const;

let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20 premium workbook acceptance", () => {
  it("binds exact bytes and approved destination scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
  });

  it("preserves required richness totals through storage mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.neighborhoods.length, 0)).toBe(100);
    expect(stored.reduce((sum, destination) => sum + destination.places.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.media.length, 0)).toBe(80);
    expect(stored.reduce((sum, destination) => sum + destination.lifestyleFeatures.length, 0)).toBe(340);
    expect(stored.reduce((sum, destination) => sum + destination.climateMonthly.length, 0)).toBe(240);
    expect(stored.reduce((sum, destination) => sum + destination.scores.length, 0)).toBe(0);
    expect(stored.reduce((sum, destination) => sum + destination.costOfLiving.filter((row) => row.category === "u3_r5_total_monthly_estimate").length, 0)).toBe(40);
  });

  it("maps all destinations into Intelligence V2 without errors", () => {
    for (const destination of destinations) {
      const adapted = adaptWorkbookDestinationToIntelligenceV2Facts(destination);
      expect(adapted.mappingErrors, destination.identity.destinationKey).toEqual([]);
    }
  });
});