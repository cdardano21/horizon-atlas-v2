import { describe, expect, it } from "vitest";
import { normalizeComparable, NORMALIZATION_VERSION, normalizeScalarValue } from "../normalize";

describe("Phase 3A.1 normalization", () => {
  it("normalizes empty and whitespace-only strings to null", () => {
    expect(normalizeComparable("")).toBeNull();
    expect(normalizeComparable("   ")).toBeNull();
    expect(normalizeComparable("\t\n\r\n")).toBeNull();
  });

  it("normalizes line endings and unicode while preserving internal whitespace", () => {
    expect(normalizeComparable("New\r\nBraunfels")).toBe("New\nBraunfels");
    expect(normalizeComparable("New\rBraunfels")).toBe("New\nBraunfels");
    expect(normalizeComparable("Cafe\u0301")).toBe("Café");
    expect(normalizeComparable("New   Braunfels")).toBe("New   Braunfels");
    expect(normalizeComparable("  New Braunfels  ")).toBe("New Braunfels");
  });

  it("preserves zero and false and ordinary case", () => {
    expect(normalizeComparable(0)).toBe(0);
    expect(normalizeComparable(false)).toBe(false);
    expect(normalizeComparable("New Braunfels")).toBe("New Braunfels");
    expect(normalizeComparable("NEW BRAUNFELS")).toBe("NEW BRAUNFELS");
  });

  it("keeps numeric-looking strings as strings", () => {
    expect(normalizeComparable("1.50")).toBe("1.50");
    expect(normalizeComparable("0012")).toBe("0012");
  });

  it("normalizes URL values conservatively", () => {
    expect(normalizeScalarValue("HTTPS://Example.COM:443/", "url")).toBe("https://example.com");
    expect(normalizeScalarValue("https://Example.com/SomePath/", "url")).toBe("https://example.com/SomePath/");
    expect(normalizeScalarValue("https://Example.com/SomePath?x=1&y=2", "url")).toBe("https://example.com/SomePath?x=1&y=2");
    expect(normalizeScalarValue("not a real url", "url")).toBe("not a real url");
    expect(normalizeScalarValue("https://Example.com:8443/", "url")).toBe("https://example.com:8443");
  });

  it("exports a stable normalization version", () => {
    expect(NORMALIZATION_VERSION).toBe("v1");
  });
});
