export interface PremiumReadinessChecks {
  readonly scope: boolean;
  readonly identity: boolean;
  readonly provenance: boolean;
  readonly lifestyle: boolean;
  readonly namedPlacesAndResources: boolean;
  readonly links: boolean;
  readonly media: boolean;
  readonly semanticCopy: boolean;
  readonly internalLanguage: boolean;
  readonly moduleCounts: boolean;
  readonly unknownPreserved: boolean;
  readonly statusIntent: boolean;
  readonly replayAuthorization: boolean;
}

export interface PremiumReadinessResult {
  readonly status: "PREMIUM_READY_FOR_CODEX" | "BLOCKED";
  readonly blockers: readonly (keyof PremiumReadinessChecks)[];
}

export function evaluatePremiumReadiness(checks: PremiumReadinessChecks): PremiumReadinessResult {
  const blockers = (Object.keys(checks) as (keyof PremiumReadinessChecks)[]).filter((key) => !checks[key]);
  return { status: blockers.length === 0 ? "PREMIUM_READY_FOR_CODEX" : "BLOCKED", blockers };
}
