import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { buildRegisteredWorkbookContributions, deriveRegisteredAffordability } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/legacy-carryover-batch-20-02/DestinationFinderAI-Legacy-Carryover-Batch-20-Premium-Enriched-Final-v3.3.xlsx");
const EXPECTED_SHA256 = "015209686a8a68c20c32288498be40b88802268cc967a4ef71fbaa143b9d2a3a";
const EXPECTED_KEYS = [
  "radovljica-slovenia", "osaka-japan", "sitges-spain", "estepona-spain", "lake-bled-slovenia",
  "olbia-italy", "hiroshima-japan", "kobe-japan", "alghero-italy", "hakodate-japan",
  "desenzano-del-garda-italy", "onomichi-japan", "cartagena-spain", "gijon-spain", "girona-spain",
  "ptuj-slovenia", "koper-slovenia", "murcia-spain", "takayama-japan", "dubrovnik-croatia",
] as const;
const EXPECTED_AFFORDABILITY: Record<string, readonly [number, number]> = {
  "radovljica-slovenia": [1850, 2600], "osaka-japan": [2650, 3750], "sitges-spain": [2525, 3575],
  "estepona-spain": [2425, 3425], "lake-bled-slovenia": [2100, 2975], "olbia-italy": [2125, 3025],
  "hiroshima-japan": [2350, 3325], "kobe-japan": [2450, 3450], "alghero-italy": [2100, 2975],
  "hakodate-japan": [2150, 3000], "desenzano-del-garda-italy": [2225, 3150], "onomichi-japan": [1975, 2775],
  "cartagena-spain": [1900, 2675], "gijon-spain": [2000, 2825], "girona-spain": [2175, 3100],
  "ptuj-slovenia": [1725, 2425], "koper-slovenia": [2000, 2825], "murcia-spain": [1850, 2625],
  "takayama-japan": [2025, 2825], "dubrovnik-croatia": [2600, 3625],
};

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-02 workbook", () => {
  it("pins the frozen workbook and parses exactly the approved scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
  });

  it("preserves destination-owned rows and unique stable keys through mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.neighborhoods.length, 0)).toBe(100);
    expect(stored.reduce((sum, destination) => sum + destination.places.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.media.length, 0)).toBe(80);
    expect(stored.reduce((sum, destination) => sum + destination.lifestyleFeatures.length, 0)).toBe(340);
    for (const destination of destinations) {
      const destinationKey = destination.identity.destinationKey;
      for (const rows of [destination.facts, destination.neighborhoods, destination.places, destination.resources, destination.media, destination.costOfLiving]) {
        expect(rows.every((row) => row.destination_key === destinationKey), destinationKey).toBe(true);
      }
      for (const [rows, field] of [[destination.neighborhoods, "neighborhood_key"], [destination.places, "place_key"], [destination.resources, "resource_key"], [destination.media, "media_key"], [destination.costOfLiving, "record_key"]] as const) {
        const keys = rows.map((row) => String(row[field]));
        expect(new Set(keys).size, `${destinationKey}:${field}`).toBe(keys.length);
      }
    }
  });

  it("derives both U3-R5 household values and maps decision facts without errors", () => {
    for (const destination of destinations) {
      const destinationKey = destination.identity.destinationKey;
      const affordability = deriveRegisteredAffordability(destination);
      expect(affordability, destinationKey).toEqual({ destinationKey, singleMonthlyUsd: EXPECTED_AFFORDABILITY[destinationKey][0], coupleMonthlyUsd: EXPECTED_AFFORDABILITY[destinationKey][1], estimateYear: 2026 });
      const adapted = adaptWorkbookDestinationToIntelligenceV2Facts(destination);
      expect(adapted.mappingErrors, destinationKey).toEqual([]);
    }
  });

  it("uses only the generic registry contribution path", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-02")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(20);
    expect(() => buildRegisteredWorkbookContributions({ ...entry, expectedDestinationKeys: entry.expectedDestinationKeys.slice(1) }, workbookImport, new Set())).toThrow(/do not match its approved registry ownership/);
  });
});