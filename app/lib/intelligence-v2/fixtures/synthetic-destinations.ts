import type { SyntheticDestinationFixture } from "../destination-fact-types";

/**
 * ~13 in-memory synthetic destination fixtures. NONE of these are real destinations —
 * they exist only to exercise the Layer 1-4 contract shapes and edge cases before any
 * evaluator exists. Each fixture contains only the minimal fact shape the future
 * evaluators will read; this deliberately does not mirror the full workbook schema.
 */

/** Cheap, but no path to stay beyond a short tourist visit. */
export const CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY: SyntheticDestinationFixture = {
  id: "fixture-cheap-legally-infeasible-long-stay",
  displayName: "Fixture: Cheap But Legally Infeasible For Long Stay",
  notes: "Very low cost of living, but no extended-stay, residency, or retirement visa path exists.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 30,
    extendedStayOrLongStayVisaAvailable: "NO",
    permanentResidencyPathAvailable: "NO",
    retirementVisaProgramAvailable: "NO",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "NO",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "BASIC_ACCESS",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 900, high: 1400, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: null,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { costOfLivingSatisfaction: 92, safety: 55 } },
};

/** Expensive, but excellent across most soft lifestyle dimensions. */
export const EXPENSIVE_BUT_EXCELLENT_LIFESTYLE: SyntheticDestinationFixture = {
  id: "fixture-expensive-excellent-lifestyle",
  displayName: "Fixture: Expensive But Excellent Lifestyle",
  notes: "High cost of living, but strong climate/culture/community/walkability dimension values.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "YES",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "DIRECT_ACCESS",
    mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
    healthcareStandard: "INTERNATIONAL_STANDARD",
    safetyStandard: "HIGH_SAFETY_ONLY",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 5800, high: 7200, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "YES",
    socialSecurityTaxTreatyBenefit: "YES",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "YES",
    foreignTaxCreditAvailable: "YES",
    wealthTaxApplicable: "NO",
    propertyTaxAnnualRatePercent: 0.4,
    propertyPurchaseOrTransferTaxPercent: 6.5,
    buyVsRentBreakEvenYears: 9,
  },
  lifestyleDimensions: { dimensionValues: { climate: 88, culture: 91, community: 80, walkability: 85 } },
};

/**
 * 90-day tourist-friendly, but no long-stay path at all. This is the fixture used to
 * prove the SAME destination can legitimately produce different Layer 1 outcomes for
 * a 90-day retiree, a 7-month retiree, a 7-month remote employee, and a permanent
 * buyer — see synthetic-profiles.ts and the cross-profile contract test.
 */
export const TOURIST_FRIENDLY_NO_LONG_STAY_PATH: SyntheticDestinationFixture = {
  id: "fixture-tourist-friendly-no-long-stay-path",
  displayName: "Fixture: Tourist-Friendly But No Long-Stay Path",
  notes:
    "90-day tourist entry is easy and property is purchasable, but there is no extended-stay, " +
    "retirement, or residency path, and property purchase does not grant residency.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "NO",
    permanentResidencyPathAvailable: "NO",
    retirementVisaProgramAvailable: "NO",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2200, high: 2900, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { climate: 70, culture: 65 } },
};

/** Long-stay/retiree-friendly, but remote work is either prohibited or unresearched. */
export const LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN: SyntheticDestinationFixture = {
  id: "fixture-long-stay-retiree-friendly-remote-work-unclear",
  displayName: "Fixture: Long-Stay Retiree-Friendly, Remote Work Prohibited Or Unknown",
  notes: "Retirement visa program exists and is generous, but no digital-nomad path and tourist-status remote work is disallowed.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "NO",
    remoteWorkLegalUnderTouristStatus: "NO",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "NONE",
    mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2600, high: 3400, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 2,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "NO",
    socialSecurityTaxTreatyBenefit: "YES",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "YES",
    foreignTaxCreditAvailable: "YES",
    wealthTaxApplicable: "NO",
    propertyTaxAnnualRatePercent: 0.3,
    propertyPurchaseOrTransferTaxPercent: 3,
    buyVsRentBreakEvenYears: 7,
  },
  lifestyleDimensions: { dimensionValues: { climate: 60, community: 78, pace: 82 } },
};

/** Excellent, clear digital-nomad legal path. */
export const EXCELLENT_DIGITAL_NOMAD_LEGAL_PATH: SyntheticDestinationFixture = {
  id: "fixture-excellent-digital-nomad-legal-path",
  displayName: "Fixture: Excellent Digital Nomad Legal Path",
  notes: "A dedicated digital-nomad/remote-work visa exists with a clear multi-year duration and explicit remote-work legality.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "UNKNOWN",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "YES",
    remoteWorkLegalUnderTouristStatus: "YES",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "DIRECT_ACCESS",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2000, high: 2700, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "NO",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { connectivity: 90, pace: 75 } },
};

/** Direct beach access, no mountain/ski access at all. */
export const BEACH_DESTINATION_NO_MOUNTAIN_ACCESS: SyntheticDestinationFixture = {
  id: "fixture-beach-no-mountain",
  displayName: "Fixture: Beach Destination, No Mountain Access",
  notes: "Direct beach access; flat coastal geography with no mountain or ski access at all.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 180,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "DIRECT_ACCESS",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2400, high: 3100, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 2,
  },
  financial: {
    taxResidencyTriggerDays: null,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { coast: 95, climate: 84 } },
};

/** Ski-resort mountain access, no beach access at all. */
export const MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS: SyntheticDestinationFixture = {
  id: "fixture-mountain-ski-no-beach",
  displayName: "Fixture: Mountain/Ski Destination, No Beach Access",
  notes: "Genuine ski-resort access (not merely scenic mountains); landlocked with no beach access at all.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "UNKNOWN",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "NO",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "NONE",
    mountainOrSkiAccess: "SKI_RESORT_ACCESS",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "HIGH_SAFETY_ONLY",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 3800, high: 5200, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "YES",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "YES",
    propertyTaxAnnualRatePercent: 0.8,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { nature: 93, pace: 60 } },
};

/** Excellent healthcare, but high overall cost. */
export const EXCELLENT_HEALTHCARE_HIGH_COST: SyntheticDestinationFixture = {
  id: "fixture-excellent-healthcare-high-cost",
  displayName: "Fixture: Excellent Healthcare, High Cost",
  notes: "International-standard healthcare, but overall cost of living is high across the board.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "UNKNOWN",
    mountainOrSkiAccess: "UNKNOWN",
    healthcareStandard: "INTERNATIONAL_STANDARD",
    safetyStandard: "HIGH_SAFETY_ONLY",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 6200, high: 7800, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "YES",
    socialSecurityTaxTreatyBenefit: "YES",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "YES",
    foreignTaxCreditAvailable: "YES",
    wealthTaxApplicable: "NO",
    propertyTaxAnnualRatePercent: 0.6,
    propertyPurchaseOrTransferTaxPercent: 4,
    buyVsRentBreakEvenYears: 11,
  },
  lifestyleDimensions: { dimensionValues: { healthcare: 96 } },
};

/** Weak LGBTQ+ legal safety, but otherwise a high lifestyle-fit score. */
export const WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE: SyntheticDestinationFixture = {
  id: "fixture-weak-lgbtq-legal-otherwise-high-lifestyle",
  displayName: "Fixture: Weak LGBTQ+ Legal Safety, Otherwise High Lifestyle Score",
  notes: "No legal protections for LGBTQ+ residents, despite strong climate/culture/community/walkability values elsewhere.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "NO_LEGAL_PROTECTIONS",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2100, high: 2800, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { climate: 89, culture: 87, community: 82, walkability: 84 } },
};

/** Legal/entry facts are entirely missing, forcing an honest UNKNOWN eligibility result. */
export const MISSING_LEGAL_DATA_UNKNOWN: SyntheticDestinationFixture = {
  id: "fixture-missing-legal-data-unknown",
  displayName: "Fixture: Missing Legal Data (UNKNOWN)",
  notes: "Entry/stay legal facts have not been researched at all; a future evaluator must return UNKNOWN, not a guess.",
  entryAndStay: {
    touristEntryAllowed: "UNKNOWN",
    touristStayLimitDays: null,
    extendedStayOrLongStayVisaAvailable: "UNKNOWN",
    permanentResidencyPathAvailable: "UNKNOWN",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "UNKNOWN",
    propertyPurchaseGrantsResidencyPath: "UNKNOWN",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "UNKNOWN",
    mountainOrSkiAccess: "UNKNOWN",
    healthcareStandard: "UNKNOWN",
    safetyStandard: "UNKNOWN",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 1800, high: 2400, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: null,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: {} },
};

/** Financial/tax facts are entirely missing, forcing an honest Layer 4 UNKNOWN. */
export const MISSING_FINANCIAL_DATA_UNKNOWN: SyntheticDestinationFixture = {
  id: "fixture-missing-financial-data-unknown",
  displayName: "Fixture: Missing Financial Data (Layer 4 UNKNOWN)",
  notes: "Legal/entry facts are well documented, but no tax/pension/property-tax research exists yet.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 2300, high: 3000, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 2,
  },
  financial: {
    taxResidencyTriggerDays: null,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { community: 75 } },
};

/** Buying is restricted for foreigners, but renting is unremarkable/easy. */
export const BUYING_RESTRICTED_BUT_RENTING_EASY: SyntheticDestinationFixture = {
  id: "fixture-buying-restricted-renting-easy",
  displayName: "Fixture: Buying Restricted, Renting Easy",
  notes: "Foreign property purchase is not allowed, but there is no indication renting is difficult and long-stay entry is fine.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "UNKNOWN",
    retirementVisaProgramAvailable: "UNKNOWN",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "NO",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "UNKNOWN",
  },
  hardGates: {
    beachAccess: "NONE",
    mountainOrSkiAccess: "NONE",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "MODERATE_OR_BETTER",
    lgbtqLegalProtectionStatus: "UNKNOWN",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 1900, high: 2500, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "UNKNOWN",
    socialSecurityTaxTreatyBenefit: "UNKNOWN",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "UNKNOWN",
    foreignTaxCreditAvailable: "UNKNOWN",
    wealthTaxApplicable: "UNKNOWN",
    propertyTaxAnnualRatePercent: null,
    propertyPurchaseOrTransferTaxPercent: null,
    buyVsRentBreakEvenYears: null,
  },
  lifestyleDimensions: { dimensionValues: { pace: 70 } },
};

/** Affordable at a $6,500 flexible target, but not at a $4,500 hard ceiling. */
export const AFFORDABLE_AT_6500_NOT_AT_4500: SyntheticDestinationFixture = {
  id: "fixture-affordable-at-6500-not-4500",
  displayName: "Fixture: Affordable At $6,500, Not At $4,500",
  notes: "Estimated monthly cost range sits between a $4,500 hard-ceiling budget and a $6,500 flexible target.",
  entryAndStay: {
    touristEntryAllowed: "YES",
    touristStayLimitDays: 90,
    extendedStayOrLongStayVisaAvailable: "YES",
    permanentResidencyPathAvailable: "YES",
    retirementVisaProgramAvailable: "YES",
    remoteWorkOrDigitalNomadVisaAvailable: "UNKNOWN",
    remoteWorkLegalUnderTouristStatus: "UNKNOWN",
    foreignPropertyPurchaseAllowed: "YES",
    propertyPurchaseGrantsResidencyPath: "NO",
    spouseOrDependentInclusionSupported: "YES",
  },
  hardGates: {
    beachAccess: "NEARBY",
    mountainOrSkiAccess: "MOUNTAIN_SCENIC_ONLY",
    healthcareStandard: "GOOD_PRIVATE_AVAILABLE",
    safetyStandard: "HIGH_SAFETY_ONLY",
    lgbtqLegalProtectionStatus: "LEGAL_PROTECTIONS_IN_PLACE",
  },
  cost: {
    estimatedMonthlyCostRange: { low: 5200, high: 6100, currencyCode: "USD" },
    householdSizeAssumedForEstimate: 1,
  },
  financial: {
    taxResidencyTriggerDays: 183,
    pensionTaxable: "YES",
    socialSecurityTaxTreatyBenefit: "YES",
    iraOrForeignRetirementAccountRecognized: "UNKNOWN",
    fourZeroOneKRecognized: "UNKNOWN",
    usTaxTreatyInEffect: "YES",
    foreignTaxCreditAvailable: "YES",
    wealthTaxApplicable: "NO",
    propertyTaxAnnualRatePercent: 0.5,
    propertyPurchaseOrTransferTaxPercent: 5,
    buyVsRentBreakEvenYears: 8,
  },
  lifestyleDimensions: { dimensionValues: { safety: 88, healthcare: 85 } },
};

export const ALL_SYNTHETIC_DESTINATION_FIXTURES: readonly SyntheticDestinationFixture[] = [
  CHEAP_BUT_LEGALLY_INFEASIBLE_FOR_LONG_STAY,
  EXPENSIVE_BUT_EXCELLENT_LIFESTYLE,
  TOURIST_FRIENDLY_NO_LONG_STAY_PATH,
  LONG_STAY_RETIREE_FRIENDLY_REMOTE_WORK_PROHIBITED_OR_UNKNOWN,
  EXCELLENT_DIGITAL_NOMAD_LEGAL_PATH,
  BEACH_DESTINATION_NO_MOUNTAIN_ACCESS,
  MOUNTAIN_SKI_DESTINATION_NO_BEACH_ACCESS,
  EXCELLENT_HEALTHCARE_HIGH_COST,
  WEAK_LGBTQ_LEGAL_SAFETY_OTHERWISE_HIGH_LIFESTYLE,
  MISSING_LEGAL_DATA_UNKNOWN,
  MISSING_FINANCIAL_DATA_UNKNOWN,
  BUYING_RESTRICTED_BUT_RENTING_EASY,
  AFFORDABLE_AT_6500_NOT_AT_4500,
];
