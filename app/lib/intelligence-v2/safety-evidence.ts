/** Dormant screening contract. No universal crime score or personal-safety guarantee. */
export type SafetyClassification = "HIGH_SAFETY_ONLY" | "MODERATE_OR_BETTER" | "ELEVATED_RISK" | "NO_QUALIFYING_SAFETY_EVIDENCE" | "UNKNOWN";
export interface SafetyEvidenceRow {
  destinationKey: string;
  /** Existing workbook risk_type, not an invented risk taxonomy. */
  riskType: string;
  severity: string | null;
  geographicScope: "DESTINATION" | "REGION" | "COUNTRY" | "UNKNOWN";
  appliesToDestination: boolean | null;
  sourceName: string;
  sourceUrl: string;
  sourceAuthorityType: "GOVERNMENT" | "PUBLIC_SAFETY_EMERGENCY_AUTHORITY" | "INTERGOVERNMENTAL_MULTILATERAL_AUTHORITY" | "REGIONAL_LOCAL_PUBLIC_AGENCY" | "OTHER" | "UNKNOWN";
  evidenceDate: string | null;
  verifiedAt: string | null;
  verified: boolean;
  conflicting?: boolean;
  unresolved?: boolean;
  notes?: string;
}
export interface SafetyEvidencePolicy {
  /** Keep existing seasonal-hazard and crime dimensions distinct. */
  relevantRiskTypes: readonly string[];
}
export const MAX_SAFETY_EVIDENCE_AGE_MONTHS = 12;
export const ACCEPTED_SAFETY_AUTHORITY_TYPES: readonly SafetyEvidenceRow["sourceAuthorityType"][] = [
  "GOVERNMENT", "PUBLIC_SAFETY_EMERGENCY_AUTHORITY",
  "INTERGOVERNMENTAL_MULTILATERAL_AUTHORITY", "REGIONAL_LOCAL_PUBLIC_AGENCY",
];
function usable(row: SafetyEvidenceRow, now: Date): boolean {
  if (!row.verified || row.conflicting || row.unresolved || row.appliesToDestination !== true
    || row.geographicScope === "UNKNOWN" || !row.sourceName.trim()
    || !ACCEPTED_SAFETY_AUTHORITY_TYPES.includes(row.sourceAuthorityType)) return false;
  const evidence = Date.parse(row.evidenceDate ?? "");
  const reviewed = Date.parse(row.verifiedAt ?? "");
  const cutoff = new Date(now);
  const day = cutoff.getUTCDate();
  cutoff.setUTCDate(1);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - MAX_SAFETY_EVIDENCE_AGE_MONTHS);
  cutoff.setUTCDate(Math.min(day, new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate()));
  if (!Number.isFinite(evidence) || !Number.isFinite(reviewed) || evidence > reviewed
    || reviewed > now.getTime() || reviewed < cutoff.getTime() || evidence < cutoff.getTime()) return false;
  try { return /^https?:$/.test(new URL(row.sourceUrl).protocol); } catch { return false; }
}
export function classifySafetyEvidence(rows: readonly SafetyEvidenceRow[], destinationKey: string, policy: SafetyEvidencePolicy, now = new Date()): SafetyClassification {
  if (!destinationKey || !policy.relevantRiskTypes.length) return "UNKNOWN";
  const owned = rows.filter((row) => row.destinationKey === destinationKey);
  const relevant = owned.filter((row) => policy.relevantRiskTypes.includes(row.riskType));
  const normalized = relevant.map((row) => ({ row, token: row.severity?.trim().toLowerCase(), usable: usable(row, now) }));
  // A substantiated adverse row dominates; unresolved rows never improve the result.
  if (normalized.some((item) => item.usable && item.token === "elevated_risk")) return "ELEVATED_RISK";
  if (!relevant.length || owned.length !== relevant.length
    || policy.relevantRiskTypes.some((type) => !relevant.some((row) => row.riskType === type))
    || normalized.some((item) => !item.usable || !["low", "medium"].includes(item.token ?? ""))) return "UNKNOWN";
  // Contradictory severity assertions for the same dimension require review.
  if (policy.relevantRiskTypes.some((type) => new Set(normalized.filter((item) => item.row.riskType === type).map((item) => item.token)).size > 1)) return "UNKNOWN";
  return normalized.some((item) => item.token === "medium") ? "MODERATE_OR_BETTER" : "HIGH_SAFETY_ONLY";
}
// NO_QUALIFYING_SAFETY_EVIDENCE is reserved for an explicit reviewed evidence-gap
// assessment; absence of rows is UNKNOWN and is never evidence that a place is unsafe.
