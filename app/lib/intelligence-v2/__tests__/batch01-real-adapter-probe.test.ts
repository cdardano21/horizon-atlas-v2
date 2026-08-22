import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport, type IntelligenceV2DestinationFacts } from "../workbook-v32-adapter";

/**
 * Phase 12.2 — mandatory real Batch #1 probe. Runs the REAL deterministic
 * parser + REAL workbook-v32 adapter (no mocks) against the real Batch #1
 * workbook to prove the three hardening fixes (cost rollup, Excel-boolean
 * TriState dialect, housing buy-row selection) resolve real workbook data
 * correctly. READ-ONLY - the workbook is never modified; this test only
 * proves its hash is unchanged before/after the run.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

const EXPECTED_COST_RANGES: Record<string, { low: number; high: number; currencyCode: string }> = {
  "the-villages-fl-us": { low: 3454, high: 6650, currencyCode: "USD" },
  "sofia-bg": { low: 1370, high: 2660, currencyCode: "EUR" },
  "puerto-vallarta-mx": { low: 34600, high: 71500, currencyCode: "MXN" },
  "hoi-an-vn": { low: 20500000, high: 45000000, currencyCode: "VND" },
  "queenstown-nz": { low: 4600, high: 8000, currencyCode: "NZD" },
};

let workbookHashBefore: string;
const factsByDestination = new Map<string, IntelligenceV2DestinationFacts>();
const mappingErrorsByDestination = new Map<string, readonly unknown[]>();

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);

  for (const destKey of Object.keys(EXPECTED_COST_RANGES)) {
    const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, destKey);
    expect(adapted).not.toBeNull();
    factsByDestination.set(destKey, adapted!.facts);
    mappingErrorsByDestination.set(destKey, adapted!.mappingErrors);
  }
});

describe("Batch #1 real adapter probe — cost rollup, boolean dialect, and housing row selection all fixed", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  for (const [destKey, expectedRange] of Object.entries(EXPECTED_COST_RANGES)) {
    it(`${destKey}: cost range is the component-derived range only, no longer doubled by the total_monthly rollup`, () => {
      const facts = factsByDestination.get(destKey)!;
      expect(facts.cost.estimatedMonthlyCostRange).toEqual(expectedRange);
    });
  }

  it("the-villages-fl-us: foreign-property and healthcare facts resolve from Excel boolean cells (no longer UNKNOWN)", () => {
    const facts = factsByDestination.get("the-villages-fl-us")!;
    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES"); // can_foreigners_buy=TRUE
    expect(facts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE"); // private_care_available=TRUE
  });

  it("cross-border destinations: foreign-property facts resolve using each destination's actual (not assumed identical) boolean value", () => {
    // Confirmed real workbook values: Sofia/Puerto Vallarta = TRUE, Hoi An/Queenstown = FALSE.
    expect(factsByDestination.get("sofia-bg")!.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(factsByDestination.get("puerto-vallarta-mx")!.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(factsByDestination.get("hoi-an-vn")!.entryAndStay.foreignPropertyPurchaseAllowed).toBe("NO");
    expect(factsByDestination.get("queenstown-nz")!.entryAndStay.foreignPropertyPurchaseAllowed).toBe("NO");
  });

  it("all five destinations: healthcareStandard resolves to GOOD_PRIVATE_AVAILABLE (private_care_available=TRUE for all five in the real workbook)", () => {
    for (const destKey of Object.keys(EXPECTED_COST_RANGES)) {
      expect(factsByDestination.get(destKey)!.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
    }
  });

  it("all five destinations: zero mapping errors remain from the previously-observed invalid-TriState-token failures", () => {
    for (const destKey of Object.keys(EXPECTED_COST_RANGES)) {
      const errors = mappingErrorsByDestination.get(destKey)!;
      const triStateErrors = errors.filter((e) => JSON.stringify(e).includes("Invalid TriState token"));
      expect(triStateErrors).toEqual([]);
    }
  });
});
