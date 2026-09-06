import { describe, expect, it } from "vitest";
import {
  affordabilityState,
  compareAffordability,
  evaluateShortlist,
  normalizedAffordabilityState,
  type ShortlistFacts,
  validateAffordabilityEvidence,
} from "./evaluator";

const candidate = (key: string, overrides: Partial<ShortlistFacts> = {}): ShortlistFacts => ({
  key,
  name: key,
  countryCode: "US",
  beachAccess: "NONE",
  mountainAccess: "NONE",
  affordability: {},
  ...overrides,
});

const range = { monthlyLow: 1000, monthlyHigh: 1500, currency: "USD", household: "single" as const };
const budget = { amount: 1600, currency: "USD", household: "single" as const };

const cases: Array<[string, () => void]> = [
  ["01 missing affordability is explicitly unknown", () => expect(validateAffordabilityEvidence({})).toContain("affordability evidence is unknown")],
  ["02 a provider id alone is incomplete", () => expect(validateAffordabilityEvidence({ providerId: "a" }).length).toBeGreaterThan(0)],
  ["03 an index without a provider is rejected", () => expect(validateAffordabilityEvidence({ index: 20, band: "LOW" })).toContain("providerId is required for indexed affordability")],
  ["04 an index without a band is rejected", () => expect(validateAffordabilityEvidence({ providerId: "a", index: 20 })).toContain("band is required for indexed affordability")],
  ["05 a negative index is rejected", () => expect(validateAffordabilityEvidence({ providerId: "a", index: -1, band: "LOW" })).toContain("index must be a finite non-negative number")],
  ["06 a non-finite index is rejected", () => expect(validateAffordabilityEvidence({ providerId: "a", index: Number.NaN, band: "LOW" })).toContain("index must be a finite non-negative number")],
  ["07 a missing lower range bound is rejected", () => expect(validateAffordabilityEvidence({ monthlyHigh: 10, currency: "USD", household: "single" })).toContain("monthly range requires both bounds")],
  ["08 a missing upper range bound is rejected", () => expect(validateAffordabilityEvidence({ monthlyLow: 10, currency: "USD", household: "single" })).toContain("monthly range requires both bounds")],
  ["09 an inverted range is rejected", () => expect(validateAffordabilityEvidence({ monthlyLow: 20, monthlyHigh: 10, currency: "USD", household: "single" })).toContain("monthly range is invalid")],
  ["10 a negative range is rejected", () => expect(validateAffordabilityEvidence({ monthlyLow: -1, monthlyHigh: 10, currency: "USD", household: "single" })).toContain("monthly range is invalid")],
  ["11 a zero lower bound remains known", () => expect(validateAffordabilityEvidence({ monthlyLow: 0, monthlyHigh: 10, currency: "USD", household: "single" })).toEqual([])],
  ["12 a range without currency is rejected", () => expect(validateAffordabilityEvidence({ monthlyLow: 10, monthlyHigh: 20, household: "single" })).toContain("currency is required for a monthly range")],
  ["13 a range without household is rejected", () => expect(validateAffordabilityEvidence({ monthlyLow: 10, monthlyHigh: 20, currency: "USD" })).toContain("household is required for a monthly range")],
  ["14 cross-provider indices are incomparable", () => expect(compareAffordability({ providerId: "a", index: 10, band: "LOW" }, { providerId: "b", index: 20, band: "LOW" })).toBeNull()],
  ["15 cross-currency totals are incomparable", () => expect(compareAffordability(range, { ...range, currency: "EUR" })).toBeNull()],
  ["16 cross-household totals are incomparable", () => expect(compareAffordability(range, { ...range, household: "couple" })).toBeNull()],
  ["17 overlapping cash ranges remain unresolved", () => expect(affordabilityState({ ...range, monthlyHigh: 1800 }, budget).state).toBe("UNKNOWN")],
  ["18 local ranges cannot satisfy a normalized band", () => expect(normalizedAffordabilityState(range, { maxBand: "MODERATE" }).state).toBe("UNKNOWN")],
  ["19 unknown hard facts enter needs-verification", () => expect(evaluateShortlist([candidate("a", { beachAccess: "UNKNOWN" })], { beach: "DIRECT_ACCESS", requireBeach: true })[0].group).toBe("NEEDS_VERIFICATION")],
  ["20 one known failure enters relax-one", () => expect(evaluateShortlist([candidate("a")], { beach: "DIRECT_ACCESS", requireBeach: true })[0].group).toBe("RELAX_ONE")],
  ["21 multiple known failures are excluded", () => expect(evaluateShortlist([candidate("a")], { includedCountries: ["CA"], beach: "DIRECT_ACCESS", requireBeach: true })[0].group).toBe("EXCLUDED")],
  ["22 unknown optional facts add no support", () => { const result = evaluateShortlist([candidate("a")], { affordability: { maxBand: "LOW" } })[0]; expect([result.group, result.preferenceSupport]).toEqual(["MEETS_FILTERS", 0]); }],
  ["23 canonical key breaks a complete tie", () => expect(evaluateShortlist([candidate("z"), candidate("a")], {}).map((item) => item.destination.key)).toEqual(["a", "z"])],
];

describe("Smart Shortlist 23-case adversarial matrix", () => {
  it.each(cases)("%s", (_name, check) => check());
});