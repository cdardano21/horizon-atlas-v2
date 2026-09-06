import { resolveHardConstraintOutcome } from "../intelligence-v2/eligibility-evaluator";
import { evaluateLifestylePreferences } from "../intelligence-v2/lifestyle-scorer";
import { compareForRanking } from "../intelligence-v2/ranking-policy";
import type { SyntheticDestinationFixture } from "../intelligence-v2/destination-fact-types";
import type { LifestylePreferenceInput } from "../intelligence-v2/profile-types";
import type { HardConstraintResult, LifestyleScore } from "../intelligence-v2/result-types";

export type EvidenceState = "KNOWN" | "UNKNOWN" | "CONDITIONAL" | "NOT_APPLICABLE";
export type ResultGroup = "MEETS_FILTERS" | "NEEDS_VERIFICATION" | "EXCLUDED";
export type Household = "single" | "couple";
export type CoastalSetting = "COASTAL" | "INLAND" | "HYBRID" | "UNKNOWN";

export type AffordabilityEvidence = {
  providerId?: string;
  index?: number;
  band?: "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";
  monthlyLow?: number;
  monthlyHigh?: number;
  currency?: string;
  household?: Household;
  sourceDate?: string;
  scope?: string;
};

export type ShortlistFacts = {
  key: string;
  name: string;
  countryCode: string;
  beachAccess: "DIRECT_ACCESS" | "NEARBY" | "NONE" | "UNKNOWN";
  mountainAccess: "SKI_RESORT_ACCESS" | "MOUNTAIN_ACCESS" | "NONE" | "UNKNOWN";
  oceanAccess?: CoastalSetting;
  lifestyleDimensions?: Readonly<Record<string, number>>;
  affordability: AffordabilityEvidence;
};

export type ShortlistProfile = {
  includedCountries?: string[];
  excludedCountries?: string[];
  beach?: "DIRECT_ACCESS" | "NEARBY_OR_DIRECT" | "OCEAN_COASTAL";
  requireBeach?: boolean;
  mountain?: "SKI_RESORT_ACCESS" | "MOUNTAIN_OR_SKI";
  requireMountain?: boolean;
  affordability?: { maxBand: "LOW" | "MODERATE" | "HIGH"; require?: boolean };
  budget?: { amount: number; currency: string; household: Household; require?: boolean };
};

export type RequirementReason = {
  capability: "country" | "beach" | "ocean" | "mountain" | "affordability";
  state: "PASS" | "FAIL" | "UNKNOWN";
  explanation: string;
};

export type EvaluatedDestination = {
  destination: ShortlistFacts;
  group: ResultGroup;
  reasons: RequirementReason[];
  preferenceSupport: number;
  lifestyleFit: LifestyleScore;
};

const AFFORDABILITY_BAND_ORDER = { LOW: 1, MODERATE: 2, HIGH: 3, VERY_HIGH: 4 } as const;

export function validateAffordabilityEvidence(evidence: AffordabilityEvidence): string[] {
  const errors: string[] = [];
  const hasIndex = evidence.index !== undefined || evidence.band !== undefined || evidence.providerId !== undefined;
  const hasRange = evidence.monthlyLow !== undefined || evidence.monthlyHigh !== undefined;

  if (hasIndex) {
    if (!evidence.providerId) errors.push("providerId is required for indexed affordability");
    if (evidence.index === undefined || !Number.isFinite(evidence.index) || evidence.index < 0) {
      errors.push("index must be a finite non-negative number");
    }
    if (!evidence.band) errors.push("band is required for indexed affordability");
  }

  if (hasRange) {
    if (evidence.monthlyLow === undefined || evidence.monthlyHigh === undefined) {
      errors.push("monthly range requires both bounds");
    } else if (!Number.isFinite(evidence.monthlyLow) || !Number.isFinite(evidence.monthlyHigh)
      || evidence.monthlyLow < 0 || evidence.monthlyHigh < evidence.monthlyLow) {
      errors.push("monthly range is invalid");
    }
    if (!evidence.currency) errors.push("currency is required for a monthly range");
    if (!evidence.household) errors.push("household is required for a monthly range");
  }

  if (!hasIndex && !hasRange) errors.push("affordability evidence is unknown");
  return errors;
}

export function affordabilityState(
  evidence: AffordabilityEvidence,
  budget: NonNullable<ShortlistProfile["budget"]>,
): RequirementReason {
  if (validateAffordabilityEvidence(evidence).length > 0) {
    return { capability: "affordability", state: "UNKNOWN", explanation: "Comparable affordability is not yet verified." };
  }

  if (evidence.monthlyHigh !== undefined) {
    if (evidence.currency !== budget.currency || evidence.household !== budget.household) {
      return { capability: "affordability", state: "UNKNOWN", explanation: "The available estimate has a different currency or household scope." };
    }
    const state = evidence.monthlyHigh <= budget.amount ? "PASS" : evidence.monthlyLow! > budget.amount ? "FAIL" : "UNKNOWN";
    return {
      capability: "affordability",
      state,
      explanation: state === "PASS" ? "The full estimated range is within budget."
        : state === "FAIL" ? "The estimated range starts above budget."
          : "The budget overlaps the estimated range and needs verification.",
    };
  }

  return { capability: "affordability", state: "UNKNOWN", explanation: "An index band cannot be compared with a cash budget without an approved policy." };
}

export function normalizedAffordabilityState(
  evidence: AffordabilityEvidence,
  target: NonNullable<ShortlistProfile["affordability"]>,
): RequirementReason {
  const hasCompleteIndex = evidence.providerId
    && evidence.index !== undefined
    && Number.isFinite(evidence.index)
    && evidence.index >= 0
    && evidence.band;
  if (!hasCompleteIndex) {
    return { capability: "affordability", state: "UNKNOWN", explanation: "A normalized affordability band is not yet available." };
  }
  const passes = AFFORDABILITY_BAND_ORDER[evidence.band!] <= AFFORDABILITY_BAND_ORDER[target.maxBand];
  return {
    capability: "affordability",
    state: passes ? "PASS" : "FAIL",
    explanation: passes ? "The normalized affordability band is within the selected range." : "The normalized affordability band is above the selected range.",
  };
}

function evaluateCountry(destination: ShortlistFacts, profile: ShortlistProfile): RequirementReason | null {
  if (profile.includedCountries?.length && !profile.includedCountries.includes(destination.countryCode)) {
    return { capability: "country", state: "FAIL", explanation: "Outside the selected countries." };
  }
  if (profile.excludedCountries?.includes(destination.countryCode)) {
    return { capability: "country", state: "FAIL", explanation: "Inside an excluded country." };
  }
  if (profile.includedCountries?.length || profile.excludedCountries?.length) {
    return { capability: "country", state: "PASS", explanation: "Inside the selected geographic scope." };
  }
  return null;
}

function evaluateBeach(destination: ShortlistFacts, profile: ShortlistProfile): RequirementReason | null {
  if (!profile.beach) return null;
  if (profile.beach === "OCEAN_COASTAL") {
    if (!destination.oceanAccess || destination.oceanAccess === "UNKNOWN") {
      return { capability: "ocean", state: "UNKNOWN", explanation: "Ocean or coastal access is not explicitly established by the available structured evidence." };
    }
    const hasGeneralBeachAccess = destination.beachAccess === "DIRECT_ACCESS" || destination.beachAccess === "NEARBY";
    const passes = hasGeneralBeachAccess && (destination.oceanAccess === "COASTAL" || destination.oceanAccess === "HYBRID");
    return {
      capability: "ocean",
      state: passes ? "PASS" : "FAIL",
      explanation: passes ? "Structured coastal evidence establishes ocean access." : "The available structured evidence establishes inland or non-ocean access.",
    };
  }
  if (destination.beachAccess === "UNKNOWN") return { capability: "beach", state: "UNKNOWN", explanation: "Beach access is unresolved." };
  const passes = profile.beach === "DIRECT_ACCESS"
    ? destination.beachAccess === "DIRECT_ACCESS"
    : destination.beachAccess === "DIRECT_ACCESS" || destination.beachAccess === "NEARBY";
  return { capability: "beach", state: passes ? "PASS" : "FAIL", explanation: passes ? "Matches the selected broad beach category." : "Does not match the selected broad beach category." };
}

function buildLifestylePreferences(profile: ShortlistProfile): LifestylePreferenceInput[] {
  const preferences: LifestylePreferenceInput[] = [];
  if (profile.beach && profile.beach !== "OCEAN_COASTAL") {
    preferences.push({ dimensionKey: "beachLifestyle", direction: "MORE_IS_BETTER", importance: 1, isHardRequirement: false, targetValue: null });
  }
  if (profile.mountain) {
    preferences.push({ dimensionKey: "mountainOutdoorLifestyle", direction: "MORE_IS_BETTER", importance: 1, isHardRequirement: false, targetValue: null });
  }
  return preferences;
}

function scoreLifestyle(destination: ShortlistFacts, profile: ShortlistProfile): LifestyleScore {
  const hardGates: SyntheticDestinationFixture["hardGates"] = {
    beachAccess: destination.beachAccess,
    mountainOrSkiAccess: destination.mountainAccess === "MOUNTAIN_ACCESS" ? "MOUNTAIN_SCENIC_ONLY" : destination.mountainAccess,
    healthcareStandard: "UNKNOWN",
    safetyStandard: "UNKNOWN",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  };
  return evaluateLifestylePreferences(buildLifestylePreferences(profile), {
    hardGates,
    lifestyleDimensions: { dimensionValues: destination.lifestyleDimensions ?? {} },
  });
}

function evaluateMountain(destination: ShortlistFacts, profile: ShortlistProfile): RequirementReason | null {
  if (!profile.mountain) return null;
  if (destination.mountainAccess === "UNKNOWN") return { capability: "mountain", state: "UNKNOWN", explanation: "Mountain access is unresolved." };
  const passes = profile.mountain === "SKI_RESORT_ACCESS"
    ? destination.mountainAccess === "SKI_RESORT_ACCESS"
    : destination.mountainAccess === "SKI_RESORT_ACCESS" || destination.mountainAccess === "MOUNTAIN_ACCESS";
  return { capability: "mountain", state: passes ? "PASS" : "FAIL", explanation: passes ? "Matches the selected broad mountain category." : "Does not match the selected broad mountain category." };
}

export function evaluateDestination(destination: ShortlistFacts, profile: ShortlistProfile): EvaluatedDestination {
  const reasons = [
    evaluateCountry(destination, profile),
    evaluateBeach(destination, profile),
    evaluateMountain(destination, profile),
    profile.affordability ? normalizedAffordabilityState(destination.affordability, profile.affordability) : null,
  ].filter((reason): reason is RequirementReason => reason !== null);

  const required = reasons.filter((reason) => reason.capability === "country"
    || ((reason.capability === "beach" || reason.capability === "ocean") && (profile.requireBeach || profile.beach === "OCEAN_COASTAL"))
    || (reason.capability === "mountain" && profile.requireMountain)
    || (reason.capability === "affordability" && profile.affordability?.require));
  const outcome = resolveHardConstraintOutcome(required.map((reason): HardConstraintResult => ({
    status: reason.state,
    reasonCode: `${reason.capability.toUpperCase()}_${reason.state}`,
    evidenceSummary: reason.explanation,
    sourceFactKeys: [],
  })));
  const group: ResultGroup = outcome.overallStatus === "EXCLUDED"
    ? "EXCLUDED"
    : outcome.overallStatus === "UNKNOWN_INCOMPLETE" ? "NEEDS_VERIFICATION" : "MEETS_FILTERS";
  const lifestyleFit = scoreLifestyle(destination, profile);

  return {
    destination,
    group,
    reasons,
    preferenceSupport: lifestyleFit.scoredDimensionCount,
    lifestyleFit,
  };
}

export function compareEvaluatedDestinations(left: EvaluatedDestination, right: EvaluatedDestination): number {
  const toRankingInput = (result: EvaluatedDestination) => ({
    destinationId: result.destination.key,
    recommendationStatus: result.group === "MEETS_FILTERS" ? "VIABLE" as const
      : result.group === "NEEDS_VERIFICATION" ? "NEEDS_VERIFICATION" as const : "EXCLUDED" as const,
    sortRankingValue: result.group === "MEETS_FILTERS" && result.lifestyleFit.scoreStatus === "SCORED"
      ? { basis: "LIFESTYLE_SCORE_AMONG_ELIGIBLE_ONLY" as const, value: result.lifestyleFit.totalScore }
      : null,
  });
  return compareForRanking(toRankingInput(left), toRankingInput(right));
}

export function evaluateShortlist(destinations: ShortlistFacts[], profile: ShortlistProfile): EvaluatedDestination[] {
  return destinations.map((destination) => evaluateDestination(destination, profile)).sort(compareEvaluatedDestinations);
}

export function compareAffordability(left: AffordabilityEvidence, right: AffordabilityEvidence): number | null {
  if (validateAffordabilityEvidence(left).length || validateAffordabilityEvidence(right).length) return null;
  if (left.providerId || right.providerId) {
    if (left.providerId !== right.providerId) return null;
  }
  if (left.providerId && right.providerId && left.providerId === right.providerId && left.index !== undefined && right.index !== undefined) {
    return left.index - right.index;
  }
  if (left.band && right.band) return AFFORDABILITY_BAND_ORDER[left.band] - AFFORDABILITY_BAND_ORDER[right.band];
  if (left.currency === right.currency && left.household === right.household && left.monthlyHigh !== undefined && right.monthlyHigh !== undefined) {
    return left.monthlyHigh - right.monthlyHigh;
  }
  return null;
}