import { CURRENT_PROFILE_CONTRACT_VERSION } from "../versions";
import { createHardRequirementSelectionsWithNoneActivated } from "../profile-types";
import type { UserProfileV2 } from "../profile-types";

/**
 * ~10 synthetic UserProfileV2 fixtures corresponding to the Navigator Report's
 * controlled-cohort scenario matrix. Reusable by later evaluator tests.
 */

const baseCitizenship = { primaryPassportCountryCode: "US", additionalPassportCountryCodes: [] } as const;
const singleHousehold = { type: "SINGLE", dependentCount: 0, spouseOrPartnerAccompanying: false } as const;

/** 1. ~90-day retired renter. */
export const RETIRED_90_DAY_RENTER: UserProfileV2 = {
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
};

/** 2. ~7-month retiree renter. */
export const RETIRED_7_MONTH_RENTER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
  activityMode: "RETIRED",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 3500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
};

/** 3. ~7-month US remote employee (same duration as #2, different activity mode). */
export const REMOTE_EMPLOYEE_7_MONTH: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
  activityMode: "REMOTE_EMPLOYEE",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 4200, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: true,
  lifestylePreferences: [],
  hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
};

/** 4. Permanent retiree/buyer. */
export const PERMANENT_RETIREE_BUYER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "LONG_TERM_PERMANENT", intendedStayDurationDays: null },
  activityMode: "RETIRED",
  citizenship: baseCitizenship,
  household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true },
  budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "BUY",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: {
    ...createHardRequirementSelectionsWithNoneActivated(),
    foreignPropertyPurchaseEssential: true,
  },
};

/** 5. $4,500 hard-budget user. */
export const HARD_BUDGET_4500_USER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
  activityMode: "RETIRED",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 4500, currencyCode: "USD", ceilingType: "HARD_CEILING" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
};

/** 6. $6,500 flexible-budget user. */
export const FLEXIBLE_BUDGET_6500_USER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 240 },
  activityMode: "RETIRED",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 6500, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
};

/** 7. Beach-essential user. */
export const BEACH_ESSENTIAL_USER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 150 },
  activityMode: "NOT_SURE",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "UNSURE",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: {
    ...createHardRequirementSelectionsWithNoneActivated(),
    beachAccessEssential: true,
  },
};

/** 8. Mountain/ski-essential user. */
export const MOUNTAIN_SKI_ESSENTIAL_USER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 120 },
  activityMode: "NOT_SURE",
  citizenship: baseCitizenship,
  household: singleHousehold,
  budget: { monthlyTargetAmount: 5000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "UNSURE",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: {
    ...createHardRequirementSelectionsWithNoneActivated(),
    mountainOrSkiAccessEssential: true,
  },
};

/** 9. LGBTQ+ legal-safety-essential user. */
export const LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "EXTENDED_6_12_MONTHS", intendedStayDurationDays: 210 },
  activityMode: "RETIRED",
  citizenship: baseCitizenship,
  household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true },
  budget: { monthlyTargetAmount: 4000, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: {
    ...createHardRequirementSelectionsWithNoneActivated(),
    lgbtqLegalSafetyEssential: true,
  },
};

/** 10. Split-year/snowbird renter — "I spend 4 months here every winter and rent." */
export const SPLIT_YEAR_SNOWBIRD_RENTER: UserProfileV2 = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  stayDuration: { band: "MEDIUM_3_6_MONTHS", intendedStayDurationDays: 120 },
  activityMode: "SPLIT_YEAR_SNOWBIRD",
  citizenship: baseCitizenship,
  household: { type: "COUPLE", dependentCount: 0, spouseOrPartnerAccompanying: true },
  budget: { monthlyTargetAmount: 3800, currencyCode: "USD", ceilingType: "FLEXIBLE_TARGET" },
  tenureIntent: "RENT",
  intendsToWorkDuringStay: false,
  lifestylePreferences: [],
  hardRequirements: createHardRequirementSelectionsWithNoneActivated(),
};

export const ALL_SYNTHETIC_PROFILE_FIXTURES: readonly UserProfileV2[] = [
  RETIRED_90_DAY_RENTER,
  RETIRED_7_MONTH_RENTER,
  REMOTE_EMPLOYEE_7_MONTH,
  PERMANENT_RETIREE_BUYER,
  HARD_BUDGET_4500_USER,
  FLEXIBLE_BUDGET_6500_USER,
  BEACH_ESSENTIAL_USER,
  MOUNTAIN_SKI_ESSENTIAL_USER,
  LGBTQ_LEGAL_SAFETY_ESSENTIAL_USER,
  SPLIT_YEAR_SNOWBIRD_RENTER,
];
