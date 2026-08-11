import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { diffNonKeyedRepeatableModule, diffSingletonModule } from "../diff-non-keyed";

describe("diffNonKeyedRepeatableModule", () => {
  const policy = {
    updateMode: "MERGE_NONBLANK" as const,
    normalizationVersion: "v1",
    diffPolicyVersion: "v1",
  };

  const baseRows = [
    { record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" },
    { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
  ];

  it("treats [] vs [] as unchanged", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: [],
      incomingValue: [],
      policy,
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
  });

  it("preserves a populated module when incoming is empty", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [],
      policy,
    });

    expect(result.kind).toBe("MODULE_PRESERVED");
  });

  it("preserves by policy for [] stored plus populated incoming", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: [],
      incomingValue: baseRows,
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("treats semantically equivalent populated arrays as unchanged", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [
        { record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" },
        { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
      ],
      policy,
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
  });

  it("preserves by policy for different populated arrays", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [
        { record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1600", currency: "USD" },
        { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
      ],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("preserves by policy for reordered rows", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [baseRows[1], baseRows[0]],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("preserves by policy for inserted rows", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [...baseRows, { record_key: "row-3", category: "Transit", monthly_low: "200", monthly_high: "300", currency: "USD" }],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("preserves by policy for removed rows", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [baseRows[0]],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("preserves by policy for edited rows", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [
        { record_key: "row-1", category: "Housing", monthly_low: "1200", monthly_high: "1500", currency: "USD" },
        { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
      ],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("is deterministic across repeated calls", () => {
    const first = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [
        { record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" },
        { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
      ],
      policy,
    });

    const second = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: baseRows,
      incomingValue: [
        { record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" },
        { record_key: "row-2", category: "Food", monthly_low: "300", monthly_high: "500", currency: "USD" },
      ],
      policy,
    });

    expect(first).toEqual(second);
  });

  it("does not mutate the input arrays", () => {
    const currentValue = [...baseRows];
    const incomingValue = [...baseRows];

    diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue,
      incomingValue,
      policy,
    });

    expect(currentValue).toEqual(baseRows);
    expect(incomingValue).toEqual(baseRows);
  });

  it("never emits child or replace operations for non-keyed modules", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: [],
      incomingValue: baseRows,
      policy,
    });

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("CREATE_CHILD");
    expect(serialized).not.toContain("UPDATE_CHILD");
    expect(serialized).not.toContain("DELETE_CHILD");
    expect(serialized).not.toContain("REPLACE_MODULE");
  });

  it("does not treat record_key differences as row identity", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "costOfLiving",
      currentValue: [{ record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" }],
      incomingValue: [{ record_key: "row-9", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" }],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("does not treat climate month as row identity", () => {
    const result = diffNonKeyedRepeatableModule({
      module: "climateMonthly",
      currentValue: [{ month: "January", avg_high_c: "12", avg_low_c: "4", rainfall_mm: "80", humidity_pct: "70" }],
      incomingValue: [{ month: "February", avg_high_c: "12", avg_low_c: "4", rainfall_mm: "80", humidity_pct: "70" }],
      policy,
    });

    expect(result.kind).toBe("MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED");
  });

  it("produces the same serialized result in a fresh Node process", () => {
    const temporaryDir = mkdtempSync(path.join(os.tmpdir(), "diff-non-keyed-"));
    const scriptPath = path.join(temporaryDir, "fresh-proof.mjs");
    const absoluteModulePath = path.resolve("app/lib/persistence/v31/diff-non-keyed.ts");
    writeFileSync(
      scriptPath,
      `import { diffNonKeyedRepeatableModule } from ${JSON.stringify(absoluteModulePath)};

const result = diffNonKeyedRepeatableModule({
  module: "costOfLiving",
  currentValue: [{ record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1500", currency: "USD" }],
  incomingValue: [{ record_key: "row-1", category: "Housing", monthly_low: "1000", monthly_high: "1600", currency: "USD" }],
  policy: { updateMode: "MERGE_NONBLANK", normalizationVersion: "v1", diffPolicyVersion: "v1" },
});

console.log(JSON.stringify(result));
`,
    );

    const output = execFileSync("npx", ["vite-node", "--script", scriptPath], {
      cwd: path.resolve("."),
      encoding: "utf8",
    });

    expect(output.trim()).toContain('"kind":"MODULE_DIFFERENT_BUT_REPLACEMENT_NOT_AUTHORIZED"');
  });
});

describe("diffSingletonModule", () => {
  const policy = {
    updateMode: "MERGE_NONBLANK" as const,
    normalizationVersion: "v1",
    diffPolicyVersion: "v1",
  };

  it("returns unchanged for null/null singleton", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: null,
      incomingValue: null,
      policy,
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
    expect(result.operations).toEqual([]);
  });

  it("preserves populated fields when incoming singleton is null", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air", qualityNotes: "Clean water" },
      incomingValue: null,
      policy,
    });

    expect(result.kind).toBe("MODULE_PRESERVED");
    expect(result.operations.every((operation) => operation.kind === "PRESERVE")).toBe(true);
  });

  it("creates fields when incoming singleton is populated and current is null", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: null,
      incomingValue: { summary: "Good air", qualityNotes: "Clean water" },
      policy,
    });

    expect(result.kind).toBe("MODULE_FIELD_OPERATIONS");
    expect(result.operations.every((operation) => operation.kind === "CREATE")).toBe(true);
  });

  it("emits updates for different populated scalars", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air", qualityNotes: "Clean water" },
      incomingValue: { summary: "Great air", qualityNotes: "Clean water" },
      policy,
    });

    expect(result.kind).toBe("MODULE_FIELD_OPERATIONS");
    expect(result.operations.some((operation) => operation.kind === "UPDATE")).toBe(true);
  });

  it("emits unchanged for equivalent populated scalars", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air", qualityNotes: "Clean water" },
      incomingValue: { summary: "Good air", qualityNotes: "Clean water" },
      policy,
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
    expect(result.operations).toEqual([]);
  });

  it("preserves incoming blank fields", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air", qualityNotes: "Clean water" },
      incomingValue: { summary: "", qualityNotes: "Clean water" },
      policy,
    });

    expect(result.kind).toBe("MODULE_PRESERVED");
    expect(result.operations[0]?.kind).toBe("PRESERVE");
  });

  it("preserves zero values", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air" },
      incomingValue: { summary: 0 },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(result.kind).toBe("MODULE_FIELD_OPERATIONS");
    expect(result.operations.some((operation) => operation.kind === "UPDATE")).toBe(true);
  });

  it("preserves false values", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air" },
      incomingValue: { summary: false },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(result.kind).toBe("MODULE_FIELD_OPERATIONS");
    expect(result.operations.some((operation) => operation.kind === "UPDATE")).toBe(true);
  });

  it("treats NFC and NFD as equivalent", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Café" },
      incomingValue: { summary: "Cafe\u0301" },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
    expect(result.operations).toEqual([]);
  });

  it("treats CRLF and LF as equivalent", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Line 1\nLine 2" },
      incomingValue: { summary: "Line 1\r\nLine 2" },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
    expect(result.operations).toEqual([]);
  });

  it("normalizes URL values where the field policy requires it", () => {
    const result = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "https://example.com" },
      incomingValue: { summary: "https://example.com/" },
      policy,
      fieldDefinitions: [{ fieldPath: "summary", scalarPolicy: "url" }],
    });

    expect(result.kind).toBe("MODULE_UNCHANGED");
    expect(result.operations).toEqual([]);
  });

  it("does not mutate the input object", () => {
    const currentValue = { summary: "Good air" };
    const incomingValue = { summary: "Great air" };

    diffSingletonModule({
      module: "environmentQuality",
      currentValue,
      incomingValue,
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(currentValue).toEqual({ summary: "Good air" });
    expect(incomingValue).toEqual({ summary: "Great air" });
  });

  it("is deterministic across repeated singleton diffs", () => {
    const first = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air" },
      incomingValue: { summary: "Great air" },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    const second = diffSingletonModule({
      module: "environmentQuality",
      currentValue: { summary: "Good air" },
      incomingValue: { summary: "Great air" },
      policy,
      fieldDefinitions: [{ fieldPath: "summary" }],
    });

    expect(first).toEqual(second);
  });
});
