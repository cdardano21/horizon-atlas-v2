import { expect, it } from "vitest";
import { ACCEPTED_SAFETY_AUTHORITY_TYPES, classifySafetyEvidence, type SafetyEvidenceRow, type SafetyEvidencePolicy } from "../safety-evidence";
const now = new Date("2026-09-12T00:00:00Z");
// Synthetic evidence using existing workbook dimensions and approved freshness.
const policy: SafetyEvidencePolicy = { relevantRiskTypes: ["flood", "traffic"] };
const row: SafetyEvidenceRow = { destinationKey: "hoi-an-vn", riskType: "flood", severity: "low", geographicScope: "DESTINATION", appliesToDestination: true, sourceName: "Synthetic authority", sourceUrl: "https://example.org/safety", sourceAuthorityType: "GOVERNMENT", evidenceDate: "2026-08-01", verifiedAt: "2026-09-01", verified: true };
const classify = (first: Partial<SafetyEvidenceRow> = {}, second: Partial<SafetyEvidenceRow> = {}) => classifySafetyEvidence([{ ...row, ...first }, { ...row, riskType: "traffic", ...second }], row.destinationKey, policy, now);
it.each([
  ["low", "low", "HIGH_SAFETY_ONLY"], ["low", "medium", "MODERATE_OR_BETTER"],
  ["elevated_risk", "UNKNOWN", "ELEVATED_RISK"], ["low", "UNKNOWN", "UNKNOWN"],
  ["medium", "UNKNOWN", "UNKNOWN"], ["low", "High", "UNKNOWN"], ["low", null, "UNKNOWN"],
])("%s plus %s gives %s", (a,b,expected) => expect(classify({ severity: a }, { severity: b })).toBe(expected));
it("conflicts and unverified elevated claims do not qualify", () => {
  expect(classify({}, { conflicting: true })).toBe("UNKNOWN");
  expect(classify({ severity: "elevated_risk", verified: false })).toBe("UNKNOWN");
  expect(classifySafetyEvidence([row, { ...row, severity: "medium" }, { ...row, riskType: "traffic" }], row.destinationKey, policy, now)).toBe("UNKNOWN");
});
it("missing evidence/dimensions and unrecognized dimensions remain unresolved", () => {
  expect(classifySafetyEvidence([], row.destinationKey, policy, now)).toBe("UNKNOWN");
  expect(classifySafetyEvidence([row], row.destinationKey, policy, now)).toBe("UNKNOWN");
  expect(classify({}, { riskType: "unreviewed_dimension" })).toBe("UNKNOWN");
});
it.each([
  { sourceUrl: "invalid" }, { sourceName: "" }, { sourceAuthorityType: "UNKNOWN" as const },
  { evidenceDate: null }, { verifiedAt: null }, { evidenceDate: "2020-01-01" },
  { verifiedAt: "2027-01-01" }, { geographicScope: "UNKNOWN" as const }, { appliesToDestination: null },
  { unresolved: true }, { destinationKey: "another-destination" },
])("incomplete evidence %j cannot be affirmative", (patch) => expect(classify(patch)).toBe("UNKNOWN"));
it("verified elevated evidence remains conservative despite unresolved other rows", () => {
  expect(classify({ severity: "elevated_risk" }, { conflicting: true })).toBe("ELEVATED_RISK");
});
it.each([
  ["hoi-an-vn", ["flood", "typhoon", "traffic"], ["High", "High", "Medium"]],
  ["queenstown-nz", ["earthquake", "winter_driving", "outdoor_risk"], ["Medium", "medium", "Medium"]],
] as const)("%s workbook observations lack explicit scope/authority/evidence dates", (key, risks, severities) => {
  const observed = risks.map((riskType, i): SafetyEvidenceRow => ({ ...row, destinationKey: key, riskType, severity: severities[i], geographicScope: "UNKNOWN", appliesToDestination: null, sourceAuthorityType: "UNKNOWN", evidenceDate: null }));
  expect(classifySafetyEvidence(observed, key, { ...policy, relevantRiskTypes: risks }, now)).toBe("UNKNOWN");
});

it.each([["2025-09-12", "HIGH_SAFETY_ONLY"], ["2025-09-11", "UNKNOWN"]])("12-month boundary %s gives %s", (date, expected) => {
  expect(classify({ evidenceDate: date, verifiedAt: date })).toBe(expected);
});
it("a fresh review cannot silently renew stale underlying evidence", () => {
  expect(classify({ evidenceDate: "2025-09-11", verifiedAt: "2026-09-01" })).toBe("UNKNOWN");
});
it.each(ACCEPTED_SAFETY_AUTHORITY_TYPES)("accepts reviewed primary authority %s", (sourceAuthorityType) => {
  expect(classify({ sourceAuthorityType })).toBe("HIGH_SAFETY_ONLY");
});
it("generic sites and aggregators cannot serve as primary evidence", () => {
  expect(classify({ sourceAuthorityType: "OTHER" })).toBe("UNKNOWN");
});
it("different safety dimensions stay separate, with conflicts checked within a dimension", () => {
  const rows = [{ ...row, severity: "low" }, { ...row, riskType: "traffic", severity: "medium" }];
  const before = JSON.stringify(rows);
  expect(classifySafetyEvidence(rows, row.destinationKey, policy, now)).toBe("MODERATE_OR_BETTER");
  expect(JSON.stringify(rows)).toBe(before);
  expect(rows.map((item) => item.riskType)).toEqual(["flood", "traffic"]);
});
