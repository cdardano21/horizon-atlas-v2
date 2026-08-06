import { describe, expect, it, vi } from "vitest";
import { parseBatchImportFile } from "./batchImportFileUtils";

describe("batch import file parser", () => {
  it("parses workbook rows from a selected sheet", async () => {
    const mockSheetToJson = vi.fn((sheet: unknown) => {
      if (sheet && typeof sheet === "object" && "__sheetName" in sheet) {
        const sheetName = (sheet as { __sheetName?: string }).__sheetName;
        if (sheetName === "Sheet2") {
          return [{ city: "Lisbon", country: "Portugal" }];
        }
      }

      return [{ city: "Paris", country: "France" }];
    });

    const mockXlsx = {
      read: vi.fn(() => ({
        SheetNames: ["Sheet1", "Sheet2"],
        Sheets: {
          Sheet1: { __sheetName: "Sheet1" },
          Sheet2: { __sheetName: "Sheet2" },
        },
      })),
      utils: {
        sheet_to_json: mockSheetToJson,
      },
    };

    Object.defineProperty(globalThis, "window", {
      value: { XLSX: mockXlsx },
      configurable: true,
    });

    const file = new File([new Uint8Array([1, 2, 3])], "sample.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const parsed = await parseBatchImportFile(file);

    expect(parsed.sourceType).toBe("excel");
    expect(parsed.workbookSheets).toEqual(["Sheet1", "Sheet2"]);
    expect(parsed.selectedSheet).toBe("Sheet1");
    expect(parsed.rows).toEqual([{ city: "Paris", country: "France" }]);
    expect(parsed.workbookRowsBySheet?.Sheet2).toEqual([{ city: "Lisbon", country: "Portugal" }]);
    expect(mockSheetToJson).toHaveBeenCalled();
  });
});
