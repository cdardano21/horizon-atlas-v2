import { describe, expect, it } from "vitest";
import contract from "../docs/destinationfinder/batch-contract-v3.3.json";
import { validateAuthoringParity, validateDestinationBatch } from "./validate_destination_batch";

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