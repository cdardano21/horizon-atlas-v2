// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { zipSync, strToU8 } from "fflate";
import { EXPANSION_WORKBOOK_REGISTRY } from "./expansion-workbook-registry";
import { readXlsxWorkbookRows } from "./xlsx-workbook-rows";
import * as reader from "./xlsx-workbook-rows";
import { loadFrozenWorkbookV31DeterministicImport } from "./workbook-v31-deterministic-core";
import { parseWorkbookRowsWithPython } from "./__tests__/python-workbook-row-oracle";
import { buildSparseTestWorkbook } from "./__tests__/sparse-ooxml-fixture-builder";

const compare = (file: string) => {
  const oracle = parseWorkbookRowsWithPython(file).rawPayload;
  const actual = readXlsxWorkbookRows(file);
  expect(Object.keys(actual)).toEqual(Object.keys(oracle));
  expect(actual).toEqual(oracle);
  return actual;
};

describe("raw XLSX decoder Python parity", () => {
  for (const entry of EXPANSION_WORKBOOK_REGISTRY) {
    it(entry.registryId, () => {
      const file = path.resolve(entry.workbookPath);
      expect(createHash("sha256").update(readFileSync(file)).digest("hex")).toBe(entry.expectedSha256);
      const rows = compare(file);
      if (entry.workbookPath.includes("Media-Repaired-Non-Media-Preserved")) {
        const climate = rows.CLIMATE_MONTHLY;
        const numericColumns = ["avg_high_c", "avg_low_c", "rainfall_mm", "humidity_pct"];
        // All authored climate cells are also covered by the full raw-output comparison.
        expect(climate).toHaveLength(241);
        const cells = climate.slice(1).flatMap((row) => numericColumns.map((header) => row[climate[0].indexOf(header)]));
        expect(cells).toHaveLength(960);
        expect(cells.every((value) => value !== undefined && value !== "" && Number.isFinite(Number(value)))).toBe(true);
      }
    }, 30_000);
  }
  it("frozen pilot", () => compare(path.resolve("data/DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx")), 30_000);
  it("existing sparse fixture builder, empty rows, missing references and shared strings", () => {
    const file = buildSparseTestWorkbook({ PROBE: [
      { rowNumber: 1, cells: [{ col: "A", value: "  Header  " }, { col: "AA", value: "rich &amp; text", type: "shared" }] },
      { rowNumber: 9, cells: [] },
      { rowNumber: 10, cells: [{ col: "C", value: "001.2300", type: "number" }, { col: "D", value: "1", type: "bool" }, { col: "Z", value: "tail", omitRef: true }] },
    ] });
    try { compare(file); } finally { rmSync(path.dirname(file), { recursive: true, force: true }); }
  });
  it("cached formulas, raw dates, rich text, duplicate and malformed cell references", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "xlsx-parity-"));
    const file = path.join(dir, "probe.xlsx");
    const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    writeFileSync(file, zipSync(Object.fromEntries(Object.entries({
      "xl/workbook.xml": `<workbook xmlns="${ns}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="PROBE" r:id="r1"/></sheets></workbook>`,
      "xl/_rels/workbook.xml.rels": '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="r1" Target="/xl/worksheets/sheet1.xml"/></Relationships>',
      "xl/worksheets/sheet1.xml": `<worksheet xmlns="${ns}"><sheetData><row r="7"><c r="A7"><f>1+2</f><v>3.000</v></c><c r="B7" t="d"><v>2026-01-01T00:00:00</v></c><c r="C7" s="1"><v>45200</v></c><c r="D7"><f>1+2</f><v/></c><c r="E7" t="inlineStr"><is><r><t> hello </t></r><r><t>&amp; world</t></r></is></c><c r="E7"><v>last</v></c><c r="invalid"><v>next</v></c></row></sheetData></worksheet>`,
    }).map(([key, value]) => [key, strToU8(value)]))));
    try { expect(compare(file).PROBE[0]).toEqual(["3.000", "2026-01-01T00:00:00", "45200", "", "last", "next"]); }
    finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

// Exercise unchanged canonical normalization with each decoder as its input.
describe("canonical destination parity", () => {
  const paths = [...EXPANSION_WORKBOOK_REGISTRY.map((entry) => entry.workbookPath), "data/DestinationFinderAI_Master_Workbook_v3.1_FROZEN_Pilot_Dataset.xlsx"];
  for (const workbook of paths) {
    it(workbook, async () => {
      const file = path.resolve(workbook);
      const actual = await loadFrozenWorkbookV31DeterministicImport(file);
      const oracleRows = Object.fromEntries(parseWorkbookRowsWithPython(file).sheetRows);
      const spy = vi.spyOn(reader, "readXlsxWorkbookRows").mockReturnValue(oracleRows);
      try {
        const expected = await loadFrozenWorkbookV31DeterministicImport(file);
        expect(actual).toEqual(expected);
      } finally { spy.mockRestore(); }
    }, 30_000);
  }
});

describe("pilot enrichment without Python", () => {
  for (const [slug, key, population] of [
    ["lisbon-portugal", "lisbon-pt", "575000"],
    ["new-braunfels-texas-united-states", "new-braunfels-tx-us", "110000"],
    ["summerlin-las-vegas-nevada", "summerlin-nv-us", "100000"],
  ]) {
    it(slug, async () => {
      const { loadPremiumWorkbookDestinationData } = await import("./workbook-runtime-loader");
      vi.stubEnv("PATH", "/nonexistent-python-free-path");
      vi.stubEnv("PYTHON", "/nonexistent-python-free-path/python3");
      try {
        const result = await loadPremiumWorkbookDestinationData(slug);
        expect(result?.destinationKey).toBe(key);
        expect(result?.knowledgeProfile?.population).toBe(population);
      } finally { vi.unstubAllEnvs(); }
    }, 30_000);
  }
});
