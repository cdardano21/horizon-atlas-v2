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
  AffordabilityResult,
  LifestyleDimensionContribution,
  LifestyleTradeoff,
  LifestyleScore,
  FinancialFindingCategory,
  FinancialFindingSeverity,
  FinancialFinding,
  FinancialEfficiencyResult,
  SortRankingValue,
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
  DestinationFinancialFacts,
  DestinationLifestyleDimensionFacts,
  SyntheticDestinationFixture,
} from "./destination-fact-types";
