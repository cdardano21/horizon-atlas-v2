/**
 * Small, explicit, generic normalization rules for converting raw Workbook v3.2
 * cell text into Intelligence v2 destination-fact types. Every function here is a
 * narrow deterministic rule over structured fields (never prose sentiment/NLP) and
 * never branches on a specific destination_key.
 */
import type {
  BeachAccessFact,
  LgbtqLegalProtectionFact,
  MountainOrSkiAccessFact,
  RetirementIncomeTreatmentFact,
  TriStateFact,
} from "../destination-fact-types";
import type { HealthcareMinimumStandard, SafetyMinimumStandard } from "../profile-types";
import type { MoneyRange } from "../result-types";

export interface WorkbookAdapterMappingError {
  readonly factPath: string;
  readonly sheet: string;
  readonly rawValue: string | null;
  readonly message: string;
}

const normalizeCell = (raw: string | null | undefined): string => (raw ?? "").trim();

/** The single canonical Yes/No/Unknown dialect already used by the workbook (e.g. HOUSING_PROPERTY.can_foreigners_buy). Blank -> UNKNOWN. Anything else -> UNKNOWN + a reported mapping error (never a silent guess). */
export function toTriState(raw: string | null | undefined, factPath: string, sheet: string, errors: WorkbookAdapterMappingError[]): TriStateFact {
  const value = normalizeCell(raw);
  if (value === "") return "UNKNOWN";
  const lowered = value.toLowerCase();
  if (lowered === "yes") return "YES";
  if (lowered === "no") return "NO";
  if (lowered === "unknown") return "UNKNOWN";
  errors.push({ factPath, sheet, rawValue: raw ?? null, message: `Invalid TriState token "${raw}" (expected Yes/No/Unknown/blank).` });
  return "UNKNOWN";
}

/** Strict membership check for workbook tokens that are already written in the exact engine-enum casing (e.g. beach_access = "NEARBY"). Blank -> fallback. Invalid -> fallback + reported mapping error. */
export function toStrictEnum<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
  factPath: string,
  sheet: string,
  errors: WorkbookAdapterMappingError[],
): T {
  const value = normalizeCell(raw);
  if (value === "") return fallback;
  if ((allowed as readonly string[]).includes(value)) return value as T;
  errors.push({ factPath, sheet, rawValue: raw ?? null, message: `Invalid enum token "${raw}" (expected one of ${allowed.join("|")}).` });
  return fallback;
}

/** Blank -> null. Non-numeric -> null + reported mapping error. Never coerces blank to 0. */
export function toNullableNumber(raw: string | null | undefined, factPath: string, sheet: string, errors: WorkbookAdapterMappingError[]): number | null {
  const value = normalizeCell(raw);
  if (value === "") return null;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  errors.push({ factPath, sheet, rawValue: raw ?? null, message: `Non-numeric value "${raw}" in a numeric field.` });
  return null;
}

/** Extracts the leading integer from strings like "90 in Schengen rolling 180-day framework". Null when no leading integer is present. */
export function parseLeadingInteger(raw: string | null | undefined): number | null {
  const match = normalizeCell(raw).match(/^(\d+)/);
  return match ? Number(match[1]) : null;
}

export const BEACH_ACCESS_TOKENS: readonly BeachAccessFact[] = ["DIRECT_ACCESS", "NEARBY", "NONE", "UNKNOWN"];
export const MOUNTAIN_OR_SKI_ACCESS_TOKENS: readonly MountainOrSkiAccessFact[] = ["SKI_RESORT_ACCESS", "MOUNTAIN_SCENIC_ONLY", "NONE", "UNKNOWN"];
export const RETIREMENT_INCOME_TREATMENT_TOKENS: readonly RetirementIncomeTreatmentFact[] = [
  "FAVORABLE",
  "TAXABLE",
  "PARTIALLY_TAXABLE",
  "EXEMPT",
  "TREATY_DEPENDENT",
  "SPECIAL_REGIME",
  "UNKNOWN",
];

// ---------------------------------------------------------------------------
// Healthcare standard (approved narrow rule: private_care_available only)
// ---------------------------------------------------------------------------

/**
 * Narrow, explicit, generic rule: only the structured `private_care_available`
 * Yes/No field is used. `public_access_foreigners` and `english_speaking_care`
 * are free narrative text in the current workbook (e.g. "Depends on
 * residency/registration") and are NOT structured enough to feed a deterministic
 * rule, so they are deliberately excluded. This rule can never produce
 * INTERNATIONAL_STANDARD - the facts available do not support claiming the
 * highest tier.
 */
export function normalizeHealthcareStandard(privateCareAvailable: string | null | undefined): HealthcareMinimumStandard | "UNKNOWN" {
  const value = normalizeCell(privateCareAvailable).toLowerCase();
  if (value === "yes") return "GOOD_PRIVATE_AVAILABLE";
  if (value === "no") return "BASIC_ACCESS";
  return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// LGBTQ+ legal protection status (approved narrow rule: legal_protections only)
// ---------------------------------------------------------------------------

const LGBTQ_CRIMINALIZED_PATTERN = /criminal/i;
const LGBTQ_NO_PROTECTIONS_PATTERN = /(no legal protections|not legally protected|lacks? legal protection)/i;
const LGBTQ_PROTECTIONS_IN_PLACE_PATTERN = /(legal protections?|legal recognition|legally protected|legally recognized)/i;

/**
 * Narrow, explicit, generic keyword rule over ONLY `legal_protections` (never
 * `social_acceptance`/`community_scene`/`nightlife_social`, which are not legal
 * safety). Deliberately conservative: any text not matching a known pattern is
 * UNKNOWN rather than guessed.
 */
export function normalizeLgbtqLegalProtectionStatus(legalProtections: string | null | undefined): LgbtqLegalProtectionFact {
  const value = normalizeCell(legalProtections);
  if (value === "") return "UNKNOWN";
  if (LGBTQ_CRIMINALIZED_PATTERN.test(value)) return "CRIMINALIZED";
  if (LGBTQ_NO_PROTECTIONS_PATTERN.test(value)) return "NO_LEGAL_PROTECTIONS";
  if (LGBTQ_PROTECTIONS_IN_PLACE_PATTERN.test(value)) return "LEGAL_PROTECTIONS_IN_PLACE";
  return "UNKNOWN";
}

// ---------------------------------------------------------------------------
// Safety standard (structured SAFETY_RISKS.severity aggregation only)
// ---------------------------------------------------------------------------

const SAFETY_SEVERITY_RANK: Readonly<Record<string, number>> = { low: 1, medium: 2, high: 3 };

/**
 * Worst-material-risk aggregation over structured `severity` tokens only (never
 * risk `summary` prose). No ranked risk at all -> UNKNOWN. Worst risk is "low"
 * -> HIGH_SAFETY_ONLY (only minor material risks). Worst risk is "medium" ->
 * MODERATE_OR_BETTER (ordinary/baseline). Worst risk is "high" OR an
 * unrecognized/invalid severity token -> UNKNOWN (conservative: the current
 * fact type has no explicit "fails safety" tier, so a genuinely material or
 * unclassifiable risk must not be dressed up as either positive tier).
 */
export function normalizeSafetyStandard(severities: ReadonlyArray<string | null | undefined>): SafetyMinimumStandard | "UNKNOWN" {
  if (severities.length === 0) return "UNKNOWN";
  let worstRank = 0;
  for (const raw of severities) {
    const key = normalizeCell(raw).toLowerCase();
    const rank = SAFETY_SEVERITY_RANK[key] ?? 3; // unrecognized token treated as worst-case, conservatively
    if (rank > worstRank) worstRank = rank;
  }
  if (worstRank >= 3) return "UNKNOWN";
  if (worstRank === 2) return "MODERATE_OR_BETTER";
  return "HIGH_SAFETY_ONLY";
}

// ---------------------------------------------------------------------------
// Household size (approved mapping: single -> 1, couple -> 2 only)
// ---------------------------------------------------------------------------

const HOUSEHOLD_TYPE_SIZE_MAP: Readonly<Record<string, number>> = { single: 1, couple: 2 };

/**
 * All COST_OF_LIVING rows for the destination must agree on one household_type
 * for the mapping to be confident. Multiple distinct household_type values, or
 * a household_type outside the approved {single, couple} table, default to 1
 * (never an invented family-size multiplier) with a reported mapping error.
 */
export function normalizeHouseholdSize(
  householdTypes: ReadonlyArray<string | null | undefined>,
  sheet: string,
  errors: WorkbookAdapterMappingError[],
): number {
  const distinct = Array.from(new Set(householdTypes.map((h) => normalizeCell(h).toLowerCase()).filter(Boolean)));
  if (distinct.length === 1) {
    const mapped = HOUSEHOLD_TYPE_SIZE_MAP[distinct[0]];
    if (mapped !== undefined) return mapped;
    errors.push({ factPath: "cost.householdSizeAssumedForEstimate", sheet, rawValue: distinct[0], message: `Unrecognized household_type "${distinct[0]}"; defaulting to 1.` });
    return 1;
  }
  errors.push({
    factPath: "cost.householdSizeAssumedForEstimate",
    sheet,
    rawValue: distinct.join(",") || null,
    message: distinct.length === 0 ? "No household_type present; defaulting to 1." : `Multiple distinct household_type values present (${distinct.join(", ")}); defaulting to 1.`,
  });
  return 1;
}

// ---------------------------------------------------------------------------
// Monthly cost range aggregation
// ---------------------------------------------------------------------------

export interface CostOfLivingRowInput {
  readonly householdType: string | null;
  readonly lifestyleTier: string | null;
  readonly category: string | null;
  readonly monthlyLow: string | null;
  readonly monthlyHigh: string | null;
  readonly currency: string | null;
}

/**
 * Groups rows by (household_type, lifestyle_tier). Only sums when the
 * destination's rows collapse to exactly one such group with distinct
 * categories and a single currency - ambiguous/duplicate/multi-currency data
 * returns null (UNKNOWN) rather than guessing which rows to sum.
 */
export function normalizeMonthlyCostRange(rows: readonly CostOfLivingRowInput[], sheet: string, errors: WorkbookAdapterMappingError[]): MoneyRange | null {
  if (rows.length === 0) return null;

  const groupKey = (r: CostOfLivingRowInput) => `${normalizeCell(r.householdType).toLowerCase()}::${normalizeCell(r.lifestyleTier).toLowerCase()}`;
  const groups = new Map<string, CostOfLivingRowInput[]>();
  for (const row of rows) {
    const key = groupKey(row);
    const arr = groups.get(key) ?? [];
    arr.push(row);
    groups.set(key, arr);
  }
  if (groups.size !== 1) {
    errors.push({
      factPath: "cost.estimatedMonthlyCostRange",
      sheet,
      rawValue: null,
      message: `COST_OF_LIVING rows span ${groups.size} distinct household_type/lifestyle_tier combinations; cannot safely select one range.`,
    });
    return null;
  }

  const [group] = Array.from(groups.values());
  const categories = group.map((r) => normalizeCell(r.category).toLowerCase()).filter(Boolean);
  if (new Set(categories).size !== categories.length) {
    errors.push({ factPath: "cost.estimatedMonthlyCostRange", sheet, rawValue: null, message: "Duplicate category rows within the selected COST_OF_LIVING group; cannot safely sum." });
    return null;
  }

  const currencies = new Set(group.map((r) => normalizeCell(r.currency)).filter(Boolean));
  if (currencies.size !== 1) {
    errors.push({ factPath: "cost.estimatedMonthlyCostRange", sheet, rawValue: null, message: `COST_OF_LIVING rows use ${currencies.size} distinct currencies; cannot safely sum.` });
    return null;
  }

  let low = 0;
  let high = 0;
  let sawAnyNumeric = false;
  for (const row of group) {
    const l = toNullableNumber(row.monthlyLow, "cost.estimatedMonthlyCostRange", sheet, errors);
    const h = toNullableNumber(row.monthlyHigh, "cost.estimatedMonthlyCostRange", sheet, errors);
    if (l !== null) {
      low += l;
      sawAnyNumeric = true;
    }
    if (h !== null) {
      high += h;
      sawAnyNumeric = true;
    }
  }
  if (!sawAnyNumeric) return null;

  const [currencyCode] = Array.from(currencies);
  return { low, high, currencyCode };
}

// ---------------------------------------------------------------------------
// VISA_RESIDENCY multi-row selection (generic, stay_mode_key driven)
// ---------------------------------------------------------------------------

/** Workbook STAY_MODES catalog order (a fixed, generic, destination-agnostic taxonomy - see STAY_MODES sheet). UNSURE is never a meaningful anchor for either tourist or long-stay facts. */
const TOURIST_ROW_STAY_MODE_PRIORITY: readonly string[] = ["SHORT_1_3_MONTHS", "EXTENDED_3_12_MONTHS"];
const LONG_STAY_ROW_STAY_MODE_PRIORITY: readonly string[] = ["LONG_TERM_PERMANENT", "EXTENDED_3_12_MONTHS"];

export function selectRowByStayModePriority<T extends { stay_mode_key?: string | null }>(rows: readonly T[], priority: readonly string[]): T | null {
  for (const key of priority) {
    const match = rows.find((row) => normalizeCell(row.stay_mode_key) === key);
    if (match) return match;
  }
  return null;
}

export function selectTouristRow<T extends { stay_mode_key?: string | null }>(rows: readonly T[]): T | null {
  return selectRowByStayModePriority(rows, TOURIST_ROW_STAY_MODE_PRIORITY);
}

export function selectLongStayRow<T extends { stay_mode_key?: string | null }>(rows: readonly T[]): T | null {
  return selectRowByStayModePriority(rows, LONG_STAY_ROW_STAY_MODE_PRIORITY);
}

// ---------------------------------------------------------------------------
// Small VISA_RESIDENCY narrative presence rules (approved, narrow, generic)
// ---------------------------------------------------------------------------

const BLANK_OR_NA_TOKENS = new Set(["", "n/a", "n/a domestic", "none"]);

/**
 * Presence-only rule: a long-stay/residence visa concept exists if `visa_type`
 * is populated and is not one of the workbook's own blank/N-A/domestic markers.
 * This deliberately does not attempt to interpret the visa_type's *content* -
 * only whether the concept is documented at all - so it generalizes safely to
 * any destination using the same workbook conventions.
 */
export function normalizeExtendedStayVisaAvailability(visaType: string | null | undefined): TriStateFact {
  const value = normalizeCell(visaType).toLowerCase();
  if (BLANK_OR_NA_TOKENS.has(value)) return "UNKNOWN";
  return "YES";
}

/**
 * Same presence-only pattern applied to `permanent_residency_path`. Blank or
 * one of the workbook's own N/A markers -> UNKNOWN (the concept is not
 * documented, which is different from a confirmed "no path exists").
 */
export function normalizePermanentResidencyPathAvailability(permanentResidencyPath: string | null | undefined): TriStateFact {
  const value = normalizeCell(permanentResidencyPath).toLowerCase();
  if (BLANK_OR_NA_TOKENS.has(value)) return "UNKNOWN";
  return "YES";
}

/** touristEntryAllowed DERIVE rule: a VISA_RESIDENCY row exists for the destination with a populated visa_free_days field. */
export function normalizeTouristEntryAllowed(visaFreeDays: string | null | undefined): TriStateFact {
  return normalizeCell(visaFreeDays) === "" ? "UNKNOWN" : "YES";
}
