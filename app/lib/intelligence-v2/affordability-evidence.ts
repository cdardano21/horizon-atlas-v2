import { classifyAffordability } from "../smart-shortlist/owned-affordability";

/** Dormant U3-R5 qualification proof; does not replace live derivation. */
export interface HouseholdEstimateRow {
  destination_key: string;
  household_type: string;
  category: string;
  lifestyle_tier: string;
  stay_mode_key: string;
  currency: string;
  monthly_low: number;
  monthly_high: number;
  included_notes: string;
  source_name?: string | null;
  source_url?: string | null;
  verified: boolean;
  verified_at?: string | null;
}
export type EstimateQualification =
  | { status: "QUALIFIED"; midpoint: number; confidence: "VERIFIED_ESTIMATE" | "EDITORIAL_PLANNING_ESTIMATE" }
  | { status: "UNKNOWN"; reason: string };

/** Conservative recognition of current explicit workbook wording, never inferred costs. */
export function hasCompleteEstimateAssumptions(notes: string): boolean {
  const parts = notes.toLowerCase().split(/excludes?\b/);
  if (parts.length !== 2) return false;
  const [included, excluded] = parts;
  return [/modern (?:1br|1-bedroom|one-bedroom)/, /utilities/, /groceries/, /ordinary local transport/, /moderate dining/, /entertainment/].every((pattern) => pattern.test(included))
    && [/healthcare/, /taxes/, /international travel/, /major medical (?:expenses|costs)/, /luxury spending/].every((pattern) => pattern.test(excluded));
}
export function qualifyHouseholdEstimate(
  rows: readonly HouseholdEstimateRow[], destinationKey: string, household: "single" | "couple",
): EstimateQualification {
  const matching = rows.filter((row) => row.destination_key === destinationKey && row.household_type === household
    && row.category === "u3_r5_total_monthly_estimate" && row.lifestyle_tier === "comfortable" && row.stay_mode_key === "RELOCATE");
  if (matching.length !== 1) return { status: "UNKNOWN", reason: "Missing or ambiguous household total" };
  const row = matching[0];
  if (row.currency !== "USD" || !Number.isFinite(row.monthly_low) || !Number.isFinite(row.monthly_high)
    || row.monthly_low <= 0 || row.monthly_high < row.monthly_low) return { status: "UNKNOWN", reason: "Invalid currency or numeric range" };
  if (!hasCompleteEstimateAssumptions(row.included_notes)) return { status: "UNKNOWN", reason: "Incomplete explicit cost assumptions" };
  // Approved policy: attribution and a source URL are required for a confirmed comparison.
  if (!row.source_name?.trim()) return { status: "UNKNOWN", reason: "Missing provenance" };
  if (!row.source_url?.trim()) return { status: "UNKNOWN", reason: "Editorial estimate without source URL requires verification" };
  if (row.source_url) {
    try { if (!/^https?:$/.test(new URL(row.source_url).protocol)) throw new Error(); }
    catch { return { status: "UNKNOWN", reason: "Invalid provenance URL" }; }
  }
  if (row.verified !== true && row.verified !== false) return { status: "UNKNOWN", reason: "Missing verification status" };
  if (row.verified && (!row.verified_at || !Number.isFinite(Date.parse(row.verified_at)))) return { status: "UNKNOWN", reason: "Missing verification date" };
  const midpoint = row.monthly_low / 2 + row.monthly_high / 2;
  if (!Number.isFinite(midpoint) || midpoint <= 0) return { status: "UNKNOWN", reason: "Invalid midpoint" };
  return { status: "QUALIFIED", midpoint, confidence: row.verified ? "VERIFIED_ESTIMATE" : "EDITORIAL_PLANNING_ESTIMATE" };
}
export function evaluateHouseholdEstimate(rows: readonly HouseholdEstimateRow[], destinationKey: string, household: "single" | "couple", budgetUsd: number) {
  const qualification = qualifyHouseholdEstimate(rows, destinationKey, household);
  if (qualification.status === "UNKNOWN") return { group: "NEEDS_VERIFICATION" as const, qualification };
  const decision = classifyAffordability({ budgetUsd, estimatedMonthlyUsd: qualification.midpoint });
  const group = decision.state === "WITHIN_BUDGET" ? "MEETS_FILTERS" : decision.state === "CLOSE_TO_BUDGET" ? "NEEDS_VERIFICATION" : "EXCLUDED";
  return { group, qualification };
}
