// Server-only, using the same build artifact and pinned-byte validation as Explore.
import { readFileSync } from "node:fs";
import path from "node:path";
import { EXPANSION_WORKBOOK_REGISTRY, type ExpansionWorkbookRegistryEntry } from "../expansion-workbook-registry";
import {
  EXPLORE_PROJECTION_VERSION, exploreSourceSignature, projectionDigest,
  selectExploreCandidate, validateExploreProjection,
} from "../explore-projection";
import { loadPublishedCatalogIdentities } from "../published-catalog-identities";
import { smartShortlistCandidates } from "./cohort";
import { ownedAffordabilityRecords } from "./owned-affordability-records";
import type { SmartShortlistData } from "./server-data";

// Bump when the matching-input format changes. The prebuild generator always derives
// the payload again through the unchanged workbook adapter, including reviewed evidence.
export const SMART_SHORTLIST_PROJECTION_VERSION = 1;
export const smartShortlistProjectionPath = "data/generated-smart-shortlist-projection.json";
export type SmartShortlistProjection = {
  version: number;
  sourceSignature: string;
  digest: string;
  data: SmartShortlistData;
};
export function smartShortlistSourceSignature(registry: readonly ExpansionWorkbookRegistryEntry[]): string {
  return projectionDigest({ registry, cohort: smartShortlistCandidates, affordability: ownedAffordabilityRecords });
}

export function createSmartShortlistProjection(
  source: SmartShortlistData,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
): SmartShortlistProjection {
  const registered = new Set(registry.flatMap(entry => [...entry.expectedDestinationKeys]));
  const data: SmartShortlistData = {
    candidates: source.candidates.filter(item => registered.has(item.key)),
    intelligence: source.intelligence.filter(item => registered.has(item.key)),
    destinationMedia: source.destinationMedia.filter(item => registered.has(item.key)),
    affordabilityRecords: source.affordabilityRecords.filter(item => registered.has(item.destinationKey)),
  };
  return { version: SMART_SHORTLIST_PROJECTION_VERSION, sourceSignature: smartShortlistSourceSignature(registry), digest: projectionDigest(data), data };
}

export function validateSmartShortlistProjection(
  projection: SmartShortlistProjection,
  registry: readonly ExpansionWorkbookRegistryEntry[] = EXPANSION_WORKBOOK_REGISTRY,
  readWorkbook: (file: string) => Buffer = readFileSync,
): SmartShortlistData {
  if (projection.version !== SMART_SHORTLIST_PROJECTION_VERSION
    || projection.sourceSignature !== smartShortlistSourceSignature(registry)
    || projection.digest !== projectionDigest(projection.data)) {
    throw new Error("Smart Shortlist projection is stale or corrupt; rebuild from validated workbooks");
  }
  const { data } = projection;
  // Reuse Explore's exact identity, media and all pinned workbook-byte checks.
  const exploreData = { candidates: data.candidates.map(selectExploreCandidate), destinationMedia: data.destinationMedia };
  validateExploreProjection({
    version: EXPLORE_PROJECTION_VERSION, sourceSignature: exploreSourceSignature(registry),
    digest: projectionDigest(exploreData), data: exploreData,
  }, registry, readWorkbook);
  const keys = new Set(data.candidates.map(item => item.key));
  if (!Array.isArray(data.intelligence) || data.intelligence.length !== data.candidates.length
    || data.intelligence.some((item, index) => item.key !== data.candidates[index].key)
    || !Array.isArray(data.affordabilityRecords)
    || new Set(data.affordabilityRecords.map(item => item.destinationKey)).size !== data.affordabilityRecords.length
    || data.affordabilityRecords.some(item => !keys.has(item.destinationKey))) {
    throw new Error("Smart Shortlist projection does not match registered evidence ownership");
  }
  // JSON omits undefined optional evidence. Restore the exact adapter object shape
  // without supplying evidence or changing the serialized client payload.
  return {
    ...data,
    intelligence: data.intelligence.map(item => ({
      ...item, beachEvidence: item.beachEvidence, skiAccess: item.skiAccess,
    })),
  };
}

export async function loadPublishedSmartShortlistProjection(): Promise<SmartShortlistData> {
  const projection: SmartShortlistProjection = JSON.parse(readFileSync(
    path.join(process.cwd(), "data/generated-smart-shortlist-projection.json"), "utf8",
  ));
  const data = validateSmartShortlistProjection(projection);
  // Never bake publication into the artifact or cache a previous publication decision.
  const rows = await loadPublishedCatalogIdentities([...new Set(EXPANSION_WORKBOOK_REGISTRY.flatMap(entry => [...entry.expectedDestinationKeys]))]);
  const candidates = data.candidates.filter(candidate => {
    const owners = rows.filter(row => row.destination_key === candidate.key || row.slug === candidate.slug);
    return owners.length === 1 && owners[0].status === "published" && Boolean(owners[0].id)
      && owners[0].destination_key === candidate.key && owners[0].slug === candidate.slug;
  });
  const eligible = new Set(candidates.map(candidate => candidate.key));
  return {
    candidates,
    intelligence: data.intelligence.filter(item => eligible.has(item.key)),
    destinationMedia: data.destinationMedia.filter(item => eligible.has(item.key)),
    affordabilityRecords: data.affordabilityRecords.filter(item => eligible.has(item.destinationKey)),
  };
}
