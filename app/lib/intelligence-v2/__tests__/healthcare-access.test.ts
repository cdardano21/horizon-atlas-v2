import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { APPROVED_HEALTHCARE_POLICY, classifyHealthcareAccess, meetsHealthcareMinimum, type HealthcareFacilityEvidence, type HealthcareAccessPolicy } from "../healthcare-access";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-12T12:00:00Z")); });
afterEach(() => vi.useRealTimers());

// Synthetic capabilities/times: not destination research, live seeds, or approved policy.
const policy: HealthcareAccessPolicy = { maxDriveMinutes: { BASIC_ACCESS: 30, GOOD_PRIVATE_CARE: 45, INTERNATIONAL_STANDARD: 60 }, acceptedQualityStandards: ["TEST_ACCREDITATION", "TEST_PUBLIC_QUALITY_FRAMEWORK"] };
const source = { name: "Synthetic proof source", url: "https://example.org/hospital", verifiedAt: "2026-09-12" };
const facility: HealthcareFacilityEvidence = { facilityName: "Synthetic general hospital", facilityType: "GENERAL_HOSPITAL", driveMinutes: 20, emergency24h: true, inpatient: true, outpatient: true, multispecialty: true, privateCareAvailable: true, verified: true, sources: [source] };
const evidence = (patch: Partial<HealthcareFacilityEvidence> = {}) => ({ facilities: [{ ...facility, ...patch }] });
describe("Healthcare evidence contract proof — no production policy defaults", () => {
  it.each([true, false, null])("private availability %s alone proves no access level", (privateCareAvailable) => {
    const partial = evidence({ privateCareAvailable, facilityName: "", emergency24h: null, inpatient: null, outpatient: null });
    expect(classifyHealthcareAccess(partial, policy)).toBe("UNKNOWN");
    expect(meetsHealthcareMinimum(partial, "BASIC_ACCESS", policy)).toBe(false);
  });
  it("missing evidence fails closed at every minimum", () => {
    for (const level of ["BASIC_ACCESS", "GOOD_PRIVATE_CARE", "INTERNATIONAL_STANDARD"] as const) expect(meetsHealthcareMinimum(undefined, level, policy)).toBe(false);
  });
  it("basic hospital evidence supports basic but not private or international", () => {
    const basic = evidence({ privateCareAvailable: false });
    expect(classifyHealthcareAccess(basic, policy)).toBe("BASIC_ACCESS");
    expect(meetsHealthcareMinimum(basic, "GOOD_PRIVATE_CARE", policy)).toBe(false);
    expect(meetsHealthcareMinimum(basic, "INTERNATIONAL_STANDARD", policy)).toBe(false);
  });
  it("private multispecialty hospital evidence supports private and basic, not international", () => {
    expect(classifyHealthcareAccess(evidence(), policy)).toBe("GOOD_PRIVATE_CARE");
    expect(meetsHealthcareMinimum(evidence(), "BASIC_ACCESS", policy)).toBe(true);
    expect(meetsHealthcareMinimum(evidence(), "INTERNATIONAL_STANDARD", policy)).toBe(false);
  });
  it.each(["TEST_ACCREDITATION", "TEST_PUBLIC_QUALITY_FRAMEWORK"])("supports explicit quality standard %s with tertiary capability", (standardId) => {
    const strong = evidence({ facilityType: "TERTIARY_HOSPITAL", qualityStandard: { standardId, source } });
    expect(classifyHealthcareAccess(strong, policy)).toBe("INTERNATIONAL_STANDARD");
    expect(meetsHealthcareMinimum(strong, "GOOD_PRIVATE_CARE", policy)).toBe(true);
    expect(meetsHealthcareMinimum(strong, "BASIC_ACCESS", policy)).toBe(true);
    expect(meetsHealthcareMinimum(evidence({ multispecialty: false, qualityStandard: { standardId, source } }), "INTERNATIONAL_STANDARD", policy)).toBe(false);
  });
  it("international public hospital does not manufacture private access", () => {
    const publicHospital = evidence({ privateCareAvailable: false, facilityType: "TERTIARY_HOSPITAL", qualityStandard: { standardId: "TEST_PUBLIC_QUALITY_FRAMEWORK", source } });
    expect(classifyHealthcareAccess(publicHospital, policy)).toBe("INTERNATIONAL_STANDARD");
    expect(meetsHealthcareMinimum(publicHospital, "GOOD_PRIVATE_CARE", policy)).toBe(false);
  });
  it.each([null, -1, NaN, Infinity, 31])("rejects unknown/invalid/over-limit basic travel %s", (driveMinutes) => {
    expect(meetsHealthcareMinimum(evidence({ driveMinutes }), "BASIC_ACCESS", policy)).toBe(false);
  });
  it("accepts exact boundary and rejects unverified or unsupported provenance", () => {
    expect(meetsHealthcareMinimum(evidence({ driveMinutes: 30 }), "BASIC_ACCESS", policy)).toBe(true);
    expect(meetsHealthcareMinimum(evidence({ verified: false }), "BASIC_ACCESS", policy)).toBe(false);
    expect(meetsHealthcareMinimum(evidence({ sources: [] }), "BASIC_ACCESS", policy)).toBe(false);
    expect(meetsHealthcareMinimum(evidence({ sources: [{ ...source, url: "invalid" }] }), "BASIC_ACCESS", policy)).toBe(false);
  });
  it("distinguishes explicit reviewed absence from unknown and conflicting records", () => {
    expect(classifyHealthcareAccess({ facilities: [], noQualifyingAccess: { verified: true, source } }, policy)).toBe("NO_QUALIFYING_ACCESS");
    expect(classifyHealthcareAccess({ facilities: [] }, policy)).toBe("UNKNOWN");
    expect(classifyHealthcareAccess({ ...evidence(), noQualifyingAccess: { verified: true, source } }, policy)).toBe("UNKNOWN");
  });
});

// Registered Batch 01 workbook observations. No travel/capability facts inferred from prose.
it.each([
  ["hoi-an-vn", "", "WHO Vietnam", "https://data.who.int/countries/704"],
  ["queenstown-nz", "Lakes District Hospital", "Immigration New Zealand — health care", "https://www.immigration.govt.nz/live/setting-up-your-life-in-new-zealand/getting-health-care-and-finding-a-doctor/"],
  ["puerto-vallarta-mx", "CMQ", "Hospital CMQ", "https://hospitalcmq.com/"],
])("%s private-care workbook flag cannot fill missing facility evidence", (_key, facilityName, name, url) => {
  const partial = evidence({ facilityName, facilityType: "UNKNOWN", driveMinutes: null,
    emergency24h: null, inpatient: null, outpatient: null, multispecialty: null,
    sources: [{ name, url, verifiedAt: "2026-08-16" }] });
  expect(classifyHealthcareAccess(partial, policy)).toBe("UNKNOWN");
  expect(meetsHealthcareMinimum(partial, "GOOD_PRIVATE_CARE", policy)).toBe(false);
});


describe("Approved healthcare limits and freshness", () => {
  it.each([
    ["BASIC_ACCESS", 30, true], ["BASIC_ACCESS", 31, false],
    ["GOOD_PRIVATE_CARE", 45, true], ["GOOD_PRIVATE_CARE", 46, false],
    ["INTERNATIONAL_STANDARD", 60, true], ["INTERNATIONAL_STANDARD", 61, false],
  ] as const)("%s at %s minutes qualifies=%s", (minimum, driveMinutes, expected) => {
    expect(meetsHealthcareMinimum(evidence({ driveMinutes, facilityType: "TERTIARY_HOSPITAL",
      qualityStandard: { standardId: "JCI", source } }), minimum)).toBe(expected);
  });
  it("locks the approved thresholds", () => {
    expect(APPROVED_HEALTHCARE_POLICY.maxDriveMinutes).toEqual({ BASIC_ACCESS: 30, GOOD_PRIVATE_CARE: 45, INTERNATIONAL_STANDARD: 60 });
  });
  it("outpatient-only private centres fail", () => {
    expect(meetsHealthcareMinimum(evidence({ facilityType: "MEDICAL_CENTRE", inpatient: false }), "GOOD_PRIVATE_CARE")).toBe(false);
  });
  it("international quality does not override basic proximity", () => {
    const distant = evidence({ driveMinutes: 50, qualityStandard: { standardId: "JCI", source } });
    expect(meetsHealthcareMinimum(distant, "INTERNATIONAL_STANDARD")).toBe(true);
    expect(meetsHealthcareMinimum(distant, "BASIC_ACCESS")).toBe(false);
    expect(meetsHealthcareMinimum(distant, "GOOD_PRIVATE_CARE")).toBe(false);
  });
  it.each(["2024-09-11", "2027-01-01", "invalid"])("rejects expired/future/invalid review %s", (verifiedAt) => {
    expect(meetsHealthcareMinimum(evidence({ sources: [{ ...source, verifiedAt }] }), "BASIC_ACCESS")).toBe(false);
  });
  it("current accreditation can extend quality review but not travel evidence", () => {
    const qualityStandard = { standardId: "JCI", source: { ...source, verifiedAt: "2023-01-01", validFrom: "2023-01-01", validThrough: "2027-01-01" } };
    expect(meetsHealthcareMinimum(evidence({ qualityStandard }), "INTERNATIONAL_STANDARD")).toBe(true);
    expect(meetsHealthcareMinimum(evidence({ qualityStandard, sources: [qualityStandard.source] }), "INTERNATIONAL_STANDARD")).toBe(false);
    expect(meetsHealthcareMinimum(evidence({ qualityStandard: { ...qualityStandard, source: { ...qualityStandard.source, validThrough: "2025-01-01" } } }), "INTERNATIONAL_STANDARD")).toBe(false);
  });
  it("unaccepted quality claims and conflicting evidence never confirm", () => {
    expect(meetsHealthcareMinimum(evidence({ qualityStandard: { standardId: "MARKETING", source } }), "INTERNATIONAL_STANDARD")).toBe(false);
    expect(classifyHealthcareAccess({ ...evidence(), conflictingSources: true })).toBe("UNKNOWN");
    expect(meetsHealthcareMinimum({ ...evidence(), conflictingSources: true }, "BASIC_ACCESS")).toBe(false);
  });
});
