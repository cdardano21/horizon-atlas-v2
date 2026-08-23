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
import { deriveRelocationApplicability, type RelocationApplicability } from "./relocation-applicability";
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
 *
 * International visa/residency/remote-work-legality criteria are null (not
 * evaluated) for a DOMESTIC (same-country) relocation — see
 * relocation-applicability.ts. A domestic move has no immigration question to
 * answer at all, so these criteria are absent from the overall status
 * calculation entirely, never a fabricated PASS and never UNKNOWN.
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

/**
 * A destination's generic `extendedStayOrLongStayVisaAvailable` fact only proves "some
 * long-stay legal pathway exists in this destination" — it must never, by itself, prove that
 * THIS profile's specific activity mode has a compatible pathway. This resolves the
 * profile-appropriate combination of activity-specific facts only (never the bare generic
 * fact), and is deliberately shared by evaluateStayDurationFeasibility and
 * evaluateRequiredLegalPath so the two can never contradict each other from the same gap.
 */
function resolveProfileCompatibleLongStayPath(profile: UserProfileV2, facts: SyntheticDestinationFixture["entryAndStay"]): TriStateFact {
  const candidates: TriStateFact[] = [facts.permanentResidencyPathAvailable];
  if (profile.activityMode === "RETIRED") candidates.push(facts.retirementVisaProgramAvailable);
  if (profile.activityMode === "REMOTE_EMPLOYEE" || profile.activityMode === "DIGITAL_NOMAD" || profile.intendsToWorkDuringStay) {
    candidates.push(facts.remoteWorkOrDigitalNomadVisaAvailable);
  }
  return combineTriStateAnyYes(candidates);
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

function evaluateEntryFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (relocationApplicability === "DOMESTIC") return null; // no immigration entry question for a same-country move
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
function evaluateStayDurationFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (relocationApplicability === "DOMESTIC") return null; // no immigration stay-duration limit for a same-country move
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

  // Beyond the tourist limit: the generic long-stay fact alone is never sufficient here — see
  // resolveProfileCompatibleLongStayPath. extendedStayOrLongStayVisaAvailable remains adapted
  // and available elsewhere as contextual evidence that SOME pathway exists in the destination.
  return constraintFromTriState(
    resolveProfileCompatibleLongStayPath(profile, facts),
    "PROFILE_COMPATIBLE_LONG_STAY_PATH_AVAILABLE",
    "STAY_DURATION_EXCEEDS_AVAILABLE_PATHS",
    "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE",
    ["entryAndStay.permanentResidencyPathAvailable", "entryAndStay.retirementVisaProgramAvailable", "entryAndStay.remoteWorkOrDigitalNomadVisaAvailable"],
  );
}

/** Activity-mode-specific: does a channel THIS profile actually qualifies for exist (presence only, never work legality). */
function evaluateRequiredLegalPath(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (relocationApplicability === "DOMESTIC") return null; // no immigration legal-path question for a same-country move
  if (profile.activityMode === "NOT_SURE") {
    return buildResult("UNKNOWN", "ACTIVITY_MODE_NOT_SURE", null, []);
  }
  if (profile.activityMode === "LOCAL_EMPLOYMENT") {
    return buildResult("UNKNOWN", "LOCAL_EMPLOYMENT_WORK_AUTHORIZATION_NOT_MODELED", null, []);
  }

  const { stayDuration, activityMode } = profile;
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

  // Beyond the tourist limit: the generic long-stay fact alone is never sufficient for a
  // specific activity mode — see resolveProfileCompatibleLongStayPath.
  return constraintFromTriState(
    resolveProfileCompatibleLongStayPath(profile, facts),
    "ACTIVITY_APPROPRIATE_PATH_AVAILABLE",
    "NO_LEGAL_PATH_FOR_ACTIVITY_MODE_AND_DURATION",
    "GENERIC_LONG_STAY_PATH_INSUFFICIENT_FOR_PROFILE",
    ["entryAndStay.permanentResidencyPathAvailable", "entryAndStay.retirementVisaProgramAvailable", "entryAndStay.remoteWorkOrDigitalNomadVisaAvailable"],
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
function evaluateRemoteWorkLegality(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (!profile.intendsToWorkDuringStay) return null;
  if (relocationApplicability === "DOMESTIC") return null; // no tourist-status/digital-nomad work-permission question for a same-country move

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

/**
 * Retiree-specific detail criterion; deliberately mirrors requiredLegalPath's/
 * stayDurationFeasibility's retiree channel (retirement + permanent-residency facts only,
 * never the bare generic long-stay fact) so none of the three can ever contradict each other
 * from the same underlying evidence gap.
 */
function evaluateRetirementOrResidencyPath(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (profile.activityMode !== "RETIRED" || profile.stayDuration.band === "SHORT_1_3_MONTHS") return null;
  if (relocationApplicability === "DOMESTIC") return null; // no retirement-visa/residency question for a same-country move

  const facts = destination.entryAndStay;
  return constraintFromTriState(
    combineTriStateAnyYes([facts.retirementVisaProgramAvailable, facts.permanentResidencyPathAvailable]),
    "RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE",
    "NO_RETIREMENT_OR_RESIDENCY_PATH_AVAILABLE",
    "RETIREMENT_OR_RESIDENCY_PATH_UNKNOWN",
    ["entryAndStay.retirementVisaProgramAvailable", "entryAndStay.permanentResidencyPathAvailable"],
  );
}

function evaluateSpouseOrDependentFeasibility(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  const needsDependentPath = profile.household.spouseOrPartnerAccompanying || profile.household.dependentCount > 0;
  if (!needsDependentPath) return null;
  if (relocationApplicability === "DOMESTIC") return null; // no visa-inclusion question for a same-country move

  return constraintFromTriState(
    destination.entryAndStay.spouseOrDependentInclusionSupported,
    "SPOUSE_OR_DEPENDENT_INCLUSION_SUPPORTED",
    "SPOUSE_OR_DEPENDENT_INCLUSION_NOT_SUPPORTED",
    "SPOUSE_OR_DEPENDENT_INCLUSION_UNKNOWN",
    ["entryAndStay.spouseOrDependentInclusionSupported"],
  );
}

/**
 * Activates only when buying is essential — a snowbird/testing renter never triggers this. This gate
 * specifically means FOREIGN-purchaser eligibility, so it never applies to a domestic buyer.
 *
 * Decision table (foreignPropertyPurchaseAllowed × propertyPurchaseConditionalPathAvailable ×
 * propertyOwnershipRequirement, per the approved Checkpoint C property design):
 * - allowed=YES -> PASS regardless of qualifier (ordinary purchase already satisfies any
 *   requirement weaker than or equal to basic legal residential ownership).
 * - allowed=NO, conditionalPath=YES: PASS for a permissive qualifier (ANY_LEGAL_RESIDENTIAL_PROPERTY
 *   or NOT_SURE - a qualifying path is enough); FAIL for a strict qualifier (UNRESTRICTED_FREEHOLD or
 *   LAND_OWNERSHIP_REQUIRED - a conditional/restricted path does not satisfy it).
 * - allowed=NO, conditionalPath=NO -> FAIL for every qualifier.
 * - allowed=NO, conditionalPath=UNKNOWN: UNKNOWN for a permissive qualifier (we don't know whether a
 *   qualifying path exists); FAIL for a strict qualifier (the stricter requirement is already
 *   unsatisfiable once ordinary purchase is confirmed NO, regardless of the unresolved conditional fact).
 * - allowed=UNKNOWN: PASS only for conditionalPath=YES + a permissive qualifier; UNKNOWN otherwise
 *   (never fabricated PASS/FAIL without decisive evidence).
 */
function evaluateForeignPropertyPurchaseRights(profile: UserProfileV2, destination: SyntheticDestinationFixture, relocationApplicability: RelocationApplicability): HardConstraintResult | null {
  if (profile.tenureIntent !== "BUY" || !profile.hardRequirements.foreignPropertyPurchaseEssential) return null;
  if (relocationApplicability === "DOMESTIC") return null; // "foreign purchaser" restrictions do not apply to a domestic buyer

  const allowed = destination.entryAndStay.foreignPropertyPurchaseAllowed;
  const conditionalPath = destination.entryAndStay.propertyPurchaseConditionalPathAvailable ?? "UNKNOWN";
  // Backward-compatible default: an omitted qualifier (legacy profiles/fixtures) is treated the
  // same as an explicit NOT_SURE - the safe, permissive-but-honest default, never UNRESTRICTED_FREEHOLD.
  const ownershipRequirement = profile.hardRequirements.propertyOwnershipRequirement ?? "NOT_SURE";
  const requiresUnrestrictedOwnership = ownershipRequirement === "UNRESTRICTED_FREEHOLD" || ownershipRequirement === "LAND_OWNERSHIP_REQUIRED";
  const sourceFactKeys = ["entryAndStay.foreignPropertyPurchaseAllowed", "entryAndStay.propertyPurchaseConditionalPathAvailable"];

  if (allowed === "YES") {
    return buildResult("PASS", "FOREIGN_PROPERTY_PURCHASE_ALLOWED", null, sourceFactKeys);
  }

  if (allowed === "NO") {
    if (conditionalPath === "YES") {
      return requiresUnrestrictedOwnership
        ? buildResult("FAIL", "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP", null, sourceFactKeys)
        : buildResult("PASS", "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE", null, sourceFactKeys);
    }
    if (conditionalPath === "NO") {
      return buildResult("FAIL", "FOREIGN_PROPERTY_PURCHASE_NOT_ALLOWED", null, sourceFactKeys);
    }
    return requiresUnrestrictedOwnership
      ? buildResult("FAIL", "PROPERTY_PURCHASE_REQUIRES_UNRESTRICTED_OWNERSHIP", null, sourceFactKeys)
      : buildResult("UNKNOWN", "PROPERTY_PURCHASE_ELIGIBILITY_UNKNOWN", null, sourceFactKeys);
  }

  // allowed === "UNKNOWN": only a permissive qualifier + a real conditional-path YES supports PASS.
  if (conditionalPath === "YES" && !requiresUnrestrictedOwnership) {
    return buildResult("PASS", "CONDITIONAL_PROPERTY_PURCHASE_PATH_AVAILABLE", null, sourceFactKeys);
  }
  return buildResult("UNKNOWN", "PROPERTY_PURCHASE_ELIGIBILITY_UNKNOWN", null, sourceFactKeys);
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
  const relocationApplicability = deriveRelocationApplicability(profile, destination);

  const criteria: EligibilityCriteria = {
    entryFeasibility: evaluateEntryFeasibility(profile, destination, relocationApplicability),
    stayDurationFeasibility: evaluateStayDurationFeasibility(profile, destination, relocationApplicability),
    requiredLegalPath: evaluateRequiredLegalPath(profile, destination, relocationApplicability),
    remoteWorkLegality: evaluateRemoteWorkLegality(profile, destination, relocationApplicability),
    retirementOrResidencyPath: evaluateRetirementOrResidencyPath(profile, destination, relocationApplicability),
    spouseOrDependentFeasibility: evaluateSpouseOrDependentFeasibility(profile, destination, relocationApplicability),
    foreignPropertyPurchaseRights: evaluateForeignPropertyPurchaseRights(profile, destination, relocationApplicability),
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
