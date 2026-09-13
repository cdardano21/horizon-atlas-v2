import { expect, it } from "vitest";
import { evaluateHouseholdEstimate, qualifyHouseholdEstimate, type HouseholdEstimateRow } from "../affordability-evidence";
// Existing Tivat U3-R5 values and attribution, copied without cost research.
const single: HouseholdEstimateRow = { destination_key: "tivat-montenegro", household_type: "single", category: "u3_r5_total_monthly_estimate", lifestyle_tier: "comfortable", stay_mode_key: "RELOCATE", currency: "USD", monthly_low: 1850, monthly_high: 2250,
  included_notes: "ChatGPT U3-R5 planning estimate; midpoint $2,050/month. Includes modern 1-bedroom rent, utilities, groceries, ordinary local transportation, moderate dining and entertainment. Excludes healthcare, taxes, international travel, major medical expenses and luxury spending. Range reflects local housing/seasonality uncertainty; estimate is model-derived, not a published statistic.",
  source_name: "Numbeo", source_url: "https://es.numbeo.com/coste-de-vida/ciudad/Tivat-Montenegro", verified: false, verified_at: "2026-09-06" };
const couple = { ...single, household_type: "couple", monthly_low: 2700, monthly_high: 3300, included_notes: single.included_notes.replace("2,050", "3,000") };
const qualify = (patch: Partial<HouseholdEstimateRow> = {}) => qualifyHouseholdEstimate([{ ...single, ...patch }], single.destination_key, "single");
it("qualifies real single and couple planning totals with computed midpoints", () => {
  expect(qualify()).toEqual({ status: "QUALIFIED", midpoint: 2050, confidence: "EDITORIAL_PLANNING_ESTIMATE" });
  expect(qualifyHouseholdEstimate([couple], single.destination_key, "couple")).toMatchObject({ status: "QUALIFIED", midpoint: 3000 });
});
it.each([
  { category: "rent" }, { category: "groceries" }, { lifestyle_tier: "luxury" }, { stay_mode_key: "TOURIST" },
  { currency: "EUR" }, { monthly_low: 0 }, { monthly_low: NaN }, { monthly_high: Infinity }, { monthly_high: 100 },
  { included_notes: "Rent only" }, { source_name: "" }, { source_url: "not a URL" }, { verified: true, verified_at: null },
])("rejects incomplete/wrong row %j", (patch) => expect(qualify(patch).status).toBe("UNKNOWN"));
it("households and destination ownership never substitute", () => {
  expect(qualifyHouseholdEstimate([single], single.destination_key, "couple").status).toBe("UNKNOWN");
  expect(qualifyHouseholdEstimate([couple], single.destination_key, "single").status).toBe("UNKNOWN");
  expect(qualifyHouseholdEstimate([single], "another-destination", "single").status).toBe("UNKNOWN");
});
it.each([[2050, "MEETS_FILTERS"], [2100, "MEETS_FILTERS"], [2000, "NEEDS_VERIFICATION"], [1800, "EXCLUDED"]])("Tivat single budget %s gives %s", (budget, group) => {
  expect(evaluateHouseholdEstimate([single], single.destination_key, "single", Number(budget)).group).toBe(group);
});
it("preserves exact 10 percent boundary using the existing classifier", () => {
  const row = { ...single, monthly_low: 2200, monthly_high: 2200 };
  expect(evaluateHouseholdEstimate([row], row.destination_key, "single", 2000).group).toBe("NEEDS_VERIFICATION");
  expect(evaluateHouseholdEstimate([{ ...row, monthly_high: 2202 }], row.destination_key, "single", 2000).group).toBe("EXCLUDED");
});
it("missing/duplicate totals and missing provenance stay verification-only", () => {
  expect(evaluateHouseholdEstimate([], single.destination_key, "single", 3000).group).toBe("NEEDS_VERIFICATION");
  expect(qualifyHouseholdEstimate([single, single], single.destination_key, "single").status).toBe("UNKNOWN");
  expect(evaluateHouseholdEstimate([{ ...single, source_name: "" }], single.destination_key, "single", 3000).group).toBe("NEEDS_VERIFICATION");
});
it.each([null, undefined, "", "   "])("editorial attribution without URL (%s) stays verification-only", (source_url) => {
  const row = { ...single, source_name: "DestinationFinderAI editorial planning estimate", source_url, verified_at: null };
  expect(qualifyHouseholdEstimate([row], row.destination_key, "single").status).toBe("UNKNOWN");
  expect(evaluateHouseholdEstimate([row], row.destination_key, "single", 3000).group).toBe("NEEDS_VERIFICATION");
});
it("complete attributed estimates with URL can pass without verified=true", () => {
  expect(evaluateHouseholdEstimate([{ ...single, verified: false, verified_at: null }], single.destination_key, "single", 3000).group).toBe("MEETS_FILTERS");
});
it("qualifies Matera's existing single/couple U3-R5 ranges", () => {
  const matera = { ...single, destination_key: "matera-italy", monthly_low: 1700, monthly_high: 2100,
    included_notes: single.included_notes.replace("2,050", "1,900"), source_name: "Wise", source_url: "https://wise.com/gb/cost-of-living/italy/matera" };
  const materaCouple = { ...matera, household_type: "couple", monthly_low: 2450, monthly_high: 2950,
    included_notes: matera.included_notes.replace("1,900", "2,700") };
  expect(qualifyHouseholdEstimate([matera], matera.destination_key, "single")).toMatchObject({ status: "QUALIFIED", midpoint: 1900 });
  expect(qualifyHouseholdEstimate([materaCouple], matera.destination_key, "couple")).toMatchObject({ status: "QUALIFIED", midpoint: 2700 });
});
