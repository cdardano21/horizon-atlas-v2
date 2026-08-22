import type { StayDuration, UserProfileV2 } from "./profile-types";
import type { FinancialEfficiencyResult, FinancialFinding, FinancialFindingSeverity } from "./result-types";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import { deriveRelocationApplicability } from "./relocation-applicability";
import { CURRENT_FINANCIAL_MODEL_VERSION } from "./versions";
import {
  BAND_UPPER_BOUND_DAYS,
  FINANCIAL_FINDING_CATEGORY_ORDER,
  HIGH_PURCHASE_TRANSFER_TAX_THRESHOLD_PERCENT,
  RETIREMENT_TREATMENT_SEVERITY,
  TRISTATE_FAVORABLE_SEVERITY,
} from "./financial-efficiency-policy";

/**
 * Layer 4 — IS IT FINANCIALLY SMART FOR MY PLAN? Deterministic pure-function evaluator.
 *
 * Reads `profile.stayDuration` / `activityMode` / `citizenship` / `tenureIntent` /
 * `intendsToWorkDuringStay` plus `destination.financial` (and, only for the BUY-gated
 * PROPERTY_RESIDENCY_RELATIONSHIP finding, the shared `entryAndStay.propertyPurchaseGrantsResidencyPath`
 * fact — the same deliberate cross-layer reuse pattern already used for beach/mountain/
 * healthcare/safety facts between Layers 1 and 3). Never reads `destination.cost`,
 * `profile.budget` (Layer 2), or `destination.hardGates` / `lifestyleDimensions` (Layer 3).
 *
 * Never produces a legal-stay verdict, never collapses into one overall score —
 * always a findings list, in fixed category order.
 *
 * For a DOMESTIC (same-country) relocation — see relocation-applicability.ts — the
 * international-only findings (the tax-residency day-threshold trigger, and the
 * US-tax-treaty/foreign-tax-credit finding) are omitted entirely, never shown as
 * UNKNOWN/NEUTRAL noise. Domestic financial facts (pension/Social Security/IRA/
 * 401(k) treatment, wealth tax, property tax, purchase/transfer tax) remain fully
 * relevant and are never suppressed just because the move is domestic.
 */

function finding(
  category: FinancialFinding["category"],
  severity: FinancialFindingSeverity,
  reasonCode: string,
  factSummary: string | null,
  sourceFactKeys: readonly string[],
): FinancialFinding {
  return { category, severity, reasonCode, factSummary, sourceFactKeys };
}

function resolveStayHorizonDays(stayDuration: StayDuration): number | null {
  if (stayDuration.intendedStayDurationDays !== null) return stayDuration.intendedStayDurationDays;
  if (stayDuration.band === "LONG_TERM_PERMANENT" || stayDuration.band === "UNSURE") return null;
  return BAND_UPPER_BOUND_DAYS[stayDuration.band] ?? null;
}

function evaluateTaxResidencyTrigger(profile: UserProfileV2, destination: SyntheticDestinationFixture): FinancialFinding {
  const thresholdDays = destination.financial.taxResidencyTriggerDays;
  const category = "TAX_RESIDENCY_TRIGGER" as const;
  const sourceFactKeys = ["financial.taxResidencyTriggerDays", "profile.stayDuration.intendedStayDurationDays"];

  if (thresholdDays === null) {
    return finding(category, "UNKNOWN", "NO_TAX_RESIDENCY_THRESHOLD_FACT", null, sourceFactKeys);
  }

  // Exact days are required — never assume triggering solely from the stay-duration band.
  const exactDays = profile.stayDuration.intendedStayDurationDays;
  if (exactDays === null) {
    return finding(category, "UNKNOWN", "STAY_DURATION_DAYS_UNKNOWN", null, sourceFactKeys);
  }

  if (exactDays < thresholdDays) {
    return finding(
      category,
      "NEUTRAL",
      "BELOW_TAX_RESIDENCY_THRESHOLD",
      `${exactDays} days is below the ${thresholdDays}-day tax residency threshold.`,
      sourceFactKeys,
    );
  }

  const reasonCode = profile.intendsToWorkDuringStay
    ? "TAX_RESIDENCY_THRESHOLD_TRIGGERED_EARNED_INCOME_CONTEXT"
    : "TAX_RESIDENCY_THRESHOLD_TRIGGERED";
  return finding(
    category,
    "CAUTION",
    reasonCode,
    `${exactDays} days meets or exceeds the ${thresholdDays}-day tax residency threshold.`,
    sourceFactKeys,
  );
}

export function evaluateFinancialEfficiency(profile: UserProfileV2, destination: SyntheticDestinationFixture): FinancialEfficiencyResult {
  const financial = destination.financial;
  const findings: FinancialFinding[] = [];
  const isDomestic = deriveRelocationApplicability(profile, destination) === "DOMESTIC";

  // The international day-count tax-residency concept does not exist for a domestic move -
  // omit the finding entirely rather than showing it as UNKNOWN noise.
  let taxResidencyMayApply: boolean;
  if (isDomestic) {
    taxResidencyMayApply = false;
  } else {
    const taxResidencyFinding = evaluateTaxResidencyTrigger(profile, destination);
    findings.push(taxResidencyFinding);
    taxResidencyMayApply = taxResidencyFinding.severity !== "NEUTRAL";
  }

  const isUsCitizen = profile.citizenship.primaryPassportCountryCode === "US";
  const isRetired = profile.activityMode === "RETIRED";
  const isBuying = profile.tenureIntent === "BUY";
  // Domestic retirement-income/wealth-tax facts (e.g. a state's own tax treatment) are
  // relevant immediately - they never depend on the international day-count trigger.
  const domesticFinancialFactsRelevant = isDomestic || taxResidencyMayApply;

  if (isRetired && domesticFinancialFactsRelevant) {
    findings.push(
      finding(
        "PENSION_TREATMENT",
        RETIREMENT_TREATMENT_SEVERITY[financial.pensionTreatment],
        `PENSION_TREATMENT_${financial.pensionTreatment}`,
        financial.pensionTreatment === "UNKNOWN" ? null : `Pension treatment: ${financial.pensionTreatment}.`,
        ["financial.pensionTreatment"],
      ),
    );
    findings.push(
      finding(
        "SOCIAL_SECURITY_TREATMENT",
        RETIREMENT_TREATMENT_SEVERITY[financial.socialSecurityTreatment],
        `SOCIAL_SECURITY_TREATMENT_${financial.socialSecurityTreatment}`,
        financial.socialSecurityTreatment === "UNKNOWN" ? null : `Social Security treatment: ${financial.socialSecurityTreatment}.`,
        ["financial.socialSecurityTreatment"],
      ),
    );
    findings.push(
      finding(
        "IRA_TREATMENT",
        RETIREMENT_TREATMENT_SEVERITY[financial.iraTreatment],
        `IRA_TREATMENT_${financial.iraTreatment}`,
        financial.iraTreatment === "UNKNOWN" ? null : `IRA treatment: ${financial.iraTreatment}.`,
        ["financial.iraTreatment"],
      ),
    );
    findings.push(
      finding(
        "RETIREMENT_ACCOUNT_401K_TREATMENT",
        RETIREMENT_TREATMENT_SEVERITY[financial.retirementAccount401kTreatment],
        `RETIREMENT_ACCOUNT_401K_TREATMENT_${financial.retirementAccount401kTreatment}`,
        financial.retirementAccount401kTreatment === "UNKNOWN" ? null : `401(k) treatment: ${financial.retirementAccount401kTreatment}.`,
        ["financial.retirementAccount401kTreatment"],
      ),
    );
  }

  if (!isDomestic && isUsCitizen && taxResidencyMayApply) {
    findings.push(
      finding(
        "US_TAX_INTERACTION",
        "CAUTION",
        "US_WORLDWIDE_TAXATION_APPLIES",
        "US citizens/residents remain subject to US worldwide taxation regardless of destination.",
        ["profile.citizenship.primaryPassportCountryCode"],
      ),
    );

    const treatyOrFtcKnownFavorable = financial.usTaxTreatyInEffect === "YES" || financial.foreignTaxCreditAvailable === "YES";
    const treatyOrFtcKnownUnfavorable = financial.usTaxTreatyInEffect === "NO" && financial.foreignTaxCreditAvailable === "NO";

    if (treatyOrFtcKnownFavorable) {
      findings.push(
        finding(
          "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
          "CAUTION",
          "TREATY_OR_FTC_MAY_MITIGATE_DOUBLE_TAXATION",
          "A tax treaty or foreign tax credit mechanism exists, but does not guarantee no double taxation.",
          ["financial.usTaxTreatyInEffect", "financial.foreignTaxCreditAvailable"],
        ),
      );
    } else if (treatyOrFtcKnownUnfavorable) {
      findings.push(
        finding(
          "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
          "CAUTION",
          "NO_TREATY_OR_FTC_AVAILABLE",
          "No tax treaty or foreign tax credit mechanism is known; double-taxation risk is not mitigated.",
          ["financial.usTaxTreatyInEffect", "financial.foreignTaxCreditAvailable"],
        ),
      );
    } else {
      findings.push(
        finding(
          "TAX_TREATY_OR_FOREIGN_TAX_CREDIT",
          "UNKNOWN",
          "TREATY_OR_FTC_STATUS_UNKNOWN",
          null,
          ["financial.usTaxTreatyInEffect", "financial.foreignTaxCreditAvailable"],
        ),
      );
    }
  }

  if (domesticFinancialFactsRelevant) {
    if (financial.wealthTaxApplicable === "NO") {
      findings.push(finding("WEALTH_TAX", "POSITIVE", "NO_WEALTH_TAX_REGIME", "No wealth tax regime applies.", ["financial.wealthTaxApplicable"]));
    } else if (financial.wealthTaxApplicable === "YES") {
      findings.push(
        finding(
          "WEALTH_TAX",
          "CAUTION",
          "WEALTH_TAX_REGIME_EXISTS_APPLICABILITY_UNKNOWN",
          "A wealth tax regime exists; applicability to this profile's specific assets is unknown.",
          ["financial.wealthTaxApplicable"],
        ),
      );
    } else {
      findings.push(finding("WEALTH_TAX", "UNKNOWN", "WEALTH_TAX_REGIME_UNKNOWN", null, ["financial.wealthTaxApplicable"]));
    }
  }

  if (isBuying) {
    if (financial.propertyTaxAnnualRatePercent === null) {
      findings.push(finding("PROPERTY_TAX", "UNKNOWN", "PROPERTY_TAX_RATE_UNKNOWN", null, ["financial.propertyTaxAnnualRatePercent"]));
    } else {
      findings.push(
        finding(
          "PROPERTY_TAX",
          "NEUTRAL",
          "PROPERTY_TAX_RATE_KNOWN",
          `Annual property tax rate: ${financial.propertyTaxAnnualRatePercent}%.`,
          ["financial.propertyTaxAnnualRatePercent"],
        ),
      );
    }

    if (financial.propertyPurchaseOrTransferTaxPercent === null) {
      findings.push(finding("PURCHASE_OR_TRANSFER_TAX", "UNKNOWN", "PURCHASE_TRANSFER_TAX_RATE_UNKNOWN", null, ["financial.propertyPurchaseOrTransferTaxPercent"]));
    } else if (financial.propertyPurchaseOrTransferTaxPercent >= HIGH_PURCHASE_TRANSFER_TAX_THRESHOLD_PERCENT) {
      findings.push(
        finding(
          "PURCHASE_OR_TRANSFER_TAX",
          "CAUTION",
          "HIGH_TRANSACTION_COSTS_CAUTION",
          `Purchase/transfer tax rate of ${financial.propertyPurchaseOrTransferTaxPercent}% is high.`,
          ["financial.propertyPurchaseOrTransferTaxPercent"],
        ),
      );
    } else {
      findings.push(
        finding(
          "PURCHASE_OR_TRANSFER_TAX",
          "NEUTRAL",
          "PURCHASE_TRANSFER_TAX_RATE_KNOWN",
          `Purchase/transfer tax rate: ${financial.propertyPurchaseOrTransferTaxPercent}%.`,
          ["financial.propertyPurchaseOrTransferTaxPercent"],
        ),
      );
    }

    if (financial.buyVsRentBreakEvenYears === null) {
      findings.push(finding("BUY_VS_RENT_IMPLICATION", "UNKNOWN", "OWNERSHIP_COST_UNKNOWN", null, ["financial.buyVsRentBreakEvenYears"]));
    } else {
      const horizonDays = resolveStayHorizonDays(profile.stayDuration);
      const horizonYears = profile.stayDuration.band === "LONG_TERM_PERMANENT" ? Infinity : horizonDays === null ? null : horizonDays / 365;

      if (horizonYears === null) {
        findings.push(
          finding("BUY_VS_RENT_IMPLICATION", "UNKNOWN", "STAY_HORIZON_UNKNOWN_FOR_BUY_VS_RENT", null, [
            "financial.buyVsRentBreakEvenYears",
            "profile.stayDuration",
          ]),
        );
      } else if (horizonYears >= financial.buyVsRentBreakEvenYears) {
        findings.push(
          finding(
            "BUY_VS_RENT_IMPLICATION",
            "POSITIVE",
            "BUY_MAY_MAKE_SENSE_FOR_LONG_HORIZON",
            `Stay horizon meets or exceeds the ${financial.buyVsRentBreakEvenYears}-year buy-vs-rent break-even.`,
            ["financial.buyVsRentBreakEvenYears", "profile.stayDuration"],
          ),
        );
      } else {
        findings.push(
          finding(
            "BUY_VS_RENT_IMPLICATION",
            "NEGATIVE",
            "RENT_FAVORED_FOR_SHORT_HORIZON",
            `Stay horizon is below the ${financial.buyVsRentBreakEvenYears}-year buy-vs-rent break-even.`,
            ["financial.buyVsRentBreakEvenYears", "profile.stayDuration"],
          ),
        );
      }
    }

    const residencyPathFact = destination.entryAndStay.propertyPurchaseGrantsResidencyPath;
    if (residencyPathFact === "UNKNOWN") {
      findings.push(finding("PROPERTY_RESIDENCY_RELATIONSHIP", "UNKNOWN", "PROPERTY_RESIDENCY_RELATIONSHIP_UNKNOWN", null, ["entryAndStay.propertyPurchaseGrantsResidencyPath"]));
    } else {
      findings.push(
        finding(
          "PROPERTY_RESIDENCY_RELATIONSHIP",
          TRISTATE_FAVORABLE_SEVERITY[residencyPathFact],
          residencyPathFact === "YES" ? "PROPERTY_PURCHASE_GRANTS_RESIDENCY_ADVANTAGE" : "PROPERTY_PURCHASE_HAS_NO_RESIDENCY_EFFECT",
          residencyPathFact === "YES"
            ? "Property purchase grants a residency-path advantage."
            : "Property purchase has no residency effect.",
          ["entryAndStay.propertyPurchaseGrantsResidencyPath"],
        ),
      );
    }
  }

  findings.sort((a, b) => FINANCIAL_FINDING_CATEGORY_ORDER.indexOf(a.category) - FINANCIAL_FINDING_CATEGORY_ORDER.indexOf(b.category));

  return {
    modelVersion: CURRENT_FINANCIAL_MODEL_VERSION,
    findings,
  };
}
