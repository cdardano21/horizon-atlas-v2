import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";
import { smartShortlistCandidates } from "../../smart-shortlist/cohort";
import { ownedAffordabilityByDestination } from "../../smart-shortlist/owned-affordability-records";
import { buildRegisteredWorkbookContributions, deriveRegisteredAffordability, deriveRegisteredCandidate } from "../../smart-shortlist/server-data";
import { loadFrozenWorkbookV31DeterministicImport, type DeterministicV31CanonicalDestination, type DeterministicV31WorkbookImport } from "../../workbook-v31-deterministic-core";
import { adaptWorkbookDestinationToIntelligenceV2Facts } from "../workbook-v32-adapter";

const WORKBOOK_PATH = path.resolve(process.cwd(), "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Private-Import-Authorized-v3.3.xlsx");
const EXPECTED_SHA256 = "9a76e2b4427dd78c17cb9e844b1f8eaae37f778e0a278589320b3d5c86991cac";
const EXPECTED_KEYS = [
  "tivat-montenegro", "matera-italy", "trieste-italy", "braga-portugal", "valencia-spain",
  "rijeka-croatia", "zadar-croatia", "piran-slovenia", "rovinj-croatia", "kanazawa-japan",
  "polignano-a-mare-italy", "cefalu-italy", "kalamata-greece", "taormina-italy", "podgorica-montenegro",
  "kotor-montenegro", "bergamo-italy", "pietrasanta-italy", "alicante-spain", "verona-italy",
] as const;
const EXPECTED_AFFORDABILITY: Record<string, readonly [single: number, couple: number]> = {
  "tivat-montenegro": [2050, 3000], "matera-italy": [1900, 2700], "trieste-italy": [2200, 3150],
  "braga-portugal": [1800, 2550], "valencia-spain": [2450, 3450], "rijeka-croatia": [1850, 2650],
  "zadar-croatia": [1950, 2800], "piran-slovenia": [2250, 3200], "rovinj-croatia": [2350, 3350],
  "kanazawa-japan": [1550, 2200], "polignano-a-mare-italy": [2100, 3000], "cefalu-italy": [1850, 2650],
  "kalamata-greece": [1650, 2350], "taormina-italy": [2775, 3900], "podgorica-montenegro": [1550, 2200],
  "kotor-montenegro": [1700, 2450], "bergamo-italy": [2000, 2850], "pietrasanta-italy": [3000, 4300],
  "alicante-spain": [2100, 3000], "verona-italy": [2250, 3200],
};

let destinations: readonly DeterministicV31CanonicalDestination[];
let workbookImport: DeterministicV31WorkbookImport;

beforeAll(async () => {
  workbookImport = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  destinations = workbookImport.canonicalDestinations ?? [];
});

describe("next-batch-20 cleaned workbook controlled integration", () => {
  it("pins the workbook hash, 48-sheet schema, and retained source row counts", () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    const inspection = JSON.parse(execFileSync(process.env.PYTHON || "python3", ["-c", [
      "import json,sys", "from openpyxl import load_workbook", "w=load_workbook(sys.argv[1],read_only=True,data_only=False)",
      "count=lambda name:sum(1 for r in w[name].iter_rows(values_only=True) if any(v is not None for v in r))-1",
      "print(json.dumps({'sheetCount':len(w.sheetnames),'resources':count('RESOURCES'),'places':count('PLACES'),'media':count('MEDIA'),'costs':count('COST_OF_LIVING'),'scores':count('DESTINATION_SCORES')}))",
    ].join(";"), WORKBOOK_PATH], { encoding: "utf8" }));
    expect(inspection).toEqual({ sheetCount: 48, resources: 590, places: 424, media: 80, costs: 40, scores: 0 });
  });

  it("parses exactly the approved 20 destinations without cross-destination rows or duplicate generated keys", () => {
    expect(destinations.map((destination) => destination.identity.destinationKey)).toEqual(EXPECTED_KEYS);
    for (const destination of destinations) {
      const destinationKey = destination.identity.destinationKey;
      for (const rows of [destination.facts, destination.scores, destination.neighborhoods, destination.places, destination.resources, destination.media, destination.costOfLiving]) {
        expect(rows.every((row) => row.destination_key === destinationKey), destinationKey).toBe(true);
      }
      for (const [rows, keyField] of [[destination.neighborhoods, "neighborhood_key"], [destination.places, "place_key"], [destination.resources, "resource_key"], [destination.media, "media_key"], [destination.costOfLiving, "record_key"]] as const) {
        const keys = rows.map((row) => String(row[keyField]));
        expect(new Set(keys).size, `${destinationKey}:${keyField}`).toBe(keys.length);
      }
    }
  });

  it("preserves all resource, place, media, and household rows through the canonical-to-stored mapping", () => {
    const stored = destinations.map(mapCanonicalDestinationToStoredState);
    expect(stored.reduce((sum, destination) => sum + destination.resources.length, 0)).toBe(590);
    expect(stored.reduce((sum, destination) => sum + destination.places.length, 0)).toBe(424);
    expect(stored.reduce((sum, destination) => sum + destination.media.length, 0)).toBe(80);
    expect(stored.reduce((sum, destination) => sum + destination.costOfLiving.length, 0)).toBe(40);
    expect(stored.every((destination) => destination.costOfLiving.map((row) => row.householdType).sort().join(",") === "couple,single")).toBe(true);
  });

  it("maps every authored range midpoint into the existing household-aware U3-R5 scalar contract", () => {
    for (const destination of destinations) {
      const destinationKey = destination.identity.destinationKey;
      const rows = new Map(destination.costOfLiving.map((row) => [row.household_type, row]));
      const midpoint = (household: "single" | "couple") => {
        const row = rows.get(household)!;
        return (Number(row.monthly_low) + Number(row.monthly_high)) / 2;
      };
      expect([midpoint("single"), midpoint("couple")], destinationKey).toEqual(EXPECTED_AFFORDABILITY[destinationKey]);
      expect(deriveRegisteredAffordability(destination), destinationKey).toEqual({
        destinationKey,
        singleMonthlyUsd: midpoint("single"),
        coupleMonthlyUsd: midpoint("couple"),
        estimateYear: 2026,
      });
    }
  });

  it("keeps the static base free of Next-20 identities and affordability estimates", () => {
    expect(smartShortlistCandidates).toHaveLength(36);
    expect(ownedAffordabilityByDestination).toHaveLength(36);
    for (const destinationKey of EXPECTED_KEYS) {
      expect(smartShortlistCandidates.some((candidate) => candidate.key === destinationKey), destinationKey).toBe(false);
      expect(ownedAffordabilityByDestination.has(destinationKey), destinationKey).toBe(false);
    }
  });

  it("derives registry candidate identity with unknown-safe decision defaults", () => {
    const candidate = deriveRegisteredCandidate(destinations[0]);
    expect(candidate).toMatchObject({
      key: "tivat-montenegro",
      name: "Tivat",
      slug: "tivat-montenegro",
      country: "Montenegro",
      countryCode: "ME",
      beachAccess: "UNKNOWN",
      mountainAccess: "UNKNOWN",
      oceanAccess: "UNKNOWN",
      healthcareStandard: "UNKNOWN",
      safetyStandard: "UNKNOWN",
      lgbtqLegalProtectionStatus: "UNKNOWN",
      affordabilityReadiness: "INSUFFICIENT_FOR_AFFORDABILITY",
    });
  });

  it("fails affordability derivation closed for missing, duplicate, or invalid household rows", () => {
    const destination = destinations[0];
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: destination.costOfLiving.filter((row) => row.household_type === "single") })).toBeNull();
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: [...destination.costOfLiving, destination.costOfLiving[0]] })).toBeNull();
    expect(deriveRegisteredAffordability({ ...destination, costOfLiving: destination.costOfLiving.map((row) => row.household_type === "couple" ? { ...row, monthly_high: "not-a-number" } : row) })).toBeNull();
  });

  it("admits only canonical keys owned by the approved registry entry", () => {
    const entry = EXPANSION_WORKBOOK_REGISTRY.find((candidate) => candidate.registryId === "next-batch-20-private-import-authorized")!;
    const contributions = buildRegisteredWorkbookContributions(entry, workbookImport, new Set(smartShortlistCandidates.map((candidate) => candidate.key)));
    expect(contributions.candidates.map((candidate) => candidate.key)).toEqual(EXPECTED_KEYS);
    expect(contributions.affordabilityRecords).toHaveLength(20);

    expect(() => buildRegisteredWorkbookContributions(
      { ...entry, expectedDestinationKeys: entry.expectedDestinationKeys.slice(1) },
      workbookImport,
      new Set(),
    )).toThrow(/do not match its approved registry ownership/);
  });

  it("derives a future registered destination and both household values without production lists", () => {
    const source = destinations[0];
    const destinationKey = "future-fixture-destination";
    const syntheticDestination: DeterministicV31CanonicalDestination = {
      ...source,
      identity: { ...source.identity, destinationKey, slug: destinationKey, name: "Future Fixture", city: "Future Fixture" },
      destinationRow: { ...source.destinationRow, destination_key: destinationKey },
      costOfLiving: source.costOfLiving.map((row) => ({ ...row, destination_key: destinationKey })),
    };
    const syntheticWorkbook: DeterministicV31WorkbookImport = {
      ...workbookImport,
      canonicalDestinations: [syntheticDestination],
    };
    const contributions = buildRegisteredWorkbookContributions({
      registryId: "future-fixture",
      workbookPath: "fixture.xlsx",
      environment: "preview",
      expectedDestinationKeys: [destinationKey],
      expectedSha256: "fixture-hash",
    }, syntheticWorkbook, new Set(smartShortlistCandidates.map((candidate) => candidate.key)));

    expect(contributions.candidates).toEqual([expect.objectContaining({
      key: destinationKey,
      name: "Future Fixture",
      slug: destinationKey,
      beachAccess: "UNKNOWN",
      healthcareStandard: "UNKNOWN",
    })]);
    expect(contributions.affordabilityRecords).toEqual([{
      destinationKey,
      singleMonthlyUsd: 2050,
      coupleMonthlyUsd: 3000,
      estimateYear: 2026,
    }]);
  });

  it("keeps both source households while projecting only single into the one-household Intelligence V2 cost fact", () => {
    for (const destination of destinations) {
      const { facts, mappingErrors } = adaptWorkbookDestinationToIntelligenceV2Facts(destination);
      const single = destination.costOfLiving.find((row) => row.household_type === "single")!;
      expect(facts.cost.estimatedMonthlyCostRange, destination.identity.destinationKey).toEqual({
        low: Number(single.monthly_low), high: Number(single.monthly_high), currencyCode: "USD",
      });
      expect(facts.cost.householdSizeAssumedForEstimate).toBe(1);
      expect(mappingErrors.some((error) => error.factPath === "cost.householdSizeAssumedForEstimate")).toBe(false);
      expect(destination.costOfLiving).toHaveLength(2);
      expect(facts.lifestyleDimensions.dimensionValues).toEqual({});
    }
  });
});