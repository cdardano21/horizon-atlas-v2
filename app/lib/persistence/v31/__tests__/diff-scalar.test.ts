import { describe, expect, it } from "vitest";
import { diffScalar } from "../diff-scalar";
import { normalizeScalarValue } from "../normalize";
import type { DiffPolicy, ScalarOperation, ScalarValue } from "../types";

const policy: DiffPolicy = {
  updateMode: "MERGE_NONBLANK",
  normalizationVersion: "v1",
  diffPolicyVersion: "v1",
};

function makeOperation(overrides: Partial<ScalarOperation> = {}): ScalarOperation {
  return {
    kind: "UNCHANGED",
    module: "environmentQuality",
    fieldPath: "summary",
    currentValue: null,
    incomingValue: null,
    ...overrides,
  } as ScalarOperation;
}

describe("Phase 3A.2 scalar diff", () => {
  it("emits CREATE for null to populated", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: null, incomingValue: "Lisbon", policy });
    expect(result.kind).toBe("CREATE");
    expect(result.currentValue).toBeNull();
    expect(result.incomingValue).toBe("Lisbon");
  });

  it("emits UPDATE for different populated values", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "Porto", policy });
    expect(result.kind).toBe("UPDATE");
  });

  it("emits UNCHANGED for semantically equivalent populated values", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: " Lisbon ", incomingValue: "Lisbon", policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("emits PRESERVE for populated to null", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: null, policy });
    expect(result.kind).toBe("PRESERVE");
    expect(result.incomingValue).toBeNull();
  });

  it("emits UNCHANGED for null to null", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: null, incomingValue: null, policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats whitespace-only incoming as empty and preserves current content", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "   ", policy });
    expect(result.kind).toBe("PRESERVE");
  });

  it("treats empty-string incoming as empty and preserves current content", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "", policy });
    expect(result.kind).toBe("PRESERVE");
  });

  it("treats CRLF-only blank incoming as empty and preserves current content", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "\r\n", policy });
    expect(result.kind).toBe("PRESERVE");
  });

  it("treats 0 as populated", () => {
    const result = diffScalar({ fieldPath: "score", currentValue: null, incomingValue: 0, policy });
    expect(result.kind).toBe("CREATE");
    expect(result.incomingValue).toBe(0);
  });

  it("treats false as populated", () => {
    const result = diffScalar({ fieldPath: "flag", currentValue: null, incomingValue: false, policy });
    expect(result.kind).toBe("CREATE");
    expect(result.incomingValue).toBe(false);
  });

  it("treats 0 to 0 as unchanged", () => {
    const result = diffScalar({ fieldPath: "score", currentValue: 0, incomingValue: 0, policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats false to false as unchanged", () => {
    const result = diffScalar({ fieldPath: "flag", currentValue: false, incomingValue: false, policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats null to 0 as create", () => {
    const result = diffScalar({ fieldPath: "score", currentValue: null, incomingValue: 0, policy });
    expect(result.kind).toBe("CREATE");
  });

  it("treats null to false as create", () => {
    const result = diffScalar({ fieldPath: "flag", currentValue: null, incomingValue: false, policy });
    expect(result.kind).toBe("CREATE");
  });

  it("keeps numeric strings as strings", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: null, incomingValue: "0", policy });
    expect(result.kind).toBe("CREATE");
    expect(result.incomingValue).toBe("0");
  });

  it("keeps boolean strings as strings", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: null, incomingValue: "false", policy });
    expect(result.kind).toBe("CREATE");
    expect(result.incomingValue).toBe("false");
  });

  it("treats trimmed text as equivalent", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: " Lisbon ", policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats CRLF and LF as equivalent", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon\nPorto", incomingValue: "Lisbon\r\nPorto", policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats composed and decomposed unicode as equivalent", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Café", incomingValue: "Cafe\u0301", policy });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats URL values as equivalent under URL policy", () => {
    const result = diffScalar({ fieldPath: "url", currentValue: "https://Example.com/Path", incomingValue: "https://example.com:443/Path", policy, scalarPolicy: "url" });
    expect(result.kind).toBe("UNCHANGED");
  });

  it("treats meaningful URL path changes as UPDATE", () => {
    const result = diffScalar({ fieldPath: "url", currentValue: "https://example.com/Path", incomingValue: "https://example.com/Other", policy, scalarPolicy: "url" });
    expect(result.kind).toBe("UPDATE");
  });

  it("treats meaningful URL query changes as UPDATE", () => {
    const result = diffScalar({ fieldPath: "url", currentValue: "https://example.com/Path?x=1", incomingValue: "https://example.com/Path?x=2", policy, scalarPolicy: "url" });
    expect(result.kind).toBe("UPDATE");
  });

  it("does not apply URL normalization under ordinary policy", () => {
    const result = diffScalar({ fieldPath: "url", currentValue: "HTTPS://EXAMPLE.COM", incomingValue: "https://example.com", policy, scalarPolicy: "ordinary" });
    expect(result.kind).toBe("UPDATE");
  });

  it("never returns CLEAR", () => {
    const result = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "   ", policy });
    expect(result.kind).not.toBe("CLEAR");
  });

  it("does not mutate input values", () => {
    const currentValue: ScalarValue = " Lisbon ";
    const incomingValue: ScalarValue = "Lisbon";
    const before = { currentValue, incomingValue };
    diffScalar({ fieldPath: "summary", currentValue, incomingValue, policy });
    expect({ currentValue, incomingValue }).toEqual(before);
  });

  it("is repeatable and deterministic", () => {
    const first = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "   ", policy });
    const second = diffScalar({ fieldPath: "summary", currentValue: "Lisbon", incomingValue: "   ", policy });
    expect(first).toEqual(second);
  });

  it("reuses the approved normalization authority", () => {
    const normalized = normalizeScalarValue("  Café  ", "ordinary");
    expect(normalized).toBe("Café");
  });

  it("supports the minimal operation shape", () => {
    const operation = makeOperation({ kind: "UPDATE", currentValue: "A", incomingValue: "B" });
    expect(operation).toEqual(expect.objectContaining({ kind: "UPDATE" }));
  });
});
