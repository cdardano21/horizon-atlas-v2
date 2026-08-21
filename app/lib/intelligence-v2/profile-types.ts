import type { ProfileContractVersion } from "./versions";
import { CURRENT_PROFILE_CONTRACT_VERSION } from "./versions";

/**
 * UserProfileV2 — the Intelligence v2 decision contract.
 *
 * This is deliberately NOT the questionnaire schema. It is the small, stable set of
 * structured inputs the Layer 1-4 evaluators (not built yet) will consume. Future
 * questionnaire questions may map many-to-one onto these fields; this file must not
 * grow just because a new question is added later.
 */

// ---------------------------------------------------------------------------
// Stay duration
// ---------------------------------------------------------------------------

/**
 * Coarse stay-duration band, used for branching questions/legal-path logic.
 *
 * EXTENDED_3_12_MONTHS (from the Navigator Report) was deliberately split into
 * MEDIUM_3_6_MONTHS and EXTENDED_6_12_MONTHS. A flat 3-12 month band cannot
 * distinguish a ~6 month stay from a ~7 month stay, but that distinction is exactly
 * where common legal/tax thresholds live (e.g. ~90-day tourist limits, ~183-day tax
 * residency triggers, ~180-day extended-stay visa ceilings). Splitting at the 6-month
 * boundary keeps the band count small (5 values, not "dozens") while making the
 * 90-day / 6-month / 7-month / 12-month distinctions the product explicitly cares
 * about representable at the band level alone.
 */
export type StayDurationBand =
  | "SHORT_1_3_MONTHS"
  | "MEDIUM_3_6_MONTHS"
  | "EXTENDED_6_12_MONTHS"
  | "LONG_TERM_PERMANENT"
  | "UNSURE";

/**
 * Stay duration as (band, precise day count). The band alone is enough for most
 * branching; `intendedStayDurationDays` is populated only when the user has given a
 * specific plan and lets evaluators apply day-precise thresholds (e.g. a 90-day
 * Schengen-style limit or a 183-day tax residency trigger) without inventing new
 * bands. When `intendedStayDurationDays` is null, day-precise checks must resolve to
 * UNKNOWN rather than guessing from the band.
 */
export interface StayDuration {
  readonly band: StayDurationBand;
  readonly intendedStayDurationDays: number | null;
}

// ---------------------------------------------------------------------------
// Activity / lifestyle mode
// ---------------------------------------------------------------------------

/**
 * Why the person is going, independent of how long they're staying.
 *
 * SPLIT_YEAR_SNOWBIRD is kept distinct from SECOND_HOME on purpose: a recurring
 * seasonal stay (e.g. "I spend 4 months here every winter and rent") is not the same
 * legal/tax shape as owning an occasional-use second property, and forcing the
 * former into the latter would make renting snowbirds unrepresentable. Tenure
 * (rent vs. buy) is captured separately via `tenureIntent` and composes orthogonally
 * with activity mode, so SPLIT_YEAR_SNOWBIRD works correctly whether the person
 * rents or owns.
 */
export type ActivityMode =
  | "RETIRED"
  | "REMOTE_EMPLOYEE"
  | "SELF_EMPLOYED"
  | "DIGITAL_NOMAD"
  | "LOCAL_EMPLOYMENT"
  | "SECOND_HOME"
  | "SPLIT_YEAR_SNOWBIRD"
  | "TESTING"
  | "NOT_SURE";

// ---------------------------------------------------------------------------
// Citizenship / household / budget / tenure
// ---------------------------------------------------------------------------

/** ISO 3166-1 alpha-2 country code, e.g. "US". Kept as a plain string, not an enum. */
export type CountryCode = string;

export interface Citizenship {
  readonly primaryPassportCountryCode: CountryCode;
  /** Additional citizenships, if any. Empty array, not null, when there are none. */
  readonly additionalPassportCountryCodes: readonly CountryCode[];
}

export type HouseholdType = "SINGLE" | "COUPLE" | "FAMILY_WITH_DEPENDENTS";

export interface Household {
  readonly type: HouseholdType;
  /** 0 unless type is FAMILY_WITH_DEPENDENTS. */
  readonly dependentCount: number;
  readonly spouseOrPartnerAccompanying: boolean;
}

export type BudgetCeilingType = "HARD_CEILING" | "FLEXIBLE_TARGET";

export interface BudgetTarget {
  readonly monthlyTargetAmount: number;
  /** ISO 4217 currency code, e.g. "USD". */
  readonly currencyCode: string;
  readonly ceilingType: BudgetCeilingType;
}

export type TenureIntent = "RENT" | "BUY" | "UNSURE";

// ---------------------------------------------------------------------------
// Preferences (Layer 3 inputs)
// ---------------------------------------------------------------------------

export type PreferenceDirection = "MORE_IS_BETTER" | "LESS_IS_BETTER" | "CLOSER_TO_TARGET_IS_BETTER";

/** 1 = barely matters, 5 = essential-adjacent (but NOT a hard requirement; see HardRequirementSelections). */
export type PreferenceImportance = 1 | 2 | 3 | 4 | 5;

/**
 * One soft-weighted lifestyle preference. `isHardRequirement` is kept on this type
 * for completeness but true hard-gate activation always flows through
 * `HardRequirementSelections` below — a soft preference can be marked important
 * without ever being promoted into a Layer 1 gate.
 */
export interface LifestylePreferenceInput {
  readonly dimensionKey: string;
  readonly direction: PreferenceDirection;
  readonly importance: PreferenceImportance;
  readonly isHardRequirement: boolean;
}

// ---------------------------------------------------------------------------
// Hard requirements (Layer 1 gate activation)
// ---------------------------------------------------------------------------

export type HealthcareMinimumStandard = "BASIC_ACCESS" | "GOOD_PRIVATE_AVAILABLE" | "INTERNATIONAL_STANDARD";
export type SafetyMinimumStandard = "MODERATE_OR_BETTER" | "HIGH_SAFETY_ONLY";

export interface MustHaveGeography {
  /** Small set of required region/continent keys, e.g. ["EUROPE"], ["NORTH_AMERICA", "CENTRAL_AMERICA"]. */
  readonly requiredRegionKeys: readonly string[];
}

/**
 * Explicit, user-activated hard-gate selections. Every field here is off/null by
 * default. Only fields represented here may ever be promoted into a Layer 1 gate —
 * this is the fixed whitelist from the Navigator Report (budget and stay-duration
 * feasibility are always evaluated and are not part of this optional set).
 */
export interface HardRequirementSelections {
  readonly beachAccessEssential: boolean;
  readonly mountainOrSkiAccessEssential: boolean;
  readonly minimumHealthcareStandard: HealthcareMinimumStandard | null;
  readonly minimumSafetyStandard: SafetyMinimumStandard | null;
  readonly lgbtqLegalSafetyEssential: boolean;
  /** Only meaningful when tenureIntent === "BUY"; ignored by evaluators otherwise. */
  readonly foreignPropertyPurchaseEssential: boolean;
  readonly mustHaveGeography: MustHaveGeography | null;
}

// ---------------------------------------------------------------------------
// UserProfileV2
// ---------------------------------------------------------------------------

export interface UserProfileV2 {
  readonly profileContractVersion: ProfileContractVersion;

  readonly stayDuration: StayDuration;
  readonly activityMode: ActivityMode;

  readonly citizenship: Citizenship;
  readonly household: Household;
  readonly budget: BudgetTarget;
  readonly tenureIntent: TenureIntent;

  /**
   * Whether the person intends to work at all while present, independent of why
   * they're primarily there (e.g. a SECOND_HOME owner might still do occasional
   * remote consulting). Drives whether remote-work-legality gates activate.
   */
  readonly intendsToWorkDuringStay: boolean;

  readonly lifestylePreferences: readonly LifestylePreferenceInput[];
  readonly hardRequirements: HardRequirementSelections;
}

export function createHardRequirementSelectionsWithNoneActivated(): HardRequirementSelections {
  return {
    beachAccessEssential: false,
    mountainOrSkiAccessEssential: false,
    minimumHealthcareStandard: null,
    minimumSafetyStandard: null,
    lgbtqLegalSafetyEssential: false,
    foreignPropertyPurchaseEssential: false,
    mustHaveGeography: null,
  };
}

export const DEFAULT_PROFILE_CONTRACT_VERSION: ProfileContractVersion = CURRENT_PROFILE_CONTRACT_VERSION;
