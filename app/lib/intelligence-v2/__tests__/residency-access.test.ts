import { describe, expect, it } from "vitest";
import { evaluateResidencyEvidence, type ResidencyRouteEvidence, type ResidencyEvidencePolicy } from "../residency-access";
const now = new Date("2026-09-12T00:00:00Z");
const policy: ResidencyEvidencePolicy = { officialHostsByJurisdiction: { TH: ["doha.thaiembassy.org"] } };
const identity = { destinationKey: "hua-hin-thailand", countryCode: "TH", jurisdiction: "TH" };
// Official route existence proof. Consular/application eligibility is not personalized.
const retirement: ResidencyRouteEvidence = { ...identity,
  routeType: "DOCUMENTED_RETIREMENT_ROUTE", programName: "Non-Immigrant O-A (Long Stay)",
  legalStayDuration: "Up to one year", beyondOrdinaryTouristStay: true, renewable: "UNKNOWN",
  currentlyAvailable: "YES", status: "ACTIVE",
  source: { name: "Royal Thai Embassy, Doha", url: "https://doha.thaiembassy.org/en/publicservice/retirement-long-stay-visa-non-immigrant-visa-o-a?cate=5d7e40bb15e39c032c0056ec", verified: true, verifiedAt: "2026-09-12" },
  eligibilityNotes: "Age 50+; no employment. Nationality/residence, finances, insurance and other conditions apply; not a guarantee of eligibility.",
};
const check = (patch: Partial<ResidencyRouteEvidence> = {}) => evaluateResidencyEvidence({ routes: [{ ...retirement, ...patch }] }, identity, policy, undefined, now);
describe("Dormant residency evidence contract", () => {
  it("official documented retirement route qualifies for route existence", () => expect(check()).toBe("PASS"));
  it("nonblank prose without official verification cannot qualify", () => {
    expect(check({ programName: "Residency may be possible", source: { ...retirement.source, verified: false } })).toBe("UNKNOWN");
    expect(evaluateResidencyEvidence(undefined, identity, policy, undefined, now)).toBe("UNKNOWN");
  });
  it.each(["SUSPENDED", "EXPIRED", "UNKNOWN"] as const)("%s cannot qualify", (status) => expect(check({ status })).toBe("UNKNOWN"));
  it.each(["NO", "UNKNOWN"] as const)("availability %s cannot qualify", (currentlyAvailable) => expect(check({ currentlyAvailable })).toBe("UNKNOWN"));
  it("retirement does not imply remote work or permanent residence", () => {
    for (const type of ["DOCUMENTED_REMOTE_WORK_ROUTE", "DOCUMENTED_PERMANENT_RESIDENCY_PATH"] as const)
      expect(evaluateResidencyEvidence({ routes: [retirement] }, identity, policy, type, now)).toBe("UNKNOWN");
  });
  it("independently documented types match only their own requests", () => {
    // Synthetic type variants: not additional Thai program claims.
    for (const type of ["DOCUMENTED_LONG_STAY_ROUTE", "DOCUMENTED_REMOTE_WORK_ROUTE", "DOCUMENTED_PERMANENT_RESIDENCY_PATH"] as const) {
      const route = { ...retirement, routeType: type, programName: "Synthetic independently reviewed program" };
      expect(evaluateResidencyEvidence({ routes: [route] }, identity, policy, type, now)).toBe("PASS");
      if (type === "DOCUMENTED_REMOTE_WORK_ROUTE") expect(evaluateResidencyEvidence({ routes: [route] }, identity, policy, "DOCUMENTED_PERMANENT_RESIDENCY_PATH", now)).toBe("UNKNOWN");
    }
  });
  it.each(["2020-01-01", "2027-01-01", "invalid"])("review date %s fails", (verifiedAt) => expect(check({ source: { ...retirement.source, verifiedAt } })).toBe("UNKNOWN"));
  it("expired and future program windows fail", () => {
    expect(check({ availableThrough: "2026-09-11" })).toBe("UNKNOWN");
    expect(check({ availableFrom: "2026-09-13" })).toBe("UNKNOWN");
  });
  it("marketing source and authority lookalike domains fail", () => {
    for (const url of ["https://expat.example/visa", "https://doha.thaiembassy.org.example/visa", "invalid"])
      expect(check({ source: { ...retirement.source, url } })).toBe("UNKNOWN");
  });
  it("destination and jurisdiction ownership are exact", () => {
    expect(check({ destinationKey: "another-destination" })).toBe("UNKNOWN");
    expect(check({ countryCode: "ES" })).toBe("UNKNOWN");
    expect(check({ jurisdiction: "ES" })).toBe("UNKNOWN");
  });
  it("duration and residence beyond tourist stay must be documented", () => {
    expect(check({ legalStayDuration: "" })).toBe("UNKNOWN");
    expect(check({ beyondOrdinaryTouristStay: null })).toBe("UNKNOWN");
    expect(check({ beyondOrdinaryTouristStay: false })).toBe("UNKNOWN");
  });
  it("absence requires explicit evidence; conflicts stay unknown", () => {
    const noDocumentedRoute = { ...identity, source: retirement.source }; // Synthetic negative review.
    expect(evaluateResidencyEvidence({ routes: [] }, identity, policy, undefined, now)).toBe("UNKNOWN");
    expect(evaluateResidencyEvidence({ routes: [], noDocumentedRoute }, identity, policy, undefined, now)).toBe("NO_DOCUMENTED_ROUTE");
    expect(evaluateResidencyEvidence({ routes: [retirement], noDocumentedRoute }, identity, policy, undefined, now)).toBe("UNKNOWN");
    expect(evaluateResidencyEvidence({ routes: [retirement], conflictingSources: true }, identity, policy, undefined, now)).toBe("UNKNOWN");
  });
});


describe("Approved 12-calendar-month freshness", () => {
  it.each([["2025-09-12", "PASS"], ["2025-09-11", "UNKNOWN"]])("review %s gives %s", (verifiedAt, expected) => {
    expect(check({ source: { ...retirement.source, verifiedAt } })).toBe(expected);
  });
  it("includes the calendar-year boundary across a leap year", () => {
    const route = { ...retirement, source: { ...retirement.source, verifiedAt: "2023-03-01" } };
    expect(evaluateResidencyEvidence({ routes: [route] }, identity, policy, undefined, new Date("2024-03-01T00:00:00Z"))).toBe("PASS");
  });
  const oldSource = { ...retirement.source, verifiedAt: "2020-01-01", officialStatusValidity: { from: "2026-01-01", through: "2026-12-31" } };
  it("accepts old review only with an explicit current official status period", () => {
    expect(check({ source: oldSource })).toBe("PASS");
    expect(check({ source: { ...retirement.source, verifiedAt: "2020-01-01" }, availableFrom: "2026-01-01", availableThrough: "2026-12-31" })).toBe("UNKNOWN");
  });
  it.each([
    { from: "2020-01-01", through: "2025-12-31" },
    { from: "2027-01-01", through: "2028-12-31" },
    { from: "invalid", through: "2028-12-31" },
    { from: "2026-12-31", through: "2026-01-01" },
  ])("rejects non-current or malformed official validity %j", (officialStatusValidity) => {
    expect(check({ source: { ...oldSource, officialStatusValidity } })).toBe("UNKNOWN");
  });
  it("validity cannot override suspension, conflict, unofficial sources or future reviews", () => {
    expect(check({ source: oldSource, status: "SUSPENDED" })).toBe("UNKNOWN");
    expect(check({ source: oldSource, status: "EXPIRED" })).toBe("UNKNOWN");
    expect(check({ source: { ...oldSource, verified: false } })).toBe("UNKNOWN");
    expect(check({ source: { ...oldSource, url: "https://marketing.example/visa" } })).toBe("UNKNOWN");
    expect(check({ source: { ...oldSource, verifiedAt: "2027-01-01" } })).toBe("UNKNOWN");
    expect(evaluateResidencyEvidence({ routes: [{ ...retirement, source: oldSource }], conflictingSources: true }, identity, policy, undefined, now)).toBe("UNKNOWN");
  });
});
