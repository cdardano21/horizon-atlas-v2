import type { PersistedDestinationReadResult } from "../app/lib/persistence/v31/types";
import type { NormalizedPersistedDestinationBundle } from "../app/lib/persistence/v31/materialize-stored-destination-state";

export type HarnessBundleSummary = {
  readonly destination: string;
  readonly outcome: "SUCCESS" | "FAILED";
  readonly root: Record<string, unknown> | null;
  readonly profile: Record<string, unknown> | null;
  readonly presenceModules: readonly string[] | null;
  readonly failureReason: string | null;
  readonly failureModule: string | null;
};

const BUNDLE_MODULE_KEYS: readonly string[] = [
  "facts",
  "scores",
  "neighborhoods",
  "places",
  "resources",
  "media",
  "costOfLiving",
  "climateMonthly",
  "housing",
  "propertyResources",
  "healthcare",
  "visaResidency",
  "taxesFinance",
  "lgbtqInclusivity",
  "safetyRisks",
  "transportation",
  "remoteWork",
  "languageIntegration",
  "pets",
  "familyEducation",
  "communitySocial",
  "accessibility",
  "bureaucracySetup",
  "workBusiness",
  "retirementAging",
  "lifestyleLaws",
  "realityCheck",
  "moveChecklist",
  "environmentQuality",
  "dailyLifePracticality",
  "eventsSeasonality",
  "sources",
];

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function collectPresenceModules(bundle: NormalizedPersistedDestinationBundle): readonly string[] {
  return BUNDLE_MODULE_KEYS.filter((moduleKey) => {
    const value = (bundle as Record<string, unknown>)[moduleKey];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== null && value !== undefined;
  });
}

export function summarizePersistedBundleResult(destination: string, result: PersistedDestinationReadResult): HarnessBundleSummary {
  if (result.outcome === "SUCCESS") {
    return {
      destination,
      outcome: "SUCCESS",
      root: toRecord(result.bundle.identity),
      profile: toRecord(result.bundle.editorial),
      presenceModules: collectPresenceModules(result.bundle),
      failureReason: null,
      failureModule: null,
    };
  }

  return {
    destination,
    outcome: "FAILED",
    root: null,
    profile: null,
    presenceModules: null,
    failureReason: result.failure.reason,
    failureModule: result.failure.module ?? null,
  };
}
