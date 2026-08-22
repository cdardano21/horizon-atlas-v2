import { describe, expect, it } from "vitest";
import { buildSparseTestWorkbook } from "./sparse-ooxml-fixture-builder";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";

/**
 * Phase 12.6 — focused regression tests proving the deterministic parser
 * correctly honors each cell's r="A1"-style column reference instead of
 * relying on physical <c> encounter order, which valid OOXML may omit for
 * blank cells. Each test builds a minimal synthetic workbook with an exact,
 * hand-specified set of physically-present cells (see sparse-ooxml-fixture-builder.ts).
 */

async function destinationRowFor(fixturePath: string, destinationKey: string) {
  const result = await loadFrozenWorkbookV31DeterministicImport(fixturePath);
  expect(result.validationErrors).toEqual([]);
  const dest = result.canonicalDestinations.find((d) => d.identity.destinationKey === destinationKey);
  expect(dest).toBeDefined();
  return dest!.destinationRow as Record<string, string | null>;
}

const HEADER_ROW = {
  rowNumber: 1,
  cells: [
    { col: "A", value: "destination_key" },
    { col: "B", value: "probe_b" },
    { col: "C", value: "probe_c" },
    { col: "D", value: "probe_d" },
    { col: "E", value: "probe_e" },
    { col: "F", value: "probe_f" },
    { col: "G", value: "probe_g" },
  ],
};

describe("deterministic parser — sparse OOXML cell alignment", () => {
  it("A. dense row: A/B/C all physically present -> unchanged alignment", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "dense-dest" }, { col: "B", value: "b-value" }, { col: "C", value: "c-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "dense-dest");
    expect(row.probe_b).toBe("b-value");
    expect(row.probe_c).toBe("c-value");
  });

  it("B. single interior gap: A and C present, B omitted -> B blank, C maps to C", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "gap-dest" }, { col: "C", value: "c-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "gap-dest");
    expect(row.probe_b).toBeNull();
    expect(row.probe_c).toBe("c-value");
  });

  it("C. multiple gaps: A, D, G present -> B/C/E/F blank, D and G correct", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "multi-gap-dest" }, { col: "D", value: "d-value" }, { col: "G", value: "g-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "multi-gap-dest");
    expect(row.probe_b).toBeNull();
    expect(row.probe_c).toBeNull();
    expect(row.probe_d).toBe("d-value");
    expect(row.probe_e).toBeNull();
    expect(row.probe_f).toBeNull();
    expect(row.probe_g).toBe("g-value");
  });

  it("D. leading blanks: first physical cell is C -> A/B blank, C correct", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        // destination_key itself (A) must be present to identify the row, so use B/C as the leading-blank probe pair instead.
        { rowNumber: 2, cells: [{ col: "A", value: "leading-blank-dest" }, { col: "D", value: "d-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "leading-blank-dest");
    expect(row.probe_b).toBeNull();
    expect(row.probe_c).toBeNull();
    expect(row.probe_d).toBe("d-value");
  });

  it("E. trailing blanks: row ends before header width -> existing downstream blank behavior preserved", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "trailing-blank-dest" }, { col: "B", value: "b-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "trailing-blank-dest");
    expect(row.probe_b).toBe("b-value");
    expect(row.probe_c).toBeNull();
    expect(row.probe_d).toBeNull();
    expect(row.probe_e).toBeNull();
    expect(row.probe_f).toBeNull();
    expect(row.probe_g).toBeNull();
  });

  it("F. multi-letter columns: Z, AA, AB, BA resolve to correct indices", async () => {
    const headerWithMultiLetter = {
      rowNumber: 1,
      cells: [
        { col: "A", value: "destination_key" },
        { col: "Z", value: "probe_z" },
        { col: "AA", value: "probe_aa" },
        { col: "AB", value: "probe_ab" },
        { col: "BA", value: "probe_ba" },
      ],
    };
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        headerWithMultiLetter,
        {
          rowNumber: 2,
          cells: [
            { col: "A", value: "multi-letter-dest" },
            { col: "Z", value: "z-value" },
            { col: "AA", value: "aa-value" },
            { col: "AB", value: "ab-value" },
            { col: "BA", value: "ba-value" },
          ],
        },
      ],
    });
    const row = await destinationRowFor(fixture, "multi-letter-dest");
    expect(row.probe_z).toBe("z-value");
    expect(row.probe_aa).toBe("aa-value");
    expect(row.probe_ab).toBe("ab-value");
    expect(row.probe_ba).toBe("ba-value");
  });

  it("G. sparse Excel boolean: still maps to correct column, raw \"1\"/\"0\" dialect unchanged", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "bool-dest" }, { col: "D", value: "1", type: "bool" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "bool-dest");
    expect(row.probe_b).toBeNull();
    expect(row.probe_c).toBeNull();
    expect(row.probe_d).toBe("1"); // raw parser dialect preserved - normalization layer interprets this, not the parser
  });

  it("H. sparse shared string: maps to correct column and decodes correctly", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "shared-string-dest" }, { col: "E", value: "shared-value", type: "shared" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "shared-string-dest");
    expect(row.probe_d).toBeNull();
    expect(row.probe_e).toBe("shared-value");
    expect(row.probe_f).toBeNull();
  });

  it("I. sparse numeric: maps to correct column/value", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        { rowNumber: 2, cells: [{ col: "A", value: "numeric-dest" }, { col: "F", value: "184", type: "number" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "numeric-dest");
    expect(row.probe_e).toBeNull();
    expect(row.probe_f).toBe("184");
    expect(row.probe_g).toBeNull();
  });

  it("J. sparse header row: header itself has an omitted cell, headers remain correctly aligned", async () => {
    const sparseHeader = {
      rowNumber: 1,
      cells: [{ col: "A", value: "destination_key" }, { col: "C", value: "probe_c" }], // B (probe_b) header cell physically omitted
    };
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        sparseHeader,
        { rowNumber: 2, cells: [{ col: "A", value: "sparse-header-dest" }, { col: "C", value: "c-value" }] },
      ],
    });
    const row = await destinationRowFor(fixture, "sparse-header-dest");
    expect(row.probe_c).toBe("c-value");
  });
});

describe("deterministic parser — missing/malformed cell reference fallback", () => {
  it("falls back to sequential placement (never crashes) when r is omitted on a cell", async () => {
    const fixture = buildSparseTestWorkbook({
      DESTINATIONS: [
        HEADER_ROW,
        {
          rowNumber: 2,
          cells: [
            { col: "A", value: "malformed-ref-dest" },
            { col: "B", value: "b-value", omitRef: true }, // no r attribute at all
          ],
        },
      ],
    });
    const row = await destinationRowFor(fixture, "malformed-ref-dest");
    // Sequential fallback places this cell right after the previous resolved column (A=0 -> next=1=B).
    expect(row.probe_b).toBe("b-value");
  });
});
