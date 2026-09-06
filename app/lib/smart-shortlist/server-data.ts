import path from "node:path";
import { EXPANSION_WORKBOOK_REGISTRY } from "../expansion-workbook-registry";
import type { DeterministicV31CanonicalLifestyleFeature } from "../workbook-v31-deterministic-core";
import { loadFrozenWorkbookV31DeterministicImport } from "../workbook-v31-deterministic-core";
import { buildIntelligenceV2FactsFromWorkbookImport } from "../intelligence-v2/workbook-v32-adapter";
import { adaptPersistedDestinationBundleToIntelligenceV2Facts } from "../intelligence-v2/persisted-bundle-adapter";
import { createInMemoryPersistedDestinationReadPort } from "../persistence/v31/in-memory-persisted-destination-read-port";
import { loadNormalizedPersistedDestinationBundle } from "../persistence/v31/load-normalized-persisted-destination-bundle";
import { mapCanonicalDestinationToStoredState } from "../persistence/v31/map-canonical-destination-to-stored-state";
import type { CanonicalDestinationKey, DestinationId, ResolvedDestinationIdentity } from "../persistence/v31/types";
import { smartShortlistCandidates } from "./cohort";
import type { CoastalSetting, ShortlistFacts } from "./evaluator";

export type SmartShortlistIntelligence = Pick<
  ShortlistFacts,
  "key" | "beachAccess" | "mountainAccess" | "oceanAccess" | "lifestyleDimensions"
>;

function normalizedToken(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? "";
}

export function coastalSettingFromLifestyleFeatures(
  rows: readonly DeterministicV31CanonicalLifestyleFeature[],
): CoastalSetting {
  const coastalRows = rows.filter((row) => normalizedToken(row.feature_key) === "COASTAL_SETTING"
    && normalizedToken(row.matching_enabled) === "YES");
  if (coastalRows.length !== 1) return "UNKNOWN";

  const [row] = coastalRows;
  const featureValue = normalizedToken(row.feature_value);
  if (featureValue === "COASTAL" || featureValue === "INLAND" || featureValue === "HYBRID") {
    return featureValue;
  }

  const availability = normalizedToken(row.availability_level);
  const proximity = normalizedToken(row.proximity_band);
  if (availability === "STRONG" && proximity === "IN_DESTINATION") return "COASTAL";
  if (availability === "NONE") return "INLAND";
  return "UNKNOWN";
}

export async function loadSmartShortlistIntelligence(): Promise<readonly SmartShortlistIntelligence[]> {
  const expectedKeys = new Set(smartShortlistCandidates.map((candidate) => candidate.key));
  const loaded = new Map<string, SmartShortlistIntelligence>();

  for (const entry of EXPANSION_WORKBOOK_REGISTRY) {
    const ownedKeys = entry.expectedDestinationKeys.filter((key) => expectedKeys.has(key));
    if (ownedKeys.length === 0) continue;

    const workbook = await loadFrozenWorkbookV31DeterministicImport(path.resolve(process.cwd(), entry.workbookPath));
    if (workbook.validationErrors?.length) {
      throw new Error(`${entry.registryId} failed validation: ${workbook.validationErrors.join("; ")}`);
    }

    for (const key of ownedKeys) {
      if (loaded.has(key)) throw new Error(`Duplicate Smart Shortlist destination key: ${key}`);
      const canonical = workbook.canonicalDestinations.find((destination) => destination.identity.destinationKey === key);
      const adapted = buildIntelligenceV2FactsFromWorkbookImport(workbook, key);
      if (!canonical || !adapted) throw new Error(`${entry.registryId} does not contain expected destination key: ${key}`);

      const identity: ResolvedDestinationIdentity = {
        destinationKey: key as CanonicalDestinationKey,
        destinationId: key as DestinationId,
      };
      const stored = mapCanonicalDestinationToStoredState(canonical);
      const persisted = await loadNormalizedPersistedDestinationBundle(identity, createInMemoryPersistedDestinationReadPort(identity, stored));
      if (persisted.outcome !== "SUCCESS") throw new Error(`Persisted adaptation failed for ${key}: ${persisted.failure.reason}`);
      const persistedAdapted = adaptPersistedDestinationBundleToIntelligenceV2Facts(persisted.bundle);

      loaded.set(key, {
        key,
        beachAccess: persistedAdapted.facts.hardGates.beachAccess,
        mountainAccess: persistedAdapted.facts.hardGates.mountainOrSkiAccess === "MOUNTAIN_SCENIC_ONLY"
          ? "MOUNTAIN_ACCESS"
          : persistedAdapted.facts.hardGates.mountainOrSkiAccess,
        oceanAccess: coastalSettingFromLifestyleFeatures(canonical.lifestyleFeatures),
        lifestyleDimensions: adapted.facts.lifestyleDimensions.dimensionValues,
      });
    }
  }

  const missingKeys = [...expectedKeys].filter((key) => !loaded.has(key));
  if (missingKeys.length > 0) throw new Error(`Missing Smart Shortlist workbook facts: ${missingKeys.join(", ")}`);
  return smartShortlistCandidates.map((candidate) => loaded.get(candidate.key)!);
}
