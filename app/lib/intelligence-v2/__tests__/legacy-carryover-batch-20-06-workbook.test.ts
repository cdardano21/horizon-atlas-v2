import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { buildRegisteredWorkbookContributions } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/legacy-carryover-batch-20-06/DestinationFinderAI-Next-Legacy-Batch-20-06-FINAL-AUTHORITATIVE-POPULATION-REPAIRED-v3.3.xlsx");
const EXPECTED_SHA256 = "9cb91d6f7ac8e6c7bb84a262960ce7dc7699099c2a40351408883af079f87558";
const EXPECTED_KEYS = [
  "asheville-north-carolina-united-states", "portland-maine-united-states", "bend-oregon-united-states", "san-luis-obispo-california-united-states", "sarasota-florida-united-states",
  "reno-nevada-united-states", "viana-do-castelo-portugal", "salamanca-spain", "san-sebastian-spain", "evora-portugal",
  "prague-other-europe", "treviso-italy", "annecy-france", "ho-chi-minh-city-vietnam", "tokyo-japan",
  "bali-indonesia", "auckland-new-zealand", "cusco-peru", "valdivia-chile", "cordoba-argentina",
] as const;
const EXPECTED_POPULATIONS = [
  "93523", "69911", "107342", "50636", "58458", "283621", "86099", "146110", "189866", "53937",
  "1405551", "85770", "132117", "14002598", "14276882", "4317404", "1656486", "114630", "170043", "1565112",
] as const;

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-06 workbook", () => {
  it("pins the authoritative workbook and exact approved scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
  });

  it("preserves authored media and resources through stored-state mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.media.length, 0)).toBe(80);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.neighborhoods.length, 0)).toBe(100);
    expect(stored.every((destination) => destination.media.length === 4)).toBe(true);
    expect(stored.every((destination) => destination.media.every((item) => item.sortOrder !== null))).toBe(true);
    expect(destinations.every((destination) => destination.media.filter((row) => ["1", "true", "yes"].includes(String(row.primary_image ?? "").trim().toLowerCase())).length === 1)).toBe(true);
    expect(destinations.reduce((sum, destination) => sum + destination.climateMonthly.length, 0)).toBe(240);
    expect(stored.every((destination) => destination.places.length === 18)).toBe(true);
    const places = stored.flatMap((destination) => destination.places);
    expect(places).toHaveLength(360);
    expect(places.filter((place) => place.websiteUrl)).toHaveLength(143);
    expect(places.filter((place) => !place.websiteUrl)).toHaveLength(217);
    expect(places.every((place) => Boolean(place.googleMapsUrl))).toBe(true);
  });

  it("preserves the locked populations with destination-scoped provenance", () => {
    expect(destinations.map((destination) => destination.destinationRow?.population)).toEqual(EXPECTED_POPULATIONS);
    expect(destinations.map((destination) => destination.sources.filter((source) => source.source_name?.startsWith("Population (")).length)).toEqual(Array(20).fill(1));
    expect(destinations.every((destination) => destination.sources.some((source) => source.source_name?.startsWith("Population (") && source.source_url?.startsWith("https://") && ["1", "true", "yes"].includes(source.verified?.toLowerCase() ?? "") && source.confidence === "HIGH"))).toBe(true);
  });

  it("contributes all 20 destinations through the generic registered-workbook path", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-06")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(6);
  });
});