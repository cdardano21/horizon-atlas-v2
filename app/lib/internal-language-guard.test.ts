import { describe, expect, it } from "vitest";
import { findInternalLanguage, hasRawImplementationValue } from "./internal-language-guard";

describe("customer-facing internal language guard", () => {
  it("flags process terminology while allowing ordinary prose", () => {
    expect(findInternalLanguage("This workbook row is pending.")).toBe("workbook");
    expect(findInternalLanguage("The city has a lively market district.")).toBeNull();
    expect(findInternalLanguage("The validator confirms the route.")).toBe("validator");
  });
  it("identifies raw implementation values", () => {
    expect(hasRawImplementationValue(true)).toBe(true);
    expect(hasRawImplementationValue("SKI_RESORT_TOWN")).toBe(true);
    expect(hasRawImplementationValue("Everyday access is easy")).toBe(false);
  });
});
