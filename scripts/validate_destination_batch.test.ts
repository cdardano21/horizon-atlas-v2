import { EXPANSION_WORKBOOK_REGISTRY } from "../app/lib/expansion-workbook-registry";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import contract from "../docs/destinationfinder/batch-contract-v3.3.json";
import { validateAuthoringParity, validateClimateRows, validateDestinationBatch } from "./validate_destination_batch";

const WORKBOOK_PATH = "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Visual-Parity-Enriched-v3.3.xlsx";
const THIN_WORKBOOK_PATH = "data/next-batch-20/DestinationFinderAI-Next-Batch-20-Private-Import-Authorized-v3.3.xlsx";

function parityFixture(options: { population?: unknown; lifestyleCount?: number; copy?: string } = {}) {
  const destinationKey = "fixture-city";
  const lifestyleCount = options.lifestyleCount ?? 14;
  return {
    destinationRows: [{ destinationKey, population: options.population ?? 123456 }],
    sourceRows: [{
      destinationKey,
      sourceKey: "fixture-city-population",
      sourceName: "Official statistics office",
      sourceUrl: "https://example.gov/population",
      sourceType: "official_statistics",
      notes: "Population for fixture city.",
    }],
    lifestyleRows: Array.from({ length: lifestyleCount }, (_, index) => ({
      recordKey: `fixture-city-lifestyle-${index + 1}`,
      destinationKey,
      featureKey: index % 2 === 0 ? "community" : "natural_setting",
      displayName: `Destination-specific feature ${index + 1}`,
      displayOrder: index + 1,
      evidenceSummary: `Distinct destination-specific evidence ${index + 1}.`,
      sourceUrl: `https://example.gov/lifestyle/${index + 1}`,
    })),
    customerCopyCells: options.copy ? [{
      sheet: "SAFETY_RISKS",
      field: "summary",
      row: 2,
      destinationKey,
      value: options.copy,
    }] : [],
  };
}

describe("read-only destination batch validator", () => {
  it("distinguishes the full 48-sheet authoring contract from the parser's 10-sheet compatibility minimum", () => {
    expect(contract.sheetContract.authoringSheetCount).toBe(48);
    expect(contract.sheetContract.sheetOrder).toHaveLength(48);
    expect(contract.sheetContract.parserCompatibilityMinimumCount).toBe(10);
    expect(contract.sheetContract.parserCompatibilityRequiredSheets).toHaveLength(10);
  });

  it("accepts the enriched authorized Next-20 workbook as authoring-complete", async () => {
    const report = await validateDestinationBatch({
      workbookPath: WORKBOOK_PATH,
      registryId: "next-batch-20-private-import-authorized",
    });

    expect(report.readOnly).toBe(true);
    expect(report.sheetCount).toBe(48);
    expect(report.structuralStatus).toBe("PASS");
    expect(report.parserStatus).toBe("PASS");
    expect(report.batchIntegrityStatus).toBe("PASS");
    expect(report.authoringParityStatus).toBe("PASS");
    expect(report.authoringReadinessStatus).toBe("AUTHORING_COMPLETE");
    expect(report.parsedDestinationKeys).toHaveLength(20);
    expect(report.errors).toEqual([]);
    expect(report.authoringParityErrors).toEqual([]);
    expect(report.destinationSummaries.every((destination) => destination.populationPresent)).toBe(true);
    expect(report.destinationSummaries.every((destination) => destination.populationProvenancePresent)).toBe(true);
    expect(report.destinationSummaries.every((destination) => destination.displayableLifestyleRows >= 14)).toBe(true);
    expect(report.destinationSummaries.reduce((total, destination) => total + destination.displayableLifestyleRows, 0)).toBe(312);
    expect(report.destinationScoreRowCount).toBe(0);
    expect(report.warnings.some((warning) => warning.includes("U3-R5 rows are not marked verified"))).toBe(true);
    expect(report.warnings.some((warning) => warning.includes("unresolved decision facts"))).toBe(true);
  });

  it("rejects a parity fixture with one missing population", () => {
    const result = validateAuthoringParity(parityFixture({ population: "UNKNOWN" }), ["fixture-city"], contract.authoringParity);
    expect(result.errors.some((error) => error.startsWith("AUTHORING_PARITY_POPULATION_MISSING"))).toBe(true);
  });

  it("rejects a parity fixture with only three lifestyle rows", () => {
    const result = validateAuthoringParity(parityFixture({ lifestyleCount: 3 }), ["fixture-city"], contract.authoringParity);
    expect(result.errors.some((error) => error.startsWith("AUTHORING_PARITY_LIFESTYLE_TOO_THIN"))).toBe(true);
  });

  it("rejects clearly internal technical language in customer-visible copy", () => {
    const result = validateAuthoringParity(parityFixture({ copy: "For Intelligence V2 this row supplies a token." }), ["fixture-city"], contract.authoringParity);
    expect(result.errors.some((error) => error.startsWith("CUSTOMER_COPY_INTERNAL_TECHNICAL_LANGUAGE"))).toBe(true);
  });

  it("accepts 14 distinct destination-specific sourced lifestyle rows", () => {
    const result = validateAuthoringParity(parityFixture(), ["fixture-city"], contract.authoringParity);
    expect(result.errors).toEqual([]);
  });

  it("does not label a structurally valid but visually thin workbook authoring-complete", async () => {
    const report = await validateDestinationBatch({
      workbookPath: THIN_WORKBOOK_PATH,
      expectedDestinationKeys: [
        "tivat-montenegro", "matera-italy", "trieste-italy", "braga-portugal", "valencia-spain",
        "rijeka-croatia", "zadar-croatia", "piran-slovenia", "rovinj-croatia", "kanazawa-japan",
        "polignano-a-mare-italy", "cefalu-italy", "kalamata-greece", "taormina-italy", "podgorica-montenegro",
        "kotor-montenegro", "bergamo-italy", "pietrasanta-italy", "alicante-spain", "verona-italy",
      ],
    });
    expect(report.structuralStatus).toBe("PASS");
    expect(report.parserStatus).toBe("PASS");
    expect(report.batchIntegrityStatus).toBe("PASS");
    expect(report.authoringParityStatus).toBe("FAIL");
    expect(report.authoringReadinessStatus).toBe("REVIEW_REQUIRED");
  });
});

describe("climate direct values and cached formula results", () => {
  const rows = () => Array.from({ length: 12 }, (_, i) => ({
    destinationKey: "fixture-city", month: i + 1, values: [25, 12, 0, 65] as unknown[],
  }));
  it("accepts twelve complete numeric months, including zero rainfall", () => {
    expect(validateClimateRows(rows(), ["fixture-city"])).toEqual([]);
  });
  it.each([null, "not numeric", "25", true, NaN, Infinity])("rejects missing or invalid direct/cache value %s", (value) => {
    const fixture = rows(); fixture[0].values[0] = value;
    expect(validateClimateRows(fixture, ["fixture-city"])).toContain(
      "CLIMATE_MONTHLY fixture-city/1: avg_high_c requires a finite numeric direct value or cached formula result.",
    );
  });
  it("rejects duplicate months even when the row count remains twelve", () => {
    const fixture = rows(); fixture[11].month = 1;
    const errors = validateClimateRows(fixture, ["fixture-city"]);
    expect(errors).toContain("CLIMATE_MONTHLY fixture-city/1: duplicate destination/month.");
    expect(errors).toContain("CLIMATE_MONTHLY fixture-city: expected 12 distinct months; found 11.");
  });
  it("rejects missing months and foreign destination ownership", () => {
    const fixture = rows(); fixture[0].destinationKey = "another-city";
    expect(validateClimateRows(fixture, ["fixture-city"])).toEqual([
      "CLIMATE_MONTHLY another-city/1: unexpected destination ownership.",
      "CLIMATE_MONTHLY fixture-city: expected 12 distinct months; found 11.",
    ]);
  });
  it.each([0, 13, 1.5])("rejects invalid month %s", (month) => {
    const fixture = rows(); fixture[0].month = month;
    expect(validateClimateRows(fixture, ["fixture-city"])[0]).toContain("month must be an integer from 1 to 12");
  });
});


describe("climate workbook cell integration", () => {
  it.each(["direct", "missing", "invalid", "uncached-formula"])("validates %s climate cells from actual workbook bytes", async (mode) => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "climate-validator-test-"));
    const workbookPath = path.join(dir, "fixture.xlsx");
    try {
      execFileSync(process.env.PYTHON || "python3", ["-c", `
import openpyxl,sys
w=openpyxl.load_workbook(sys.argv[1],data_only=True)
s=w['CLIMATE_MONTHLY']
if sys.argv[3]=='missing': s['C2']=None
if sys.argv[3]=='invalid': s['C2']='invalid'
if sys.argv[3]=='uncached-formula': s['C2']='=20+5'
w.save(sys.argv[2])
`, WORKBOOK_PATH, workbookPath, mode]);
      const expectedDestinationKeys = [...EXPANSION_WORKBOOK_REGISTRY.find(entry => entry.registryId === "next-batch-20-private-import-authorized")!.expectedDestinationKeys];
      const report = await validateDestinationBatch({ workbookPath, expectedDestinationKeys });
      if (mode === "direct") {
        expect(report.errors).toEqual([]);
        expect(report.authoringReadinessStatus).toBe("AUTHORING_COMPLETE");
      } else {
        expect(report.errors.some(error => error.includes("avg_high_c requires a finite numeric direct value or cached formula result"))).toBe(true);
        expect(report.authoringReadinessStatus).toBe("REVIEW_REQUIRED");
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
