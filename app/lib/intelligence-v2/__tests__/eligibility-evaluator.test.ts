import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "../eligibility-evaluator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import {
  ALL_SYNTHETIC_DESTINATION_FIXTURES,
  BEACH_DESTINATION_NO_MOUNTAIN_ACCESS,
  CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY,
  EXCELLENT_HEALTHCARE_HIGH_COST,
  EXPENSIVE_BUT_EXCELLENT_LIFESTYLE,
  LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN,
  MISSING_LEGAL_DATA_UNKNOWN,
  MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS,
  TOURIST_FRIENDLY_NO_LONG_STAY_PATH,
  WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE,
} from "../fixtures/synthetic-destinations";
import {
  ALL_SYNTHETIC_PROFILE_FIXTURES,
  BEACH_ESSENTIAL_USER,
  LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER,
  MOUNTAIN_SKI_ESSENTIAL_USER,
  PERMANENT_RETIREE_BUYER,
  REMOTE_EMPLOYEE_7_MONTH,
  RETIRED_7_MONTH_RENTER,
  RETIRED_90_DAY_RENTER,
} from "../fixtures/synthetic-profiles";

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

describe("1. same-destination / different-profile proof", () => {
  it("produces different eligibility outcomes for 4 profiles at the SAME destination fixture", () => {
    const ninetyDay = evaluateEligibility(RETIRED_90_DAY_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    const sevenMonthRetiree = evaluateEligibility(RETIRED_7_MONTH_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    const sevenMonthRemote = evaluateEligibility(REMOTE_EMPLOYEE_7_MONTH, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    const permanentBuyer = evaluateEligibility(PERMANENT_RETIREE_BUYER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(ninetyDay.overallStatus).toBe("ELIGIBLE");
    expect(sevenMonthRetiree.overallStatus).toBe("EXCLUDED");
    expect(sevenMonthRemote.overallStatus).toBe("EXCLUDED");
    expect(permanentBuyer.overallStatus).toBe("EXCLUDED");

    // The permanent buyer's property gate passes even though they are still excluded overall.
    expect(permanentBuyer.criteria.foreignPropertyPurchaseRights?.status).toBe("PASS");
    expect(permanentBuyer.criteria.retirementOrResidencyPath?.status).toBe("FAIL");

    // The 7-month retiree and 7-month remote employee are excluded via different reason sets.
    expect(sevenMonthRetiree.exclusionReasonCodes).not.toEqual(sevenMonthRemote.exclusionReasonCodes);
  });

  it("differentiates a 7-month retiree (ELIGIBLE) from a 7-month remote employee (EXCLUDED) at the SAME destination and duration", () => {
    const retiree = evaluateEligibility(RETIRED_7_MONTH_RENTER, LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN);
    const remoteEmployee = evaluateEligibility(REMOTE_EMPLOYEE_7_MONTH, LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN);

    expect(RETIRED_7_MONTH_RENTER.stayDuration).toEqual(REMOTE_EMPLOYEE_7_MONTH.stayDuration);
    expect(retiree.overallStatus).toBe("ELIGIBLE");
    expect(remoteEmployee.overallStatus).toBe("EXCLUDED");
    expect(remoteEmployee.exclusionReasonCodes).toContain("REMOTE_WORK_NOT_LEGAL");
    // The remote employee's presence path itself is fine — only work legality fails.
    expect(remoteEmployee.criteria.requiredLegalPath.status).toBe("PASS");
    expect(remoteEmployee.criteria.remoteWorkLegality?.status).toBe("FAIL");
    // The retiree never activates remote-work legality at all.
    expect(retiree.criteria.remoteWorkLegality).toBeNull();
  });
});

describe("2. fatal-flaw proof — a single hard FAIL excludes despite excellent lifestyle attributes", () => {
  it("excludes an LGBTQ-legal-safety-essential profile at an otherwise high-lifestyle-score destination", () => {
    const result = evaluateEligibility(LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER, WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE);

    // The destination genuinely has high lifestyle dimension values...
    const dims = WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE.lifestyleDimensions.dimensionValues;
    expect(dims.climate).toBeGreaterThan(80);
    expect(dims.culture).toBeGreaterThan(80);

    // ...yet the evaluator excludes it purely on the single fatal legal-safety flaw.
    expect(result.overallStatus).toBe("EXCLUDED");
    expect(result.criteria.lgbtqLegalSafetyGate?.status).toBe("FAIL");
    expect(result.exclusionReasonCodes).toContain("LGBTQ_LEGAL_PROTECTIONS_ABSENT");
  });
});

describe("3. PASS / FAIL / UNKNOWN precedence — FAIL always beats UNKNOWN", () => {
  it("returns EXCLUDED (never UNKNOWN_INCOMPLETE) when both a FAIL and an UNKNOWN criterion are activated together", () => {
    const result = evaluateEligibility(LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER, CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY);

    expect(result.criteria.stayDurationFeasibility.status).toBe("FAIL");
    expect(result.criteria.lgbtqLegalSafetyGate?.status).toBe("UNKNOWN");
    expect(result.criteria.spouseOrDependentFeasibility?.status).toBe("UNKNOWN");

    expect(result.overallStatus).toBe("EXCLUDED");
    expect(result.exclusionReasonCodes.length).toBeGreaterThan(0);
    expect(result.unknownReasonCodes).toEqual([]);
  });
});

describe("4. remote-worker branching", () => {
  it("activates remoteWorkLegality only when intendsToWorkDuringStay is true, and evaluates it independently of presence", () => {
    const result = evaluateEligibility(REMOTE_EMPLOYEE_7_MONTH, LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN);
    expect(REMOTE_EMPLOYEE_7_MONTH.intendsToWorkDuringStay).toBe(true);
    expect(result.criteria.remoteWorkLegality).not.toBeNull();
    expect(result.criteria.remoteWorkLegality?.status).toBe("FAIL");
  });

  it("does not activate remoteWorkLegality for a non-working profile", () => {
    const result = evaluateEligibility(RETIRED_7_MONTH_RENTER, LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN);
    expect(RETIRED_7_MONTH_RENTER.intendsToWorkDuringStay).toBe(false);
    expect(result.criteria.remoteWorkLegality).toBeNull();
  });
});

describe("5. retiree branching", () => {
  it("activates retirementOrResidencyPath only for RETIRED activity mode beyond a short tourist stay", () => {
    const shortStay = evaluateEligibility(RETIRED_90_DAY_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    const longerStay = evaluateEligibility(RETIRED_7_MONTH_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(shortStay.criteria.retirementOrResidencyPath).toBeNull();
    expect(longerStay.criteria.retirementOrResidencyPath).not.toBeNull();
    expect(longerStay.criteria.retirementOrResidencyPath?.status).toBe("FAIL");
  });
});

describe("6. local-employment branching", () => {
  it("returns UNKNOWN for LOCAL_EMPLOYMENT since local work authorization is not modeled, without fabricating PASS or FAIL", () => {
    const localEmploymentProfile = makeProfile({ activityMode: "LOCAL_EMPLOYMENT", intendsToWorkDuringStay: true });
    const result = evaluateEligibility(localEmploymentProfile, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(result.criteria.requiredLegalPath.status).toBe("UNKNOWN");
    expect(result.criteria.requiredLegalPath.reasonCode).toBe("LOCAL_EMPLOYMENT_WORK_AUTHORIZATION_NOT_MODELED");
    expect(result.overallStatus).toBe("UNKNOWN_INCOMPLETE");
  });
});

describe("7. property gate conditionality", () => {
  it("activates foreignPropertyPurchaseRights only when tenureIntent is BUY and the gate is marked essential", () => {
    const renter = evaluateEligibility(RETIRED_90_DAY_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(RETIRED_90_DAY_RENTER.tenureIntent).toBe("RENT");
    expect(renter.criteria.foreignPropertyPurchaseRights).toBeNull();

    const buyerWithoutEssentialFlag = makeProfile({ tenureIntent: "BUY" });
    const notActivated = evaluateEligibility(buyerWithoutEssentialFlag, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(notActivated.criteria.foreignPropertyPurchaseRights).toBeNull();

    const buyer = evaluateEligibility(PERMANENT_RETIREE_BUYER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(PERMANENT_RETIREE_BUYER.hardRequirements.foreignPropertyPurchaseEssential).toBe(true);
    expect(buyer.criteria.foreignPropertyPurchaseRights).not.toBeNull();
  });
});

describe("8. healthcare/safety/LGBTQ hard gates", () => {
  it("healthcareGate activates only when a minimum is set, and compares standard tiers", () => {
    const noRequirement = evaluateEligibility(RETIRED_90_DAY_RENTER, EXCELLENT_HEALTHCARE_HIGH_COST);
    expect(noRequirement.criteria.healthcareGate).toBeNull();

    const requiresInternational = makeProfile({
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumHealthcareStandard: "INTERNATIONAL_STANDARD" },
    });
    const passResult = evaluateEligibility(requiresInternational, EXCELLENT_HEALTHCARE_HIGH_COST);
    expect(passResult.criteria.healthcareGate?.status).toBe("PASS");

    const failResult = evaluateEligibility(requiresInternational, CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY);
    expect(failResult.criteria.healthcareGate?.status).toBe("FAIL");

    const unknownResult = evaluateEligibility(requiresInternational, MISSING_LEGAL_DATA_UNKNOWN);
    expect(unknownResult.criteria.healthcareGate?.status).toBe("UNKNOWN");
  });

  it("safetyGate activates only when a minimum is set, and compares standard tiers", () => {
    const requiresHighSafety = makeProfile({
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), minimumSafetyStandard: "HIGH_SAFETY_ONLY" },
    });
    expect(evaluateEligibility(requiresHighSafety, MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS).criteria.safetyGate?.status).toBe("PASS");
    expect(evaluateEligibility(requiresHighSafety, CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY).criteria.safetyGate?.status).toBe("FAIL");
    expect(evaluateEligibility(requiresHighSafety, MISSING_LEGAL_DATA_UNKNOWN).criteria.safetyGate?.status).toBe("UNKNOWN");
  });

  it("lgbtqLegalSafetyGate activates only when marked essential", () => {
    const notEssential = evaluateEligibility(RETIRED_90_DAY_RENTER, WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE);
    expect(notEssential.criteria.lgbtqLegalSafetyGate).toBeNull();

    expect(evaluateEligibility(LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER, EXPENSIVE_BUT_EXCELLENT_LIFESTYLE).criteria.lgbtqLegalSafetyGate?.status).toBe("PASS");
    expect(evaluateEligibility(LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER, WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE).criteria.lgbtqLegalSafetyGate?.status).toBe("FAIL");
    expect(evaluateEligibility(LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER, MISSING_LEGAL_DATA_UNKNOWN).criteria.lgbtqLegalSafetyGate?.status).toBe("UNKNOWN");
  });
});

describe("9. beach and mountain/ski hard gates", () => {
  it("beachAccessGate activates only when essential and reflects the destination's beach access fact", () => {
    expect(evaluateEligibility(RETIRED_90_DAY_RENTER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS).criteria.beachAccessGate).toBeNull();
    expect(evaluateEligibility(BEACH_ESSENTIAL_USER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS).criteria.beachAccessGate?.status).toBe("PASS");
    expect(evaluateEligibility(BEACH_ESSENTIAL_USER, MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS).criteria.beachAccessGate?.status).toBe("FAIL");
  });

  it("mountainOrSkiAccessGate activates only when essential and reflects the destination's mountain/ski access fact", () => {
    expect(evaluateEligibility(RETIRED_90_DAY_RENTER, MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS).criteria.mountainOrSkiAccessGate).toBeNull();
    expect(evaluateEligibility(MOUNTAIN_SKI_ESSENTIAL_USER, MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS).criteria.mountainOrSkiAccessGate?.status).toBe("PASS");
    expect(evaluateEligibility(MOUNTAIN_SKI_ESSENTIAL_USER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS).criteria.mountainOrSkiAccessGate?.status).toBe("FAIL");
  });

  it("a beach-essential and a mountain/ski-essential user diverge at the same two destinations", () => {
    const beachUserAtBeach = evaluateEligibility(BEACH_ESSENTIAL_USER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS);
    const mountainUserAtBeach = evaluateEligibility(MOUNTAIN_SKI_ESSENTIAL_USER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS);
    // BEACH_ESSENTIAL_USER's activityMode is NOT_SURE, so requiredLegalPath is UNKNOWN — the
    // beach gate itself still passes, but overall status reflects the unresolved activity mode.
    expect(beachUserAtBeach.criteria.beachAccessGate?.status).toBe("PASS");
    expect(beachUserAtBeach.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(mountainUserAtBeach.overallStatus).toBe("EXCLUDED");
  });
});

describe("10. unsupported/missing passport applicability -> UNKNOWN", () => {
  it("returns UNKNOWN entryFeasibility (and UNKNOWN_INCOMPLETE overall) for a passport not yet supported by the data model", () => {
    const unsupportedPassportProfile = makeProfile({ citizenship: { primaryPassportCountryCode: "CA", additionalPassportCountryCodes: [] } });
    const result = evaluateEligibility(unsupportedPassportProfile, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(result.criteria.entryFeasibility.status).toBe("UNKNOWN");
    expect(result.criteria.entryFeasibility.reasonCode).toBe("PASSPORT_NOT_YET_SUPPORTED");
    expect(result.overallStatus).toBe("UNKNOWN_INCOMPLETE");
  });

  it("still returns PASS for the currently-supported US passport under the same conditions", () => {
    const result = evaluateEligibility(RETIRED_90_DAY_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(result.criteria.entryFeasibility.status).toBe("PASS");
  });
});

describe("11. NOT_SURE activity -> UNKNOWN where branch cannot be determined", () => {
  it("returns UNKNOWN requiredLegalPath for a NOT_SURE activity mode even when everything else would otherwise pass", () => {
    const result = evaluateEligibility(BEACH_ESSENTIAL_USER, BEACH_DESTINATION_NO_MOUNTAIN_ACCESS);

    expect(BEACH_ESSENTIAL_USER.activityMode).toBe("NOT_SURE");
    expect(result.criteria.requiredLegalPath.status).toBe("UNKNOWN");
    expect(result.criteria.requiredLegalPath.reasonCode).toBe("ACTIVITY_MODE_NOT_SURE");
    expect(result.criteria.beachAccessGate?.status).toBe("PASS");
    expect(result.overallStatus).toBe("UNKNOWN_INCOMPLETE");
  });
});

describe("12. no tax-residency leakage into Layer 1", () => {
  it("produces an identical EligibilityResult regardless of what the destination's financial facts contain", () => {
    const original = evaluateEligibility(RETIRED_7_MONTH_RENTER, EXPENSIVE_BUT_EXCELLENT_LIFESTYLE);

    const mutatedDestination = {
      ...EXPENSIVE_BUT_EXCELLENT_LIFESTYLE,
      financial: {
        taxResidencyTriggerDays: 1,
        pensionTaxable: "NO" as const,
        socialSecurityTaxTreatyBenefit: "NO" as const,
        iraOrForeignRetirementAccountRecognized: "NO" as const,
        fourZeroOneKRecognized: "NO" as const,
        usTaxTreatyInEffect: "NO" as const,
        foreignTaxCreditAvailable: "NO" as const,
        wealthTaxApplicable: "YES" as const,
        propertyTaxAnnualRatePercent: 99,
        propertyPurchaseOrTransferTaxPercent: 99,
        buyVsRentBreakEvenYears: 1,
      },
      cost: { estimatedMonthlyCostRange: null, householdSizeAssumedForEstimate: 1 },
    };

    const mutated = evaluateEligibility(RETIRED_7_MONTH_RENTER, mutatedDestination);
    expect(mutated).toEqual(original);
  });

  it("never contains a tax-related key anywhere in EligibilityCriteria across every fixture", () => {
    for (const profile of ALL_SYNTHETIC_PROFILE_FIXTURES) {
      for (const destination of ALL_SYNTHETIC_DESTINATION_FIXTURES) {
        const result = evaluateEligibility(profile, destination);
        const criteriaKeys = Object.keys(result.criteria);
        expect(criteriaKeys.some((key) => key.toLowerCase().includes("tax"))).toBe(false);
      }
    }
  });
});

describe("evaluator runs deterministically across the full fixture matrix", () => {
  it("never throws and always returns a valid overallStatus for all 10 profiles x 13 destinations", () => {
    for (const profile of ALL_SYNTHETIC_PROFILE_FIXTURES) {
      for (const destination of ALL_SYNTHETIC_DESTINATION_FIXTURES) {
        const result = evaluateEligibility(profile, destination);
        expect(["ELIGIBLE", "EXCLUDED", "UNKNOWN_INCOMPLETE"]).toContain(result.overallStatus);
      }
    }
  });

  it("is a pure function — calling it twice with the same inputs yields the same result", () => {
    const first = evaluateEligibility(RETIRED_7_MONTH_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    const second = evaluateEligibility(RETIRED_7_MONTH_RENTER, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(second).toEqual(first);
  });
});
