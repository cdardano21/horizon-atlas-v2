import type { HealthcareMinimumStandard, SafetyMinimumStandard } from "./profile-types";
import type { MoneyRange } from "./result-types";

/**
 * Minimal, boring fact shapes for SYNTHETIC destination fixtures.
 *
 * These are raw destination-side FACTS, not verdicts. A future evaluator will
 * combine a UserProfileV2 with these facts to produce HardConstraintResult /
 * EligibilityResult / etc. Fixtures here must never pre-compute a PASS/FAIL/UNKNOWN
 * verdict themselves.
 *
 * Deliberately does NOT mirror the full workbook/premium_* schema — only the small
 * slice of facts the four layers will actually read.
 */

/** A tri-state raw fact: known-yes, known-no, or not researched/available. */
export type TriStateFact = "YES" | "NO" | "UNKNOWN";

// ---------------------------------------------------------------------------
// Layer 1 facts — entry, stay, legal path, remote work, property, dependents
// ---------------------------------------------------------------------------

export interface DestinationEntryAndStayFacts {
  readonly touristEntryAllowed: TriStateFact;
  /** Null when not researched/unknown. */
  readonly touristStayLimitDays: number | null;
  readonly extendedStayOrLongStayVisaAvailable: TriStateFact;
  readonly permanentResidencyPathAvailable: TriStateFact;
  readonly retirementVisaProgramAvailable: TriStateFact;
  readonly remoteWorkOrDigitalNomadVisaAvailable: TriStateFact;
  /** Can a person legally just work remotely while present on ordinary tourist status. */
  readonly remoteWorkLegalUnderTouristStatus: TriStateFact;
  readonly foreignPropertyPurchaseAllowed: TriStateFact;
  /** Does foreign property purchase, by itself, grant any residency path. */
  readonly propertyPurchaseGrantsResidencyPath: TriStateFact;
  readonly spouseOrDependentInclusionSupported: TriStateFact;
}

// ---------------------------------------------------------------------------
// Hard-gate facts — beach, mountain/ski, healthcare, safety, LGBTQ+
// ---------------------------------------------------------------------------

export type BeachAccessFact = "DIRECT_ACCESS" | "NEARBY" | "NONE" | "UNKNOWN";
export type MountainOrSkiAccessFact = "SKI_RESORT_ACCESS" | "MOUNTAIN_SCENIC_ONLY" | "NONE" | "UNKNOWN";
export type LgbtqLegalProtectionFact = "LEGAL_PROTECTIONS_IN_PLACE" | "NO_LEGAL_PROTECTIONS" | "CRIMINALIZED" | "UNKNOWN";

export interface DestinationHardGateFacts {
  readonly beachAccess: BeachAccessFact;
  readonly mountainOrSkiAccess: MountainOrSkiAccessFact;
  readonly healthcareStandard: HealthcareMinimumStandard | "UNKNOWN";
  readonly safetyStandard: SafetyMinimumStandard | "UNKNOWN";
  readonly lgbtqLegalProtectionStatus: LgbtqLegalProtectionFact;
}

// ---------------------------------------------------------------------------
// Layer 2 facts — cost
// ---------------------------------------------------------------------------

export interface DestinationCostFacts {
  /** Null when cost data is missing entirely (supports honest Layer 2 UNKNOWN). */
  readonly estimatedMonthlyCostRange: MoneyRange | null;
  readonly householdSizeAssumedForEstimate: number;
}

// ---------------------------------------------------------------------------
// Layer 4 facts — tax residency, pension/SS/retirement accounts, property taxes
// ---------------------------------------------------------------------------

/**
 * Retirement-income treatment is deliberately richer than a tri-state fact — pension,
 * Social Security, IRA, and 401(k) treatment must be independently distinguishable
 * (e.g. one favorable, one taxable, one treaty-dependent) rather than collapsed into
 * a single "retirement income is tax-friendly" judgment.
 */
export type RetirementIncomeTreatmentFact =
  | "FAVORABLE"
  | "TAXABLE"
  | "PARTIALLY_TAXABLE"
  | "EXEMPT"
  | "TREATY_DEPENDENT"
  | "SPECIAL_REGIME"
  | "UNKNOWN";

export interface DestinationFinancialFacts {
  /** Local day-count threshold that triggers tax residency; null when unknown. */
  readonly taxResidencyTriggerDays: number | null;
  readonly pensionTreatment: RetirementIncomeTreatmentFact;
  readonly socialSecurityTreatment: RetirementIncomeTreatmentFact;
  readonly iraTreatment: RetirementIncomeTreatmentFact;
  readonly retirementAccount401kTreatment: RetirementIncomeTreatmentFact;
  readonly usTaxTreatyInEffect: TriStateFact;
  readonly foreignTaxCreditAvailable: TriStateFact;
  readonly wealthTaxApplicable: TriStateFact;
  /** Null when unknown. */
  readonly propertyTaxAnnualRatePercent: number | null;
  /** Null when unknown. */
  readonly propertyPurchaseOrTransferTaxPercent: number | null;
  /** Null when unknown/not computed. */
  readonly buyVsRentBreakEvenYears: number | null;
}

// ---------------------------------------------------------------------------
// Layer 3 facts — raw lifestyle dimension values
// ---------------------------------------------------------------------------

export interface DestinationLifestyleDimensionFacts {
  /** Sparse dimensionKey -> raw 0-100 value map; only include dimensions this fixture has data for. */
  readonly dimensionValues: Readonly<Record<string, number>>;
}

// ---------------------------------------------------------------------------
// Full synthetic destination fixture
// ---------------------------------------------------------------------------

export interface SyntheticDestinationFixture {
  readonly id: string;
  /** Clearly synthetic display name — never a real destination. */
  readonly displayName: string;
  /** One-line description of the edge case this fixture represents (test readability only). */
  readonly notes: string;

  readonly entryAndStay: DestinationEntryAndStayFacts;
  readonly hardGates: DestinationHardGateFacts;
  readonly cost: DestinationCostFacts;
  readonly financial: DestinationFinancialFacts;
  readonly lifestyleDimensions: DestinationLifestyleDimensionFacts;
}
