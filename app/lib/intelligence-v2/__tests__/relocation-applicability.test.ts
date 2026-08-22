import { describe, expect, it } from "vitest";
import { deriveRelocationApplicability } from "../relocation-applicability";
import { evaluateEligibility } from "../eligibility-evaluator";
import { evaluateFinancialEfficiency } from "../financial-efficiency";
import { evaluateAffordability } from "../affordability-evaluator";
import { evaluateLifestyleFit } from "../lifestyle-scorer";
import { evaluateDestinationForProfile } from "../orchestrator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import type { SyntheticDestinationFixture } from "../destination-fact-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

/**
 * Phase 10.7 - domestic/cross-border relocation applicability semantics.
 *
 * Proves that blank international-only fields for a domestic (same-country) move
 * are represented as "not applicable" (null criteria, omitted findings) rather
 * than UNKNOWN/NEEDS_VERIFICATION noise - without ever hardcoding "US" as the
 * only domestic case, and without any workbook/adapter changes.
 */

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

/** A Summerlin-shaped domestic-U.S. synthetic destination: international fields blank/UNKNOWN (matching the
 * existing New Braunfels/Summerlin workbook precedent), domestic financial facts genuinely populated. */
function makeDomesticUsDestination(overrides: Partial<SyntheticDestinationFixture> = {}): SyntheticDestinationFixture {
  return {
    id: "fixture-summerlin-shaped-domestic",
    displayName: "Fixture: Summerlin-shaped domestic U.S. destination",
    notes: "Synthetic - not real Summerlin data. International-only fields blank, matching existing workbook convention.",
    countryCode: "US",
    entryAndStay: {
      touristEntryAllowed: "UNKNOWN",
      touristStayLimitDays: null,
      extendedStayOrLongStayVisaAvailable: "UNKNOWN",
      permanentResidencyPathAvailable: "UNKNOWN",
      retirementVisaProgramAvailable: "UNKNOWN",
      remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
      remoteWorkLegalUnderTouristStatus: "UNKNOWN",
      foreignPropertyPurchaseAllowed: "YES",
      propertyPurchaseGrantsResidencyPath: "UNKNOWN",
      spouseOrDependentInclusionSupported: "UNKNOWN",
    },
    hardGates: {
      beachAccess: "NONE",
      mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
      healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
      safetyStandard: "MODERATE_OR_BETTER",
      lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
    },
    cost: {
      estimatedMonthlyCostRange: { low: 2800, high: 3800, currencyCode: "USD" },
      householdSizeAssumedForEstimate: 1,
    },
    financial: {
      taxResidencyTriggerDays: null,
      pensionTreatment: "EXEMPT",
      socialSecurityTreatment: "EXEMPT",
      iraTreatment: "EXEMPT",
      retirementAccount401kTreatment: "EXEMPT",
      usTaxTreatyInEffect: "UNKNOWN",
      foreignTaxCreditAvailable: "UNKNOWN",
      wealthTaxApplicable: "NO",
      propertyTaxAnnualRatePercent: 0.6,
      propertyPurchaseOrTransferTaxPercent: null,
      buyVsRentBreakEvenYears: null,
    },
    lifestyleDimensions: { dimensionValues: {} },
    ...overrides,
  };
}

const lisbonShapedCrossBorderDestination: SyntheticDestinationFixture = {
  id: "fixture-lisbon-shaped-cross-border",
  displayName: "Fixture: Lisbon-shaped cross-border destination",
  notes: "Synthetic - mirrors the real Lisbon adapter output shape for regression comparison.",
  countryCode: "PT",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "YES",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: { estimatedMonthlyCostRange: { low: 2495, high: 4610, currencyCode: "EUR" }, householdSizeAssumedForEstimate: 1 },
  financial: {
    taxResidencyTriggerDays: 184,
    pensionTreatment: "TREATY_DEPENDENT",
    socialSecurityTreatment: "TREATY_DEPENDENT",
    iraTreatment: "TREATY_DEPENDENT",
    retirementAccount401kTreatment: "TREATY_DEPENDENT",
    usTaxTreatyInEffect: "YES",
    foreignTaxCreditAvailable: "YES",
    wealthTaxApplicable: "YES",
    propertyTaxAnnualRatePercent: 0.3,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { walkability: 91 } },
};

describe("deriveRelocationApplicability — pure rule unit tests", () => {
  it("1. U.S. citizen -> U.S. destination = DOMESTIC", () => {
    expect(deriveRelocationApplicability(makeProfile(), makeDomesticUsDestination())).toBe("DOMESTIC");
  });

  it("2. U.S. citizen -> Portugal = CROSS_BORDER", () => {
    expect(deriveRelocationApplicability(makeProfile(), lisbonShapedCrossBorderDestination)).toBe("CROSS_BORDER");
  });

  it("3. U.S. citizen -> Mexico = CROSS_BORDER", () => {
    const mexico = makeDomesticUsDestination({ countryCode: "MX" });
    expect(deriveRelocationApplicability(makeProfile(), mexico)).toBe("CROSS_BORDER");
  });

  it("4. Canadian citizen -> U.S. = CROSS_BORDER (destination country is never hardcoded as domestic)", () => {
    const canadianProfile = makeProfile({ citizenship: { primaryPassportCountryCode: "CA", additionalPassportCountryCodes: [] } });
    expect(deriveRelocationApplicability(canadianProfile, makeDomesticUsDestination())).toBe("CROSS_BORDER");
  });

  it("5. missing/blank passport country -> UNKNOWN, never assumed domestic", () => {
    const noPassportProfile = makeProfile({ citizenship: { primaryPassportCountryCode: "", additionalPassportCountryCodes: [] } });
    expect(deriveRelocationApplicability(noPassportProfile, makeDomesticUsDestination())).toBe("UNKNOWN");
  });

  it("missing/blank destination country -> UNKNOWN, symmetric with missing passport", () => {
    const noCountryDestination = makeDomesticUsDestination({ countryCode: null });
    expect(deriveRelocationApplicability(makeProfile(), noCountryDestination)).toBe("UNKNOWN");
  });

  it("is case-insensitive on country codes", () => {
    const lowercaseProfile = makeProfile({ citizenship: { primaryPassportCountryCode: "us", additionalPassportCountryCodes: [] } });
    expect(deriveRelocationApplicability(lowercaseProfile, makeDomesticUsDestination())).toBe("DOMESTIC");
  });
});

describe("Layer 1 — domestic relocation nulls out international criteria, never PASS/FAIL/UNKNOWN", () => {
  it("nulls entryFeasibility, stayDurationFeasibility, requiredLegalPath, retirementOrResidencyPath, spouseOrDependentFeasibility for a domestic retiree, and resolves ELIGIBLE overall", () => {
    const profile = makeProfile({ household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true } });
    const result = evaluateEligibility(profile, makeDomesticUsDestination());

    expect(result.criteria.entryFeasibility).toBeNull();
    expect(result.criteria.stayDurationFeasibility).toBeNull();
    expect(result.criteria.requiredLegalPath).toBeNull();
    expect(result.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.criteria.spouseOrDependentFeasibility).toBeNull();
    expect(result.overallStatus).toBe("ELIGIBLE"); // no fabricated PASS, no NEEDS_VERIFICATION-causing UNKNOWN
    expect(result.unknownReasonCodes).toEqual([]);
  });

  it("does NOT null out non-immigration gates (healthcare/safety/beach/mountain/LGBTQ) for a domestic move", () => {
    const profile = makeProfile({ hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), lgbtqLegalSafetyEssential: true } });
    const result = evaluateEligibility(profile, makeDomesticUsDestination());

    expect(result.criteria.lgbtqLegalSafetyGate).toMatchObject({ status: "PASS" });
  });

  it("cross-border (Lisbon-shaped) destination behavior is completely unaffected", () => {
    const result = evaluateEligibility(makeProfile(), lisbonShapedCrossBorderDestination);
    expect(result.criteria.entryFeasibility).not.toBeNull();
    expect(result.criteria.retirementOrResidencyPath).not.toBeNull();
    expect(result.overallStatus).toBe("ELIGIBLE");
  });
});

describe("6. Domestic remote employee — no digital-nomad/tourist-work-permission criterion", () => {
  it("nulls remoteWorkLegality for a domestic U.S. remote worker", () => {
    const profile = makeProfile({ activityMode: "REMOTE_EMPLOYEE", intendsToWorkDuringStay: true });
    const result = evaluateEligibility(profile, makeDomesticUsDestination());
    expect(result.criteria.remoteWorkLegality).toBeNull();
    expect(result.overallStatus).toBe("ELIGIBLE");
  });
});

describe("7. Domestic retiree — retirement-visa criterion null, but state-level financial findings still appear", () => {
  it("nulls retirementOrResidencyPath while still surfacing pension/SS/IRA/401k findings", () => {
    const profile = makeProfile({ activityMode: "RETIRED" });
    const destination = makeDomesticUsDestination();

    const eligibility = evaluateEligibility(profile, destination);
    expect(eligibility.criteria.retirementOrResidencyPath).toBeNull();

    const financial = evaluateFinancialEfficiency(profile, destination);
    const categories = financial.findings.map((f) => f.category);
    expect(categories).toContain("PENSION_TREATMENT");
    expect(categories).toContain("SOCIAL_SECURITY_TREATMENT");
    expect(categories).toContain("IRA_TREATMENT");
    expect(categories).toContain("RETIREMENT_ACCOUNT_401K_TREATMENT");
    expect(financial.findings.find((f) => f.category === "PENSION_TREATMENT")).toMatchObject({ severity: "POSITIVE", reasonCode: "PENSION_TREATMENT_EXEMPT" });
  });
});

describe("8. Domestic buyer — foreign-purchaser gate not evaluated; domestic property/tax findings remain", () => {
  it("nulls foreignPropertyPurchaseRights for a domestic buyer, but keeps property-tax findings", () => {
    const profile = makeProfile({
      tenureIntent: "BUY",
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const destination = makeDomesticUsDestination();

    const eligibility = evaluateEligibility(profile, destination);
    expect(eligibility.criteria.foreignPropertyPurchaseRights).toBeNull();

    const financial = evaluateFinancialEfficiency(profile, destination);
    expect(financial.findings.find((f) => f.category === "PROPERTY_TAX")).toMatchObject({ severity: "NEUTRAL", reasonCode: "PROPERTY_TAX_RATE_KNOWN" });
  });

  it("cross-border buyer still gets the foreign-purchaser gate evaluated", () => {
    const profile = makeProfile({
      tenureIntent: "BUY",
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const eligibility = evaluateEligibility(profile, lisbonShapedCrossBorderDestination);
    expect(eligibility.criteria.foreignPropertyPurchaseRights).not.toBeNull();
  });
});

describe("Layer 4 — domestic move omits international-only findings, never emits UNKNOWN/NEUTRAL/N-A noise", () => {
  it("omits TAX_RESIDENCY_TRIGGER, US_TAX_INTERACTION, and TAX_TREATY_OR_FOREIGN_TAX_CREDIT for a domestic move", () => {
    const profile = makeProfile();
    const result = evaluateFinancialEfficiency(profile, makeDomesticUsDestination());
    const categories = result.findings.map((f) => f.category);

    expect(categories).not.toContain("TAX_RESIDENCY_TRIGGER");
    expect(categories).not.toContain("US_TAX_INTERACTION");
    expect(categories).not.toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
  });

  it("still surfaces WEALTH_TAX for a domestic move when the fact is known", () => {
    const result = evaluateFinancialEfficiency(makeProfile(), makeDomesticUsDestination());
    expect(result.findings.find((f) => f.category === "WEALTH_TAX")).toMatchObject({ severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME" });
  });

  it("cross-border (Lisbon-shaped) findings are completely unaffected", () => {
    const result = evaluateFinancialEfficiency(makeProfile(), lisbonShapedCrossBorderDestination);
    const categories = result.findings.map((f) => f.category);
    expect(categories).toContain("TAX_RESIDENCY_TRIGGER");
    expect(categories).toContain("US_TAX_INTERACTION");
    expect(categories).toContain("TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
  });
});

describe("9. Lisbon regression — no behavioral change", () => {
  it("keeps every cross-border criterion/finding active exactly as before", () => {
    const result = evaluateDestinationForProfile(makeProfile(), lisbonShapedCrossBorderDestination);
    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.criteria.entryFeasibility).toMatchObject({ status: "PASS" });
    expect(result.eligibility.criteria.retirementOrResidencyPath).toMatchObject({ status: "PASS" });
    expect(result.financialEfficiency.findings.map((f) => f.category)).toContain("TAX_RESIDENCY_TRIGGER");
  });
});

describe("10. Summerlin-shaped synthetic proof — blank international fields never cause NEEDS_VERIFICATION", () => {
  it("resolves VIABLE, not NEEDS_VERIFICATION, purely from blank international visa/tax fields on a domestic move", () => {
    const profile = makeProfile();
    const result = evaluateDestinationForProfile(profile, makeDomesticUsDestination());

    expect(result.eligibility.overallStatus).toBe("ELIGIBLE");
    expect(result.eligibility.unknownReasonCodes).toEqual([]);
    expect(result.recommendationStatus).toBe("VIABLE");
  });
});

describe("11. Layer 2/3 isolation — relocation applicability never changes affordability or lifestyle scoring", () => {
  it("produces identical Layer 2/Layer 3 results for the same destination regardless of citizenship (domestic vs cross-border)", () => {
    const destination = makeDomesticUsDestination();
    const domesticProfile = makeProfile();
    const crossBorderProfile = makeProfile({ citizenship: { primaryPassportCountryCode: "CA", additionalPassportCountryCodes: [] } });

    expect(deriveRelocationApplicability(domesticProfile, destination)).toBe("DOMESTIC");
    expect(deriveRelocationApplicability(crossBorderProfile, destination)).toBe("CROSS_BORDER");

    const domesticAffordability = evaluateAffordability(domesticProfile, destination);
    const crossBorderAffordability = evaluateAffordability(crossBorderProfile, destination);
    expect(domesticAffordability).toEqual(crossBorderAffordability);

    const domesticLifestyle = evaluateLifestyleFit(domesticProfile, destination);
    const crossBorderLifestyle = evaluateLifestyleFit(crossBorderProfile, destination);
    expect(domesticLifestyle).toEqual(crossBorderLifestyle);
  });
});

describe("12. Determinism", () => {
  it("produces byte-identical eligibility/financial results across repeated calls with the same inputs", () => {
    const profile = makeProfile();
    const destination = makeDomesticUsDestination();

    expect(evaluateEligibility(profile, destination)).toEqual(evaluateEligibility(profile, destination));
    expect(evaluateFinancialEfficiency(profile, destination)).toEqual(evaluateFinancialEfficiency(profile, destination));
    expect(deriveRelocationApplicability(profile, destination)).toBe(deriveRelocationApplicability(profile, destination));
  });
});
