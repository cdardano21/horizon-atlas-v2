import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY, loadExpansionWorkbookRawIdentity, type ExpansionWorkbookRegistryEntry } from "../../expansion-workbook-registry";
import { buildCanonicalDestinationFromPersistedBundle, buildFallbackCanonicalDestination } from "../../canonical-destination-loader";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { createInMemoryPersistedDestinationReadPort } from "../../persistence/v31/in-memory-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../../persistence/v31/load-normalized-persisted-destination-bundle";
import type { CanonicalDestinationKey, DestinationId } from "../../persistence/v31/types";
import { buildRegisteredWorkbookContributions } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";

const BATCH_REGISTRY_ID = "legacy-carryover-batch-20-06";
const AUTHORITATIVE_WORKBOOK_PATH = "data/legacy-carryover-batch-20-06/DestinationFinderAI-Next-Legacy-Batch-20-06-FINAL-AUTHORITATIVE-POPULATION-REPAIRED-v3.3.xlsx";
const WORKBOOK_PATH = path.resolve(process.cwd(), AUTHORITATIVE_WORKBOOK_PATH);
const EXPECTED_SHA256 = "9cb91d6f7ac8e6c7bb84a262960ce7dc7699099c2a40351408883af079f87558";
const EXPECTED_POPULATIONS = {
  "asheville-north-carolina-united-states": "93523",
  "portland-maine-united-states": "69911",
  "bend-oregon-united-states": "107342",
  "san-luis-obispo-california-united-states": "50636",
  "sarasota-florida-united-states": "58458",
  "reno-nevada-united-states": "283621",
  "viana-do-castelo-portugal": "86099",
  "salamanca-spain": "146110",
  "san-sebastian-spain": "189866",
  "evora-portugal": "53937",
  "prague-other-europe": "1405551",
  "treviso-italy": "85770",
  "annecy-france": "132117",
  "ho-chi-minh-city-vietnam": "14002598",
  "tokyo-japan": "14276882",
  "bali-indonesia": "4317404",
  "auckland-new-zealand": "1656486",
  "cusco-peru": "114630",
  "valdivia-chile": "170043",
  "cordoba-argentina": "1565112",
} as const;
const EXPECTED_KEYS = Object.keys(EXPECTED_POPULATIONS).sort();
const SUPPORTED_SOURCE_FIELDS = ["source_key", "source_name", "source_url", "source_type"] as const;

const isPopulationSource = (name: string | null | undefined) => name?.startsWith("Population (") ?? false;

function getPopulationSource(destination: DeterministicV31CanonicalDestination) {
  const destinationKey = destination.identity.destinationKey;
  const sources = destination.sources.filter((source) => isPopulationSource(source.source_name));
  // Each approved destination owns exactly one population provenance record.
  expect(sources, `${destinationKey}: canonical population source`).toHaveLength(1);
  return sources[0];
}

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];
let batchEntry: ExpansionWorkbookRegistryEntry;

beforeAll(async () => {
  const entries = EXPANSION_WORKBOOK_REGISTRY.filter((entry) => entry.registryId === BATCH_REGISTRY_ID);
  expect(entries, `${BATCH_REGISTRY_ID}: exactly one registry entry`).toHaveLength(1);
  batchEntry = entries[0];
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors, `${BATCH_REGISTRY_ID}: authoritative workbook validation`).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-06 workbook", () => {
  it("pins the authoritative workbook and exact approved scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(batchEntry, `${BATCH_REGISTRY_ID}: authoritative registration`).toMatchObject({
      workbookPath: AUTHORITATIVE_WORKBOOK_PATH,
      expectedSha256: EXPECTED_SHA256,
      environment: "preview",
    });
    expect([...batchEntry.expectedDestinationKeys].sort(), `${BATCH_REGISTRY_ID}: registered scope`).toEqual(EXPECTED_KEYS);
    expect(destinations.map((destination) => destination.identity.destinationKey).sort(), `${BATCH_REGISTRY_ID}: parsed scope`).toEqual(EXPECTED_KEYS);
    for (const destinationKey of EXPECTED_KEYS) {
      const owners = EXPANSION_WORKBOOK_REGISTRY.filter((entry) => entry.environment === "preview" && entry.expectedDestinationKeys.includes(destinationKey));
      expect(owners.map((entry) => entry.registryId), `${destinationKey}: exclusive preview ownership`).toEqual([BATCH_REGISTRY_ID]);
    }
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
    expect(Object.fromEntries(destinations.map((destination) => [destination.identity.destinationKey, destination.destinationRow?.population]))).toEqual(EXPECTED_POPULATIONS);
    for (const destination of destinations) {
      const destinationKey = destination.identity.destinationKey;
      const source = getPopulationSource(destination);
      expect(source.source_url, `${destinationKey}: population source URL`).toMatch(/^https:\/\//);
      expect(["1", "true", "yes"], `${destinationKey}: verified population source`).toContain(source.verified?.toLowerCase() ?? "");
      expect(source.confidence, `${destinationKey}: population source confidence`).toBe("HIGH");
    }
  });

  it("preserves populations by destination_key through workbook preview composition and retains supported source fields", async () => {
    expect(destinations, "one workbook destination per approved population key").toHaveLength(EXPECTED_KEYS.length);
    const byKey = new Map(destinations.map((destination) => [destination.identity.destinationKey, destination]));
    expect([...byKey.keys()].sort()).toEqual(EXPECTED_KEYS);

    for (const [destinationKey, population] of Object.entries(EXPECTED_POPULATIONS)) {
      const destination = byKey.get(destinationKey)!;
      expect.soft(destination.identity.population, `${destinationKey}: canonical population`).toBe(population);
      const source = getPopulationSource(destination);
      expect(source.destination_key, `${destinationKey}: source ownership`).toBe(destinationKey);
      for (const field of SUPPORTED_SOURCE_FIELDS) {
        expect(source[field], `${destinationKey}: ${field}`).toEqual(expect.stringMatching(/\S/));
      }

      // The existing mapping retains only these source fields. Publisher, accessed_at,
      // verified, confidence, and notes are omitted; this test does not claim to preserve them.
      const expectedSource = {
        sourceKey: source.source_key,
        name: source.source_name,
        url: source.source_url,
        type: source.source_type,
      };
      const stored = mapCanonicalDestinationToStoredState(destination);
      expect.soft(stored.identity.population, `${destinationKey}: stored population`).toBe(population);
      expect(stored.sources.filter((item) => isPopulationSource(item.name)), `${destinationKey}: stored population source`).toEqual([expectedSource]);

      const identity = {
        destinationKey: destinationKey as CanonicalDestinationKey,
        destinationId: `batch-20-06-test-${destinationKey}` as DestinationId,
      };
      const result = await loadNormalizedPersistedDestinationBundle(identity, createInMemoryPersistedDestinationReadPort(identity, stored));
      if (result.outcome !== "SUCCESS") throw new Error(`${destinationKey}: bundle load failed: ${JSON.stringify(result)}`);
      expect(result.bundle.destinationKey, `${destinationKey}: bundle ownership`).toBe(destinationKey);
      expect(result.bundle.sources.filter((item) => isPopulationSource(item.name)), `${destinationKey}: bundle population source`).toEqual([expectedSource]);

      // Workbook preview composition supplies raw identity separately. Exercise that
      // fallback explicitly, without requiring the in-memory adapter to carry population.
      const rawIdentity = await loadExpansionWorkbookRawIdentity(destinationKey);
      expect(rawIdentity?.population, `${destinationKey}: preview raw identity`).toBe(population);
      const fallback = buildFallbackCanonicalDestination(destinationKey);
      expect(fallback, `${destinationKey}: preview fallback destination`).not.toBeNull();
      if (!fallback) throw new Error(`${destinationKey}: missing preview fallback destination`);
      const preview = buildCanonicalDestinationFromPersistedBundle(
        destinationKey,
        fallback,
        { ...result.bundle, identity: { ...result.bundle.identity, population: null } },
        null,
        rawIdentity,
      );
      expect(preview.knowledgeProfile?.population, `${destinationKey}: composed preview population`).toBe(population);
    }
  }, 30_000);

  it("contributes all 20 destinations through the generic registered-workbook path", () => {
    const contributions = buildRegisteredWorkbookContributions(batchEntry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key).sort()).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(6);
  });
});
