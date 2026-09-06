export type EvidenceState = "KNOWN" | "UNKNOWN" | "CONDITIONAL" | "NOT_APPLICABLE";
export type ResultGroup = "MEETS_FILTERS" | "NEEDS_VERIFICATION" | "RELAX_ONE" | "EXCLUDED";
export type Household = "single" | "couple";

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
  affordability: AffordabilityEvidence;
};

export type ShortlistProfile = {
  includedCountries?: string[];
  excludedCountries?: string[];
  beach?: "DIRECT_ACCESS" | "NEARBY_OR_DIRECT";
  requireBeach?: boolean;
  mountain?: "SKI_RESORT_ACCESS" | "MOUNTAIN_OR_SKI";
  requireMountain?: boolean;
  affordability?: { maxBand: "LOW" | "MODERATE" | "HIGH"; require?: boolean };
  budget?: { amount: number; currency: string; household: Household; require?: boolean };
};

export type RequirementReason = {
  capability: "country" | "beach" | "mountain" | "affordability";
  state: "PASS" | "FAIL" | "UNKNOWN";
  explanation: string;
};

export type EvaluatedDestination = {
  destination: ShortlistFacts;
  group: ResultGroup;
  reasons: RequirementReason[];
  preferenceSupport: number;
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
  if (destination.beachAccess === "UNKNOWN") return { capability: "beach", state: "UNKNOWN", explanation: "Beach access is unresolved." };
  const passes = profile.beach === "DIRECT_ACCESS"
    ? destination.beachAccess === "DIRECT_ACCESS"
    : destination.beachAccess === "DIRECT_ACCESS" || destination.beachAccess === "NEARBY";
  return { capability: "beach", state: passes ? "PASS" : "FAIL", explanation: passes ? "Matches the selected broad beach category." : "Does not match the selected broad beach category." };
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
    || (reason.capability === "beach" && profile.requireBeach)
    || (reason.capability === "mountain" && profile.requireMountain)
    || (reason.capability === "affordability" && profile.affordability?.require));
  const failures = required.filter((reason) => reason.state === "FAIL").length;
  const unknowns = required.filter((reason) => reason.state === "UNKNOWN").length;
  const group: ResultGroup = failures === 0 && unknowns === 0 ? "MEETS_FILTERS"
    : failures === 0 ? "NEEDS_VERIFICATION"
      : failures === 1 && unknowns === 0 ? "RELAX_ONE"
        : "EXCLUDED";

  return {
    destination,
    group,
    reasons,
    preferenceSupport: reasons.filter((reason) => reason.state === "PASS" && reason.capability !== "country").length,
  };
}

export function evaluateShortlist(destinations: ShortlistFacts[], profile: ShortlistProfile): EvaluatedDestination[] {
  return destinations.map((destination) => evaluateDestination(destination, profile)).sort((left, right) => {
    const groupOrder: Record<ResultGroup, number> = { MEETS_FILTERS: 0, NEEDS_VERIFICATION: 1, RELAX_ONE: 2, EXCLUDED: 3 };
    return groupOrder[left.group] - groupOrder[right.group]
      || right.preferenceSupport - left.preferenceSupport
      || left.destination.key.localeCompare(right.destination.key);
  });
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