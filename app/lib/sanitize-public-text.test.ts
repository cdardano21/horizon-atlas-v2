import { describe, expect, it } from "vitest";
import { sanitizePublicText } from "./sanitize-public-text";

describe("sanitizePublicText", () => {
  it("hides prose that only describes an internal workbook field", () => {
    expect(sanitizePublicText("Existing workbook long_description explicitly frames the destination as a retirement candidate.")).toBeNull();
  });

  it("preserves a useful place fact while removing workbook implementation scaffolding", () => {
    expect(
      sanitizePublicText(
        "Existing PLACES/attraction entry 'Lake Sumter Landing' names a real lake at the community's center; not independently verified beyond the existing workbook naming.",
      ),
    ).toBe("'Lake Sumter Landing' names a real lake at the community's center.");
  });
});