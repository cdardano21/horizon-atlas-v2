import { describe, expect, it } from "vitest";
import { evaluateShortlist, type ShortlistFacts } from "./evaluator";
import { smartShortlistCandidates } from "./cohort";
import { classifyHealthcareAccess, meetsHealthcareMinimum, APPROVED_HEALTHCARE_POLICY, type HealthcareFacilityEvidence } from "../intelligence-v2/healthcare-access";

const seed = smartShortlistCandidates[0];
const scoped = (standard: ShortlistFacts["healthcareStandard"]): ShortlistFacts => ({ ...seed, healthcareStandard: standard, healthcareEvidenceScope: "PRIVATE_CARE_AVAILABILITY_ONLY" });
const evaluate = (destination: ShortlistFacts, minimum: "BASIC_ACCESS" | "GOOD_PRIVATE_AVAILABLE" | "INTERNATIONAL_STANDARD") => evaluateShortlist([destination], { healthcare: { mode: "MUST_HAVE", minimum } })[0];

describe("private-care evidence is not an international-standard assessment", () => {
  it.each(["BASIC_ACCESS", "GOOD_PRIVATE_AVAILABLE", "UNKNOWN"] as const)("keeps Basic and Good Private evaluation unchanged for %s", standard => {
    const limited = scoped(standard);
    const assessed = { ...limited, healthcareEvidenceScope: undefined };
    for (const minimum of ["BASIC_ACCESS", "GOOD_PRIVATE_AVAILABLE"] as const) {
      const a = evaluate(limited, minimum); const b = evaluate(assessed, minimum);
      expect(a.group).toBe(b.group); expect(a.reasons).toEqual(b.reasons); expect(a.lifestyleFit).toEqual(b.lifestyleFit);
    }
  });
  it.each(["BASIC_ACCESS", "GOOD_PRIVATE_AVAILABLE", "UNKNOWN", "INTERNATIONAL_STANDARD"] as const)("does not infer an international assessment from private-care-only input %s", standard => {
    const result = evaluate(scoped(standard), "INTERNATIONAL_STANDARD");
    expect(result.group).toBe("NEEDS_VERIFICATION");
    expect(result.reasons).toContainEqual({ capability: "healthcare", state: "UNKNOWN", explanation: "The healthcare standard is not yet verified." });
  });
  it("retains a separately assessed below-minimum failure", () => {
    const result = evaluate({ ...seed, healthcareStandard: "BASIC_ACCESS" }, "INTERNATIONAL_STANDARD");
    expect(result.group).toBe("EXCLUDED");
    expect(result.reasons).toContainEqual({ capability: "healthcare", state: "FAIL", explanation: "Healthcare evidence is below the selected minimum." });
  });
  it("does not override another independent exclusion", () => {
    const result = evaluateShortlist([scoped("GOOD_PRIVATE_AVAILABLE")], { excludedCountries: [seed.countryCode], healthcare: { mode: "MUST_HAVE", minimum: "INTERNATIONAL_STANDARD" } })[0];
    expect(result.group).toBe("EXCLUDED");
    expect(result.reasons).toContainEqual(expect.objectContaining({ capability: "healthcare", state: "UNKNOWN" }));
    expect(result.reasons).toContainEqual(expect.objectContaining({ capability: "country", state: "FAIL" }));
  });
  it("does not change numeric preference scoring when evidence scope changes", () => {
    for (const mode of ["MUST_HAVE", "IMPORTANT_PREFERENCE", "NOT_A_FACTOR"] as const) {
      const destination = scoped("GOOD_PRIVATE_AVAILABLE");
      const profile = { healthcare: { mode, minimum: "INTERNATIONAL_STANDARD" as const } };
      const a = evaluateShortlist([destination], profile)[0];
      const b = evaluateShortlist([{ ...destination, healthcareEvidenceScope: undefined }], profile)[0];
      expect(a.lifestyleFit).toEqual(b.lifestyleFit);
      expect(a.preferenceSupport).toBe(b.preferenceSupport);
    }
  });
  it("preserves the existing verified-facility contract without introducing qualifying destinations", () => {
    // Synthetic contract evidence only: not hospital research or a live qualification.
    const now = new Date("2026-10-10T00:00:00Z");
    const source = { name: "Synthetic contract source", url: "https://example.org/facility", verifiedAt: "2026-10-01" };
    const facility: HealthcareFacilityEvidence = { facilityName: "Synthetic hospital", facilityType: "TERTIARY_HOSPITAL", driveMinutes: 60, emergency24h: true, inpatient: true, outpatient: true, multispecialty: true, privateCareAvailable: true, verified: true, sources: [source], qualityStandard: { standardId: "JCI", source: { ...source, validFrom: "2026-01-01", validThrough: "2026-12-31" } } };
    expect(meetsHealthcareMinimum({ facilities: [{ ...facility, qualityStandard: undefined }] }, "INTERNATIONAL_STANDARD", APPROVED_HEALTHCARE_POLICY, now)).toBe(false);
    expect(meetsHealthcareMinimum({ facilities: [{ ...facility, driveMinutes: 61 }] }, "INTERNATIONAL_STANDARD", APPROVED_HEALTHCARE_POLICY, now)).toBe(false);
    const classification = classifyHealthcareAccess({ facilities: [facility] }, APPROVED_HEALTHCARE_POLICY, now);
    expect(classification).toBe("INTERNATIONAL_STANDARD");
    if (classification !== "INTERNATIONAL_STANDARD") throw new Error("Contract not satisfied");
    expect(evaluate({ ...seed, healthcareStandard: classification }, "INTERNATIONAL_STANDARD").group).toBe("MEETS_FILTERS");
    expect(classifyHealthcareAccess({ facilities: [], noQualifyingAccess: { verified: true, source } }, APPROVED_HEALTHCARE_POLICY, now)).toBe("NO_QUALIFYING_ACCESS");
  });
});
