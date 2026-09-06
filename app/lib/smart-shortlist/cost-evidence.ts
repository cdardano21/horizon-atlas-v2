import type { LocalCostRow, PrototypeCandidate } from "./cohort";

export type NormalizedAffordabilityStatus =
  | "COMFORTABLY_COMPATIBLE"
  | "PROBABLY_COMPATIBLE"
  | "BORDERLINE"
  | "PROBABLY_OVER_BUDGET"
  | "CLEARLY_OVER_BUDGET"
  | "INSUFFICIENT_INFORMATION";

export type LocalEvidenceAssessment = {
  reviewRequired: boolean;
  conflicts: readonly string[];
};

export function assessLocalCostEvidence(rows: readonly LocalCostRow[]): LocalEvidenceAssessment {
  const seen = new Map<string, string>();
  const conflicts = new Set<string>();

  for (const row of rows) {
    const scope = `${row.category}|${row.household}`;
    const value = `${row.currency}|${row.low}|${row.high}`;
    const existing = seen.get(scope);
    if (existing && existing !== value) conflicts.add(scope);
    else seen.set(scope, value);
  }

  return { reviewRequired: conflicts.size > 0, conflicts: [...conflicts].sort() };
}

export function normalizedAffordabilityStatus(candidate: PrototypeCandidate): NormalizedAffordabilityStatus {
  return candidate.normalizedAffordability.providerId
    && candidate.normalizedAffordability.index !== null
    && candidate.normalizedAffordability.band
    ? "BORDERLINE"
    : "INSUFFICIENT_INFORMATION";
}