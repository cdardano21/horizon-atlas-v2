import type {
  AffordabilityModelVersion,
  EligibilityModelVersion,
  FinancialModelVersion,
  IntelligenceV2ContractVersions,
  ScoringModelVersion,
} from "./versions";
import type { PreferenceDirection, PreferenceImportance } from "./profile-types";

// ---------------------------------------------------------------------------
// Hard constraint result — reused by every Layer 1 gate/criterion
// ---------------------------------------------------------------------------

/**
 * PASS / FAIL / UNKNOWN. UNKNOWN must remain structurally distinct from both — never
 * represent this as a nullable boolean, which would let "missing data" and "known
 * failure" collapse into the same falsy value.
 */
export type HardConstraintStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface HardConstraintResult {
  readonly status: HardConstraintStatus;
  /** Stable machine-readable code, e.g. "TOURIST_STAY_LIMIT_EXCEEDED". Not prose. */
  readonly reasonCode: string;
  /** Short factual note (e.g. "90-day tourist limit"), not an explanation sentence. Null when UNKNOWN. */
  readonly evidenceSummary: string | null;
  /** Pointers into destination facts that produced this verdict, for a future explanation system. */
  readonly sourceFactKeys: readonly string[];
}

export function unknownHardConstraintResult(reasonCode: string): HardConstraintResult {
  return { status: "UNKNOWN", reasonCode, evidenceSummary: null, sourceFactKeys: [] };
}

// ---------------------------------------------------------------------------
// Layer 1 — CAN I DO IT? (EligibilityResult)
// ---------------------------------------------------------------------------

/**
 * Every criterion that MAY apply. Criteria not activated for a given profile (e.g.
 * remote-work legality for a RETIRED, not-working profile) are null, not UNKNOWN —
 * null means "not evaluated because not applicable to this profile", which is
 * distinct from UNKNOWN ("applicable, but the fact is missing").
 *
 * Deliberately excludes tax residency: legal stay eligibility and tax residency are
 * different questions. Tax residency triggers belong exclusively in Layer 4.
 */
export interface EligibilityCriteria {
  readonly entryFeasibility: HardConstraintResult;
  readonly stayDurationFeasibility: HardConstraintResult;
  readonly requiredLegalPath: HardConstraintResult;
  readonly remoteWorkLegality: HardConstraintResult | null;
  readonly retirementOrResidencyPath: HardConstraintResult | null;
  readonly spouseOrDependentFeasibility: HardConstraintResult | null;
  readonly foreignPropertyPurchaseRights: HardConstraintResult | null;
  readonly healthcareGate: HardConstraintResult | null;
  readonly safetyGate: HardConstraintResult | null;
  readonly lgbtqLegalSafetyGate: HardConstraintResult | null;
  readonly beachAccessGate: HardConstraintResult | null;
  readonly mountainOrSkiAccessGate: HardConstraintResult | null;
}

export type EligibilityOverallStatus = "ELIGIBLE" | "EXCLUDED" | "UNKNOWN_INCOMPLETE";

/**
 * `overallStatus` is a fixed precedence rule, never an average:
 * any activated criterion FAIL -> EXCLUDED; else any activated criterion UNKNOWN ->
 * UNKNOWN_INCOMPLETE; else ELIGIBLE. A single FAIL can never be outweighed by other
 * PASS criteria.
 */
export interface EligibilityResult {
  readonly modelVersion: EligibilityModelVersion;
  readonly criteria: EligibilityCriteria;
  readonly overallStatus: EligibilityOverallStatus;
  readonly exclusionReasonCodes: readonly string[];
  readonly unknownReasonCodes: readonly string[];
}

// ---------------------------------------------------------------------------
// Layer 2 — CAN I AFFORD IT? (AffordabilityResult)
// ---------------------------------------------------------------------------

export type AffordabilityStatus = "AFFORDABLE" | "BORDERLINE" | "UNAFFORDABLE" | "UNKNOWN";

export interface MoneyRange {
  readonly low: number;
  readonly high: number;
  readonly currencyCode: string;
}

/**
 * Evidence of a Layer 2 currency conversion, present only when the destination's
 * cost currency differed from the user's budget currency. Kept minimal and
 * structural (no prose) - this is also the hook a future assessment-persistence
 * layer would read to record `fxSnapshotVersion`/`effectiveDate`/`source`
 * alongside a saved result, without any DB migration required today.
 */
export interface AffordabilityCurrencyConversionEvidence {
  readonly originalCurrencyCode: string;
  readonly originalRange: MoneyRange;
  /** Null when conversion did not succeed (paired with status UNKNOWN). */
  readonly convertedRange: MoneyRange | null;
  /** Null when no FxRateTable was supplied at all. */
  readonly fxSnapshotVersion: string | null;
  readonly effectiveDate: string | null;
  readonly source: string | null;
}

/**
 * Structured facts needed later to explain an affordability verdict. No production
 * thresholds are defined here — `status` is the decision produced by a versioned,
 * explicit policy (see affordability-policy.ts), never a hardcoded magic number.
 */
export interface AffordabilityResult {
  readonly modelVersion: AffordabilityModelVersion;
  readonly status: AffordabilityStatus;
  readonly userMonthlyBudgetAmount: number;
  readonly userMonthlyBudgetCurrencyCode: string;
  readonly budgetCeilingType: "HARD_CEILING" | "FLEXIBLE_TARGET";
  /** Null when the destination's cost data is missing (supports UNKNOWN honestly). The range actually used for classification - i.e. already converted into the budget's currency when a conversion occurred. */
  readonly estimatedMonthlyCostRange: MoneyRange | null;
  readonly householdSizeAssumed: number;
  readonly housingAssumption: "RENT" | "BUY" | "UNSURE";
  /** Budget minus estimated cost midpoint; null when the cost range is unknown. */
  readonly marginAmount: number | null;
  /** Stable machine-readable codes explaining the verdict, e.g. "COST_RANGE_STRADDLES_BUDGET". */
  readonly reasonCodes: readonly string[];
  /** True only when status is UNAFFORDABLE under a HARD_CEILING. UNKNOWN and BORDERLINE never set this true. */
  readonly excludedByAffordability: boolean;
  /** Null when destination and budget currencies matched (no conversion was needed). */
  readonly currencyConversion: AffordabilityCurrencyConversionEvidence | null;
}

// ---------------------------------------------------------------------------
// Layer 3 — DOES IT FIT MY LIFE? (LifestyleScore)
// ---------------------------------------------------------------------------

export interface LifestyleDimensionContribution {
  readonly dimensionKey: string;
  readonly direction: PreferenceDirection;
  readonly importance: PreferenceImportance;
  /** The destination's raw value on this dimension; null when unknown. */
  readonly rawDimensionValue: number | null;
  /** How well the raw value aligns with the stated direction, 0-100, BEFORE weighting; null when unknown. */
  readonly normalizedFitPercent: number | null;
  /** Signed, weight-scaled contribution to the total; 0 when the dimension value is unknown. */
  readonly contributionPoints: number;
  readonly isUnknown: boolean;
}

export interface LifestyleTradeoff {
  readonly dimensionKey: string;
  readonly importance: PreferenceImportance;
  readonly fitLevel: "LOW" | "MEDIUM" | "HIGH";
  /** Short structured reason code, e.g. "HIGH_IMPORTANCE_POOR_FIT" — not prose. */
  readonly note: string;
}

/** SCORED when at least one relevant dimension was known; INSUFFICIENT_DATA when none were — never fabricate a numeric fit from zero data. */
export type LifestyleScoreStatus = "SCORED" | "INSUFFICIENT_DATA";

/**
 * The personalized utility score. Never contains a hard gate — hard gates live only
 * in EligibilityResult/AffordabilityResult. A LifestyleScore must never be able to
 * resurrect a destination already excluded by Layer 1 or Layer 2; callers must only
 * consult this once eligibility/affordability have been checked first.
 */
export interface LifestyleScore {
  readonly modelVersion: ScoringModelVersion;
  readonly scoreStatus: LifestyleScoreStatus;
  /** Deterministic total, 0-100 utility index (NOT a probability). Only meaningful when scoreStatus is SCORED. */
  readonly totalScore: number;
  readonly dimensionContributions: readonly LifestyleDimensionContribution[];
  /** dimensionKeys, ranked highest-contribution first. */
  readonly topContributors: readonly string[];
  readonly tradeoffs: readonly LifestyleTradeoff[];
  /** Number of the profile's relevant dimensions that had known destination data. */
  readonly scoredDimensionCount: number;
  /** Number of dimensions the profile expressed a preference for, known or not. */
  readonly relevantDimensionCount: number;
  /** scoredDimensionCount / relevantDimensionCount (0 when relevantDimensionCount is 0); coverage is never mixed into totalScore. */
  readonly coverageRatio: number;
}

// ---------------------------------------------------------------------------
// Layer 4 — IS IT FINANCIALLY SMART? (FinancialEfficiencyResult)
// ---------------------------------------------------------------------------

export type FinancialFindingCategory =
  | "TAX_RESIDENCY_TRIGGER"
  | "PENSION_TREATMENT"
  | "SOCIAL_SECURITY_TREATMENT"
  | "IRA_TREATMENT"
  | "RETIREMENT_ACCOUNT_401K_TREATMENT"
  | "US_TAX_INTERACTION"
  | "TAX_TREATY_OR_FOREIGN_TAX_CREDIT"
  | "WEALTH_TAX"
  | "PROPERTY_TAX"
  | "PURCHASE_OR_TRANSFER_TAX"
  | "BUY_VS_RENT_IMPLICATION"
  | "PROPERTY_RESIDENCY_RELATIONSHIP";

export type FinancialFindingSeverity = "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "UNKNOWN" | "CAUTION";

export interface FinancialFinding {
  readonly category: FinancialFindingCategory;
  readonly severity: FinancialFindingSeverity;
  /** Stable machine-readable code, e.g. "TAX_RESIDENCY_THRESHOLD_EXCEEDED". Not prose. */
  readonly reasonCode: string;
  /** Short factual statement, not a prose explanation. Null when UNKNOWN. */
  readonly factSummary: string | null;
  readonly sourceFactKeys: readonly string[];
}

/**
 * Deliberately a findings LIST, never a single overall score. This is where the
 * legal-residency-vs-tax-residency separation is enforced structurally: tax
 * residency only ever appears here (TAX_RESIDENCY_TRIGGER), never in EligibilityResult.
 */
export interface FinancialEfficiencyResult {
  readonly modelVersion: FinancialModelVersion;
  readonly findings: readonly FinancialFinding[];
}

// ---------------------------------------------------------------------------
// Final recommendation result
// ---------------------------------------------------------------------------

/**
 * A sortable ranking value, when one is needed, WITHOUT collapsing Layer 4 or
 * averaging away a fatal flaw. `basis` fixes the only currently-allowed derivation:
 * it is the Layer 3 total score, computed only for destinations that are not
 * excluded, and it never incorporates Layer 4 findings — Layer 4 always renders as
 * an independent findings list alongside the ranked result, never folded into this
 * number.
 */
export interface SortRankingValue {
  readonly basis: "LIFESTYLE_SCORE_AMONG_ELIGIBLE_ONLY";
  readonly value: number;
}

/**
 * The richer final state. EXCLUDED (Layer 1 FAIL or Layer 2 hard-budget exclusion)
 * always wins; NEEDS_VERIFICATION means no FAIL exists but a relevant Layer 1/2
 * UNKNOWN remains; otherwise VIABLE. Layer 3/4 can never change this — `excluded`
 * is kept only for backward-compatible convenience (`excluded === (recommendationStatus === "EXCLUDED")`).
 */
export type RecommendationStatus = "VIABLE" | "NEEDS_VERIFICATION" | "EXCLUDED";

/**
 * A combined explanatory tradeoff item, tagged by its source layer so Layer 4
 * findings are never mistaken for Layer 3 soft-preference mismatches (or used as a
 * ranking input — tradeoffs are explanatory only).
 */
export type RecommendationTradeoff =
  | {
      readonly sourceLayer: "LIFESTYLE";
      readonly dimensionKey: string;
      readonly importance: PreferenceImportance;
      readonly fitLevel: "LOW" | "MEDIUM" | "HIGH";
      readonly note: string;
    }
  | {
      readonly sourceLayer: "FINANCIAL";
      readonly category: FinancialFindingCategory;
      readonly severity: FinancialFindingSeverity;
      readonly reasonCode: string;
    };

export interface FinalDestinationRecommendationResult {
  readonly destinationId: string;
  readonly contractVersions: IntelligenceV2ContractVersions;

  readonly eligibility: EligibilityResult;
  readonly affordability: AffordabilityResult;
  /** Null when excluded before Layer 3 would have run. */
  readonly lifestyleFit: LifestyleScore | null;
  /** Null when excluded before Layer 4 would have run. */
  readonly financialEfficiency: FinancialEfficiencyResult | null;

  readonly recommendationStatus: RecommendationStatus;
  /** True iff eligibility.overallStatus === "EXCLUDED" or affordability.excludedByAffordability === true. Equivalent to recommendationStatus === "EXCLUDED". */
  readonly excluded: boolean;
  readonly exclusionReasons: readonly string[];
  readonly matchedReasons: readonly string[];
  readonly tradeoffs: readonly RecommendationTradeoff[];
  readonly failedConstraints: readonly string[];
  readonly unknownConstraints: readonly string[];
  readonly topScoreContributors: readonly string[];

  /** Null whenever no ranking value is computable (e.g. excluded, or lifestyleFit is null). */
  readonly sortRankingValue: SortRankingValue | null;
}
