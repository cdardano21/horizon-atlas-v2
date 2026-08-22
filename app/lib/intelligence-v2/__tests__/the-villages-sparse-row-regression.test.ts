import { describe, expect, it, beforeAll } from "vitest";
import path from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { loadFrozenWorkbookV31DeterministicImport } from "../../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport, type IntelligenceV2DestinationFacts } from "../workbook-v32-adapter";

/**
 * Phase 12.6 — real The Villages regression proof for the sparse-OOXML column
 * alignment fix. Runs the REAL deterministic parser + REAL workbook-v32
 * adapter (no mocks) against the real, already-approved (unstaged) Batch #1
 * workbook to prove the previously-corrupted TAXES_FINANCE facts now resolve
 * correctly, with zero left-shift and zero mapping errors.
 */

const BATCH01_PATH = path.resolve(process.cwd(), "data/DestinationFinderAI_Expansion_Batch_01_5_Destinations_v3.2.xlsx");

function sha256(filePath: string): string {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}

let workbookHashBefore: string;
let facts: IntelligenceV2DestinationFacts;
let mappingErrors: readonly unknown[];

beforeAll(async () => {
  workbookHashBefore = sha256(BATCH01_PATH);
  const workbookImport = await loadFrozenWorkbookV31DeterministicImport(BATCH01_PATH);
  expect(workbookImport.validationErrors).toEqual([]);
  const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbookImport, "the-villages-fl-us");
  expect(adapted).not.toBeNull();
  facts = adapted!.facts;
  mappingErrors = adapted!.mappingErrors;
});

describe("The Villages real sparse-row regression proof (post parser fix)", () => {
  it("keeps the real Batch #1 workbook byte-for-byte unchanged", () => {
    expect(sha256(BATCH01_PATH)).toBe(workbookHashBefore);
  });

  it("zero mapping errors - the two previously-observed alignment errors are gone", () => {
    expect(mappingErrors).toEqual([]);
  });

  it("domestic-N/A financial fields remain correctly blank (no left-shift into them)", () => {
    expect(facts.financial.taxResidencyTriggerDays).toBeNull();
    expect(facts.financial.usTaxTreatyInEffect).toBe("UNKNOWN");
    expect(facts.financial.foreignTaxCreditAvailable).toBe("UNKNOWN");
  });

  it("all 5 approved retirement-income/wealth-tax facts resolve to their exact approved values", () => {
    expect(facts.financial.pensionTreatment).toBe("EXEMPT");
    expect(facts.financial.socialSecurityTreatment).toBe("EXEMPT");
    expect(facts.financial.iraTreatment).toBe("EXEMPT");
    expect(facts.financial.retirementAccount401kTreatment).toBe("EXEMPT");
    expect(facts.financial.wealthTaxApplicable).toBe("NO");
  });

  it("beach/mountain facts resolve to their exact approved values", () => {
    expect(facts.hardGates.beachAccess).toBe("NEARBY");
    expect(facts.hardGates.mountainOrSkiAccess).toBe("NONE");
  });

  it("previously-fixed Phase 12.2 facts remain correct (cost range, foreign-property, healthcare)", () => {
    expect(facts.cost.estimatedMonthlyCostRange).toEqual({ low: 3454, high: 6650, currencyCode: "USD" });
    expect(facts.entryAndStay.foreignPropertyPurchaseAllowed).toBe("YES");
    expect(facts.hardGates.healthcareStandard).toBe("GOOD_PRIVATE_AVAILABLE");
  });
});
