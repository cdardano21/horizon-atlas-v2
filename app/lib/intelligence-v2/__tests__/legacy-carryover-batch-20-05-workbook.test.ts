import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { buildRegisteredWorkbookContributions } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/legacy-carryover-batch-20-05/DestinationFinderAI-Next-Legacy-Batch-20-05-Authoritative-Final-v3.3.xlsx");
const EXPECTED_SHA256 = "28141ee6331438080ad0d1e82c1226759539c6cd4144401ab4c677142d212e6b";
const EXPECTED_KEYS = [
  "chattanooga-tennessee-united-states", "greenville-south-carolina-united-states", "tucson-arizona-united-states", "st-petersburg-florida-united-states", "fort-collins-colorado-united-states",
  "boise-idaho-united-states", "leiria-portugal", "granada-spain", "bilbao-spain", "osijek-croatia",
  "vienna-austria", "ljubljana-slovenia", "tallinn-estonia", "kuala-lumpur-malaysia", "taipei-taiwan",
  "busan-south-korea", "adelaide-australia", "oaxaca-mexico", "pereira-colombia", "salinas-ecuador",
] as const;

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-05 workbook", () => {
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
    expect(places.filter((place) => place.websiteUrl)).toHaveLength(217);
    expect(places.filter((place) => !place.websiteUrl)).toHaveLength(143);
    expect(places.every((place) => Boolean(place.googleMapsUrl))).toBe(true);
  });

  it("contributes all 20 destinations through the generic registered-workbook path", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-05")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(20);
  });
});