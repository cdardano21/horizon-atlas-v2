// Deterministic, destination-agnostic manifest authorization for a destination's FIRST import.
// Owns no diffing logic - it only decides which non-keyed REPLACE_MODULE entries a first-time
// import may authorize automatically, then hands that manifest to the existing, untouched
// interpretOperationManifest()/buildDestinationPlan() pipeline exactly like a hand-written manifest
// would be.
import type { DeterministicV31CanonicalDestination } from "../../workbook-v31-deterministic-core";
import type { CanonicalDestinationKey, OperationManifest, ReplaceModuleExecutionModuleKey, StoredDestinationState } from "./types";

// The same 20 modules the write port persists via REPLACE_MODULE (see write-port.ts's
// REPLACE_MODULE_TABLE_CONFIG) - kept as an independent literal list here on purpose so a change
// to one does not silently change the other without a corresponding code review.
const REPLACE_MODULE_ELIGIBLE_MODULES: readonly ReplaceModuleExecutionModuleKey[] = [
  "costOfLiving",
  "climateMonthly",
  "housing",
  "healthcare",
  "visaResidency",
  "taxesFinance",
  "safetyRisks",
  "transportation",
  "remoteWork",
  "realityCheck",
  "lgbtqInclusivity",
  "languageIntegration",
  "pets",
  "familyEducation",
  "communitySocial",
  "accessibility",
  "bureaucracySetup",
  "workBusiness",
  "retirementAging",
  "lifestyleLaws",
];

/**
 * Builds the manifest entries a destination's first import may authorize automatically: for each
 * non-keyed module, ONLY if the destination currently has zero persisted rows for that module AND
 * the workbook has real (non-empty) content for it, authorize a REPLACE_MODULE entry. A module
 * that already has ANY persisted data is never touched here - replacing existing content still
 * requires a deliberate, hand-written manifest entry. This never produces CLEAR_FIELD or
 * DELETE_CHILD entries; those remain exclusively manual and explicit. Makes no assumptions about
 * which destination_key this is - it is safe to call for any destination.
 */
export function buildFirstTimeModuleAuthorizationManifest(
  destinationKey: CanonicalDestinationKey,
  canonicalDestination: DeterministicV31CanonicalDestination,
  storedDestinationState: StoredDestinationState,
): OperationManifest {
  const entries = REPLACE_MODULE_ELIGIBLE_MODULES.filter((module) => {
    const currentValue = (storedDestinationState as unknown as Record<string, readonly unknown[]>)[module] ?? [];
    const incomingValue = (canonicalDestination as unknown as Record<string, readonly unknown[]>)[module] ?? [];
    return currentValue.length === 0 && incomingValue.length > 0;
  }).map((module) => ({
    destinationKey,
    operation: "REPLACE_MODULE" as const,
    targetModule: module,
    reason: "first-time-import-auto-authorization",
  }));

  return { entries };
}
