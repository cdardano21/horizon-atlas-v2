import type { Household, UserProfileV2 } from "./profile-types";
import type { AffordabilityCurrencyConversionEvidence, AffordabilityResult, MoneyRange } from "./result-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import type { FxRateTable } from "./fx-types";
import { convertMoneyRange } from "./fx-conversion";
import { CURRENT_AFFORDABILITY_MODEL_VERSION } from "./versions";
import {
  classifyCostRangeAgainstBudget,
  isExcludedByAffordabilityPolicy,
  isValidBudgetAmount,
  isValidMoneyRange,
} from "./affordability-policy";

/**
 * Layer 2 — CAN I AFFORD IT? Deterministic pure-function evaluator.
 *
 * Reads only `profile.budget` / `profile.household` / `profile.tenureIntent` plus
 * `destination.cost`. Never reads `destination.entryAndStay` (Layer 1),
 * `destination.hardGates` or `destination.lifestyleDimensions` (Layer 3), or
 * `destination.financial` (Layer 4) — monthly affordability is not legal
 * feasibility, lifestyle fit, or long-term financial efficiency.
 *
 * Currency: `fxTable` is an optional, immutable, caller-supplied snapshot — this
 * evaluator never fetches a live exchange rate. When the destination's cost
 * currency matches the budget's currency, `fxTable` is not even consulted. When
 * they differ and no usable rate is found, the result is UNKNOWN, never a guess
 * or a silent same-number comparison across units.
 */

/** No family multipliers are invented — this is a literal headcount used only to match against the destination's own stated assumption. */
function computeProfileHeadcount(household: Household): number {
  switch (household.type) {
    case "SINGLE":
      return 1;
    case "COUPLE":
      return household.spouseOrPartnerAccompanying ? 2 : 1;
    case "FAMILY_WITH_DEPENDENTS":
      return (household.spouseOrPartnerAccompanying ? 2 : 1) + household.dependentCount;
  }
}

function unknownResult(
  profile: UserProfileV2,
  reasonCode: string,
  estimatedMonthlyCostRange: MoneyRange | null,
  householdSizeAssumed: number,
  currencyConversion: AffordabilityCurrencyConversionEvidence | null = null,
): AffordabilityResult {
  return {
    modelVersion: CURRENT_AFFORDABILITY_MODEL_VERSION,
    status: "UNKNOWN",
    userMonthlyBudgetAmount: profile.budget.monthlyTargetAmount,
    userMonthlyBudgetCurrencyCode: profile.budget.currencyCode,
    budgetCeilingType: profile.budget.ceilingType,
    estimatedMonthlyCostRange,
    householdSizeAssumed,
    housingAssumption: profile.tenureIntent,
    marginAmount: null,
    reasonCodes: [reasonCode],
    excludedByAffordability: false,
    currencyConversion,
  };
}

export function evaluateAffordability(profile: UserProfileV2, destination: SyntheticDestinationFixture, fxTable?: FxRateTable): AffordabilityResult {
  const { budget, tenureIntent, household } = profile;
  const cost = destination.cost;

  if (!isValidBudgetAmount(budget.monthlyTargetAmount)) {
    return unknownResult(profile, "NO_USER_BUDGET_TARGET", null, cost.householdSizeAssumedForEstimate);
  }

  // BUY: no ownership monthly-cost model exists in this phase — never pretend the rental range applies.
  if (tenureIntent === "BUY") {
    return unknownResult(profile, "BUY_INTENT_OWNERSHIP_COST_NOT_MODELED", null, cost.householdSizeAssumedForEstimate);
  }

  if (cost.estimatedMonthlyCostRange === null) {
    return unknownResult(profile, "NO_DESTINATION_COST_DATA", null, cost.householdSizeAssumedForEstimate);
  }

  const range = cost.estimatedMonthlyCostRange;
  if (!isValidMoneyRange(range)) {
    return unknownResult(profile, "INVALID_DESTINATION_COST_RANGE", range, cost.householdSizeAssumedForEstimate);
  }

  const profileHeadcount = computeProfileHeadcount(household);
  if (profileHeadcount !== cost.householdSizeAssumedForEstimate) {
    return unknownResult(profile, "HOUSEHOLD_ESTIMATE_MISMATCH", range, cost.householdSizeAssumedForEstimate);
  }

  let classificationRange: MoneyRange = range;
  let currencyConversion: AffordabilityCurrencyConversionEvidence | null = null;

  if (range.currencyCode !== budget.currencyCode) {
    if (!fxTable) {
      return unknownResult(profile, "MISSING_FX_RATE_FOR_CURRENCY_PAIR", range, cost.householdSizeAssumedForEstimate, {
        originalCurrencyCode: range.currencyCode,
        originalRange: range,
        convertedRange: null,
        fxSnapshotVersion: null,
        effectiveDate: null,
        source: null,
      });
    }

    const conversion = convertMoneyRange(range, budget.currencyCode, fxTable);
    const conversionEvidenceBase = {
      originalCurrencyCode: range.currencyCode,
      originalRange: range,
      fxSnapshotVersion: fxTable.snapshotVersion,
      effectiveDate: fxTable.effectiveDate,
      source: fxTable.source,
    };

    if (!conversion.ok) {
      const reasonCode = conversion.reason === "INVALID_RATE_IN_TABLE" ? "INVALID_FX_RATE_FOR_CURRENCY_PAIR" : "MISSING_FX_RATE_FOR_CURRENCY_PAIR";
      return unknownResult(profile, reasonCode, range, cost.householdSizeAssumedForEstimate, { ...conversionEvidenceBase, convertedRange: null });
    }

    classificationRange = conversion.range;
    currencyConversion = { ...conversionEvidenceBase, convertedRange: classificationRange };
  }

  const status = classifyCostRangeAgainstBudget(classificationRange, budget.monthlyTargetAmount);
  const excludedByAffordability = isExcludedByAffordabilityPolicy(status, budget.ceilingType);
  const midpoint = (classificationRange.low + classificationRange.high) / 2;

  const reasonCodes: string[] = [
    status === "AFFORDABLE" ? "WITHIN_BUDGET_RANGE" : status === "BORDERLINE" ? "COST_RANGE_STRADDLES_BUDGET" : "COST_RANGE_EXCEEDS_BUDGET",
  ];
  if (excludedByAffordability) reasonCodes.push("HARD_CEILING_EXCLUSION");
  if (tenureIntent === "UNSURE") reasonCodes.push("TENURE_UNSURE_USING_RENT_BASELINE");

  return {
    modelVersion: CURRENT_AFFORDABILITY_MODEL_VERSION,
    status,
    userMonthlyBudgetAmount: budget.monthlyTargetAmount,
    userMonthlyBudgetCurrencyCode: budget.currencyCode,
    budgetCeilingType: budget.ceilingType,
    estimatedMonthlyCostRange: classificationRange,
    householdSizeAssumed: cost.householdSizeAssumedForEstimate,
    housingAssumption: tenureIntent,
    marginAmount: budget.monthlyTargetAmount - midpoint,
    reasonCodes,
    excludedByAffordability,
    currencyConversion,
  };
}
