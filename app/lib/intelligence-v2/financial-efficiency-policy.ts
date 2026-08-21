import type { RetirementIncomeTreatmentFact, TriStateFact } from "./destination-fact-types";
import type { FinancialFindingCategory, FinancialFindingSeverity } from "./result-types";
import type { FinancialModelVersion } from "./versions";
import { CURRENT_FINANCIAL_MODEL_VERSION } from "./versions";

/**
 * FINANCIAL_EFFICIENCY_MODEL_V1 — the only Layer 4 policy for this phase.
 *
 * Recalibrating later means changing this file/bumping the version, never editing
 * the evaluator itself.
 */
export const FINANCIAL_EFFICIENCY_POLICY_VERSION: FinancialModelVersion = CURRENT_FINANCIAL_MODEL_VERSION;

/** Fixed category order — findings are always returned in this order, never sorted by severity/prose. */
export const FINANCIAL_FINDING_CATEGORY_ORDER: readonly FinancialFindingCategory[] = [
  "TAX_RESIDENCY_TRIGGER",
  "PENSION_TREATMENT",
  "SOCIAL_SECURITY_TREATMENT",
  "IRA_TREATMENT",
  "RETIREMENT_ACCOUNT_401K_TREATMENT",
  "US_TAX_INTERACTION",
  "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
  "WEALTH_TAX",
  "PROPERTY_TAX",
  "PURCHASE_OR_TRANSFER_TAX",
  "BUY_VS_RENT_IMPLICATION",
  "PROPERTY_RESIDENCY_RELATIONSHIP",
];

/** Maps a RetirementIncomeTreatmentFact directly to a finding severity — one explicit, versioned table, no ad hoc judgment in the evaluator. */
export const RETIREMENT_TREATMENT_SEVERITY: Record<RetirementIncomeTreatmentFact, FinancialFindingSeverity> = {
  FAVORABLE: "POSITIVE",
  EXEMPT: "POSITIVE",
  TAXABLE: "NEGATIVE",
  PARTIALLY_TAXABLE: "CAUTION",
  TREATY_DEPENDENT: "CAUTION",
  SPECIAL_REGIME: "CAUTION",
  UNKNOWN: "UNKNOWN",
};

/** Maps a plain TriStateFact "is this favorable" style fact to a severity, for the simpler yes/no findings (treaty, FTC, wealth tax base case). */
export const TRISTATE_FAVORABLE_SEVERITY: Record<TriStateFact, FinancialFindingSeverity> = {
  YES: "POSITIVE",
  NO: "NEUTRAL",
  UNKNOWN: "UNKNOWN",
};

/** A local day-count threshold at or above this triggers a tax-residency CAUTION finding (inclusive). */
export const TAX_RESIDENCY_TRIGGER_IS_INCLUSIVE = true;

/** Purchase/transfer tax rates at or above this percentage are flagged as a high-transaction-cost caution. Named/versioned, not a hidden magic number. */
export const HIGH_PURCHASE_TRANSFER_TAX_THRESHOLD_PERCENT = 5;

/** Same coarse band-to-days fallback used by the Layer 1 evaluator, reused here only for a buy-vs-rent stay-horizon estimate when exact days are unknown. */
export const BAND_UPPER_BOUND_DAYS: Partial<Record<"SHORT_1_3_MONTHS" | "MEDIUM_3_6_MONTHS" | "EXTENDED_6_12_MONTHS", number>> = {
  SHORT_1_3_MONTHS: 90,
  MEDIUM_3_6_MONTHS: 182,
  EXTENDED_6_12_MONTHS: 365,
};
