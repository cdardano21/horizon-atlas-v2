export type {
  ProfileContractVersion,
  EligibilityModelVersion,
  AffordabilityModelVersion,
  ScoringModelVersion,
  FinancialModelVersion,
  ExplanationContractVersion,
  IntelligenceV2ContractVersions,
} from "./versions";
export {
  CURRENT_PROFILE_CONTRACT_VERSION,
  CURRENT_ELIGIBILITY_MODEL_VERSION,
  CURRENT_AFFORDABILITY_MODEL_VERSION,
  CURRENT_SCORING_MODEL_VERSION,
  CURRENT_FINANCIAL_MODEL_VERSION,
  CURRENT_EXPLANATION_CONTRACT_VERSION,
  CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS,
} from "./versions";

export type {
  StayDurationBand,
  StayDuration,
  ActivityMode,
  CountryCode,
  Citizenship,
  HouseholdType,
  Household,
  BudgetCeilingType,
  BudgetTarget,
  TenureIntent,
  PreferenceDirection,
  PreferenceImportance,
  LifestylePreferenceInput,
  HealthcareMinimumStandard,
  SafetyMinimumStandard,
  MustHaveGeography,
  HardRequirementSelections,
  UserProfileV2,
} from "./profile-types";
export { createHardRequirementSelectionsWithNoneActivated, DEFAULT_PROFILE_CONTRACT_VERSION } from "./profile-types";

export type {
  HardConstraintStatus,
  HardConstraintResult,
  EligibilityCriteria,
  EligibilityOverallStatus,
  EligibilityResult,
  AffordabilityStatus,
  MoneyRange,
  AffordabilityCurrencyConversionEvidence,
  AffordabilityResult,
  LifestyleDimensionContribution,
  LifestyleTradeoff,
  LifestyleScoreStatus,
  LifestyleScore,
  FinancialFindingCategory,
  FinancialFindingSeverity,
  FinancialFinding,
  FinancialEfficiencyResult,
  SortRankingValue,
  RecommendationStatus,
  RecommendationTradeoff,
  FinalDestinationRecommendationResult,
} from "./result-types";
export { unknownHardConstraintResult } from "./result-types";

export type {
  TriStateFact,
  DestinationEntryAndStayFacts,
  BeachAccessFact,
  MountainOrSkiAccessFact,
  LgbtqLegalProtectionFact,
  DestinationHardGateFacts,
  DestinationCostFacts,
  RetirementIncomeTreatmentFact,
  DestinationFinancialFacts,
  DestinationLifestyleDimensionFacts,
  SyntheticDestinationFixture,
} from "./destination-fact-types";

export { evaluateEligibility } from "./eligibility-evaluator";
export { evaluateAffordability } from "./affordability-evaluator";
export {
  AFFORDABILITY_POLICY_VERSION,
  classifyCostRangeAgainstBudget,
  isExcludedByAffordabilityPolicy,
  isValidMoneyRange,
  isValidBudgetAmount,
} from "./affordability-policy";

export type { LifeMatchPurposeAnswer, LifeMatchStayDurationAnswer } from "./purpose-duration-intake";
export {
  LIFE_MATCH_PURPOSE_OPTIONS,
  LIFE_MATCH_STAY_DURATION_OPTIONS,
  derivePurposeAndDurationProfileFields,
} from "./purpose-duration-intake";

export { evaluateLifestyleFit } from "./lifestyle-scorer";
export type { LifestyleDimensionKey } from "./lifestyle-scoring-policy";
export {
  LIFESTYLE_SCORING_POLICY_VERSION,
  LIFESTYLE_DIMENSION_KEYS,
  ENUM_DERIVED_DIMENSION_KEYS,
  IMPORTANCE_WEIGHT_TABLE,
} from "./lifestyle-scoring-policy";

export { evaluateFinancialEfficiency } from "./financial-efficiency";
export {
  FINANCIAL_EFFICIENCY_POLICY_VERSION,
  FINANCIAL_FINDING_CATEGORY_ORDER,
  RETIREMENT_TREATMENT_SEVERITY,
  TRISTATE_FAVORABLE_SEVERITY,
} from "./financial-efficiency-policy";

export type { RelocationApplicability } from "./relocation-applicability";
export { deriveRelocationApplicability } from "./relocation-applicability";

export { evaluateDestinationForProfile, rankDestinationsForProfile } from "./orchestrator";
export type { RecommendationRankGroup } from "./ranking-policy";
export { computeRankGroup, compareForRanking, MATCHED_REASON_FIT_THRESHOLD_PERCENT } from "./ranking-policy";

export type { FxModelVersion, FxRateSnapshot, FxRateTable } from "./fx-types";
export type { FxConversionFailureReason, FxConversionResult, ConvertibleMoneyRange, FxRangeConversionResult } from "./fx-conversion";
export { convertAmount, convertMoneyRange } from "./fx-conversion";
