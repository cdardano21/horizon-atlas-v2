import type {
  ActivityMode,
  HealthcareMinimumStandard,
  SafetyMinimumStandard,
  StayDuration,
  StayDurationBand,
  UserProfileV2,
} from "./profile-types";
import type { EligibilityCriteria, EligibilityResult, HardConstraintResult, HardConstraintStatus } from "./result-types";
import type { SyntheticDestinationFixture, TriStateFact } from "./destination-fact-types";
import { CURRENT_ELIGIBILITY_MODEL_VERSION } from "./versions";

/**
 * Layer 1 — CAN I DO IT? Deterministic pure-function evaluator.
 *
 * Reads only `profile` + `destination.entryAndStay` / `destination.hardGates`.
 * Never reads `destination.financial` or `destination.cost` — tax residency and
 * affordability belong to Layers 4 and 2 respectively, not here.
 *
 * Core rule: DO NOT AVERAGE AWAY A FATAL FLAW. `overallStatus` is a fixed
 * precedence (any activated FAIL -> EXCLUDED; else any activated UNKNOWN ->
 * UNKNOWN_INCOMPLETE; else ELIGIBLE), never a weighted/averaged combination.
 */

// ---------------------------------------------------------------------------
// Small internal helpers (not exported — implementation detail of this evaluator)
// ---------------------------------------------------------------------------

function buildResult(
  status: HardConstraintStatus,
  reasonCode: string,
  evidenceSummary: string | null,
  sourceFactKeys: readonly string[],
): HardConstraintResult {
  return { status, reasonCode, evidenceSummary, sourceFactKeys };
}

function combineTriStateAnyYes(facts: readonly TriStateFact[]): TriStateFact {
  if (facts.length === 0) return "UNKNOWN";
  if (facts.some((fact) => fact === "YES")) return "YES";
  if (facts.every((fact) => fact === "NO")) return "NO";
  return "UNKNOWN";
}

function constraintFromTriState(
  value: TriStateFact,
  passReasonCode: string,
  failReasonCode: string,
  unknownReasonCode: string,
  sourceFactKeys: readonly string[],
): HardConstraintResult {
  if (value === "YES") return buildResult("PASS", passReasonCode, null, sourceFactKeys);
  if (value === "NO") return buildResult("FAIL", failReasonCode, null, sourceFactKeys);
  return buildResult("UNKNOWN", unknownReasonCode, null, sourceFactKeys);
}

/** Conservative day count for comparison: exact when given, else the band's upper bound. Null only for LONG_TERM_PERMANENT/UNSURE. */
const BAND_UPPER_BOUND_DAYS: Partial<Record<StayDurationBand, number>> = {
  SHORT_1_3_MONTHS: 90,
  MEDIUM_3_6_MONTHS: 182,
  EXTENDED_6_12_MONTHS: 365,
};

function resolveComparisonDays(stayDuration: StayDuration): number | null {
  if (stayDuration.intendedStayDurationDays !== null) return stayDuration.intendedStayDurationDays;
  return BAND_UPPER_BOUND_DAYS[stayDuration.band] ?? null;
}

/** Reflects current US-first data scope (Navigator Report) — expand by adding codes, no redesign needed. */
const SUPPORTED_PASSPORT_COUNTRY_CODES: ReadonlySet<string> = new Set(["US"]);

const HEALTHCARE_STANDARD_RANK: Record<HealthcareMinimumStandard, number> = {
  BASIC_ACCESS: 1,
  GOOD_PRIVATE_AVAILABLE: 2,
  INTERNATIONAL_STANDARD: 3,
};

const SAFETY_STANDARD_RANK: Record<SafetyMinimumStandard, number> = {
  MODERATE_OR_BETTER: 1,
  HIGH_SAFETY_ONLY: 2,
};

// ---------------------------------------------------------------------------
// Always-activated criteria
// ---------------------------------------------------------------------------

function evaluateEntryFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult {
  if (!SUPPORTED_PASSPORT_COUNTRY_CODES.has(profile.citizenship.primaryPassportCountryCode)) {
    return buildResult("UNKNOWN", "PASSPORT_NOT_YET_SUPPORTED", null, []);
  }
  return constraintFromTriState(
    destination.entryAndStay.touristEntryAllowed,
    "ENTRY_ALLOWED",
    "ENTRY_NOT_ALLOWED",
    "ENTRY_FEASIBILITY_UNKNOWN",
    ["entryAndStay.touristEntryAllowed"],
  );
}

/** Generic, activity-mode-agnostic: is long-stay possible here AT ALL. */
function evaluateStayDurationFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult {
  const { stayDuration } = profile;
  const facts = destination.entryAndStay;

  if (stayDuration.band === "UNSURE" && stayDuration.intendedStayDurationDays === null) {
    return buildResult("UNKNOWN", "STAY_DURATION_UNSURE", null, []);
  }

  if (stayDuration.band === "LONG_TERM_PERMANENT") {
    return constraintFromTriState(
      facts.permanentResidencyPathAvailable,
      "PERMANENT_PATH_AVAILABLE",
      "NO_PERMANENT_PATH_AVAILABLE",
      "PERMANENT_PATH_UNKNOWN",
      ["entryAndStay.permanentResidencyPathAvailable"],
    );
  }

  const days = resolveComparisonDays(stayDuration)!;

  if (facts.touristStayLimitDays !== null && days <= facts.touristStayLimitDays) {
    return buildResult(
      "PASS",
      "WITHIN_TOURIST_STAY_LIMIT",
      `${days} days is within the ${facts.touristStayLimitDays}-day tourist limit.`,
      ["entryAndStay.touristStayLimitDays"],
    );
  }

  if (facts.touristStayLimitDays === null && stayDuration.band === "SHORT_1_3_MONTHS") {
    return buildResult("UNKNOWN", "TOURIST_STAY_LIMIT_UNKNOWN", null, ["entryAndStay.touristStayLimitDays"]);
  }

  return constraintFromTriState(
    combineTriStateAnyYes([facts.extendedStayOrLongStayVisaAvailable, facts.permanentResidencyPathAvailable]),
    "GENERIC_LONG_STAY_PATH_AVAILABLE",
    "STAY_DURATION_EXCEEDS_AVAILABLE_PATHS",
    "STAY_DURATION_PATH_UNKNOWN",
    ["entryAndStay.extendedStayOrLongStayVisaAvailable", "entryAndStay.permanentResidencyPathAvailable"],
  );
}

/** Activity-mode-specific: does a channel THIS profile actually qualifies for exist (presence only, never work legality). */
function evaluateRequiredLegalPath(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult {
  if (profile.activityMode === "NOT_SURE") {
    return buildResult("UNKNOWN", "ACTIVITY_MODE_NOT_SURE", null, []);
  }
  if (profile.activityMode === "LOCAL_EMPLOYMENT") {
    return buildResult("UNKNOWN", "LOCAL_EMPLOYMENT_WORK_AUTHORIZATION_NOT_MODELED", null, []);
  }

  const { stayDuration, activityMode, intendsToWorkDuringStay } = profile;
  const facts = destination.entryAndStay;

  if (stayDuration.band === "UNSURE" && stayDuration.intendedStayDurationDays === null) {
    return buildResult("UNKNOWN", "STAY_DURATION_UNSURE", null, []);
  }

  if (stayDuration.band === "LONG_TERM_PERMANENT") {
    return evaluateActivitySpecificLongTermPath(activityMode, facts);
  }

  const days = resolveComparisonDays(stayDuration)!;

  if (facts.touristStayLimitDays !== null && days <= facts.touristStayLimitDays) {
    return buildResult(
      "PASS",
      "TOURIST_PATH_SUFFICIENT_FOR_PRESENCE",
      `${days} days is within the ${facts.touristStayLimitDays}-day tourist limit.`,
      ["entryAndStay.touristStayLimitDays"],
    );
  }

  const presenceCandidates: TriStateFact[] = [facts.extendedStayOrLongStayVisaAvailable, facts.permanentResidencyPathAvailable];
  if (activityMode === "RETIRED") presenceCandidates.push(facts.retirementVisaProgramAvailable);
  if (intendsToWorkDuringStay) presenceCandidates.push(facts.remoteWorkOrDigitalNomadVisaAvailable);

  return constraintFromTriState(
    combineTriStateAnyYes(presenceCandidates),
    "ACTIVITY_APPROPRIATE_PATH_AVAILABLE",
    "NO_LEGAL_PATH_FOR_ACTIVITY_MODE_AND_DURATION",
    "REQUIRED_LEGAL_PATH_UNKNOWN",
    ["entryAndStay.extendedStayOrLongStayVisaAvailable", "entryAndStay.retirementVisaProgramAvailable", "entryAndStay.remoteWorkOrDigitalNomadVisaAvailable"],
  );
}

function evaluateActivitySpecificLongTermPath(
  activityMode: ActivityMode,
  facts: SyntheticDestinationFixture["entryAndStay"],
): HardConstraintResult {
  const candidates: TriStateFact[] = [facts.permanentResidencyPathAvailable];
  if (activityMode === "RETIRED") candidates.push(facts.retirementVisaProgramAvailable);

  return constraintFromTriState(
    combineTriStateAnyYes(candidates),
    "PERMANENT_PATH_AVAILABLE",
    "NO_PERMANENT_PATH_AVAILABLE",
    "PERMANENT_PATH_UNKNOWN",
    ["entryAndStay.permanentResidencyPathAvailable", "entryAndStay.retirementVisaProgramAvailable"],
  );
}

// ---------------------------------------------------------------------------
// Conditionally-activated criteria (null when not applicable to this profile)
// ---------------------------------------------------------------------------

/** Work-permission only. Kept entirely separate from requiredLegalPath (presence) and from any connectivity/infrastructure quality concept. */
function evaluateRemoteWorkLegality(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (!profile.intendsToWorkDuringStay) return null;

  const facts = destination.entryAndStay;
  const days = resolveComparisonDays(profile.stayDuration);
  const withinTouristLimit = facts.touristStayLimitDays !== null && days !== null && days <= facts.touristStayLimitDays;

  const candidates: TriStateFact[] = withinTouristLimit
    ? [facts.remoteWorkLegalUnderTouristStatus, facts.remoteWorkOrDigitalNomadVisaAvailable]
    : [facts.remoteWorkOrDigitalNomadVisaAvailable];

  return constraintFromTriState(
    combineTriStateAnyYes(candidates),
    "REMOTE_WORK_LEGAL",
    "REMOTE_WORK_NOT_LEGAL",
    "REMOTE_WORK_LEGALITY_UNKNOWN",
    ["entryAndStay.remoteWorkLegalUnderTouristStatus", "entryAndStay.remoteWorkOrDigitalNomadVisaAvailable"],
  );
}

/** Retiree-specific detail criterion; mirrors requiredLegalPath's retiree channel so the two never contradict each other. */
function evaluateRetirementOrResidencyPath(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (profile.activityMode !== "RETIRED" || profile.stayDuration.band === "SHORT_1_3_MONTHS") return null;

  const facts = destination.entryAndStay;
  return constraintFromTriState(
    combineTriStateAnyYes([facts.retirementVisaProgramAvailable, facts.permanentResidencyPathAvailable, facts.extendedStayOrLongStayVisaAvailable]),
    "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE",
    "NO_RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE",
    "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN",
    ["entryAndStay.retirementVisaProgramAvailable", "entryAndStay.permanentResidencyPathAvailable", "entryAndStay.extendedStayOrLongStayVisaAvailable"],
  );
}

function evaluateSpouseOrDependentFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  const needsDependentPath = profile.household.spouseOrPartnerAccompanying || profile.household.dependentCount > 0;
  if (!needsDependentPath) return null;

  return constraintFromTriState(
    destination.entryAndStay.spouseOrDependentInclusionSupported,
    "SPOUSE_OR_DEPENDENT_INCLUSION_SUPPORTED",
    "SPOUSE_OR_DEPENDENT_INCLUSION_NOT_SUPPORTED",
    "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN",
    ["entryAndStay.spouseOrDependentInclusionSupported"],
  );
}

/** Activates only when buying is essential — a snowbird/testing renter never triggers this. */
function evaluateForeignPropertyPurchaseRights(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (profile.tenureIntent !== "BUY" || !profile.hardRequirements.foreignPropertyPurchaseEssential) return null;

  return constraintFromTriState(
    destination.entryAndStay.foreignPropertyPurchaseAllowed,
    "FOREIGN_PROPERTY_PURCHASE_ALLOWED",
    "FOREIGN_PROPERTY_PURCHASE_NOT_ALLOWED",
    "FOREIGN_PROPERTY_PURCHASE_UNKNOWN",
    ["entryAndStay.foreignPropertyPurchaseAllowed"],
  );
}

function evaluateHealthcareGate(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  const minimum = profile.hardRequirements.minimumHealthcareStandard;
  if (minimum === null) return null;

  const actual = destination.hardGates.healthcareStandard;
  if (actual === "UNKNOWN") return buildResult("UNKNOWN", "HEALTHCARE_STANDARD_UNKNOWN", null, ["hardGates.healthcareStandard"]);

  const meets = HEALTHCARE_STANDARD_RANK[actual] >= HEALTHCARE_STANDARD_RANK[minimum];
  return meets
    ? buildResult("PASS", "HEALTHCARE_STANDARD_MEETS_MINIMUM", null, ["hardGates.healthcareStandard"])
    : buildResult("FAIL", "HEALTHCARE_STANDARD_BELOW_MINIMUM", null, ["hardGates.healthcareStandard"]);
}

function evaluateSafetyGate(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  const minimum = profile.hardRequirements.minimumSafetyStandard;
  if (minimum === null) return null;

  const actual = destination.hardGates.safetyStandard;
  if (actual === "UNKNOWN") return buildResult("UNKNOWN", "SAFETY_STANDARD_UNKNOWN", null, ["hardGates.safetyStandard"]);

  const meets = SAFETY_STANDARD_RANK[actual] >= SAFETY_STANDARD_RANK[minimum];
  return meets
    ? buildResult("PASS", "SAFETY_STANDARD_MEETS_MINIMUM", null, ["hardGates.safetyStandard"])
    : buildResult("FAIL", "SAFETY_STANDARD_BELOW_MINIMUM", null, ["hardGates.safetyStandard"]);
}

function evaluateLgbtqLegalSafetyGate(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (!profile.hardRequirements.lgbtqLegalSafetyEssential) return null;

  const status = destination.hardGates.lgbtqLegalProtectionStatus;
  if (status === "UNKNOWN") return buildResult("UNKNOWN", "LGBTQ_LEGAL_STATUS_UNKNOWN", null, ["hardGates.lgbtqLegalProtectionStatus"]);
  if (status === "LEGAL_PROTECTIONS_IN_PLACE") return buildResult("PASS", "LGBTQ_LEGAL_PROTECTIONS_IN_PLACE", null, ["hardGates.lgbtqLegalProtectionStatus"]);
  return buildResult("FAIL", "LGBTQ_LEGAL_PROTECTIONS_ABSENT", null, ["hardGates.lgbtqLegalProtectionStatus"]);
}

function evaluateBeachAccessGate(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (!profile.hardRequirements.beachAccessEssential) return null;

  const access = destination.hardGates.beachAccess;
  if (access === "UNKNOWN") return buildResult("UNKNOWN", "BEACH_ACCESS_UNKNOWN", null, ["hardGates.beachAccess"]);
  if (access === "NONE") return buildResult("FAIL", "NO_BEACH_ACCESS", null, ["hardGates.beachAccess"]);
  return buildResult("PASS", "BEACH_ACCESS_AVAILABLE", null, ["hardGates.beachAccess"]);
}

/** SKI_RESORT_ACCESS and MOUNTAIN_SCENIC_ONLY both satisfy this combined "mountain OR ski" gate; a ski-specific gate would need its own profile field. */
function evaluateMountainOrSkiAccessGate(profile: UserProfileV2, destination: SyntheticDestinationFixture): HardConstraintResult | null {
  if (!profile.hardRequirements.mountainOrSkiAccessEssential) return null;

  const access = destination.hardGates.mountainOrSkiAccess;
  if (access === "UNKNOWN") return buildResult("UNKNOWN", "MOUNTAIN_OR_SKI_ACCESS_UNKNOWN", null, ["hardGates.mountainOrSkiAccess"]);
  if (access === "NONE") return buildResult("FAIL", "NO_MOUNTAIN_OR_SKI_ACCESS", null, ["hardGates.mountainOrSkiAccess"]);
  return buildResult("PASS", "MOUNTAIN_OR_SKI_ACCESS_AVAILABLE", null, ["hardGates.mountainOrSkiAccess"]);
}

// ---------------------------------------------------------------------------
// Overall status precedence (no averaging)
// ---------------------------------------------------------------------------

function computeOverallStatus(criteria: EligibilityCriteria): Pick<EligibilityResult, "overallStatus" | "exclusionReasonCodes" | "unknownReasonCodes"> {
  const activated = Object.values(criteria).filter((value): value is HardConstraintResult => value !== null);

  const fails = activated.filter((criterion) => criterion.status === "FAIL");
  if (fails.length > 0) {
    return { overallStatus: "EXCLUDED", exclusionReasonCodes: fails.map((f) => f.reasonCode), unknownReasonCodes: [] };
  }

  const unknowns = activated.filter((criterion) => criterion.status === "UNKNOWN");
  if (unknowns.length > 0) {
    return { overallStatus: "UNKNOWN_INCOMPLETE", exclusionReasonCodes: [], unknownReasonCodes: unknowns.map((u) => u.reasonCode) };
  }

  return { overallStatus: "ELIGIBLE", exclusionReasonCodes: [], unknownReasonCodes: [] };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function evaluateEligibility(profile: UserProfileV2, destination: SyntheticDestinationFixture): EligibilityResult {
  const criteria: EligibilityCriteria = {
    entryFeasibility: evaluateEntryFeasibility(profile, destination),
    stayDurationFeasibility: evaluateStayDurationFeasibility(profile, destination),
    requiredLegalPath: evaluateRequiredLegalPath(profile, destination),
    remoteWorkLegality: evaluateRemoteWorkLegality(profile, destination),
    retirementOrResidencyPath: evaluateRetirementOrResidencyPath(profile, destination),
    spouseOrDependentFeasibility: evaluateSpouseOrDependentFeasibility(profile, destination),
    foreignPropertyPurchaseRights: evaluateForeignPropertyPurchaseRights(profile, destination),
    healthcareGate: evaluateHealthcareGate(profile, destination),
    safetyGate: evaluateSafetyGate(profile, destination),
    lgbtqLegalSafetyGate: evaluateLgbtqLegalSafetyGate(profile, destination),
    beachAccessGate: evaluateBeachAccessGate(profile, destination),
    mountainOrSkiAccessGate: evaluateMountainOrSkiAccessGate(profile, destination),
  };

  const { overallStatus, exclusionReasonCodes, unknownReasonCodes } = computeOverallStatus(criteria);

  return {
    modelVersion: CURRENT_ELIGIBILITY_MODEL_VERSION,
    criteria,
    overallStatus,
    exclusionReasonCodes,
    unknownReasonCodes,
  };
}
