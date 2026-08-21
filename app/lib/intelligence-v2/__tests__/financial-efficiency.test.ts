import { describe, expect, it } from "vitest";
import { evaluateFinancialEfficiency } from "../financial-efficiency";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import type { SyntheticDestinationFixture } from "../destination-fact-types";
import {
  AFFORDABLE_AT_6500_NOT_AT_4500,
  LAYER4_TEST_RETIREMENT_TREATMENT_DIFFERENTIATION,
  LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN,
  MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS,
} from "../fixtures/synthetic-destinations";

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 },
    activityMode: "RETIRED",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "RENT",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

/** Destination template with a configurable tax-residency threshold; only `financial`/`entryAndStay` matter to Layer 4. */
function makeDestination(taxResidencyTriggerDays: number | null, overrides: Partial<SyntheticDestinationFixture["financial"]> = {}): SyntheticDestinationFixture {
  return {
    ...MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS,
    id: "fixture-layer4-test",
    displayName: "Fixture: Layer 4 Test",
    notes: "Layer 4 evaluator test fixture.",
    financial: {
      taxResidencyTriggerDays,
      pensionTreatment: "UNKNOWN",
      socialSecurityTreatment: "UNKNOWN",
      iraTreatment: "UNKNOWN",
      retirementAccount401kTreatment: "UNKNOWN",
      usTaxTreatyInEffect: "UNKNOWN",
      foreignTaxCreditAvailable: "UNKNOWN",
      wealthTaxApplicable: "UNKNOWN",
      propertyTaxAnnualRatePercent: null,
      propertyPurchaseOrTransferTaxPercent: null,
      buyVsRentBreakEvenYears: null,
      ...overrides,
    },
  };
}

function categoriesOf(result: ReturnType<typeof evaluateFinancialEfficiency>): string[] {
  return result.findings.map((f) => f.category);
}

describe("1-2. duration/activity context — 90-day renter vs 7-month retiree", () => {
  it("1. a 90-day renter below the tax threshold gets only a NEUTRAL tax-residency finding", () => {
    const destination = makeDestination(183);
    const profile = makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } });
    const result = evaluateFinancialEfficiency(profile, destination);

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].category).toBe("TAX_RESIDENCY_TRIGGER");
    expect(result.findings[0].severity).toBe("NEUTRAL");
  });

  it("2. a 7-month retiree above the tax threshold gets a rich, CAUTION-triggered finding set", () => {
    const destination = makeDestination(183);
    const profile = makeProfile({
      activityMode: "RETIRED",
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
    });
    const result = evaluateFinancialEfficiency(profile, destination);

    expect(categoriesOf(result)).toContain("TAX_RESIDENCY_TRIGGER");
    expect(result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")?.severity).toBe("CAUTION");
    expect(categoriesOf(result)).toContain("PENSION_TREATMENT");
    expect(categoriesOf(result)).toContain("SOCIAL_SECURITY_TREATMENT");
    expect(categoriesOf(result)).toContain("IRA_TREATMENT");
    expect(categoriesOf(result)).toContain("RETIREMENT_ACCOUNT_401K_TREATMENT");
  });
});

describe("3. 7-month remote employee above threshold gets tax-residency/earned-income context but no retirement findings", () => {
  it("omits pension/SS/IRA/401k for a non-retired activity mode", () => {
    const destination = makeDestination(183);
    const profile = makeProfile({
      activityMode: "REMOTE_EMPLOYEE",
      intendsToWorkDuringStay: true,
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
    });
    const result = evaluateFinancialEfficiency(profile, destination);

    const taxFinding = result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER");
    expect(taxFinding?.severity).toBe("CAUTION");
    expect(taxFinding?.reasonCode).toBe("TAX_RESIDENCY_THRESHOLD_TRIGGERED_EARNED_INCOME_CONTEXT");
    expect(categoriesOf(result)).not.toContain("PENSION_TREATMENT");
    expect(categoriesOf(result)).toContain("US_TAX_INTERACTION");
  });
});

describe("4-5. permanent retiree / permanent buyer gets the full long-term finding set", () => {
  it("emits retirement, US-tax, and property findings together for a permanent retiree who is also buying", () => {
    const destination = makeDestination(150, {
      pensionTreatment: "FAVORABLE",
      propertyTaxAnnualRatePercent: 0.5,
      propertyPurchaseOrTransferTaxPercent: 3,
      buyVsRentBreakEvenYears: 5,
    });
    const profile = makeProfile({
      activityMode: "RETIRED",
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      tenureIntent: "BUY",
      household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true },
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const result = evaluateFinancialEfficiency(profile, destination);

    expect(categoriesOf(result)).toEqual(
      expect.arrayContaining([
        "TAX_RESIDENCY_TRIGGER",
        "PENSION_TREATMENT",
        "SOCIAL_SECURITY_TREATMENT",
        "IRA_TREATMENT",
        "RETIREMENT_ACCOUNT_401K_TREATMENT",
        "US_TAX_INTERACTION",
        "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
        "WEALTH_TAX",
        "PROPERTY_TAX",
        "PURCHASE_OR_TRANSFER_TAX",
        "BUY_VS_RENT_IMPLICATION",
        "PROPERTY_RESIDENCY_RELATIONSHIP",
      ]),
    );
    // Null exact days on a permanent stay -> tax residency threshold cannot be confirmed, so it's UNKNOWN not NEUTRAL.
    expect(result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")?.severity).toBe("UNKNOWN");
  });
});

describe("6-7. split-year snowbird — duration depends on actual days, not the label", () => {
  const destination = makeDestination(183);

  it("6. below threshold -> NEUTRAL", () => {
    const profile = makeProfile({ activityMode: "SPLIT_YEAR_SNOWBIRD", stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 120 } });
    const result = evaluateFinancialEfficiency(profile, destination);
    expect(result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")?.severity).toBe("NEUTRAL");
  });

  it("7. same band, more days, above threshold -> CAUTION", () => {
    const profile = makeProfile({ activityMode: "SPLIT_YEAR_SNOWBIRD", stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 200 } });
    const result = evaluateFinancialEfficiency(profile, destination);
    expect(result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")?.severity).toBe("CAUTION");
  });
});

describe("8. missing tax threshold -> UNKNOWN", () => {
  it("returns UNKNOWN when the destination has no threshold fact at all", () => {
    const destination = makeDestination(null);
    const profile = makeProfile();
    const result = evaluateFinancialEfficiency(profile, destination);
    const taxFinding = result.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER");
    expect(taxFinding?.severity).toBe("UNKNOWN");
    expect(taxFinding?.reasonCode).toBe("NO_TAX_RESIDENCY_THRESHOLD_FACT");
  });
});

describe("9. pension favorable / SS taxable / IRA unknown / 401k treaty-dependent — four distinct findings", () => {
  it("never collapses retirement treatment into one judgment", () => {
    const profile = makeProfile({
      activityMode: "RETIRED",
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 },
    });
    const result = evaluateFinancialEfficiency(profile, LAYER4_TEST_RETIREMENT_TREATMENT_DIFFERENTIATION);

    const pension = result.findings.find((f) => f.category === "PENSION_TREATMENT")!;
    const ss = result.findings.find((f) => f.category === "SOCIAL_SECURITY_TREATMENT")!;
    const ira = result.findings.find((f) => f.category === "IRA_TREATMENT")!;
    const k401 = result.findings.find((f) => f.category === "RETIREMENT_ACCOUNT_401K_TREATMENT")!;

    expect(pension.severity).toBe("POSITIVE");
    expect(ss.severity).toBe("NEGATIVE");
    expect(ira.severity).toBe("UNKNOWN");
    expect(k401.severity).toBe("CAUTION");

    const severities = new Set([pension.severity, ss.severity, ira.severity, k401.severity]);
    expect(severities.size).toBe(4); // four genuinely distinct outcomes
  });
});

describe("10-11. property conditionality — buyer gets purchase-tax finding, renter does not", () => {
  const destination = AFFORDABLE_AT_6500_NOT_AT_4500; // has known property/purchase-tax and buy-vs-rent facts

  it("10. buyer gets PURCHASE_OR_TRANSFER_TAX, PROPERTY_TAX, BUY_VS_RENT_IMPLICATION, and PROPERTY_RESIDENCY_RELATIONSHIP", () => {
    const buyer = makeProfile({
      tenureIntent: "BUY",
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const result = evaluateFinancialEfficiency(buyer, destination);
    expect(categoriesOf(result)).toContain("PURCHASE_OR_TRANSFER_TAX");
    expect(categoriesOf(result)).toContain("PROPERTY_TAX");
    expect(categoriesOf(result)).toContain("BUY_VS_RENT_IMPLICATION");
    expect(categoriesOf(result)).toContain("PROPERTY_RESIDENCY_RELATIONSHIP");
  });

  it("11. a renter never gets any property-purchase finding at all", () => {
    const renter = makeProfile({ tenureIntent: "RENT" });
    const result = evaluateFinancialEfficiency(renter, destination);
    expect(categoriesOf(result)).not.toContain("PURCHASE_OR_TRANSFER_TAX");
    expect(categoriesOf(result)).not.toContain("PROPERTY_TAX");
    expect(categoriesOf(result)).not.toContain("BUY_VS_RENT_IMPLICATION");
    expect(categoriesOf(result)).not.toContain("PROPERTY_RESIDENCY_RELATIONSHIP");
  });
});

describe("12. wealth-tax applicability unknown, never NEGATIVE by default", () => {
  it("returns CAUTION (not NEGATIVE) when a wealth-tax regime exists but profile has no net-worth data", () => {
    const profile = makeProfile({ activityMode: "RETIRED", stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } });
    const result = evaluateFinancialEfficiency(profile, MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS); // wealthTaxApplicable: "YES"
    const wealthFinding = result.findings.find((f) => f.category === "WEALTH_TAX");
    expect(wealthFinding?.severity).toBe("CAUTION");
    expect(wealthFinding?.severity).not.toBe("NEGATIVE");
  });
});

describe("13-14. US tax interaction and treaty/FTC findings remain separate categories", () => {
  it("never merges US_TAX_INTERACTION and TAX_TREATY_OR_FOREIGN_TAX_CREDIT into one finding", () => {
    const destination = makeDestination(150, { usTaxTreatyInEffect: "YES", foreignTaxCreditAvailable: "YES" });
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 } });
    const result = evaluateFinancialEfficiency(profile, destination);

    const usInteraction = result.findings.filter((f) => f.category === "US_TAX_INTERACTION");
    const treaty = result.findings.filter((f) => f.category === "TAX_TREATY_OR_FOREIGN_TAX_CREDIT");
    expect(usInteraction).toHaveLength(1);
    expect(treaty).toHaveLength(1);
    expect(treaty[0].reasonCode).not.toBe(usInteraction[0].reasonCode);
  });
});

describe("15. tax-residency/legal-residency separation — no Layer 1 leakage", () => {
  it("produces a CAUTION tax-residency finding without any eligibility/legal-residency verdict, and is unaffected by mutating Layer 1 legal facts (renter, so the shared property/residency fact is never read)", () => {
    const destination = makeDestination(150);
    const profile = makeProfile({
      tenureIntent: "RENT",
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 },
    });
    const original = evaluateFinancialEfficiency(profile, destination);

    expect(original.findings.find((f) => f.category === "TAX_RESIDENCY_TRIGGER")?.severity).toBe("CAUTION");
    expect(Object.keys(original)).not.toContain("eligible");
    expect(Object.keys(original)).not.toContain("excluded");
    expect(original.findings.some((f) => (f as unknown as { status?: string }).status === "FAIL")).toBe(false);

    const mutatedLegalFacts = {
      ...destination,
      entryAndStay: {
        touristEntryAllowed: "NO" as const,
        touristStayLimitDays: 1,
        extendedStayOrLongStayVisaAvailable: "NO" as const,
        permanentResidencyPathAvailable: "NO" as const,
        retirementVisaProgramAvailable: "NO" as const,
        remoteWorkOrDigitalNomadVisaAvailable: "NO" as const,
        remoteWorkLegalUnderTouristStatus: "NO" as const,
        foreignPropertyPurchaseAllowed: "NO" as const,
        propertyPurchaseGrantsResidencyPath: destination.entryAndStay.propertyPurchaseGrantsResidencyPath, // renter never reads this anyway
        spouseOrDependentInclusionSupported: "NO" as const,
      },
    };

    expect(evaluateFinancialEfficiency(profile, mutatedLegalFacts)).toEqual(original);
  });
});

describe("16. Layer 2 separation — monthly affordability mutation has no effect", () => {
  it("is unaffected by mutated cost range, budget, or ceiling type", () => {
    const destination = makeDestination(150);
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 } });
    const original = evaluateFinancialEfficiency(profile, destination);

    const mutatedDestination = {
      ...destination,
      cost: { estimatedMonthlyCostRange: { low: 99999, high: 999999, currencyCode: "USD" }, householdSizeAssumedForEstimate: 9 },
    };
    const mutatedProfile: UserProfileV2 = { ...profile, budget: { monthlyTargetAmount: 1, currencyCode: "USD", ceilingType: "HARD_CEILING" } };

    expect(evaluateFinancialEfficiency(mutatedProfile, mutatedDestination)).toEqual(original);
  });
});

describe("17. Layer 3 separation — lifestyle mutation has no effect", () => {
  it("is unaffected by mutated beach/mountain/golf/nightlife/culture/walkability/climate/community facts", () => {
    const destination = makeDestination(150);
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 } });
    const original = evaluateFinancialEfficiency(profile, destination);

    const mutatedDestination = {
      ...destination,
      hardGates: {
        beachAccess: "DIRECT_ACCESS" as const,
        mountainOrSkiAccess: "SKI_RESORT_ACCESS" as const,
        healthcareStandard: "INTERNATIONAL_STANDARD" as const,
        safetyStandard: "HIGH_SAFETY_ONLY" as const,
        lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE" as const,
      },
      lifestyleDimensions: { dimensionValues: { golf: 100, nightlife: 100, culture: 100, walkability: 100, climate: 100, community: 100 } },
    };

    expect(evaluateFinancialEfficiency(profile, mutatedDestination)).toEqual(original);
  });
});

describe("18. same destination / different user produces materially different finding sets", () => {
  it("Profiles A-D diverge in finding count/category set on the same destination", () => {
    const destination = LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN;

    const profileA = makeProfile({ activityMode: "RETIRED", stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } });
    const profileB = makeProfile({ activityMode: "RETIRED", stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 } });
    const profileC = makeProfile({
      activityMode: "REMOTE_EMPLOYEE",
      intendsToWorkDuringStay: true,
      stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
    });
    const profileD = makeProfile({
      activityMode: "RETIRED",
      tenureIntent: "BUY",
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });

    const resultA = evaluateFinancialEfficiency(profileA, destination);
    const resultB = evaluateFinancialEfficiency(profileB, destination);
    const resultC = evaluateFinancialEfficiency(profileC, destination);
    const resultD = evaluateFinancialEfficiency(profileD, destination);

    const sets = [resultA, resultB, resultC, resultD].map((r) => categoriesOf(r).join(","));
    expect(new Set(sets).size).toBe(4); // all four genuinely different finding sets
    expect(categoriesOf(resultB)).toContain("PENSION_TREATMENT");
    expect(categoriesOf(resultC)).not.toContain("PENSION_TREATMENT");
    expect(categoriesOf(resultD)).toContain("PROPERTY_TAX");
    expect(categoriesOf(resultA)).toHaveLength(1);
  });
});

describe("19. identical inputs produce byte-identical output", () => {
  it("is deterministic across repeated runs", () => {
    const destination = makeDestination(150);
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 } });
    const first = evaluateFinancialEfficiency(profile, destination);
    const second = evaluateFinancialEfficiency(profile, destination);
    expect(second).toEqual(first);
  });
});

describe("20. no single financial score exists", () => {
  it("FinancialEfficiencyResult has no totalScore/overallScore/financialScore or equivalent rollup", () => {
    const destination = makeDestination(150);
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 200 } });
    const result = evaluateFinancialEfficiency(profile, destination);

    const keys = Object.keys(result).map((k) => k.toLowerCase());
    expect(keys).not.toContain("totalscore");
    expect(keys).not.toContain("overallscore");
    expect(keys).not.toContain("financialscore");
    expect(keys).not.toContain("score");
    expect(Array.isArray(result.findings)).toBe(true);
  });
});

describe("duration threshold boundary tests", () => {
  const destination = makeDestination(183);

  it("90 days, well below threshold -> NEUTRAL", () => {
    const profile = makeProfile({ stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 } });
    expect(evaluateFinancialEfficiency(profile, destination).findings[0].severity).toBe("NEUTRAL");
  });

  it("182 days, exactly one below threshold -> NEUTRAL", () => {
    const profile = makeProfile({ stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 182 } });
    expect(evaluateFinancialEfficiency(profile, destination).findings[0].severity).toBe("NEUTRAL");
  });

  it("183 days, exactly at threshold -> CAUTION (inclusive trigger)", () => {
    const profile = makeProfile({ stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 183 } });
    expect(evaluateFinancialEfficiency(profile, destination).findings[0].severity).toBe("CAUTION");
  });

  it("184 days, one above threshold -> CAUTION", () => {
    const profile = makeProfile({ stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 184 } });
    expect(evaluateFinancialEfficiency(profile, destination).findings[0].severity).toBe("CAUTION");
  });

  it("exact days null -> UNKNOWN (never guessed from band alone)", () => {
    const profile = makeProfile({ stayDuration: { band: "UNSURE", intendedStayDurationDays: null } });
    const result = evaluateFinancialEfficiency(profile, destination);
    expect(result.findings[0].severity).toBe("UNKNOWN");
    expect(result.findings[0].reasonCode).toBe("STAY_DURATION_DAYS_UNKNOWN");
  });
});

describe("category order", () => {
  it("returns findings in the fixed category order, never sorted by severity", () => {
    const profile = makeProfile({
      activityMode: "RETIRED",
      tenureIntent: "BUY",
      stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), foreignPropertyPurchaseEssential: true },
    });
    const result = evaluateFinancialEfficiency(profile, LAYER4_TEST_RETIREMENT_TREATMENT_DIFFERENTIATION);
    const categories = categoriesOf(result);
    const sortedCopy = [...categories].sort();
    // Category order must be the fixed policy order, not alphabetical or severity-based.
    expect(categories).toEqual([
      "TAX_RESIDENCY_TRIGGER",
      "PENSION_TREATMENT",
      "SOCIAL_SECURITY_TREATMENT",
      "IRA_TREATMENT",
      "RETIREMENT_ACCOUNT_401K_TREATMENT",
      "US_TAX_INTERACTION",
      "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
      "WEALTH_TAX",
      "PROPERTY_TAX",
      "PURCHASE_OR_TRANSFER_TAX",
      "BUY_VS_RENT_IMPLICATION",
      "PROPERTY_RESIDENCY_RELATIONSHIP",
    ]);
    expect(categories).not.toEqual(sortedCopy);
  });
});
