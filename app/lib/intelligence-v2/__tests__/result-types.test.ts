import { describe, expect, it } from "vitest";
import { unknownHardConstraintResult } from "../result-types";
import type {
  EligibilityCriteria,
  EligibilityResult,
  FinancialEfficiencyResult,
  FinancialFinding,
  FinalDestinationRecommendationResult,
  HardConstraintResult,
  HardConstraintStatus,
  LifestyleScore,
  AffordabilityResult,
} from "../result-types";
import { CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS } from "../versions";

const passResult = (reasonCode: string): HardConstraintResult => ({
  status: "PASS",
  reasonCode,
  evidenceSummary: "synthetic evidence",
  sourceFactKeys: ["fact:example"],
});

const failResult = (reasonCode: string): HardConstraintResult => ({
  status: "FAIL",
  reasonCode,
  evidenceSummary: "synthetic evidence",
  sourceFactKeys: ["fact:example"],
});

describe("HardConstraintResult — UNKNOWN is structurally distinct from PASS/FAIL", () => {
  it("has exactly three, mutually exclusive statuses", () => {
    const statuses: readonly HardConstraintStatus[] = ["PASS", "FAIL", "UNKNOWN"];
    expect(new Set(statuses).size).toBe(3);
  });

  it("is never represented as a nullable boolean — UNKNOWN carries its own reason/evidence shape", () => {
    const unknown = unknownHardConstraintResult("NO_LEGAL_DATA_AVAILABLE");
    expect(unknown.status).toBe("UNKNOWN");
    expect(unknown.status).not.toBe("PASS");
    expect(unknown.status).not.toBe("FAIL");
    expect(unknown.evidenceSummary).toBeNull();
    expect(unknown.sourceFactKeys).toEqual([]);
  });
});

describe("EligibilityResult — no averaging, a single FAIL always excludes", () => {
  const baseCriteria: EligibilityCriteria = {
    entryFeasibility: passResult("ENTRY_OK"),
    stayDurationFeasibility: passResult("DURATION_OK"),
    requiredLegalPath: passResult("LEGAL_PATH_OK"),
    remoteWorkLegality: null,
    retirementOrResidencyPath: null,
    spouseOrDependentFeasibility: null,
    foreignPropertyPurchaseRights: null,
    healthcareGate: null,
    safetyGate: null,
    lgbtqLegalSafetyGate: null,
    beachAccessGate: null,
    mountainOrSkiAccessGate: null,
  };

  it("does not include a tax-residency criterion — legal stay and tax residency are different questions", () => {
    const criteriaKeys = Object.keys(baseCriteria);
    const anyTaxRelatedKey = criteriaKeys.some((key) => key.toLowerCase().includes("tax"));
    expect(anyTaxRelatedKey).toBe(false);
  });

  it("excludes when even a single activated criterion is FAIL, regardless of how many PASS", () => {
    const criteriaWithOneFail: EligibilityCriteria = {
      ...baseCriteria,
      beachAccessGate: failResult("NO_BEACH_ACCESS"),
    };

    const result: EligibilityResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.eligibilityModelVersion,
      criteria: criteriaWithOneFail,
      overallStatus: "EXCLUDED",
      exclusionReasonCodes: ["NO_BEACH_ACCESS"],
      unknownReasonCodes: [],
    };

    expect(result.overallStatus).toBe("EXCLUDED");
    expect(result.exclusionReasonCodes).toContain("NO_BEACH_ACCESS");
  });

  it("is UNKNOWN_INCOMPLETE (never averaged into ELIGIBLE) when a criterion is UNKNOWN and none FAIL", () => {
    const criteriaWithUnknown: EligibilityCriteria = {
      ...baseCriteria,
      healthcareGate: unknownHardConstraintResult("HEALTHCARE_DATA_MISSING"),
    };

    const result: EligibilityResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.eligibilityModelVersion,
      criteria: criteriaWithUnknown,
      overallStatus: "UNKNOWN_INCOMPLETE",
      exclusionReasonCodes: [],
      unknownReasonCodes: ["HEALTHCARE_DATA_MISSING"],
    };

    expect(result.overallStatus).toBe("UNKNOWN_INCOMPLETE");
    expect(result.overallStatus).not.toBe("ELIGIBLE");
  });
});

describe("Layer 4 — legal residency and tax residency cannot occupy the same field/type", () => {
  it("only exposes tax residency via FinancialFinding's TAX_RESIDENCY_TRIGGER category, never via EligibilityCriteria", () => {
    const finding: FinancialFinding = {
      category: "TAX_RESIDENCY_TRIGGER",
      severity: "CAUTION",
      reasonCode: "TAX_RESIDENCY_THRESHOLD_EXCEEDED",
      factSummary: "Staying beyond 183 days may trigger local tax residency.",
      sourceFactKeys: ["fact:tax-residency-trigger-days"],
    };

    expect(finding.category).toBe("TAX_RESIDENCY_TRIGGER");
  });

  it("supports UNKNOWN findings without fabricating a factSummary", () => {
    const finding: FinancialFinding = {
      category: "PENSION_TREATMENT",
      severity: "UNKNOWN",
      reasonCode: "PENSION_TREATMENT_UNKNOWN",
      factSummary: null,
      sourceFactKeys: [],
    };

    expect(finding.severity).toBe("UNKNOWN");
    expect(finding.factSummary).toBeNull();
  });

  it("is a findings list, never a single overall score", () => {
    const result: FinancialEfficiencyResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.financialModelVersion,
      findings: [
        { category: "TAX_RESIDENCY_TRIGGER", severity: "CAUTION", reasonCode: "TAX_RESIDENCY_THRESHOLD_EXCEEDED", factSummary: "183-day trigger", sourceFactKeys: [] },
        { category: "WEALTH_TAX", severity: "POSITIVE", reasonCode: "NO_WEALTH_TAX_REGIME", factSummary: "No wealth tax", sourceFactKeys: [] },
      ],
    };

    expect(Array.isArray(result.findings)).toBe(true);
    expect(Object.keys(result)).not.toContain("overallScore");
    expect(Object.keys(result)).not.toContain("score");
  });
});

describe("FinalDestinationRecommendationResult — no monolithic four-layer score", () => {
  it("keeps the four layers independently inspectable and never sums them into one score", () => {
    const eligibility: EligibilityResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.eligibilityModelVersion,
      criteria: {
        entryFeasibility: passResult("ENTRY_OK"),
        stayDurationFeasibility: passResult("DURATION_OK"),
        requiredLegalPath: passResult("LEGAL_PATH_OK"),
        remoteWorkLegality: null,
        retirementOrResidencyPath: null,
        spouseOrDependentFeasibility: null,
        foreignPropertyPurchaseRights: null,
        healthcareGate: null,
        safetyGate: null,
        lgbtqLegalSafetyGate: null,
        beachAccessGate: null,
        mountainOrSkiAccessGate: null,
      },
      overallStatus: "ELIGIBLE",
      exclusionReasonCodes: [],
      unknownReasonCodes: [],
    };

    const affordability: AffordabilityResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.affordabilityModelVersion,
      status: "AFFORDABLE",
      userMonthlyBudgetAmount: 4000,
      userMonthlyBudgetCurrencyCode: "USD",
      budgetCeilingType: "FLEXIBLE_TARGET",
      estimatedMonthlyCostRange: { low: 2000, high: 2600, currencyCode: "USD" },
      householdSizeAssumed: 1,
      housingAssumption: "RENT",
      marginAmount: 1700,
      reasonCodes: ["WITHIN_BUDGET_RANGE"],
      excludedByAffordability: false,
    };

    const lifestyleFit: LifestyleScore = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.scoringModelVersion,
      scoreStatus: "SCORED",
      totalScore: 78,
      dimensionContributions: [],
      topContributors: ["climate"],
      tradeoffs: [],
      scoredDimensionCount: 1,
      relevantDimensionCount: 1,
      coverageRatio: 1,
    };

    const financialEfficiency: FinancialEfficiencyResult = {
      modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.financialModelVersion,
      findings: [{ category: "TAX_RESIDENCY_TRIGGER", severity: "CAUTION", reasonCode: "TAX_RESIDENCY_THRESHOLD_EXCEEDED", factSummary: "183-day trigger", sourceFactKeys: [] }],
    };

    const result: FinalDestinationRecommendationResult = {
      destinationId: "fixture-example",
      contractVersions: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS,
      eligibility,
      affordability,
      lifestyleFit,
      financialEfficiency,
      recommendationStatus: "VIABLE",
      excluded: false,
      exclusionReasons: [],
      matchedReasons: ["climate"],
      tradeoffs: [],
      failedConstraints: [],
      unknownConstraints: [],
      topScoreContributors: ["climate"],
      sortRankingValue: { basis: "LIFESTYLE_SCORE_AMONG_ELIGIBLE_ONLY", value: lifestyleFit.totalScore },
    };

    expect(Object.keys(result)).not.toContain("overallScore");
    expect(Object.keys(result)).not.toContain("averageScore");
    expect(result.sortRankingValue?.value).toBe(result.lifestyleFit?.totalScore);
    expect(result.sortRankingValue?.basis).toBe("LIFESTYLE_SCORE_AMONG_ELIGIBLE_ONLY");
  });

  it("never computes a sortRankingValue for an excluded destination, and never lets lifestyleFit resurrect it", () => {
    const excludedResult: FinalDestinationRecommendationResult = {
      destinationId: "fixture-excluded-example",
      contractVersions: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS,
      eligibility: {
        modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.eligibilityModelVersion,
        criteria: {
          entryFeasibility: passResult("ENTRY_OK"),
          stayDurationFeasibility: failResult("STAY_LIMIT_EXCEEDED"),
          requiredLegalPath: failResult("NO_LEGAL_PATH"),
          remoteWorkLegality: null,
          retirementOrResidencyPath: null,
          spouseOrDependentFeasibility: null,
          foreignPropertyPurchaseRights: null,
          healthcareGate: null,
          safetyGate: null,
          lgbtqLegalSafetyGate: null,
          beachAccessGate: null,
          mountainOrSkiAccessGate: null,
        },
        overallStatus: "EXCLUDED",
        exclusionReasonCodes: ["STAY_LIMIT_EXCEEDED", "NO_LEGAL_PATH"],
        unknownReasonCodes: [],
      },
      affordability: {
        modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.affordabilityModelVersion,
        status: "AFFORDABLE",
        userMonthlyBudgetAmount: 4000,
        userMonthlyBudgetCurrencyCode: "USD",
        budgetCeilingType: "FLEXIBLE_TARGET",
        estimatedMonthlyCostRange: { low: 2000, high: 2600, currencyCode: "USD" },
        householdSizeAssumed: 1,
        housingAssumption: "RENT",
        marginAmount: 1700,
        reasonCodes: ["WITHIN_BUDGET_RANGE"],
        excludedByAffordability: false,
      },
      // A very high lifestyle score must NOT be able to undo the Layer 1 exclusion.
      lifestyleFit: {
        modelVersion: CURRENT_INTELLIGENCE_V2_CONTRACT_VERSIONS.scoringModelVersion,
        scoreStatus: "SCORED",
        totalScore: 99,
        dimensionContributions: [],
        topContributors: [],
        tradeoffs: [],
        scoredDimensionCount: 1,
        relevantDimensionCount: 1,
        coverageRatio: 1,
      },
      financialEfficiency: null,
      recommendationStatus: "EXCLUDED",
      excluded: true,
      exclusionReasons: ["STAY_LIMIT_EXCEEDED", "NO_LEGAL_PATH"],
      matchedReasons: [],
      tradeoffs: [],
      failedConstraints: ["STAY_LIMIT_EXCEEDED", "NO_LEGAL_PATH"],
      unknownConstraints: [],
      topScoreContributors: [],
      sortRankingValue: null,
    };

    expect(excludedResult.excluded).toBe(true);
    expect(excludedResult.lifestyleFit?.totalScore).toBe(99);
    expect(excludedResult.sortRankingValue).toBeNull();
  });
});
