import { describe, expect, it } from "vitest";
import { projectComparableObject } from "../comparable-projection";
import { healthcareNumericStorageValue, readHealthcareCostQualifiers, restoreHealthcareCostValue } from "../healthcare-cost-storage";
import { buildDestinationPlanWriteStatements } from "../write-port";
import type { CanonicalDestinationKey, DestinationId, DestinationPlan, StoredHealthcareState } from "../types";

// Local stored-state fixture: these tests exercise storage, not workbook parsing.
const healthcare: StoredHealthcareState = Object.freeze({
  summary: "Synthetic healthcare coverage",
  publicAccessSummary: null,
  insuranceSummary: null,
  privateCareAvailable: null,
  topic: "general_and_emergency",
  englishSpeakingCare: null,
  typicalGpVisitCost: "UNKNOWN",
  typicalSpecialistCost: "UNKNOWN",
  verified: null,
  verifiedAt: null,
});

// Build statements only; no database client or execution path is used.
function statementFor(cost: string | null, specialistCost: string | null = cost) {
  const plan: DestinationPlan = {
    destinationIdentity: { destinationKey: "healthcare-storage-test" as CanonicalDestinationKey, destinationId: "00000000-0000-4000-8000-000000000001" as DestinationId },
    action: "UPDATE", scalarOperations: [], childOperations: [], warnings: [], errors: [],
    moduleExecutionOperations: [{ kind: "REPLACE_MODULE", module: "healthcare", expectedBefore: [], expectedAfter: [{ ...healthcare, typicalGpVisitCost: cost, typicalSpecialistCost: specialistCost }] }],
    expectedComparablePostState: projectComparableObject({ healthcare: [{ ...healthcare, typicalGpVisitCost: cost, typicalSpecialistCost: specialistCost }] }),
  };
  const statement = buildDestinationPlanWriteStatements(plan).find((entry) => entry.text.startsWith("insert into public.premium_healthcare_insurance"));
  if (!statement) throw new Error("HEALTHCARE_INSERT_MISSING");
  return statement;
}

describe("healthcare nullable numeric UNKNOWN storage contract", () => {
  it("writes synthetic unknown costs as null without mutating the source fixture", () => {
    expect(healthcare.topic).toBe("general_and_emergency");
    expect(healthcare.typicalGpVisitCost).toBe("UNKNOWN");
    expect(healthcare.typicalSpecialistCost).toBe("UNKNOWN");
    expect(statementFor("UNKNOWN").values.slice(9, 11)).toEqual([null, null]);
    expect(healthcare.typicalGpVisitCost).toBe("UNKNOWN");
  });
  it.each([null, "0", "42.50", "125"])("preserves numeric cost values without inventing data: %s", (value) => {
    expect(statementFor(value).values.slice(9, 11)).toEqual([value, value]);
  });
  it("stores qualitative costs as null plus exact field-specific metadata qualifiers", () => {
    const statement = statementFor("Plan-specific");
    expect(statement.values.slice(9, 11)).toEqual([null, null]);
    expect(statement.values[13]).toEqual({
      typical_gp_visit_cost_qualifier: "Plan-specific",
      typical_specialist_cost_qualifier: "Plan-specific",
    });
    const qualifiers = readHealthcareCostQualifiers(statement.values[13]);
    expect(restoreHealthcareCostValue(statement.values[9], qualifiers.typical_gp_visit_cost_qualifier)).toBe("Plan-specific");
    expect(restoreHealthcareCostValue(statement.values[10], qualifiers.typical_specialist_cost_qualifier)).toBe("Plan-specific");
  });
  it("does not fabricate qualifier metadata for explicit unknown costs", () => {
    expect(statementFor("UNKNOWN").values[13]).toEqual({});
  });
  it("compares the explicit unknown source with nullable numeric read-back, but not zero", () => {
    expect(projectComparableObject({ typicalGpVisitCost: "UNKNOWN", typicalSpecialistCost: "UNKNOWN" })).toEqual({ typicalGpVisitCost: null, typicalSpecialistCost: null });
    expect(projectComparableObject({ typicalGpVisitCost: "UNKNOWN" })).not.toEqual(projectComparableObject({ typicalGpVisitCost: "0" }));
  });
  it("does not erase UNKNOWN in other fields", () => {
    expect(projectComparableObject({ summary: "UNKNOWN", monthlyLow: "UNKNOWN", scoreValue: "UNKNOWN" })).toEqual({ summary: "UNKNOWN", monthlyLow: "UNKNOWN", scoreValue: "UNKNOWN" });
  });
  it("keeps distinct GP and specialist qualifiers associated with their fields", () => {
    const statement = statementFor("Plan-specific", "Coverage-dependent");
    expect(statement.values.slice(9, 11)).toEqual([null, null]);
    expect(statement.values[13]).toEqual({
      typical_gp_visit_cost_qualifier: "Plan-specific",
      typical_specialist_cost_qualifier: "Coverage-dependent",
    });
    const qualifiers = readHealthcareCostQualifiers(statement.values[13]);
    expect(restoreHealthcareCostValue(statement.values[9], qualifiers.typical_gp_visit_cost_qualifier)).toBe("Plan-specific");
    expect(restoreHealthcareCostValue(statement.values[10], qualifiers.typical_specialist_cost_qualifier)).toBe("Coverage-dependent");
  });
  it.each([0, 42.5, 125])("preserves numeric input including zero: %s", (value) => {
    expect(healthcareNumericStorageValue(value, undefined)).toBe(value);
    expect(restoreHealthcareCostValue(value, "Plan-specific")).toBe(String(value));
  });
  it.each([null, undefined, "", "UNKNOWN", " unknown "])("normalizes absent or unknown input to null: %s", (value) => {
    expect(healthcareNumericStorageValue(value, undefined)).toBeNull();
  });
  it("restores null when neither a numeric value nor a qualifier exists", () => {
    expect(restoreHealthcareCostValue(null, undefined)).toBeNull();
  });
  it.each([undefined, "Different qualifier"])("rejects qualitative input without its exact preserved qualifier: %s", (costQualifier) => {
    expect(() => healthcareNumericStorageValue("Plan-specific", costQualifier)).toThrow("HEALTHCARE_NUMERIC_QUALIFIER_NOT_PRESERVED:Plan-specific");
  });
  it("rejects unsupported nonnumeric input types", () => {
    expect(() => healthcareNumericStorageValue(true, undefined)).toThrow("HEALTHCARE_NUMERIC_VALUE_UNSUPPORTED");
  });
});
