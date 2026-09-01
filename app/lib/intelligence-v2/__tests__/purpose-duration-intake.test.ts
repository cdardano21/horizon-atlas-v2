import { describe, expect, it } from "vitest";
import { evaluateEligibility } from "../eligibility-evaluator";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import { derivePurposeAndDurationProfileFields } from "../purpose-duration-intake";
import { EXCELLENT_DIGITAL_NOMAD_LEGAL_PATH, TOURIST_FRIENDLY_NO_LONG_STAY_PATH } from "../fixtures/synthetic-destinations";

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] as const };
const singleHousehold = { type: "SINGLE" as const, dependentCount: 0, spouseOrPartnerAccompanying: false };

function makeProfile(overrides: Partial<UserProfileV2> = {}): UserProfileV2 {
  return {
    profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
    stayDuration: { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 },
    activityMode: "NOT_SURE",
    citizenship: baseCitizenship,
    household: singleHousehold,
    budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
    tenureIntent: "UNSURE",
    intendsToWorkDuringStay: false,
    lifestylePreferences: [],
    hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    ...overrides,
  };
}

describe("purpose-duration intake adapter — mapping onto canonical profile fields", () => {
  it("only maps the explicit 'Not sure yet' purpose to activityMode NOT_SURE", () => {
    expect(derivePurposeAndDurationProfileFields("LEISURE_TRAVELER", "ABOUT_ONE_MONTH").activityMode).toBe("LEISURE_TRAVELER");
    expect(derivePurposeAndDurationProfileFields("REMOTE_EMPLOYEE", "ABOUT_SIX_MONTHS").activityMode).toBe("REMOTE_EMPLOYEE");
    expect(derivePurposeAndDurationProfileFields("RETIRED", "INDEFINITE_OR_PERMANENT").activityMode).toBe("RETIRED");
    expect(derivePurposeAndDurationProfileFields("NOT_SURE", "ABOUT_ONE_MONTH").activityMode).toBe("NOT_SURE");
  });

  it("captures indefinite or permanent stays with the canonical permanent duration band", () => {
    const fields = derivePurposeAndDurationProfileFields("RETIRED", "INDEFINITE_OR_PERMANENT");
    expect(fields.stayDuration).toEqual({ band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null });
  });

  it("does not set Second home to BUY or property-purchase intent; it stays neutral until a dedicated rent-vs-buy answer exists", () => {
    const fields = derivePurposeAndDurationProfileFields("SECOND_HOME", "ABOUT_SIX_MONTHS");
    expect(fields.tenureIntent).toBe("UNSURE");
    expect(fields.activityMode).toBe("SECOND_HOME");
  });

  it("turns on intendsToWorkDuringStay for remote employee, self-employed, digital nomad, and local employment", () => {
    expect(derivePurposeAndDurationProfileFields("REMOTE_EMPLOYEE", "ABOUT_ONE_YEAR").intendsToWorkDuringStay).toBe(true);
    expect(derivePurposeAndDurationProfileFields("SELF_EMPLOYED", "ABOUT_THREE_MONTHS").intendsToWorkDuringStay).toBe(true);
    expect(derivePurposeAndDurationProfileFields("DIGITAL_NOMAD", "ABOUT_SIX_MONTHS").intendsToWorkDuringStay).toBe(true);
    expect(derivePurposeAndDurationProfileFields("LOCAL_EMPLOYMENT", "ABOUT_ONE_MONTH").intendsToWorkDuringStay).toBe(true);
  });

  it("keeps intendsToWorkDuringStay false for leisure traveler and retired", () => {
    expect(derivePurposeAndDurationProfileFields("LEISURE_TRAVELER", "ABOUT_ONE_MONTH").intendsToWorkDuringStay).toBe(false);
    expect(derivePurposeAndDurationProfileFields("RETIRED", "INDEFINITE_OR_PERMANENT").intendsToWorkDuringStay).toBe(false);
  });
});

describe("targeted proof 1 — a one-month leisure traveler triggers no retirement-specific eligibility or assumptions", () => {
  it("evaluates ELIGIBLE via the tourist pathway, never activating retirement or property gates", () => {
    const { activityMode, stayDuration, tenureIntent } = derivePurposeAndDurationProfileFields("LEISURE_TRAVELER", "ABOUT_ONE_MONTH");
    const profile = makeProfile({ activityMode, stayDuration, tenureIntent });

    const result = evaluateEligibility(profile, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(profile.activityMode).toBe("LEISURE_TRAVELER");
    expect(result.overallStatus).toBe("ELIGIBLE");
    expect(result.criteria.retirementOrResidencyPath).toBeNull();
    expect(result.criteria.foreignPropertyPurchaseRights).toBeNull();
    expect(result.criteria.remoteWorkLegality).toBeNull();
    expect(result.criteria.requiredLegalPath?.reasonCode).toBe("TOURIST_PATH_SUFFICIENT_FOR_PRESENCE");
  });
});

describe("targeted proof 2 — a six-month digital nomad follows the digital-nomad/remote-work pathway", () => {
  it("resolves eligibility through the digital-nomad/remote-work visa fact once beyond the tourist limit", () => {
    const { activityMode, stayDuration, tenureIntent } = derivePurposeAndDurationProfileFields("DIGITAL_NOMAD", "ABOUT_SIX_MONTHS");
    const profile = makeProfile({ activityMode, stayDuration, tenureIntent });

    const result = evaluateEligibility(profile, EXCELLENT_DIGITAL_NOMAD_LEGAL_PATH);

    expect(profile.activityMode).toBe("DIGITAL_NOMAD");
    expect(result.overallStatus).toBe("ELIGIBLE");
    expect(result.criteria.requiredLegalPath?.reasonCode).toBe("ACTIVITY_APPROPRIATE_PATH_AVAILABLE");
    expect(result.criteria.stayDurationFeasibility?.reasonCode).toBe("PROFILE_COMPATIBLE_LONG_STAY_PATH_AVAILABLE");
    expect(result.criteria.retirementOrResidencyPath).toBeNull();
  });
});

describe("targeted proof 3 — an explicit permanent retiree still receives retirement-specific evaluation", () => {
  it("activates the retirement/residency gate only because activityMode is RETIRED", () => {
    const { activityMode, stayDuration, tenureIntent } = derivePurposeAndDurationProfileFields("RETIRED", "INDEFINITE_OR_PERMANENT");
    const profile = makeProfile({ activityMode, stayDuration, tenureIntent });

    const result = evaluateEligibility(profile, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);

    expect(profile.activityMode).toBe("RETIRED");
    expect(result.criteria.retirementOrResidencyPath).not.toBeNull();
    expect(result.criteria.retirementOrResidencyPath?.status).toBe("FAIL");
    expect(result.criteria.retirementOrResidencyPath?.reasonCode).toBe("NO_RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE");
  });
});

describe("targeted proof 4 — hard requirements remain off/null unless explicitly selected", () => {
  it("activates no hard-requirement gate for a profile built purely from purpose/duration intake", () => {
    const { activityMode, stayDuration, tenureIntent } = derivePurposeAndDurationProfileFields("LEISURE_TRAVELER", "ABOUT_ONE_MONTH");
    const profile = makeProfile({ activityMode, stayDuration, tenureIntent });

    expect(profile.hardRequirements).toEqual(createHardRequirementSelectionsWithNoneActivated());

    const result = evaluateEligibility(profile, TOURIST_FRIENDLY_NO_LONG_STAY_PATH);
    expect(result.criteria.beachAccessGate).toBeNull();
    expect(result.criteria.mountainOrSkiAccessGate).toBeNull();
    expect(result.criteria.healthcareGate).toBeNull();
    expect(result.criteria.safetyGate).toBeNull();
    expect(result.criteria.lgbtqLegalSafetyGate).toBeNull();
  });
});
