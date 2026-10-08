import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { buildRegisteredWorkbookContributions, deriveRegisteredAffordability } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/legacy-carryover-batch-20-03/DestinationFinderAI-Batch-20-03-Media-Repaired-Non-Media-Preserved-v3.3.xlsx");
const EXPECTED_SHA256 = "4b8000f89855fb1cc063d145bd3548874bc3cb6caf21e3e9ca91b5727fe7aa9a";
const EXPECTED_KEYS = [
  "aomori-japan", "kamakura-japan", "porto-portugal", "kranj-slovenia", "coimbra-portugal",
  "kumamoto-japan", "beppu-japan", "sapporo-japan", "lecce-italy", "athens-greece",
  "matsumoto-japan", "morioka-japan", "sendai-japan", "cavtat-croatia", "sirmione-italy",
  "celje-slovenia", "nagasaki-japan", "perugia-italy", "novigrad-croatia", "ioannina-greece",
] as const;

let workbookImport: DeterministicV31WorkbookImport;
let destinations: readonly DeterministicV31CanonicalDestination[];

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("legacy carryover batch 20-03 workbook", () => {
  it("pins the authoritative workbook and exact approved scope", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-03")!;
    expect(path.resolve(process.cwd(), entry.workbookPath)).toBe(WORKBOOK_PATH);
    expect(entry.expectedSha256).toBe(EXPECTED_SHA256);
  });

  it("preserves all 960 cached climate values", () => {
    const fields = ["avg_high_c", "avg_low_c", "rainfall_mm", "humidity_pct"] as const;
    const values = destinations.flatMap((destination) => {
      expect(destination.climateMonthly).toHaveLength(12);
      return destination.climateMonthly.flatMap((month) => fields.map((field) => month[field]));
    });
    expect(values).toHaveLength(960);
    for (const value of values) {
      expect(value).not.toBeNull();
      expect(String(value ?? "").trim()).not.toBe("");
      expect(Number.isFinite(Number(value))).toBe(true);
    }
  });

  it("provides four direct media images with subject text per destination", () => {
    for (const destination of destinations) {
      expect(destination.media).toHaveLength(4);
      for (const media of destination.media) {
        const url = new URL(String(media.image_url));
        expect(url.protocol).toBe("https:");
        expect(url.hostname).toBe("upload.wikimedia.org");
        expect(url.pathname).toMatch(/\.(?:jpe?g|png|webp)$/i);
        expect(media.image_url).not.toContain("Special:MediaSearch");
        expect(String(media.subject ?? "").trim()).not.toBe("");
      }
    }
  });

  it("preserves the authored recommendation and lifestyle rows through stored-state mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.neighborhoods.length, 0)).toBe(100);
    expect(stored.reduce((sum, destination) => sum + destination.places.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(360);
    expect(stored.reduce((sum, destination) => sum + destination.lifestyleFeatures.length, 0)).toBe(340);
    for (const destination of destinations) {
      expect(destination.places).toHaveLength(18);
      expect(destination.places.every((place) => Boolean(place.website_url) && Boolean(place.google_maps_url) && Boolean(place.neighborhood_key))).toBe(true);
      expect(new Set(destination.places.map((place) => place.place_key)).size).toBe(18);
    }
  });

  it("derives both U3-R5 household midpoints and maps Intelligence V2 without errors", () => {
    for (const destination of destinations) {
      const rows = new Map(destination.costOfLiving.map((row) => [row.household_type, row]));
      const single = rows.get("single")!;
      const couple = rows.get("couple")!;
      expect(deriveRegisteredAffordability(destination)).toEqual({
        destinationKey: destination.identity.destinationKey,
        singleMonthlyUsd: (Number(single.monthly_low) + Number(single.monthly_high)) / 2,
        coupleMonthlyUsd: (Number(couple.monthly_low) + Number(couple.monthly_high)) / 2,
        estimateYear: 2026,
      });
      expect(adaptWorkbookDestinationToIntelligenceV2Facts(destination).mappingErrors).toEqual([]);
    }
  });

  it("contributes all 20 destinations through the generic registered-workbook path", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "legacy-carryover-batch-20-03")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set());
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(20);
    expect(() => buildRegisteredWorkbookContributions({ ...entry, expectedDestinationKeys: entry.expectedDestinationKeys.slice(1) }, workbookImport, new Set())).toThrow(/do not match its approved registry ownership/);
  });
});