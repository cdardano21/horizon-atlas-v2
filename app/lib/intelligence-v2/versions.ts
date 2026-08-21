/**
 * Intelligence v2 contract versions.
 *
 * Every independently-evolvable part of the decision contract gets its own version
 * literal. A future ranking result must always be reproducible from
 * (profile + destination facts + these version values) alone — no hidden runtime state.
 *
 * Bump a version by adding a new literal to the relevant union and updating the
 * corresponding CURRENT_* constant. Do not reuse an old literal for new semantics.
 */

export type ProfileContractVersion = "intelligence-v2-profile@1";
export type EligibilityModelVersion = "intelligence-v2-eligibility@1";
export type AffordabilityModelVersion = "intelligence-v2-affordability@1";
export type ScoringModelVersion = "intelligence-v2-scoring@1";
export type FinancialModelVersion = "intelligence-v2-financial@1";
/** Reserved for the future explanation/prose system. Not used by any type in this phase. */
export type ExplanationContractVersion = "intelligence-v2-explanation@1";

export const CURRENT_PROFILE_CONTRACT_VERSION: ProfileContractVersion = "intelligence-v2-profile@1";
export const CURRENT_ELIGIBILITY_MODEL_VERSION: EligibilityModelVersion = "intelligence-v2-eligibility@1";
export const CURRENT_AFFORDABILITY_MODEL_VERSION: AffordabilityModelVersion = "intelligence-v2-affordability@1";
export const CURRENT_SCORING_MODEL_VERSION: ScoringModelVersion = "intelligence-v2-scoring@1";
export const CURRENT_FINANCIAL_MODEL_VERSION: FinancialModelVersion = "intelligence-v2-financial@1";
export const CURRENT_EXPLANATION_CONTRACT_VERSION: ExplanationContractVersion = "intelligence-v2-explanation@1";

/** Full version bundle stamped onto every future recommendation result for reproducibility. */
export interface IntelligenceV2ContractVersions {
  readonly profileContractVersion: ProfileContractVersion;
  readonly eligibilityModelVersion: EligibilityModelVersion;
  readonly affordabilityModelVersion: AffordabilityModelVersion;
  readonly scoringModelVersion: ScoringModelVersion;
  readonly financialModelVersion: FinancialModelVersion;
  readonly explanationContractVersion: ExplanationContractVersion;
}

export const CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS: IntelligenceV2ContractVersions = {
  profileContractVersion: CURRENT_PROFILE_CONTRACT_VERSION,
  eligibilityModelVersion: CURRENT_ELIGIBILITY_MODEL_VERSION,
  affordabilityModelVersion: CURRENT_AFFORDABILITY_MODEL_VERSION,
  scoringModelVersion: CURRENT_SCORING_MODEL_VERSION,
  financialModelVersion: CURRENT_FINANCIAL_MODEL_VERSION,
  explanationContractVersion: CURRENT_EXPLANATION_CONTRACT_VERSION,
};
