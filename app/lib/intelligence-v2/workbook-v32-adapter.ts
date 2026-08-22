/**
 * Workbook v3.2 -> Intelligence v2 destination-facts adapter (LISBON-PROVEN,
 * destination-generic). Pure, read-only mapping: reads an already-parsed
 * canonical destination bundle (from workbook-v31-deterministic-core.ts, the
 * repo's existing deterministic parser) and produces the exact destination-fact
 * shape the four Intelligence v2 evaluators consume.
 *
 * This module never:
 * - parses XLSX itself (reuses the existing deterministic parser's output)
 * - branches on a specific destination_key
 * - runs any evaluator (eligibility/affordability/lifestyle/financial/orchestrator)
 * - injects UserProfileV2-side concepts (budget, stay duration, activity mode, etc.)
 */
import type {
  DeterministicV31CanonicalDestination,
  DeterministicV31CanonicalHousingState,
  DeterministicV31CanonicalTaxFinanceState,
  DeterministicV31CanonicalVisaResidencyState,
  DeterministicV31WorkbookImport,
} from "../workbook-v31-deterministic-core";
import type { SyntheticDestinationFixture } from "./destination-fact-types";
import { ENUM_DERIVED_DIMENSION_KEYS, LIFESTYLE_DIMENSION_KEYS } from "./lifestyle-scoring-policy";
import {
  BEACH_ACCESS_TOKENS,
  MOUNTAIN_OR_SKI_ACCESS_TOKENS,
  RETIREMENT_INCOME_TREATMENT_TOKENS,
  normalizeHealthcareStandard,
  normalizeHouseholdSize,
  normalizeLgbtqLegalProtectionStatus,
  normalizeMonthlyCostRange,
  normalizePermanentResidencyPathAvailability,
  normalizeExtendedStayVisaAvailability,
  normalizeSafetyStandard,
  normalizeTouristEntryAllowed,
  parseLeadingInteger,
  selectLongStayRow,
  selectTouristRow,
  toNullableNumber,
  toStrictEnum,
  toTriState,
  type WorkbookAdapterMappingError,
} from "./workbook-v32-normalization";

export type { WorkbookAdapterMappingError } from "./workbook-v32-normalization";

/** The exact destination-fact shape consumed by the four Intelligence v2 evaluators (SyntheticDestinationFixture in destination-fact-types.ts is that shape - "Synthetic" refers to its test-fixture origin, not a restriction on real data). */
export type IntelligenceV2DestinationFacts = SyntheticDestinationFixture;

export interface WorkbookAdapterResult {
  readonly facts: IntelligenceV2DestinationFacts;
  readonly mappingErrors: readonly WorkbookAdapterMappingError[];
}

// ---------------------------------------------------------------------------
// Narrow, additive v3.2 column extensions.
// The canonical row interfaces in workbook-v31-deterministic-core.ts predate the
// v3.2 columns; the parser itself is header-name-driven and already carries
// these fields through at runtime (buildRecordFromRow), so this is a type-only
// augmentation - no parser behavior changes.
// ---------------------------------------------------------------------------

interface VisaResidencyV32Columns {
  remote_work_legal_tourist_status?: string | null;
  digital_nomad_visa_available?: string | null;
  dependent_inclusion_supported?: string | null;
  retirement_visa_program_available?: string | null;
}
type VisaResidencyRowV32 = DeterministicV31CanonicalVisaResidencyState & VisaResidencyV32Columns;

interface HousingV32Columns {
  property_purchase_grants_residency_path?: string | null;
  property_tax_annual_rate_percent?: string | null;
  purchase_transfer_tax_percent?: string | null;
}
type HousingRowV32 = DeterministicV31CanonicalHousingState & HousingV32Columns;

interface TaxFinanceV32Columns {
  tax_residency_threshold_days?: string | null;
  pension_treatment?: string | null;
  social_security_treatment?: string | null;
  ira_treatment?: string | null;
  "401k_treatment"?: string | null;
  us_tax_treaty_in_effect?: string | null;
  foreign_tax_credit_available?: string | null;
  wealth_tax_applicable?: string | null;
}
type TaxFinanceRowV32 = DeterministicV31CanonicalTaxFinanceState & TaxFinanceV32Columns;

/** Non-enum-derived Layer 3 dimension keys eligible for a direct DESTINATION_SCORES exact-key match (the 4 enum-derived keys are computed by the scorer itself from hardGates and must never be duplicated here). */
const DIRECT_SCORE_DIMENSION_KEYS: ReadonlySet<string> = new Set(LIFESTYLE_DIMENSION_KEYS.filter((key) => !ENUM_DERIVED_DIMENSION_KEYS.has(key)));

/**
 * Scopes every module array to the requested destination_key, defensively,
 * even though the upstream parser already scopes rows by destination_key.
 * This is the adapter's own explicit no-cross-destination-contamination
 * guarantee - it does not trust the input to already be correctly scoped.
 */
function scopeRowsToDestination<T extends { destination_key?: string | null }>(rows: readonly T[] | undefined, destinationKey: string): T[] {
  return (rows ?? []).filter((row) => row.destination_key === destinationKey);
}

export function adaptWorkbookDestinationToIntelligenceV2Facts(canonical: DeterministicV31CanonicalDestination): WorkbookAdapterResult {
  const errors: WorkbookAdapterMappingError[] = [];
  const destinationKey = canonical.identity.destinationKey;

  const visaRows = scopeRowsToDestination(canonical.visaResidency as VisaResidencyRowV32[], destinationKey);
  const housingRow = scopeRowsToDestination(canonical.housing as HousingRowV32[], destinationKey)[0] ?? null;
  const taxRow = scopeRowsToDestination(canonical.taxesFinance as TaxFinanceRowV32[], destinationKey)[0] ?? null;
  const healthcareRow = scopeRowsToDestination(canonical.healthcare, destinationKey)[0] ?? null;
  const lgbtqRow = scopeRowsToDestination(canonical.lgbtqInclusivity, destinationKey)[0] ?? null;
  const safetyRows = scopeRowsToDestination(canonical.safetyRisks, destinationKey);
  const costRows = scopeRowsToDestination(canonical.costOfLiving, destinationKey);
  const scoreRows = scopeRowsToDestination(canonical.scores, destinationKey);

  const touristRow = selectTouristRow(visaRows);
  const longStayRow = selectLongStayRow(visaRows);

  const beachAccessRaw = canonical.destinationRow?.beach_access ?? null;
  const mountainOrSkiAccessRaw = canonical.destinationRow?.mountain_or_ski_access ?? null;
  const countryCodeRaw = canonical.destinationRow?.country_code ?? null;

  const facts: IntelligenceV2DestinationFacts = {
    id: destinationKey,
    displayName: canonical.identity.name ?? destinationKey,
    notes: "Real workbook-derived fixture (Workbook v3.2 -> Intelligence v2 adapter).",
    countryCode: countryCodeRaw && countryCodeRaw.trim() !== "" ? countryCodeRaw : null,

    entryAndStay: {
      touristEntryAllowed: normalizeTouristEntryAllowed(touristRow?.visa_free_days ?? null),
      touristStayLimitDays: touristRow ? parseLeadingInteger(touristRow.visa_free_days) : null,
      extendedStayOrLongStayVisaAvailable: normalizeExtendedStayVisaAvailability(longStayRow?.visa_type ?? null),
      permanentResidencyPathAvailable: normalizePermanentResidencyPathAvailability(longStayRow?.permanent_residency_path ?? null),
      retirementVisaProgramAvailable: toTriState(longStayRow?.retirement_visa_program_available ?? null, "entryAndStay.retirementVisaProgramAvailable", "VISA_RESIDENCY", errors),
      remoteWorkOrDigitalNomadVisaAvailable: toTriState(longStayRow?.digital_nomad_visa_available ?? null, "entryAndStay.remoteWorkOrDigitalNomadVisaAvailable", "VISA_RESIDENCY", errors),
      remoteWorkLegalUnderTouristStatus: toTriState(touristRow?.remote_work_legal_tourist_status ?? null, "entryAndStay.remoteWorkLegalUnderTouristStatus", "VISA_RESIDENCY", errors),
      foreignPropertyPurchaseAllowed: toTriState(housingRow?.can_foreigners_buy ?? null, "entryAndStay.foreignPropertyPurchaseAllowed", "HOUSING_PROPERTY", errors),
      propertyPurchaseGrantsResidencyPath: toTriState(housingRow?.property_purchase_grants_residency_path ?? null, "entryAndStay.propertyPurchaseGrantsResidencyPath", "HOUSING_PROPERTY", errors),
      spouseOrDependentInclusionSupported: toTriState(longStayRow?.dependent_inclusion_supported ?? null, "entryAndStay.spouseOrDependentInclusionSupported", "VISA_RESIDENCY", errors),
    },

    hardGates: {
      beachAccess: toStrictEnum(beachAccessRaw, BEACH_ACCESS_TOKENS, "UNKNOWN", "hardGates.beachAccess", "DESTINATIONS", errors),
      mountainOrSkiAccess: toStrictEnum(mountainOrSkiAccessRaw, MOUNTAIN_OR_SKI_ACCESS_TOKENS, "UNKNOWN", "hardGates.mountainOrSkiAccess", "DESTINATIONS", errors),
      healthcareStandard: normalizeHealthcareStandard(healthcareRow?.private_care_available ?? null),
      safetyStandard: normalizeSafetyStandard(safetyRows.map((row) => row.severity)),
      lgbtqLegalProtectionStatus: normalizeLgbtqLegalProtectionStatus(lgbtqRow?.legal_protections ?? null),
    },

    cost: {
      estimatedMonthlyCostRange: normalizeMonthlyCostRange(
        costRows.map((row) => ({
          householdType: row.household_type,
          lifestyleTier: row.lifestyle_tier,
          category: row.category,
          monthlyLow: row.monthly_low,
          monthlyHigh: row.monthly_high,
          currency: row.currency,
        })),
        "COST_OF_LIVING",
        errors,
      ),
      householdSizeAssumedForEstimate: normalizeHouseholdSize(
        costRows.map((row) => row.household_type),
        "COST_OF_LIVING",
        errors,
      ),
    },

    financial: {
      taxResidencyTriggerDays: toNullableNumber(taxRow?.tax_residency_threshold_days ?? null, "financial.taxResidencyTriggerDays", "TAXES_FINANCE", errors),
      pensionTreatment: toStrictEnum(taxRow?.pension_treatment ?? null, RETIREMENT_INCOME_TREATMENT_TOKENS, "UNKNOWN", "financial.pensionTreatment", "TAXES_FINANCE", errors),
      socialSecurityTreatment: toStrictEnum(taxRow?.social_security_treatment ?? null, RETIREMENT_INCOME_TREATMENT_TOKENS, "UNKNOWN", "financial.socialSecurityTreatment", "TAXES_FINANCE", errors),
      iraTreatment: toStrictEnum(taxRow?.ira_treatment ?? null, RETIREMENT_INCOME_TREATMENT_TOKENS, "UNKNOWN", "financial.iraTreatment", "TAXES_FINANCE", errors),
      retirementAccount401kTreatment: toStrictEnum(taxRow?.["401k_treatment"] ?? null, RETIREMENT_INCOME_TREATMENT_TOKENS, "UNKNOWN", "financial.retirementAccount401kTreatment", "TAXES_FINANCE", errors),
      usTaxTreatyInEffect: toTriState(taxRow?.us_tax_treaty_in_effect ?? null, "financial.usTaxTreatyInEffect", "TAXES_FINANCE", errors),
      foreignTaxCreditAvailable: toTriState(taxRow?.foreign_tax_credit_available ?? null, "financial.foreignTaxCreditAvailable", "TAXES_FINANCE", errors),
      wealthTaxApplicable: toTriState(taxRow?.wealth_tax_applicable ?? null, "financial.wealthTaxApplicable", "TAXES_FINANCE", errors),
      propertyTaxAnnualRatePercent: toNullableNumber(housingRow?.property_tax_annual_rate_percent ?? null, "financial.propertyTaxAnnualRatePercent", "HOUSING_PROPERTY", errors),
      propertyPurchaseOrTransferTaxPercent: toNullableNumber(housingRow?.purchase_transfer_tax_percent ?? null, "financial.propertyPurchaseOrTransferTaxPercent", "HOUSING_PROPERTY", errors),
      // No workbook column exists for this fact in v3.2 (explicitly deferred by the field map) - always null/UNKNOWN, never derived.
      buyVsRentBreakEvenYears: null,
    },

    lifestyleDimensions: {
      dimensionValues: buildDimensionValues(scoreRows, errors),
    },
  };

  return { facts, mappingErrors: errors };
}

function buildDimensionValues(
  scoreRows: readonly DeterministicV31CanonicalDestination["scores"][number][],
  errors: WorkbookAdapterMappingError[],
): Record<string, number> {
  const values: Record<string, number> = {};
  for (const row of scoreRows) {
    const scoreKey = (row.score_key ?? row.scoreKey ?? "").trim();
    if (!scoreKey || !DIRECT_SCORE_DIMENSION_KEYS.has(scoreKey)) continue; // exact-match only; never alias/invent a mapping
    const numeric = toNullableNumber(row.score_value ?? row.scoreValue ?? null, `lifestyleDimensions.dimensionValues.${scoreKey}`, "DESTINATION_SCORES", errors);
    if (numeric !== null) values[scoreKey] = numeric;
  }
  return values;
}

/** Convenience wrapper: locates a destination by key inside an already-loaded deterministic workbook import and adapts it. Does not parse XLSX itself. */
export function buildIntelligenceV2FactsFromWorkbookImport(
  workbookImport: Pick<DeterministicV31WorkbookImport, "canonicalDestinations">,
  destinationKey: string,
): WorkbookAdapterResult | null {
  const canonical = (workbookImport.canonicalDestinations ?? []).find((destination) => destination.identity.destinationKey === destinationKey);
  if (!canonical) return null;
  return adaptWorkbookDestinationToIntelligenceV2Facts(canonical);
}
