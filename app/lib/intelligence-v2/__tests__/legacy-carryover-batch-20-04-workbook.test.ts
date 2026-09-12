import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { buildRegisteredWorkbookContributions } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/legacy-carryover-batch-20-04/DestinationFinderAI-Next-Legacy-Batch-20-Authoritative-Final-v3.3.xlsx");
const EXPECTED_SHA256 = "f352b0fbf84e5e22bfc0d4b3942324cb82ebe6f1518517b24b3d2df4e12b2129";
const EXPECTED_KEYS = [
  "siracusa-italy", "toyama-japan", "kardamyli-greece", "trogir-croatia", "korcula-town-croatia",
  "fukuoka-japan", "maribor-slovenia", "mali-losinj-croatia", "naha-japan", "niigata-japan",
  "kagoshima-japan", "bari-italy", "miyazaki-japan", "hvar-town-croatia", "oviedo-spain",
  "cagliari-italy", "naxos-town-greece", "corfu-town-greece", "thessaloniki-greece", "okayama-japan",
] as const;
const REJECTED_GENERIC_WEBSITE_URLS = new Set([
  "https://www.visitsicily.info/en/", "https://visit-toyama-japan.com/en/", "https://www.visitgreece.gr/mainland/peloponnese/messinia/kardamyli/", "https://visittrogir.hr/", "https://visitkorcula.eu/",
  "https://gofukuoka.jp/", "https://www.visitmaribor.si/en/", "https://www.visitlosinj.hr/", "https://visitokinawajapan.com/", "https://enjoyniigata.com/en/",
  "https://www.kagoshima-yokanavi.jp/en/", "https://www.viaggiareinpuglia.it/", "https://www.kanko-miyazaki.jp/", "https://visithvar.hr/", "https://www.turismoasturias.es/en/descubre/ciudades/oviedo",
  "https://cagliariturismo.comune.cagliari.it/en", "https://www.visitgreece.gr/islands/cyclades/naxos/", "https://www.visitgreece.gr/islands/ionian-islands/corfu/", "https://thessaloniki.travel/", "https://www.okayama-japan.jp/en/",
]);

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-04 workbook", () => {
  it("pins the authoritative workbook and exact approved scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
  });

  it("preserves authored media and resources through stored-state mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.media.length, 0)).toBe(80);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(360);
    expect(stored.every((destination) => destination.places.length === 18)).toBe(true);
    const places = stored.flatMap((destination) => destination.places);
    expect(places).toHaveLength(360);
    expect(places.filter((place) => place.websiteUrl)).toHaveLength(61);
    expect(places.filter((place) => !place.websiteUrl)).toHaveLength(299);
    expect(places.every((place) => Boolean(place.googleMapsUrl))).toBe(true);
    expect(places.every((place) => !place.websiteUrl || !REJECTED_GENERIC_WEBSITE_URLS.has(place.websiteUrl))).toBe(true);
  });

  it("contributes all 20 destinations through the generic registered-workbook path", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-04")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(20);
  });
});