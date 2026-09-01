import { describe, expect, it } from "vitest";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { ActivityMode, BudgetTarget, StayDuration, StayDurationBand, UserProfileV2 } from "../profile-types";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";

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

describe("UserProfileV2 — stay duration and activity mode independence", () => {
  it("allows every activity mode to be combined with every stay-duration band", () => {
    const bands: readonly StayDurationBand[] = [
      "SHORT_1_3_MONTHS",
      "MEDIUM_3_6_MONTHS",
      "EXTENDED_6_12_MONTHS",
      "LONG_TERM_PERMANENT",
      "UNSURE",
    ];
    const modes: readonly ActivityMode[] = [
      "RETIRED",
      "REMOTE_EMPLOYEE",
      "SELF_EMPLOYED",
      "DIGITAL_NOMAD",
      "LOCAL_EMPLOYMENT",
      "SECOND_HOME",
      "SPLIT_YEAR_SNOWBIRD",
      "LEISURE_TRAVELER",
      "TESTING",
      "NOT_SURE",
    ];

    for (const band of bands) {
      for (const activityMode of modes) {
        const stayDuration: StayDuration = { band, intendedStayDurationDays: null };
        const profile = makeProfile({ stayDuration, activityMode });
        expect(profile.stayDuration.band).toBe(band);
        expect(profile.activityMode).toBe(activityMode);
      }
    }
  });

  it("lets a remote employee and a retiree share the same stay duration but differ in activity mode", () => {
    const sharedDuration: StayDuration = { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 };
    const retiree = makeProfile({ stayDuration: sharedDuration, activityMode: "RETIRED", intendsToWorkDuringStay: false });
    const remoteEmployee = makeProfile({
      stayDuration: sharedDuration,
      activityMode: "REMOTE_EMPLOYEE",
      intendsToWorkDuringStay: true,
    });

    expect(retiree.stayDuration).toEqual(remoteEmployee.stayDuration);
    expect(retiree.activityMode).not.toBe(remoteEmployee.activityMode);
    expect(retiree.intendsToWorkDuringStay).toBe(false);
    expect(remoteEmployee.intendsToWorkDuringStay).toBe(true);
  });

  it("splits EXTENDED_3_12_MONTHS into MEDIUM_3_6_MONTHS and EXTENDED_6_12_MONTHS so 90 days / ~6mo / ~7mo / ~12mo are distinguishable", () => {
    const ninetyDays: StayDuration = { band: "SHORT_1_3_MONTHS", intendedStayDurationDays: 90 };
    const sixMonths: StayDuration = { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 182 };
    const sevenMonths: StayDuration = { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 213 };
    const twelveMonths: StayDuration = { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 365 };

    expect(ninetyDays.band).not.toBe(sixMonths.band);
    expect(sixMonths.band).not.toBe(sevenMonths.band);
    expect(sevenMonths.band).toBe(twelveMonths.band);
    expect(sevenMonths.intendedStayDurationDays).not.toBe(twelveMonths.intendedStayDurationDays);
  });

  it("does not create dozens of bands (exactly 5 stay-duration bands)", () => {
    const bands: readonly StayDurationBand[] = [
      "SHORT_1_3_MONTHS",
      "MEDIUM_3_6_MONTHS",
      "EXTENDED_6_12_MONTHS",
      "LONG_TERM_PERMANENT",
      "UNSURE",
    ];
    expect(bands.length).toBe(5);
  });
});

describe("UserProfileV2 — snowbird/split-year representation", () => {
  it("represents a recurring seasonal renter without implying property ownership", () => {
    const snowbirdRenter = makeProfile({
      activityMode: "SPLIT_YEAR_SNOWBIRD",
      stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 120 },
      tenureIntent: "RENT",
    });

    expect(snowbirdRenter.activityMode).toBe("SPLIT_YEAR_SNOWBIRD");
    expect(snowbirdRenter.activityMode).not.toBe("SECOND_HOME");
    expect(snowbirdRenter.tenureIntent).toBe("RENT");
  });

  it("also allows a snowbird who owns, kept distinct via tenureIntent rather than a separate activity mode", () => {
    const snowbirdOwner = makeProfile({ activityMode: "SPLIT_YEAR_SNOWBIRD", tenureIntent: "BUY" });
    expect(snowbirdOwner.activityMode).toBe("SPLIT_YEAR_SNOWBIRD");
    expect(snowbirdOwner.tenureIntent).toBe("BUY");
  });
});

describe("UserProfileV2 — budget: hard ceiling represented separately from amount", () => {
  it("allows the same monthly amount under either ceiling type", () => {
    const hardCeiling: BudgetTarget = { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" };
    const flexibleTarget: BudgetTarget = { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" };

    expect(hardCeiling.monthlyTargetAmount).toBe(flexibleTarget.monthlyTargetAmount);
    expect(hardCeiling.ceilingType).not.toBe(flexibleTarget.ceilingType);
  });
});

describe("UserProfileV2 — hard requirements are structurally separate from soft preferences", () => {
  it("does not require a matching lifestylePreferences entry to activate a hard requirement", () => {
    const profile = makeProfile({
      lifestylePreferences: [],
      hardRequirements: { ...createHardRequirementSelectionsWithNoneActivated(), beachAccessEssential: true },
    });

    expect(profile.lifestylePreferences).toHaveLength(0);
    expect(profile.hardRequirements.beachAccessEssential).toBe(true);
  });

  it("does not activate any hard gate merely because a soft preference has high importance", () => {
    const profile = makeProfile({
      lifestylePreferences: [{ dimensionKey: "climate", direction: "MORE_IS_BETTER", importance: 5, isHardRequirement: false, targetValue: null }],
      hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
    });

    expect(profile.lifestylePreferences[0].importance).toBe(5);
    expect(profile.hardRequirements.beachAccessEssential).toBe(false);
    expect(profile.hardRequirements.mountainOrSkiAccessEssential).toBe(false);
    expect(profile.hardRequirements.lgbtqLegalSafetyEssential).toBe(false);
  });

  it("only allows the fixed hard-gate whitelist fields to be activated (no free-form hard gate field)", () => {
    const keys = Object.keys(createHardRequirementSelectionsWithNoneActivated()).sort();
    expect(keys).toEqual(
      [
        "beachAccessEssential",
        "foreignPropertyPurchaseEssential",
        "lgbtqLegalSafetyEssential",
        "minimumHealthcareStandard",
        "minimumSafetyStandard",
        "mustHaveGeography",
        "mountainOrSkiAccessEssential",
      ].sort(),
    );
  });
});
