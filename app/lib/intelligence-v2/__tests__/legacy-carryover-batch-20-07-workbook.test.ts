import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXPANSION_WORKBOOK_REGISTRY } from "../../expansion-workbook-registry";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { mapCanonicalDestinationToStoredState } from "../../persistence/v31/map-canonical-destination-to-stored-state";

const WORKBOOK_PATH = "data/legacy-carryover-batch-20-07/DestinationFinderAI-Next-Legacy-Batch-20-07-Contract-Repaired-v3.3.xlsx";
const EXPECTED_SHA256 = "73c281d00f45d4741ef8e063c85e700bafef3db195428ec42754e23b2182c360";
const EXPECTED_KEYS = ["buenos-aires-argentina", "brisbane-australia", "bruges-belgium", "curitiba-brazil", "santiago-chile", "bogota-colombia", "makarska-croatia", "aix-en-provence-france", "chania-greece", "aosta-italy", "kurashiki-japan", "todos-santos-mexico", "muscat-oman", "panama-city-panama", "cape-town-south-africa", "seoul-south-korea", "a-coruna-spain", "phuket-thailand", "belfast-united-kingdom", "albuquerque-new-mexico-united-states"];

describe("legacy carryover batch 20-07 workbook", () => {
  it("pins the exact imported workbook, ownership and locked identities", async () => {
    expect(createHash("sha256").update(readFileSync(WORKBOOK_PATH)).digest("hex")).toBe(EXPECTED_SHA256);
    const entry = EXPANSION_WORKBOOK_REGISTRY.find(e => e.registryId === "legacy-carryover-batch-20-07");
    expect(entry).toMatchObject({ workbookPath: WORKBOOK_PATH, expectedSha256: EXPECTED_SHA256, expectedDestinationKeys: EXPECTED_KEYS });
    const parsed = await loadFrozenWorkbookV31DeterministicImport(WORKBOOK_PATH);
    expect(parsed.validationErrors).toEqual([]);
    const destinations = parsed.canonicalDestinations ?? [];
    expect(destinations.map(d => d.identity.destinationKey).sort()).toEqual([...EXPECTED_KEYS].sort());
    for (const d of destinations) {
      const key = d.identity.destinationKey;
      const stored = mapCanonicalDestinationToStoredState(d);
      for (const [module, count] of [["neighborhoods", 5], ["places", 18], ["resources", 18], ["media", 4], ["climateMonthly", 12], ["lifestyleFeatures", 14]] as const) {
        expect(stored[module].length, key + "/" + module).toBe(count);
      }
      expect(Number(d.identity.population), key + "/population").toBeGreaterThan(0);
      expect(stored.identity.population, key + "/stored population").toBe(String(d.identity.population));
      expect(d.media.filter(m => m.media_type === "hero"), key + "/hero").toHaveLength(1);
      expect(d.media.filter(m => m.media_type === "gallery"), key + "/gallery").toHaveLength(3);
      expect(d.climateMonthly.map(m => Number(m.month)).sort((a, b) => a - b), key + "/months").toEqual(Array.from({ length: 12 }, (_, i) => i + 1));
      const affordability = d.costOfLiving.filter(r => r.category === "u3_r5_total_monthly_estimate");
      expect(affordability.map(r => r.household_type).sort(), key + "/households").toEqual(["couple", "single"]);
    }
  });
});
